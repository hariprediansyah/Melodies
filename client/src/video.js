const videoElement = document.getElementById('video-player')
const youtubePlayerElement = document.getElementById('youtube-player')
const idleVideoElement = document.getElementById('idle-video-player')
let audioContext
let source
let splitter
let merger
let gainLeft
let gainRight
let ytPlayer
let isYoutube = false
let isPlaying = false

let idleTimer
let lastInteractionTime = Date.now()
let isIdlePlaying = false
const IDLE_TIMEOUT = 60 * 5 * 1000 // 5 menit
const IDLE_VIDEO_PATH = 'idle.mp4' // pastikan ini ada di public path Electron
let youtubeTimeInterval = null
let nextSongTitle = ''
let bannerImages = []
let bannerInterval = null
let currentBannerIndex = 0
let isStandby = false
let playedSongId = null

console.log('video.js loaded')

window.onYouTubeIframeAPIReady = function () {
  ytPlayer = new YT.Player('youtube-player', {
    height: '100%',
    width: '100%',
    playerVars: {
      autoplay: 1,
      controls: 0,
      modestbranding: 1,
      rel: 0
    },
    events: {
      onReady: onPlayerReady,
      onStateChange: onPlayerStateChange
    }
  })
}

function onPlayerReady(event) {
  // Player is ready
  window.electronAPI.sendToMain('youtube-api-ready')
  youtubePlayerElement.style.display = 'block'
  console.log(youtubePlayerElement)
  console.log('YouTube API is ready')
  ytPlayer.setVolume(90)
}

function onPlayerStateChange(event) {
  if (event.data === YT.PlayerState.CUED) {
    ytPlayer.playVideo()
    isPlaying = true
    resetIdleTimer()
  }
  if (event.data === YT.PlayerState.ENDED) {
    isPlaying = false
    resetIdleTimer()
    ytPlayer.g.style.display = 'none'
    videoElement.style.display = 'none'
    window.electronAPI.sendVideoEnded()
    stopYoutubeTimeUpdater()
  }
  if (event.data === YT.PlayerState.PLAYING) {
    console.log('YouTube video is playing')
    isPlaying = true
    resetIdleTimer()
    startYoutubeTimeUpdater()
  }

  if (event.data === YT.PlayerState.PAUSED) {
    isPlaying = false
    resetIdleTimer()
  }
}

function setupAudioContext() {
  if (audioContext) return
  audioContext = new (window.AudioContext || window.webkitAudioContext)()
  source = audioContext.createMediaElementSource(videoElement)
  splitter = audioContext.createChannelSplitter(2)
  merger = audioContext.createChannelMerger(2)
  gainLeft = audioContext.createGain()
  gainRight = audioContext.createGain()

  source.connect(splitter)
  splitter.connect(gainLeft, 0)
  splitter.connect(gainRight, 1)

  gainLeft.connect(merger, 0, 0)
  gainRight.connect(merger, 0, 1)

  merger.connect(audioContext.destination)
}

function setNextSong(title) {
  console.log(`Setting next song title: ${title}`)

  const infoDiv = document.getElementById('next-song-info')
  if (title) {
    infoDiv.textContent = `Lagu selanjutnya: ${title}`
  } else {
    infoDiv.textContent = ``
  }
}

window.electronAPI.onUserActive(() => {
  if (!isStandby) {
    resetIdleTimer()
    if (isIdlePlaying) {
      stopIdleVideo()
    }
  }
})

window.electronAPI.onStandby(() => {
  isStandby = true
})

window.electronAPI.onActive(() => {
  isStandby = false
})

window.electronAPI.onInactive(() => {
  if (!isStandby) {
    resetIdleTimer()
    if (isIdlePlaying) {
      stopIdleVideo()
    }
  }

  if (isPlaying) {
    isPlaying = false
    resetIdleTimer()
    if (isYoutube) {
      if (ytPlayer && typeof ytPlayer.getPlayerState === 'function' && ytPlayer.getPlayerState() !== -1) {
        ytPlayer.pauseVideo()
      }
      ytPlayer.g.style.display = 'none'
    } else {
      videoElement.pause()
      videoElement.src = ''
    }
    videoElement.style.display = 'none'
    youtubePlayerElement.style.display = 'none'
  }

  videoElement.style.display = 'none'
  if (ytPlayer) {
    ytPlayer.g.style.display = 'none'
  }
  isPlaying = false
  resetIdleTimer()
})

async function ensureSongDownloaded(songId) {
  try {
    const baseDir = await window.electronAPI.getStorageBaseDir()
    const serverUrl = await window.electronAPI.getServerUrl()
    console.log(`Base dir: ${baseDir}, Server URL: ${serverUrl}`)
    window.electronAPI.logToFile(`Base dir: ${baseDir}, Server URL: ${serverUrl}`)

    const filePath = `${baseDir}/songs/${songId}/song.mp4`

    const exists = await window.electronAPI.fileExists(filePath)
    if (exists) return filePath

    // File belum ada, download dari server
    const url = `${serverUrl}/songs/download/${songId}`
    const res = await fetch(url)

    if (!res.ok) throw new Error(res.statusText)
    window.electronAPI.logToFile(`Downloaded song ${songId}`)

    const arrayBuffer = await res.arrayBuffer()
    const blob = new Blob([arrayBuffer], { type: 'video/mp4' })
    const buffer = await blob.arrayBuffer()

    const success = await window.electronAPI.saveFile(filePath, buffer)
    if (!success) throw new Error('Failed to save song.')

    return filePath
  } catch (err) {
    console.error('Failed to download song:', err)
    window.electronAPI.logToFile(`Failed to download song ${songId}: ${err.message}`)
    throw err
  }
}

window.electronAPI.onVideoControl((command) => {
  console.log('Received command:', command)

  switch (command.type) {
    case 'SET_NEXT_SONG_TITLE':
      console.log('Setting next song title frin command:', command.title)
      nextSongTitle = command.title || ''
      break
    case 'NEXT_SONG_INFO': {
      setNextSong(command.title)
      break
    }
    case 'LOAD':
      if (isPlaying) {
        isPlaying = false
        resetIdleTimer()
        if (isYoutube) {
          if (ytPlayer && typeof ytPlayer.getPlayerState === 'function' && ytPlayer.getPlayerState() !== -1) {
            ytPlayer.pauseVideo()
          }
          ytPlayer.g.style.display = 'none'
        } else {
          videoElement.pause()
          videoElement.src = ''
        }
        videoElement.style.display = 'none'
        youtubePlayerElement.style.display = 'none'
      }
      stopYoutubeTimeUpdater()
      stopIdleVideo()
      isPlaying = true
      // Reset display dulu agar tidak ada yang tertinggal
      videoElement.style.display = 'none'
      youtubePlayerElement.style.display = 'none'
      idleVideoElement.style.display = 'none'
      isYoutube = command.isYoutube
      if (command.isYoutube) {
        ytPlayer.g.style.display = 'block'

        videoElement.pause()
        videoElement.src = ''
        youtubePlayerElement.style.display = 'block'
        if (ytPlayer && typeof ytPlayer.loadVideoById === 'function') {
          // Ambil videoId dari command.videoId jika ada, jika tidak coba parsing dari src
          let videoId = ''
          if (command.videoId) {
            videoId = command.videoId
          } else if (command.src) {
            // Coba regex untuk ambil videoId dari src
            const match = command.src.match(/embed\/([\w-]+)/)
            if (match && match[1]) videoId = match[1]
          }
          if (videoId) {
            ytPlayer.loadVideoById(videoId)
          } else {
            console.error('videoId tidak ditemukan pada command:', command)
          }
        }
      } else {
        // if (ytPlayer && typeof ytPlayer.pauseVideo === 'function') {
        //   ytPlayer.pauseVideo()
        // }
        // if (ytPlayer) ytPlayer.g.style.display = 'none'
        // idleVideoElement.style.display = 'none'
        // videoElement.style.display = 'block'
        // if (!audioContext) {
        //   setupAudioContext()
        // }
        // videoElement.src = command.src
        // videoElement.load()
        if (ytPlayer) ytPlayer.g.style.display = 'none'
        idleVideoElement.style.display = 'none'
        videoElement.style.display = 'block'
        if (!audioContext) setupAudioContext()

        const songId = command.id
        // simpen song id ke playedSongId biar gak keputer kalo kecepetan ganti lagu sebelum selesai download
        playedSongId = songId

        ensureSongDownloaded(songId)
          .then((localPath) => {
            if (playedSongId !== songId) {
              return
            }
            videoElement.src = `file://${localPath}`
            videoElement.load()
          })
          .catch((err) => {
            console.error('Failed to load song:', err)
          })
      }
      break
    case 'PLAY':
      isPlaying = true
      stopIdleVideo()
      resetIdleTimer()
      if (isYoutube) {
        if (ytPlayer && typeof ytPlayer.getPlayerState === 'function' && ytPlayer.getPlayerState() !== -1) {
          console.log('ytplayer play', ytPlayer)

          ytPlayer.g.style.display = 'block'
          ytPlayer.playVideo()
        }
      } else {
        videoElement.play().catch((e) => console.error('Error playing video:', e))
        if (audioContext && audioContext.state === 'suspended') {
          audioContext.resume()
        }
        videoElement.style.display = 'block'
      }
      break
    case 'PAUSE':
      isPlaying = false
      stopIdleVideo()
      resetIdleTimer()
      if (isYoutube) {
        if (ytPlayer && typeof ytPlayer.getPlayerState === 'function' && ytPlayer.getPlayerState() !== -1) {
          ytPlayer.pauseVideo()
        }
      } else {
        videoElement.pause()
      }
      break
    case 'VOLUME':
      if (ytPlayer) {
        ytPlayer.setVolume(command.level * 100)
      }
      videoElement.volume = command.level
      // if (isYoutube) {
      // } else {
      // }
      break
    case 'SEEK':
      if (isYoutube) {
        ytPlayer.seekTo(command.time)
      } else {
        videoElement.currentTime = command.time
      }
      break
    case 'VOCAL':
      if (!audioContext || isYoutube) return

      // Reset koneksi semua dulu
      gainLeft.disconnect()
      gainRight.disconnect()

      const vocalPos = command.vocal || 'Left' // 'left' atau 'right'
      const mode = command.mode // 'off' atau 'on'

      if (mode === 'off') {
        if (vocalPos === 'Left') {
          // Mute kanal kiri, copy kanan ke kiri dan kanan
          gainRight.connect(merger, 0, 0)
          gainRight.connect(merger, 0, 1)
        } else if (vocalPos === 'Right') {
          // Mute kanal kanan, copy kiri ke kiri dan kanan
          gainLeft.connect(merger, 0, 0)
          gainLeft.connect(merger, 0, 1)
        } else {
          // fallback: mono kiri
          gainLeft.connect(merger, 0, 0)
          gainLeft.connect(merger, 0, 1)
        }
      } else {
        // mode on: normal stereo
        gainLeft.connect(merger, 0, 0)
        gainRight.connect(merger, 0, 1)
      }
      break
    case 'STOP':
      isPlaying = false
      resetIdleTimer()
      if (isYoutube) {
        if (ytPlayer && typeof ytPlayer.getPlayerState === 'function' && ytPlayer.getPlayerState() !== -1) {
          ytPlayer.pauseVideo()
        }
        ytPlayer.g.style.display = 'none'
      } else {
        videoElement.pause()
        videoElement.src = ''
      }
      videoElement.style.display = 'none'
      youtubePlayerElement.style.display = 'none'
      break
  }
})

videoElement.addEventListener('ended', () => {
  videoElement.style.display = 'none'
  if (ytPlayer) {
    ytPlayer.g.style.display = 'none'
  }
  console.log('Video ended')
  isPlaying = false
  resetIdleTimer()
  window.electronAPI.sendVideoEnded()
})

videoElement.addEventListener('timeupdate', () => {
  console.log('timeupdate event fired')

  window.electronAPI.sendToMain('video-time-update', {
    currentTime: videoElement.currentTime,
    duration: videoElement.duration
  })

  if (
    videoElement.duration &&
    (videoElement.duration <= 30 || videoElement.duration - videoElement.currentTime <= 30)
  ) {
    setNextSong(nextSongTitle)
  } else {
    setNextSong('')
  }
})

function startIdleTimer() {
  if (idleTimer) clearInterval(idleTimer)
  idleTimer = setInterval(() => {
    const now = Date.now()
    if (isStandby || (!isPlaying && !isIdlePlaying && now - lastInteractionTime > IDLE_TIMEOUT)) {
      playIdleVideo()
      const infoDiv = document.getElementById('next-song-info')
      infoDiv.textContent = ``
    }
  }, 5000) // check setiap 5 detik
}

function resetIdleTimer() {
  lastInteractionTime = Date.now()
  if (isIdlePlaying) stopIdleVideo()
}

async function playIdleVideo() {
  if (isIdlePlaying) return
  console.log('[Idle] Trying to play idle mode...')
  isIdlePlaying = true
  window.electronAPI.sendToMain('video-is-idle')
  youtubePlayerElement.style.display = 'none'
  if (ytPlayer) ytPlayer.g.style.display = 'none'
  videoElement.style.display = 'none'
  if (ytPlayer && ytPlayer.pauseVideo) ytPlayer.pauseVideo()

  bannerImages = await window.electronAPI.getBannerImages()
  console.log('[Idle] Found banner media:', bannerImages)

  if (bannerImages.length === 0) {
    // Fallback ke idle video
    idleVideoElement.style.display = 'block'
    idleVideoElement.src = IDLE_VIDEO_PATH
    idleVideoElement.loop = true
    idleVideoElement.play()
  } else {
    // Tampilkan carousel
    showBannerCarousel()
  }
}

function showBannerCarousel() {
  const carousel = document.getElementById('idle-carousel')
  const img = document.getElementById('carousel-image')
  const video = document.getElementById('carousel-video')

  idleVideoElement.style.display = 'none'
  carousel.style.display = 'block'

  currentBannerIndex = 0
  showCurrentMedia()

  function showCurrentMedia() {
    const currentMedia = bannerImages[currentBannerIndex]

    // Hide both elements first
    img.style.display = 'none'
    video.style.display = 'none'

    if (currentMedia.type === 'image') {
      img.src = currentMedia.src
      img.style.display = 'block'

      // Set timeout for next image (5 seconds)
      bannerInterval = setTimeout(() => {
        nextMedia()
      }, 5000)
    } else if (currentMedia.type === 'video') {
      video.src = currentMedia.src
      video.style.display = 'block'

      // Event listener for when video ends
      const onVideoEnd = () => {
        video.removeEventListener('ended', onVideoEnd)
        nextMedia()
      }

      video.addEventListener('ended', onVideoEnd)
      video.play().catch(console.error)
    }
  }

  function nextMedia() {
    // Clear any existing timeout
    if (bannerInterval) {
      clearTimeout(bannerInterval)
      bannerInterval = null
    }

    currentBannerIndex = (currentBannerIndex + 1) % bannerImages.length
    showCurrentMedia()
  }
}

function stopBannerCarousel() {
  const carousel = document.getElementById('idle-carousel')
  const video = document.getElementById('carousel-video')

  carousel.style.display = 'none'

  // Stop video if playing
  if (video) {
    video.pause()
    video.currentTime = 0
    video.src = ''
  }

  // Clear interval/timeout
  if (bannerInterval) {
    clearTimeout(bannerInterval)
    bannerInterval = null
  }
}

function stopIdleVideo() {
  if (isIdlePlaying) {
    console.log('[Idle] Stopping idle mode...')
    isIdlePlaying = false
    window.electronAPI.sendToMain('video-is-active')
    idleVideoElement.style.display = 'none'
    idleVideoElement.pause()
    idleVideoElement.src = ''

    stopBannerCarousel()
  }
}

startIdleTimer()

function startYoutubeTimeUpdater() {
  if (youtubeTimeInterval) clearInterval(youtubeTimeInterval)
  youtubeTimeInterval = setInterval(() => {
    if (ytPlayer && typeof ytPlayer.getPlayerState === 'function') {
      const state = ytPlayer.getPlayerState()
      if (state === YT.PlayerState.PLAYING || state === YT.PlayerState.BUFFERING) {
        const currentTime = ytPlayer.getCurrentTime()
        const duration = ytPlayer.getDuration()
        window.electronAPI.sendToMain('video-time-update', {
          currentTime,
          duration
        })

        if (duration && (duration <= 30 || duration - currentTime <= 30)) {
          setNextSong(nextSongTitle)
        } else {
          setNextSong('')
        }
      }
    }
  }, 500)
}

function stopYoutubeTimeUpdater() {
  if (youtubeTimeInterval) {
    clearInterval(youtubeTimeInterval)
    youtubeTimeInterval = null
  }
}

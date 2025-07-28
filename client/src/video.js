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
const IDLE_TIMEOUT = 60 * 1000 // 1 menit
const IDLE_VIDEO_PATH = 'idle.mp4' // pastikan ini ada di public path Electron
let youtubeTimeInterval = null
let nextSongTitle = ''

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
  youtubePlayerElement.style.display = 'block'
  console.log(youtubePlayerElement)
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
        if (ytPlayer && typeof ytPlayer.pauseVideo === 'function') {
          ytPlayer.pauseVideo()
        }
        ytPlayer.g.style.display = 'none'
        idleVideoElement.style.display = 'none'
        videoElement.style.display = 'block'
        if (!audioContext) {
          setupAudioContext()
        }
        videoElement.src = command.src
        videoElement.load()
      }
      break
    case 'PLAY':
      isPlaying = true
      stopIdleVideo()
      resetIdleTimer()
      if (isYoutube) {
        if (ytPlayer && typeof ytPlayer.getPlayerState === 'function' && ytPlayer.getPlayerState() !== -1) {
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
      ytPlayer.setVolume(command.level * 100)
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
      if (command.mode === 'off') {
        gainRight.disconnect()
        gainLeft.connect(merger, 0, 1)
      } else {
        gainLeft.disconnect(merger, 0, 1)
        gainRight.connect(merger, 0, 1)
      }
      break
  }
})

videoElement.addEventListener('ended', () => {
  videoElement.style.display = 'none'
  ytPlayer.g.style.display = 'none'
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

  // Notifikasi next song 30 detik sebelum habis
  console.log(
    `Current time: ${videoElement.currentTime}, Duration: ${videoElement.duration}, Next song title: ${nextSongTitle}`
  )

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
    if (!isPlaying && !isIdlePlaying && now - lastInteractionTime > IDLE_TIMEOUT) {
      playIdleVideo()
      infoDiv.textContent = ``
    }
  }, 5000) // check setiap 5 detik
}

function resetIdleTimer() {
  lastInteractionTime = Date.now()
  if (isIdlePlaying) stopIdleVideo()
}

function playIdleVideo() {
  console.log('[Idle] Playing idle video...')
  isIdlePlaying = true
  youtubePlayerElement.style.display = 'none'
  ytPlayer.g.style.display = 'none'
  videoElement.style.display = 'none'
  if (ytPlayer && ytPlayer.pauseVideo) ytPlayer.pauseVideo()

  idleVideoElement.style.display = 'block'
  if (!audioContext) setupAudioContext()
  idleVideoElement.src = IDLE_VIDEO_PATH
  idleVideoElement.loop = true
  idleVideoElement.play()
}

function stopIdleVideo() {
  if (isIdlePlaying) {
    console.log('[Idle] Stopping idle video...')
    isIdlePlaying = false
    // videoElement.pause()
    // videoElement.loop = false
    // videoElement.src = ''
    idleVideoElement.style.display = 'none'
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

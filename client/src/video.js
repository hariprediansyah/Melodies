const videoElement = document.getElementById('video-player')
const youtubePlayerElement = document.getElementById('youtube-player')
let audioContext
let source
let splitter
let merger
let gainLeft
let gainRight
let ytPlayer

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
}

function onPlayerStateChange(event) {
  if (event.data === YT.PlayerState.CUED) {
    ytPlayer.playVideo()
  }
  if (event.data === YT.PlayerState.ENDED) {
    window.electronAPI.sendVideoEnded()
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

window.electronAPI.onVideoControl((command) => {
  console.log('Received command:', command)

  switch (command.type) {
    case 'LOAD':
      if (command.isYoutube) {
        videoElement.pause()
        videoElement.src = ''
        videoElement.style.display = 'none'
        youtubePlayerElement.style.display = 'block'
        if (ytPlayer && typeof ytPlayer.loadVideoById === 'function') {
          const videoId = command.src.split('/').pop().split('?')[0]
          ytPlayer.loadVideoById(videoId)
        }
      } else {
        if (ytPlayer && typeof ytPlayer.pauseVideo === 'function') {
          ytPlayer.pauseVideo()
        }
        youtubePlayerElement.style.display = 'none'
        videoElement.style.display = 'block'
        if (!audioContext) {
          setupAudioContext()
        }
        videoElement.src = command.src
        videoElement.load()
      }
      break
    case 'PLAY':
      if (ytPlayer && typeof ytPlayer.getPlayerState === 'function' && ytPlayer.getPlayerState() !== -1) {
        ytPlayer.playVideo()
      } else {
        videoElement.play().catch((e) => console.error('Error playing video:', e))
        if (audioContext && audioContext.state === 'suspended') {
          audioContext.resume()
        }
      }
      break
    case 'PAUSE':
      if (ytPlayer && typeof ytPlayer.getPlayerState === 'function' && ytPlayer.getPlayerState() !== -1) {
        ytPlayer.pauseVideo()
      } else {
        videoElement.pause()
      }
      break
    case 'VOLUME':
      if (command.isYoutube) {
        ytPlayer.setVolume(command.level * 100)
      } else {
        videoElement.volume = command.level
      }
      break
    case 'VOCAL':
      if (!audioContext || command.isYoutube) return
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
  window.electronAPI.sendVideoEnded()
})

videoElement.addEventListener('timeupdate', () => {
  window.electronAPI.sendToMain('video-time-update', {
    currentTime: videoElement.currentTime,
    duration: videoElement.duration
  })
})

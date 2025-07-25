/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./src/video.js":
/*!**********************!*\
  !*** ./src/video.js ***!
  \**********************/
/***/ (() => {

eval("var videoElement = document.getElementById('video-player');\nvar youtubePlayerElement = document.getElementById('youtube-player');\nvar audioContext;\nvar source;\nvar splitter;\nvar merger;\nvar gainLeft;\nvar gainRight;\nvar ytPlayer;\nvar isYoutube = false;\nwindow.onYouTubeIframeAPIReady = function () {\n  ytPlayer = new YT.Player('youtube-player', {\n    height: '100%',\n    width: '100%',\n    playerVars: {\n      autoplay: 1,\n      controls: 0,\n      modestbranding: 1,\n      rel: 0\n    },\n    events: {\n      onReady: onPlayerReady,\n      onStateChange: onPlayerStateChange\n    }\n  });\n};\nfunction onPlayerReady(event) {\n  // Player is ready\n  youtubePlayerElement.style.display = 'block';\n  console.log(youtubePlayerElement);\n}\nfunction onPlayerStateChange(event) {\n  if (event.data === YT.PlayerState.CUED) {\n    ytPlayer.playVideo();\n  }\n  if (event.data === YT.PlayerState.ENDED) {\n    ytPlayer.g.style.display = 'none';\n    videoElement.style.display = 'none';\n    window.electronAPI.sendVideoEnded();\n  }\n}\nfunction setupAudioContext() {\n  if (audioContext) return;\n  audioContext = new (window.AudioContext || window.webkitAudioContext)();\n  source = audioContext.createMediaElementSource(videoElement);\n  splitter = audioContext.createChannelSplitter(2);\n  merger = audioContext.createChannelMerger(2);\n  gainLeft = audioContext.createGain();\n  gainRight = audioContext.createGain();\n  source.connect(splitter);\n  splitter.connect(gainLeft, 0);\n  splitter.connect(gainRight, 1);\n  gainLeft.connect(merger, 0, 0);\n  gainRight.connect(merger, 0, 1);\n  merger.connect(audioContext.destination);\n}\nwindow.electronAPI.onVideoControl(function (command) {\n  console.log('Received command:', command);\n  switch (command.type) {\n    case 'LOAD':\n      // Reset display dulu agar tidak ada yang tertinggal\n      videoElement.style.display = 'none';\n      youtubePlayerElement.style.display = 'none';\n      isYoutube = command.isYoutube;\n      if (command.isYoutube) {\n        ytPlayer.g.style.display = 'block';\n        videoElement.pause();\n        videoElement.src = '';\n        youtubePlayerElement.style.display = 'block';\n        if (ytPlayer && typeof ytPlayer.loadVideoById === 'function') {\n          // Ambil videoId dari command.videoId jika ada, jika tidak coba parsing dari src\n          var videoId = '';\n          if (command.videoId) {\n            videoId = command.videoId;\n          } else if (command.src) {\n            // Coba regex untuk ambil videoId dari src\n            var match = command.src.match(/embed\\/([\\w-]+)/);\n            if (match && match[1]) videoId = match[1];\n          }\n          if (videoId) {\n            ytPlayer.loadVideoById(videoId);\n          } else {\n            console.error('videoId tidak ditemukan pada command:', command);\n          }\n        }\n      } else {\n        if (ytPlayer && typeof ytPlayer.pauseVideo === 'function') {\n          ytPlayer.pauseVideo();\n        }\n        ytPlayer.g.style.display = 'none';\n        videoElement.style.display = 'block';\n        if (!audioContext) {\n          setupAudioContext();\n        }\n        videoElement.src = command.src;\n        videoElement.load();\n      }\n      break;\n    case 'PLAY':\n      if (isYoutube) {\n        if (ytPlayer && typeof ytPlayer.getPlayerState === 'function' && ytPlayer.getPlayerState() !== -1) {\n          ytPlayer.playVideo();\n        }\n      } else {\n        videoElement.play()[\"catch\"](function (e) {\n          return console.error('Error playing video:', e);\n        });\n        if (audioContext && audioContext.state === 'suspended') {\n          audioContext.resume();\n        }\n      }\n      break;\n    case 'PAUSE':\n      if (isYoutube) {\n        if (ytPlayer && typeof ytPlayer.getPlayerState === 'function' && ytPlayer.getPlayerState() !== -1) {\n          ytPlayer.pauseVideo();\n        }\n      } else {\n        videoElement.pause();\n      }\n      break;\n    case 'VOLUME':\n      if (isYoutube) {\n        ytPlayer.setVolume(command.level * 100);\n      } else {\n        videoElement.volume = command.level;\n      }\n      break;\n    case 'VOCAL':\n      if (!audioContext || isYoutube) return;\n      if (command.mode === 'off') {\n        gainRight.disconnect();\n        gainLeft.connect(merger, 0, 1);\n      } else {\n        gainLeft.disconnect(merger, 0, 1);\n        gainRight.connect(merger, 0, 1);\n      }\n      break;\n  }\n});\nvideoElement.addEventListener('ended', function () {\n  videoElement.style.display = 'none';\n  ytPlayer.g.style.display = 'none';\n  console.log('Video ended');\n  window.electronAPI.sendVideoEnded();\n});\nvideoElement.addEventListener('timeupdate', function () {\n  window.electronAPI.sendToMain('video-time-update', {\n    currentTime: videoElement.currentTime,\n    duration: videoElement.duration\n  });\n});\n\n//# sourceURL=webpack://MELODIES/./src/video.js?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = {};
/******/ 	__webpack_modules__["./src/video.js"]();
/******/ 	
/******/ })()
;
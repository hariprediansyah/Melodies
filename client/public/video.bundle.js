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

/***/ "./node_modules/@babel/runtime/helpers/OverloadYield.js":
/*!**************************************************************!*\
  !*** ./node_modules/@babel/runtime/helpers/OverloadYield.js ***!
  \**************************************************************/
/***/ ((module) => {

eval("{function _OverloadYield(e, d) {\n  this.v = e, this.k = d;\n}\nmodule.exports = _OverloadYield, module.exports.__esModule = true, module.exports[\"default\"] = module.exports;\n\n//# sourceURL=webpack://MELODIES/./node_modules/@babel/runtime/helpers/OverloadYield.js?\n}");

/***/ }),

/***/ "./node_modules/@babel/runtime/helpers/esm/asyncToGenerator.js":
/*!*********************************************************************!*\
  !*** ./node_modules/@babel/runtime/helpers/esm/asyncToGenerator.js ***!
  \*********************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("{__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (/* binding */ _asyncToGenerator)\n/* harmony export */ });\nfunction asyncGeneratorStep(n, t, e, r, o, a, c) {\n  try {\n    var i = n[a](c),\n      u = i.value;\n  } catch (n) {\n    return void e(n);\n  }\n  i.done ? t(u) : Promise.resolve(u).then(r, o);\n}\nfunction _asyncToGenerator(n) {\n  return function () {\n    var t = this,\n      e = arguments;\n    return new Promise(function (r, o) {\n      var a = n.apply(t, e);\n      function _next(n) {\n        asyncGeneratorStep(a, r, o, _next, _throw, \"next\", n);\n      }\n      function _throw(n) {\n        asyncGeneratorStep(a, r, o, _next, _throw, \"throw\", n);\n      }\n      _next(void 0);\n    });\n  };\n}\n\n\n//# sourceURL=webpack://MELODIES/./node_modules/@babel/runtime/helpers/esm/asyncToGenerator.js?\n}");

/***/ }),

/***/ "./node_modules/@babel/runtime/helpers/regenerator.js":
/*!************************************************************!*\
  !*** ./node_modules/@babel/runtime/helpers/regenerator.js ***!
  \************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

eval("{var regeneratorDefine = __webpack_require__(/*! ./regeneratorDefine.js */ \"./node_modules/@babel/runtime/helpers/regeneratorDefine.js\");\nfunction _regenerator() {\n  /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/babel/babel/blob/main/packages/babel-helpers/LICENSE */\n  var e,\n    t,\n    r = \"function\" == typeof Symbol ? Symbol : {},\n    n = r.iterator || \"@@iterator\",\n    o = r.toStringTag || \"@@toStringTag\";\n  function i(r, n, o, i) {\n    var c = n && n.prototype instanceof Generator ? n : Generator,\n      u = Object.create(c.prototype);\n    return regeneratorDefine(u, \"_invoke\", function (r, n, o) {\n      var i,\n        c,\n        u,\n        f = 0,\n        p = o || [],\n        y = !1,\n        G = {\n          p: 0,\n          n: 0,\n          v: e,\n          a: d,\n          f: d.bind(e, 4),\n          d: function d(t, r) {\n            return i = t, c = 0, u = e, G.n = r, a;\n          }\n        };\n      function d(r, n) {\n        for (c = r, u = n, t = 0; !y && f && !o && t < p.length; t++) {\n          var o,\n            i = p[t],\n            d = G.p,\n            l = i[2];\n          r > 3 ? (o = l === n) && (u = i[(c = i[4]) ? 5 : (c = 3, 3)], i[4] = i[5] = e) : i[0] <= d && ((o = r < 2 && d < i[1]) ? (c = 0, G.v = n, G.n = i[1]) : d < l && (o = r < 3 || i[0] > n || n > l) && (i[4] = r, i[5] = n, G.n = l, c = 0));\n        }\n        if (o || r > 1) return a;\n        throw y = !0, n;\n      }\n      return function (o, p, l) {\n        if (f > 1) throw TypeError(\"Generator is already running\");\n        for (y && 1 === p && d(p, l), c = p, u = l; (t = c < 2 ? e : u) || !y;) {\n          i || (c ? c < 3 ? (c > 1 && (G.n = -1), d(c, u)) : G.n = u : G.v = u);\n          try {\n            if (f = 2, i) {\n              if (c || (o = \"next\"), t = i[o]) {\n                if (!(t = t.call(i, u))) throw TypeError(\"iterator result is not an object\");\n                if (!t.done) return t;\n                u = t.value, c < 2 && (c = 0);\n              } else 1 === c && (t = i[\"return\"]) && t.call(i), c < 2 && (u = TypeError(\"The iterator does not provide a '\" + o + \"' method\"), c = 1);\n              i = e;\n            } else if ((t = (y = G.n < 0) ? u : r.call(n, G)) !== a) break;\n          } catch (t) {\n            i = e, c = 1, u = t;\n          } finally {\n            f = 1;\n          }\n        }\n        return {\n          value: t,\n          done: y\n        };\n      };\n    }(r, o, i), !0), u;\n  }\n  var a = {};\n  function Generator() {}\n  function GeneratorFunction() {}\n  function GeneratorFunctionPrototype() {}\n  t = Object.getPrototypeOf;\n  var c = [][n] ? t(t([][n]())) : (regeneratorDefine(t = {}, n, function () {\n      return this;\n    }), t),\n    u = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(c);\n  function f(e) {\n    return Object.setPrototypeOf ? Object.setPrototypeOf(e, GeneratorFunctionPrototype) : (e.__proto__ = GeneratorFunctionPrototype, regeneratorDefine(e, o, \"GeneratorFunction\")), e.prototype = Object.create(u), e;\n  }\n  return GeneratorFunction.prototype = GeneratorFunctionPrototype, regeneratorDefine(u, \"constructor\", GeneratorFunctionPrototype), regeneratorDefine(GeneratorFunctionPrototype, \"constructor\", GeneratorFunction), GeneratorFunction.displayName = \"GeneratorFunction\", regeneratorDefine(GeneratorFunctionPrototype, o, \"GeneratorFunction\"), regeneratorDefine(u), regeneratorDefine(u, o, \"Generator\"), regeneratorDefine(u, n, function () {\n    return this;\n  }), regeneratorDefine(u, \"toString\", function () {\n    return \"[object Generator]\";\n  }), (module.exports = _regenerator = function _regenerator() {\n    return {\n      w: i,\n      m: f\n    };\n  }, module.exports.__esModule = true, module.exports[\"default\"] = module.exports)();\n}\nmodule.exports = _regenerator, module.exports.__esModule = true, module.exports[\"default\"] = module.exports;\n\n//# sourceURL=webpack://MELODIES/./node_modules/@babel/runtime/helpers/regenerator.js?\n}");

/***/ }),

/***/ "./node_modules/@babel/runtime/helpers/regeneratorAsync.js":
/*!*****************************************************************!*\
  !*** ./node_modules/@babel/runtime/helpers/regeneratorAsync.js ***!
  \*****************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

eval("{var regeneratorAsyncGen = __webpack_require__(/*! ./regeneratorAsyncGen.js */ \"./node_modules/@babel/runtime/helpers/regeneratorAsyncGen.js\");\nfunction _regeneratorAsync(n, e, r, t, o) {\n  var a = regeneratorAsyncGen(n, e, r, t, o);\n  return a.next().then(function (n) {\n    return n.done ? n.value : a.next();\n  });\n}\nmodule.exports = _regeneratorAsync, module.exports.__esModule = true, module.exports[\"default\"] = module.exports;\n\n//# sourceURL=webpack://MELODIES/./node_modules/@babel/runtime/helpers/regeneratorAsync.js?\n}");

/***/ }),

/***/ "./node_modules/@babel/runtime/helpers/regeneratorAsyncGen.js":
/*!********************************************************************!*\
  !*** ./node_modules/@babel/runtime/helpers/regeneratorAsyncGen.js ***!
  \********************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

eval("{var regenerator = __webpack_require__(/*! ./regenerator.js */ \"./node_modules/@babel/runtime/helpers/regenerator.js\");\nvar regeneratorAsyncIterator = __webpack_require__(/*! ./regeneratorAsyncIterator.js */ \"./node_modules/@babel/runtime/helpers/regeneratorAsyncIterator.js\");\nfunction _regeneratorAsyncGen(r, e, t, o, n) {\n  return new regeneratorAsyncIterator(regenerator().w(r, e, t, o), n || Promise);\n}\nmodule.exports = _regeneratorAsyncGen, module.exports.__esModule = true, module.exports[\"default\"] = module.exports;\n\n//# sourceURL=webpack://MELODIES/./node_modules/@babel/runtime/helpers/regeneratorAsyncGen.js?\n}");

/***/ }),

/***/ "./node_modules/@babel/runtime/helpers/regeneratorAsyncIterator.js":
/*!*************************************************************************!*\
  !*** ./node_modules/@babel/runtime/helpers/regeneratorAsyncIterator.js ***!
  \*************************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

eval("{var OverloadYield = __webpack_require__(/*! ./OverloadYield.js */ \"./node_modules/@babel/runtime/helpers/OverloadYield.js\");\nvar regeneratorDefine = __webpack_require__(/*! ./regeneratorDefine.js */ \"./node_modules/@babel/runtime/helpers/regeneratorDefine.js\");\nfunction AsyncIterator(t, e) {\n  function n(r, o, i, f) {\n    try {\n      var c = t[r](o),\n        u = c.value;\n      return u instanceof OverloadYield ? e.resolve(u.v).then(function (t) {\n        n(\"next\", t, i, f);\n      }, function (t) {\n        n(\"throw\", t, i, f);\n      }) : e.resolve(u).then(function (t) {\n        c.value = t, i(c);\n      }, function (t) {\n        return n(\"throw\", t, i, f);\n      });\n    } catch (t) {\n      f(t);\n    }\n  }\n  var r;\n  this.next || (regeneratorDefine(AsyncIterator.prototype), regeneratorDefine(AsyncIterator.prototype, \"function\" == typeof Symbol && Symbol.asyncIterator || \"@asyncIterator\", function () {\n    return this;\n  })), regeneratorDefine(this, \"_invoke\", function (t, o, i) {\n    function f() {\n      return new e(function (e, r) {\n        n(t, i, e, r);\n      });\n    }\n    return r = r ? r.then(f, f) : f();\n  }, !0);\n}\nmodule.exports = AsyncIterator, module.exports.__esModule = true, module.exports[\"default\"] = module.exports;\n\n//# sourceURL=webpack://MELODIES/./node_modules/@babel/runtime/helpers/regeneratorAsyncIterator.js?\n}");

/***/ }),

/***/ "./node_modules/@babel/runtime/helpers/regeneratorDefine.js":
/*!******************************************************************!*\
  !*** ./node_modules/@babel/runtime/helpers/regeneratorDefine.js ***!
  \******************************************************************/
/***/ ((module) => {

eval("{function _regeneratorDefine(e, r, n, t) {\n  var i = Object.defineProperty;\n  try {\n    i({}, \"\", {});\n  } catch (e) {\n    i = 0;\n  }\n  module.exports = _regeneratorDefine = function regeneratorDefine(e, r, n, t) {\n    function o(r, n) {\n      _regeneratorDefine(e, r, function (e) {\n        return this._invoke(r, n, e);\n      });\n    }\n    r ? i ? i(e, r, {\n      value: n,\n      enumerable: !t,\n      configurable: !t,\n      writable: !t\n    }) : e[r] = n : (o(\"next\", 0), o(\"throw\", 1), o(\"return\", 2));\n  }, module.exports.__esModule = true, module.exports[\"default\"] = module.exports, _regeneratorDefine(e, r, n, t);\n}\nmodule.exports = _regeneratorDefine, module.exports.__esModule = true, module.exports[\"default\"] = module.exports;\n\n//# sourceURL=webpack://MELODIES/./node_modules/@babel/runtime/helpers/regeneratorDefine.js?\n}");

/***/ }),

/***/ "./node_modules/@babel/runtime/helpers/regeneratorKeys.js":
/*!****************************************************************!*\
  !*** ./node_modules/@babel/runtime/helpers/regeneratorKeys.js ***!
  \****************************************************************/
/***/ ((module) => {

eval("{function _regeneratorKeys(e) {\n  var n = Object(e),\n    r = [];\n  for (var t in n) r.unshift(t);\n  return function e() {\n    for (; r.length;) if ((t = r.pop()) in n) return e.value = t, e.done = !1, e;\n    return e.done = !0, e;\n  };\n}\nmodule.exports = _regeneratorKeys, module.exports.__esModule = true, module.exports[\"default\"] = module.exports;\n\n//# sourceURL=webpack://MELODIES/./node_modules/@babel/runtime/helpers/regeneratorKeys.js?\n}");

/***/ }),

/***/ "./node_modules/@babel/runtime/helpers/regeneratorRuntime.js":
/*!*******************************************************************!*\
  !*** ./node_modules/@babel/runtime/helpers/regeneratorRuntime.js ***!
  \*******************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

eval("{var OverloadYield = __webpack_require__(/*! ./OverloadYield.js */ \"./node_modules/@babel/runtime/helpers/OverloadYield.js\");\nvar regenerator = __webpack_require__(/*! ./regenerator.js */ \"./node_modules/@babel/runtime/helpers/regenerator.js\");\nvar regeneratorAsync = __webpack_require__(/*! ./regeneratorAsync.js */ \"./node_modules/@babel/runtime/helpers/regeneratorAsync.js\");\nvar regeneratorAsyncGen = __webpack_require__(/*! ./regeneratorAsyncGen.js */ \"./node_modules/@babel/runtime/helpers/regeneratorAsyncGen.js\");\nvar regeneratorAsyncIterator = __webpack_require__(/*! ./regeneratorAsyncIterator.js */ \"./node_modules/@babel/runtime/helpers/regeneratorAsyncIterator.js\");\nvar regeneratorKeys = __webpack_require__(/*! ./regeneratorKeys.js */ \"./node_modules/@babel/runtime/helpers/regeneratorKeys.js\");\nvar regeneratorValues = __webpack_require__(/*! ./regeneratorValues.js */ \"./node_modules/@babel/runtime/helpers/regeneratorValues.js\");\nfunction _regeneratorRuntime() {\n  \"use strict\";\n\n  var r = regenerator(),\n    e = r.m(_regeneratorRuntime),\n    t = (Object.getPrototypeOf ? Object.getPrototypeOf(e) : e.__proto__).constructor;\n  function n(r) {\n    var e = \"function\" == typeof r && r.constructor;\n    return !!e && (e === t || \"GeneratorFunction\" === (e.displayName || e.name));\n  }\n  var o = {\n    \"throw\": 1,\n    \"return\": 2,\n    \"break\": 3,\n    \"continue\": 3\n  };\n  function a(r) {\n    var e, t;\n    return function (n) {\n      e || (e = {\n        stop: function stop() {\n          return t(n.a, 2);\n        },\n        \"catch\": function _catch() {\n          return n.v;\n        },\n        abrupt: function abrupt(r, e) {\n          return t(n.a, o[r], e);\n        },\n        delegateYield: function delegateYield(r, o, a) {\n          return e.resultName = o, t(n.d, regeneratorValues(r), a);\n        },\n        finish: function finish(r) {\n          return t(n.f, r);\n        }\n      }, t = function t(r, _t, o) {\n        n.p = e.prev, n.n = e.next;\n        try {\n          return r(_t, o);\n        } finally {\n          e.next = n.n;\n        }\n      }), e.resultName && (e[e.resultName] = n.v, e.resultName = void 0), e.sent = n.v, e.next = n.n;\n      try {\n        return r.call(this, e);\n      } finally {\n        n.p = e.prev, n.n = e.next;\n      }\n    };\n  }\n  return (module.exports = _regeneratorRuntime = function _regeneratorRuntime() {\n    return {\n      wrap: function wrap(e, t, n, o) {\n        return r.w(a(e), t, n, o && o.reverse());\n      },\n      isGeneratorFunction: n,\n      mark: r.m,\n      awrap: function awrap(r, e) {\n        return new OverloadYield(r, e);\n      },\n      AsyncIterator: regeneratorAsyncIterator,\n      async: function async(r, e, t, o, u) {\n        return (n(e) ? regeneratorAsyncGen : regeneratorAsync)(a(r), e, t, o, u);\n      },\n      keys: regeneratorKeys,\n      values: regeneratorValues\n    };\n  }, module.exports.__esModule = true, module.exports[\"default\"] = module.exports)();\n}\nmodule.exports = _regeneratorRuntime, module.exports.__esModule = true, module.exports[\"default\"] = module.exports;\n\n//# sourceURL=webpack://MELODIES/./node_modules/@babel/runtime/helpers/regeneratorRuntime.js?\n}");

/***/ }),

/***/ "./node_modules/@babel/runtime/helpers/regeneratorValues.js":
/*!******************************************************************!*\
  !*** ./node_modules/@babel/runtime/helpers/regeneratorValues.js ***!
  \******************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

eval("{var _typeof = (__webpack_require__(/*! ./typeof.js */ \"./node_modules/@babel/runtime/helpers/typeof.js\")[\"default\"]);\nfunction _regeneratorValues(e) {\n  if (null != e) {\n    var t = e[\"function\" == typeof Symbol && Symbol.iterator || \"@@iterator\"],\n      r = 0;\n    if (t) return t.call(e);\n    if (\"function\" == typeof e.next) return e;\n    if (!isNaN(e.length)) return {\n      next: function next() {\n        return e && r >= e.length && (e = void 0), {\n          value: e && e[r++],\n          done: !e\n        };\n      }\n    };\n  }\n  throw new TypeError(_typeof(e) + \" is not iterable\");\n}\nmodule.exports = _regeneratorValues, module.exports.__esModule = true, module.exports[\"default\"] = module.exports;\n\n//# sourceURL=webpack://MELODIES/./node_modules/@babel/runtime/helpers/regeneratorValues.js?\n}");

/***/ }),

/***/ "./node_modules/@babel/runtime/helpers/typeof.js":
/*!*******************************************************!*\
  !*** ./node_modules/@babel/runtime/helpers/typeof.js ***!
  \*******************************************************/
/***/ ((module) => {

eval("{function _typeof(o) {\n  \"@babel/helpers - typeof\";\n\n  return module.exports = _typeof = \"function\" == typeof Symbol && \"symbol\" == typeof Symbol.iterator ? function (o) {\n    return typeof o;\n  } : function (o) {\n    return o && \"function\" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? \"symbol\" : typeof o;\n  }, module.exports.__esModule = true, module.exports[\"default\"] = module.exports, _typeof(o);\n}\nmodule.exports = _typeof, module.exports.__esModule = true, module.exports[\"default\"] = module.exports;\n\n//# sourceURL=webpack://MELODIES/./node_modules/@babel/runtime/helpers/typeof.js?\n}");

/***/ }),

/***/ "./node_modules/@babel/runtime/regenerator/index.js":
/*!**********************************************************!*\
  !*** ./node_modules/@babel/runtime/regenerator/index.js ***!
  \**********************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

eval("{// TODO(Babel 8): Remove this file.\n\nvar runtime = __webpack_require__(/*! ../helpers/regeneratorRuntime */ \"./node_modules/@babel/runtime/helpers/regeneratorRuntime.js\")();\nmodule.exports = runtime;\n\n// Copied from https://github.com/facebook/regenerator/blob/main/packages/runtime/runtime.js#L736=\ntry {\n  regeneratorRuntime = runtime;\n} catch (accidentalStrictMode) {\n  if (typeof globalThis === \"object\") {\n    globalThis.regeneratorRuntime = runtime;\n  } else {\n    Function(\"r\", \"regeneratorRuntime = r\")(runtime);\n  }\n}\n\n\n//# sourceURL=webpack://MELODIES/./node_modules/@babel/runtime/regenerator/index.js?\n}");

/***/ }),

/***/ "./src/video.js":
/*!**********************!*\
  !*** ./src/video.js ***!
  \**********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("{__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _babel_runtime_helpers_asyncToGenerator__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/asyncToGenerator */ \"./node_modules/@babel/runtime/helpers/esm/asyncToGenerator.js\");\n/* harmony import */ var _babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @babel/runtime/regenerator */ \"./node_modules/@babel/runtime/regenerator/index.js\");\n/* harmony import */ var _babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_1__);\n\n\nvar videoElement = document.getElementById('video-player');\nvar youtubePlayerElement = document.getElementById('youtube-player');\nvar idleVideoElement = document.getElementById('idle-video-player');\nvar audioContext;\nvar source;\nvar splitter;\nvar merger;\nvar gainLeft;\nvar gainRight;\nvar ytPlayer;\nvar isYoutube = false;\nvar isPlaying = false;\nvar idleTimer;\nvar lastInteractionTime = Date.now();\nvar isIdlePlaying = false;\nvar IDLE_TIMEOUT = 60 * 5 * 1000; // 5 menit\nvar IDLE_VIDEO_PATH = 'idle.mp4'; // pastikan ini ada di public path Electron\nvar youtubeTimeInterval = null;\nvar nextSongTitle = '';\nvar bannerImages = [];\nvar bannerInterval = null;\nvar currentBannerIndex = 0;\nvar isStandby = false;\nvar playedSongId = null;\nconsole.log('video.js loaded');\nwindow.onYouTubeIframeAPIReady = function () {\n  ytPlayer = new YT.Player('youtube-player', {\n    height: '100%',\n    width: '100%',\n    playerVars: {\n      autoplay: 1,\n      controls: 0,\n      modestbranding: 1,\n      rel: 0\n    },\n    events: {\n      onReady: onPlayerReady,\n      onStateChange: onPlayerStateChange\n    }\n  });\n};\nfunction onPlayerReady(event) {\n  // Player is ready\n  window.electronAPI.sendToMain('youtube-api-ready');\n  youtubePlayerElement.style.display = 'block';\n  console.log(youtubePlayerElement);\n  console.log('YouTube API is ready');\n  ytPlayer.setVolume(90);\n}\nfunction onPlayerStateChange(event) {\n  if (event.data === YT.PlayerState.CUED) {\n    ytPlayer.playVideo();\n    isPlaying = true;\n    resetIdleTimer();\n  }\n  if (event.data === YT.PlayerState.ENDED) {\n    isPlaying = false;\n    resetIdleTimer();\n    ytPlayer.g.style.display = 'none';\n    videoElement.style.display = 'none';\n    window.electronAPI.sendVideoEnded();\n    stopYoutubeTimeUpdater();\n  }\n  if (event.data === YT.PlayerState.PLAYING) {\n    console.log('YouTube video is playing');\n    isPlaying = true;\n    resetIdleTimer();\n    startYoutubeTimeUpdater();\n  }\n  if (event.data === YT.PlayerState.PAUSED) {\n    isPlaying = false;\n    resetIdleTimer();\n  }\n}\nfunction setupAudioContext() {\n  if (audioContext) return;\n  audioContext = new (window.AudioContext || window.webkitAudioContext)();\n  source = audioContext.createMediaElementSource(videoElement);\n  splitter = audioContext.createChannelSplitter(2);\n  merger = audioContext.createChannelMerger(2);\n  gainLeft = audioContext.createGain();\n  gainRight = audioContext.createGain();\n  source.connect(splitter);\n  splitter.connect(gainLeft, 0);\n  splitter.connect(gainRight, 1);\n  gainLeft.connect(merger, 0, 0);\n  gainRight.connect(merger, 0, 1);\n  merger.connect(audioContext.destination);\n}\nfunction setNextSong(title) {\n  console.log(\"Setting next song title: \".concat(title));\n  var infoDiv = document.getElementById('next-song-info');\n  if (title) {\n    infoDiv.textContent = \"Lagu selanjutnya: \".concat(title);\n  } else {\n    infoDiv.textContent = \"\";\n  }\n}\nwindow.electronAPI.onUserActive(function () {\n  if (!isStandby) {\n    resetIdleTimer();\n    if (isIdlePlaying) {\n      stopIdleVideo();\n    }\n  }\n});\nwindow.electronAPI.onStandby(function () {\n  isStandby = true;\n});\nwindow.electronAPI.onActive(function () {\n  isStandby = false;\n});\nwindow.electronAPI.onInactive(function () {\n  if (!isStandby) {\n    resetIdleTimer();\n    if (isIdlePlaying) {\n      stopIdleVideo();\n    }\n  }\n  if (isPlaying) {\n    isPlaying = false;\n    resetIdleTimer();\n    if (isYoutube) {\n      if (ytPlayer && typeof ytPlayer.getPlayerState === 'function' && ytPlayer.getPlayerState() !== -1) {\n        ytPlayer.pauseVideo();\n      }\n      ytPlayer.g.style.display = 'none';\n    } else {\n      videoElement.pause();\n      videoElement.src = '';\n    }\n    videoElement.style.display = 'none';\n    youtubePlayerElement.style.display = 'none';\n  }\n  videoElement.style.display = 'none';\n  if (ytPlayer) {\n    ytPlayer.g.style.display = 'none';\n  }\n  isPlaying = false;\n  resetIdleTimer();\n});\nfunction ensureSongDownloaded(_x) {\n  return _ensureSongDownloaded.apply(this, arguments);\n}\nfunction _ensureSongDownloaded() {\n  _ensureSongDownloaded = (0,_babel_runtime_helpers_asyncToGenerator__WEBPACK_IMPORTED_MODULE_0__[\"default\"])(/*#__PURE__*/_babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_1___default().mark(function _callee(songId) {\n    var baseDir, serverUrl, filePath, exists, url, res, arrayBuffer, blob, buffer, success, _t;\n    return _babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_1___default().wrap(function (_context) {\n      while (1) switch (_context.prev = _context.next) {\n        case 0:\n          _context.prev = 0;\n          _context.next = 1;\n          return window.electronAPI.getStorageBaseDir();\n        case 1:\n          baseDir = _context.sent;\n          _context.next = 2;\n          return window.electronAPI.getServerUrl();\n        case 2:\n          serverUrl = _context.sent;\n          console.log(\"Base dir: \".concat(baseDir, \", Server URL: \").concat(serverUrl));\n          window.electronAPI.logToFile(\"Base dir: \".concat(baseDir, \", Server URL: \").concat(serverUrl));\n          filePath = \"\".concat(baseDir, \"/songs/\").concat(songId, \"/song.mp4\");\n          _context.next = 3;\n          return window.electronAPI.fileExists(filePath);\n        case 3:\n          exists = _context.sent;\n          if (!exists) {\n            _context.next = 4;\n            break;\n          }\n          return _context.abrupt(\"return\", filePath);\n        case 4:\n          // File belum ada, download dari server\n          url = \"\".concat(serverUrl, \"/songs/download/\").concat(songId);\n          _context.next = 5;\n          return fetch(url);\n        case 5:\n          res = _context.sent;\n          if (res.ok) {\n            _context.next = 6;\n            break;\n          }\n          throw new Error(res.statusText);\n        case 6:\n          window.electronAPI.logToFile(\"Downloaded song \".concat(songId));\n          _context.next = 7;\n          return res.arrayBuffer();\n        case 7:\n          arrayBuffer = _context.sent;\n          blob = new Blob([arrayBuffer], {\n            type: 'video/mp4'\n          });\n          _context.next = 8;\n          return blob.arrayBuffer();\n        case 8:\n          buffer = _context.sent;\n          _context.next = 9;\n          return window.electronAPI.saveFile(filePath, buffer);\n        case 9:\n          success = _context.sent;\n          if (success) {\n            _context.next = 10;\n            break;\n          }\n          throw new Error('Failed to save song.');\n        case 10:\n          return _context.abrupt(\"return\", filePath);\n        case 11:\n          _context.prev = 11;\n          _t = _context[\"catch\"](0);\n          console.error('Failed to download song:', _t);\n          window.electronAPI.logToFile(\"Failed to download song \".concat(songId, \": \").concat(_t.message));\n          throw _t;\n        case 12:\n        case \"end\":\n          return _context.stop();\n      }\n    }, _callee, null, [[0, 11]]);\n  }));\n  return _ensureSongDownloaded.apply(this, arguments);\n}\nwindow.electronAPI.onVideoControl(function (command) {\n  console.log('Received command:', command);\n  switch (command.type) {\n    case 'SET_NEXT_SONG_TITLE':\n      console.log('Setting next song title frin command:', command.title);\n      nextSongTitle = command.title || '';\n      break;\n    case 'NEXT_SONG_INFO':\n      {\n        setNextSong(command.title);\n        break;\n      }\n    case 'LOAD':\n      if (isPlaying) {\n        isPlaying = false;\n        resetIdleTimer();\n        if (isYoutube) {\n          if (ytPlayer && typeof ytPlayer.getPlayerState === 'function' && ytPlayer.getPlayerState() !== -1) {\n            ytPlayer.pauseVideo();\n          }\n          ytPlayer.g.style.display = 'none';\n        } else {\n          videoElement.pause();\n          videoElement.src = '';\n        }\n        videoElement.style.display = 'none';\n        youtubePlayerElement.style.display = 'none';\n      }\n      stopYoutubeTimeUpdater();\n      stopIdleVideo();\n      isPlaying = true;\n      // Reset display dulu agar tidak ada yang tertinggal\n      videoElement.style.display = 'none';\n      youtubePlayerElement.style.display = 'none';\n      idleVideoElement.style.display = 'none';\n      isYoutube = command.isYoutube;\n      if (command.isYoutube) {\n        ytPlayer.g.style.display = 'block';\n        videoElement.pause();\n        videoElement.src = '';\n        youtubePlayerElement.style.display = 'block';\n        if (ytPlayer && typeof ytPlayer.loadVideoById === 'function') {\n          // Ambil videoId dari command.videoId jika ada, jika tidak coba parsing dari src\n          var videoId = '';\n          if (command.videoId) {\n            videoId = command.videoId;\n          } else if (command.src) {\n            // Coba regex untuk ambil videoId dari src\n            var match = command.src.match(/embed\\/([\\w-]+)/);\n            if (match && match[1]) videoId = match[1];\n          }\n          if (videoId) {\n            ytPlayer.loadVideoById(videoId);\n          } else {\n            console.error('videoId tidak ditemukan pada command:', command);\n          }\n        }\n      } else {\n        // if (ytPlayer && typeof ytPlayer.pauseVideo === 'function') {\n        //   ytPlayer.pauseVideo()\n        // }\n        // if (ytPlayer) ytPlayer.g.style.display = 'none'\n        // idleVideoElement.style.display = 'none'\n        // videoElement.style.display = 'block'\n        // if (!audioContext) {\n        //   setupAudioContext()\n        // }\n        // videoElement.src = command.src\n        // videoElement.load()\n        if (ytPlayer) ytPlayer.g.style.display = 'none';\n        idleVideoElement.style.display = 'none';\n        videoElement.style.display = 'block';\n        if (!audioContext) setupAudioContext();\n        var songId = command.id;\n        // simpen song id ke playedSongId biar gak keputer kalo kecepetan ganti lagu sebelum selesai download\n        playedSongId = songId;\n        ensureSongDownloaded(songId).then(function (localPath) {\n          if (playedSongId !== songId) {\n            return;\n          }\n          videoElement.src = \"file://\".concat(localPath);\n          videoElement.load();\n        })[\"catch\"](function (err) {\n          console.error('Failed to load song:', err);\n        });\n      }\n      break;\n    case 'PLAY':\n      isPlaying = true;\n      stopIdleVideo();\n      resetIdleTimer();\n      if (isYoutube) {\n        if (ytPlayer && typeof ytPlayer.getPlayerState === 'function' && ytPlayer.getPlayerState() !== -1) {\n          console.log('ytplayer play', ytPlayer);\n          ytPlayer.g.style.display = 'block';\n          ytPlayer.playVideo();\n        }\n      } else {\n        videoElement.play()[\"catch\"](function (e) {\n          return console.error('Error playing video:', e);\n        });\n        if (audioContext && audioContext.state === 'suspended') {\n          audioContext.resume();\n        }\n        videoElement.style.display = 'block';\n      }\n      break;\n    case 'PAUSE':\n      isPlaying = false;\n      stopIdleVideo();\n      resetIdleTimer();\n      if (isYoutube) {\n        if (ytPlayer && typeof ytPlayer.getPlayerState === 'function' && ytPlayer.getPlayerState() !== -1) {\n          ytPlayer.pauseVideo();\n        }\n      } else {\n        videoElement.pause();\n      }\n      break;\n    case 'VOLUME':\n      if (ytPlayer) {\n        ytPlayer.setVolume(command.level * 100);\n      }\n      videoElement.volume = command.level;\n      // if (isYoutube) {\n      // } else {\n      // }\n      break;\n    case 'SEEK':\n      if (isYoutube) {\n        ytPlayer.seekTo(command.time);\n      } else {\n        videoElement.currentTime = command.time;\n      }\n      break;\n    case 'VOCAL':\n      if (!audioContext || isYoutube) return;\n\n      // Reset koneksi semua dulu\n      gainLeft.disconnect();\n      gainRight.disconnect();\n      var vocalPos = command.vocal || 'Left'; // 'left' atau 'right'\n      var mode = command.mode; // 'off' atau 'on'\n\n      if (mode === 'off') {\n        if (vocalPos === 'Left') {\n          // Mute kanal kiri, copy kanan ke kiri dan kanan\n          gainRight.connect(merger, 0, 0);\n          gainRight.connect(merger, 0, 1);\n        } else if (vocalPos === 'Right') {\n          // Mute kanal kanan, copy kiri ke kiri dan kanan\n          gainLeft.connect(merger, 0, 0);\n          gainLeft.connect(merger, 0, 1);\n        } else {\n          // fallback: mono kiri\n          gainLeft.connect(merger, 0, 0);\n          gainLeft.connect(merger, 0, 1);\n        }\n      } else {\n        // mode on: normal stereo\n        gainLeft.connect(merger, 0, 0);\n        gainRight.connect(merger, 0, 1);\n      }\n      break;\n    case 'STOP':\n      isPlaying = false;\n      resetIdleTimer();\n      if (isYoutube) {\n        if (ytPlayer && typeof ytPlayer.getPlayerState === 'function' && ytPlayer.getPlayerState() !== -1) {\n          ytPlayer.pauseVideo();\n        }\n        ytPlayer.g.style.display = 'none';\n      } else {\n        videoElement.pause();\n        videoElement.src = '';\n      }\n      videoElement.style.display = 'none';\n      youtubePlayerElement.style.display = 'none';\n      break;\n  }\n});\nvideoElement.addEventListener('ended', function () {\n  videoElement.style.display = 'none';\n  if (ytPlayer) {\n    ytPlayer.g.style.display = 'none';\n  }\n  console.log('Video ended');\n  isPlaying = false;\n  resetIdleTimer();\n  window.electronAPI.sendVideoEnded();\n});\nvideoElement.addEventListener('timeupdate', function () {\n  console.log('timeupdate event fired');\n  window.electronAPI.sendToMain('video-time-update', {\n    currentTime: videoElement.currentTime,\n    duration: videoElement.duration\n  });\n  if (videoElement.duration && (videoElement.duration <= 30 || videoElement.duration - videoElement.currentTime <= 30)) {\n    setNextSong(nextSongTitle);\n  } else {\n    setNextSong('');\n  }\n});\nfunction startIdleTimer() {\n  if (idleTimer) clearInterval(idleTimer);\n  idleTimer = setInterval(function () {\n    var now = Date.now();\n    if (isStandby || !isPlaying && !isIdlePlaying && now - lastInteractionTime > IDLE_TIMEOUT) {\n      playIdleVideo();\n      var infoDiv = document.getElementById('next-song-info');\n      infoDiv.textContent = \"\";\n    }\n  }, 5000); // check setiap 5 detik\n}\nfunction resetIdleTimer() {\n  lastInteractionTime = Date.now();\n  if (isIdlePlaying) stopIdleVideo();\n}\nfunction playIdleVideo() {\n  return _playIdleVideo.apply(this, arguments);\n}\nfunction _playIdleVideo() {\n  _playIdleVideo = (0,_babel_runtime_helpers_asyncToGenerator__WEBPACK_IMPORTED_MODULE_0__[\"default\"])(/*#__PURE__*/_babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_1___default().mark(function _callee2() {\n    return _babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_1___default().wrap(function (_context2) {\n      while (1) switch (_context2.prev = _context2.next) {\n        case 0:\n          if (!isIdlePlaying) {\n            _context2.next = 1;\n            break;\n          }\n          return _context2.abrupt(\"return\");\n        case 1:\n          console.log('[Idle] Trying to play idle mode...');\n          isIdlePlaying = true;\n          window.electronAPI.sendToMain('video-is-idle');\n          youtubePlayerElement.style.display = 'none';\n          if (ytPlayer) ytPlayer.g.style.display = 'none';\n          videoElement.style.display = 'none';\n          if (ytPlayer && ytPlayer.pauseVideo) ytPlayer.pauseVideo();\n          _context2.next = 2;\n          return window.electronAPI.getBannerImages();\n        case 2:\n          bannerImages = _context2.sent;\n          console.log('[Idle] Found banner images:', bannerImages);\n          if (bannerImages.length === 0) {\n            // Fallback ke idle video\n            idleVideoElement.style.display = 'block';\n            idleVideoElement.src = IDLE_VIDEO_PATH;\n            idleVideoElement.loop = true;\n            idleVideoElement.play();\n          } else {\n            // Tampilkan carousel\n            showBannerCarousel();\n          }\n        case 3:\n        case \"end\":\n          return _context2.stop();\n      }\n    }, _callee2);\n  }));\n  return _playIdleVideo.apply(this, arguments);\n}\nfunction showBannerCarousel() {\n  var carousel = document.getElementById('idle-carousel');\n  var img = document.getElementById('carousel-image');\n  idleVideoElement.style.display = 'none';\n  carousel.style.display = 'block';\n  currentBannerIndex = 0;\n  img.src = bannerImages[currentBannerIndex];\n  bannerInterval = setInterval(function () {\n    currentBannerIndex = (currentBannerIndex + 1) % bannerImages.length;\n    img.src = bannerImages[currentBannerIndex];\n  }, 5000); // ganti gambar setiap 5 detik\n}\nfunction stopBannerCarousel() {\n  var carousel = document.getElementById('idle-carousel');\n  carousel.style.display = 'none';\n  if (bannerInterval) {\n    clearInterval(bannerInterval);\n    bannerInterval = null;\n  }\n}\nfunction stopIdleVideo() {\n  if (isIdlePlaying) {\n    console.log('[Idle] Stopping idle mode...');\n    isIdlePlaying = false;\n    window.electronAPI.sendToMain('video-is-active');\n    idleVideoElement.style.display = 'none';\n    idleVideoElement.pause();\n    idleVideoElement.src = '';\n    stopBannerCarousel();\n  }\n}\nstartIdleTimer();\nfunction startYoutubeTimeUpdater() {\n  if (youtubeTimeInterval) clearInterval(youtubeTimeInterval);\n  youtubeTimeInterval = setInterval(function () {\n    if (ytPlayer && typeof ytPlayer.getPlayerState === 'function') {\n      var state = ytPlayer.getPlayerState();\n      if (state === YT.PlayerState.PLAYING || state === YT.PlayerState.BUFFERING) {\n        var currentTime = ytPlayer.getCurrentTime();\n        var duration = ytPlayer.getDuration();\n        window.electronAPI.sendToMain('video-time-update', {\n          currentTime: currentTime,\n          duration: duration\n        });\n        if (duration && (duration <= 30 || duration - currentTime <= 30)) {\n          setNextSong(nextSongTitle);\n        } else {\n          setNextSong('');\n        }\n      }\n    }\n  }, 500);\n}\nfunction stopYoutubeTimeUpdater() {\n  if (youtubeTimeInterval) {\n    clearInterval(youtubeTimeInterval);\n    youtubeTimeInterval = null;\n  }\n}\n\n//# sourceURL=webpack://MELODIES/./src/video.js?\n}");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = __webpack_require__("./src/video.js");
/******/ 	
/******/ })()
;
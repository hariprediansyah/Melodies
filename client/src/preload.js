const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  // Database & File System
  reloadWindow: () => ipcRenderer.invoke('reload-window'),
  startKeyBlocker: () => ipcRenderer.invoke('start-keyblocker'),
  closeKeyBlocker: () => ipcRenderer.invoke('close-keyblocker'),
  getSongs: () => ipcRenderer.invoke('getSongs'),
  getStorageBaseDir: () => ipcRenderer.invoke('getStorageBaseDir'),
  getServerUrl: () => ipcRenderer.invoke('get-server-url'),
  saveFile: (filePath, buffer) => ipcRenderer.invoke('save-file', filePath, Buffer.from(buffer)),

  getBannerImages: () => ipcRenderer.invoke('get-banner-images'),
  fileExists: (filePath) => ipcRenderer.invoke('fileExists', filePath),
  checkAdmin: (password) => ipcRenderer.invoke('checkAdmin', password),
  closeApp: () => ipcRenderer.invoke('close-app'),

  // Room Status
  getRoomStatusByMac: () => ipcRenderer.invoke('room-status-by-mac'),
  updateRoomStatusByMac: (status) => ipcRenderer.invoke('update-room-status-by-mac', status),

  // Video Window Control
  openVideoWindow: () => ipcRenderer.invoke('open-video-window'),
  closeVideoWindow: () => ipcRenderer.invoke('close-video-window'),
  sendVideoControl: (command) => ipcRenderer.invoke('send-video-control', command),
  onVideoControl: (callback) => ipcRenderer.on('video-control', (event, ...args) => callback(...args)),
  onVideoEnded: (callback) => ipcRenderer.on('video-ended', (event, ...args) => callback(...args)),
  sendVideoEnded: () => ipcRenderer.send('video-ended'),

  // Config
  getConfig: () => ipcRenderer.invoke('get-config'),
  getSysParam: (key) => ipcRenderer.invoke('get-sys-param', key),

  // YouTube Search
  // searchYoutube: (apiKey, query) => ipcRenderer.invoke('search-youtube', { apiKey, query }),
  searchYoutubeNew: (query) => ipcRenderer.invoke('search-youtube-new', query),
  youtubeRecommend: () => ipcRenderer.invoke('youtube-recommendations'),

  // Playlist Sync
  syncPlaylistAdd: (song) => ipcRenderer.invoke('sync-playlist-add', song),
  syncPlaylistRemove: (songId) => ipcRenderer.invoke('sync-playlist-remove', songId),
  syncPlaylistRemoveAll: () => ipcRenderer.invoke('sync-playlist-remove-all'),
  syncPlaylistGet: () => ipcRenderer.invoke('sync-playlist-get'),
  syncPlaylistSwap: (songId1, songId2) => ipcRenderer.invoke('sync-playlist-swap', songId1, songId2),
  syncPlaylistMoveToTop: (songId) => ipcRenderer.invoke('sync-playlist-move-to-top', songId),

  // Call Log Management
  makeCall: () => ipcRenderer.invoke('make-call'),
  checkCallStatus: (callId) => ipcRenderer.invoke('check-call-status', callId),

  // Event listeners from main process
  onVideoTimeUpdate: (callback) => ipcRenderer.on('video-time-update', (event, ...args) => callback(...args)),
  onAddToPlaylist: (callback) => ipcRenderer.on('add-to-playlist', (event, ...args) => callback(...args)),
  sendToMain: (channel, data) => ipcRenderer.send(channel, data),

  // License
  isLicensed: () => ipcRenderer.invoke('license:isLicensed'),
  activateLicense: (licenseKey) => ipcRenderer.invoke('license:activate', licenseKey),
  getHardwareId: () => ipcRenderer.invoke('license:getHardwareId'),

  onUpdateVideoIdle: (callback) => ipcRenderer.on('update-video-idle', callback),
  removeUpdateVideoIdle: (callback) => ipcRenderer.removeListener('update-video-idle', callback),
  onUserActive: (callback) => ipcRenderer.on('user-active', callback),
  onStandby: (callback) => ipcRenderer.on('standby', callback),
  sendStandby: () => ipcRenderer.invoke('send-standby'),
  onActive: (callback) => ipcRenderer.on('active', callback),
  sendActive: () => ipcRenderer.invoke('send-active'),
  onInactive: (callback) => ipcRenderer.on('inactive', callback),
  sendInactive: () => ipcRenderer.invoke('send-inactive'),
  sendUserActive: () => ipcRenderer.invoke('send-user-active'),
  userIsActive: () => ipcRenderer.send('user-is-active'),
  logToFile: (msg) => ipcRenderer.invoke('log-to-file', msg),

  onAppReady: (callback) => ipcRenderer.on('app-ready', callback)
})

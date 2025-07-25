const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  // Database & File System
  getData: (collection) => ipcRenderer.invoke('getData', collection),
  getStorageBaseDir: () => ipcRenderer.invoke('getStorageBaseDir'),
  getBannerImages: () => ipcRenderer.invoke('get-banner-images'),

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
  searchYoutube: (apiKey, query) => ipcRenderer.invoke('search-youtube', { apiKey, query }),

  // Playlist Sync
  syncPlaylistAdd: (song) => ipcRenderer.invoke('sync-playlist-add', song),
  syncPlaylistRemove: (songId) => ipcRenderer.invoke('sync-playlist-remove', songId),
  syncPlaylistRemoveAll: () => ipcRenderer.invoke('sync-playlist-remove-all'),
  syncPlaylistGet: () => ipcRenderer.invoke('sync-playlist-get'),

  // Call Log Management
  makeCall: () => ipcRenderer.invoke('make-call'),
  checkCallStatus: (callId) => ipcRenderer.invoke('check-call-status', callId),

  // Event listeners from main process
  onVideoTimeUpdate: (callback) => ipcRenderer.on('video-time-update', (event, ...args) => callback(...args)),
  onAddToPlaylist: (callback) => ipcRenderer.on('add-to-playlist', (event, ...args) => callback(...args)),
  sendToMain: (channel, data) => ipcRenderer.send(channel, data)
})

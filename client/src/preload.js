const { contextBridge, ipcRenderer } = require('electron')
const fs = require('fs')
const path = require('path')

contextBridge.exposeInMainWorld('electronAPI', {
  removeFromPlaylist: (id) => ipcRenderer.invoke('remove-from-playlist', id),
  seedDb: () => ipcRenderer.invoke('seedDb'),
  truncateDb: () => ipcRenderer.invoke('truncateDb'),
  getData: (collection) => ipcRenderer.invoke('getData', collection),
  addToPlaylist: (song) => ipcRenderer.invoke('addToPlaylist', song),
  getStorageBaseDir: () => ipcRenderer.invoke('getStorageBaseDir'),
  fileExists: (filePath) => ipcRenderer.invoke('fileExists', filePath),
  loadYouTubeTV: () => ipcRenderer.invoke('loadYouTubeTV'),
  loadHome: () => ipcRenderer.invoke('loadHome'),
  injectYoutubeSearch: (keyword) => ipcRenderer.invoke('injectYoutubeSearch', keyword),
  setSystemVolume: (value) => ipcRenderer.invoke('set-system-volume', value),
  getSystemVolume: () => ipcRenderer.invoke('get-system-volume'),
  setMicVolume: (value) => ipcRenderer.invoke('set-mic-volume', value),
  getMicVolume: () => ipcRenderer.invoke('get-mic-volume')
})

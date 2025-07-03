const { contextBridge } = require('electron')

// Expose API untuk backend server
contextBridge.exposeInMainWorld('apiConfig', {
  baseURL: 'http://localhost:4000'
})

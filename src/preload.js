try {
  const { contextBridge, ipcRenderer } = require('electron')
  const fs = require('fs')
  const path = require('path')

  contextBridge.exposeInMainWorld('electronAPI', {
    getDbData: () => ipcRenderer.invoke('get-db-data'),
    saveDb: (data) => ipcRenderer.invoke('save-db', data),
    getCoverImagePath: (id) => {
      const isDev = !app.isPackaged
      const baseDir = isDev ? path.resolve(__dirname, '..') : path.dirname(process.execPath)

      const coverPath = path.join(baseDir, 'storage', id.toString(), 'cover.jpg')
      if (fs.existsSync(coverPath)) {
        return `file://${coverPath.replace(/\\/g, '/')}`
      }

      const defaultPath = path.join(baseDir, 'storage', 'default_cover.jpg')
      return `file://${defaultPath.replace(/\\/g, '/')}`
    }
  })
} catch (error) {
  console.error('Preload error:', error)
}

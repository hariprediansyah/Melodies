const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const fs = require('fs')

// Configure reload in development
if (process.env.NODE_ENV === 'development') {
  require('electron-reload')(__dirname, {
    electron: path.join(__dirname, '..', 'node_modules', '.bin', 'electron')
  })
}

function createWindow() {
  const win = new BrowserWindow({
    fullscreen: true,
    frame: false,
    width: 1280,
    height: 900,
    webPreferences: {
      preload: path.join(__dirname, 'dist', 'preload.bundle.js'), // Sesuaikan path
      sandbox: false, // Nonaktifkan sandbox untuk preload script
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  // Load the app
  win.loadFile('public/index.html')

  // Open dev tools in development
  if (process.env.NODE_ENV === 'development') {
    win.webContents.openDevTools()
  }
}

// Database handlers
ipcMain.handle('get-db-data', () => {
  const dbPath = path.join(app.getPath('userData'), 'storage', 'database.sqlite')
  try {
    if (fs.existsSync(dbPath)) {
      return fs.readFileSync(dbPath)
    }
    return null
  } catch (error) {
    console.error('Error reading database:', error)
    return null
  }
})

ipcMain.handle('save-db', (_, data) => {
  const dbPath = path.join(app.getPath('userData'), 'storage', 'database.sqlite')
  try {
    fs.mkdirSync(path.dirname(dbPath), { recursive: true })
    fs.writeFileSync(dbPath, Buffer.from(data))
    return true
  } catch (error) {
    console.error('Error saving database:', error)
    return false
  }
})

// App lifecycle
app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

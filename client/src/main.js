const { app, BrowserWindow, ipcMain, screen } = require('electron')
const path = require('path')
const fs = require('fs')
const Database = require('better-sqlite3')
const macaddress = require('macaddress')
// Tambahkan Express server untuk static file
const express = require('express')
const httpServer = express()
httpServer.use(express.static(path.join(__dirname, '..', 'public')))
const PORT = 5772
httpServer.listen(PORT, () => {
  console.log('Static server running on http://localhost:' + PORT)
})

// Helper to get the base path, works for dev and prod
function getAppBasePath() {
  return process.env.NODE_ENV === 'development' ? path.join(__dirname, '..') : process.cwd()
}

const basePath = getAppBasePath()
const dbPath = path.join(basePath, 'storage', 'database.sqlite')
const db = new Database(dbPath)

// Ensure storage directory exists
const storageDir = path.join(basePath, 'storage')
if (!fs.existsSync(storageDir)) {
  fs.mkdirSync(storageDir, { recursive: true })
}

// Window references
let mainWindow = null
let videoWindow = null

app.disableHardwareAcceleration()

function createVideoWindow() {
  const displays = screen.getAllDisplays()
  const externalDisplay = displays.find((d) => d.bounds.x !== 0 || d.bounds.y !== 0)

  if (videoWindow) {
    videoWindow.close()
    videoWindow = null
  }

  if (externalDisplay) {
    videoWindow = new BrowserWindow({
      x: externalDisplay.bounds.x,
      y: externalDisplay.bounds.y,
      width: externalDisplay.bounds.width,
      height: externalDisplay.bounds.height,
      fullscreen: true,
      frame: false,
      webPreferences: {
        preload: path.join(__dirname, 'dist', 'preload.bundle.js'),
        contextIsolation: true,
        webSecurity: false, // Nonaktifkan web security agar YouTube embed bisa berjalan
        sandbox: false // Pastikan sandbox juga nonaktif
      }
    })
    // Set user-agent agar YouTube tidak mendeteksi Electron
    videoWindow.webContents.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36'
    )
    // Ganti loadFile menjadi loadURL ke static server
    videoWindow.loadURL('http://localhost:5772/video.html')
    videoWindow.on('closed', () => {
      videoWindow = null
    })
  } else {
    console.log('No secondary display found.')
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1920,
    height: 1080,
    fullscreen: true,
    frame: false,
    webPreferences: {
      preload: path.join(__dirname, 'dist', 'preload.bundle.js'),
      contextIsolation: true
    }
  })
  mainWindow.loadFile('public/index.html')
  if (process.env.NODE_ENV === 'development') mainWindow.webContents.openDevTools()
  mainWindow.on('closed', () => {
    if (videoWindow) videoWindow.close()
  })
}

// --- ALL IPC HANDLERS ---

// Database & File System
ipcMain.handle('getData', (_, collection) => db.prepare(`SELECT * FROM ${collection}`).all())
ipcMain.handle('getStorageBaseDir', () => path.resolve(basePath, 'storage'))
ipcMain.handle('getBannerImages', async () => {
  try {
    const bannersDir = path.join(basePath, 'storage', 'banners')
    const files = fs.readdirSync(bannersDir)
    return files
      .filter((f) => /\.(jpg|jpeg|png)$/i.test(f))
      .map((f) => 'file://' + path.join(bannersDir, f).replace(/\\/g, '/'))
  } catch (e) {
    return []
  }
})

// Room Status
ipcMain.handle('room-status-by-mac', async () => {
  try {
    const rowIp = db.prepare("SELECT value FROM sys_params WHERE key = 'server_ip'").get()
    const rowMac = db.prepare("SELECT value FROM sys_params WHERE key = 'client_mac'").get()
    if (!rowIp?.value || !rowMac?.value) return { status: 'Inactive' }

    let url = rowIp.value
    if (!/^https?:\/\//.test(url)) url = 'http://' + url
    url = `${url}/rooms/by-mac/${rowMac.value}`

    const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args))
    const res = await fetch(url)
    if (!res.ok) return { status: 'Inactive' }
    return res.json()
  } catch (e) {
    console.error('Failed to get room status:', e)
    return { status: 'Inactive' }
  }
})

ipcMain.handle('update-room-status-by-mac', async (_, status) => {
  try {
    const rowIp = db.prepare("SELECT value FROM sys_params WHERE key = 'server_ip'").get()
    const rowMac = db.prepare("SELECT value FROM sys_params WHERE key = 'client_mac'").get()
    if (!rowIp?.value || !rowMac?.value) return false

    let url = rowIp.value
    if (!/^https?:\/\//.test(url)) url = 'http://' + url
    url = `${url}/rooms/by-mac/${rowMac.value}`

    const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args))
    const res = await fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    })
    return res.ok
  } catch (e) {
    console.error('Failed to update room status:', e)
    return false
  }
})

// Video Window Control
ipcMain.handle('open-video-window', () => {
  if (!videoWindow) createVideoWindow()
})
ipcMain.handle('close-video-window', () => {
  if (videoWindow) videoWindow.close()
})
ipcMain.handle('send-video-control', (_, command) => {
  if (videoWindow) {
    console.log(command)
    videoWindow.webContents.send('video-control', command)
  }
})

// Config
ipcMain.handle('get-config', () => {
  try {
    const configPath = path.join(getAppBasePath(), 'src', 'config.json')
    const rawConfig = fs.readFileSync(configPath)
    return JSON.parse(rawConfig)
  } catch (error) {
    console.error('Failed to read config file:', error)
    return {}
  }
})

// YouTube Search
ipcMain.handle('search-youtube', async (_, { apiKey, query }) => {
  if (!apiKey || apiKey === 'YOUR_YOUTUBE_API_KEY_HERE') {
    return { error: 'YouTube API key is not set.' }
  }
  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=25&q=${encodeURIComponent(
    query
  )}&key=${apiKey}&type=video`
  try {
    const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args))
    const response = await fetch(url)
    const data = await response.json()
    if (data.error) {
      return { error: data.error.message }
    }
    return data.items.map((item) => ({
      id: item.id.videoId,
      title: item.snippet.title,
      artist: item.snippet.channelTitle,
      video_url: `https://www.youtube.com/embed/${item.id.videoId}?autoplay=1`
    }))
  } catch (error) {
    console.error('Failed to search YouTube:', error)
    return { error: 'Failed to fetch from YouTube API.' }
  }
})

ipcMain.handle('get-sys-param', async (_, key) => {
  const row = db.prepare('SELECT value FROM sys_params WHERE key = ?').get(key)
  return row?.value || null
})

// Listen for time updates from video window and forward to main window
ipcMain.on('video-time-update', (event, timeData) => {
  if (mainWindow) {
    mainWindow.webContents.send('video-time-update', timeData)
  }
})

ipcMain.on('video-ended', () => {
  if (mainWindow) {
    mainWindow.webContents.send('video-ended')
  }
})

ipcMain.on('add-to-playlist', (event, song) => {
  if (mainWindow) {
    mainWindow.webContents.send('add-to-playlist', song)
  }
})

const getSysParamFromDb = (key) => {
  try {
    const row = db.prepare('SELECT value FROM sys_params WHERE key = ?').get(key)
    return row ? row.value : null
  } catch (err) {
    console.error('Failed to get sysparam from db:', err)
    return null
  }
}

ipcMain.handle('sync-playlist-add', async (_, song) => {
  try {
    const room_id = getSysParamFromDb('client_room_id')
    const server_ip = getSysParamFromDb('server_ip')
    if (!room_id || !server_ip) throw new Error('room_id/server_ip not found')
    const payload = {
      room_id,
      id: song.id,
      title: song.title,
      artist: song.artist,
      video_url: song.video_url || '',
      is_youtube: !!song.isYoutube
    }
    const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args))
    await fetch(`http://${server_ip}/playlist`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    return true
  } catch (err) {
    console.error('Failed to sync playlist add:', err)
    return false
  }
})

ipcMain.handle('sync-playlist-remove', async (_, songId) => {
  try {
    const room_id = getSysParamFromDb('client_room_id')
    const server_ip = getSysParamFromDb('server_ip')
    if (!room_id || !server_ip) throw new Error('room_id/server_ip not found')
    const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args))
    await fetch(`http://${server_ip}/playlist/${songId}?room_id=${room_id}`, {
      method: 'DELETE'
    })
    return true
  } catch (err) {
    console.error('Failed to sync playlist remove:', err)
    return false
  }
})

ipcMain.handle('sync-playlist-remove-all', async () => {
  try {
    const room_id = getSysParamFromDb('client_room_id')
    const server_ip = getSysParamFromDb('server_ip')
    if (!room_id || !server_ip) throw new Error('room_id/server_ip not found')
    const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args))
    await fetch(`http://${server_ip}/playlist?room_id=${room_id}`, {
      method: 'DELETE'
    })
    return true
  } catch (err) {
    console.error('Failed to sync playlist remove:', err)
    return false
  }
})

ipcMain.handle('get-banner-images', async () => {
  try {
    const bannersDir = path.join(basePath, 'storage', 'banners')
    const files = fs.readdirSync(bannersDir)
    const images = files
      .filter((f) => /\.(jpg|jpeg|png)$/i.test(f))
      .map((f) => 'file://' + path.join(bannersDir, f).replace(/\\/g, '/'))
    return images
  } catch (e) {
    return []
  }
})

ipcMain.handle('sync-playlist-get', async () => {
  try {
    const room_id = getSysParamFromDb('client_room_id')
    const server_ip = getSysParamFromDb('server_ip')
    if (!room_id || !server_ip) throw new Error('room_id/server_ip not found')
    const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args))
    const res = await fetch(`http://${server_ip}/playlist?room_id=${room_id}`)
    if (!res.ok) throw new Error('Failed to fetch playlist')
    const data = await res.json()
    return data
  } catch (err) {
    console.error('Failed to fetch playlist from server:', err)
    return []
  }
})

// Call Log Management
ipcMain.handle('make-call', async () => {
  try {
    const room_id = getSysParamFromDb('client_room_id')
    const server_ip = getSysParamFromDb('server_ip')
    if (!room_id || !server_ip) throw new Error('room_id/server_ip not found')

    const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args))
    const res = await fetch(`http://${server_ip}/call-logs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ room_id })
    })
    if (!res.ok) throw new Error('Failed to create call log')
    const data = await res.json()
    return data
  } catch (err) {
    console.error('Failed to make call:', err)
    throw err
  }
})

ipcMain.handle('check-call-status', async (_, callId) => {
  try {
    const server_ip = getSysParamFromDb('server_ip')
    if (!server_ip) throw new Error('server_ip not found')

    const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args))
    const res = await fetch(`http://${server_ip}/call-logs/${callId}`)

    if (!res.ok) throw new Error('Failed to check call status')
    const data = await res.json()
    return data
  } catch (err) {
    console.error('Failed to check call status:', err)
    throw err
  }
})

// App Lifecycle
app.whenReady().then(createWindow)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

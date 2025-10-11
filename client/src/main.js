const { app, BrowserWindow, ipcMain, screen } = require('electron')
const path = require('path')
const fs = require('fs')
const Database = require('better-sqlite3')
const macaddress = require('macaddress')
const { exec, spawn } = require('child_process')
// Tambahkan Express server untuk static file
const express = require('express')
const httpServer = express()
const license = require('./license')
const ytSearch = require('yt-search')

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
// Ensure storage directory exists
const storageDir = path.join(basePath, 'storage')
if (!fs.existsSync(storageDir)) {
  fs.mkdirSync(storageDir, { recursive: true })
}
// Initialize database
const dbPath = path.join(basePath, 'storage', 'database.sqlite')
const db = new Database(dbPath)

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

function reloadAllWindows() {
  console.log(`Reloading window ${mainWindow}`)

  videoWindow?.webContents.reloadIgnoringCache()
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1920,
    height: 1080,
    fullscreen: true,
    kiosk: true,
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

ipcMain.handle('reload-window', () => {
  reloadAllWindows()
})

ipcMain.handle('start-keyblocker', () => {
  // Mulai KeyBlocker
  const keyBlockerPath = path.join(basePath, 'KeyBlocker.exe') // Sesuaikan path-nya
  keyBlockerProcess = spawn(keyBlockerPath, [], {
    detached: true,
    stdio: 'ignore' // Supaya tidak ngelag/tergantung Electron
  })
  keyBlockerProcess.unref()
})

ipcMain.handle('close-keyblocker', () => {
  console.log('Closing KeyBlocker...')

  exec('taskkill /IM KeyBlocker.exe /F', (err, stdout, stderr) => {
    if (err) {
      console.error('Failed to close KeyBlocker:', err)
    }
  })
})

ipcMain.handle('getSongs', () => db.prepare('SELECT * FROM songs ORDER BY title COLLATE NOCASE ASC').all())
ipcMain.handle('getStorageBaseDir', () => path.resolve(basePath, 'storage'))
ipcMain.handle('get-server-url', async () => {
  // Ambil dari SQLite atau variabel konfigurasi yang sudah kamu pakai
  const server_ip = getSysParamFromDb('server_ip')
  const url = `http://${server_ip}`
  return url
})

ipcMain.handle('save-file', (_, filePath, buffer) => {
  try {
    const dir = path.dirname(filePath)
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
    fs.writeFileSync(filePath, buffer)
    return true
  } catch (err) {
    console.error('Failed to save file:', err)
    logToFile(`Failed to save file ${filePath}: ${err.message}`)
    return false
  }
})

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
  console.log('Sending video control command:', command)
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
// ipcMain.handle('search-youtube', async (_, { apiKey, query }) => {
//   if (!apiKey || apiKey === 'YOUR_YOUTUBE_API_KEY_HERE') {
//     return { error: 'YouTube API key is not set.' }
//   }
//   const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=25&q=${encodeURIComponent(
//     query
//   )}&key=${apiKey}&type=video`
//   try {
//     const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args))
//     const response = await fetch(url)
//     const data = await response.json()
//     if (data.error) {
//       return { error: data.error.message }
//     }
//     return data.items.map((item) => ({
//       id: item.id.videoId,
//       title: item.snippet.title,
//       artist: item.snippet.channelTitle,
//       video_url: `https://www.youtube.com/embed/${item.id.videoId}?autoplay=1`
//     }))
//   } catch (error) {
//     console.error('Failed to search YouTube:', error)
//     return { error: 'Failed to fetch from YouTube API.' }
//   }
// })

ipcMain.handle('search-youtube-new', async (_, query) => {
  try {
    if (!query.includes('lagu')) {
      query = 'lagu ' + query
    }
    const result = await ytSearch(query)
    const hasil = result.videos.map((video) => ({
      id: video.videoId,
      title: video.title,
      artist: video.author.name,
      video_url: video.url
    }))
    return hasil
  } catch (error) {
    console.error('Failed to search YouTube:', error)
    return { error: 'Failed to search YouTube.' }
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

ipcMain.handle('fileExists', (_, filePath) => {
  return fs.existsSync(filePath)
})

ipcMain.handle('checkAdmin', async (_, password) => {
  try {
    console.log('Checking admin password:', password)

    const server_ip = getSysParamFromDb('server_ip')
    if (!server_ip) throw new Error('server_ip not found')

    const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args))
    const res = await fetch(`http://${server_ip}/validate-admin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    })
    if (!res.ok) {
      console.log('Failed to check admin password:', res.statusText)
      return false
    }
    return res.ok
  } catch (err) {
    console.log('Failed to check admin password:', err)
    console.error('Failed to check admin password:', err)
    return err
  }
})

ipcMain.handle('youtube-recommendations', async (_, apiKey) => {
  try {
    const server_ip = getSysParamFromDb('server_ip')
    if (!server_ip) throw new Error('server_ip not found')
    const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args))
    const res = await fetch(`http://${server_ip}/youtube-history`)
    if (!res.ok) throw new Error('Failed to get youtube recommendations')
    const data = await res.json()
    return data.data
  } catch (err) {
    console.error('Failed to get youtube recommendations:', err)
    return []
  }
})

ipcMain.handle('close-app', () => {
  app.quit()
})

ipcMain.on('youtube-api-ready', () => {
  mainWindow.webContents.send('app-ready')
})

ipcMain.handle('get-banner-images', async () => {
  try {
    const bannersDir = path.join(basePath, 'storage', 'banners')
    const files = fs.readdirSync(bannersDir)
    const mediaFiles = files
      .filter((f) => /\.(jpg|jpeg|png|mp4)$/i.test(f))
      .map((f) => ({
        src: 'file://' + path.join(bannersDir, f).replace(/\\/g, '/'),
        type: /\.(mp4)$/i.test(f) ? 'video' : 'image'
      }))
    return mediaFiles
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

//license
ipcMain.handle('license:isLicensed', () => {
  return license.isLicensed(basePath)
})

ipcMain.handle('license:activate', async (event, licenseKey) => {
  return await license.activateLicense(basePath, licenseKey)
})

ipcMain.handle('license:getHardwareId', () => {
  return license.getHardwareId()
})

// App Lifecycle
app.whenReady().then(createWindow)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

ipcMain.on('video-is-idle', () => {
  mainWindow.webContents.send('update-video-idle', true)
})

ipcMain.on('video-is-active', () => {
  mainWindow.webContents.send('update-video-idle', false)
})

ipcMain.on('user-active', () => {
  // Kirim ke semua window lain yang butuh info ini
  BrowserWindow.getAllWindows().forEach((win) => {
    win.webContents.send('user-active')
  })
})

ipcMain.handle('send-user-active', () => {
  if (videoWindow) {
    videoWindow.webContents.send('user-active')
  }
})

ipcMain.on('standby', () => {
  BrowserWindow.getAllWindows().forEach((win) => {
    win.webContents.send('user-active')
  })
})

ipcMain.handle('send-standby', () => {
  if (videoWindow) {
    videoWindow.webContents.send('standby')
  }
})

ipcMain.on('active', () => {
  BrowserWindow.getAllWindows().forEach((win) => {
    win.webContents.send('active')
  })
})

ipcMain.handle('send-active', () => {
  if (videoWindow) {
    videoWindow.webContents.send('active')
  }
})

ipcMain.handle('inactive', () => {
  BrowserWindow.getAllWindows().forEach((win) => {
    win.webContents.send('inactive')
  })
})

ipcMain.handle('send-inactive', () => {
  if (videoWindow) {
    videoWindow.webContents.send('inactive')
  }
})

ipcMain.handle('log-to-file', (_, msg) => {
  logToFile(msg)
})

function logToFile(msg) {
  const logFilePath = path.join(storageDir, 'logs.txt')
  const line = `[${new Date().toISOString()}] ${msg}`
  try {
    fs.appendFileSync(logFilePath, line + '\n')
    return true
  } catch (err) {
    console.error('Failed to write to log file:', err)
    return false
  }
}

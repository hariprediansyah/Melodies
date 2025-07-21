// Service sinkronisasi otomatis antara server dan client
// Jalankan: node sync_service.js

const path = require('path')
const fs = require('fs')
const axios = require('axios')
const Database = require('better-sqlite3')
const express = require('express')
const app = express()
app.use(express.json())

// Konfigurasi
// Jika dijalankan sebagai exe (pkg), storage di folder yang sama dengan exe
// Jika dijalankan dengan node, storage di ../storage
let BASE_PATH
if (process.pkg) {
  BASE_PATH = path.join(path.dirname(process.execPath), 'storage')
} else {
  BASE_PATH = path.resolve(__dirname, '../storage')
}
if (!fs.existsSync(BASE_PATH)) fs.mkdirSync(BASE_PATH, { recursive: true })
const DB_PATH = path.join(BASE_PATH, 'database.sqlite')
const SYNC_INTERVAL = 60 * 1000 // 1 menit
const LOG_PATH = path.join(path.dirname(process.execPath), 'sync.log')

const db = new Database(DB_PATH)

// Inisialisasi tabel jika belum ada
// Songs
const createSongsTable = `CREATE TABLE IF NOT EXISTS songs (
  id INTEGER PRIMARY KEY,
  title TEXT,
  artist TEXT,
  genre TEXT,
  album TEXT,
  release_date TEXT,
  duration TEXT,
  play_count INTEGER,
  created_at TEXT,
  updated_at TEXT,
  cover_updated_at TEXT,
  song_updated_at TEXT
)`
db.prepare(createSongsTable).run()
// Playlist
const createPlaylistTable = `CREATE TABLE IF NOT EXISTS playlist (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  song_id INTEGER
)`
db.prepare(createPlaylistTable).run()
// Carousels
const createCarouselsTable = `CREATE TABLE IF NOT EXISTS carousels (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT,
  description TEXT
)`
db.prepare(createCarouselsTable).run()
// Banner
const createBannersTable = `CREATE TABLE IF NOT EXISTS banners (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT,
  description TEXT,
  created_at TEXT,
  updated_at TEXT,
  banner_updated_at TEXT
)`
db.prepare(createBannersTable).run()

// sys_params
const createSysParamsTable = `CREATE TABLE IF NOT EXISTS sys_params (
  key TEXT PRIMARY KEY,
  value TEXT
)`
db.prepare(createSysParamsTable).run()

function logToFile(msg) {
  const line = `[${new Date().toISOString()}] ${msg}\n`
  fs.appendFileSync(LOG_PATH, line)
}

// Fungsi untuk mengambil SERVER_URL dari sys_params
function getServerUrl() {
  try {
    const row = db.prepare("SELECT value FROM sys_params WHERE key = 'server_ip'").get()
    if (row && row.value) {
      // Pastikan format URL benar
      let url = row.value
      if (!/^https?:\/\//.test(url)) {
        url = 'http://' + url
      }
      return url
    }
    return null
  } catch (err) {
    logToFile('ERROR getServerUrl: ' + err.message)
    return null
  }
}

async function fetchServerData(SERVER_URL) {
  const [songs, banners, carousels] = await Promise.all([
    axios.get(`${SERVER_URL}/songs`).then((res) => res.data),
    axios.get(`${SERVER_URL}/banners`).then((res) => res.data),
    axios.get(`${SERVER_URL}/carousels/files`).then((res) => res.data)
  ])
  return { songs, banners, carousels }
}

function fetchLocalData() {
  const songs = db.prepare('SELECT * FROM songs').all()
  const banners = db.prepare('SELECT * FROM banners').all()
  // Ambil file carousels lokal
  const carouselsPath = path.join(BASE_PATH, 'carousels')
  let carousels = []
  if (fs.existsSync(carouselsPath)) {
    carousels = fs
      .readdirSync(carouselsPath)
      .filter((f) => /\.(jpg|jpeg|png)$/i.test(f))
      .map((f) => {
        const stat = fs.statSync(path.join(carouselsPath, f))
        return {
          filename: f,
          updated_at: stat.mtime.toISOString()
        }
      })
  }
  return { songs, banners, carousels }
}

function diffById(serverArr, localArr) {
  const serverIds = new Set(serverArr.map((x) => x.id))
  const localIds = new Set(localArr.map((x) => x.id))
  return {
    toAdd: serverArr.filter((x) => !localIds.has(x.id)),
    toRemove: localArr.filter((x) => !serverIds.has(x.id)),
    toUpdate: serverArr.filter((x) => localIds.has(x.id))
  }
}

function findLocalById(arr, id) {
  return arr.find((x) => x.id === id)
}

async function downloadFile(url, dest) {
  const writer = fs.createWriteStream(dest)
  const response = await axios.get(url, { responseType: 'stream' })
  response.data.pipe(writer)
  return new Promise((resolve, reject) => {
    writer.on('finish', resolve)
    writer.on('error', reject)
  })
}

async function sync() {
  try {
    const SERVER_URL = getServerUrl()
    if (!SERVER_URL) {
      logToFile('SERVER_URL belum di-set di sys_params. Sinkronisasi dilewati.')
      console.log('[SYNC] SERVER_URL belum di-set di sys_params. Sinkronisasi dilewati.')
      return
    }
    console.log(`[SYNC] Mulai sinkronisasi...`)
    logToFile('Mulai sinkronisasi...')
    const server = await fetchServerData(SERVER_URL)
    const local = fetchLocalData()

    // Sinkronisasi lagu
    const songDiff = diffById(server.songs, local.songs)
    for (const song of [...songDiff.toAdd, ...songDiff.toUpdate]) {
      db.prepare(
        `REPLACE INTO songs (id, title, artist, genre, album, release_date, duration, play_count, created_at, updated_at, cover_updated_at, song_updated_at) VALUES (@id, @title, @artist, @genre, @album, @release_date, @duration, @play_count, @created_at, @updated_at, @cover_updated_at, @song_updated_at)`
      ).run(song)
      const songDir = path.join(BASE_PATH, 'songs', String(song.id))
      if (!fs.existsSync(songDir)) fs.mkdirSync(songDir, { recursive: true })
      const localSong = findLocalById(local.songs, song.id) || {}
      if (song.cover_updated_at !== localSong.cover_updated_at) {
        logToFile(`${SERVER_URL}/files/song/${song.id}/cover.jpg`)
        await downloadFile(`${SERVER_URL}/files/song/${song.id}/cover.jpg`, path.join(songDir, 'cover.jpg'))
          .then(() => logToFile(`Download cover song ${song.id}`))
          .catch((e) => logToFile(`Gagal download cover song ${song.id}: ${e.message}`))
      }
      if (song.song_updated_at !== localSong.song_updated_at) {
        logToFile(`${SERVER_URL}/files/song/${song.id}/song.mp4`)
        await downloadFile(`${SERVER_URL}/files/song/${song.id}/song.mp4`, path.join(songDir, 'song.mp4'))
          .then(() => logToFile(`Download file song ${song.id}`))
          .catch((e) => logToFile(`Gagal download file song ${song.id}: ${e.message}`))
      }
    }
    for (const song of songDiff.toRemove) {
      db.prepare('DELETE FROM songs WHERE id=?').run(song.id)
      const songDir = path.join(BASE_PATH, 'songs', String(song.id))
      if (fs.existsSync(songDir)) {
        fs.rmSync(songDir, { recursive: true, force: true })
        logToFile(`Hapus folder song ${song.id}`)
      }
    }

    // Sinkronisasi banner
    const bannerDiff = diffById(server.banners, local.banners)
    const bannersPath = path.join(BASE_PATH, 'banners')
    // pastikan folder banners ada
    if (!fs.existsSync(bannersPath)) {
      fs.mkdirSync(bannersPath, { recursive: true })
    }
    for (const banner of [...bannerDiff.toAdd, ...bannerDiff.toUpdate]) {
      console.log(banner)
      db.prepare(
        `REPLACE INTO banners (id, title, description, created_at, updated_at, banner_updated_at) VALUES (@id, @title, @description, @created_at, @updated_at, @banner_updated_at)`
      ).run(banner)
      const localBanner = findLocalById(local.banners, banner.id) || {}
      if (banner.banner_updated_at !== localBanner.banner_updated_at) {
        logToFile(`${SERVER_URL}/files/banner/${banner.id}.jpg`)
        await downloadFile(
          `${SERVER_URL}/files/banner/${banner.id}.jpg`,
          path.join(BASE_PATH, 'banners', `${banner.id}.jpg`)
        )
          .then(() => logToFile(`Download banner ${banner.id}`))
          .catch((e) => logToFile(`Gagal download banner ${banner.id}: ${e.message}`))
      }
    }
    for (const banner of bannerDiff.toRemove) {
      db.prepare('DELETE FROM banners WHERE id=?').run(banner.id)
      const bannerPath = path.join(BASE_PATH, 'banners', `${banner.id}.jpg`)
      if (fs.existsSync(bannerPath)) {
        fs.unlinkSync(bannerPath)
        logToFile(`Hapus file banner ${banner.id}`)
      }
    }

    // Sinkronisasi carousels
    const carouselsPath = path.join(BASE_PATH, 'carousels')
    if (!fs.existsSync(carouselsPath)) fs.mkdirSync(carouselsPath, { recursive: true })
    const serverFiles = server.carousels
    const localFiles = local.carousels
    // Download/update file jika server lebih baru atau belum ada
    for (const srv of serverFiles) {
      const loc = localFiles.find((l) => l.filename === srv.filename)
      if (!loc || new Date(srv.updated_at) > new Date(loc.updated_at)) {
        // Download file
        const url = `${SERVER_URL}/carousels/${srv.filename}`
        const dest = path.join(carouselsPath, srv.filename)
        await downloadFile(url, dest)
        logToFile(`Download/update carousel ${srv.filename}`)
      }
    }
    // Hapus file lokal yang sudah tidak ada di server
    for (const loc of localFiles) {
      if (!serverFiles.find((srv) => srv.filename === loc.filename)) {
        const filePath = path.join(carouselsPath, loc.filename)
        fs.unlinkSync(filePath)
        logToFile(`Hapus file carousel ${loc.filename}`)
      }
    }

    logToFile('Sinkronisasi selesai.')
    console.log(`[SYNC] Sinkronisasi selesai.`)
  } catch (err) {
    logToFile('ERROR: ' + err.message)
    console.error('[SYNC] Error:', err)
  }
}

// Endpoint untuk update server IP dari server
app.post('/updateserver', (req, res) => {
  const { server_ip, client_mac } = req.body
  if (!server_ip) return res.status(400).json({ error: 'server_ip required' })

  // Insert atau update ke table sys_params dengan key 'server_ip'
  try {
    db.prepare(
      `
      INSERT INTO sys_params (key, value)
      VALUES ('server_ip', @server_ip)
      ON CONFLICT(key) DO UPDATE SET value = @server_ip
    `
    ).run({ server_ip })
    db.prepare(
      `
      INSERT INTO sys_params (key, value)
      VALUES ('client_mac', @client_mac)
      ON CONFLICT(key) DO UPDATE SET value = @client_mac
    `
    ).run({ client_mac })

    logToFile(`Update sys_param server_ip ke ${server_ip}, dengan mac ${client_mac}`)
    res.json({ success: true })
  } catch (err) {
    logToFile('ERROR update sys_param server_ip: ' + err.message)
    res.status(500).json({ error: 'Gagal update server_ip' })
  }
})

app.listen(5771, () => {
  console.log('Client update server listening on port 5771')
  logToFile('Client update server listening on port 5771')
})

// Loop sinkronisasi
setInterval(sync, SYNC_INTERVAL)
sync()

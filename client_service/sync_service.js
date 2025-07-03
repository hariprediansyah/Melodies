// Service sinkronisasi otomatis antara server dan client
// Jalankan: node sync_service.js

const path = require('path')
const fs = require('fs')
const axios = require('axios')
const Database = require('better-sqlite3')

// Konfigurasi
const SERVER_URL = 'http://localhost:4000' // Ganti sesuai alamat server
const BASE_PATH = path.resolve(__dirname, '../storage')
const DB_PATH = path.join(BASE_PATH, 'database.sqlite')
const SYNC_INTERVAL = 60 * 1000 // 1 menit
const LOG_PATH = path.join(__dirname, 'sync.log')

const db = new Database(DB_PATH)

function logToFile(msg) {
  const line = `[${new Date().toISOString()}] ${msg}\n`
  fs.appendFileSync(LOG_PATH, line)
}

async function fetchServerData() {
  const [songs, banners] = await Promise.all([
    axios.get(`${SERVER_URL}/songs`).then((res) => res.data),
    axios.get(`${SERVER_URL}/banners`).then((res) => res.data)
  ])
  return { songs, banners }
}

function fetchLocalData() {
  const songs = db.prepare('SELECT * FROM songs').all()
  const banners = db.prepare('SELECT * FROM banners').all()
  return { songs, banners }
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
    console.log(`[SYNC] Mulai sinkronisasi...`)
    logToFile('Mulai sinkronisasi...')
    const server = await fetchServerData()
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
        await downloadFile(`${SERVER_URL}/storage/songs/${song.id}/cover.jpg`, path.join(songDir, 'cover.jpg'))
          .then(() => logToFile(`Download cover song ${song.id}`))
          .catch(() => logToFile(`Gagal download cover song ${song.id}`))
      }
      if (song.song_updated_at !== localSong.song_updated_at) {
        await downloadFile(`${SERVER_URL}/storage/songs/${song.id}/song.mp4`, path.join(songDir, 'song.mp4'))
          .then(() => logToFile(`Download file song ${song.id}`))
          .catch(() => logToFile(`Gagal download file song ${song.id}`))
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
    for (const banner of [...bannerDiff.toAdd, ...bannerDiff.toUpdate]) {
      db.prepare(
        `REPLACE INTO banners (id, title, description, created_at, updated_at, banner_updated_at) VALUES (@id, @title, @description, @created_at, @updated_at, @banner_updated_at)`
      ).run(banner)
      const localBanner = findLocalById(local.banners, banner.id) || {}
      if (banner.banner_updated_at !== localBanner.banner_updated_at) {
        await downloadFile(
          `${SERVER_URL}/storage/banners/${banner.id}.jpg`,
          path.join(BASE_PATH, 'banners', `${banner.id}.jpg`)
        )
          .then(() => logToFile(`Download banner ${banner.id}`))
          .catch(() => logToFile(`Gagal download banner ${banner.id}`))
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

    logToFile('Sinkronisasi selesai.')
    console.log(`[SYNC] Sinkronisasi selesai.`)
  } catch (err) {
    logToFile('ERROR: ' + err.message)
    console.error('[SYNC] Error:', err)
  }
}

// Loop sinkronisasi
setInterval(sync, SYNC_INTERVAL)
sync()

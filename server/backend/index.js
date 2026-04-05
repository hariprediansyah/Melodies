const express = require('express')
const cors = require('cors')
const multer = require('multer')
const pool = require('./db')
const app = express()
const PORT = 4000
const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')
const mime = require('mime-types')
const ffprobe = require('ffprobe')
const ffprobeStatic = require('ffprobe-static')
const macScanner = require('./macScanner')
const license = require('./license')
const axios = require('axios')

// Jalankan scan MAC address otomatis setiap 30 detik
setInterval(() => {
  macScanner
    .scanAndUpdateRooms()
    .then((log) => console.log('[Auto Scan]', log.join('\n')))
    .catch((err) => console.error('[Auto Scan Error]', err))
}, 30000)

// Konfigurasi multer untuk menangani file upload
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 1024 * 1024 * 1024 // 1GB limit
  }
})

app.use(cors())
app.use(express.json())
app.use('/uploads', express.static('../uploads')) // untuk file banner
app.use('/storage', express.static('../storage')) // untuk file lagu & thumbnail

const storagePath = path.join(__dirname, 'storage')

// Fungsi async deteksi format file .dat
async function deteksiFormat(filePath) {
  try {
    const info = await ffprobe(filePath, { path: ffprobeStatic.path })
    const videoStream = info.streams.find((s) => s.codec_type === 'video')
    const audioStream = info.streams.find((s) => s.codec_type === 'audio')

    if (videoStream && audioStream) {
      return 'mp4'
    } else if (audioStream) {
      return audioStream.codec_name
    } else {
      throw new Error('File tidak mengandung stream audio/video yang valid')
    }
  } catch (e) {
    console.error('ffprobe error:', e)
    throw new Error('Format file tidak dikenali')
  }
}

// // Cek lisensi saat startup
// if (!license.isLicensed()) {
//   console.error('Aplikasi belum diaktivasi. Silakan aktivasi dengan license key.')
//   process.exit(1)
// }

// Endpoint aktivasi lisensi (opsional, untuk testing manual)
app.post('/activate-license', async (req, res) => {
  const { licenseKey } = req.body
  console.log('Activating license with key:', licenseKey)

  if (!licenseKey) return res.json({ success: false, message: 'License key required' })
  const result = await license.activateLicense(licenseKey)
  console.log('License activation result:', result)
  if (result.success) {
    res.json({ success: true })
    // setTimeout(() => process.exit(0), 1000) // restart agar lisensi aktif
  } else {
    if (result.message.includes('Request failed with status code 400')) {
      console.error('Invalid license key:', result.message)
      res.json({ success: false, message: 'Invalid license key' })
    } else {
      res.json({ success: false, message: result.message || 'Activation failed' })
    }
  }
})

// Endpoint cek status lisensi
app.get('/license-status', (req, res) => {
  try {
    const fs = require('fs')
    const path = require('path')
    const LICENSE_FILE = path.join(__dirname, 'licensed.json')
    if (!fs.existsSync(LICENSE_FILE)) {
      return res.json({ licensed: false })
    }
    const data = JSON.parse(fs.readFileSync(LICENSE_FILE, 'utf-8'))
    const { machineIdSync } = require('node-machine-id')
    const currentId = machineIdSync()
    if (data.status === 'licensed' && data.hardwareId === currentId) {
      return res.json({ licensed: true })
    }
    return res.json({ licensed: false })
  } catch {
    return res.json({ licensed: false })
  }
})

// --- ROOM MANAGEMENT ---
app.get('/rooms', async (req, res) => {
  const [rows] = await pool.query(
    'SELECT id, name, description, mac_address as macAddress, ip_address, status, created_at, updated_at FROM rooms ORDER BY id ASC'
  )
  res.json(rows)
})

app.get('/rooms/force-shutdown/:id', async (req, res) => {
  const [row] = await pool.query('SELECT force_shutdown FROM rooms WHERE id = ?', [req.params.id])
  await pool.query('UPDATE rooms SET force_shutdown = NULL WHERE id = ?', [req.params.id])
  res.json(row.force_shutdown === 'Y')
})

app.get('/rooms/total', async (req, res) => {
  const [rows] = await pool.query('SELECT COUNT(*) as total FROM rooms')
  res.json(rows[0])
})

app.get('/rooms/total-active', async (req, res) => {
  const [rows] = await pool.query('SELECT COUNT(*) as total FROM rooms WHERE status = "Active"')
  res.json(rows[0])
})

app.get('/roomsdashboard', async (req, res) => {
  const [rows] = await pool.query(
    `SELECT A.id, A.name, A.status, C.Total, B.start_time, A.ip_address FROM rooms A
    left join room_sessions B ON A.id = B.room_id AND B.status = 'Active'
    left join (SELECT COUNT(*) as Total, room_id from song_playlist GROUP by room_id) C ON A.id = C.room_id
    ORDER BY A.id ASC`
  )
  res.json(rows)
})

// Endpoint shutdown all room
app.post('/rooms/shutdown-all', async (req, res) => {
  try {
    const [result] = await pool.query('UPDATE rooms SET status = "Inactive", force_shutdown = "Y"')
    await pool.query('UPDATE room_sessions SET status = "Ended" where status = "Active"')
    res.json({ success: true, affectedRows: result.affectedRows })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

app.post('/rooms/shutdown-room/:id', async (req, res) => {
  const roomId = req.params.id
  try {
    const [result] = await pool.query('UPDATE rooms SET status = "Inactive", force_shutdown = "Y" WHERE id = ?', [
      roomId
    ])
    await pool.query('UPDATE room_sessions SET status = "Ended" WHERE room_id = ? AND status = "Active"', [roomId])
    res.json({ success: true, affectedRows: result.affectedRows })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})
app.post('/rooms', async (req, res) => {
  const { name, description, status, macAddress } = req.body
  await pool.query('INSERT INTO rooms (name, description, status, mac_address) VALUES (?, ?, ?, ?)', [
    name,
    description,
    status,
    macAddress
  ])
  res.json({ success: true })
})
app.put('/rooms/:id', async (req, res) => {
  const { name, description, status, macAddress } = req.body
  await pool.query('UPDATE rooms SET name=?, description=?, status=?, mac_address=? WHERE id=?', [
    name,
    description,
    status,
    macAddress,
    req.params.id
  ])
  res.json({ success: true })
})
app.delete('/rooms/:id', async (req, res) => {
  await pool.query('DELETE FROM rooms WHERE id=?', [req.params.id])
  res.json({ success: true })
})

// Ambil data room by mac_address
app.get('/rooms/by-mac/:mac', async (req, res) => {
  const mac = req.params.mac
  const [rows] = await pool.query('SELECT * FROM rooms WHERE mac_address=?', [mac])
  if (rows.length === 0) return res.status(404).json({ error: 'Room not found' })
  res.json(rows[0])
})
// Update status room by mac_address
app.put('/rooms/by-mac/:mac', async (req, res) => {
  const mac = req.params.mac
  const { status } = req.body
  await pool.query('UPDATE rooms SET status=? WHERE mac_address=? AND status="Inactive"', [status, mac])
  res.json({ success: true })
})

// --- ROOM SESSION MANAGEMENT ---
// Mulai sesi room
app.post('/rooms/:id/start-session', async (req, res) => {
  const roomId = req.params.id
  try {
    // Cek apakah sudah ada sesi aktif untuk room ini
    const [active] = await pool.query('SELECT * FROM room_sessions WHERE room_id=? AND status="Active"', [roomId])
    if (active.length > 0) {
      return res.status(400).json({ error: 'Room already has an active session' })
    }
    // Insert sesi baru
    await pool.query('INSERT INTO room_sessions (room_id, start_time, status) VALUES (?, NOW(), "Active")', [roomId])
    // (Opsional) Update status room ke Active
    await pool.query('UPDATE rooms SET status="Active" WHERE id=?', [roomId])
    // hapus playlist sebelumnya
    await pool.query('DELETE FROM song_playlist WHERE room_id=?', [roomId])
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: 'Failed to start session' })
  }
})
// Akhiri sesi room
app.post('/rooms/:id/end-session', async (req, res) => {
  const roomId = req.params.id
  try {
    // Cari sesi aktif
    const [active] = await pool.query('SELECT * FROM room_sessions WHERE room_id=? AND status="Active"', [roomId])
    if (active.length === 0) {
      return res.status(400).json({ error: 'No active session for this room' })
    }
    const sessionId = active[0].id
    // Update sesi: set end_time dan status Ended
    await pool.query('UPDATE room_sessions SET end_time=NOW(), status="Ended" WHERE id=?', [sessionId])
    // (Opsional) Update status room ke Standby
    await pool.query('UPDATE rooms SET status="Standby" WHERE id=?', [roomId])
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: 'Failed to end session' })
  }
})

// --- LIBRARY SONGS ---
app.get('/songs', async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM songs ORDER BY id ASC')
  res.json(rows)
})
app.get('/songs/total', async (req, res) => {
  const [rows] = await pool.query('SELECT COUNT(*) as total FROM songs')
  res.json(rows[0])
})
app.post(
  '/songs',
  upload.fields([
    { name: 'thumbnail', maxCount: 1 },
    { name: 'songfile', maxCount: 1 }
  ]),
  async (req, res) => {
    const conn = await pool.getConnection()
    try {
      const { title, artist, genre, album, release_date, duration } = req.body
      let format = null
      let songFileName = null
      let buffer = null

      if (req.files && req.files.songfile && req.files.songfile[0]) {
        const original = req.files.songfile[0]
        const ext = path.extname(original.originalname).toLowerCase()
        buffer = original.buffer

        // Handle file .dat
        if (ext === '.dat') {
          const tempPath = path.join(storagePath, 'temp_' + Date.now() + '.dat')
          fs.writeFileSync(tempPath, buffer)

          // Deteksi format dari dalam file
          try {
            await deteksiFormat(tempPath)
            format = 'mp4'
          } catch (e) {
            fs.unlinkSync(tempPath)
            throw e
          }

          const outPath = tempPath.replace('.dat', '.mp4')

          // Konversi ke .mp4 dengan codec video/audio HTML5-compatible
          execSync(`ffmpeg -y -i "${tempPath}" -c:v libx264 -c:a aac -strict experimental "${outPath}"`)
          buffer = fs.readFileSync(outPath)

          fs.unlinkSync(tempPath)
          fs.unlinkSync(outPath)

          songFileName = 'song.mp4'
        } else if (ext === '.mpg') {
          const tempPath = path.join(storagePath, 'temp_' + Date.now() + '.mpg')
          fs.writeFileSync(tempPath, buffer)

          try {
            const outPath = tempPath.replace('.mpg', '.mp4')
            // Konversi .mpg ke .mp4
            execSync(`ffmpeg -y -i "${tempPath}" -c:v libx264 -c:a aac -strict experimental "${outPath}"`)

            buffer = fs.readFileSync(outPath)
            fs.unlinkSync(tempPath)
            fs.unlinkSync(outPath)

            format = 'mp4'
            songFileName = 'song.mp4'
          } catch (e) {
            fs.unlinkSync(tempPath)
            throw e
          }
        } else {
          // Format selain .dat
          format = ext.replace('.', '')
          songFileName = 'song' + ext
        }

        // Simpan metadata lagu
        await conn.query(
          'INSERT INTO songs (title, artist, genre, album, release_date, duration, format) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [title, artist, genre, album, release_date, duration, format]
        )

        const [result] = await conn.query('SELECT LAST_INSERT_ID() as id')
        const songId = result[0].id

        // Simpan file ke folder song
        const songDir = path.join(storagePath, 'songs', String(songId))
        if (!fs.existsSync(songDir)) fs.mkdirSync(songDir, { recursive: true })

        const songFilePath = path.join(songDir, songFileName)
        fs.writeFileSync(songFilePath, buffer)

        await conn.query('UPDATE songs SET song_updated_at=NOW() WHERE id=?', [songId])

        // Simpan thumbnail jika ada
        if (req.files.thumbnail && req.files.thumbnail[0]) {
          const thumbnail = req.files.thumbnail[0]
          const extThumb = path.extname(thumbnail.originalname)
          const thumbnailPath = path.join(songDir, 'cover' + extThumb)
          fs.writeFileSync(thumbnailPath, thumbnail.buffer)

          await conn.query('UPDATE songs SET cover_updated_at=NOW() WHERE id=?', [songId])
        }

        res.json({ success: true, song_id: songId })
        return
      }

      // Jika tidak ada file
      await conn.query(
        'INSERT INTO songs (title, artist, genre, album, release_date, duration, format) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [title, artist, genre, album, release_date, duration, null]
      )
      res.json({ success: true })
    } catch (err) {
      console.error('Upload error:', err)
      res.status(500).json({ error: 'Failed to save song' })
    } finally {
      conn.release()
    }
  }
)

app.get('/songs/download/:id', async (req, res) => {
  const songId = req.params.id
  const [rows] = await pool.query('SELECT * FROM songs WHERE id=?', [songId])
  if (rows.length === 0) {
    return res.status(404).json({ error: 'Song not found' })
  }
  const song = rows[0]
  const songFilePath = song.video_path

  if (!fs.existsSync(songFilePath)) {
    return res.status(404).json({ error: 'Song file not found' })
  }

  res.download(songFilePath, `song.${song.format}`, (err) => {
    if (err) {
      console.error('Download error:', err)
      res.status(500).send('Failed to download song')
    }
  })
})
app.put(
  '/songs/:id',
  upload.fields([
    { name: 'thumbnail', maxCount: 1 },
    { name: 'songfile', maxCount: 1 }
  ]),
  async (req, res) => {
    const conn = await pool.getConnection()
    try {
      const { title, artist, genre, album, release_date, duration } = req.body
      const songId = req.params.id
      let format = null
      let songFileName = null
      let buffer = null

      const songDir = path.join(storagePath, 'songs', String(songId))
      if (!fs.existsSync(songDir)) {
        fs.mkdirSync(songDir, { recursive: true })
      }

      // === Handle song file ===
      if (req.files?.songfile?.[0]) {
        const original = req.files.songfile[0]
        const ext = path.extname(original.originalname).toLowerCase()
        buffer = original.buffer

        if (ext === '.dat') {
          const tempPath = path.join(storagePath, 'temp_' + Date.now() + '.dat')
          fs.writeFileSync(tempPath, buffer)

          try {
            await deteksiFormat(tempPath) // validasi isi .dat
            format = 'mp4'
          } catch (e) {
            fs.unlinkSync(tempPath)
            throw e
          }

          const outPath = tempPath.replace('.dat', '.mp4')
          execSync(`ffmpeg -y -i "${tempPath}" -c:v libx264 -c:a aac -strict experimental "${outPath}"`)
          buffer = fs.readFileSync(outPath)

          fs.unlinkSync(tempPath)
          fs.unlinkSync(outPath)

          songFileName = 'song.mp4'
        } else if (ext === '.mpg') {
          const tempPath = path.join(storagePath, 'temp_' + Date.now() + '.mpg')
          fs.writeFileSync(tempPath, buffer)

          try {
            const outPath = tempPath.replace('.mpg', '.mp4')
            // Konversi .mpg ke .mp4
            execSync(`ffmpeg -y -i "${tempPath}" -c:v libx264 -c:a aac -strict experimental "${outPath}"`)

            buffer = fs.readFileSync(outPath)
            fs.unlinkSync(tempPath)
            fs.unlinkSync(outPath)

            format = 'mp4'
            songFileName = 'song.mp4'
          } catch (e) {
            fs.unlinkSync(tempPath)
            throw e
          }
        } else {
          format = ext.replace('.', '')
          songFileName = 'song' + ext
        }

        const songFilePath = path.join(songDir, songFileName)
        fs.writeFileSync(songFilePath, buffer)

        await conn.query('UPDATE songs SET format=?, song_updated_at=NOW() WHERE id=?', [format, songId])
      }

      // === Handle metadata ===
      await conn.query('UPDATE songs SET title=?, artist=?, genre=?, album=?, release_date=?, duration=? WHERE id=?', [
        title,
        artist,
        genre,
        album,
        release_date,
        duration,
        songId
      ])

      // === Handle thumbnail ===
      if (req.files?.thumbnail?.[0]) {
        const thumbnail = req.files.thumbnail[0]
        const extThumb = path.extname(thumbnail.originalname)
        const thumbnailPath = path.join(songDir, 'cover' + extThumb)
        fs.writeFileSync(thumbnailPath, thumbnail.buffer)
        await conn.query('UPDATE songs SET cover_updated_at=NOW() WHERE id=?', [songId])
      }

      res.json({ success: true })
    } catch (err) {
      console.error('Update error:', err)
      res.status(500).json({ error: 'Failed to update song' })
    } finally {
      conn.release()
    }
  }
)

app.delete('/songs/:id', async (req, res) => {
  const songId = req.params.id
  try {
    await pool.query('DELETE FROM songs WHERE id=?', [songId])
    const dir = path.join(storagePath, 'songs', songId)
    if (fs.existsSync(dir)) {
      fs.rmdirSync(dir, { recursive: true })
    }
    res.json({ success: true })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to delete song' })
  }
})

// --- CONTENT BANNER ---
app.get('/banners', async (req, res) => {
  const [rows] = await pool.query(
    'SELECT id, title, description, created_at, updated_at, banner_updated_at FROM banners ORDER BY id ASC'
  )
  const banners = rows.map((row) => {
    let extension = null
    const bannerPath = path.join(storagePath, 'banners', row.id.toString())
    if (fs.existsSync(bannerPath + '.mp4')) {
      extension = 'mp4'
    } else if (fs.existsSync(bannerPath + '.jpg')) {
      extension = 'jpg'
    }
    return {
      id: row.id,
      title: row.title,
      description: row.description,
      created_at: row.created_at,
      updated_at: row.updated_at,
      banner_updated_at: row.banner_updated_at,
      extension
    }
  })
  res.json(banners)
})

app.get('/banners/total', async (req, res) => {
  const [rows] = await pool.query('SELECT COUNT(*) as total FROM banners')
  res.json(rows[0])
})
app.post('/banners', upload.single('image'), async (req, res) => {
  const { title, description } = req.body
  // Insert banner tanpa gambar dulu
  const [result] = await pool.query('INSERT INTO banners (title, description) VALUES (?, ?)', [title, description])
  const bannerId = result.insertId
  let imagePath = null
  if (req.file) {
    const carouselDir = path.join(storagePath, 'banners')
    if (!fs.existsSync(carouselDir)) {
      fs.mkdirSync(carouselDir, { recursive: true })
    }
    let ext = path.extname(req.file.originalname).toLowerCase()
    if (ext === '.mp4') {
      imagePath = `/storage/banners/${bannerId}.mp4`
    } else {
      imagePath = `/storage/banners/${bannerId}.jpg`
      ext = '.jpg' // simpan selain mp4 sebagai jpg
    }
    fs.writeFileSync(path.join(carouselDir, `${bannerId}${ext}`), req.file.buffer)
    await pool.query('UPDATE banners SET banner_updated_at=NOW() WHERE id=?', [bannerId])
  }
  res.json({ success: true, id: bannerId, image: imagePath })
})
app.put('/banners/:id', upload.single('image'), async (req, res) => {
  const { title, description } = req.body
  const bannerId = req.params.id
  let sql = 'UPDATE banners SET title=?, description=?, updated_at=NOW()'
  let params = [title, description]
  let imagePath = null
  if (req.file) {
    const carouselDir = path.join(storagePath, 'banners')
    if (!fs.existsSync(carouselDir)) {
      fs.mkdirSync(carouselDir, { recursive: true })
    }
    let ext = path.extname(req.file.originalname).toLowerCase()
    if (ext === '.mp4') {
      imagePath = `/storage/banners/${bannerId}.mp4`
    } else {
      imagePath = `/storage/banners/${bannerId}.jpg`
      ext = '.jpg' // simpan selain mp4 sebagai jpg
    }

    //hapus file lama jika ada
    const exts = ['.jpg', '.jpeg', '.png', '.webp', '.mp4']
    for (const ext of exts) {
      const filePath = path.join(carouselDir, `${bannerId}${ext}`)
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath)
      }
    }
    fs.writeFileSync(path.join(carouselDir, `${bannerId}${ext}`), req.file.buffer)
    sql += ', banner_updated_at=NOW()'
  }
  sql += ' WHERE id=?'
  params.push(bannerId)
  await pool.query(sql, params)
  res.json({ success: true, id: bannerId, image: imagePath })
})

app.delete('/banners/:id', async (req, res) => {
  const bannerId = req.params.id
  await pool.query('DELETE FROM banners WHERE id=?', [bannerId])
  // Hapus file gambar jika ada
  const carouselDir = path.join(storagePath, 'banners')
  const exts = ['.jpg', '.jpeg', '.png', '.webp', '.mp4']
  for (const ext of exts) {
    const filePath = path.join(carouselDir, `${bannerId}${ext}`)
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
    }
  }
  res.json({ success: true })
})

// Endpoint untuk list file carousels beserta waktu edit terakhir
app.get('/carousels/files', (req, res) => {
  const carouselsDir = path.join(storagePath, 'carousels')
  if (!fs.existsSync(carouselsDir)) return res.json([])
  const files = fs.readdirSync(carouselsDir)
  const images = files
    .filter((f) => /\.(jpg|jpeg|png)$/i.test(f))
    .map((f) => {
      const stat = fs.statSync(path.join(carouselsDir, f))
      return {
        filename: f,
        updated_at: stat.mtime.toISOString()
      }
    })
  res.json(images)
})

app.get('/carousels/:filename', (req, res) => {
  const filePath = path.join(storagePath, 'carousels', req.params.filename)
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath)
  } else {
    res.status(404).send('Not found')
  }
})

// Endpoint untuk serve gambar banner carousel
app.get('/banners/:filename', (req, res) => {
  const filePath = path.join(storagePath, 'banners', req.params.filename)
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath)
  } else {
    res.status(404).send('Not found')
  }
})

// Endpoint untuk ambil file lagu/cover
app.get('/files/song/:id/:filename', (req, res) => {
  const { id, filename } = req.params
  const filePath = path.join(storagePath, 'songs', id, filename)
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath)
  } else {
    res.status(404).json({ error: 'File not found' })
  }
})
// Endpoint untuk ambil file banner
app.get('/files/banner/:filename', (req, res) => {
  const { filename } = req.params
  const filePath = path.join(storagePath, 'banners', filename)
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath)
  } else {
    res.status(404).json({ error: 'File not found' })
  }
})

// --- PLAYLIST MANAGEMENT ---
app.get('/playlist', async (req, res) => {
  const roomId = req.query.room_id
  if (!roomId) return res.status(400).json({ success: false, error: 'room_id required' })
  try {
    const [playlist] = await pool.query(
      'SELECT a.room_id, a.id, a.title, a.artist, a.video_url, a.is_youtube, b.vocal FROM song_playlist a left join songs b on a.id = b.id WHERE a.room_id=? ORDER BY CAST(a.id AS UNSIGNED) ASC',
      [roomId]
    )

    res.json(playlist)
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

app.post('/playlist', async (req, res) => {
  const { room_id, id: songId, title, artist, video_url, is_youtube } = req.body
  const conn = await pool.getConnection()
  try {
    await conn.beginTransaction()

    // id = auto increment per room (posisi), bukan id lagu
    const [[row]] = await conn.query(
      `SELECT COALESCE(MAX(CAST(id AS SIGNED)), 0) + 1 AS next_id FROM song_playlist WHERE room_id=?`,
      [room_id]
    )
    const newId = String(row.next_id)

    // video_url = id lagu asli kalau bukan youtube
    const finalVideoUrl = is_youtube ? `https://www.youtube.com/embed/${songId}` : String(songId)

    await conn.query(
      `INSERT INTO song_playlist (room_id, id, title, artist, video_url, is_youtube)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [room_id, newId, title, artist, finalVideoUrl, is_youtube]
    )

    if (is_youtube) {
      await conn.query(
        `INSERT INTO song_youtube_history (room_id, id, title, artist, video_url, is_youtube, play_count)
         VALUES (?, ?, ?, ?, ?, ?, 1)
         ON DUPLICATE KEY UPDATE play_count = play_count + 1`,
        [room_id, songId, title, artist, video_url, is_youtube]
      )
    }

    await conn.commit()
    res.json({ success: true })
  } catch (err) {
    await conn.rollback()
    res.status(500).json({ success: false, error: err.message })
  } finally {
    conn.release()
  }
})

app.delete('/playlist/:id', async (req, res) => {
  const songId = req.params.id
  const roomId = req.query.room_id
  try {
    if (!roomId) return res.status(400).json({ success: false, error: 'room_id required' })
    await pool.query('DELETE FROM song_playlist WHERE id=? AND room_id=?', [songId, roomId])
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

app.delete('/playlist', async (req, res) => {
  const roomId = req.query.room_id
  try {
    if (!roomId) return res.status(400).json({ success: false, error: 'room_id required' })
    await pool.query('DELETE FROM song_playlist WHERE room_id=?', [roomId])
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

app.post('/playlist/swap', async (req, res) => {
  const { room_id, song_id_1, song_id_2 } = req.body
  const conn = await pool.getConnection()
  try {
    if (!room_id || !song_id_1 || !song_id_2) {
      return res.status(400).json({ success: false, error: 'room_id, song_id_1, and song_id_2 are required' })
    }

    await conn.beginTransaction()

    const [songs] = await conn.query(`SELECT * FROM song_playlist WHERE room_id=? AND id IN (?, ?) FOR UPDATE`, [
      room_id,
      song_id_1,
      song_id_2
    ])

    if (songs.length !== 2) {
      await conn.rollback()
      return res.status(404).json({ success: false, error: 'One or both songs not found in playlist' })
    }

    const s1 = songs.find((s) => String(s.id) === String(song_id_1))
    const s2 = songs.find((s) => String(s.id) === String(song_id_2))

    const contentFields = ['title', 'artist', 'video_url', 'is_youtube', 'vocal']

    // s1 dapat content s2
    const setClause1 = contentFields.map((f) => `${f}=?`).join(', ')
    await conn.query(`UPDATE song_playlist SET ${setClause1} WHERE room_id=? AND id=?`, [
      ...contentFields.map((f) => s2[f]),
      room_id,
      song_id_1
    ])

    // s2 dapat content s1
    const setClause2 = contentFields.map((f) => `${f}=?`).join(', ')
    await conn.query(`UPDATE song_playlist SET ${setClause2} WHERE room_id=? AND id=?`, [
      ...contentFields.map((f) => s1[f]),
      room_id,
      song_id_2
    ])

    await conn.commit()
    res.json({ success: true })
  } catch (err) {
    try {
      await conn.rollback()
    } catch {}
    console.error(err)
    res.status(500).json({ success: false, error: err.message })
  } finally {
    conn.release()
  }
})

app.post('/playlist/move-to-top', async (req, res) => {
  const { room_id, song_id } = req.body
  const conn = await pool.getConnection()
  try {
    if (!room_id || !song_id) return res.status(400).json({ success: false, error: 'room_id and song_id are required' })

    await conn.beginTransaction()

    const [allRows] = await conn.query(
      `SELECT * FROM song_playlist WHERE room_id=? ORDER BY CAST(id AS SIGNED) ASC FOR UPDATE`,
      [room_id]
    )

    if (allRows.length === 0) {
      await conn.rollback()
      return res.status(404).json({ success: false, error: 'Playlist is empty' })
    }

    const curIdx = allRows.findIndex((r) => String(r.id) === String(song_id))

    if (curIdx === -1) {
      await conn.rollback()
      return res.status(404).json({ success: false, error: 'Song not found in this room' })
    }

    if (curIdx <= 1) {
      await conn.commit()
      return res.json({ success: true, moved: false })
    }

    // Swap content, id tetap di tempat
    const contentFields = ['title', 'artist', 'video_url', 'is_youtube']
    const seg = allRows.slice(1, curIdx + 1)
    const curContent = seg[seg.length - 1]

    // Geser content ke bawah: seg[i] dapat content seg[i-1]
    for (let i = seg.length - 1; i > 0; i--) {
      const setClause = contentFields.map((f) => `${f}=?`).join(', ')
      const values = contentFields.map((f) => seg[i - 1][f])
      await conn.query(`UPDATE song_playlist SET ${setClause} WHERE room_id=? AND id=?`, [
        ...values,
        room_id,
        seg[i].id
      ])
    }

    // seg[0] dapat content curRow
    const setClause = contentFields.map((f) => `${f}=?`).join(', ')
    const values = contentFields.map((f) => curContent[f])
    await conn.query(`UPDATE song_playlist SET ${setClause} WHERE room_id=? AND id=?`, [...values, room_id, seg[0].id])

    await conn.commit()
    res.json({ success: true, moved: true, newTopId: String(seg[0].id) })
  } catch (err) {
    try {
      await conn.rollback()
    } catch {}
    console.error(err)
    res.status(500).json({ success: false, error: err.message })
  } finally {
    conn.release()
  }
})

// Endpoint untuk trigger scan MAC address dan update IP
app.post('/scan-mac', async (req, res) => {
  try {
    const log = await macScanner.scanAndUpdateRooms()
    res.json({ success: true, log })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// --- MAC ADDRESS MANAGEMENT ---
app.get('/mac-addresses', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT mac_address FROM master_mac ORDER BY mac_address ASC')
    res.json(rows.map((row) => row.mac_address))
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// --- CALL LOG MANAGEMENT ---
app.get('/call-logs', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT cl.id, cl.room_id, r.name as room_name, cl.status, cl.created_at
      FROM call_log cl
      JOIN rooms r ON cl.room_id = r.id
      ORDER BY cl.created_at DESC
      LIMIT 20
    `)
    res.json(rows)
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

app.get('/call-logs/active', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT cl.id, cl.room_id, r.name as room_name, cl.status, cl.created_at
      FROM call_log cl
      JOIN rooms r ON cl.room_id = r.id
      WHERE cl.status = 'Calling'
      ORDER BY cl.created_at DESC
    `)
    res.json(rows)
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

app.get('/call-logs/:id', async (req, res) => {
  try {
    const { id } = req.params
    const [rows] = await pool.query(
      `
      SELECT cl.id, cl.room_id, r.name as room_name, cl.status, cl.created_at
      FROM call_log cl
      JOIN rooms r ON cl.room_id = r.id
      WHERE cl.id = ?
    `,
      [id]
    )

    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Call log not found' })
    }

    res.json(rows[0])
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

app.post('/call-logs', async (req, res) => {
  try {
    const { room_id } = req.body
    if (!room_id) {
      return res.status(400).json({ success: false, error: 'Room ID is required' })
    }

    // Check if room exists
    const [roomCheck] = await pool.query('SELECT id FROM rooms WHERE id = ?', [room_id])
    if (roomCheck.length === 0) {
      return res.status(404).json({ success: false, error: 'Room not found' })
    }

    // Create new call log
    const [result] = await pool.query('INSERT INTO call_log (room_id, status) VALUES (?, "Calling")', [room_id])

    res.json({
      success: true,
      call_id: result.insertId
    })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

app.put('/call-logs/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { status } = req.body

    if (!status || !['Accepted', 'Rejected'].includes(status)) {
      return res.status(400).json({ success: false, error: 'Valid status (Accepted/Rejected) is required' })
    }

    // Update call log status
    const [result] = await pool.query('UPDATE call_log SET status = ? WHERE id = ? AND status = "Calling"', [
      status,
      id
    ])

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, error: 'Call log not found or already processed' })
    }

    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

app.post('/validate-admin', async (req, res) => {
  try {
    const { password } = req.body

    if (!password) {
      return res.status(400).json({ success: false, error: 'Password is required' })
    }

    const [sysParam] = await pool.query('SELECT param_value FROM sys_params WHERE param_key = "login_password"')
    console.log('sysParam:', sysParam)

    if (sysParam.length === 0 || sysParam[0].param_value !== password) {
      return res.status(401).json({ success: false, error: 'Invalid password' })
    }

    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body

    if (!username || !password) {
      return res.json({ success: false, error: 'Username and password are required' })
    }

    const [sysParam] = await pool.query('SELECT param_value FROM sys_params WHERE param_key = "login_userid"')
    if (sysParam.length === 0 || sysParam[0].param_value !== username) {
      return res.json({ success: false, error: 'Invalid username or password' })
    }

    const [sysParamPassword] = await pool.query('SELECT param_value FROM sys_params WHERE param_key = "login_password"')
    if (sysParamPassword.length === 0 || sysParamPassword[0].param_value !== password) {
      return res.json({ success: false, error: 'Invalid password or username' })
    }

    res.json({ success: true })
  } catch (err) {
    res.json({ success: false, error: err.message })
  }
})

app.get('/youtube-history', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, title, artist, video_url, play_count
       FROM song_youtube_history
       ORDER BY play_count DESC
       LIMIT 20`
    )
    res.json({ success: true, data: rows })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

app.post('/systemvolume', async (req, res) => {
  const { volume, ip } = req.body
  const apiUrl = `http://${ip}:5771/systemvolume`
  try {
    const body = { volume }
    const resPost = await axios.post(apiUrl, body)
    if (resPost.status !== 200) {
      return { success: false, error: 'Failed to set system volume' }
    }
    return res.json({ success: true, message: 'System volume set successfully' })
  } catch (err) {
    console.error('License activation error:', err.message)
    return { success: false, message: err.message }
  }
})

app.get('/systemvolume', async (req, res) => {
  const { ip } = req.query
  const apiUrl = `http://${ip}:5771/systemvolume`
  try {
    const response = await axios.get(apiUrl)
    if (response.status !== 200) {
      return res.json({ success: false, error: 'Failed to get system volume' })
    }
    return res.json({ success: true, data: response.data })
  } catch (err) {
    console.error('Error getting system volume:', err.message)
    return res.json({ success: false, error: err.message })
  }
})

app.listen(PORT, () => {
  console.log('Server running on http://localhost:' + PORT)
})

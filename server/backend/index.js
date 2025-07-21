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
    fileSize: 50 * 1024 * 1024 // 50MB limit
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

// --- ROOM MANAGEMENT ---
app.get('/rooms', async (req, res) => {
  const [rows] = await pool.query(
    'SELECT id, name, description, mac_address as macAddress, ip_address, status, created_at, updated_at FROM rooms ORDER BY id ASC'
  )
  res.json(rows)
})

// Endpoint shutdown all room
app.post('/rooms/shutdown-all', async (req, res) => {
  try {
    const [result] = await pool.query('UPDATE rooms SET status = "Inactive"')
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
  await pool.query('UPDATE rooms SET status=? WHERE mac_address=?', [status, mac])
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

          songFileName = 'song_' + Date.now() + '.mp4'
        } else {
          // Format selain .dat
          format = ext.replace('.', '')
          songFileName = 'song_' + Date.now() + ext
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

          songFileName = 'song_' + Date.now() + '.mp4'
        } else {
          format = ext.replace('.', '')
          songFileName = 'song_' + Date.now() + ext
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
  res.json(rows)
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
    imagePath = `/storage/banners/${bannerId}.jpg`
    fs.writeFileSync(path.join(carouselDir, `${bannerId}.jpg`), req.file.buffer)
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
    imagePath = `/storage/banners/${bannerId}.jpg`
    fs.writeFileSync(path.join(carouselDir, `${bannerId}.jpg`), req.file.buffer)
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
  const exts = ['.jpg', '.jpeg', '.png', '.webp']
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

// Endpoint untuk trigger scan MAC address dan update IP
app.post('/scan-mac', async (req, res) => {
  try {
    const log = await macScanner.scanAndUpdateRooms()
    res.json({ success: true, log })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

app.listen(PORT, () => {
  console.log('Server running on http://localhost:' + PORT)
})

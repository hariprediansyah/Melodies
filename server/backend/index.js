const express = require('express')
const cors = require('cors')
const multer = require('multer')
const pool = require('./db')
const app = express()
const PORT = 4000
const fs = require('fs')
const path = require('path')

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

const storagePath = path.join(__dirname, '../../storage')

// --- ROOM MANAGEMENT ---
app.get('/rooms', async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM rooms ORDER BY id ASC')
  res.json(rows)
})
app.post('/rooms', async (req, res) => {
  const { name, description, status, mac_address } = req.body
  await pool.query('INSERT INTO rooms (name, description, status, mac_address) VALUES (?, ?, ?, ?)', [
    name,
    description,
    status,
    mac_address
  ])
  res.json({ success: true })
})
app.put('/rooms/:id', async (req, res) => {
  const { name, description, status, mac_address } = req.body
  await pool.query('UPDATE rooms SET name=?, description=?, status=?, mac_address=? WHERE id=?', [
    name,
    description,
    status,
    mac_address,
    req.params.id
  ])
  res.json({ success: true })
})
app.delete('/rooms/:id', async (req, res) => {
  await pool.query('DELETE FROM rooms WHERE id=?', [req.params.id])
  res.json({ success: true })
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
      await conn.query(
        'INSERT INTO songs (title, artist, genre, album, release_date, duration) VALUES (?, ?, ?, ?, ?, ?)',
        [title, artist, genre, album, release_date, duration]
      )
      const [result] = await conn.query('SELECT LAST_INSERT_ID() as id')
      const songId = result[0].id
      const songDir = path.join(storagePath, 'songs', String(songId))
      if (!fs.existsSync(songDir)) {
        fs.mkdirSync(songDir, { recursive: true })
      }
      if (req.files && req.files.thumbnail && req.files.thumbnail[0]) {
        const thumbnailPath = path.join(songDir, 'cover' + path.extname(req.files.thumbnail[0].originalname))
        fs.writeFileSync(thumbnailPath, req.files.thumbnail[0].buffer)
        await conn.query('UPDATE songs SET cover_updated_at=NOW() WHERE id=?', [songId])
      }
      if (req.files && req.files.songfile && req.files.songfile[0]) {
        const songFilePath = path.join(songDir, 'song' + path.extname(req.files.songfile[0].originalname))
        fs.writeFileSync(songFilePath, req.files.songfile[0].buffer)
        await conn.query('UPDATE songs SET song_updated_at=NOW() WHERE id=?', [songId])
      }
      res.json({ success: true })
    } catch (err) {
      console.error(err)
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
      await conn.query('UPDATE songs SET title=?, artist=?, genre=?, album=?, release_date=?, duration=? WHERE id=?', [
        title,
        artist,
        genre,
        album,
        release_date,
        duration,
        songId
      ])
      const songDir = path.join(storagePath, 'songs', String(songId))
      if (!fs.existsSync(songDir)) {
        fs.mkdirSync(songDir, { recursive: true })
      }
      if (req.files && req.files.thumbnail && req.files.thumbnail[0]) {
        const thumbnailPath = path.join(songDir, 'cover' + path.extname(req.files.thumbnail[0].originalname))
        fs.writeFileSync(thumbnailPath, req.files.thumbnail[0].buffer)
        await conn.query('UPDATE songs SET cover_updated_at=NOW() WHERE id=?', [songId])
      }
      if (req.files && req.files.songfile && req.files.songfile[0]) {
        const songFilePath = path.join(songDir, 'song' + path.extname(req.files.songfile[0].originalname))
        fs.writeFileSync(songFilePath, req.files.songfile[0].buffer)
        await conn.query('UPDATE songs SET song_updated_at=NOW() WHERE id=?', [songId])
      }
      res.json({ success: true })
    } catch (err) {
      console.error(err)
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
    'SELECT id, title, description, updated_at, banner_updated_at FROM banners ORDER BY id ASC'
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

// Endpoint untuk serve gambar banner carousel
app.get('/carousels/:filename', (req, res) => {
  const filePath = path.join(storagePath, 'banners', req.params.filename)
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath)
  } else {
    res.status(404).send('Not found')
  }
})

app.listen(PORT, () => {
  console.log('Server running on http://localhost:' + PORT)
})

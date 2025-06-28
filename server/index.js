const express = require('express')
const cors = require('cors')
const pool = require('./db')
const app = express()
const PORT = 4000

app.use(cors())
app.use(express.json())
app.use('/uploads', express.static('uploads')) // untuk file banner

// --- ROOM MANAGEMENT ---
app.get('/rooms', async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM rooms ORDER BY id ASC')
  res.json(rows)
})
app.post('/rooms', async (req, res) => {
  const { name, description, status } = req.body
  await pool.query('INSERT INTO rooms (name, description, status) VALUES (?, ?, ?)', [name, description, status])
  res.json({ success: true })
})
app.put('/rooms/:id', async (req, res) => {
  const { name, description, status } = req.body
  await pool.query('UPDATE rooms SET name=?, description=?, status=? WHERE id=?', [
    name,
    description,
    status,
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
app.post('/songs', async (req, res) => {
  const { title, singer, folder, album, release_date, duration } = req.body
  await pool.query(
    'INSERT INTO songs (title, singer, folder, album, release_date, duration) VALUES (?, ?, ?, ?, ?, ?)',
    [title, singer, folder, album, release_date, duration]
  )
  res.json({ success: true })
})
app.put('/songs/:id', async (req, res) => {
  const { title, singer, folder, album, release_date, duration } = req.body
  await pool.query('UPDATE songs SET title=?, singer=?, folder=?, album=?, release_date=?, duration=? WHERE id=?', [
    title,
    singer,
    folder,
    album,
    release_date,
    duration,
    req.params.id
  ])
  res.json({ success: true })
})
app.delete('/songs/:id', async (req, res) => {
  await pool.query('DELETE FROM songs WHERE id=?', [req.params.id])
  res.json({ success: true })
})

// --- CONTENT BANNER ---
const multer = require('multer')
const path = require('path')
const upload = multer({ dest: path.join(__dirname, 'uploads/') })

app.get('/banners', async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM banners ORDER BY id ASC')
  res.json(rows)
})
app.post('/banners', upload.single('image'), async (req, res) => {
  const { subject, description } = req.body
  const image = req.file ? req.file.filename : null
  await pool.query('INSERT INTO banners (subject, description, image) VALUES (?, ?, ?)', [subject, description, image])
  res.json({ success: true })
})
app.put('/banners/:id', upload.single('image'), async (req, res) => {
  const { subject, description } = req.body
  let sql = 'UPDATE banners SET subject=?, description=?'
  let params = [subject, description]
  if (req.file) {
    sql += ', image=?'
    params.push(req.file.filename)
  }
  sql += ' WHERE id=?'
  params.push(req.params.id)
  await pool.query(sql, params)
  res.json({ success: true })
})
app.delete('/banners/:id', async (req, res) => {
  await pool.query('DELETE FROM banners WHERE id=?', [req.params.id])
  res.json({ success: true })
})

app.listen(PORT, () => {
  console.log('Server running on http://localhost:' + PORT)
})

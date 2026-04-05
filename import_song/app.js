const fs = require('fs')
const path = require('path')
const mysql = require('mysql2/promise')
const readline = require('readline')
const cliProgress = require('cli-progress')

// === Konfigurasi Database ===
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'melodies'
}

// === Helpers ===
function getAllMp4Files(dirPath, files = []) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true })
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name)
    if (entry.isDirectory()) {
      getAllMp4Files(fullPath, files)
    } else if (/\.mp4$/i.test(entry.name)) {
      files.push(fullPath)
    }
  }
  return files
}

function parseMetadata(filename) {
  const base = path.basename(filename)
  const [artist, title] = base.split('#')
  return {
    artist: (artist || '').trim(),
    title: (title || '').trim()
  }
}

function askInput(promptText) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
  return new Promise((resolve) =>
    rl.question(promptText, (ans) => {
      rl.close()
      resolve(ans.trim())
    })
  )
}

function getVocalDirection(filename) {
  const afterLastHash = filename.split('#').pop().trim().toUpperCase()
  const indicator = afterLastHash.charAt(0)

  if (indicator === 'L') return 'Right'
  if (indicator === 'R') return 'Left'
  return 'Left'
}

async function main() {
  const folderPath = await askInput(' Masukkan path folder lagu: ')
  if (!fs.existsSync(folderPath)) {
    console.error(' Folder tidak ditemukan.')
    return
  }

  const files = getAllMp4Files(folderPath)
  if (files.length === 0) {
    console.log(' Tidak ada file .mp4 ditemukan.')
    return
  }

  console.log(` Menemukan ${files.length} file mp4 untuk diproses.`)

  const progressBar = new cliProgress.SingleBar({
    format: ' Progress [{bar}] {percentage}% | {value}/{total} | {title}',
    barCompleteChar: ' ',
    barIncompleteChar: ' ',
    hideCursor: true
  })

  const conn = await mysql.createPool(dbConfig).getConnection()
  let done = 0

  progressBar.start(files.length, 0, { title: 'Memulai...' })

  for (const filePath of files) {
    try {
      const { artist, title } = parseMetadata(filePath)
      const vocalDirection = getVocalDirection(filePath)

      const [existingSong] = await conn.execute('SELECT * FROM songs WHERE title = ? AND artist = ?', [title, artist])

      if (existingSong && existingSong.length > 0) {
        console.log(` Lagu ${title} - ${artist} sudah ada di database.`)
        done++
        progressBar.update(done, { title: `${title} - ${artist}` })
        continue
      }

      // Insert metadata + video path
      await conn.query(
        "INSERT INTO songs (title, artist, genre, album, release_date, duration, format, video_path, vocal) VALUES (?, ?, '', ?, ?, ?, ?, ?, ?)",
        [title, artist, null, null, null, 'mp4', filePath, vocalDirection]
      )

      done++
      progressBar.update(done, { title: `${title} - ${artist}` })
    } catch (e) {
      console.error(`\n Gagal memproses ${filePath}: ${e.message}`)
    }
  }

  progressBar.stop()
  conn.release()
  console.log(' Import selesai sepenuhnya.')
}

main().catch((err) => {
  console.error(' Fatal error:', err.message)
})

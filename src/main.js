const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const fs = require('fs')
const { Low } = require('lowdb')
const { JSONFileSync } = require('lowdb/node')

const dbPath = path.join(__dirname, '..', 'storage', 'database.json')
const adapter = new JSONFileSync(dbPath)
const db = new Low(adapter, { songs: [], playlist: [], carousels: [] })

console.log(dbPath)

// Ensure DB file and structure
fs.mkdirSync(path.dirname(dbPath), { recursive: true })
db.read()
// db.data ||= { songs: [], playlist: [], carousels: [] }
// db.write()

function createWindow() {
  const win = new BrowserWindow({
    fullscreen: true,
    frame: false,
    webPreferences: {
      preload: path.join(__dirname, 'dist', 'preload.bundle.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  })

  win.loadFile('public/index.html')
  if (process.env.NODE_ENV === 'development') win.webContents.openDevTools()
}

ipcMain.handle('getData', (_, collection) => {
  return db.data[collection] || []
})

ipcMain.handle('addToPlaylist', (_, song) => {
  db.data.playlist.push(song)
  db.write()
})

ipcMain.handle('truncateDb', () => {
  db.data.playlist = []
  db.write()
})

ipcMain.handle('remove-from-playlist', async (_, id) => {
  db.data.playlist = db.data.playlist.filter((song) => song.id !== id)
  await db.write()
  return true
})

ipcMain.handle('seedDb', () => {
  if (db.data.songs.length > 0) return
  db.data.songs = [
    {
      id: 1,
      title: 'Sorfcore',
      artist: 'The neighbourhood',
      album: 'Hard to Imagine the Neighbourhood Ever Changing',
      time: '3:26',
      genre: 'Indie',
      release_date: '2015-10-02',
      play_count: 234,
      time_input: '2023-11-04T14:30:00'
    },
    {
      id: 2,
      title: 'Skyfall Beats',
      artist: 'nightmares',
      album: 'nightmares',
      time: '2:45',
      genre: 'Electronic',
      release_date: '2020-11-12',
      play_count: 100,
      time_input: '2023-10-26T16:15:00'
    },
    {
      id: 3,
      title: 'Greedy',
      artist: 'tate mcrae',
      img: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb',
      date: 'Dec 30, 2023',
      album: 'Greedy',
      time: '2:11',
      timeInput: '2023-12-30T18:00:00',
      viewCount: 50,
      genre: 'Pop',
      releaseDate: '2022-05-20'
    },
    {
      id: 4,
      title: 'Lovin On me',
      artist: 'jack harlow',
      img: 'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2',
      date: 'Dec 30, 2023',
      album: 'Lovin On me',
      time: '2:18',
      timeInput: '2023-12-30T19:30:00',
      viewCount: 200,
      genre: 'Indie',
      releaseDate: '2022-08-26'
    },
    {
      id: 5,
      title: 'pain the town red',
      artist: 'Doja Cat',
      img: 'https://images.unsplash.com/photo-1465101178521-c3a6088ed0c4',
      date: 'Dec 29, 2023',
      album: 'Paint The Town Red',
      time: '3:51',
      timeInput: '2023-12-29T20:00:00',
      viewCount: 150,
      genre: 'Pop',
      releaseDate: '2022-09-23'
    },
    {
      id: 6,
      title: 'The Lonliest',
      artist: 'Måneskin',
      img: 'https://plus.unsplash.com/premium_photo-1747562250727-56bfad4a9798',
      date: 'Dec 30, 2023',
      album: 'The Lonliest',
      time: '3:26',
      timeInput: '2023-12-30T21:00:00',
      viewCount: 300,
      genre: 'Rock',
      releaseDate: '2022-10-07'
    },
    {
      id: 7,
      title: 'Someone like you',
      artist: 'Adele',
      img: 'https://i.imgur.com/1.jpg',
      date: 'Dec 30, 2023',
      album: '21',
      time: '4:45',
      timeInput: '2023-12-30T22:00:00',
      viewCount: 500,
      genre: 'Pop',
      releaseDate: '2011-01-24'
    },
    {
      id: 8,
      title: "I Heard That You're Settled Down",
      artist: 'Unknown Artist',
      img: 'https://i.imgur.com/2.jpg',
      date: 'Dec 30, 2023',
      album: 'Unknown Album',
      time: '3:17',
      timeInput: '2023-12-30T23:30:00',
      viewCount: 100,
      genre: 'Rock',
      releaseDate: '2015-05-12'
    }
  ]
  db.data.carousels = [
    {
      id: 1,
      title: 'Sing Your Heart Out.\nThe Ultimate Karaoke Collection!',
      description:
        'Discover our karaoke app, where you can dive into a fantastic library of both classic hits and the latest chart-toppers. Sing along to your favorite songs in stunning quality, all while enjoying a seamless experience. No matter your musical preference, we have the perfect tracks to get you singing!',
      filename: 'photo-1511671782779-c97d3d27a1d4.jpeg'
    },
    {
      id: 2,
      title: 'Koleksi Lagu Terbaru',
      description: 'Nikmati update lagu-lagu terbaru setiap minggu, langsung dari chart dunia!',
      filename: 'photo-1470225620780-dba8ba36b745.jpeg'
    },
    {
      id: 3,
      title: 'Karaoke Kualitas Tinggi',
      description: 'Audio jernih dan lirik realtime, pengalaman karaoke terbaik untuk semua usia.',
      filename: 'photo-1466428996289-fb355538da1b.jpeg'
    },
    {
      id: 4,
      title: 'Buat Playlist Favoritmu',
      description: 'Susun dan simpan lagu favoritmu, siap dinyanyikan kapan saja!',
      filename: '1.jpeg'
    }
  ]
  db.write()
})

ipcMain.handle('getStorageBaseDir', () => {
  return path.resolve(__dirname, '..', 'storage')
})

ipcMain.handle('fileExists', (_, filePath) => {
  return fs.existsSync(filePath)
})

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

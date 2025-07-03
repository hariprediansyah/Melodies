const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const fs = require('fs')
const loudness = require('loudness')
const { speaker, microphone } = require('win-audio')
const Database = require('better-sqlite3')

// Helper untuk path storage agar selalu relatif ke lokasi .exe
function getAppBasePath() {
  // Saat development: __dirname (src)
  // Saat production: path ke folder .exe
  if (process.env.NODE_ENV === 'development') {
    return path.join(__dirname, '..')
  } else {
    return process.cwd()
  }
}

const basePath = getAppBasePath()
const dbPath = path.join(basePath, 'storage', 'database.sqlite')
const db = new Database(dbPath)

// Jika folder storage tidak ada maka buat
const storageDir = path.join(basePath, 'storage')
if (!fs.existsSync(storageDir)) {
  fs.mkdirSync(storageDir, { recursive: true })
}

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
  updated_at TEXT
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
  updated_at TEXT
)`
db.prepare(createBannersTable).run()

// Fungsi utilitas untuk CRUD
function getAll(table) {
  return db.prepare(`SELECT * FROM ${table}`).all()
}
function addToPlaylist(song) {
  db.prepare('INSERT INTO playlist (song_id) VALUES (?)').run(song.id)
}
function truncatePlaylist() {
  db.prepare('DELETE FROM playlist').run()
}
function removeFromPlaylist(id) {
  db.prepare('DELETE FROM playlist WHERE song_id = ?').run(id)
}
function seedSongs() {
  const count = db.prepare('SELECT COUNT(*) as cnt FROM songs').get().cnt
  if (count > 0) return
  const insert = db.prepare(
    'INSERT INTO songs (id, title, artist, genre, album, release_date, duration, play_count, created_at, updated_at) VALUES (@id, @title, @artist, @genre, @album, @release_date, @duration, @play_count, @created_at, @updated_at)'
  )
  const songs = [
    {
      id: 1,
      title: 'Sorfcore',
      artist: 'The neighbourhood',
      genre: 'Indie',
      album: 'Hard to Imagine the Neighbourhood Ever Changing',
      release_date: '2015-10-02',
      duration: '3:26',
      play_count: 234,
      created_at: '2023-11-04T14:30:00',
      updated_at: '2023-11-04T14:30:00'
    },
    {
      id: 2,
      title: 'Skyfall Beats',
      artist: 'nightmares',
      genre: 'Electronic',
      album: 'nightmares',
      release_date: '2020-11-12',
      duration: '2:45',
      play_count: 100,
      created_at: '2023-10-26T16:15:00',
      updated_at: '2023-10-26T16:15:00'
    },
    {
      id: 3,
      title: 'Greedy',
      artist: 'tate mcrae',
      genre: 'Pop',
      album: 'Greedy',
      release_date: '2022-05-20',
      duration: '2:11',
      play_count: 50,
      created_at: '2023-12-30T18:00:00',
      updated_at: '2023-12-30T18:00:00'
    },
    {
      id: 4,
      title: 'Lovin On me',
      artist: 'jack harlow',
      genre: 'Indie',
      album: 'Lovin On me',
      release_date: '2022-08-26',
      duration: '2:18',
      play_count: 200,
      created_at: '2023-12-30T19:30:00',
      updated_at: '2023-12-30T19:30:00'
    },
    {
      id: 5,
      title: 'pain the town red',
      artist: 'Doja Cat',
      genre: 'Pop',
      album: 'Paint The Town Red',
      release_date: '2022-09-23',
      duration: '3:51',
      play_count: 150,
      created_at: '2023-12-29T20:00:00',
      updated_at: '2023-12-29T20:00:00'
    },
    {
      id: 6,
      title: 'The Lonliest',
      artist: 'Måneskin',
      genre: 'Rock',
      album: 'The Lonliest',
      release_date: '2022-10-07',
      duration: '3:26',
      play_count: 300,
      created_at: '2023-12-30T21:00:00',
      updated_at: '2023-12-30T21:00:00'
    },
    {
      id: 7,
      title: 'Someone like you',
      artist: 'Adele',
      genre: 'Pop',
      album: '21',
      release_date: '2011-01-24',
      duration: '4:45',
      play_count: 500,
      created_at: '2023-12-30T22:00:00',
      updated_at: '2023-12-30T22:00:00'
    },
    {
      id: 8,
      title: "I Heard That You're Settled Down",
      artist: 'Unknown Artist',
      genre: 'Rock',
      album: 'Unknown Album',
      release_date: '2015-05-12',
      duration: '3:17',
      play_count: 100,
      created_at: '2023-12-30T23:30:00',
      updated_at: '2023-12-30T23:30:00'
    }
  ]
  for (const song of songs) insert.run(song)
}

function seedCarousels() {
  const count = db.prepare('SELECT COUNT(*) as cnt FROM carousels').get().cnt
  if (count > 0) return
  const insert = db.prepare('INSERT INTO carousels (title, description) VALUES (@title, @description)')
  const carousels = [
    {
      title: 'Sing Your Heart Out.\nThe Ultimate Karaoke Collection!',
      description:
        'Discover our karaoke app, where you can dive into a fantastic library of both classic hits and the latest chart-toppers. Sing along to your favorite songs in stunning quality, all while enjoying a seamless experience. No matter your musical preference, we have the perfect tracks to get you singing!'
    },
    {
      title: 'Koleksi Lagu Terbaru',
      description: 'Nikmati update lagu-lagu terbaru setiap minggu, langsung dari chart dunia!'
    },
    {
      title: 'Karaoke Kualitas Tinggi',
      description: 'Audio jernih dan lirik realtime, pengalaman karaoke terbaik untuk semua usia.'
    },
    {
      title: 'Buat Playlist Favoritmu',
      description: 'Susun dan simpan lagu favoritmu, siap dinyanyikan kapan saja!'
    }
  ]
  for (const carousel of carousels) insert.run(carousel)
}

// Ensure DB file and structure
fs.mkdirSync(path.dirname(dbPath), { recursive: true })

// YouTube TV User Agent
const youtubeTVUserAgent =
  'Mozilla/5.0 (X11; Linux i686) AppleWebKit/534.24 (KHTML, like Gecko) Chrome/11.0.696.77 Large Screen Safari/534.24 GoogleTV/092754'

// YouTube TV Overlay JavaScript
const youtubeTVOverlay = `
(function() {
  // Create overlay container
  const overlay = document.createElement('div');
  overlay.id = 'melodies-overlay';
  overlay.style.cssText = \`
    position: fixed;
    top: 20px;
    left: 20px;
    z-index: 9999;
    pointer-events: none;
  \`;

  // Create back button
  const backButton = document.createElement('button');
  backButton.id = 'melodies-back-btn';
  backButton.innerHTML = '← Back to Melodies';
  backButton.style.cssText = \`
    background: rgba(0, 0, 0, 0.8);
    color: white;
    border: none;
    padding: 12px 20px;
    border-radius: 8px;
    font-size: 16px;
    font-weight: bold;
    cursor: pointer;
    pointer-events: auto;
    transition: all 0.3s ease;
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
  \`;

  // Add hover effect
  backButton.addEventListener('mouseenter', () => {
    backButton.style.background = 'rgba(255, 0, 0, 0.9)';
    backButton.style.transform = 'scale(1.05)';
  });

  backButton.addEventListener('mouseleave', () => {
    backButton.style.background = 'rgba(0, 0, 0, 0.8)';
    backButton.style.transform = 'scale(1)';
  });

  // Add click handler
  backButton.addEventListener('click', () => {
    if (window.electronAPI) {
      window.electronAPI.loadHome();
    }
  });

  // Append elements
  overlay.appendChild(backButton);
  document.body.appendChild(overlay);

  // Auto-hide overlay after 3 seconds
  setTimeout(() => {
    overlay.style.opacity = '0';
    overlay.style.transition = 'opacity 0.5s ease';
  }, 3000);

  // Show overlay on mouse move
  let hideTimeout;
  document.addEventListener('mousemove', () => {
    overlay.style.opacity = '1';
    clearTimeout(hideTimeout);
    hideTimeout = setTimeout(() => {
      overlay.style.opacity = '0';
    }, 3000);
  });

  console.log('Melodies YouTube TV overlay loaded');
})();
`

// Store main window reference
let mainWindow = null

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1920,
    height: 1080,
    fullscreen: true,
    frame: false,
    webPreferences: {
      preload: path.join(__dirname, 'dist', 'preload.bundle.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  })

  mainWindow.loadFile('public/index.html')
  if (process.env.NODE_ENV === 'development') mainWindow.webContents.openDevTools()
}

ipcMain.handle('getData', (_, collection) => {
  return getAll(collection)
})

ipcMain.handle('addToPlaylist', (_, song) => {
  addToPlaylist(song)
})

ipcMain.handle('truncateDb', () => {
  truncatePlaylist()
})

ipcMain.handle('remove-from-playlist', async (_, id) => {
  removeFromPlaylist(id)
  return true
})

ipcMain.handle('seedDb', () => {
  seedSongs()
  seedCarousels()
})

ipcMain.handle('getPlaylist', () => {
  return db.prepare('SELECT B.* FROM playlist A inner join songs B on A.song_id = B.id').all()
})

ipcMain.handle('getStorageBaseDir', () => {
  return path.resolve(basePath, 'storage')
})

ipcMain.handle('fileExists', (_, filePath) => {
  return fs.existsSync(filePath)
})

// Handler untuk load YouTube TV
ipcMain.handle('loadYouTubeTV', () => {
  if (mainWindow) {
    mainWindow.setFullScreen(true)

    mainWindow.loadURL('https://www.youtube.com/tv?', {
      userAgent: youtubeTVUserAgent
    })

    mainWindow.webContents.once('did-finish-load', () => {
      mainWindow.setFullScreen(true)

      mainWindow.webContents.enableDeviceEmulation({
        screenSize: { width: 3840, height: 2160 },
        viewSize: { width: 1920, height: 1080 },
        scale: 1,
        screenPosition: 'desktop',
        deviceScaleFactor: 1
      })

      setTimeout(() => {
        mainWindow.webContents.executeJavaScript(youtubeTVOverlay)
      }, 1000)
    })
  }
})

// Handler untuk kembali ke Home
ipcMain.handle('loadHome', () => {
  if (mainWindow) {
    mainWindow.webContents.disableDeviceEmulation()
    mainWindow.setFullScreen(true)
    mainWindow.setBounds({ x: 0, y: 0, width: 1920, height: 1080 }) // Sesuaikan dengan resolusi monitor kamu
    mainWindow.loadFile('public/index.html')
  }
})

ipcMain.handle('injectYoutubeSearch', async (_, keyword) => {
  if (mainWindow) {
    const script = `
      (function() {
        console.log('Injecting search');
        const trySearch = setInterval(() => {
          const buttons = document.querySelectorAll('button');
          const searchButton = Array.from(buttons).find(btn => btn.getAttribute('aria-label') === 'Search');

          if (searchButton) {
            searchButton.click();
            clearInterval(trySearch);

            setTimeout(() => {
              const inputs = document.querySelectorAll('input');
              const input = Array.from(inputs).find(inp => inp.type === 'text');

              if (input) {
                const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
                nativeInputValueSetter.call(input, "${keyword.replace(/"/g, '\\"')}");

                input.dispatchEvent(new Event('input', { bubbles: true }));

                const enterEvent = new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', bubbles: true });
                input.dispatchEvent(enterEvent);
              } else {
                console.log('Input not found');
              }
            }, 1000);
          } else {
            console.log('Search button not found');
          }
        }, 1000);
      })();
    `
    mainWindow.webContents.executeJavaScript(script)
  }
})

// Handler untuk set/get volume sistem (output)
ipcMain.handle('set-system-volume', async (_, value) => {
  speaker.set(Math.round(value * 100))
})

ipcMain.handle('get-system-volume', async () => {
  return speaker.get() / 100
})

// Handler untuk set/get volume mic (input)
ipcMain.handle('set-mic-volume', async (_, value) => {
  microphone.set(Math.round(value * 100))
})

ipcMain.handle('get-mic-volume', async () => {
  console.log(microphone.get())
  return microphone.get() / 100
})

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

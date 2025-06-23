import initSqlJs from 'sql.js'

class Util {
  static SQL = null

  static async initSql() {
    if (!this.SQL) {
      this.SQL = await initSqlJs({
        locateFile: (file) => `https://sql.js.org/dist/${file}`
      })
    }
    return this.SQL
  }

  static async getDb() {
    const SQL = await this.initSql()

    try {
      // Check if running in Electron
      if (window.electronAPI) {
        const dbData = await window.electronAPI.getDbData()

        if (dbData) {
          return new SQL.Database(new Uint8Array(dbData))
        } else {
          const newDb = this.createNewDatabase(SQL)
          await window.electronAPI.saveDb(newDb.export())
          return newDb
        }
      }

      // Fallback for non-Electron environment (browser)
      console.warn('Running without Electron - using in-memory database')
      return this.createNewDatabase(SQL)
    } catch (error) {
      console.error('Database initialization failed:', error)
      return this.createNewDatabase(SQL)
    }
  }

  static createNewDatabase(SQL) {
    const db = new SQL.Database()

    // Create songs table
    db.run(`
      CREATE TABLE IF NOT EXISTS songs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        artist TEXT,
        album TEXT,
        time TEXT,
        genre TEXT,
        release_date DATE,
        play_count INTEGER DEFAULT 0,
        time_input DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `)

    // Create playlist table
    db.run(`
      CREATE TABLE IF NOT EXISTS playlist (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        id_song INTEGER,
        title TEXT,
        artist TEXT,
        time TEXT,
        FOREIGN KEY(id_song) REFERENCES songs(id)
      );
    `)

    return db
  }

  static async saveDb(dbInstance) {
    if (window.electronAPI) {
      await window.electronAPI.saveDb(dbInstance.export())
    } else {
      console.warn('Cannot persist database - no Electron API available')
    }
  }

  static convertSqlJsResult(result) {
    if (!result || result.length === 0) return []
    const { columns, values } = result[0]
    return values.map((row) => Object.fromEntries(columns.map((col, i) => [col, row[i]])))
  }

  static getDbPath() {
    if (typeof app === 'undefined') {
      const lastpath = path.join(fileURLToPath(import.meta.url), '..', '..', config.dbName)
      console.log(lastpath)
      console.log(fileURLToPath(import.meta.url))

      console.log('dev')

      return lastpath
    }
    const storageFolder = config.storageFolder || 'storage'
    const lastpath = path.join(app.getPath('userData'), storageFolder, config.dbName)
    console.log(lastpath)
    console.log('prod')

    return lastpath
  }

  static async seedDb() {
    try {
      const allSongs = [
        {
          id: 1,
          title: 'Sorfcore',
          artist: 'The neighbourhood',
          img: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4',
          date: 'Nov 4, 2023',
          album: 'Hard to Imagine the Neighbourhood Ever Changing',
          time: '3:26',
          timeInput: '2023-11-04T14:30:00',
          viewCount: 234,
          genre: 'Indie',
          releaseDate: '2015-10-02'
        },
        {
          id: 2,
          title: 'Skyfall Beats',
          artist: 'nightmares',
          img: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca',
          date: 'Oct 26, 2023',
          album: 'nightmares',
          time: '2:45',
          timeInput: '2023-10-26T16:15:00',
          viewCount: 100,
          genre: 'Electronic',
          releaseDate: '2020-11-12'
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

      const db = await this.getDb()
      allSongs.forEach((song) => {
        db.run(
          `INSERT INTO songs (title, artist, album, time, genre, play_count, time_input, release_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
          [
            song.title,
            song.artist,
            song.album,
            song.time,
            song.genre,
            song.viewCount,
            song.timeInput.replace('T', ' '),
            song.releaseDate
          ]
        )
      })

      await this.saveDb(db)
    } catch (error) {
      console.error(error)
    }
  }

  static async truncateDb() {
    const db = await this.getDb()
    db.run(`DELETE FROM playlist;`)
    await this.saveDb(db)
  }
}

export default Util

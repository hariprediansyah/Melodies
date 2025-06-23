import React, { useEffect, useState } from 'react'
import initSqlJs from 'sql.js'
import Util from '../Util'

export default function Library({ onHome }) {
  const [recentlyAdded, setRecentlyAdded] = useState([])
  const [allSongs, setAllSongs] = useState([])

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    // await Util.seedDb()

    const dbInstance = await Util.getDb()
    const listSong = dbInstance.exec('SELECT * FROM songs')
    const recentlyAdded = dbInstance.exec('SELECT * FROM songs ORDER BY id DESC LIMIT 5')
    setAllSongs(Util.convertSqlJsResult(listSong))
    console.log(listSong)

    setRecentlyAdded(Util.convertSqlJsResult(recentlyAdded))
  }

  // Fungsi untuk menambah lagu ke playlist
  const handleAddToPlaylist = async (song) => {
    const dbInstance = await Util.getDb()
    dbInstance.run('INSERT INTO playlist (id_song, title, artist, time) VALUES (?, ?, ?, ?);', [
      song.id,
      song.title,
      song.artist,
      song.time
    ])
    Util.saveDb(dbInstance)
    alert(`Lagu '${song.title}' berhasil ditambahkan ke playlist!`)
  }

  return (
    <div className='px-8 py-6'>
      <button className='text-purple mb-4 flex items-center gap-2' onClick={onHome}>
        <span className='text-xl'>&#8592;</span> <span>Back to Home</span>
      </button>
      <h2 className='text-2xl font-semibold mb-4'>Recently Added</h2>
      <div className='grid grid-cols-5 gap-6'>
        {recentlyAdded.map((item, idx) => (
          <div key={idx} className='bg-[#23232b] rounded-lg p-2 flex-shrink-0'>
            <div className=' w-full bg-gray-700 rounded mb-2 overflow-hidden flex items-center justify-center'>
              <img src={Util.imageCover(item.id)} alt={item.title} className='object-cover w-full h-full' />
            </div>
            <div className='text-white font-semibold text-base truncate'>{item.title}</div>
            <div className='text-gray-400 text-sm truncate'>{item.artist}</div>
          </div>
        ))}
      </div>
      <h2 className='text-2xl font-semibold my-6'>
        All <span className='text-purple'>Songs</span>
      </h2>
      <div className='overflow-x-auto'>
        <table className='min-w-full text-left'>
          <thead>
            <tr>
              <th className='py-2 font-normal'>#</th>
              <th className='py-2 font-normal'>Title</th>
              <th className='py-2 font-normal'>Release Date</th>
              <th className='py-2 font-normal'>album</th>
              <th className='py-2 font-normal'>Time</th>
              <th className='py-2 font-normal'></th>
            </tr>
          </thead>
          <tbody>
            {allSongs.map((song, idx) => (
              <tr key={idx} className='border-b border-[#23232b] hover:bg-[#23232b] transition py-3'>
                <td className='py-2 px-2 font-bold align-middle'>{idx + 1}</td>
                <td className='py-2 px-2 flex items-center gap-5 align-middle'>
                  <span className='w-12 h-12 bg-gray-700 rounded overflow-hidden flex items-center justify-center'>
                    <img src={Util.imageCover(song.id)} alt={song.title} className='object-cover w-full h-full' />
                  </span>
                  <div>
                    <div className='font-semibold'>{song.title}</div>
                    <div className='text-xs text-gray-400'>{song.artist}</div>
                  </div>
                </td>
                <td className='py-2 px-2 align-middle'>
                  {new Date(song.release_date).toLocaleString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </td>
                <td className='py-2 px-2 align-middle'>{song.album}</td>
                <td className='py-2 px-2 align-middle'>{song.time}</td>
                <td className='py-2 px-2 align-middle'>
                  <span
                    className='text-purple cursor-pointer hover:underline'
                    onClick={() => handleAddToPlaylist(song)}>
                    Add to your playlist
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

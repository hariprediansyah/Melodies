import React, { useEffect, useState, useRef } from 'react'
import initSqlJs from 'sql.js'
import Util from '../Util'
import { CoverImage, NotifStack } from '../Components'
import { useNotifStack } from '../Util'

export default function Library({ onHome }) {
  const [recentlyAdded, setRecentlyAdded] = useState([])
  const [allSongs, setAllSongs] = useState([])
  const [playlist, setPlaylist] = useState([])
  const notif = useNotifStack()

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    const songs = await window.electronAPI.getData('songs')
    const playlistData = await window.electronAPI.getPlaylist()
    setAllSongs(songs)
    setPlaylist(playlistData)
    const playlistIds = playlistData.map((song) => song.id)
    const recentlyAdded = songs
      .filter((song) => !playlistIds.includes(song.id))
      .sort((a, b) => new Date(b.created_at || b.timeInput) - new Date(a.created_at || a.timeInput))
      .slice(0, 5)
    setRecentlyAdded(recentlyAdded)
  }

  // Fungsi untuk menambah lagu ke playlist
  const handleAddToPlaylist = async (song) => {
    const alreadyInPlaylist = playlist.some((s) => s.id === song.id)
    if (alreadyInPlaylist) {
      notif.showNotif('Telah ditambahkan ke playlist', 'info')
    } else {
      await Util.addToPlaylist(song)
      notif.showNotif(`Lagu '${song.title}' berhasil ditambahkan ke playlist!`, 'success')
      setPlaylist((prev) => [...prev, song])
    }
  }

  return (
    <div className='px-8 py-6'>
      <button className='text-purple mb-4 flex items-center gap-2' onClick={onHome}>
        <span className='text-xl'>&#8592;</span> <span>Back to Home</span>
      </button>
      <h2 className='text-2xl font-semibold mb-4'>Recently Added</h2>
      <div className='grid grid-cols-5 gap-6'>
        {recentlyAdded.map((item, idx) => (
          <div key={idx} className='bg-[#23232b] rounded-xl p-2 flex-shrink-0 group'>
            <div className='w-full bg-gray-700 rounded-xl mb-2 overflow-hidden flex items-center justify-center h-40 relative'>
              <CoverImage id={item.id} title={item.title} />
              <div
                className='absolute inset-0 flex flex-col items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer'
                onClick={() => handleAddToPlaylist(item)}>
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  className='w-10 h-10 mb-2 text-white'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                  strokeWidth='2'>
                  <path strokeLinecap='round' strokeLinejoin='round' d='M12 4v16m8-8H4' />
                </svg>
                <span className='text-white font-bold text-lg'>Add to Playlist</span>
              </div>
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
                    <CoverImage id={song.id} title={song.title} />
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
      {/* Notifikasi Popup */}
      <NotifStack notifs={notif.notifs} onClose={notif.onClose} />
    </div>
  )
}

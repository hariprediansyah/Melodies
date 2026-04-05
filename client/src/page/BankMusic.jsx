import React, { useState, useEffect } from 'react'
import { ArrowLeft, Music, Plus } from 'lucide-react'
import { useNotifStack } from '../Util'
import { CoverImage, NotifStack } from '../Components'

export default function BankMusic({ onBack, searchQuery }) {
  const [allSongs, setAllSongs] = useState([])
  const notif = useNotifStack()

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    const songs = await window.electronAPI.getData('songs')
    setAllSongs(songs)
  }

  const filteredSongs = allSongs.filter((song) => song.title.toLowerCase().includes(searchQuery.toLowerCase()))
  const recentlyAdded = filteredSongs
    .sort((a, b) => new Date(b.created_at || b.timeInput) - new Date(a.created_at || a.timeInput))
    .slice(0, 5)
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
    <div className='row-span-14 grid grid-rows-20 px-8 py-6 gap-4'>
      <button className='row-span-1 text-[#B1C953] mb-4 flex items-center gap-2' onClick={onBack}>
        <span className='text-2xl'>&#8592;</span> <span>Back to Home</span>
      </button>
      <h2 className='row-span-1 text-2xl font-semibold mb-4'>Recently Added</h2>
      <div className='row-span-5 grid grid-cols-5 gap-6'>
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
      <h2 className='row-span-1 text-2xl font-semibold py-6 flex items-center'>
        All <span className='text-[#B1C953]'>Songs</span>
      </h2>
      <div className='row-span-12 overflow-auto'>
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
            {filteredSongs.map((song, idx) => (
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
                    className='text-[#B1C953] cursor-pointer hover:underline'
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

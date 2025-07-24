import React, { useState, useEffect } from 'react'
import { ArrowLeft, Music, Plus } from 'lucide-react'

export default function BankMusic({ onBack }) {
  const [songs, setSongs] = useState([])
  const [recentlyAdded, setRecentlyAdded] = useState([])

  useEffect(() => {
    window.electronAPI.getData('songs').then((allSongs) => {
      setSongs(allSongs)
      // Assuming songs are sorted by date added, otherwise we need a timestamp
      setRecentlyAdded(allSongs.slice(0, 5))
    })
  }, [])

  const handleAddToPlaylist = (song) => {
    window.electronAPI.sendToMain('add-to-playlist', song)
  }

  return (
    <div className='p-8 text-white h-full overflow-y-auto'>
      <button onClick={onBack} className='flex items-center gap-2 mb-6 text-green-400 font-bold'>
        <ArrowLeft size={20} />
        Back to Home
      </button>

      <h2 className='text-2xl font-bold mb-4'>Recently Added</h2>
      <div className='grid grid-cols-5 gap-4 mb-8'>
        {recentlyAdded.map((song) => (
          <div key={song.id} className='bg-neutral-800 p-4 rounded-lg'>
            <img
              src={song.cover_image_url || './default_cover.jpg'}
              alt={song.title}
              className='w-full h-40 object-cover rounded-md mb-2'
            />
            <h3 className='font-bold truncate'>{song.title}</h3>
            <p className='text-sm text-gray-400 truncate'>{song.artist}</p>
          </div>
        ))}
      </div>

      <h2 className='text-2xl font-bold mb-4 flex items-center gap-2'>
        <Music /> All Songs
      </h2>
      <div className='bg-black bg-opacity-20 rounded-lg'>
        <table className='w-full text-left'>
          <thead className='text-gray-400 border-b border-gray-700'>
            <tr>
              <th className='p-4 w-12'>#</th>
              <th className='p-4'>Title</th>
              <th className='p-4'>Album</th>
              <th className='p-4'>Time</th>
              <th className='p-4'></th>
            </tr>
          </thead>
          <tbody>
            {songs.map((song, index) => (
              <tr key={song.id} className='border-b border-gray-800 hover:bg-gray-800'>
                <td className='p-4'>{index + 1}</td>
                <td className='p-4'>
                  <div className='flex items-center gap-4'>
                    <img
                      src={song.cover_image_url || './default_cover_bc.jpg'}
                      alt={song.title}
                      className='w-12 h-12 object-cover rounded'
                    />
                    <div>
                      <div className='font-bold'>{song.title}</div>
                      <div className='text-sm text-gray-400'>{song.artist}</div>
                    </div>
                  </div>
                </td>
                <td className='p-4 text-gray-400'>{song.album || 'Single'}</td>
                <td className='p-4 text-gray-400'>{song.duration || 'N/A'}</td>
                <td className='p-4'>
                  <button
                    onClick={() => handleAddToPlaylist(song)}
                    className='text-green-400 hover:text-green-300 flex items-center gap-1'>
                    <Plus size={16} /> Add to your playlist
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

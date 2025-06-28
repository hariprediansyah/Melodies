import { PhoneForwarded, Volume2 } from 'lucide-react'
import React, { useState, useEffect, useRef } from 'react'
import Util from '../Util'

export default function Navbar({
  onLibrary,
  onHome,
  onPlaylist,
  isLibrary,
  isPlaylist,
  onSearch,
  search,
  setSearch,
  masterVolume,
  setMasterVolume,
  musicVolume,
  setMusicVolume,
  micVolume,
  setMicVolume
}) {
  const [results, setResults] = useState([])
  const [showResults, setShowResults] = useState(false)
  const [loading, setLoading] = useState(false)
  const [notFound, setNotFound] = useState('')
  const [coverMap, setCoverMap] = useState({})
  const [showVolume, setShowVolume] = useState(false)

  const handleSearch = async (e) => {
    const value = e.target.value
    setSearch(value)
    if (onSearch && value.trim().length > 0) {
      onSearch(value)
    } else {
      onHome()
    }
  }

  const handleOpenYoutube = () => {
    if (window.electronAPI.loadYouTubeTV) {
      window.electronAPI.loadYouTubeTV()
    }
  }

  return (
    <div className='relative'>
      <nav className='flex items-center justify-between py-10 bg-[#18181b] h-full'>
        <span
          className='text-4xl font-bold bg-gradient-to-r from-fuchsia-500 to-blue-400 bg-clip-text text-transparent cursor-pointer'
          onClick={onHome}>
          Melodies
        </span>
        <input
          type='text'
          value={search}
          onChange={handleSearch}
          placeholder='Search For Musics, Artists, ...'
          className='w-1/3 px-4 py-2 rounded bg-[#23232b] text-white outline-none'
        />
        <div className='flex items-center gap-4'>
          <div className='bg-[#1F1F1F] rounded-lg p-2 cursor-pointer' onClick={() => setShowVolume((v) => !v)}>
            <Volume2 />
          </div>
          <div className='bg-[#1F1F1F] rounded-lg p-2 cursor-pointer'>
            <PhoneForwarded />
          </div>

          <span className='flex items-center gap-2'>
            <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <circle cx='12' cy='12' r='10' strokeWidth='2' />
              <path d='M9 12l2 2 4-4' strokeWidth='2' />
            </svg>{' '}
            Room 1
          </span>
        </div>
      </nav>
      {showResults && (
        <div className='absolute left-1/2 -translate-x-1/2 w-1/3 bg-[#23232b] rounded-lg shadow-lg mt-2 z-50 p-4'>
          {loading ? (
            <div className='text-center text-white'>Mencari...</div>
          ) : results.length > 0 ? (
            <ul className='grid grid-cols-1 gap-3'>
              {results.map((song, idx) => (
                <li key={idx} className='flex items-center gap-4 p-2 rounded hover:bg-[#18181b] transition'>
                  <img
                    src={coverMap[song.id] || 'default_cover.jpg'}
                    alt={song.title}
                    className='w-14 h-14 object-cover rounded-lg'
                  />
                  <div>
                    <div className='font-semibold text-white'>{song.title}</div>
                    <div className='text-sm text-gray-400'>
                      {song.artist} &ndash; {song.album}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : notFound ? (
            <div className='text-center text-white'>
              Tidak ada yang cocok untuk <b>{notFound}</b>
              <div className='mt-4'>
                <button
                  className='px-4 py-2 bg-red-600 hover:bg-red-700 rounded text-white font-semibold'
                  onClick={handleOpenYoutube}>
                  Buka dengan YouTube
                </button>
              </div>
            </div>
          ) : null}
        </div>
      )}
      {showVolume && (
        <div className='absolute right-24 top-20 bg-[#23232b] border border-[#444] rounded-lg shadow-lg text-white w-80 p-4 z-50'>
          <p className='font-semibold text-lg mb-2'>Atur Volume</p>
          <div className='mb-4'>
            <label className='block text-sm mb-1'>Master Volume</label>
            <input
              type='range'
              min={0}
              max={1}
              step={0.01}
              value={masterVolume}
              onChange={(e) => setMasterVolume(Number(e.target.value))}
              className='w-full accent-fuchsia-500'
            />
            <span className='float-right text-sm'>{Math.round(masterVolume * 100)}%</span>
          </div>
          <div className='mb-4'>
            <label className='block text-sm mb-1'>Music Volume</label>
            <input
              type='range'
              min={0}
              max={1}
              step={0.01}
              value={musicVolume}
              onChange={(e) => setMusicVolume(Number(e.target.value))}
              className='w-full accent-fuchsia-500'
            />
            <span className='float-right text-sm'>{Math.round(musicVolume * 100)}%</span>
          </div>
          <div>
            <label className='block text-sm mb-1'>Mic Volume</label>
            <input
              type='range'
              min={0}
              max={1}
              step={0.01}
              value={micVolume}
              onChange={(e) => setMicVolume(Number(e.target.value))}
              className='w-full accent-fuchsia-500'
            />
            <span className='float-right text-sm'>{Math.round(micVolume * 100)}%</span>
          </div>
        </div>
      )}
    </div>
  )
}

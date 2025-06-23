import React, { useState, useEffect, useRef } from 'react'

export default function Navbar({ onLibrary, onHome, onPlaylist, isLibrary, isPlaylist }) {
  return (
    <nav className='flex items-center justify-between py-10 bg-[#18181b] h-full'>
      <span
        className='text-4xl font-bold bg-gradient-to-r from-fuchsia-500 to-blue-400 bg-clip-text text-transparent cursor-pointer'
        onClick={onHome}>
        Melodies
      </span>
      <input
        type='text'
        placeholder='Search For Musics, Artists, ...'
        className='w-1/3 px-4 py-2 rounded bg-[#23232b] text-white outline-none'
      />
      <div className='flex items-center gap-4'>
        <button
          className={`px-4 py-2 rounded ${isPlaylist ? 'bg-purple-700' : 'bg-gray-700'} text-white`}
          onClick={onPlaylist}>
          My Playlist
        </button>
        <span className='flex items-center gap-2'>
          <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
            <circle cx='12' cy='12' r='10' strokeWidth='2' />
            <path d='M9 12l2 2 4-4' strokeWidth='2' />
          </svg>{' '}
          Room 1
        </span>
      </div>
    </nav>
  )
}

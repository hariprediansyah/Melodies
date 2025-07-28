import React from 'react'

import { useEffect, useRef, useState } from 'react'
import MarqueeText from './MarqueeText'
import SongRow from './SongRow'

const SongList = ({ handleAddToPlaylist, songs, onSelectSong, selectedSong, isYoutubeMode }) => {
  return isYoutubeMode ? (
    <div className='grid grid-rows-12 bg-black bg-opacity-50 border border-white/10 p-6 rounded-lg h-full text-white text-lg'>
      <div className='row-span-1 grid grid-cols-3 text-gray-400 font-bold mb-4 px-2'>
        <div className='col-span-2'>Song Title</div>
        <div>Singer</div>
      </div>
      <div className='row-span-11 space-y-2 overflow-y-auto'>
        {songs.map((song, index) => (
          <SongRow
            key={index}
            song={song}
            isSelected={selectedSong?.id === song.id}
            onSelectSong={onSelectSong}
            handleAddToPlaylist={handleAddToPlaylist}
            isYoutubeMode={isYoutubeMode}
          />
        ))}
      </div>
    </div>
  ) : (
    <div className='row-span-7 grid grid-rows-12 bg-black bg-opacity-50 border border-white/10 p-6 rounded-lg h-full text-white text-xl'>
      <div className='row-span-1 grid grid-cols-3 text-gray-400 font-bold mb-4 px-2'>
        <div className='col-span-2'>Song Title</div>
        <div>Singer</div>
      </div>
      <div className='row-span-11 space-y-2 overflow-y-auto'>
        {songs.map((song, index) => (
          <SongRow
            key={index}
            song={song}
            isSelected={selectedSong?.id === song.id}
            onSelectSong={onSelectSong}
            handleAddToPlaylist={handleAddToPlaylist}
            isYoutubeMode={isYoutubeMode}
          />
        ))}
      </div>
    </div>
  )
}

export default SongList

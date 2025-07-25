import React from 'react'

const SongList = ({ songs, onSelectSong, selectedSong, isYoutubeMode }) => {
  return isYoutubeMode ? (
    <div className='bg-black bg-opacity-50 border border-white/10 p-6 rounded-lg h-full text-white'>
      <div className='grid grid-cols-2 text-gray-400 font-bold mb-4 px-2'>
        <div>Song Title</div>
        <div>Singer</div>
      </div>
      <div className='space-y-2 overflow-y-auto h-[calc(100%-2rem)]'>
        {songs.map((song, index) => {
          const isSelected = selectedSong && selectedSong.id === song.id
          return (
            <div
              key={index}
              className={`grid grid-cols-2 p-2 rounded-md cursor-pointer transition-all ${
                isSelected ? 'bg-brand-green-light text-black' : 'hover:bg-white hover:bg-opacity-10'
              }`}
              onClick={() => onSelectSong(song)}>
              <div>{song.title}</div>
              <div>{song.singer || song.artist}</div>
            </div>
          )
        })}
      </div>
    </div>
  ) : (
    <div className='bg-black bg-opacity-50 border border-white/10 p-6 rounded-lg h-full text-white'>
      <div className='grid grid-cols-3 text-gray-400 font-bold mb-4 px-2'>
        <div>Song Title</div>
        <div>Singer</div>
        <div>Duration</div>
      </div>
      <div className='space-y-2 overflow-y-auto h-[calc(100%-2rem)]'>
        {songs.map((song, index) => {
          const isSelected = selectedSong && selectedSong.id === song.id
          return (
            <div
              key={index}
              className={`grid grid-cols-3 p-2 rounded-md cursor-pointer transition-all ${
                isSelected ? 'bg-brand-green-light text-black' : 'hover:bg-white hover:bg-opacity-10'
              }`}
              onClick={() => onSelectSong(song)}>
              <div>{song.title}</div>
              <div>{song.singer || song.artist}</div>
              <div>{song.duration}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default SongList

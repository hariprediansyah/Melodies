import React from 'react'
import { useState } from 'react'
import MarqueeText from './MarqueeText'

const SongRow = ({ song, isSelected, onSelectSong, handleAddToPlaylist, isYoutubeMode }) => {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div
      onDoubleClick={() => handleAddToPlaylist(song)}
      tabIndex={0}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          handleAddToPlaylist(song)
        }
      }}
      className={`grid ${isYoutubeMode ? 'grid-cols-2' : 'grid-cols-3'} p-2 rounded-md cursor-pointer transition-all ${
        isSelected ? 'bg-brand-green-light text-black' : 'hover:bg-white hover:bg-opacity-10'
      }`}
      onClick={() => onSelectSong(song)}>
      <MarqueeText text={song.title} isActive={isSelected || isHovered} />
      <div className='truncate'>{song.singer || song.artist}</div>
      {!isYoutubeMode && <div className='truncate'>{song.duration}</div>}
    </div>
  )
}

export default SongRow

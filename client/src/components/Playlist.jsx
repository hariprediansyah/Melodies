import React, { forwardRef } from 'react'
import { Play } from 'lucide-react'

const Playlist = forwardRef(({ playlist, onSelectSong, selectedSong, onPlaySong, currentSong }, ref) => {
  return (
    <div className='row-span-9 grid grid-rows-12 bg-black bg-opacity-50 border border-white/10 p-6 rounded-lg h-full text-white'>
      <h2 className='row-span-1 text-2xl font-bold mb-4'>Playlist ({playlist.length})</h2>
      <div ref={ref} className='row-span-11 space-y-2 overflow-y-scroll'>
        {playlist.length === 0 ? (
          <p className='text-gray-400 text-center mt-8'>Playlist is empty</p>
        ) : (
          playlist.map((song, index) => {
            const isPlaying = currentSong && currentSong.id == song.id
            const isSelected = selectedSong && selectedSong.id == song.id
            return (
              <div
                key={index}
                className={`p-2 rounded-md flex text-xl justify-between items-center group transition-all cursor-pointer 
                  ${isPlaying ? 'bg-brand-green text-black' : ''}
                  ${isSelected && !isPlaying ? 'bg-brand-green-light text-black' : ''}
                  ${!isSelected && !isPlaying ? 'bg-white bg-opacity-5 hover:bg-opacity-10' : ''}
                `}
                onClick={() => onSelectSong(song)}
                onDoubleClick={() => onPlaySong(song)}>
                <span className='font-semibold'>
                  {song.title} - {song.artist}
                </span>
                <div className='flex items-center gap-2'>{isPlaying && <Play size={18} className='text-black' />}</div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
})

export default Playlist

import React, { useState, useEffect } from 'react'
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX } from 'lucide-react'

const PlayerControls = ({ isPlaying, onPlayPause, onNext, onPrev, currentSong }) => {
  const [vocalOn, setVocalOn] = useState(true)
  const [volume, setVolume] = useState(0.9)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)

  useEffect(() => {
    window.electronAPI.sendVideoControl({ type: 'VOLUME', level: volume })
  }, [volume])

  useEffect(() => {
    const handleTimeUpdate = (timeData) => {
      setCurrentTime(timeData.currentTime)
      setDuration(timeData.duration)
    }
    window.electronAPI.onVideoTimeUpdate(handleTimeUpdate)
    // Cleanup
    return () => {
      // This is tricky in Electron's context, as 'removeListener' isn't directly exposed.
      // This setup assumes the listener is overwritten or managed by the preload script's lifecycle.
    }
  }, [])

  const formatTime = (seconds) => {
    if (isNaN(seconds) || seconds === 0) return '0:00'
    const floorSeconds = Math.floor(seconds)
    const min = Math.floor(floorSeconds / 60)
    const sec = floorSeconds % 60
    return `${min}:${sec < 10 ? '0' : ''}${sec}`
  }

  const handleVocalToggle = () => {
    const newVocalState = !vocalOn
    setVocalOn(newVocalState)
    window.electronAPI.sendVideoControl({ type: 'VOCAL', mode: newVocalState ? 'on' : 'off' })
  }

  return (
    <div className='bg-black bg-opacity-50 border border-white/10 p-4 rounded-lg mt-4 flex items-center justify-between text-white'>
      <div className='flex items-center gap-4'>
        <button onClick={onPrev} className='hover:text-brand-green-light transition-colors'>
          <SkipBack />
        </button>
        <button onClick={onPlayPause} className='bg-brand-green hover:bg-brand-green-light rounded-full p-3'>
          {isPlaying ? <Pause size={28} /> : <Play size={28} />}
        </button>
        <button onClick={onNext} className='hover:text-brand-green-light transition-colors'>
          <SkipForward />
        </button>
      </div>

      <div className='text-lg font-semibold'>
        <span>
          {formatTime(currentTime)} / {formatTime(duration)}
        </span>
      </div>

      <div className='flex items-center gap-4'>
        <span>Vocal</span>
        <div
          onClick={handleVocalToggle}
          className={`w-14 h-7 rounded-full flex items-center cursor-pointer transition-colors ${
            vocalOn ? 'bg-brand-green' : 'bg-gray-600'
          }`}>
          <span
            className={`w-6 h-6 bg-white rounded-full transition-transform transform ${
              vocalOn ? 'translate-x-7' : 'translate-x-1'
            }`}
          />
        </div>
        <button className='hover:text-brand-green-light transition-colors'>
          <Volume2 />
        </button>
        <input
          type='range'
          min='0'
          max='1'
          step='0.01'
          value={volume}
          onChange={(e) => setVolume(parseFloat(e.target.value))}
          className='w-24'
        />
      </div>
    </div>
  )
}

export default PlayerControls

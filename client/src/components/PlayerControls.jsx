import React, { useState, useEffect } from 'react'
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, MicVocal } from 'lucide-react'

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
    console.log(currentSong)

    const newVocalState = !vocalOn
    setVocalOn(newVocalState)
    window.electronAPI.sendVideoControl({
      type: 'VOCAL',
      mode: newVocalState ? 'on' : 'off',
      vocal: currentSong.vocal || 'left'
    })
  }

  return (
    <div className='row-span-2 bg-black bg-opacity-50 border border-white/10 p-2'>
      <div className='flex items-center justify-between text-white gap-2'>
        <input
          type='range'
          min={0}
          max={duration}
          value={currentTime}
          className='w-full bg-transparent focus:outline-none accent-[#b1c953]'
          onChange={(e) => {
            setCurrentTime(parseFloat(e.target.value))
            window.electronAPI.sendVideoControl({ type: 'SEEK', time: e.target.value })
          }}
        />
        <div className='text-xl font-semibold flex gap-2 items-center'>
          <p className='text-[#b1c953]'>{formatTime(currentTime)}</p> <p className='mx-2'>/</p>{' '}
          <p>{formatTime(duration)}</p>
        </div>
      </div>
      <div className='row-span-2 grid grid-cols-5 items-center text-white'>
        {/* Kontrol tombol di tengah */}
        <div className='col-span-3 flex items-center justify-center gap-4'>
          <button onClick={onPrev} className='hover:text-brand-green-light transition-colors'>
            <SkipBack />
          </button>
          <button onClick={onPlayPause} className='bg-brand-green hover:bg-brand-green-light rounded-full p-2 gap-1'>
            {isPlaying ? <Pause size={22} /> : <Play size={22} />}
          </button>
          <button onClick={onNext} className='hover:text-brand-green-light transition-colors'>
            <SkipForward />
          </button>
        </div>

        {/* Vocal dan volume di kanan */}
        <div className='col-span-2 flex items-center justify-end gap-4'>
          <span>
            <MicVocal />
          </span>
          <div
            onClick={handleVocalToggle}
            className={`w-10 h-4 rounded-full flex items-center cursor-pointer transition-colors ${
              vocalOn ? 'bg-[#b1c953]' : 'bg-gray-600'
            }`}>
            <span
              className={`w-4 h-4 bg-white rounded-full transition-transform transform ${
                vocalOn ? 'translate-x-7' : 'translate-x-1'
              }`}
            />
          </div>
          <div className='transition-colors'>
            <Volume2 />
          </div>
          <input
            type='range'
            min='0'
            max='1'
            step='0.01'
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className='w-24 accent-[#b1c953]'
          />
        </div>
      </div>
    </div>
  )
}

export default PlayerControls

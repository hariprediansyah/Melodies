import React, { useEffect, useRef, useState } from 'react'
import Util from '../Util'
import { Fullscreen, Pause, Play, SlidersHorizontal, Volume2 } from 'lucide-react'

export default function VideoComponent({ id, onEnded, volume = 1, micVolume = 1 }) {
  const videoRef = useRef(null)
  const containerRef = useRef(null)
  const [videoSrc, setVideoSrc] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [showControls, setShowControls] = useState(true)

  const [showEqualizer, setShowEqualizer] = useState(false)
  const [bassGain, setBassGain] = useState(0)
  const [midGain, setMidGain] = useState(0)
  const [trebleGain, setTrebleGain] = useState(0)

  const audioContextRef = useRef(null)
  const filtersRef = useRef([])
  const micStreamRef = useRef(null)
  const micGainRef = useRef(null)

  useEffect(() => {
    let isMounted = true
    setVideoSrc(null)
    setIsPlaying(false)

    Util.getVideoPath(id).then((path) => {
      if (isMounted) setVideoSrc(path)
    })

    return () => {
      isMounted = false
    }
  }, [id])

  useEffect(() => {
    if (!videoRef.current || !videoSrc) return

    if (audioContextRef.current) {
      // Cek apakah context belum ditutup
      if (audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch((err) => {
          console.warn('Failed to close audio context:', err)
        })
      }
    }

    const audioContext = new (window.AudioContext || window.webkitAudioContext)()
    audioContextRef.current = audioContext

    const source = audioContext.createMediaElementSource(videoRef.current)

    const bass = audioContext.createBiquadFilter()
    bass.type = 'lowshelf'
    bass.frequency.value = 200
    bass.gain.value = bassGain

    const mid = audioContext.createBiquadFilter()
    mid.type = 'peaking'
    mid.frequency.value = 1000
    mid.Q.value = 1
    mid.gain.value = midGain

    const treble = audioContext.createBiquadFilter()
    treble.type = 'highshelf'
    treble.frequency.value = 3000
    treble.gain.value = trebleGain

    source.connect(bass)
    bass.connect(mid)
    mid.connect(treble)
    treble.connect(audioContext.destination)

    filtersRef.current = [bass, mid, treble]

    return () => {
      try {
        source.disconnect()
        bass.disconnect()
        mid.disconnect()
        treble.disconnect()
      } catch (err) {
        console.warn('Disconnect error:', err)
      }

      if (audioContext && audioContext.state !== 'closed') {
        audioContext.close().catch((err) => {
          console.warn('Failed to close audio context on cleanup:', err)
        })
      }
    }
  }, [videoSrc])

  useEffect(() => {
    const [bass, mid, treble] = filtersRef.current
    if (bass) bass.gain.value = bassGain
    if (mid) mid.gain.value = midGain
    if (treble) treble.gain.value = trebleGain
  }, [bassGain, midGain, trebleGain])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const onTimeUpdate = () => setCurrentTime(video.currentTime)
    const onLoaded = () => setDuration(video.duration)

    video.addEventListener('timeupdate', onTimeUpdate)
    video.addEventListener('loadedmetadata', onLoaded)

    return () => {
      video.removeEventListener('timeupdate', onTimeUpdate)
      video.removeEventListener('loadedmetadata', onLoaded)
    }
  }, [videoSrc])

  const handlePlayPause = () => {
    const video = videoRef.current
    if (!video) return

    if (isPlaying) {
      video.pause()
      setIsPlaying(false)
    } else {
      video.play()
      setIsPlaying(true)
    }
  }

  const handleSeek = (e) => {
    const video = videoRef.current
    if (!video) return

    const newTime = parseFloat(e.target.value)
    video.currentTime = newTime
    setCurrentTime(newTime)
  }

  const handleVolumeChange = (e) => {
    const vol = parseFloat(e.target.value)
    videoRef.current.volume = vol
  }

  const toggleFullscreen = () => {
    if (!containerRef.current) return
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch((err) => {
        console.error('Error attempting to enable full-screen mode:', err)
      })
    } else {
      document.exitFullscreen()
    }
  }

  const formatTime = (t) => {
    const mins = Math.floor(t / 60)
    const secs = Math.floor(t % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // === Floating Controls Auto-hide ===
  useEffect(() => {
    let timeout
    const showControlsTemporarily = () => {
      setShowControls(true)
      clearTimeout(timeout)
      timeout = setTimeout(() => {
        setShowControls(false)
      }, 3000)
    }

    const container = containerRef.current
    if (!container) return

    container.addEventListener('mousemove', showControlsTemporarily)
    return () => {
      container.removeEventListener('mousemove', showControlsTemporarily)
      clearTimeout(timeout)
    }
  }, [])

  // Sinkronisasi volume dari props
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = volume
    }
  }, [volume, videoSrc])

  // Play mic audio ke audioContext saat video play
  useEffect(() => {
    if (!isPlaying || !audioContextRef.current) {
      // Stop mic jika video pause
      if (micStreamRef.current) {
        micStreamRef.current.getTracks().forEach((track) => track.stop())
        micStreamRef.current = null
      }
      return
    }
    let cancelled = false
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        if (cancelled) return
        micStreamRef.current = stream
        const ctx = audioContextRef.current
        const micSource = ctx.createMediaStreamSource(stream)
        const micGain = ctx.createGain()
        micGain.gain.value = micVolume
        micGainRef.current = micGain
        micSource.connect(micGain).connect(ctx.destination)
      })
      .catch((err) => {
        console.warn('Mic error:', err)
      })
    return () => {
      cancelled = true
      if (micStreamRef.current) {
        micStreamRef.current.getTracks().forEach((track) => track.stop())
        micStreamRef.current = null
      }
      if (micGainRef.current) {
        try {
          micGainRef.current.disconnect()
        } catch {}
        micGainRef.current = null
      }
    }
  }, [isPlaying, audioContextRef.current, micVolume])

  // Update gain mic jika micVolume berubah
  useEffect(() => {
    if (micGainRef.current) {
      micGainRef.current.gain.value = micVolume
    }
  }, [micVolume])

  return (
    <div ref={containerRef} className='w-full h-full bg-black rounded-lg relative overflow-hidden group'>
      <video
        ref={videoRef}
        key={videoSrc}
        src={videoSrc || null}
        className='w-full h-full object-cover'
        onEnded={() => {
          setIsPlaying(false)
          if (onEnded) onEnded()
        }}
      />

      {/* Controls */}
      <div
        className={`absolute bottom-0 left-0 w-full px-4 py-3 transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0'
        } bg-black/60 backdrop-blur-sm text-white flex flex-col gap-2`}>
        <div className='flex justify-between items-center'>
          <div className='flex gap-2 items-center'>
            <button onClick={handlePlayPause} className='bg-purple-600 hover:bg-purple-700 p-2 rounded-full'>
              {isPlaying ? <Pause size={20} /> : <Play size={20} />}
            </button>
            <span className='text-sm w-24'>
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          <div className='flex gap-2 items-center'>
            <button
              onClick={() => setShowEqualizer((prev) => !prev)}
              className='bg-gray-700 hover:bg-gray-600 p-2 rounded-full'>
              <SlidersHorizontal size={18} />
            </button>
            <button onClick={toggleFullscreen} className='p-2 rounded-full bg-gray-700 hover:bg-gray-600'>
              <Fullscreen size={18} />
            </button>
          </div>
        </div>

        <input
          type='range'
          min={0}
          max={duration || 1}
          step={0.1}
          value={currentTime}
          onChange={handleSeek}
          className='w-full accent-purple'
        />
      </div>

      {/* Equalizer */}
      {showEqualizer && (
        <div className='absolute right-4 bottom-28 bg-[#2a2a2a] border border-[#444] rounded-lg shadow-lg text-white w-64 p-4 z-50'>
          <p className='font-semibold text-lg mb-2'>Equalizer</p>
          {[
            ['Bass', bassGain, setBassGain],
            ['Mid', midGain, setMidGain],
            ['Treble', trebleGain, setTrebleGain]
          ].map(([label, val, setter], i) => (
            <div key={i} className='mb-3'>
              <label className='block text-sm mb-1'>
                {label}: {val}dB
              </label>
              <input
                type='range'
                min={-40}
                max={40}
                value={val}
                onChange={(e) => setter(Number(e.target.value))}
                className='w-full accent-purple'
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

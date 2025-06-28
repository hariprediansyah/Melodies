import React, { useState, useEffect } from 'react'
import Home from './page/Home'
import Library from './page/Library'
import MyPlaylist from './page/MyPlaylist'
import Navbar from './components/Navbar'
import EmbedYoutube from './page/EmbedYoutube'
import SearchResult from './page/SearchResult'

function MicPlayer({ micVolume }) {
  const micStreamRef = React.useRef(null)
  const micGainRef = React.useRef(null)
  const audioContextRef = React.useRef(null)

  useEffect(() => {
    let cancelled = false
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    audioContextRef.current = ctx
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        if (cancelled) return
        micStreamRef.current = stream
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
      if (audioContextRef.current) {
        try {
          audioContextRef.current.close()
        } catch {}
        audioContextRef.current = null
      }
    }
  }, [])
  useEffect(() => {
    if (micGainRef.current) {
      micGainRef.current.gain.value = micVolume
    }
  }, [micVolume])
  return null
}

export default function App() {
  const [page, setPage] = useState('home')
  const [searchKeyword, setSearchKeyword] = useState('')
  const [masterVolume, setMasterVolume] = useState(0.9)
  const [musicVolume, setMusicVolume] = useState(0.9)
  const [micVolume, setMicVolume] = useState(0.9)

  // Load setting dari localStorage dan sistem saat mount
  useEffect(() => {
    const saved = localStorage.getItem('melodies_volume_settings')
    if (saved) {
      try {
        const obj = JSON.parse(saved)
        if (typeof obj.music === 'number') setMusicVolume(obj.music)
      } catch {}
    }
    // Load master & mic dari sistem
    if (window.electronAPI?.getSystemVolume) {
      window.electronAPI.getSystemVolume().then((v) => {
        if (typeof v === 'number') setMasterVolume(v)
      })
    }
    if (window.electronAPI?.getMicVolume) {
      window.electronAPI.getMicVolume().then((v) => {
        if (typeof v === 'number') setMicVolume(v)
      })
    }
  }, [])

  // Simpan ke localStorage setiap ada perubahan
  useEffect(() => {
    localStorage.setItem(
      'melodies_volume_settings',
      JSON.stringify({
        master: masterVolume,
        music: musicVolume,
        mic: micVolume
      })
    )
  }, [masterVolume, musicVolume, micVolume])

  // Sinkron ke sistem setiap master/mic berubah
  useEffect(() => {
    if (window.electronAPI?.setSystemVolume) {
      window.electronAPI.setSystemVolume(masterVolume)
    }
  }, [masterVolume])
  useEffect(() => {
    if (window.electronAPI?.setMicVolume) {
      window.electronAPI.setMicVolume(micVolume)
    }
  }, [micVolume])

  const handleSearch = (keyword) => {
    if (!keyword.trim()) {
      setPage('home')
      setSearchKeyword('')
      return
    }
    setSearchKeyword(keyword)
    setPage('search')
  }

  const handleBackFromSearch = () => {
    setSearchKeyword('')
    setPage('home')
  }

  const handleOpenYoutube = () => {
    window.electronAPI.loadYouTubeTV && window.electronAPI.loadYouTubeTV()
    setTimeout(() => {
      window.electronAPI.injectYoutubeSearch && window.electronAPI.injectYoutubeSearch(searchKeyword)
    }, 1000)
  }

  return (
    <div className='h-screen bg-[#18181b] text-white grid grid-rows-12 px-8'>
      <MicPlayer micVolume={micVolume} />
      <div className='row-span-1'>
        <Navbar
          onLibrary={() => setPage('library')}
          onHome={() => {
            setPage('home')
            setSearchKeyword('')
          }}
          onPlaylist={() => setPage('playlist')}
          isLibrary={page === 'library'}
          isPlaylist={page === 'playlist'}
          search={searchKeyword}
          setSearch={setSearchKeyword}
          onSearch={handleSearch}
          masterVolume={masterVolume}
          setMasterVolume={setMasterVolume}
          musicVolume={musicVolume}
          setMusicVolume={setMusicVolume}
          micVolume={micVolume}
          setMicVolume={setMicVolume}
        />
      </div>
      <div className='row-span-11'>
        {page === 'home' ? (
          <Home
            onLibrary={() => setPage('library')}
            onPlaylist={() => setPage('playlist')}
            onYoutube={() => setPage('youtube')}
          />
        ) : page === 'library' ? (
          <Library onHome={() => setPage('home')} />
        ) : page === 'playlist' ? (
          <MyPlaylist
            onHome={() => setPage('home')}
            onLibrary={() => setPage('library')}
            masterVolume={masterVolume}
            musicVolume={musicVolume}
            micVolume={micVolume}
          />
        ) : page === 'search' ? (
          <SearchResult keyword={searchKeyword} onBack={handleBackFromSearch} onOpenYoutube={handleOpenYoutube} />
        ) : (
          <EmbedYoutube onHome={() => setPage('home')} />
        )}
      </div>
    </div>
  )
}

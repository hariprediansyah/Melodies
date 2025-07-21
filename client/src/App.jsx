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

function StandbySlideshow() {
  const [banners, setBanners] = useState([])
  const [idx, setIdx] = useState(0)
  const [prevIdx, setPrevIdx] = useState(0)
  const [fading, setFading] = useState(false)

  useEffect(() => {
    let isMounted = true
    window.electronAPI.getBannerImages().then((list) => {
      if (isMounted) setBanners(list)
    })
    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    if (banners.length === 0) return
    const interval = setInterval(() => {
      setPrevIdx(idx)
      setFading(true)
      setTimeout(() => {
        setIdx((i) => (i + 1) % banners.length)
        setFading(false)
      }, 500) // durasi fade
    }, 5000)
    return () => clearInterval(interval)
  }, [banners, idx])

  if (banners.length === 0) return <div>Loading banners...</div>
  return (
    <div className='fixed inset-0 flex items-center justify-center bg-black'>
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', width: '100vw', height: '100vh' }}>
        {/* Gambar baru */}
        <img
          src={banners[idx]}
          alt='Standby'
          className={`w-full h-full object-cover absolute transition-opacity duration-500 ${
            fading ? 'opacity-0' : 'opacity-100'
          }`}
          style={{ left: 0, top: 0 }}
        />
        {/* Gambar lama, hanya saat fading */}
        {fading && (
          <img
            src={banners[prevIdx]}
            alt='Standby-prev'
            className='w-full h-full object-cover absolute transition-opacity duration-500 opacity-100'
            style={{ left: 0, top: 0 }}
          />
        )}
      </div>
    </div>
  )
}

export default function App() {
  const [page, setPage] = useState('home')
  const [searchKeyword, setSearchKeyword] = useState('')
  const [masterVolume, setMasterVolume] = useState(0.9)
  const [musicVolume, setMusicVolume] = useState(0.9)
  const [micVolume, setMicVolume] = useState(0.9)
  const [roomStatus, setRoomStatus] = useState('Inactive') // default Active agar menu tampil saat awal
  const [macAddress, setMacAddress] = useState('aa')
  const [serverUrl, setServerUrl] = useState('http://localhost:4000')

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
    if (window.electronAPI?.getMac) {
      window.electronAPI.getMac().then((mac) => {
        console.log(mac)
        // setMacAddress(mac)
      })
    }
    // Gunakan window.deviceInfo.getServerUrl()
    if (window.electronAPI?.getServerUrl) {
      window.electronAPI.getServerUrl().then((url) => {
        setServerUrl(url)
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

  // Polling status room
  useEffect(() => {
    let polling = null
    const fetchStatus = async () => {
      try {
        const data = await window.electronAPI.getRoomStatusByMac()
        console.log(data)
        if (data.status == 'Inactive') {
          window.electronAPI.updateRoomStatusByMac('Standby')
        }

        setRoomStatus(data.status)
      } catch {
        setRoomStatus('Inactive')
      }
    }
    fetchStatus()
    polling = setInterval(fetchStatus, 3000)
    return () => clearInterval(polling)
  }, [])

  // // Update status ke Standby saat start
  // useEffect(() => {
  //   window.electronAPI.updateRoomStatusByMac('Standby')
  // }, [])

  // Update status ke Inactive saat close
  // useEffect(() => {
  //   const handleBeforeUnload = () => {
  //     window.electronAPI.updateRoomStatusByMac('Inactive')
  //   }
  //   window.addEventListener('beforeunload', handleBeforeUnload)
  //   return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  // }, [])

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

  // Render loading jika macAddress belum didapat
  if (!macAddress) {
    return <div className='flex items-center justify-center h-screen text-2xl'>Loading device info...</div>
  }
  // Render sesuai status
  if (roomStatus === 'Inactive') {
    return <div className='flex items-center justify-center h-screen text-3xl text-red-500'>Disconnected</div>
  }
  if (roomStatus === 'Standby') {
    return <StandbySlideshow />
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

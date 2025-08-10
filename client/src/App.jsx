import React, { useState, useEffect } from 'react'
import Home from './page/Home'
import BankMusic from './page/BankMusic'
import Navbar from './components/Navbar'
import StandbyCarousel from './components/StandbyCarousel'
import { startMicOutput } from './Util'

export default function App() {
  const isAppReadyRef = React.useRef(false)
  const [page, setPage] = useState('home')
  const [roomStatus, setRoomStatus] = useState('Inactive')
  const [searchQuery, setSearchQuery] = useState('')
  const [query, setQuery] = useState('')
  const [mode, setMode] = useState('local')
  const [licensed, setLicensed] = useState(null)
  const [licenseKey, setLicenseKey] = useState('')
  const [licenseError, setLicenseError] = useState('')
  const [isVideoIdle, setIsVideoIdle] = useState(false)
  const isFirstTime = React.useRef(true)
  const inactiveCount = React.useRef(0)
  const isFetchingRef = React.useRef(false) // Add fetching guard

  useEffect(() => {
    window.electronAPI.onAppReady(() => {
      console.log('🟢 App is ready!')
      isAppReadyRef.current = true
      window.electronAPI.startKeyBlocker()
    })

    setTimeout(() => {
      window.electronAPI.openVideoWindow().catch(console.error)
    }, 1000)

    const checkLicense = async () => {
      const isLicensed = await window.electronAPI.isLicensed()
      console.log('📄 License status:', isLicensed)
      setLicensed(isLicensed)
    }
    checkLicense()

    // Add fallback timer for isAppReady
    const fallbackTimer = setTimeout(() => {
      if (!isAppReadyRef.current) {
        console.warn('⚠️ App ready fallback triggered after 8 seconds')
        isAppReadyRef.current = true
      }
    }, 8000)

    return () => clearTimeout(fallbackTimer)
  }, [])

  // Remove the problematic reload interval
  // This was causing issues with app readiness
  /*
  useEffect(() => {
    const interval = setInterval(() => {
      console.log(isAppReadyRef.current)

      if (!isAppReadyRef.current) {
        console.log('retry reload video window')
        window.electronAPI.reloadWindow()
      } else {
        clearInterval(interval)
      }
    }, 3000)

    return () => clearInterval(interval)
  }, [])
  */

  useEffect(() => {
    const listener = (event, value) => {
      setIsVideoIdle(value)
    }

    window.electronAPI.onUpdateVideoIdle(listener)

    return () => {
      window.electronAPI.removeUpdateVideoIdle(listener)
    }
  }, [])

  useEffect(() => {
    const handleMouseMove = () => {
      window.electronAPI.sendUserActive()
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  const handleActivateLicense = async () => {
    if (!licenseKey) {
      setLicenseError('License key is required')
      return
    }
    const result = await window.electronAPI.activateLicense(licenseKey)
    if (result.success) {
      setLicensed(true)
      window.location.reload()
    } else {
      setLicenseError(result.message || 'Activation failed')
    }
  }

  useEffect(() => {
    const interval = setInterval(() => {
      console.log(isAppReadyRef.current)

      if (!isAppReadyRef.current) {
        console.log('retry reload video window')
        window.electronAPI.reloadWindow()
      } else {
        clearInterval(interval)
      }
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (licensed !== true) return

    const fetchStatus = async () => {
      // Prevent concurrent fetches
      if (isFetchingRef.current) {
        console.log('⏳ Already fetching, skipping...')
        return
      }

      isFetchingRef.current = true

      try {
        console.log('🔍 Fetching status...')
        const data = await window.electronAPI.getRoomStatusByMac()
        console.log('📡 API response status:', data?.status)

        if (data && data.status) {
          if (data.status === 'Inactive') {
            console.log('❌ Status is Inactive')
            inactiveCount.current++
            console.log('Inactive count:', inactiveCount.current)
            console.log('First time:', isFirstTime.current)

            if ((inactiveCount.current >= 3 && isFirstTime.current == false) || isFirstTime.current == true) {
              setRoomStatus('Inactive')
              window.electronAPI.sendInactive()
            }
          } else {
            console.log('✅ Status is:', data.status)
            setRoomStatus(data.status)
            inactiveCount.current = 0
          }
        } else {
          console.log('❌ No valid data, setting to Inactive')
          setRoomStatus('Inactive')
        }
      } catch (error) {
        console.log('💥 Error fetching status:', error)
        setRoomStatus('Inactive')
      } finally {
        isFetchingRef.current = false
        isFirstTime.current = false
      }
    }

    // Initial fetch
    fetchStatus()

    // Set up polling with proper cleanup
    const polling = setInterval(fetchStatus, 5000)

    return () => {
      clearInterval(polling)
      isFetchingRef.current = false
    }
  }, [licensed])

  // Debug roomStatus changes
  useEffect(() => {
    console.log('🎯 roomStatus CHANGED to:', roomStatus)
  }, [roomStatus])

  console.log('🎨 RENDER - roomStatus:', roomStatus)
  console.log('🎨 RENDER - isAppReadyRef.current:', isAppReadyRef.current)
  console.log('🎨 RENDER - licensed:', licensed)

  if (licensed === null) {
    console.log('🎨 RENDERING: Checking license...')
    return (
      <div className='flex items-center justify-center h-screen bg-black text-white text-2xl'>Checking license...</div>
    )
  }

  if (licensed === false) {
    console.log('🎨 RENDERING: License activation screen')
    return (
      <div className='flex flex-col items-center justify-center h-screen bg-black text-white space-y-4'>
        <h2 className='text-2xl font-bold'>Activate License</h2>
        <input
          type='text'
          value={licenseKey}
          onChange={(e) => setLicenseKey(e.target.value)}
          placeholder='Enter license key...'
          className='p-2 w-64 text-black rounded'
        />
        <button onClick={handleActivateLicense} className='bg-[#b1c953] text-black px-4 py-2 rounded transition'>
          Activate
        </button>
        {licenseError && <p className='text-red-500'>{licenseError}</p>}
      </div>
    )
  }

  // Modified condition - be more lenient with app readiness
  if (roomStatus === 'Inactive') {
    console.log('🎨 RENDERING: Connecting... (roomStatus is Inactive)')
    return (
      <div className='flex items-center justify-center h-screen bg-black text-3xl text-yellow-500'>Connecting...</div>
    )
  }

  if (roomStatus === 'Standby') {
    console.log('🎨 RENDERING: Standby video')
    window.electronAPI.sendStandby()
    return (
      <div className='h-screen w-screen bg-black flex items-center justify-center'>
        <video src='idle.mp4' autoPlay loop className='w-full h-full object-cover' />
      </div>
    )
  }

  if (roomStatus === 'Active') {
    console.log('🎨 RENDERING: Active mode')
    window.electronAPI.sendActive()
  }

  if (isVideoIdle) {
    console.log('🎨 RENDERING: Video idle')
    return (
      <div className='h-screen w-screen bg-black flex items-center justify-center'>
        <video src='idle.mp4' autoPlay loop className='w-full h-full object-cover' />
      </div>
    )
  }

  console.log('🎨 RENDERING: Main app interface')

  const renderPage = () => {
    switch (page) {
      case 'bank-music':
        return <BankMusic onBack={() => setPage('home')} searchQuery={searchQuery} />
      case 'home':
      default:
        return (
          <Home
            onBankMusic={() => setPage('bank-music')}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            setQuery={setQuery}
            mode={mode}
            setMode={setMode}
          />
        )
    }
  }

  return (
    <div
      className='h-screen grid grid-rows-15 bg-brand-dark text-white overflow-hidden'
      style={{
        backgroundImage: `url('home_bg.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}>
      <Navbar onSearch={setSearchQuery} query={query} setQuery={setQuery} mode={mode} />
      {renderPage()}
    </div>
  )
}

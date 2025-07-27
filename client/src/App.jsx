import React, { useState, useEffect } from 'react'
import Home from './page/Home'
import BankMusic from './page/BankMusic'
import Navbar from './components/Navbar'
import StandbyCarousel from './components/StandbyCarousel'
import { startMicOutput } from './Util'

export default function App() {
  const [page, setPage] = useState('home')
  const [roomStatus, setRoomStatus] = useState('Inactive')
  const [searchQuery, setSearchQuery] = useState('')
  const [query, setQuery] = useState('')
  const [mode, setMode] = useState('local')
  const [licensed, setLicensed] = useState(null)
  const [licenseKey, setLicenseKey] = useState('')
  const [licenseError, setLicenseError] = useState('')

  useEffect(() => {
    const checkLicense = async () => {
      const isLicensed = await window.electronAPI.isLicensed()
      setLicensed(isLicensed)
    }
    checkLicense()
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
    if (licensed !== true) return

    const fetchStatus = async () => {
      try {
        const data = await window.electronAPI.getRoomStatusByMac()
        console.log(data)

        if (data && data.status) {
          setRoomStatus(data.status)
          if (data.status === 'Inactive') {
            await window.electronAPI.updateRoomStatusByMac('Standby')
          }
        } else {
          setRoomStatus('Inactive')
        }
      } catch {
        setRoomStatus('Inactive')
      }
    }

    fetchStatus()
    const polling = setInterval(fetchStatus, 5000)
    return () => clearInterval(polling)
  }, [licensed])

  if (licensed === null) {
    return (
      <div className='flex items-center justify-center h-screen bg-black text-white text-xl'>Checking license...</div>
    )
  }

  if (licensed === false) {
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

  if (roomStatus === 'Inactive') {
    return (
      <div className='flex items-center justify-center h-screen bg-black text-3xl text-yellow-500'>Connecting...</div>
    )
  }

  if (roomStatus === 'Standby') {
    return <StandbyCarousel />
  }

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

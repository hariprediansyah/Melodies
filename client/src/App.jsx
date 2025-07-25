import React, { useState, useEffect } from 'react'
import Home from './page/Home'
import BankMusic from './page/BankMusic'
import Navbar from './components/Navbar'
import StandbyCarousel from './components/StandbyCarousel'

export default function App() {
  const [page, setPage] = useState('home')
  const [roomStatus, setRoomStatus] = useState('Inactive')
  const [searchQuery, setSearchQuery] = useState('')
  const [query, setQuery] = useState('')

  useEffect(() => {
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
  }, [])

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
        return <BankMusic onBack={() => setPage('home')} />
      case 'home':
      default:
        return (
          <Home
            onBankMusic={() => setPage('bank-music')}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            setQuery={setQuery}
          />
        )
    }
  }

  return (
    <div
      className='h-screen bg-brand-dark text-white'
      style={{
        backgroundImage: `url('home_bg.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}>
      <Navbar onSearch={setSearchQuery} query={query} setQuery={setQuery} />
      <main className='pt-20 h-full'>{renderPage()}</main>
    </div>
  )
}

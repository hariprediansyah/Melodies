import React, { useState, useEffect } from 'react'
import Home from './page/Home'
import BankMusic from './page/BankMusic'
import Navbar from './components/Navbar'
import StandbyCarousel from './components/StandbyCarousel'

export default function App() {
  const [page, setPage] = useState('home')
  const [roomStatus, setRoomStatus] = useState('Inactive')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const data = await window.electronAPI.getRoomStatusByMac()
        console.log(data)

        if (data && data.status) {
          if (data.status === 'Inactive') {
            await window.electronAPI.updateRoomStatusByMac('Standby')
          } else {
            setRoomStatus(data.status)
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
        return <Home onBankMusic={() => setPage('bank-music')} searchQuery={searchQuery} />
    }
  }

  return (
    <div className='h-screen bg-brand-dark text-white'>
      <Navbar onSearch={setSearchQuery} />
      <main className='pt-20 h-full'>{renderPage()}</main>
    </div>
  )
}

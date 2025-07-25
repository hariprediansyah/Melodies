import React, { useState, useEffect } from 'react'
import { roomAPI, callLogAPI, songsAPI } from '../services/api'
import { CardRoom, ToastNotif, useNotifStack } from '../components/Components'

const API_URL = 'http://localhost:4000'

export default function Dashboard() {
  const [rooms, setRooms] = useState([])
  const [activeCalls, setActiveCalls] = useState([])
  const [recentCalls, setRecentCalls] = useState([])
  const [loading, setLoading] = useState(true)
  const { notifs, showNotif, onClose } = useNotifStack()
  const [currentDate, setCurrentDate] = useState('')
  const [currentTime, setCurrentTime] = useState('')
  const [totalSong, setTotalSong] = useState(0)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchRooms()
    fetchCalls()
    fetchSongs()

    const updateDate = () => {
      const today = new Date()
      const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
      // Using a specific locale for consistency, e.g., 'en-GB'
      setCurrentDate(today.toLocaleDateString('en-GB', options))

      const timeOptions = { hour: 'numeric', minute: 'numeric' }
      // Using a specific locale for consistency, e.g., 'en-GB'
      setCurrentTime(today.toLocaleTimeString('en-GB', timeOptions))
    }

    updateDate()

    // Set up intervals for periodic updates
    const dateTimer = setInterval(updateDate, 60000) // Update date/time every minute
    const callsTimer = setInterval(fetchCalls, 5000) // Check for new calls every 5 seconds
    const roomsTimer = setInterval(fetchRooms, 30000) // Update rooms every 30 seconds

    return () => {
      clearInterval(dateTimer)
      clearInterval(callsTimer)
      clearInterval(roomsTimer)
    }
  }, [])

  const fetchRooms = async () => {
    try {
      const res = await fetch(`${API_URL}/roomsdashboard`)
      const data = await res.json()
      setRooms(data)
    } catch (e) {
      console.error('Error fetching rooms:', e)
      setRooms([])
    } finally {
      setLoading(false)
    }
  }

  const fetchCalls = async () => {
    try {
      // Get active calls (status = 'Calling')
      const activeCallsData = await callLogAPI.getActive()

      setActiveCalls(activeCallsData)

      // Get all recent calls
      const allCallsData = await callLogAPI.getAll()
      // Filter out active calls and keep only the most recent ones
      const recentCompletedCalls = allCallsData.filter((call) => call.status !== 'Calling').slice(0, 5) // Keep only the 5 most recent completed calls

      setRecentCalls(recentCompletedCalls)
    } catch (e) {
      console.error('Error fetching calls:', e)
    }
  }

  const fetchSongs = async () => {
    try {
      const res = await songsAPI.totalSongs()
      setTotalSong(res.total)
    } catch (e) {
      console.error('Error fetching songs:', e)
    }
  }

  const handleStartSession = async (roomId) => {
    try {
      await roomAPI.startSession(roomId)
      fetchRooms()
      showNotif('Sesi berhasil dimulai!', 'success')
    } catch (e) {
      showNotif('Gagal memulai sesi!', 'error')
    }
  }

  const handleEndSession = async (roomId) => {
    try {
      await roomAPI.endSession(roomId)
      fetchRooms()
      showNotif('Sesi berhasil diakhiri!', 'success')
    } catch (e) {
      showNotif('Gagal mengakhiri sesi!', 'error')
    }
  }

  const handleAcceptCall = async (callId) => {
    try {
      await callLogAPI.acceptCall(callId)
      fetchCalls() // Refresh calls after accepting
      showNotif('Call accepted successfully', 'success')
    } catch (e) {
      showNotif('Failed to accept call', 'error')
    }
  }

  const handleRejectCall = async (callId) => {
    try {
      await callLogAPI.rejectCall(callId)
      fetchCalls() // Refresh calls after rejecting
      showNotif('Call rejected', 'success')
    } catch (e) {
      showNotif('Failed to reject call', 'error')
    }
  }

  const handleShutdownAll = async () => {
    try {
      await roomAPI.shutdownAll()
      fetchRooms()
      showNotif('Semua room berhasil di-shutdown!', 'success')
    } catch (e) {
      showNotif('Gagal shutdown semua room!', 'error')
    }
  }

  // Format timestamp to readable time
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  }

  if (loading) {
    return <div className='text-center py-8'>Loading...</div>
  }

  const filteredRooms = rooms.filter((room) => room.name.toLowerCase().includes(search.toLowerCase()))
  const activeRooms = filteredRooms.filter((r) => r.status === 'Active')
  const activeRoomsAll = rooms.filter((r) => r.status === 'Active')

  return (
    <div>
      <ToastNotif notifs={notifs} onClose={onClose} />

      {/* Hero Banner */}
      <div className='rounded-2xl bg-[url("./bg_dashboard.png")] bg-cover bg-center p-8 mb-6'>
        <h1 className='text-4xl font-bold text-white'>Unleash Your Inner Star!</h1>
        <p className='text-2xl text-white/90 mt-2'>The Ultimate Karaoke Experience!</p>

        {/* Status Cards */}
        <div className='flex gap-4 mt-6'>
          <div className='bg-black/20 backdrop-blur-sm border border-white/10 rounded-lg px-6 py-3 text-white font-medium flex items-center gap-2'>
            Status Online <div className='w-2 h-2 bg-green-500 rounded-full ml-1'></div>
          </div>
          <div className='bg-black/20 backdrop-blur-sm border border-white/10 rounded-lg px-6 py-3 text-white font-medium'>
            Room Active <span className='ml-2'>{activeRoomsAll.length || 0}</span>
          </div>
          <div className='bg-black/20 backdrop-blur-sm border border-white/10 rounded-lg px-6 py-3 text-white font-medium'>
            Library Songs <span className='ml-2'>{totalSong || 0}</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {/* Left: Main Dashboard */}
        <div className='lg:col-span-2'>
          <div className='flex items-center justify-between mb-4'>
            <div className='text-xl font-bold text-white'>
              Dashboard <span className='text-green-400 ml-2'>{activeRooms.length || 0} Room Active</span>
            </div>
            <div className='relative'>
              <div className='absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none'>
                <svg
                  className='w-5 h-5 text-gray-400'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                  xmlns='http://www.w3.org/2000/svg'>
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth='2'
                    d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'></path>
                </svg>
              </div>
              <input
                type='text'
                placeholder='Search rooms'
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className='pl-10 pr-10 py-2 rounded-lg bg-gray-700/50 text-white outline-none border border-gray-600 w-80'
              />
              {search && (
                <button className='absolute inset-y-0 right-0 flex items-center pr-3' onClick={() => setSearch('')}>
                  <svg
                    className='w-5 h-5 text-gray-400 hover:text-white'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                    xmlns='http://www.w3.org/2000/svg'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M6 18L18 6M6 6l12 12'></path>
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Room List */}
          <div className='flex flex-col gap-5'>
            {filteredRooms.length > 0 ? (
              filteredRooms.map((room) => (
                <CardRoom
                  room={room}
                  key={room.id}
                  handleStartSession={handleStartSession}
                  handleStopSession={handleEndSession}
                />
              ))
            ) : (
              <div className='bg-[#1f1f1f] rounded-xl p-8 text-center'>
                <div className='text-gray-200 mb-2'>No rooms found matching "{search}"</div>
                <button onClick={() => setSearch('')} className='text-gray-400 underline hover:text-white'>
                  Clear search
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right: Info Panel */}
        <div className='flex flex-col gap-6'>
          {/* Date & Time Card */}
          <div className='rounded-2xl bg-[url("./bg_frame.png")] bg-cover bg-center p-5'>
            <div className='flex flex-col gap-1'>
              <div className='flex items-center gap-2'>
                <span className='py-1 text-xs text-white'>Today is a fantastic day!</span>
              </div>
              <div className='font-bold text-lg text-white'>{currentDate}</div>
              <div className='text-sm text-white/90'>{currentTime}</div>
            </div>
          </div>

          {/* Activities */}
          <div>
            <div className='font-semibold text-white mb-2'>Activities</div>
            <div className='flex flex-col gap-2'>
              {/* Active Calls */}
              {activeCalls.map((call) => (
                <div key={call.id} className='flex items-center justify-between bg-[#23262e] rounded-lg px-3 py-2'>
                  <span className='text-white text-sm'>
                    Calling to room <span className='text-lime-400 font-semibold'>{call.room_name}</span>
                  </span>
                  <span className='flex gap-1'>
                    <button
                      className='bg-red-600 hover:bg-red-700 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold'
                      onClick={() => handleRejectCall(call.id)}>
                      ✕
                    </button>
                    <button
                      className='bg-green-600 hover:bg-green-700 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold'
                      onClick={() => handleAcceptCall(call.id)}>
                      ✓
                    </button>
                  </span>
                </div>
              ))}

              {/* Recent Completed Calls */}
              {recentCalls.map((call) => (
                <div key={call.id} className='flex items-center justify-between bg-[#23262e] rounded-lg px-3 py-2'>
                  <span className='text-white text-sm'>
                    Calling to room{' '}
                    <span
                      className={
                        call.status === 'Accepted' ? 'text-green-300 font-semibold' : 'text-yellow-300 font-semibold'
                      }>
                      {call.room_name}
                    </span>
                    <span className='text-gray-400 text-xs ml-2'>{formatTimestamp(call.created_at)}</span>
                  </span>
                  <span
                    className={`rounded px-3 py-1 text-xs font-semibold ${
                      call.status === 'Accepted' ? 'bg-green-900 text-green-400' : 'bg-red-900 text-red-400'
                    }`}>
                    {call.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Shutdown All Room */}
          <div className='mt-auto'>
            <div className='bg-[#1f1f1f] rounded-xl p-6'>
              <div className='font-bold text-white mb-2'>Shutdown All Room</div>
              <button
                className='bg-red-700 hover:bg-red-800 text-white font-bold py-3 rounded-lg text-lg w-full'
                onClick={handleShutdownAll}>
                Shutdown
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

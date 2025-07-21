import React, { useState, useEffect } from 'react'
import { roomAPI } from '../services/api'
import { ToastNotif, useNotifStack } from '../components/Components'

const API_URL = 'http://localhost:4000'

const statusColor = {
  Active: 'text-green-400',
  Standby: 'text-yellow-400',
  Inactive: 'text-red-400'
}

const statusBg = {
  Active: 'bg-green-900/40',
  Standby: 'bg-yellow-900/40',
  Inactive: 'bg-gray-800/60'
}

export default function Dashboard() {
  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(true)
  const { notifs, showNotif, onClose } = useNotifStack()

  useEffect(() => {
    fetchRooms()
  }, [])

  const fetchRooms = async () => {
    try {
      const res = await fetch(`${API_URL}/rooms`)
      const data = await res.json()
      setRooms(data)
    } catch (e) {
      setRooms([])
    } finally {
      setLoading(false)
    }
  }

  const activeRooms = rooms.filter((r) => r.status === 'Active')
  const standbyRooms = rooms.filter((r) => r.status === 'Standby')
  const inactiveRooms = rooms.filter((r) => r.status === 'Inactive')

  // Dummy data untuk queue dan durasi
  const getDummyDuration = (status) => (status === 'Active' ? '00:45:20' : '00:00:00')
  const getDummyQueue = (status) => (status === 'Active' ? 3 : 0)

  // Handler untuk start/end session
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

  // Handler untuk shutdown all room
  const handleShutdownAll = async () => {
    try {
      await roomAPI.shutdownAll()
      fetchRooms()
      showNotif('Semua room berhasil di-shutdown!', 'success')
    } catch (e) {
      showNotif('Gagal shutdown semua room!', 'error')
    }
  }

  if (loading) {
    return <div className='text-center py-8'>Loading...</div>
  }

  return (
    <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
      <ToastNotif notifs={notifs} onClose={onClose} />
      {/* Kiri: Main Dashboard */}
      <div className='lg:col-span-2 flex flex-col gap-6'>
        {/* List Room */}
        <div className='bg-transparent p-0'>
          <div className='flex items-center justify-between mb-4'>
            <div className='text-xl font-bold text-white'>
              Dashboard <span className='text-green-400 ml-2'>{activeRooms.length} Room Active</span>
            </div>
            <input
              type='text'
              placeholder='Filters Room'
              className='px-4 py-2 rounded bg-gray-700 text-white outline-none'
            />
          </div>
          <div className='flex flex-col gap-5'>
            {rooms.map((room) => (
              <div
                key={room.id}
                className={`flex flex-col md:flex-row md:items-center justify-between bg-[#191c22] shadow-lg rounded-xl px-6 py-4 border border-[#23262e]`}>
                <div className='flex flex-col gap-1 w-full md:w-auto'>
                  <div className='flex items-center gap-2'>
                    <span className='text-2xl text-yellow-400'>
                      <svg width='22' height='22' fill='none' viewBox='0 0 24 24'>
                        <circle cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='2' />
                        <path d='M12 8v4l3 2' stroke='currentColor' strokeWidth='2' strokeLinecap='round' />
                      </svg>
                    </span>
                    <span className='font-bold text-lg text-white'>{room.name}</span>
                    <span className='ml-2 text-sm text-white/80'>{room.status}</span>
                    <span className={`ml-1 w-2 h-2 rounded-full ${statusColor[room.status]}`}></span>
                  </div>
                  <div className='flex items-center gap-6 mt-1 ml-7'>
                    <span className='flex items-center gap-1 text-gray-300 text-sm'>
                      <svg width='18' height='18' fill='none' viewBox='0 0 24 24'>
                        <circle cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='2' />
                        <path d='M12 8v4l3 2' stroke='currentColor' strokeWidth='2' strokeLinecap='round' />
                      </svg>
                      Duration <span className='font-mono text-white ml-1'>{getDummyDuration(room.status)}</span>
                    </span>
                    <span className='flex items-center gap-1 text-gray-300 text-sm'>
                      <svg width='18' height='18' fill='none' viewBox='0 0 24 24'>
                        <path d='M9 18V5l12-2v13' stroke='currentColor' strokeWidth='2' strokeLinecap='round' />
                        <circle cx='6' cy='18' r='3' stroke='currentColor' strokeWidth='2' />
                        <circle cx='18' cy='16' r='3' stroke='currentColor' strokeWidth='2' />
                      </svg>
                      Songs Queue <span className='text-white ml-1'>{getDummyQueue(room.status)} Songs</span>
                    </span>
                  </div>
                </div>
                <div className='flex gap-2 mt-4 md:mt-0 items-center'>
                  {room.status === 'Active' && (
                    <button
                      className='bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-bold text-base transition'
                      onClick={() => handleEndSession(room.id)}>
                      End Session
                    </button>
                  )}
                  {room.status === 'Standby' && (
                    <button
                      className='bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-bold text-base transition'
                      onClick={() => handleStartSession(room.id)}>
                      Start Session
                    </button>
                  )}
                  {room.status === 'Inactive' && (
                    <button
                      className='bg-gray-700 text-gray-400 px-6 py-2 rounded-lg font-bold text-base cursor-not-allowed'
                      disabled>
                      Start Session
                    </button>
                  )}
                  <button
                    className={`ml-2 p-2 rounded-full border-2 ${
                      room.status !== 'Inactive'
                        ? 'border-blue-500 bg-blue-900 text-blue-400 hover:bg-blue-700'
                        : 'border-gray-600 bg-gray-800 text-gray-500 cursor-not-allowed'
                    }`}
                    disabled={room.status === 'Inactive'}>
                    <svg width='22' height='22' fill='none' viewBox='0 0 24 24'>
                      <path d='M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z' stroke='currentColor' strokeWidth='2' />
                      <path
                        d='M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h.09a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v.09a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z'
                        stroke='currentColor'
                        strokeWidth='2'
                      />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
            {rooms.length === 0 && <div className='text-gray-400 text-center py-8'>No room found</div>}
          </div>
        </div>
      </div>
      {/* Kanan: Info Panel */}
      <div className='flex flex-col gap-6 h-full relative'>
        {/* Waktu & Activities */}
        <div className='flex flex-col gap-4'>
          {/* Waktu dengan background gambar */}
          <div className='rounded-2xl bg-[url("./bg_dashboard.png")] bg-cover bg-center p-5 flex flex-col mb-2 shadow-md relative overflow-hidden'>
            <div className='z-10 flex flex-col gap-1'>
              <div className='flex items-center gap-2'>
                <span className='bg-black/60 rounded px-2 py-1 text-xs text-white flex items-center gap-1'>
                  <svg width='16' height='16' fill='none' viewBox='0 0 24 24'>
                    <rect width='24' height='24' rx='6' fill='#23262e' />
                    <path d='M12 8v4l3 2' stroke='#fff' strokeWidth='2' strokeLinecap='round' />
                    <circle cx='12' cy='12' r='10' stroke='#fff' strokeWidth='2' />
                  </svg>
                  Today is a fantastic day!
                </span>
              </div>
              <div className='font-bold text-lg text-white drop-shadow'>Tuesday, 26 June 2025</div>
              <div className='text-sm text-white/90'>18:30 WITA</div>
            </div>
          </div>
          {/* Activities */}
          <div className='mt-2'>
            <div className='font-semibold text-white mb-2'>Activities</div>
            <div className='flex flex-col gap-2'>
              {/* Item 1 */}
              <div className='flex items-center justify-between bg-[#23262e] rounded-lg px-3 py-2'>
                <span className='text-white text-sm'>
                  Calling to room <span className='text-lime-400 font-semibold'>Tune Oasis</span>
                </span>
                <span className='flex gap-1'>
                  <button className='bg-red-600 hover:bg-red-700 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold'>
                    ✕
                  </button>
                  <button className='bg-green-600 hover:bg-green-700 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold'>
                    ✓
                  </button>
                </span>
              </div>
              {/* Item 2 */}
              <div className='flex items-center justify-between bg-[#23262e] rounded-lg px-3 py-2'>
                <span className='text-white text-sm'>
                  Calling to room <span className='text-green-300 font-semibold'>Melody Haven</span>
                </span>
                <span className='bg-green-900 text-green-400 rounded px-3 py-1 text-xs font-semibold'>Accepted</span>
              </div>
              {/* Item 3 */}
              <div className='flex items-center justify-between bg-[#23262e] rounded-lg px-3 py-2'>
                <span className='text-white text-sm'>
                  Calling to room <span className='text-yellow-300 font-semibold'>Harmony Hub</span>
                </span>
                <span className='bg-red-900 text-red-400 rounded px-3 py-1 text-xs font-semibold'>Rejected</span>
              </div>
              {/* Item 4 */}
              <div className='flex items-center justify-between bg-[#23262e] rounded-lg px-3 py-2'>
                <span className='text-white text-sm'>Add/Update Library</span>
                <span className='bg-green-900 text-green-400 rounded px-3 py-1 text-xs font-semibold'>Completed</span>
              </div>
              {/* Item 5 */}
              <div className='flex items-center justify-between bg-[#23262e] rounded-lg px-3 py-2'>
                <span className='text-white text-sm'>Save song metadata</span>
                <span className='bg-green-900 text-green-400 rounded px-3 py-1 text-xs font-semibold'>Completed</span>
              </div>
            </div>
          </div>
        </div>
        {/* Shutdown All Room sticky di bawah */}
        <div className='mt-auto'>
          <div className='bg-gray-800 rounded-xl p-6 flex flex-col gap-4'>
            <div className='font-bold text-white mb-2'>Shutdown All Room</div>
            <button
              className='bg-red-700 hover:bg-red-800 text-white font-bold py-3 rounded-lg text-lg'
              onClick={handleShutdownAll}>
              Shutdown
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

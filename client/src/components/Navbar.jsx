import React, { useState, useEffect } from 'react'
import { Search, HelpCircle, Music, PhoneCall } from 'lucide-react'
import CallingModal from './CallingModal'
import Util from '../Util'
import { useNotifStack } from '../Util'

const Navbar = ({ onSearch, query, setQuery, mode }) => {
  const [roomName, setRoomName] = useState('')
  const [roomId, setRoomId] = useState(null)
  const [isCallingModalOpen, setIsCallingModalOpen] = useState(false)
  const [currentCallId, setCurrentCallId] = useState(null)
  const { notifs, showNotif, onClose } = useNotifStack()

  const handleSubmit = (e) => {
    e.preventDefault()
    onSearch(query)
  }

  const handleSearch = (search) => {
    if (mode != 'youtube') {
      onSearch(search)
    }
  }

  useEffect(() => {
    const fetchRoomInfo = async () => {
      try {
        const roomName = await window.electronAPI.getSysParam('client_room_name')
        const roomId = await window.electronAPI.getSysParam('client_room_id')

        if (roomName) {
          setRoomName(roomName)
        }

        if (roomId) {
          setRoomId(roomId)
        }
      } catch (error) {
        console.error('Error fetching room info:', error)
      }
    }

    fetchRoomInfo()
  }, [])

  const handleCallClick = async () => {
    if (!roomId) {
      showNotif('Room ID not found. Please check your configuration.', 'error')
      return
    }

    try {
      if (!isCallingModalOpen) {
        // This will use IPC communication via the updated Util.js
        const callId = await Util.makeCall()
        setCurrentCallId(callId)
        setIsCallingModalOpen(true)
      }
    } catch (error) {
      showNotif('Failed to make call. Please try again.', 'error')
    }
  }

  const handleCloseCallingModal = (status) => {
    setIsCallingModalOpen(false)
    setCurrentCallId(null)

    if (status === 'Accepted') {
      showNotif('Call accepted! Staff will be with you shortly.', 'success')
    } else if (status === 'Rejected') {
      showNotif('Call rejected. Please try again later.', 'error')
    }
  }
  return (
    <>
      <nav className='row-span-1 h-20 flex items-center justify-between px-8 z-50'>
        <div className='flex items-center gap-4'>
          <img src='logo_horizontal.png' width={250} alt='Logo' />
        </div>

        <div className='flex-1 flex justify-center px-16'>
          <form
            onSubmit={handleSubmit}
            className='w-full max-w-md bg-black bg-opacity-20 rounded-full flex items-center px-4'>
            <Search className='text-gray-400' />
            <input
              type='text'
              placeholder='Search for songs'
              value={query}
              onChange={(e) => {
                const search = e.target.value
                setQuery(search)
                if (search.includes('/exit/')) {
                  console.log(search.replace('/exit/', ''))

                  window.electronAPI.checkAdmin(search.replace('/exit/', '')).then((result) => {
                    if (result) {
                      window.electronAPI.closeVideoWindow()
                      window.electronAPI.closeKeyBlocker()
                      window.electronAPI.closeApp()
                    }
                  })
                  return
                }
                if (mode != 'youtube') {
                  handleSearch(e.target.value)
                }
              }}
              className='bg-transparent w-full h-12 px-4 text-white placeholder-gray-400 focus:outline-none bg-black bg-opacity-30 text-3xl'
            />
          </form>
        </div>

        <div className='flex items-center gap-6 text-2xl'>
          <button className='text-gray-300 hover:text-white transition-colors' onClick={handleCallClick}>
            <PhoneCall size={24} />
          </button>
          <div className='flex items-center gap-2 text-xl'>
            <Music size={24} />
            <span>{roomName}</span>
          </div>
        </div>
      </nav>

      {/* Toast notifications */}
      <div className='fixed top-6 right-6 z-50 flex flex-col gap-2'>
        {notifs.map((notif) => (
          <div
            key={notif.id}
            className={`px-6 py-3 rounded-lg shadow-lg text-white font-semibold flex items-center gap-3 transition-all duration-300 ${
              notif.type === 'success' ? 'bg-green-600' : notif.type === 'error' ? 'bg-red-600' : 'bg-gray-700'
            } ${notif.show ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}`}>
            {notif.type === 'success' && (
              <svg width='22' height='22' fill='none' viewBox='0 0 24 24'>
                <circle cx='12' cy='12' r='10' stroke='white' strokeWidth='2' />
                <path d='M8 12.5l3 3 5-5' stroke='white' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' />
              </svg>
            )}
            {notif.type === 'error' && (
              <svg width='22' height='22' fill='none' viewBox='0 0 24 24'>
                <circle cx='12' cy='12' r='10' stroke='white' strokeWidth='2' />
                <path d='M15 9l-6 6M9 9l6 6' stroke='white' strokeWidth='2' strokeLinecap='round' />
              </svg>
            )}
            <span>{notif.message}</span>
            <button onClick={() => onClose(notif.id)} className='ml-2 text-white/70 hover:text-white text-xl'>
              &times;
            </button>
          </div>
        ))}
      </div>

      {/* Calling Modal */}
      <CallingModal isOpen={isCallingModalOpen} onClose={handleCloseCallingModal} callId={currentCallId} />
    </>
  )
}

export default Navbar

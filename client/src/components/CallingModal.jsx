import React, { useState, useEffect } from 'react'
import Util from '../Util'

const CallingModal = ({ isOpen, onClose, callId }) => {
  const [status, setStatus] = useState('Calling')
  const [timer, setTimer] = useState(0)

  useEffect(() => {
    if (!isOpen || !callId) return

    // Start timer
    const timerInterval = setInterval(() => {
      setTimer((prev) => prev + 1)
    }, 1000)

    // Check call status every 2 seconds using IPC
    const statusInterval = setInterval(async () => {
      try {
        // This will use IPC communication via the updated Util.js
        const callData = await Util.checkCallStatus(callId)
        console.log(callData)

        if (callData.status !== 'Calling') {
          setStatus(callData.status)
          setTimeout(() => {
            onClose(callData.status)
            setStatus('Calling')
          }, 2000) // Close after 2 seconds when status changes
        }
      } catch (error) {
        console.error('Error checking call status:', error)
      }
    }, 2000)

    return () => {
      clearInterval(timerInterval)
      clearInterval(statusInterval)
    }
  }, [isOpen, callId, onClose])

  // Format timer as MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
      .toString()
      .padStart(2, '0')
    const secs = (seconds % 60).toString().padStart(2, '0')
    return `${mins}:${secs}`
  }

  if (!isOpen) return null

  return (
    <div className='fixed top-20 right-6 z-50 w-64 rounded-lg shadow-lg overflow-hidden'>
      <div className='bg-gray-900 border border-gray-800 rounded-lg'>
        {/* Header */}
        <div className='bg-gray-800 px-4 py-3 flex justify-between items-center'>
          <div className='text-white font-medium'>Calling</div>
          <div className='text-gray-400 text-sm'>{formatTime(timer)}</div>
        </div>

        {/* Body */}
        <div className='p-4 flex flex-col items-center'>
          {status === 'Calling' ? (
            <>
              {/* Calling animation */}
              <div className='w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4 relative'>
                <div className='absolute w-full h-full rounded-full bg-green-500 opacity-30 animate-ping'></div>
                <div className='w-12 h-12 rounded-full bg-green-500 flex items-center justify-center'>
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    width='24'
                    height='24'
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='white'
                    strokeWidth='2'
                    strokeLinecap='round'
                    strokeLinejoin='round'>
                    <path d='M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z'></path>
                  </svg>
                </div>
              </div>
              <div className='text-white text-center'>
                <p className='font-medium'>Calling Staff</p>
                <p className='text-gray-400 text-sm mt-1'>Please wait for response...</p>
              </div>
            </>
          ) : status === 'Accepted' ? (
            <>
              {/* Accepted state */}
              <div className='w-16 h-16 rounded-full bg-green-500 flex items-center justify-center mb-4'>
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  width='32'
                  height='32'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='white'
                  strokeWidth='2'
                  strokeLinecap='round'
                  strokeLinejoin='round'>
                  <polyline points='20 6 9 17 4 12'></polyline>
                </svg>
              </div>
              <div className='text-white text-center'>
                <p className='font-medium'>Call Accepted</p>
                <p className='text-gray-400 text-sm mt-1'>Staff will be with you shortly</p>
              </div>
            </>
          ) : (
            <>
              {/* Rejected state */}
              <div className='w-16 h-16 rounded-full bg-red-500 flex items-center justify-center mb-4'>
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  width='32'
                  height='32'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='white'
                  strokeWidth='2'
                  strokeLinecap='round'
                  strokeLinejoin='round'>
                  <line x1='18' y1='6' x2='6' y2='18'></line>
                  <line x1='6' y1='6' x2='18' y2='18'></line>
                </svg>
              </div>
              <div className='text-white text-center'>
                <p className='font-medium'>Call Rejected</p>
                <p className='text-gray-400 text-sm mt-1'>Please try again later</p>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className='bg-gray-800 px-4 py-3 flex justify-center'>
          {status === 'Calling' ? (
            <button
              onClick={() => onClose('Cancelled')}
              className='bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-full'>
              Cancel
            </button>
          ) : (
            <button
              onClick={() => onClose(status)}
              className='bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-full'>
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default CallingModal

import React, { useState, useEffect } from 'react'
import { Calendar } from 'lucide-react'

const DateDisplay = () => {
  const [currentDate, setCurrentDate] = useState('')

  useEffect(() => {
    const updateDate = () => {
      const today = new Date()
      const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
      // Using a specific locale for consistency, e.g., 'en-GB'
      setCurrentDate(today.toLocaleDateString('en-GB', options))
    }

    updateDate()
    const timer = setInterval(updateDate, 60000) // Update every minute

    return () => clearInterval(timer)
  }, [])

  return (
    <div className='bg-black bg-opacity-20 p-4 rounded-2xl mb-4 text-white flex items-center justify-between shadow-lg border border-white/10'>
      <div>
        <p className='text-lg text-gray-300'>Today is a fantastic day!</p>
        <p className='font-bold text-xl text-brand-green-light'>{currentDate}</p>
      </div>
      <Calendar size={32} className='text-brand-green-light' />
    </div>
  )
}

export default DateDisplay

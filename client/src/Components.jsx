import React, { useEffect, useState } from 'react'
import Util from './Util'

export const CoverImage = ({ id, title }) => {
  const [imageSrc, setImageSrc] = useState(null)

  useEffect(() => {
    let isMounted = true
    Util.getCoverImagePath(id).then((path) => {
      if (isMounted) setImageSrc(path)
    })

    return () => {
      isMounted = false
    }
  }, [id])

  return <img src={imageSrc || 'default_cover.jpg'} alt={title} className='object-cover w-full h-full' />
}

export function ImageCarousel({ filename }) {
  const [filePath, setFilePath] = useState(null)
  useEffect(() => {
    Util.getCarouselPath(filename).then((path) => setFilePath(path))
  }, [])
  return <img src={filePath} alt='carousel' className='w-full h-full object-cover' />
}

export function NotifStack({ notifs, onClose }) {
  return (
    <div className='fixed top-8 right-8 z-50 flex flex-col gap-3 items-end'>
      {notifs.map((notif) => (
        <div
          key={notif.id}
          className={`px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 transition-all duration-500
            ${
              notif.show
                ? 'opacity-100 translate-y-0 pointer-events-auto'
                : 'opacity-0 -translate-y-4 pointer-events-none'
            }
            ${notif.type === 'success' ? 'bg-green-600 text-white' : 'bg-fuchsia-700 text-white'}
          `}
          style={{ minWidth: 280 }}
          onClick={() => onClose(notif.id)}>
          {notif.type === 'success' ? (
            <svg className='w-6 h-6' fill='none' stroke='currentColor' strokeWidth='2' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' d='M5 13l4 4L19 7' />
            </svg>
          ) : (
            <svg className='w-6 h-6' fill='none' stroke='currentColor' strokeWidth='2' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' d='M13 16h-1v-4h-1m1-4h.01' />
            </svg>
          )}
          <span className='font-semibold'>{notif.message}</span>
        </div>
      ))}
    </div>
  )
}

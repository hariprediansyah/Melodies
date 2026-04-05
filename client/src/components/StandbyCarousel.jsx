import React, { useState, useEffect } from 'react'

function StandbyCarousel() {
  const [banners, setBanners] = useState([])
  const [idx, setIdx] = useState(0)
  const [prevIdx, setPrevIdx] = useState(0)
  const [fading, setFading] = useState(false)

  useEffect(() => {
    let isMounted = true
    window.electronAPI.getBannerImages().then((list) => {
      if (isMounted) {
        if (list && list.length > 0) {
          setBanners(list)
        } else {
          // Fallback banners if the API call fails or returns an empty list
          const fallbackBanners = [
            'https://images.unsplash.com/photo-1506157786151-b8491531f063?q=80&w=2070&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=2070&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1499415479124-43c3242d7d0b?q=80&w=2070&auto=format&fit=crop'
          ]
          setBanners(fallbackBanners)
        }
      }
    })
    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    if (banners.length === 0) return
    const interval = setInterval(() => {
      setPrevIdx(idx)
      setFading(true)
      setTimeout(() => {
        setIdx((i) => (i + 1) % banners.length)
        setFading(false)
      }, 500) // fade duration
    }, 5000) // slide duration
    return () => clearInterval(interval)
  }, [banners, idx])

  if (banners.length === 0) return null

  return (
    <div className='absolute inset-0 w-full h-full'>
      {/* New image */}
      <img
        src={banners[idx]}
        alt='Standby'
        className={`w-full h-full object-cover absolute transition-opacity duration-500 ${
          fading ? 'opacity-0' : 'opacity-100'
        }`}
      />
      {/* Old image, only during fading */}
      {fading && (
        <img
          src={banners[prevIdx]}
          alt='Standby-prev'
          className='w-full h-full object-cover absolute transition-opacity duration-500 opacity-100'
        />
      )}
    </div>
  )
}

export default StandbyCarousel

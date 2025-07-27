import React from 'react'

import { useEffect, useRef, useState } from 'react'

const MarqueeText = ({ text, isActive }) => {
  const containerRef = useRef(null)
  const textRef = useRef(null)
  const [duration, setDuration] = useState('10s')

  useEffect(() => {
    if (containerRef.current && textRef.current) {
      const containerWidth = containerRef.current.offsetWidth
      const textWidth = textRef.current.scrollWidth
      const speed = 100 // pixels per second
      const calcDuration = textWidth > containerWidth ? `${textWidth / speed}s` : '0s'
      setDuration(calcDuration)
    }
  }, [text, isActive])

  return (
    <div ref={containerRef} className='relative overflow-hidden'>
      <div
        ref={textRef}
        className={`whitespace-nowrap ${isActive ? 'inline-block' : 'truncate'}`}
        style={{
          animation: isActive ? `marquee ${duration} linear infinite` : undefined
        }}>
        {text}
      </div>
    </div>
  )
}

export default MarqueeText

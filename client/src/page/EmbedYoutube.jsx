import React, { useState, useEffect, useRef } from 'react'

export default function EmbedYoutube({ onHome }) {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showCursor, setShowCursor] = useState(false)
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const iframeRef = useRef(null)

  // YouTube TV User Agent
  const youtubeTVUserAgent =
    'Mozilla/5.0 (X11; Linux i686) AppleWebKit/534.24 (KHTML, like Gecko) Chrome/11.0.696.77 Large Screen Safari/534.24 GoogleTV/092754'

  useEffect(() => {
    // Keyboard shortcuts
    const handleKeyDown = (e) => {
      switch (e.key) {
        case 'F11':
          e.preventDefault()
          toggleFullscreen()
          break
        case 'Escape':
          if (isFullscreen) {
            toggleFullscreen()
          }
          break
        case 'f':
        case 'F':
          if (e.ctrlKey) {
            e.preventDefault()
            toggleFullscreen()
          }
          break
        case 'a':
        case 'A':
          if (e.ctrlKey) {
            e.preventDefault()
            setShowCursor(!showCursor)
          }
          break
        case 's':
        case 'S':
          if (e.ctrlKey) {
            e.preventDefault()
            // TODO: Open settings panel
            console.log('Settings panel - to be implemented')
          }
          break
      }
    }

    // Network status
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    document.addEventListener('keydown', handleKeyDown)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [isFullscreen, showCursor])

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  const sendToTV = () => {
    // Simulate DIAL server functionality
    alert(
      'DIAL Server: Send video to YouTube TV\n\nThis feature allows you to send videos from your phone or computer to this YouTube TV app, just like ChromeCast!'
    )
  }

  const openYouTubeExternal = () => {
    // Open YouTube in external browser as fallback
    window.open('https://www.youtube.com/tv', '_blank')
  }

  return (
    <div className={`flex flex-col h-full bg-[#282828] ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      {/* YouTube TV Header */}
      <div
        className={`flex items-center justify-between p-4 bg-[#282828] border-b border-gray-700 ${
          showCursor ? '' : 'cursor-none'
        }`}>
        <div className='flex items-center gap-4'>
          <button
            className='flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white font-semibold transition'
            onClick={onHome}>
            <span className='text-xl'>&#8592;</span>
            Back
          </button>
          <div className='flex items-center gap-2'>
            <div className='w-8 h-8 bg-red-600 rounded flex items-center justify-center'>
              <span className='text-white font-bold text-sm'>YT</span>
            </div>
            <h1 className='text-xl font-bold text-white'>YouTube TV</h1>
          </div>
        </div>

        <div className='flex items-center gap-2'>
          <button
            onClick={openYouTubeExternal}
            className='px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-white font-semibold transition'
            title='Open YouTube TV in Browser'>
            🌐 Open in Browser
          </button>
          <button
            onClick={sendToTV}
            className='px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-semibold transition'
            title='Send to TV (DIAL Server)'>
            📱 Send to TV
          </button>
          <button
            onClick={() => setShowCursor(!showCursor)}
            className='px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white font-semibold transition'
            title='Toggle Cursor (Ctrl+A)'>
            {showCursor ? '👁️ Hide Cursor' : '👁️ Show Cursor'}
          </button>
          <button
            onClick={toggleFullscreen}
            className='px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white font-semibold transition'
            title='Fullscreen (Ctrl+F)'>
            {isFullscreen ? '⛶ Exit Fullscreen' : '⛶ Fullscreen'}
          </button>
        </div>
      </div>

      {/* YouTube TV Player */}
      <div className='flex-1 w-full relative'>
        <iframe
          ref={iframeRef}
          src='https://www.youtube.com/embed/videoseries?list=PLFgquLnL59alW3xmYiWRaoz0uoM00O5gP&autoplay=1&rel=0&modestbranding=1&controls=1&showinfo=1&iv_load_policy=3&fs=1'
          title='YouTube TV'
          className='w-full h-full border-0'
          allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'
          allowFullScreen
          style={{
            userSelect: 'none',
            cursor: showCursor ? 'default' : 'none'
          }}
        />

        {/* Connection Status */}
        {!isOnline && (
          <div className='absolute top-4 left-1/2 transform -translate-x-1/2 bg-red-600 text-white px-4 py-2 rounded-lg z-10'>
            <p>No tienes conexión</p>
          </div>
        )}

        {/* YouTube TV Controls Overlay */}
        <div className='absolute bottom-4 right-4 flex gap-2'>
          <button className='w-12 h-12 bg-black/70 hover:bg-black/90 rounded-full flex items-center justify-center text-white transition'>
            <span className='text-xl'>⏮</span>
          </button>
          <button className='w-12 h-12 bg-black/70 hover:bg-black/90 rounded-full flex items-center justify-center text-white transition'>
            <span className='text-xl'>⏯</span>
          </button>
          <button className='w-12 h-12 bg-black/70 hover:bg-black/90 rounded-full flex items-center justify-center text-white transition'>
            <span className='text-xl'>⏭</span>
          </button>
        </div>
      </div>

      {/* YouTube TV Info Bar */}
      <div className='bg-[#282828] border-t border-gray-700 p-4'>
        <div className='flex items-center justify-between text-white'>
          <div>
            <h3 className='font-semibold'>YouTube TV</h3>
            <p className='text-gray-400 text-sm'>Large Screen Experience</p>
          </div>
          <div className='text-right'>
            <p className='text-sm text-gray-400'>Ctrl+F: Fullscreen | Ctrl+A: Cursor | Ctrl+S: Settings</p>
          </div>
        </div>
      </div>
    </div>
  )
}

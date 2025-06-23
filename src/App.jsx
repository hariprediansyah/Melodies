import React, { useState } from 'react'
import Home from './page/Home'
import Library from './page/Library'
import MyPlaylist from './page/MyPlaylist'
import Navbar from './components/Navbar'

export default function App() {
  const [page, setPage] = useState('home')
  return (
    <div className='h-screen bg-[#18181b] text-white grid grid-rows-12 px-8'>
      <div className='row-span-1'>
        <Navbar
          onLibrary={() => setPage('library')}
          onHome={() => setPage('home')}
          onPlaylist={() => setPage('playlist')}
          isLibrary={page === 'library'}
          isPlaylist={page === 'playlist'}
        />
      </div>
      <div className='row-span-11'>
        {page === 'home' ? (
          <Home onLibrary={() => setPage('library')} onPlaylist={() => setPage('playlist')} />
        ) : page === 'library' ? (
          <Library onHome={() => setPage('home')} />
        ) : (
          <MyPlaylist onHome={() => setPage('home')} />
        )}
      </div>
    </div>
  )
}

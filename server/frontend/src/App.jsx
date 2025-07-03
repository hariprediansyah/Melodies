import React, { useState } from 'react'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import Dashboard from './pages/Dashboard'
import RoomManagement from './pages/RoomManagement'
import AddEditRoom from './pages/AddEditRoom'
import LibrarySongs from './pages/LibrarySongs'
import AddEditSong from './pages/AddEditSong'
import ContentBanner from './pages/ContentBanner'
import AddEditBanner from './pages/AddEditBanner'

const headerConfig = {
  dashboard: {
    title: 'Unleash Your Inner Star!',
    desc: 'Overview and statistics'
  },
  room: { title: 'Room Management', desc: 'Manage your Rooms here' },
  songs: { title: 'Library Songs', desc: 'Manage your library songs here' },
  banner: { title: 'Content Banner', desc: 'Manage your Promo banner here' },
  settings: { title: 'Settings', desc: 'Application settings' },
  user: { title: 'User', desc: 'User profile and management' }
}

function Layout({ children, menu, onMenuChange }) {
  console.log('Layout component rendered with menu:', menu)
  const header = headerConfig[menu] || headerConfig.dashboard
  return (
    <div className='flex h-screen bg-gray-900'>
      <Sidebar activeMenu={menu} onMenuChange={onMenuChange} />
      <main className='flex-1 p-6 overflow-y-auto'>
        <Header title={header.title} desc={header.desc} menu={menu} />
        <div className='mt-6'>{children}</div>
      </main>
    </div>
  )
}

export default function App() {
  console.log('App component rendered')
  const [activeMenu, setActiveMenu] = useState('dashboard')
  // Untuk navigasi page Room Management
  const [roomPageMode, setRoomPageMode] = useState('list') // 'list' | 'add' | 'edit'
  const [editRoomId, setEditRoomId] = useState(null)
  // Untuk navigasi page Songs
  const [songPageMode, setSongPageMode] = useState('list') // 'list' | 'add' | 'edit'
  const [editSongId, setEditSongId] = useState(null)
  // Untuk navigasi page Banner
  const [bannerPageMode, setBannerPageMode] = useState('list') // 'list' | 'add' | 'edit'
  const [editBannerId, setEditBannerId] = useState(null)

  // Room Management handlers
  const handleRoomAdd = () => {
    setRoomPageMode('add')
    setEditRoomId(null)
  }
  const handleRoomEdit = (id) => {
    setRoomPageMode('edit')
    setEditRoomId(id)
  }
  const handleRoomBack = () => {
    setRoomPageMode('list')
    setEditRoomId(null)
  }

  // Songs handlers
  const handleSongAdd = () => {
    setSongPageMode('add')
    setEditSongId(null)
  }
  const handleSongEdit = (id) => {
    setSongPageMode('edit')
    setEditSongId(id)
  }
  const handleSongBack = () => {
    setSongPageMode('list')
    setEditSongId(null)
  }

  // Banner handlers
  const handleBannerAdd = () => {
    setBannerPageMode('add')
    setEditBannerId(null)
  }
  const handleBannerEdit = (id) => {
    setBannerPageMode('edit')
    setEditBannerId(id)
  }
  const handleBannerBack = () => {
    setBannerPageMode('list')
    setEditBannerId(null)
  }

  const renderContent = () => {
    switch (activeMenu) {
      case 'dashboard':
        return <Dashboard />
      case 'room':
        if (roomPageMode === 'add') {
          return <AddEditRoom mode='add' onBack={handleRoomBack} />
        }
        if (roomPageMode === 'edit') {
          return <AddEditRoom mode='edit' roomId={editRoomId} onBack={handleRoomBack} />
        }
        return <RoomManagement onAdd={handleRoomAdd} onEdit={handleRoomEdit} />
      case 'songs':
        if (songPageMode === 'add') {
          return <AddEditSong mode='add' onBack={handleSongBack} />
        }
        if (songPageMode === 'edit') {
          return <AddEditSong mode='edit' songId={editSongId} onBack={handleSongBack} />
        }
        return <LibrarySongs onAdd={handleSongAdd} onEdit={handleSongEdit} />
      case 'banner':
        if (bannerPageMode === 'add') {
          return <AddEditBanner mode='add' onBack={handleBannerBack} setBannerPageMode={setBannerPageMode} />
        }
        if (bannerPageMode === 'edit') {
          return (
            <AddEditBanner
              mode='edit'
              bannerId={editBannerId}
              onBack={handleBannerBack}
              setBannerPageMode={setBannerPageMode}
            />
          )
        }
        return <ContentBanner onAdd={handleBannerAdd} onEdit={handleBannerEdit} />
      case 'settings':
        return <div className='text-white text-2xl font-bold'>Settings</div>
      case 'user':
        return <div className='text-white text-2xl font-bold'>User</div>
      default:
        return <Dashboard />
    }
  }

  return (
    <Layout menu={activeMenu} onMenuChange={setActiveMenu}>
      {renderContent()}
    </Layout>
  )
}

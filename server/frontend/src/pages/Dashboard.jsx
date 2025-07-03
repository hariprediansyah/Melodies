import React, { useState, useEffect } from 'react'

const API_URL = 'http://localhost:4000'

export default function Dashboard() {
  const [stats, setStats] = useState({
    rooms: { total: 0, active: 0, standby: 0, inactive: 0 },
    songs: { total: 0 },
    banners: { total: 0, active: 0, inactive: 0 }
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const [roomsRes, songsRes, bannersRes] = await Promise.all([
        fetch(`${API_URL}/rooms`),
        fetch(`${API_URL}/songs`),
        fetch(`${API_URL}/banners`)
      ])

      const rooms = await roomsRes.json()
      const songs = await songsRes.json()
      const banners = await bannersRes.json()

      setStats({
        rooms: {
          total: rooms.length,
          active: rooms.filter((r) => r.status === 'Active').length,
          standby: rooms.filter((r) => r.status === 'Standby').length,
          inactive: rooms.filter((r) => r.status === 'Inactive').length
        },
        songs: {
          total: songs.length
        },
        banners: {
          total: banners.length,
          active: banners.filter((b) => b.status === 'Active').length,
          inactive: banners.filter((b) => b.status === 'Inactive').length
        }
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className='text-center py-8'>Loading...</div>
  }

  return (
    <div>
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
        {/* Total Rooms */}
        <div className='bg-gray-800 rounded-xl p-6'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-gray-400 text-sm'>Total Rooms</p>
              <p className='text-3xl font-bold text-white'>{stats.rooms.total}</p>
            </div>
            <div className='text-4xl'>🏢</div>
          </div>
          <div className='mt-4 flex gap-2 text-xs'>
            <span className='text-green-400'>{stats.rooms.active} Active</span>
            <span className='text-yellow-400'>{stats.rooms.standby} Standby</span>
            <span className='text-red-400'>{stats.rooms.inactive} Inactive</span>
          </div>
        </div>

        {/* Total Songs */}
        <div className='bg-gray-800 rounded-xl p-6'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-gray-400 text-sm'>Total Songs</p>
              <p className='text-3xl font-bold text-white'>{stats.songs.total}</p>
            </div>
            <div className='text-4xl'>🎵</div>
          </div>
          <div className='mt-4'>
            <p className='text-xs text-gray-400'>Library songs available</p>
          </div>
        </div>

        {/* Active Banners */}
        <div className='bg-gray-800 rounded-xl p-6'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-gray-400 text-sm'>Active Banners</p>
              <p className='text-3xl font-bold text-white'>{stats.banners.active}</p>
            </div>
            <div className='text-4xl'>🖼️</div>
          </div>
          <div className='mt-4'>
            <p className='text-xs text-gray-400'>of {stats.banners.total} total banners</p>
          </div>
        </div>

        {/* System Status */}
        <div className='bg-gray-800 rounded-xl p-6'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-gray-400 text-sm'>System Status</p>
              <p className='text-3xl font-bold text-green-400'>Online</p>
            </div>
            <div className='text-4xl'>🟢</div>
          </div>
          <div className='mt-4'>
            <p className='text-xs text-gray-400'>All systems operational</p>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className='bg-gray-800 rounded-xl p-6'>
        <h3 className='text-xl font-bold text-white mb-4'>Recent Activity</h3>
        <div className='space-y-3'>
          <div className='flex items-center gap-3 text-sm'>
            <div className='w-2 h-2 bg-green-400 rounded-full'></div>
            <span className='text-gray-300'>System started successfully</span>
            <span className='text-gray-500 ml-auto'>Just now</span>
          </div>
          <div className='flex items-center gap-3 text-sm'>
            <div className='w-2 h-2 bg-blue-400 rounded-full'></div>
            <span className='text-gray-300'>Database connection established</span>
            <span className='text-gray-500 ml-auto'>2 minutes ago</span>
          </div>
          <div className='flex items-center gap-3 text-sm'>
            <div className='w-2 h-2 bg-yellow-400 rounded-full'></div>
            <span className='text-gray-300'>API endpoints ready</span>
            <span className='text-gray-500 ml-auto'>5 minutes ago</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className='mt-8 bg-gray-800 rounded-xl p-6'>
        <h3 className='text-xl font-bold text-white mb-4'>Quick Actions</h3>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          <button className='bg-fuchsia text-white px-4 py-3 rounded-lg font-semibold hover:bg-fuchsia/80 transition'>
            Add New Room
          </button>
          <button className='bg-fuchsia text-white px-4 py-3 rounded-lg font-semibold hover:bg-fuchsia/80 transition'>
            Upload Songs
          </button>
          <button className='bg-fuchsia text-white px-4 py-3 rounded-lg font-semibold hover:bg-fuchsia/80 transition'>
            Create Banner
          </button>
        </div>
      </div>
    </div>
  )
}

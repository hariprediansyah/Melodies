import React, { useState, useEffect } from 'react'
import { bannerAPI } from '../services/api'
import { CustomTable, BannerForm } from '../components/Components'

const statusColor = {
  Active: 'text-green-400',
  Inactive: 'text-red-400'
}

export default function ContentBanner({ onAdd, onEdit }) {
  const [search, setSearch] = useState('')
  const [banners, setBanners] = useState([])
  const [loading, setLoading] = useState(true)

  // Fetch banners from API
  const fetchBanners = async () => {
    try {
      const data = await bannerAPI.getAll()
      setBanners(data)
      console.log(data)
    } catch (error) {
      console.error('Error fetching banners:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBanners()
  }, [])

  useEffect(() => {
    const handleBannerBack = () => {
      fetchBanners()
    }
    window.addEventListener('banner-back', handleBannerBack)
    return () => window.removeEventListener('banner-back', handleBannerBack)
  }, [])

  const filteredBanners = banners.filter((b) => b.title.toLowerCase().includes(search.toLowerCase()))

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this banner?')) {
      try {
        await bannerAPI.delete(id)
        fetchBanners()
      } catch (error) {
        console.error('Error deleting banner:', error)
      }
    }
  }

  const columns = [
    { key: 'no', label: 'No' },
    { key: 'image', label: 'Banner' },
    { key: 'title', label: 'Title' },
    { key: 'description', label: 'Description' },
    { key: 'actions', label: ' ' }
  ]

  const renderCell = (col, banner, idx) => {
    if (col.key === 'no') return idx + 1
    if (col.key === 'image') {
      // Coba beberapa ekstensi umum
      const now = Date.now()
      const imgSrc = `http://localhost:4000/carousels/${banner.id}.jpg?t=${now}`
      return <img src={imgSrc} alt={banner.title} className='w-24 h-12 object-cover rounded' />
    }
    if (col.key === 'actions')
      return (
        <div className='flex gap-2'>
          <button className='p-2 rounded hover:bg-gray-700' onClick={() => onEdit(banner.id)}>
            <svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none'>
              <path
                d='M16.475 5.40795L18.592 7.52495M17.836 3.54295L12.109 9.26995C11.8122 9.56479 11.6102 9.94156 11.529 10.3519L11 12.9999L13.648 12.4699C14.058 12.3879 14.434 12.1869 14.73 11.8909L20.457 6.16395C20.6291 5.99185 20.7656 5.78754 20.8588 5.56269C20.9519 5.33783 20.9998 5.09683 20.9998 4.85345C20.9998 4.61007 20.9519 4.36907 20.8588 4.14421C20.7656 3.91936 20.6291 3.71505 20.457 3.54295C20.2849 3.37085 20.0806 3.23434 19.8557 3.1412C19.6309 3.04806 19.3899 3.00012 19.1465 3.00012C18.9031 3.00012 18.6621 3.04806 18.4373 3.1412C18.2124 3.23434 18.0081 3.37085 17.836 3.54295Z'
                stroke='white'
                strokeOpacity='0.92'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
              />
              <path
                d='M19 15V18C19 18.5304 18.7893 19.0391 18.4142 19.4142C18.0391 19.7893 17.5304 20 17 20H6C5.46957 20 4.96086 19.7893 4.58579 19.4142C4.21071 19.0391 4 18.5304 4 18V7C4 6.46957 4.21071 5.96086 4.58579 5.58579C4.96086 5.21071 5.46957 5 6 5H9'
                stroke='white'
                strokeOpacity='0.92'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
              />
            </svg>
          </button>
          <button className='p-2 rounded hover:bg-gray-700' onClick={() => handleDelete(banner.id)}>
            <svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none'>
              <path
                d='M16.4141 12L17.8281 10.586C18.0103 10.3974 18.111 10.1448 18.1088 9.8826C18.1065 9.6204 18.0013 9.36959 17.8159 9.18418C17.6305 8.99877 17.3797 8.8936 17.1175 8.89133C16.8553 8.88905 16.6027 8.98984 16.4141 9.172L15.0001 10.586L13.5861 9.172C13.4938 9.07649 13.3835 9.00031 13.2615 8.9479C13.1395 8.89549 13.0083 8.8679 12.8755 8.86675C12.7427 8.8656 12.611 8.8909 12.4881 8.94118C12.3652 8.99146 12.2536 9.06571 12.1597 9.15961C12.0658 9.2535 11.9916 9.36515 11.9413 9.48805C11.891 9.61094 11.8657 9.74262 11.8668 9.8754C11.868 10.0082 11.8956 10.1394 11.948 10.2614C12.0004 10.3834 12.0766 10.4938 12.1721 10.586L13.5861 12L12.1721 13.414C12.0766 13.5062 12.0004 13.6166 11.948 13.7386C11.8956 13.8606 11.868 13.9918 11.8668 14.1246C11.8657 14.2574 11.891 14.3891 11.9413 14.512C11.9916 14.6349 12.0658 14.7465 12.1597 14.8404C12.2536 14.9343 12.3652 15.0085 12.4881 15.0588C12.611 15.1091 12.7427 15.1344 12.8755 15.1333C13.0083 15.1321 13.1395 15.1045 13.2615 15.0521C13.3835 14.9997 13.4938 14.9235 13.5861 14.828L15.0001 13.414L16.4141 14.828C16.5063 14.9235 16.6167 14.9997 16.7387 15.0521C16.8607 15.1045 16.9919 15.1321 17.1247 15.1333C17.2575 15.1344 17.3892 15.1091 17.512 15.0588C17.6349 15.0085 17.7466 14.9343 17.8405 14.8404C17.9344 14.7465 18.0086 14.6349 18.0589 14.512C18.1092 14.3891 18.1345 14.2574 18.1333 14.1246C18.1322 13.9918 18.1046 13.8606 18.0522 13.7386C17.9998 13.6166 17.9236 13.5062 17.8281 13.414L16.4141 12ZM9.82809 5H20.0001C20.5305 5 21.0392 5.21071 21.4143 5.58579C21.7894 5.96086 22.0001 6.46957 22.0001 7V17C22.0001 17.5304 21.7894 18.0391 21.4143 18.4142C21.0392 18.7893 20.5305 19 20.0001 19H9.82809C9.2977 18.9999 8.78908 18.7891 8.41409 18.414L2.70709 12.707C2.51962 12.5195 2.41431 12.2652 2.41431 12C2.41431 11.7348 2.51962 11.4805 2.70709 11.293L8.41409 5.586C8.78908 5.2109 9.2977 5.00011 9.82809 5Z'
                fill='#C02121'
              />
            </svg>
          </button>
        </div>
      )
    return banner[col.key]
  }

  if (loading) {
    return <div className='text-center py-8'>Loading...</div>
  }

  return (
    <div>
      <div className='flex justify-between items-center mb-4'>
        <div className='font-bold text-xl'>List Content Banner</div>
        <div className='flex gap-2'>
          <input
            type='text'
            placeholder='Search Banner'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className='px-4 py-2 rounded bg-gray-800 text-white outline-none'
          />
          <button
            className='bg-[#EE10B0] text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2'
            onClick={onAdd}>
            <span>
              <svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none'>
                <path
                  d='M7.00708 12C7.00708 11.801 7.0861 11.6103 7.22675 11.4696C7.3674 11.329 7.55817 11.25 7.75708 11.25H11.2501V7.75696C11.2501 7.55805 11.3291 7.36728 11.4698 7.22663C11.6104 7.08598 11.8012 7.00696 12.0001 7.00696C12.199 7.00696 12.3898 7.08598 12.5304 7.22663C12.6711 7.36728 12.7501 7.55805 12.7501 7.75696V11.25H16.2431C16.442 11.25 16.6328 11.329 16.7734 11.4696C16.9141 11.6103 16.9931 11.801 16.9931 12C16.9931 12.1989 16.9141 12.3896 16.7734 12.5303C16.6328 12.6709 16.442 12.75 16.2431 12.75H12.7501V16.243C12.7501 16.4419 12.6711 16.6326 12.5304 16.7733C12.3898 16.9139 12.199 16.993 12.0001 16.993C11.8012 16.993 11.6104 16.9139 11.4698 16.7733C11.3291 16.6326 11.2501 16.4419 11.2501 16.243V12.75H7.75708C7.55817 12.75 7.3674 12.6709 7.22675 12.5303C7.0861 12.3896 7.00708 12.1989 7.00708 12Z'
                  fill='white'
                />
              </svg>
            </span>
            Add New Banner
          </button>
        </div>
      </div>
      <CustomTable columns={columns} data={filteredBanners} rowsPerPage={10} renderCell={renderCell} />
    </div>
  )
}

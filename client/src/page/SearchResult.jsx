import React, { useEffect, useState } from 'react'
import Util from '../Util'

export default function SearchResult({ keyword, onBack, onOpenYoutube }) {
  const [results, setResults] = useState([])
  const [coverMap, setCoverMap] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      const songs = await window.electronAPI.getData('songs')
      const filtered = songs.filter(
        (song) =>
          song.title?.toLowerCase().includes(keyword.toLowerCase()) ||
          song.artist?.toLowerCase().includes(keyword.toLowerCase()) ||
          song.album?.toLowerCase().includes(keyword.toLowerCase())
      )
      setResults(filtered)
      const coverObj = {}
      for (const song of filtered) {
        coverObj[song.id] = await Util.getCoverImagePath(song.id)
      }
      setCoverMap(coverObj)
      setLoading(false)
    }
    fetchData()
  }, [keyword])

  return (
    <div className='px-8 py-6'>
      <div className='flex items-center mb-6'>
        <button className='text-purple flex items-center gap-2' onClick={onBack}>
          <span className='text-xl'>&#8592;</span> <span>Kembali</span>
        </button>
        <h2 className='text-2xl font-semibold ml-6'>
          Hasil pencarian untuk: <span className='text-fuchsia-400'>{keyword}</span>
        </h2>
      </div>
      {loading ? (
        <div className='text-center text-white'>Mencari...</div>
      ) : results.length > 0 ? (
        <div className='grid grid-cols-5 gap-6'>
          {results.map((item, idx) => (
            <div key={idx} className='bg-[#23232b] rounded-xl p-2 flex-shrink-0'>
              <div className='w-full bg-gray-700 rounded-xl mb-2 overflow-hidden flex items-center justify-center h-40'>
                <img
                  src={coverMap[item.id] || 'default_cover.jpg'}
                  alt={item.title}
                  className='object-cover w-full h-full'
                />
              </div>
              <div className='text-white font-semibold text-base truncate'>{item.title}</div>
              <div className='text-gray-400 text-sm truncate'>{item.artist}</div>
            </div>
          ))}
        </div>
      ) : (
        <div className='text-center text-white mt-12'>
          Tidak ada yang cocok untuk <b>{keyword}</b>
          <div className='mt-4'>
            <button
              className='px-4 py-2 bg-red-600 hover:bg-red-700 rounded text-white font-semibold'
              onClick={onOpenYoutube}>
              Buka dengan YouTube
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

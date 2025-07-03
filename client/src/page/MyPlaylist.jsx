import React, { useEffect, useState } from 'react'
import { CoverImage } from '../Components'
import VideoComponent from '../components/VideoComponent'
import Util from '../Util'
import { Box, Plus } from 'lucide-react'

const MyPlaylist = ({ onHome, onLibrary, masterVolume, musicVolume, micVolume }) => {
  const [playlist, setPlaylist] = useState([])
  const [recomended, setRecomended] = useState([])
  const [selectedSong, setSelectedSong] = useState(null)

  useEffect(() => {
    getData()
  }, [])

  async function getData() {
    const listData = await window.electronAPI.getPlaylist()
    const listSongs = await window.electronAPI.getData('songs')
    setPlaylist(listData)
    const firstSong = listData.length > 0 ? listData[0] : listSongs[0]

    // Generate rekomendasi berdasarkan genre
    const recomendedList = listSongs.filter((song) => song.genre === firstSong.genre)
    const listId = listData.map((song) => song.id)
    const recomendedListFiltered = recomendedList.filter((song) => !listId.includes(song.id))
    const recomendedListToAdd = listSongs.filter((song) => !recomendedList.includes(song) && !listId.includes(song.id))
    const recomendedListFinal = [...recomendedListFiltered, ...recomendedListToAdd].slice(0, 5)
    setRecomended(recomendedListFinal)

    setSelectedSong(listData.length > 0 ? listData[0] : null)
  }

  const handleSongEnd = async () => {
    if (!selectedSong || playlist.length === 0) return

    const currentIndex = playlist.findIndex((song) => song.id === selectedSong.id)

    await window.electronAPI.removeFromPlaylist(selectedSong.id)

    const updatedPlaylist = playlist.filter((song) => song.id !== selectedSong.id)
    setPlaylist(updatedPlaylist)

    if (updatedPlaylist.length > 0) {
      const nextIndex = currentIndex < updatedPlaylist.length ? currentIndex : 0
      setSelectedSong(updatedPlaylist[nextIndex])
    } else {
      setSelectedSong(null)
    }
  }

  return (
    <div className='px-8 py-6'>
      <button className='text-purple mb-4 flex items-center gap-2' onClick={onHome}>
        <span className='text-xl'>&#8592;</span> <span>Back to Home</span>
      </button>

      <div className='grid grid-cols-12 gap-4'>
        <div className='col-span-9 bg-[#23232b] rounded-lg flex flex-col'>
          {selectedSong && (
            <VideoComponent id={selectedSong.id} onEnded={handleSongEnd} volume={masterVolume} micVolume={micVolume} />
          )}
        </div>

        <div className='col-span-3 bg-[#23232b] h-full rounded-lg p-4'>
          <p className='text-xl font-bold'>Next Song</p>
          <p className='text-[#B2B2B2] mt-2'>Your queue songs</p>
          <div className='w-full border border-[#666666] mt-3'></div>
          <div className='flex flex-col gap-4 mt-4 h-[400px] pr-2 overflow-y-auto'>
            {playlist.length > 0 ? (
              playlist.map((song) => (
                <div
                  key={song.id}
                  className={`border-b border-[#23232b] hover:bg-[#23232b] transition cursor-pointer ${
                    selectedSong?.id === song.id ? 'bg-[#343434]' : ''
                  }`}
                  onClick={() => setSelectedSong(song)}>
                  <div className='py-2 px-2 flex items-center gap-5'>
                    <span className='w-12 h-12 bg-gray-700 rounded overflow-hidden flex items-center justify-center'>
                      <CoverImage id={song.id} title={song.title} />
                    </span>
                    <div>
                      <div className='font-semibold'>{song.title}</div>
                      <div className='text-xs text-gray-400'>{song.artist}</div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className='flex flex-col justify-center items-center h-full'>
                <div
                  className='flex flex-col items-center cursor-pointer text-white hover:text-gray-300 transition group'
                  onClick={onLibrary}>
                  <div className='w-6 h-6 border border-white group-hover:border-gray-300 rounded overflow-hidden flex items-center justify-center transition duration-300'>
                    <Plus size={20} className='text-white group-hover:text-gray-300 transition duration-300' />
                  </div>
                  <p className='p-4'>Add Song to your playlist</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedSong && (
        <div className='bg-[#23232b] rounded-lg p-4 mt-4 flex gap-4'>
          <div className='w-24 h-24 bg-gray-700 rounded overflow-hidden flex items-center justify-center'>
            <CoverImage id={selectedSong.id} title={selectedSong.title} />
          </div>
          <div>
            <p className='text-4xl font-bold'>{selectedSong.title}</p>
            <p className='text-lg text-[#B2B2B2]'>{selectedSong.artist}</p>
          </div>
        </div>
      )}

      <div>
        <p className='text-4xl font-bold mt-4'>
          Recomended <span className='text-purple'>Songs</span>
        </p>
        <div className='grid grid-cols-5 gap-6 mt-4'>
          {recomended.map((item, idx) => (
            <div
              key={idx}
              className='bg-[#23232b] rounded-xl p-2 flex-shrink-0 cursor-pointer hover:bg-[#343434] group'
              onClick={async () => {
                await Util.addToPlaylist(item)
                getData()
              }}>
              <div className='w-full bg-gray-700 rounded-xl mb-2 overflow-hidden flex items-center justify-center h-40 relative'>
                <CoverImage id={item.id} title={item.title} />
                <div className='absolute inset-0 flex flex-col items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity'>
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    className='w-10 h-10 mb-2 text-white'
                    fill='none'
                    viewBox='0 0 24 24'
                    stroke='currentColor'
                    strokeWidth='2'>
                    <path strokeLinecap='round' strokeLinejoin='round' d='M12 4v16m8-8H4' />
                  </svg>
                  <span className='text-white font-bold text-lg'>Add to Playlist</span>
                </div>
              </div>
              <div className='text-white font-semibold text-base truncate'>{item.title}</div>
              <div className='text-gray-400 text-sm truncate'>{item.artist}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default MyPlaylist

import React, { useEffect, useState } from 'react'
import Util from '../Util'
import CoverImage from '../Components'

const MyPlaylist = ({ onHome }) => {
  const [playlist, setPlaylist] = useState([])
  const [selectedSong, setSelectedSong] = useState(null)

  useEffect(() => {
    getData()
  }, [])

  async function getData() {
    const dbInstance = await Util.getDb()
    const listSong = dbInstance.exec('SELECT * FROM playlist')
    const listData = Util.convertSqlJsResult(listSong)
    setPlaylist(listData)
    setSelectedSong(listData.length > 0 ? listData[0] : null)
  }
  return (
    <div>
      <div className='px-8 py-6'>
        <button className='text-purple mb-4 flex items-center gap-2' onClick={onHome}>
          <span className='text-xl'>&#8592;</span> <span>Back to Home</span>
        </button>
        <div className='grid grid-cols-12 gap-4'>
          <div className='col-span-9 h-[500px] bg-[#23232b] rounded-lg flex flex-col'>
            <div className='w-full bg-black'>
              <video
                src={selectedSong ? `../storage/${selectedSong?.id}/song.dat` : null}
                className='w-full h-[500px] object-cover rounded-lg'
                controls
              />
            </div>
          </div>
          <div className='col-span-3 bg-[#1E1E1E] h-full rounded-lg p-4'>
            <p className='text-xl font-bold '>Next Song</p>
            <p className='text-[#B2B2B2] mt-2'>Your queue songs</p>
            <div className='w-full border border-[#666666] mt-3'></div>
            <div className='flex flex-col gap-4 mt-4 h-[400px] pr-2'>
              {playlist.map((song, index) => (
                <div
                  key={index}
                  className={`border-b border-[#23232b] hover:bg-[#23232b] transition ${
                    selectedSong?.id === song.id ? 'bg-[#343434]' : ''
                  }`}
                  onClick={() => setSelectedSong(song)}>
                  <div className='py-2 px-2 flex items-center gap-5 align-middle'>
                    <span className='w-12 h-12 bg-gray-700 rounded overflow-hidden flex items-center justify-center'>
                      <CoverImage id={song.id} title={song.title} />
                    </span>
                    <div>
                      <div className='font-semibold'>{song.title}</div>
                      <div className='text-xs text-gray-400'>{song.artist}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className='bg-[#23232b] rounded-lg p-4 mt-4 flex gap-4'>
          <div className='w-24 h-24 bg-gray-700 rounded overflow-hidden flex items-center justify-center'>
            <CoverImage id={selectedSong?.id} title={selectedSong?.title} />
          </div>
          <div>
            <p className='text-4xl font-bold'>{selectedSong?.title}</p>
            <p className='text-lg text-[#B2B2B2]'>{selectedSong?.artist}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MyPlaylist

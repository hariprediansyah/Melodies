import React, { useState, useEffect, useCallback, useRef } from 'react'
import SongList from '../components/SongList'
import Playlist from '../components/Playlist'
import PlayerControls from '../components/PlayerControls'
import DateDisplay from '../components/DateDisplay'
import { Youtube, ListMusic, ListPlus } from 'lucide-react'
import Util from '../Util'

export default function Home({ onBankMusic, searchQuery, setSearchQuery, setQuery }) {
  const [playlist, setPlaylist] = useState([])
  const [localSongs, setLocalSongs] = useState([])
  const [allSongs, setAllSongs] = useState([])
  const [youtubeSongs, setYoutubeSongs] = useState([])
  const [isYoutubeMode, setIsYoutubeMode] = useState(false)
  const [config, setConfig] = useState(null)

  const [currentSongIndex, setCurrentSongIndex] = useState(-1)
  const [isPlaying, setIsPlaying] = useState(false)
  const [selectedSong, setSelectedSong] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const songsPerPage = 10

  const playlistRef = useRef([])
  const currentIndexRef = useRef(-1)

  useEffect(() => {
    playlistRef.current = playlist
    currentIndexRef.current = currentSongIndex
  }, [playlist, currentSongIndex])

  const currentSong = currentSongIndex > -1 ? playlist[currentSongIndex] : null
  const displayedSongs = isYoutubeMode ? youtubeSongs : localSongs

  // Pagination logic
  const indexOfLastSong = currentPage * songsPerPage
  const indexOfFirstSong = indexOfLastSong - songsPerPage
  const currentSongs = displayedSongs.slice(indexOfFirstSong, indexOfLastSong)
  const totalPages = Math.ceil(displayedSongs.length / songsPerPage)

  const paginate = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber)
    }
  }
  // Fetch local songs and config on mount
  useEffect(() => {
    window.electronAPI.openVideoWindow().catch(console.error)
    window.electronAPI.getData('songs').then(setAllSongs).catch(console.error)
    window.electronAPI.getConfig().then(setConfig).catch(console.error)
  }, [])

  // Fetch playlist dari server saat mount (lewat IPC)
  useEffect(() => {
    async function fetchPlaylistFromServer() {
      try {
        const data = await window.electronAPI.syncPlaylistGet()
        console.log(data)

        setPlaylist(
          data.map((song) => ({
            ...song,
            isYoutube: !!song.is_youtube,
            video_url: song.video_url
          }))
        )
      } catch (err) {
        console.error('Failed to fetch playlist from server:', err)
      }
    }
    fetchPlaylistFromServer()
  }, [])

  // Tambahkan ke playlist dan sync ke server (lewat IPC)
  const handleNewEntry = () => {
    if (selectedSong && !playlist.find((p) => p.id === selectedSong.id)) {
      selectedSong.isYoutube = isYoutubeMode
      setPlaylist([...playlist, selectedSong])
      window.electronAPI.syncPlaylistAdd(selectedSong)
    }
  }

  const handleClearPlaylist = () => {
    window.electronAPI.syncPlaylistRemoveAll()
    setPlaylist([])
    setCurrentSongIndex(-1)
    setIsPlaying(false)
  }

  // Hapus dari playlist dan sync ke server (lewat IPC)
  const handleDelete = () => {
    if (selectedSong) {
      const newPlaylist = playlist.filter((p) => p.id !== selectedSong.id)
      setPlaylist(newPlaylist)
      window.electronAPI.syncPlaylistRemove(selectedSong.id)
      if (currentSong && currentSong.id === selectedSong.id) {
        setCurrentSongIndex(-1)
        setIsPlaying(false)
        window.electronAPI.closeVideoWindow()
      }
    }
  }

  // Saat lagu selesai, hapus dari playlist dan sync ke server (lewat IPC)
  useEffect(() => {
    const handleSongEnd = () => {
      const playlist = playlistRef.current
      const currentSongIndex = currentIndexRef.current
      if (currentSongIndex > -1 && playlist.length > 0) {
        const songId = playlist[currentSongIndex]?.id
        const newPlaylist = playlist.filter((_, i) => i !== currentSongIndex)
        setPlaylist(newPlaylist)
        if (songId) window.electronAPI.syncPlaylistRemove(songId)
        if (newPlaylist.length > 0) {
          const nextIndex = currentSongIndex >= newPlaylist.length ? 0 : currentSongIndex
          setCurrentSongIndex(nextIndex)
          setSelectedSong(newPlaylist[nextIndex])
          playSongAtIndex(nextIndex)
        } else {
          setCurrentSongIndex(-1)
          setSelectedSong(null)
          setIsPlaying(false)
        }
      }
    }
    window.electronAPI.onVideoEnded(handleSongEnd)

    const handleAddToPlaylist = (song) => {
      if (song && !playlist.find((p) => p.id === song.id)) {
        setPlaylist([...playlist, song])
      }
    }
    window.electronAPI.onAddToPlaylist(handleAddToPlaylist)

    return () => {
      // Cleanup if necessary, though electronAPI might not support removing listeners
    }
  }, [])

  // Handle search query changes
  useEffect(() => {
    if (!searchQuery) {
      if (isYoutubeMode) {
        setYoutubeSongs([])
        return
      }
    }

    if (isYoutubeMode) {
      if (config?.youtubeApiKey) {
        window.electronAPI.searchYoutube(config.youtubeApiKey, searchQuery).then((results) => {
          if (!results.error) {
            setYoutubeSongs(results)
          } else {
            console.error(results.error)
          }
        })
      }
    } else {
      const filtered = allSongs.filter(
        (song) =>
          song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          song.artist.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setLocalSongs(filtered)
    }
  }, [searchQuery, isYoutubeMode, config, allSongs])

  const playSongAtIndex = useCallback(
    async (index) => {
      console.log(playlist)
      if (index < 0 || index >= playlist.length) {
        setIsPlaying(false)
        setCurrentSongIndex(-1)
        return
      }
      setCurrentSongIndex(index)
      setIsPlaying(true)
      const song = playlist[index]
      const storagePath = await window.electronAPI.getStorageBaseDir()
      let videoSrc
      if (song.isYoutube) {
        videoSrc = `https://www.youtube.com/embed/${song.id}`
      } else {
        videoSrc = `file://${storagePath}/songs/${song.id}/song.mp4`
      }
      console.log(videoSrc)

      window.electronAPI.sendVideoControl({ type: 'LOAD', src: videoSrc, isYoutube: !!song.isYoutube })
    },
    [playlist]
  )

  const handlePlayPause = useCallback(() => {
    if (!currentSong) {
      if (playlist.length > 0) {
        playSongAtIndex(0)
      }
      return
    }

    const newIsPlaying = !isPlaying
    setIsPlaying(newIsPlaying)
    window.electronAPI.sendVideoControl({ type: newIsPlaying ? 'PLAY' : 'PAUSE' })
  }, [currentSong, isPlaying, playlist, playSongAtIndex])

  const handleNext = useCallback(() => {
    playSongAtIndex((currentSongIndex + 1) % playlist.length)
  }, [currentSongIndex, playlist.length, playSongAtIndex])

  const handlePrev = useCallback(() => {
    const prevIndex = currentSongIndex - 1 < 0 ? playlist.length - 1 : currentSongIndex - 1
    playSongAtIndex(prevIndex)
  }, [currentSongIndex, playlist.length, playSongAtIndex])

  const handleTop = () => {
    if (selectedSong && playlist.find((p) => p.id === selectedSong.id)) {
      const otherSongs = playlist.filter((p) => p.id !== selectedSong.id)
      setPlaylist([selectedSong, ...otherSongs])
    }
  }

  return (
    <div className='row-span-14 p-8'>
      <div className='grid grid-cols-3 gap-8 h-full'>
        {/* Left Column */}
        <div className='col-span-2 grid grid-rows-15 gap-4 h-full overflow-hidden'>
          <div className='row-span-10'>
            <SongList
              songs={currentSongs}
              onSelectSong={setSelectedSong}
              selectedSong={selectedSong}
              isYoutubeMode={isYoutubeMode}
            />
          </div>
          <div className='row-span-1 flex justify-between items-center mt-4'>
            <button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className='bg-black bg-opacity-20 hover:bg-opacity-40 text-white font-bold py-2 px-4 rounded-lg disabled:opacity-50'>
              Previous
            </button>
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
              className='bg-black bg-opacity-20 hover:bg-opacity-40 text-white font-bold py-2 px-4 rounded-lg disabled:opacity-50'>
              Next
            </button>
          </div>
          <div className='row-span-2 flex gap-4 mt-4'>
            <button
              onClick={onBankMusic}
              className='flex-1 bg-black bg-opacity-50 hover:bg-opacity-40 border border-white/10 hover:border-gray-600 text-white font-bold py-4 px-4 rounded-lg flex items-center justify-center gap-2 transition-all'>
              <ListMusic /> Bank Music
            </button>
            <button
              onClick={() => {
                if (isYoutubeMode) {
                  setLocalSongs(allSongs)
                  setSearchQuery('')
                  setQuery('')
                }
                setIsYoutubeMode(!isYoutubeMode)
              }}
              className={`flex-1 bg-black bg-opacity-50 hover:bg-opacity-40 border border-white/10 hover:border-gray-600 text-white font-bold py-4 px-4 rounded-lg flex items-center justify-center gap-2 transition-all ${
                isYoutubeMode ? 'bg-red-600' : ''
              }`}>
              <img src='youtube.png' width={30} />
              YouTube
            </button>
            <button
              onClick={handleNewEntry}
              className='flex-1 bg-black bg-opacity-50 hover:bg-opacity-40 border border-white/10 hover:border-gray-600 text-white font-bold py-4 px-4 rounded-lg flex items-center justify-center gap-2 transition-all'>
              <ListPlus /> New Entry
            </button>
          </div>
          <PlayerControls
            isPlaying={isPlaying}
            onPlayPause={handlePlayPause}
            onNext={handleNext}
            onPrev={handlePrev}
            currentSong={currentSong}
          />
        </div>

        {/* Right Column */}
        <div className='col-span-1 grid grid-rows-12 gap-4 h-full overflow-hidden'>
          <DateDisplay />
          <Playlist
            playlist={playlist}
            onSelectSong={setSelectedSong}
            selectedSong={selectedSong}
            onPlaySong={(song) => playSongAtIndex(playlist.indexOf(song))}
            currentSong={currentSong}
          />
          <div className='row-span-2 flex justify-between gap-4 mt-4'>
            <button
              onClick={handleTop}
              className='flex-1 bg-black bg-opacity-50 hover:bg-opacity-40 border border-white/10 hover:border-gray-600 text-white font-bold py-3 px-4 rounded-lg transition-all'>
              TOP
            </button>
            <button
              onClick={handleDelete}
              className='flex-1 bg-black bg-opacity-20 hover:bg-opacity-40 border border-white/10 hover:border-gray-600 text-white font-bold py-3 px-4 rounded-lg transition-all'>
              DEL
            </button>
            <button
              onClick={handleClearPlaylist}
              className='flex-1 bg-black bg-opacity-20 hover:bg-opacity-40 border border-white/10 hover:border-gray-600 text-white font-bold py-3 px-4 rounded-lg transition-all'>
              CLR
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

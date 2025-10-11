import React, { useState, useEffect, useCallback, useRef } from 'react'
import SongList from '../components/SongList'
import Playlist from '../components/Playlist'
import PlayerControls from '../components/PlayerControls'
import DateDisplay from '../components/DateDisplay'
import { Youtube, ListMusic, ListPlus, CircleArrowUp, CircleArrowDown } from 'lucide-react'
import Util from '../Util'

export default function Home({ onBankMusic, searchQuery, setSearchQuery, setQuery, mode, setMode }) {
  const [playlist, setPlaylist] = useState([])
  const [localSongs, setLocalSongs] = useState([])
  const [allSongs, setAllSongs] = useState([])
  const [youtubeSongs, setYoutubeSongs] = useState([])
  const [newSongs, setNewSongs] = useState([])
  const [config, setConfig] = useState(null)
  const [youtubeRecommendations, setYoutubeRecommendations] = useState([])

  const [currentSongIndex, setCurrentSongIndex] = useState(-1)
  const [isPlaying, setIsPlaying] = useState(false)
  const [selectedSong, setSelectedSong] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const songsPerPage = 10

  const playlistRef = useRef([])
  const playlistScrollRef = useRef(null)
  const currentIndexRef = useRef(-1)

  useEffect(() => {
    playlistRef.current = playlist
    currentIndexRef.current = currentSongIndex
  }, [playlist, currentSongIndex])

  const currentSong = currentSongIndex > -1 ? playlist[currentSongIndex] : null
  const displayedSongs = mode === 'youtube' ? youtubeSongs : mode === 'local' ? localSongs : newSongs

  // Pagination logic
  const indexOfLastSong = currentPage * songsPerPage
  const indexOfFirstSong = indexOfLastSong - songsPerPage
  // const currentSongs = displayedSongs.slice(indexOfFirstSong, indexOfLastSong)
  const totalPages = Math.ceil(displayedSongs.length / songsPerPage)

  const paginate = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber)
    }
  }
  // Fetch local songs and config on mount
  useEffect(() => {
    window.electronAPI
      .getSongs()
      .then((songs) => {
        setAllSongs(songs)
        console.log('songs', songs)
      })
      .catch(console.error)
    window.electronAPI.getConfig().then(setConfig).catch(console.error)
    window.electronAPI.youtubeRecommend().then(setYoutubeRecommendations).catch(console.error)
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
    // Display 20 newest songs
    if (mode != 'new') {
      setSearchQuery('')
      setQuery('')
      const sortedSongs = allSongs.sort(
        (a, b) => new Date(b.created_at || b.timeInput) - new Date(a.created_at || a.timeInput)
      )
      setNewSongs(sortedSongs.slice(0, 20))
      setMode('new')
    }
  }

  const handleAddToPlaylist = (selectedSong) => {
    if (!selectedSong) return
    if (selectedSong && !playlist.find((p) => p.id == selectedSong.id)) {
      selectedSong.isYoutube = mode === 'youtube'
      setPlaylist([...playlist, selectedSong])
      window.electronAPI.syncPlaylistAdd(selectedSong)
      window.electronAPI.youtubeRecommend().then(setYoutubeRecommendations).catch(console.error)
      console.log('Added to playlist:', selectedSong)
      console.log('playlist', playlist)

      if (playlist.length === 0) {
        playSongAtIndex(0, [...playlist, selectedSong]) // Play the first song if it's the only one
      }
    }
  }

  const handleClearPlaylist = () => {
    window.electronAPI.syncPlaylistRemoveAll()
    window.electronAPI.sendVideoControl({ type: 'STOP' })
    setSelectedSong(null)
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
        window.electronAPI.sendVideoControl({ type: 'STOP' })
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
        if (songId) window.electronAPI.syncPlaylistRemove(songId)
        if (newPlaylist.length > 0) {
          const nextIndex = currentSongIndex >= newPlaylist.length ? 0 : currentSongIndex
          setPlaylist(newPlaylist)
          setTimeout(() => {
            setCurrentSongIndex(nextIndex)
            setSelectedSong(newPlaylist[nextIndex])
            playSongAtIndex(nextIndex, newPlaylist) // gunakan playlist terbaru
          }, 0)
        } else {
          setPlaylist(newPlaylist)
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
      if (mode === 'youtube') {
        setYoutubeSongs(youtubeRecommendations)
        return
      }
    }

    if (mode === 'youtube') {
      if (config?.youtubeApiKey) {
        // window.electronAPI.searchYoutube(config.youtubeApiKey, searchQuery).then((results) => {
        //   if (!results.error) {
        //     setYoutubeSongs(results)
        //   } else {
        //     console.error(results.error)
        //   }
        // })
        window.electronAPI
          .searchYoutubeNew(searchQuery)
          .then((results) => {
            if (!results.error) {
              setYoutubeSongs(results)
            } else {
              console.error(results.error)
            }
          })
          .catch(console.error)
      }
    } else if (mode === 'new') {
      const sortedSongs = allSongs.sort(
        (a, b) => new Date(b.created_at || b.timeInput) - new Date(a.created_at || a.timeInput)
      )
      const filtered = sortedSongs.filter(
        (song) =>
          song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          song.artist.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setNewSongs(filtered.slice(0, 20))
    } else {
      const filtered = allSongs.filter(
        (song) =>
          song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          song.artist.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setLocalSongs(filtered)
    }
  }, [searchQuery, mode, config, allSongs])

  const playSongAtIndex = useCallback(
    async (index, customPlaylist) => {
      const pl = customPlaylist || playlist
      console.log('playlist', pl, index)
      if (index < 0 || index >= pl.length) {
        setIsPlaying(false)
        setCurrentSongIndex(-1)
        // Sembunyikan info lagu selanjutnya jika tidak ada lagu berikutnya
        window.electronAPI.sendVideoControl({ type: 'SET_NEXT_SONG_TITLE', title: '' })
        return
      }
      setCurrentSongIndex(index)
      setIsPlaying(true)
      const song = pl[index]
      // Kirim info lagu selanjutnya
      const nextIndex = (index + 1) % pl.length
      const nextSong = pl[nextIndex]
      window.electronAPI.sendVideoControl({
        type: 'SET_NEXT_SONG_TITLE',
        title: nextSong && pl.length > 1 ? nextSong.title : ''
      })
      const storagePath = await window.electronAPI.getStorageBaseDir()
      let videoSrc
      if (song.isYoutube) {
        videoSrc = `https://www.youtube.com/embed/${song.id}`
      } else {
        videoSrc = `file://${storagePath}/songs/${song.id}/song.mp4`
      }
      window.electronAPI.sendVideoControl({ type: 'LOAD', src: videoSrc, isYoutube: !!song.isYoutube, id: song.id })
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
    if (currentSongIndex > -1 && playlist.length > 1) {
      window.electronAPI.sendVideoControl({ type: 'STOP' })
      const nextIndex = currentSongIndex + 1
      const newPlaylist = playlist.filter((_, i) => i !== currentSongIndex)
      window.electronAPI.syncPlaylistRemove(currentSong.id)

      setPlaylist(newPlaylist)
      if (newPlaylist.length > 0) {
        const adjustedIndex = nextIndex > currentSongIndex ? nextIndex - 1 : nextIndex
        playSongAtIndex(adjustedIndex % newPlaylist.length, newPlaylist)
      }
    }
  }, [currentSongIndex, playlist, playSongAtIndex, currentSong?.id])

  const handlePrev = useCallback(() => {
    const prevIndex = currentSongIndex - 1 < 0 ? playlist.length - 1 : currentSongIndex - 1
    playSongAtIndex(prevIndex)
  }, [currentSongIndex, playlist.length, playSongAtIndex])

  const handleTop = () => {
    console.log(playlistScrollRef.current)

    if (playlist.length > 0) {
      // Scroll to top
      if (playlistScrollRef.current) {
        console.log('Scrolled to top of playlist')
        playlistScrollRef.current.scrollTo({ top: 0, behavior: 'smooth' })
      }

      // Play lagu kedua tanpa play
      if (!selectedSong) {
        setSelectedSong(playlist[0])
        return
      }
      if (playlist[1]) {
        const firstSong = playlist[1]
        setSelectedSong(firstSong)
      }
    }
  }

  const handleUp = () => {
    // // play lagu sebelumnya
    // if (currentSongIndex > 0) {
    //   playSongAtIndex(currentSongIndex - 1)
    // }
    // Select lagu sebelumnya (tanpa play)
    if (!selectedSong) {
      setSelectedSong(playlist[0])
      return
    }
    const currentSongIndex = playlist.findIndex((song) => song.id === selectedSong.id)
    if (playlist[currentSongIndex - 1]) {
      // scroll ke atas
      if (playlistScrollRef.current) {
        const songElements = playlistScrollRef.current.children
        if (songElements[currentSongIndex - 1]) {
          songElements[currentSongIndex - 1].scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      }

      const prevSong = playlist[currentSongIndex - 1]
      setSelectedSong(prevSong)
    }
  }

  const handleDown = () => {
    // // play lagu berikutnya
    // if (currentSongIndex < playlist.length - 1) {
    //   playSongAtIndex(currentSongIndex + 1)
    // }
    // Select lagu berikutnya (tanpa play)
    // cari index dari selectedSong
    if (!selectedSong) {
      setSelectedSong(playlist[0])
      return
    }
    const currentSongIndex = playlist.findIndex((song) => song.id === selectedSong.id)
    if (playlist[currentSongIndex + 1]) {
      // scroll ke bawah
      if (playlistScrollRef.current) {
        const songElements = playlistScrollRef.current.children
        if (songElements[currentSongIndex + 1]) {
          songElements[currentSongIndex + 1].scrollIntoView({ behavior: 'smooth', block: 'end' })
        }
      }
      const nextSong = playlist[currentSongIndex + 1]
      setSelectedSong(nextSong)
    }
  }

  return (
    <div className='row-span-14 p-4'>
      <div className='grid grid-cols-3 gap-8 h-full'>
        {/* Left Column */}
        <div className='col-span-2 grid grid-rows-15 gap-2 h-full overflow-hidden'>
          <div className='row-span-11 '>
            <SongList
              handleAddToPlaylist={handleAddToPlaylist}
              songs={displayedSongs} // semua data
              onSelectSong={setSelectedSong}
              selectedSong={selectedSong}
              isYoutubeMode={mode === 'youtube'}
            />
          </div>
          <div className='row-span-2 flex gap-4 mt-4 text-3xl'>
            <button
              onClick={() => {
                if (mode === 'youtube' || mode === 'new') {
                  setLocalSongs(allSongs)
                  setSearchQuery('')
                  setQuery('')
                }
                setMode('local')
              }}
              className={`flex-1 bg-black bg-opacity-50 hover:bg-opacity-40 border border-white/10 hover:border-gray-600 text-white font-bold py-4 px-4 rounded-lg flex items-center justify-center gap-2 transition-all ${
                mode === 'local' ? 'bg-green-700' : ''
              }`}>
              <ListMusic /> Bank Music
            </button>
            <button
              onClick={() => {
                if (mode != 'youtube') {
                  setYoutubeSongs(youtubeRecommendations)
                  setMode('youtube')
                }
              }}
              className={`flex-1 bg-black bg-opacity-50 hover:bg-opacity-40 border border-white/10 hover:border-gray-600 text-white font-bold py-4 px-4 rounded-lg flex items-center justify-center gap-2 transition-all ${
                mode === 'youtube' ? 'bg-green-700' : ''
              }`}>
              <img src='youtube.png' width={30} />
              YouTube
            </button>
            <button
              onClick={handleNewEntry}
              className={`flex-1 bg-black bg-opacity-50 hover:bg-opacity-40 border border-white/10 hover:border-gray-600 text-white font-bold py-4 px-4 rounded-lg flex items-center justify-center gap-2 transition-all ${
                mode === 'new' ? 'bg-green-700' : ''
              }`}>
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
            ref={playlistScrollRef}
            playlist={playlist}
            onSelectSong={setSelectedSong}
            selectedSong={selectedSong}
            onPlaySong={(song) => playSongAtIndex(playlist.indexOf(song))}
            currentSong={currentSong}
          />
          <div className='row-span-2 flex justify-between gap-1 mt-4 text-2xl'>
            <button
              onClick={handleUp}
              className='flex bg-black bg-opacity-50 hover:bg-opacity-40 border border-white/10 hover:border-gray-600 text-white font-bold py-2 px-2 rounded-lg transition-all items-center justify-center'>
              <CircleArrowUp width={30} height={30} />
            </button>
            <button
              onClick={handleDown}
              className='flex bg-black bg-opacity-50 hover:bg-opacity-40 border border-white/10 hover:border-gray-600 text-white font-bold py-2 px-2 rounded-lg transition-all items-center justify-center'>
              <CircleArrowDown width={30} height={30} />
            </button>
            <button
              onClick={handleTop}
              className='flex-1 bg-black bg-opacity-50 hover:bg-opacity-40 border border-white/10 hover:border-gray-600 text-white font-bold py-3 px-2 rounded-lg transition-all'>
              TOP
            </button>
            <button
              onClick={handleDelete}
              className='flex-1 bg-black bg-opacity-20 hover:bg-opacity-40 border border-white/10 hover:border-gray-600 text-white font-bold py-3 px-2 rounded-lg transition-all'>
              DEL
            </button>
            <button
              onClick={handleClearPlaylist}
              className='flex-1 bg-black bg-opacity-20 hover:bg-opacity-40 border border-white/10 hover:border-gray-600 text-white font-bold py-3 px-2 rounded-lg transition-all'>
              CLR
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

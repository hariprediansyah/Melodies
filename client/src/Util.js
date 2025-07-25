import { useState, useRef } from 'react'

class Util {
  static async seedDb() {
    try {
      await window.electronAPI.seedDb()
    } catch (error) {
      console.error('Failed to seed DB:', error)
    }
  }

  static async truncateDb() {
    try {
      await window.electronAPI.truncateDb()
    } catch (error) {
      console.error('Failed to truncate DB:', error)
    }
  }

  static async addToPlaylist(song) {
    try {
      await window.electronAPI.addToPlaylist(song)
    } catch (error) {
      console.error('Failed to add to playlist:', error)
    }
  }

  static async syncPlaylistAdd(song) {
    try {
      const room_id = await window.electronAPI.getSysParam('client_room_id')
      const server_ip = await window.electronAPI.getSysParam('server_ip')
      if (!room_id) throw new Error('room_id not found')
      const payload = {
        room_id,
        id: song.id,
        title: song.title,
        artist: song.artist,
        video_url: song.video_url || '',
        is_youtube: !!song.isYoutube
      }
      await fetch(`http://${server_ip}/playlist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
    } catch (err) {
      console.error('Failed to sync playlist add:', err)
    }
  }

  static async syncPlaylistRemove(songId) {
    try {
      const room_id = await window.electronAPI.getSysParam('client_room_id')
      const server_ip = await window.electronAPI.getSysParam('server_ip')
      if (!room_id) throw new Error('room_id not found')
      await fetch(`http://${server_ip}/playlist/${songId}?room_id=${room_id}`, {
        method: 'DELETE'
      })
    } catch (err) {
      console.error('Failed to sync playlist remove:', err)
    }
  }

  static async getCarouselPath(filename) {
    const baseDir = await window.electronAPI.getStorageBaseDir()
    return `file://${baseDir}/banners/${filename}`
  }

  static async getCoverImagePath(id) {
    const baseDir = await window.electronAPI.getStorageBaseDir()
    const fileExtensions = ['jpg', 'jpeg', 'png']
    let filePath = null

    for (const ext of fileExtensions) {
      const currentPath = `${baseDir}/songs/${id}/cover.${ext}`
      console.log(currentPath)

      if (await window.electronAPI.fileExists(currentPath)) {
        filePath = currentPath
        break
      }
    }
    const returnPath = (await window.electronAPI.fileExists(filePath))
      ? `file://${filePath.replace(/\\/g, '/')}`
      : `default_cover.jpg`

    return returnPath
  }

  static async getVideoPath(id) {
    const baseDir = await window.electronAPI.getStorageBaseDir()
    const fileExtensions = ['dat', 'mp4', 'mkv']
    let filePath = null
    for (const ext of fileExtensions) {
      const currentPath = `${baseDir}/songs/${id}/song.${ext}`
      if (await window.electronAPI.fileExists(currentPath)) {
        filePath = currentPath
        break
      }
    }
    const returnPath = (await window.electronAPI.fileExists(filePath)) ? `file://${filePath.replace(/\\/g, '/')}` : null

    return returnPath
  }

  static async makeCall() {
    try {
      // Use IPC to make a call through the electron main process
      const callResult = await window.electronAPI.makeCall()
      console.log(callResult)

      if (!callResult.success) {
        throw new Error(callResult.error || 'Failed to make call')
      }

      return callResult.call_id
    } catch (err) {
      console.error('Failed to make call:', err)
      throw err
    }
  }

  static async checkCallStatus(callId) {
    try {
      // Use IPC to check call status through the electron main process
      const callStatus = await window.electronAPI.checkCallStatus(callId)
      return callStatus
    } catch (err) {
      console.error('Failed to check call status:', err)
      throw err
    }
  }
}

let notifId = 0
export function useNotifStack() {
  const [notifs, setNotifs] = useState([])
  const timeoutRefs = useRef({})

  const showNotif = (msg, notifType = 'success') => {
    const id = ++notifId
    setNotifs((prev) => [...prev, { id, show: true, message: msg, type: notifType }])
    timeoutRefs.current[id] = setTimeout(() => {
      setNotifs((prev) => prev.map((n) => (n.id === id ? { ...n, show: false } : n)))
      setTimeout(() => setNotifs((prev) => prev.filter((n) => n.id !== id)), 500)
    }, 2000)
  }

  const onClose = (id) => {
    setNotifs((prev) => prev.map((n) => (n.id === id ? { ...n, show: false } : n)))
    setTimeout(() => setNotifs((prev) => prev.filter((n) => n.id !== id)), 500)
    if (timeoutRefs.current[id]) clearTimeout(timeoutRefs.current[id])
  }

  return { notifs, showNotif, onClose }
}

export default Util

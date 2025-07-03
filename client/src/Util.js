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

  static async getCarouselPath(filename) {
    const baseDir = await window.electronAPI.getStorageBaseDir()
    return `file://${baseDir}/carousels/${filename}`
  }

  static async getCoverImagePath(id) {
    const baseDir = await window.electronAPI.getStorageBaseDir()
    const fileExtensions = ['jpg', 'jpeg', 'png']
    let filePath = null

    for (const ext of fileExtensions) {
      const currentPath = `${baseDir}/songs/${id}/cover.${ext}`
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

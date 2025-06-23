import React from 'react'
import { useEffect, useState } from 'react'

function CoverImage({ id, title, className = '' }) {
  const [imagePath, setImagePath] = useState('')

  useEffect(() => {
    const loadImage = async () => {
      try {
        if (window.electronAPI) {
          const path = await window.electronAPI.getCoverImagePath(id)
          setImagePath(path)
        } else {
          // Fallback untuk development di browser
          setImagePath(`/storage/${id}/cover.jpg`)
        }
      } catch (error) {
        console.error('Error loading cover image:', error)
        setImagePath('./storage/default_cover.jpg')
      }
    }

    loadImage()
  }, [id])

  return (
    <img
      src={imagePath}
      alt={title || 'Cover Image'}
      className={`object-cover ${className}`}
      onError={(e) => {
        e.target.src = '/storage/default_cover.jpg'
      }}
    />
  )
}

export default CoverImage

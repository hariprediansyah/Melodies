import React, { useEffect, useState } from 'react'
import Util from './Util'

export const CoverImage = ({ id, title }) => {
  const [imageSrc, setImageSrc] = useState(null)

  useEffect(() => {
    let isMounted = true
    Util.getCoverImagePath(id).then((path) => {
      if (isMounted) setImageSrc(path)
    })

    return () => {
      isMounted = false
    }
  }, [id])

  return <img src={imageSrc || 'default_cover.jpg'} alt={title} className='object-cover w-full h-full' />
}

export function ImageCarousel({ filename }) {
  const [filePath, setFilePath] = useState(null)
  useEffect(() => {
    Util.getCarouselPath(filename).then((path) => setFilePath(path))
  }, [])
  return <img src={filePath} alt='carousel' className='w-full h-full object-cover' />
}

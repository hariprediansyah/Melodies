import 'slick-carousel/slick/slick.css'
import 'slick-carousel/slick/slick-theme.css'
import Slider from 'react-slick'
import React, { useState, useEffect, useRef } from 'react'
import Util from '../Util'
import { ImageCarousel } from '../Components'

export default function Home({ onLibrary, onPlaylist, onYoutube }) {
  const [carouselData, setCarouselData] = useState([])

  const [idx, setIdx] = useState(0)
  const [fade, setFade] = useState(false)

  const settings = {
    dots: false,
    infinite: true,
    speed: 700,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    arrows: false,
    beforeChange: (oldIndex, newIndex) => {
      setFade(true)
      setTimeout(() => {
        setIdx(newIndex)
        setFade(false)
      }, 350)
    },
    afterChange: (current) => {
      setIdx(current)
    }
  }

  useEffect(() => {
    async function loadData() {
      const carousels = await window.electronAPI.getData('carousels')
      console.log('carousels', carousels)

      setCarouselData(carousels)
    }
    loadData()
  }, [])

  return (
    <main className='pb-8 grid grid-rows-12 gap-6 h-full'>
      {carouselData.length > 0 && (
        <div className='relative rounded-2xl overflow-hidden w-full flex items-stretch row-span-10'>
          <div className='absolute inset-0 w-full h-full z-0'>
            <Slider {...settings} slickGoTo={idx}>
              {carouselData.map((item, i) => (
                <div key={i} className='w-full h-full'>
                  <ImageCarousel filename={item.id + '.jpg'} />
                </div>
              ))}
            </Slider>
            <div className='absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent z-10' />
          </div>
          <div
            className={`relative z-20 flex flex-col justify-end p-12 h-full w-1/2 transition-opacity duration-500 ${
              fade ? 'opacity-0' : 'opacity-100'
            }`}>
            <h1 className='text-4xl font-bold mb-2 whitespace-pre-line'>{carouselData[idx].title}</h1>
            <p className='mb-4 text-sm text-gray-200 max-w-xl'>{carouselData[idx].desc}</p>
            <div className='flex gap-2 mt-4'>
              {carouselData.map((_, i) => (
                <div
                  key={i}
                  className={`w-3 h-3 rounded-full border-none focus:outline-none ${
                    i === idx ? 'bg-fuchsia-500' : 'bg-gray-400/60'
                  }`}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      )}
      <div className='flex gap-6 row-span-2'>
        <button
          className='flex-1 flex items-center justify-center gap-2 bg-[#23232b] py-6 rounded-xl text-lg font-semibold hover:bg-[#2d2d38] transition'
          onClick={() => window.electronAPI.loadYouTubeTV()}>
          <img src='youtube.png' className='w-7 h-7' alt='YouTube' /> YouTube
        </button>
        <button
          className='flex-1 flex items-center justify-center gap-2 bg-[#23232b] py-6 rounded-xl text-lg font-semibold hover:bg-[#2d2d38] transition'
          onClick={onLibrary}>
          <svg className='w-7 h-7' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
            <rect x='3' y='4' width='18' height='16' rx='2' strokeWidth='2' />
          </svg>{' '}
          Library
        </button>
        <button
          className='flex-1 flex items-center justify-center gap-2 bg-[#23232b] py-6 rounded-xl text-lg font-semibold hover:bg-[#2d2d38] transition'
          onClick={onPlaylist}>
          <svg className='w-7 h-7' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
            <circle cx='12' cy='12' r='10' strokeWidth='2' />
            <path d='M12 8v4l3 3' strokeWidth='2' />
          </svg>{' '}
          Your Playlist
        </button>
      </div>
    </main>
  )
}

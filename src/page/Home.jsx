import 'slick-carousel/slick/slick.css'
import 'slick-carousel/slick/slick-theme.css'
import Slider from 'react-slick'
import React, { useState, useEffect, useRef } from 'react'

export default function Home({ onLibrary, onPlaylist }) {
  const carouselData = [
    {
      title: 'Sing Your Heart Out.\nThe Ultimate Karaoke Collection!',
      desc: 'Discover our karaoke app, where you can dive into a fantastic library of both classic hits and the latest chart-toppers. Sing along to your favorite songs in stunning quality, all while enjoying a seamless experience. No matter your musical preference, we have the perfect tracks to get you singing!',
      img: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4'
    },
    {
      title: 'Koleksi Lagu Terbaru',
      desc: 'Nikmati update lagu-lagu terbaru setiap minggu, langsung dari chart dunia!',
      img: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745'
    },
    {
      title: 'Karaoke Kualitas Tinggi',
      desc: 'Audio jernih dan lirik realtime, pengalaman karaoke terbaik untuk semua usia.',
      img: 'https://images.unsplash.com/photo-1466428996289-fb355538da1b'
    },
    {
      title: 'Buat Playlist Favoritmu',
      desc: 'Susun dan simpan lagu favoritmu, siap dinyanyikan kapan saja!',
      img: 'https://images.unsplash.com/photo-1631746363761-e0f78d373b73'
    }
  ]

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

  return (
    <main className='pb-8 grid grid-rows-12 gap-6 h-full'>
      <div className='relative rounded-2xl overflow-hidden w-full flex items-stretch row-span-10'>
        <div className='absolute inset-0 w-full h-full z-0'>
          <Slider {...settings} slickGoTo={idx}>
            {carouselData.map((item, i) => (
              <div key={i} className='w-full h-full'>
                <img src={item.img} alt='carousel' className='w-full h-full object-cover' />
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
      <div className='flex gap-6 row-span-2'>
        <button className='flex-1 flex items-center justify-center gap-2 bg-[#23232b] py-6 rounded-xl text-lg font-semibold hover:bg-[#2d2d38] transition'>
          <img src='https://cdn-icons-png.flaticon.com/512/1384/1384060.png' className='w-7 h-7' alt='YouTube' />{' '}
          YouTube
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

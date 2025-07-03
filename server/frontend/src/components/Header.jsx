import React from 'react'
import { GlassCard } from './Components'

export default function Header({ title, desc, menu }) {
  return (
    // <div className='rounded-2xl bg-gradient-to-r from-[#1c141c] to-[#66537d] p-8 flex flex-col mb-6 shadow-md relative overflow-hidden'>
    <div
      className={`rounded-2xl ${
        menu == 'dashboard' ? 'bg-[url("./bg_dashboard.png")]' : 'bg-[url("./bg_nav.png")]'
      } bg-cover bg-center p-8 flex flex-col mb-6 shadow-md relative overflow-hidden`}>
      <div className='z-10'>
        <h1 className='text-3xl font-bold text-white flex items-center gap-3'>
          {menu === 'room' && (
            <span className='text-2xl'>
              <svg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40' fill='none'>
                <path
                  d='M33.3333 31.6667H31.6667V8.33333C31.6667 7.41667 30.9167 6.66667 30 6.66667H23.3333C23.3333 5.75 22.5833 5 21.6667 5H10C9.08333 5 8.33333 5.75 8.33333 6.66667V31.6667H6.66667C5.75 31.6667 5 32.4167 5 33.3333C5 34.25 5.75 35 6.66667 35H21.6667C22.5833 35 23.3333 34.25 23.3333 33.3333V10H28.3333V33.3333C28.3333 34.25 29.0833 35 30 35H33.3333C34.25 35 35 34.25 35 33.3333C35 32.4167 34.25 31.6667 33.3333 31.6667ZM18.3333 21.6667C17.4167 21.6667 16.6667 20.9167 16.6667 20C16.6667 19.0833 17.4167 18.3333 18.3333 18.3333C19.25 18.3333 20 19.0833 20 20C20 20.9167 19.25 21.6667 18.3333 21.6667Z'
                  fill='white'
                />
              </svg>
            </span>
          )}
          {menu === 'songs' && (
            <span className='text-2xl'>
              <svg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40' fill='none'>
                <path
                  d='M18.2916 5.00332C18.3892 5.43429 18.3116 5.88636 18.0759 6.26015C17.8403 6.63394 17.4658 6.89886 17.0349 6.99665C14.2635 7.62857 11.7665 9.12968 9.90844 11.2809C8.05037 13.4322 6.92844 16.1209 6.70639 18.9548C6.48434 21.7887 7.17379 24.6194 8.67413 27.0338C10.1745 29.4482 12.4071 31.3199 15.0464 32.3757C17.6856 33.4316 20.5931 33.6164 23.3448 32.9031C26.0964 32.1898 28.548 30.6157 30.3419 28.4107C32.1358 26.2057 33.178 23.485 33.3165 20.6458C33.455 17.8066 32.6824 14.9975 31.1116 12.6283C30.9904 12.446 30.9064 12.2416 30.8642 12.0268C30.8221 11.812 30.8227 11.591 30.8659 11.3764C30.9533 10.9431 31.2092 10.5621 31.5774 10.3175C31.9456 10.0728 32.3959 9.98445 32.8293 10.0718C33.0439 10.1151 33.2479 10.2002 33.4295 10.3222C33.6112 10.4443 33.7671 10.601 33.8883 10.7833C35.7044 13.5137 36.6711 16.7208 36.6666 20C36.6666 29.205 29.2049 36.6666 19.9999 36.6666C10.7949 36.6666 3.33325 29.205 3.33325 20C3.33325 12.0667 8.87492 5.42998 16.2983 3.74665C16.7292 3.64909 17.1813 3.72666 17.5551 3.96231C17.9289 4.19796 18.1938 4.5724 18.2916 5.00332ZM21.6666 5.02332C21.6664 4.7733 21.7219 4.52638 21.829 4.30049C21.9362 4.0746 22.0923 3.87541 22.2861 3.71741C22.4798 3.5594 22.7064 3.44654 22.9492 3.38702C23.192 3.3275 23.4451 3.32282 23.6899 3.37332L23.8816 3.42498L28.8599 5.08498C29.2644 5.21864 29.6023 5.50208 29.8043 5.87709C30.0063 6.2521 30.057 6.69022 29.9461 7.10148C29.8352 7.51273 29.571 7.86592 29.2078 8.08849C28.8447 8.31107 28.4101 8.38615 27.9933 8.29832L27.8066 8.24832L24.9999 7.31165V20C24.9994 21.0471 24.6702 22.0676 24.0587 22.9176C23.4472 23.7676 22.5843 24.4041 21.5917 24.7375C20.5991 25.0708 19.5269 25.0841 18.5263 24.7755C17.5257 24.4669 16.6473 23.852 16.0149 23.0174C15.3825 22.1829 15.028 21.1709 15.0015 20.1241C14.975 19.0774 15.2778 18.0487 15.8672 17.1832C16.4566 16.3178 17.3028 15.6592 18.2865 15.3004C19.2702 14.9415 20.3417 14.9006 21.3499 15.1833L21.6666 15.2833V5.02498V5.02332Z'
                  fill='white'
                />
              </svg>
            </span>
          )}
          {menu === 'banner' && (
            <span className='text-2xl'>
              <svg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40' fill='none'>
                <path
                  d='M32.5 6.25H7.5C5.42893 6.25 3.75 7.92893 3.75 10V30C3.75 32.0711 5.42893 33.75 7.5 33.75H32.5C34.5711 33.75 36.25 32.0711 36.25 30V10C36.25 7.92893 34.5711 6.25 32.5 6.25Z'
                  stroke='white'
                  strokeWidth='2.5'
                  strokeLinejoin='round'
                />
                <path
                  d='M26.25 16.25C27.6307 16.25 28.75 15.1307 28.75 13.75C28.75 12.3693 27.6307 11.25 26.25 11.25C24.8693 11.25 23.75 12.3693 23.75 13.75C23.75 15.1307 24.8693 16.25 26.25 16.25Z'
                  stroke='white'
                  strokeWidth='2.5'
                  strokeMiterlimit='10'
                />
                <path
                  d='M23.75 26.2335L16.6672 19.1639C16.2165 18.7133 15.6107 18.4519 14.9737 18.433C14.3366 18.4141 13.7164 18.6392 13.2398 19.0624L3.75 27.4999M17.5 33.7499L27.1359 24.1139C27.5766 23.6724 28.1665 23.4115 28.7896 23.3826C29.4128 23.3537 30.0242 23.5588 30.5039 23.9577L36.25 28.7499'
                  stroke='white'
                  strokeWidth='2.5'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                />
              </svg>
            </span>
          )}
          {title}
        </h1>
        {menu === 'dashboard' && (
          <h1 className='text-3xl font-bold text-white flex items-center gap-3'>The Ultimate Karaoke Experience!</h1>
        )}
        <p className='text-white/70 mt-2 text-lg'>{desc}</p>
        {/* Info summary */}
        {menu === 'room' && (
          <div className='flex gap-4 mt-6'>
            <div className='bg-[#38333e] border-[#5c5564] rounded-lg px-6 py-2 text-white font-semibold text-lg'>
              Total Room <span className='ml-2 font-bold'>20</span>
            </div>
            <div className='bg-[#38333e] border-[#5c5564] rounded-lg px-6 py-2 text-white font-semibold text-lg'>
              Room Active <span className='ml-2 font-bold'>12</span>
            </div>
          </div>
        )}
        {menu === 'songs' && (
          <div className='flex gap-4 mt-6'>
            <div className='bg-[#38333e] rounded-lg px-6 py-2 text-white font-semibold text-lg'>
              Library Songs <span className='ml-2 font-bold'>1,580</span>
            </div>
            <div className='bg-[#38333e] rounded-lg px-6 py-2 text-white font-semibold text-lg'>
              Folder <span className='ml-2 font-bold'>25</span>
            </div>
          </div>
        )}
        {menu === 'banner' && (
          <div className='flex gap-4 mt-6'>
            <div className='bg-[#38333e] rounded-lg px-6 py-2 text-white font-semibold text-lg'>
              Total Banner <span className='ml-2 font-bold'>3</span>
            </div>
          </div>
        )}
        {menu === 'dashboard' && (
          <div className='flex gap-4 mt-6'>
            <GlassCard className='flex max-w-content items-center gap-2'>
              Status Online
              <div className='w-2 h-2 bg-green-500 rounded-full p-[5px]'></div>
            </GlassCard>
            <GlassCard className='flex max-w-content items-center gap-2'>
              <p>Room Active</p>
              <p>12</p>
            </GlassCard>
            <GlassCard className='flex max-w-content items-center gap-2'>
              <p>Library Songs</p>
              <p>1,580</p>
            </GlassCard>
          </div>
        )}
      </div>
      {/* Background vinyl effect (dummy) */}
      <div className='absolute right-0 top-0 h-full flex items-center z-0 opacity-30'>
        <svg width='300' height='150' viewBox='0 0 300 150'>
          <circle cx='150' cy='75' r='70' fill='#000' fillOpacity='0.3' />
          <circle cx='220' cy='75' r='70' fill='#000' fillOpacity='0.2' />
        </svg>
      </div>
    </div>
  )
}

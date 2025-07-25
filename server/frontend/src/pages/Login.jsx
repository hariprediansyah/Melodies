import React, { useState } from 'react'

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    // In a real app, you would validate credentials here
    // For now, we'll just call the onLogin prop to navigate to the main menu
    onLogin()
  }

  return (
    <div className='flex flex-col items-center justify-center h-screen bg-black text-white'>
      {/* Logo */}
      <div className='mb-8'>
        <div className='flex flex-col items-center'>
          {/* House icon with gradient bars */}
          <div className='w-24 h-20 mb-2 relative'>
            <div className='absolute inset-0 flex justify-center'>
              {[...Array(7)].map((_, i) => (
                <div
                  key={i}
                  className='w-2 mx-0.5 rounded-t-md h-full'
                  style={{
                    background: `linear-gradient(to bottom, #4299e1 0%, #68d391 100%)`,
                    height: `${70 + Math.sin(i * 0.8) * 30}%`
                  }}
                />
              ))}
            </div>
          </div>
          <h1 className='text-2xl font-bold tracking-wider'>GREEN HOUSE</h1>
          <p className='text-xs tracking-widest'>KARAOKE & LOUNGE</p>
          <p className='text-xs mt-1 text-gray-400'>Elevate Your Night</p>
        </div>
      </div>

      {/* Login Form */}
      <h2 className='text-2xl font-semibold mb-8'>Log into Your Account</h2>

      <form onSubmit={handleSubmit} className='w-full max-w-md px-6'>
        {/* Email Input */}
        <div className='mb-6 relative'>
          <div className='flex items-center bg-[#222222] rounded-md'>
            <div className='pl-4 pr-2'>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                className='h-5 w-5 text-gray-400'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'
                />
              </svg>
            </div>
            <input
              type='email'
              placeholder='Email'
              className='w-full py-3 px-2 bg-transparent outline-none'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        </div>

        {/* Password Input */}
        <div className='mb-8 relative'>
          <div className='flex items-center bg-[#222222] rounded-md'>
            <div className='pl-4 pr-2'>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                className='h-5 w-5 text-gray-400'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z'
                />
              </svg>
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder='Password'
              className='w-full py-3 px-2 bg-transparent outline-none'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button type='button' className='pr-4' onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? (
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  className='h-5 w-5 text-gray-400'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'>
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21'
                  />
                </svg>
              ) : (
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  className='h-5 w-5 text-gray-400'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'>
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M15 12a3 3 0 11-6 0 3 3 0 016 0z'
                  />
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z'
                  />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Login Button */}
        <button
          type='submit'
          className='w-full py-3 rounded-md font-semibold text-white'
          style={{
            background: 'linear-gradient(to right, #9be15d 0%, #00e3ae 50%, #4facfe 100%)'
          }}>
          Login
        </button>
      </form>
    </div>
  )
}

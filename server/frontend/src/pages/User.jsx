import React, { useState } from 'react'

export default function User() {
  const [user, setUser] = useState({
    name: 'Admin User',
    email: 'admin@melodies.com',
    role: 'Administrator',
    avatar: null,
    phone: '+62 812-3456-7890',
    address: 'Jakarta, Indonesia'
  })

  const [isEditing, setIsEditing] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    // TODO: Implement user profile update
    console.log('User profile updated:', user)
    setIsEditing(false)
  }

  const handleAvatarChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setUser({ ...user, avatar: e.target.result })
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <div>
      <div className='mb-6'>
        <h2 className='text-2xl font-bold text-white mb-2'>User Profile</h2>
        <p className='text-gray-400'>Manage your account information</p>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {/* Profile Card */}
        <div className='lg:col-span-1'>
          <div className='bg-gray-800 rounded-xl p-6'>
            <div className='text-center'>
              <div className='relative inline-block'>
                <div className='w-32 h-32 rounded-full bg-gray-700 flex items-center justify-center text-4xl text-gray-400 mb-4'>
                  {user.avatar ? (
                    <img src={user.avatar} alt='Avatar' className='w-32 h-32 rounded-full object-cover' />
                  ) : (
                    '👤'
                  )}
                </div>
                {isEditing && (
                  <label className='absolute bottom-0 right-0 bg-fuchsia text-white p-2 rounded-full cursor-pointer hover:bg-fuchsia/80'>
                    <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path
                        d='M15.232 5.232l3.536 3.536M9 11l6 6M3 21h6l11.293-11.293a1 1 0 0 0 0-1.414l-3.586-3.586a1 1 0 0 0-1.414 0L3 15v6z'
                        strokeWidth='2'
                      />
                    </svg>
                    <input type='file' accept='image/*' onChange={handleAvatarChange} className='hidden' />
                  </label>
                )}
              </div>

              <h3 className='text-xl font-bold text-white mb-1'>{user.name}</h3>
              <p className='text-gray-400 mb-2'>{user.email}</p>
              <span className='inline-block bg-fuchsia text-white px-3 py-1 rounded-full text-sm font-semibold'>
                {user.role}
              </span>
            </div>

            <div className='mt-6 pt-6 border-t border-gray-700'>
              <div className='space-y-3'>
                <div className='flex items-center gap-3'>
                  <svg className='w-5 h-5 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path
                      d='M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z'
                      strokeWidth='2'
                    />
                  </svg>
                  <span className='text-gray-300'>{user.phone}</span>
                </div>
                <div className='flex items-center gap-3'>
                  <svg className='w-5 h-5 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path
                      d='M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z'
                      strokeWidth='2'
                    />
                    <path d='M15 11a3 3 0 11-6 0 3 3 0 016 0z' strokeWidth='2' />
                  </svg>
                  <span className='text-gray-300'>{user.address}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Form */}
        <div className='lg:col-span-2'>
          <div className='bg-gray-800 rounded-xl p-6'>
            <div className='flex justify-between items-center mb-6'>
              <h3 className='text-lg font-semibold text-white'>Profile Information</h3>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className='px-4 py-2 rounded bg-fuchsia text-white font-semibold hover:bg-fuchsia/80 transition'>
                {isEditing ? 'Cancel' : 'Edit Profile'}
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <div>
                  <label className='block mb-2 text-white'>Full Name</label>
                  <input
                    type='text'
                    className='w-full px-4 py-2 rounded bg-gray-700 text-white outline-none'
                    value={user.name}
                    onChange={(e) => setUser({ ...user, name: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>

                <div>
                  <label className='block mb-2 text-white'>Email</label>
                  <input
                    type='email'
                    className='w-full px-4 py-2 rounded bg-gray-700 text-white outline-none'
                    value={user.email}
                    onChange={(e) => setUser({ ...user, email: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>

                <div>
                  <label className='block mb-2 text-white'>Phone</label>
                  <input
                    type='text'
                    className='w-full px-4 py-2 rounded bg-gray-700 text-white outline-none'
                    value={user.phone}
                    onChange={(e) => setUser({ ...user, phone: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>

                <div>
                  <label className='block mb-2 text-white'>Role</label>
                  <input
                    type='text'
                    className='w-full px-4 py-2 rounded bg-gray-700 text-white outline-none'
                    value={user.role}
                    disabled
                  />
                </div>

                <div className='md:col-span-2'>
                  <label className='block mb-2 text-white'>Address</label>
                  <textarea
                    className='w-full px-4 py-2 rounded bg-gray-700 text-white outline-none'
                    rows={3}
                    value={user.address}
                    onChange={(e) => setUser({ ...user, address: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>
              </div>

              {isEditing && (
                <div className='mt-6 flex justify-end gap-4'>
                  <button
                    type='button'
                    onClick={() => setIsEditing(false)}
                    className='px-6 py-2 rounded bg-gray-700 text-white hover:bg-gray-600 transition'>
                    Cancel
                  </button>
                  <button
                    type='submit'
                    className='px-6 py-2 rounded bg-fuchsia text-white font-semibold hover:bg-fuchsia/80 transition'>
                    Save Changes
                  </button>
                </div>
              )}
            </form>
          </div>

          {/* Security Settings */}
          <div className='mt-6 bg-gray-800 rounded-xl p-6'>
            <h3 className='text-lg font-semibold text-white mb-4'>Security Settings</h3>
            <div className='space-y-4'>
              <button className='w-full text-left p-4 rounded bg-gray-700 hover:bg-gray-600 transition'>
                <div className='flex items-center justify-between'>
                  <div>
                    <h4 className='text-white font-medium'>Change Password</h4>
                    <p className='text-gray-400 text-sm'>Update your account password</p>
                  </div>
                  <svg className='w-5 h-5 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path d='M9 5l7 7-7 7' strokeWidth='2' />
                  </svg>
                </div>
              </button>

              <button className='w-full text-left p-4 rounded bg-gray-700 hover:bg-gray-600 transition'>
                <div className='flex items-center justify-between'>
                  <div>
                    <h4 className='text-white font-medium'>Two-Factor Authentication</h4>
                    <p className='text-gray-400 text-sm'>Add an extra layer of security</p>
                  </div>
                  <svg className='w-5 h-5 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path d='M9 5l7 7-7 7' strokeWidth='2' />
                  </svg>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

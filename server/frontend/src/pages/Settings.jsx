import React, { useState } from 'react'

export default function Settings() {
  const [settings, setSettings] = useState({
    appName: 'Melodies Admin Panel',
    serverUrl: 'http://localhost:4000',
    maxFileSize: '10',
    allowedFileTypes: 'jpg,jpeg,png,gif',
    autoBackup: true,
    notifications: true
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    // TODO: Implement settings save
    console.log('Settings saved:', settings)
  }

  return (
    <div>
      <div className='mb-6'>
        <h2 className='text-2xl font-bold text-white mb-2'>Application Settings</h2>
        <p className='text-gray-400'>Configure your application preferences</p>
      </div>

      <div className='bg-gray-800 rounded-xl p-6'>
        <form onSubmit={handleSubmit}>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            {/* General Settings */}
            <div>
              <h3 className='text-lg font-semibold text-white mb-4'>General Settings</h3>

              <div className='mb-4'>
                <label className='block mb-2 text-white'>Application Name</label>
                <input
                  type='text'
                  className='w-full px-4 py-2 rounded bg-gray-700 text-white outline-none'
                  value={settings.appName}
                  onChange={(e) => setSettings({ ...settings, appName: e.target.value })}
                />
              </div>

              <div className='mb-4'>
                <label className='block mb-2 text-white'>Server URL</label>
                <input
                  type='text'
                  className='w-full px-4 py-2 rounded bg-gray-700 text-white outline-none'
                  value={settings.serverUrl}
                  onChange={(e) => setSettings({ ...settings, serverUrl: e.target.value })}
                />
              </div>
            </div>

            {/* File Upload Settings */}
            <div>
              <h3 className='text-lg font-semibold text-white mb-4'>File Upload Settings</h3>

              <div className='mb-4'>
                <label className='block mb-2 text-white'>Max File Size (MB)</label>
                <input
                  type='number'
                  className='w-full px-4 py-2 rounded bg-gray-700 text-white outline-none'
                  value={settings.maxFileSize}
                  onChange={(e) => setSettings({ ...settings, maxFileSize: e.target.value })}
                />
              </div>

              <div className='mb-4'>
                <label className='block mb-2 text-white'>Allowed File Types</label>
                <input
                  type='text'
                  className='w-full px-4 py-2 rounded bg-gray-700 text-white outline-none'
                  value={settings.allowedFileTypes}
                  onChange={(e) => setSettings({ ...settings, allowedFileTypes: e.target.value })}
                  placeholder='jpg,jpeg,png,gif'
                />
              </div>
            </div>
          </div>

          {/* Toggle Settings */}
          <div className='mt-6 border-t border-gray-700 pt-6'>
            <h3 className='text-lg font-semibold text-white mb-4'>Preferences</h3>

            <div className='space-y-4'>
              <div className='flex items-center justify-between'>
                <div>
                  <label className='text-white font-medium'>Auto Backup</label>
                  <p className='text-gray-400 text-sm'>Automatically backup data daily</p>
                </div>
                <label className='relative inline-flex items-center cursor-pointer'>
                  <input
                    type='checkbox'
                    className='sr-only peer'
                    checked={settings.autoBackup}
                    onChange={(e) => setSettings({ ...settings, autoBackup: e.target.checked })}
                  />
                  <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-fuchsia"></div>
                </label>
              </div>

              <div className='flex items-center justify-between'>
                <div>
                  <label className='text-white font-medium'>Notifications</label>
                  <p className='text-gray-400 text-sm'>Enable system notifications</p>
                </div>
                <label className='relative inline-flex items-center cursor-pointer'>
                  <input
                    type='checkbox'
                    className='sr-only peer'
                    checked={settings.notifications}
                    onChange={(e) => setSettings({ ...settings, notifications: e.target.checked })}
                  />
                  <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-fuchsia"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className='mt-8 flex justify-end gap-4'>
            <button
              type='button'
              className='px-6 py-2 rounded bg-gray-700 text-white hover:bg-gray-600 transition'
              onClick={() =>
                setSettings({
                  appName: 'Melodies Admin Panel',
                  serverUrl: 'http://localhost:4000',
                  maxFileSize: '10',
                  allowedFileTypes: 'jpg,jpeg,png,gif',
                  autoBackup: true,
                  notifications: true
                })
              }>
              Reset
            </button>
            <button
              type='submit'
              className='px-6 py-2 rounded bg-fuchsia text-white font-semibold hover:bg-fuchsia/80 transition'>
              Save Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

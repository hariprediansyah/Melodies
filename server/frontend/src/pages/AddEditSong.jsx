import React, { useState, useEffect } from 'react'
import { songsAPI } from '../services/api'
import { FaCalendarAlt } from 'react-icons/fa'
import { InputField, FilePicker } from '../components/Components'

const GENRE_OPTIONS = ['Acoustic', 'Pop', 'Dance', 'EDM']

export default function AddEditSong({ mode, songId, onBack }) {
  const isEdit = mode === 'edit'
  const [form, setForm] = useState({
    title: '',
    genre: '',
    artist: '',
    album: '',
    duration: '',
    release_date: '',
    thumbnail: null,
    songfile: null
  })
  const [loading, setLoading] = useState(isEdit)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (isEdit && songId) {
      setLoading(true)
      songsAPI.getAll().then((songs) => {
        const song = songs.find((s) => s.id === songId)
        if (song) {
          let release_date = song.release_date || ''
          if (release_date && release_date.length > 10) {
            release_date = release_date.slice(0, 10)
          }
          setForm((f) => ({
            ...f,
            title: song.title || '',
            genre: song.genre || '',
            artist: song.artist || '',
            album: song.album || '',
            duration: song.duration || '',
            release_date: release_date,
            thumbnail: null,
            songfile: null
          }))
        }
        setLoading(false)
      })
    }
  }, [isEdit, songId])

  const handleChange = (e) => {
    const { name, value, files } = e.target
    if (files) {
      setForm((f) => ({ ...f, [name]: files[0] }))
    } else {
      setForm((f) => ({ ...f, [name]: value }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const formData = new FormData()
      formData.append('title', form.title)
      formData.append('genre', form.genre)
      formData.append('artist', form.artist)
      formData.append('album', form.album)
      formData.append('duration', form.duration)
      formData.append('release_date', form.release_date)
      if (form.thumbnail) formData.append('thumbnail', form.thumbnail)
      if (form.songfile) formData.append('songfile', form.songfile)
      if (isEdit) {
        await songsAPI.update(songId, formData)
      } else {
        await songsAPI.create(formData)
      }
      onBack()
    } catch (error) {
      alert('Failed to save song!')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <div className='text-center py-8'>Loading...</div>

  return (
    <div>
      <div className='flex items-center mb-6'>
        <button onClick={onBack} className='mr-4 text-fuchsia font-bold text-lg'>
          &larr; Back
        </button>
        <div className='text-2xl font-bold'>{isEdit ? 'Edit Song' : 'Add New Songs'}</div>
      </div>
      <form className='w-full shadow-lg' onSubmit={handleSubmit} encType='multipart/form-data'>
        <div className='bg-[#161f33] rounded-xl p-8 grid grid-cols-1 md:grid-cols-2 gap-8'>
          <div>
            <InputField
              label='Song Title'
              name='title'
              required
              value={form.title}
              onChange={handleChange}
              placeholder='Enter Song Title'
            />
            <InputField
              label='Genre'
              name='genre'
              type='select'
              required
              value={form.genre}
              onChange={handleChange}
              options={GENRE_OPTIONS}
            />
            <InputField
              label='Artist'
              name='artist'
              value={form.artist}
              onChange={handleChange}
              placeholder='Enter Artist Name'
            />
            <InputField
              label='Album'
              name='album'
              value={form.album}
              onChange={handleChange}
              placeholder='Enter Album Name'
            />
            <InputField
              label='Duration'
              name='duration'
              value={form.duration}
              onChange={handleChange}
              placeholder='Enter Duration song'
            />
          </div>
          <div>
            <InputField
              label='Release Date'
              name='release_date'
              type='date'
              value={form.release_date}
              onChange={handleChange}
              placeholder='Choose Date'
              icon={<FaCalendarAlt />}
            />
            <FilePicker
              label='Thumbnail'
              name='thumbnail'
              accept='image/*'
              onChange={handleChange}
              file={form.thumbnail}
              helper='*jpg, *png files are allowed   max file 50mb'
            />
            <FilePicker
              label='Upload Songs'
              name='songfile'
              accept='.mp3,.wav,.ogg,.flac,.aac,.m4a,.wma,.mp4,.mov'
              onChange={handleChange}
              file={form.songfile}
              helper='*mov, *mp4 files are allowed   max file 200mb'
            />
          </div>
        </div>
        <div className='flex justify-end gap-2 mt-4 p-8'>
          <button
            type='button'
            className='px-4 py-2 rounded bg-gray-700 text-white'
            onClick={onBack}
            disabled={submitting}>
            Cancel
          </button>
          <button type='submit' className='px-4 py-2 rounded bg-fuchsia text-white font-semibold' disabled={submitting}>
            {submitting ? 'Saving...' : 'Submit'}
          </button>
        </div>
      </form>
    </div>
  )
}

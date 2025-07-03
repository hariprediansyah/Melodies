import React, { useState, useEffect } from 'react'
import { roomAPI } from '../services/api'
import { InputField } from '../components/Components'

export default function AddEditRoom({ mode, roomId, onBack }) {
  const isEdit = mode === 'edit'
  const [form, setForm] = useState({ name: '', description: '', status: 'Active', mac_address: '' })
  const [loading, setLoading] = useState(isEdit)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (isEdit && roomId) {
      setLoading(true)
      roomAPI.getAll().then((rooms) => {
        const room = rooms.find((r) => r.id === roomId)
        if (room) {
          setForm({
            name: room.name,
            description: room.description,
            status: room.status,
            mac_address: room.mac_address || ''
          })
        }
        setLoading(false)
      })
    }
  }, [isEdit, roomId])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      if (isEdit) {
        await roomAPI.update(roomId, form)
      } else {
        await roomAPI.create(form)
      }
      onBack()
    } catch (error) {
      alert('Failed to save room!')
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
        <div className='text-2xl font-bold'>{isEdit ? 'Edit Room' : 'Add New Room'}</div>
      </div>
      <form className='w-full shadow-lg' onSubmit={handleSubmit}>
        <div className='bg-[#161f33] rounded-xl p-8'>
          <InputField
            label='Room Name'
            name='name'
            required
            value={form.name}
            onChange={handleChange}
            placeholder='Enter Room Name'
          />
          <InputField
            label='Description'
            name='description'
            type='textarea'
            value={form.description}
            onChange={handleChange}
            placeholder='Enter Description'
            rows={3}
          />
          <InputField
            label='MAC Address'
            name='mac_address'
            value={form.mac_address}
            onChange={handleChange}
            placeholder='Enter MAC Address'
          />
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

import React, { useState, useEffect } from 'react'
import { bannerAPI } from '../services/api'
import { BannerForm } from '../components/Components'

export default function AddEditBanner({ mode, bannerId, onBack, setBannerPageMode }) {
  const isEdit = mode === 'edit'
  const [formData, setFormData] = useState(null)
  const [loading, setLoading] = useState(isEdit)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (isEdit && bannerId) {
      setLoading(true)
      bannerAPI.getAll().then((banners) => {
        const banner = banners.find((b) => b.id === bannerId)
        if (banner) {
          setFormData(banner)
        }
        setLoading(false)
      })
    } else {
      setFormData({ title: '', description: '', image: '' })
      setLoading(false)
    }
  }, [isEdit, bannerId])

  const handleSubmit = async (formDataObj) => {
    setSubmitting(true)
    try {
      if (isEdit && bannerId) {
        await bannerAPI.update(bannerId, formDataObj)
      } else {
        await bannerAPI.create(formDataObj)
      }
      window.dispatchEvent(new Event('banner-back'))
      setBannerPageMode('list')
    } catch (error) {
      alert('Failed to save banner!')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading || !formData) return <div className='text-center py-8'>Loading...</div>

  return <BannerForm initialData={formData} onSubmit={handleSubmit} onCancel={onBack} loading={submitting} />
}

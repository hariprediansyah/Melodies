import React, { useState, useRef } from 'react'

export const GlassCard = ({ className, children }) => {
  return (
    <div className={`rounded-lg border border-white/10 bg-white/10 backdrop-blur-sm p-1 px-3 ${className}`}>
      {children}
    </div>
  )
}

// Komponen input reusable
export const InputField = ({
  label,
  name,
  type = 'text',
  value,
  onChange,
  required = false,
  placeholder = '',
  options = [], // untuk select
  icon = null,
  ...props
}) => (
  <div className='mb-4'>
    {label && (
      <label className='block mb-1 text-white'>
        {label}
        {required && <span className='text-fuchsia'>*</span>}
      </label>
    )}
    {type === 'select' ? (
      <select
        name={name}
        required={required}
        className='w-full px-4 py-2 rounded bg-gray-700 text-white outline-none'
        value={value}
        onChange={onChange}
        {...props}>
        <option value=''>Select {label}</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    ) : type === 'date' ? (
      <div className='relative'>
        {icon && <span className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400'>{icon}</span>}
        <input
          type='date'
          name={name}
          required={required}
          className={`w-full pl-10 pr-4 py-2 rounded bg-gray-700 text-white outline-none focus:ring-2 focus:ring-fuchsia transition`}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          {...props}
        />
      </div>
    ) : (
      <input
        type={type}
        name={name}
        required={required}
        className='w-full px-4 py-2 rounded bg-gray-700 text-white outline-none'
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        {...props}
      />
    )}
  </div>
)

// Komponen file picker reusable
export const FilePicker = ({ label, name, accept, onChange, file, helper, required = false, inputId }) => (
  <div className='mb-4'>
    {label && (
      <label className='block mb-1 text-white'>
        {label}
        {required && <span className='text-fuchsia'>*</span>}
      </label>
    )}
    <div className='flex items-center bg-gray-700 rounded px-4 py-2'>
      <input
        id={inputId || name + '-input'}
        type='file'
        name={name}
        accept={accept}
        className='hidden'
        onChange={onChange}
      />
      <label
        htmlFor={inputId || name + '-input'}
        className='cursor-pointer text-fuchsia font-semibold whitespace-nowrap'>
        Choose File
      </label>
      <span className='mx-2 text-gray-500'>|</span>
      <span className='text-white truncate'>{file ? file.name : 'No file chosen'}</span>
    </div>
    {helper && <div className='text-xs text-gray-400 mt-1'>{helper}</div>}
  </div>
)

// Komponen CustomTable reusable dengan pagination
export const CustomTable = ({ columns = [], data = [], rowsPerPage = 10, renderCell, className = '' }) => {
  const [page, setPage] = React.useState(1)
  const totalPages = Math.ceil(data.length / rowsPerPage)
  const pagedData = data.slice((page - 1) * rowsPerPage, page * rowsPerPage)

  const handlePrev = () => setPage((p) => Math.max(1, p - 1))
  const handleNext = () => setPage((p) => Math.min(totalPages, p + 1))

  React.useEffect(() => {
    if (page > totalPages) setPage(totalPages || 1)
  }, [data, rowsPerPage, totalPages])

  return (
    <div className={className}>
      <div className='bg-gray-800 rounded-xl overflow-hidden'>
        <table className='w-full text-left'>
          <thead>
            <tr className='bg-gray-900 text-white'>
              {columns.map((col) => (
                <th key={col.key} className='py-3 px-4'>
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pagedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className='py-4 px-4 text-center text-gray-400'>
                  No data
                </td>
              </tr>
            ) : (
              pagedData.map((row, idx) => (
                <tr key={row.id || idx} className='border-b border-gray-900 hover:bg-gray-900 transition'>
                  {columns.map((col, cidx) => (
                    <td key={col.key} className='py-2 px-4 align-middle'>
                      {renderCell ? renderCell(col, row, idx + (page - 1) * rowsPerPage) : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className='flex justify-between items-center mt-2 text-white/70 text-sm'>
        <div>
          Showing {pagedData.length} of {data.length} items
        </div>
        <div className='flex gap-2 items-center'>
          <button className='px-2 py-1 rounded bg-gray-700 text-white/60' onClick={handlePrev} disabled={page === 1}>
            {'<'}
          </button>
          <span>{page}</span>
          <button
            className='px-2 py-1 rounded bg-gray-700 text-white/60'
            onClick={handleNext}
            disabled={page === totalPages || totalPages === 0}>
            {'>'}
          </button>
        </div>
      </div>
    </div>
  )
}

export const BannerForm = ({ initialData = {}, onSubmit, onCancel, loading }) => {
  const [form, setForm] = React.useState({
    title: initialData.title || '',
    description: initialData.description || '',
    image: initialData.image || ''
  })
  const [selectedFile, setSelectedFile] = React.useState(null)

  React.useEffect(() => {
    setForm({
      title: initialData.title || '',
      description: initialData.description || '',
      image: initialData.image || ''
    })
    setSelectedFile(null)
  }, [initialData])

  const handleChange = (e) => {
    const { name, value, files } = e.target
    if (files) {
      setSelectedFile(files[0])
    } else {
      setForm((f) => ({ ...f, [name]: value }))
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const formData = new FormData()
    formData.append('title', form.title)
    formData.append('description', form.description)
    if (selectedFile) formData.append('image', selectedFile)
    onSubmit(formData)
  }

  return (
    <div>
      <div className='flex items-center mb-6'>
        <button onClick={onCancel} className='mr-4 text-fuchsia font-bold text-lg' type='button'>
          &larr; Back
        </button>
        <div className='text-2xl font-bold'>{initialData && initialData.id ? 'Edit Banner' : 'Add New Banner'}</div>
      </div>
      <form className='w-full shadow-lg' onSubmit={handleSubmit} encType='multipart/form-data'>
        <div className='bg-[#23232b] rounded-xl p-8'>
          <InputField
            label='Title'
            name='title'
            required
            value={form.title}
            onChange={handleChange}
            placeholder='Enter Banner Title'
          />
          <InputField
            label='Description'
            name='description'
            type='textarea'
            value={form.description}
            onChange={handleChange}
            placeholder='Enter Description'
          />
          <FilePicker
            label='Banner Image'
            name='image'
            accept='image/*'
            onChange={handleChange}
            file={selectedFile}
            helper='*jpg, *png files are allowed   max file 50mb'
          />
        </div>
        <div className='flex justify-end gap-2 mt-4 p-8'>
          <button
            type='button'
            className='px-4 py-2 rounded bg-gray-700 text-white'
            onClick={onCancel}
            disabled={loading}>
            Cancel
          </button>
          <button type='submit' className='px-4 py-2 rounded bg-fuchsia text-white font-semibold' disabled={loading}>
            {loading ? 'Saving...' : 'Submit'}
          </button>
        </div>
      </form>
    </div>
  )
}

// Komponen ToastNotif
export function ToastNotif({ notifs, onClose }) {
  return (
    <div className='fixed top-6 right-6 z-50 flex flex-col gap-2'>
      {notifs.map((notif) => (
        <div
          key={notif.id}
          className={`px-6 py-3 rounded-lg shadow-lg text-white font-semibold flex items-center gap-3 transition-all duration-300 ${
            notif.type === 'success' ? 'bg-green-600' : notif.type === 'error' ? 'bg-red-600' : 'bg-gray-700'
          } ${notif.show ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}`}>
          {notif.type === 'success' && (
            <svg width='22' height='22' fill='none' viewBox='0 0 24 24'>
              <circle cx='12' cy='12' r='10' stroke='white' strokeWidth='2' />
              <path d='M8 12.5l3 3 5-5' stroke='white' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' />
            </svg>
          )}
          {notif.type === 'error' && (
            <svg width='22' height='22' fill='none' viewBox='0 0 24 24'>
              <circle cx='12' cy='12' r='10' stroke='white' strokeWidth='2' />
              <path d='M15 9l-6 6M9 9l6 6' stroke='white' strokeWidth='2' strokeLinecap='round' />
            </svg>
          )}
          <span>{notif.message}</span>
          <button onClick={() => onClose(notif.id)} className='ml-2 text-white/70 hover:text-white text-lg'>
            &times;
          </button>
        </div>
      ))}
    </div>
  )
}

// Hook notifikasi
export function useNotifStack() {
  const [notifs, setNotifs] = useState([])
  const timeoutRefs = useRef({})

  const showNotif = (msg, notifType = 'success') => {
    const id = Date.now() + Math.random()
    setNotifs((prev) => [...prev, { id, show: true, message: msg, type: notifType }])
    timeoutRefs.current[id] = setTimeout(() => {
      setNotifs((prev) => prev.map((n) => (n.id === id ? { ...n, show: false } : n)))
      setTimeout(() => setNotifs((prev) => prev.filter((n) => n.id !== id)), 500)
    }, 2000)
  }

  const onClose = (id) => {
    setNotifs((prev) => prev.map((n) => (n.id === id ? { ...n, show: false } : n)))
    setTimeout(() => setNotifs((prev) => prev.filter((n) => n.id !== id)), 500)
    if (timeoutRefs.current[id]) clearTimeout(timeoutRefs.current[id])
  }

  return { notifs, showNotif, onClose }
}

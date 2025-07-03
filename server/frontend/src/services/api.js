const API_BASE_URL = window.apiConfig?.baseURL || 'http://localhost:4000'

// Helper function untuk API calls
const apiCall = async (endpoint, options = {}) => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('API call failed:', error)
    throw error
  }
}

// Room Management API
export const roomAPI = {
  getAll: () => apiCall('/rooms'),
  create: (data) =>
    apiCall('/rooms', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  update: (id, data) =>
    apiCall(`/rooms/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
  delete: (id) =>
    apiCall(`/rooms/${id}`, {
      method: 'DELETE'
    })
}

// Songs Management API
export const songsAPI = {
  getAll: () => apiCall('/songs'),
  create: (formData) =>
    fetch(`${API_BASE_URL}/songs`, {
      method: 'POST',
      body: formData // FormData untuk upload file
    }).then((res) => res.json()),
  update: (id, formData) =>
    fetch(`${API_BASE_URL}/songs/${id}`, {
      method: 'PUT',
      body: formData // FormData untuk upload file
    }).then((res) => res.json()),
  delete: (id) =>
    apiCall(`/songs/${id}`, {
      method: 'DELETE'
    })
}

// Banner Management API
export const bannerAPI = {
  getAll: () => apiCall('/banners'),
  create: (formData) =>
    fetch(`${API_BASE_URL}/banners`, {
      method: 'POST',
      body: formData // FormData untuk upload file
    }).then((res) => res.json()),
  update: (id, formData) =>
    fetch(`${API_BASE_URL}/banners/${id}`, {
      method: 'PUT',
      body: formData // FormData untuk upload file
    }).then((res) => res.json()),
  delete: (id) =>
    apiCall(`/banners/${id}`, {
      method: 'DELETE'
    })
}

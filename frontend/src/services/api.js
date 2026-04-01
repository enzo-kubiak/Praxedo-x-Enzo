import axios from 'axios'

const BASE = import.meta.env.VITE_API_URL || '/api'

const api = axios.create({ baseURL: BASE })

export const filesApi = {
  /**
   * Returns all files with their metadata.
   */
  list: () =>
    api.get('/files').then(r => r.data),

  /**
   * Returns a single file's metadata.
   */
  get: (id) =>
    api.get(`/files/${id}`).then(r => r.data),

  /**
   * Uploads a file. onProgress(0–100) is called during upload.
   */
  upload: (file, uploadedBy = 'anonymous', onProgress) =>
    api.post('/files/upload', (() => {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('uploadedBy', uploadedBy)
      return fd
    })(), {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: e => {
        if (onProgress && e.total) onProgress(Math.round(e.loaded * 100 / e.total))
      }
    }).then(r => r.data),

  /**
   * Returns the download URL for a CLEAN file.
   */
  downloadUrl: (id) => `${BASE}/files/${id}/download`,
}

export const contactApi = {
  send: (payload) =>
    api.post('/contact', payload).then(r => r.data),
}

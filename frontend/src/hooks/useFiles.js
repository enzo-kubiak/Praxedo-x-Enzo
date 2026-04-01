import { useState, useEffect, useCallback } from 'react'
import { filesApi } from '../services/api'

/**
 * Récupère la liste des fichiers, auto-refresh toutes les 5 secondes
 */
export function useFiles() {
  const [files, setFiles]     = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  const fetchFiles = useCallback(async () => {
    try {
      const data = await filesApi.list()
      setFiles(data)
      setError(null)
    } catch (e) {
      setError('Failed to load files. Is the backend running?')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchFiles()
  }, [fetchFiles])

  // Auto-refresh si scan en cours
  useEffect(() => {
    const hasPending = files.some(
      f => f.scanStatus === 'PENDING' || f.scanStatus === 'SCANNING'
    )
    if (!hasPending) return

    const interval = setInterval(fetchFiles, 5000)
    return () => clearInterval(interval)
  }, [files, fetchFiles])

  return { files, loading, error, refresh: fetchFiles }
}

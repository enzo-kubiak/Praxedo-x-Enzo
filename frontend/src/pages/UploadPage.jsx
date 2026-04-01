import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { useNavigate } from 'react-router-dom'
import { Upload, CheckCircle, AlertCircle, X, FileText } from 'lucide-react'
import { filesApi } from '../services/api'



function formatSize(bytes) {
  if (bytes < 1024)      return `${bytes} B`
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 ** 2).toFixed(1)} MB`
}



export default function UploadPage() {
  const navigate  = useNavigate()
  const [queue,   setQueue]   = useState([])  // {file, progress, status, error, id}
  const [uploader, setUploader] = useState('')

  const onDrop = useCallback((accepted) => {
    const newItems = accepted.map(f => ({
      file: f, progress: 0, status: 'idle', error: null, id: null
    }))
    setQueue(prev => [...prev, ...newItems])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
  })

  const removeItem = (idx) =>
    setQueue(prev => prev.filter((_, i) => i !== idx))

  const uploadAll = async () => {
    for (let i = 0; i < queue.length; i++) {
      if (queue[i].status === 'done') continue

      setQueue(prev => {
        const next = [...prev]
        next[i] = { ...next[i], status: 'uploading', error: null }
        return next
      })

      try {
        const result = await filesApi.upload(
          queue[i].file,
          uploader || 'anonymous',
          (pct) => {
            setQueue(prev => {
              const next = [...prev]
              next[i] = { ...next[i], progress: pct }
              return next
            })
          }
        )

        setQueue(prev => {
          const next = [...prev]
          next[i] = { ...next[i], status: 'done', progress: 100, id: result.id }
          return next
        })
      } catch (err) {
        setQueue(prev => {
          const next = [...prev]
          next[i] = {
            ...next[i], status: 'error',
            error: err.response?.data?.error || 'Erreur lors de l\'upload'
          }
          return next
        })
      }
    }
  }


  const hasPending = queue.some(q => q.status === 'idle' || q.status === 'error')
  const allDone    = queue.length > 0 && queue.every(q => q.status === 'done')

  return (
    <div style={s.page} className="fade-up">
      <div style={s.header}>
        <h1 style={s.title}>Envoyer des fichiers</h1>
        <p style={s.subtitle}>
          Les fichiers seront automatiquement analysés par l'antivirus avant d'être disponibles.
        </p>
      </div>

      {/* Drop zone */}
      <div
        {...getRootProps()}
        style={{
          ...s.dropzone,
          ...(isDragActive ? s.dropzoneActive : {}),
        }}
      >
        <input {...getInputProps()} />
        <Upload size={28} color={isDragActive ? 'var(--accent)' : 'var(--text3)'} />
        <p style={s.dropText}>
          {isDragActive
            ? 'Déposez vos fichiers ici…'
            : 'Glissez-déposez vos fichiers, ou cliquez pour sélectionner'}
        </p>
        <p style={s.dropHint}>Tous types de fichiers — jusqu'à 500 MB par fichier</p>
      </div>

      {/* Uploader name */}
      {queue.length > 0 && (
        <div style={s.field}>
          <label style={s.label}>Uploadé par (optionnel)</label>
          <input
            type="text"
            placeholder="Votre nom ou identifiant…"
            value={uploader}
            onChange={e => setUploader(e.target.value)}
            style={s.input}
          />
        </div>
      )}

      {/* File queue */}
      {queue.length > 0 && (
        <div style={s.queue} className="stagger">
          {queue.map((item, i) => (
            <div key={i} style={s.queueItem}>
              <div style={s.queueLeft}>
                <FileText size={16} color="var(--text2)" />
                <div>
                  <p style={s.queueName}>{item.file.name}</p>
                  <p style={s.queueMeta}>{formatSize(item.file.size)}</p>
                </div>
              </div>

              <div style={s.queueRight}>
                {item.status === 'idle' && (
                  <button onClick={() => removeItem(i)} style={s.removeBtn}>
                    <X size={13} />
                  </button>
                )}

                {item.status === 'uploading' && (
                  <div style={s.progressWrap}>
                    <div style={s.progressBar}>
                      <div style={{ ...s.progressFill, width: `${item.progress}%` }} />
                    </div>
                    <span style={s.progressPct}>{item.progress}%</span>
                  </div>
                )}
                
                {item.status === 'done' && (
                  <div style={s.doneRow}>
                    <CheckCircle size={15} color="var(--clean)" />
                    <button
                      onClick={() => navigate(`/files/${item.id}`)}
                      style={s.viewBtn}
                    >
                      Voir
                    </button>
                  </div>
                )}

                {item.status === 'error' && (
                  <div style={s.errorRow}>
                    <AlertCircle size={14} color="var(--infected)" />
                    <span style={{ fontSize: 12, color: 'var(--infected)' }}>{item.error}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      {queue.length > 0 && (
        <div style={s.actions}>
          {hasPending && (
            <button onClick={uploadAll} style={s.uploadBtn}>
              <Upload size={15} />
              Envoyer {queue.filter(q => q.status === 'idle').length} fichier(s)
            </button>
          )}
          {allDone && (
            <button onClick={() => navigate('/files')} style={s.filesBtn}>
              Voir tous les fichiers →
            </button>
          )}
          <button onClick={() => setQueue([])} style={s.clearBtn}>
            Vider la liste
          </button>
        </div>
      )}
    </div>
  )
}

const s = {
  page: { padding: '40px 48px', maxWidth: 680 },
  header: { marginBottom: 28 },
  title: {
    fontFamily: 'var(--font-head)', fontSize: 26,
    fontWeight: 700, letterSpacing: '-0.03em',
  },
  subtitle: { fontSize: 13, color: 'var(--text2)', marginTop: 6, lineHeight: 1.6 },
  dropzone: {
    border: '2px dashed var(--border2)',
    borderRadius: 14, padding: '48px 32px',
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', gap: 10,
    cursor: 'pointer', transition: 'all var(--transition)',
    background: 'var(--bg2)',
    marginBottom: 24,
  },
  dropzoneActive: {
    borderColor: 'var(--accent)',
    background: 'rgba(79,124,255,0.06)',
  },
  dropText: { fontSize: 14, color: 'var(--text2)', textAlign: 'center' },
  dropHint: { fontSize: 12, color: 'var(--text3)' },
  field: { marginBottom: 20 },
  label: { display: 'block', fontSize: 12, color: 'var(--text2)', marginBottom: 6 },
  input: {
    width: '100%', padding: '9px 12px',
    background: 'var(--bg2)', border: '1px solid var(--border)',
    borderRadius: 8, color: 'var(--text)', fontSize: 13, outline: 'none',
  },
  queue: {
    display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24,
  },
  queueItem: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '12px 16px', background: 'var(--bg2)',
    border: '1px solid var(--border)', borderRadius: 9, gap: 12,
  },
  queueLeft: { display: 'flex', alignItems: 'center', gap: 10, minWidth: 0, flex: 1 },
  queueName: { fontSize: 13, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  queueMeta: { fontSize: 11, color: 'var(--text3)', fontFamily: 'var(--font-mono)' },
  queueRight: { display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 },
  removeBtn: {
    background: 'none', border: 'none',
    color: 'var(--text3)', display: 'flex', padding: 4,
  },
  progressWrap: { display: 'flex', alignItems: 'center', gap: 8 },
  progressBar: {
    width: 100, height: 4,
    background: 'var(--border)', borderRadius: 2, overflow: 'hidden',
  },
  progressFill: {
    height: '100%', background: 'var(--accent)',
    borderRadius: 2, transition: 'width 150ms ease',
  },
  progressPct: { fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text2)' },
  doneRow: { display: 'flex', alignItems: 'center', gap: 8 },
  errorRow: { display: 'flex', alignItems: 'center', gap: 6 },
  viewBtn: {
    fontSize: 12, color: 'var(--accent)', background: 'none',
    border: 'none', cursor: 'pointer', fontFamily: 'var(--font)',
  },
  actions: { display: 'flex', gap: 10, flexWrap: 'wrap' },
  uploadBtn: {
    display: 'inline-flex', alignItems: 'center', gap: 8,
    padding: '10px 20px', borderRadius: 9,
    background: 'var(--accent)', color: '#fff',
    border: 'none', fontSize: 13, fontWeight: 500,
  },
  filesBtn: {
    display: 'inline-flex', alignItems: 'center', gap: 8,
    padding: '10px 20px', borderRadius: 9,
    background: 'var(--bg3)', color: 'var(--text)',
    border: '1px solid var(--border)', fontSize: 13,
  },
  clearBtn: {
    display: 'inline-flex', alignItems: 'center',
    padding: '10px 20px', borderRadius: 9,
    background: 'none', color: 'var(--text2)',
    border: '1px solid var(--border)', fontSize: 13,
  },
}

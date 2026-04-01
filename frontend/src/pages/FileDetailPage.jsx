import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import {
  ArrowLeft, Download, File, Calendar, Weight,
  User, Tag, ShieldCheck, AlertCircle, Clock
} from 'lucide-react'
import { filesApi } from '../services/api'
import StatusBadge from '../components/StatusBadge'

function formatSize(bytes) {
  if (bytes < 1024)        return `${bytes} B`
  if (bytes < 1024 ** 2)   return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1024 ** 3)   return `${(bytes / 1024 ** 2).toFixed(1)} MB`
  return `${(bytes / 1024 ** 3).toFixed(2)} GB`
}

function Row({ icon: Icon, label, value, mono = false }) {
  return (
    <div style={s.row}>
      <div style={s.rowLabel}>
        <Icon size={13} color="var(--text3)" />
        <span>{label}</span>
      </div>
      <span style={{ ...s.rowValue, ...(mono ? { fontFamily: 'var(--font-mono)', fontSize: 12 } : {}) }}>
        {value ?? '—'}
      </span>
    </div>
  )
}

export default function FileDetailPage() {
  const { id }     = useParams()
  const navigate   = useNavigate()
  const [file, setFile]     = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]   = useState(null)

  useEffect(() => {
    filesApi.get(id)
      .then(setFile)
      .catch(() => setError('Fichier introuvable.'))
      .finally(() => setLoading(false))
  }, [id])

  // Auto-refresh while PENDING or SCANNING
  useEffect(() => {
    if (!file) return
    if (file.scanStatus !== 'PENDING' && file.scanStatus !== 'SCANNING') return
    const t = setInterval(() => {
      filesApi.get(id).then(setFile).catch(() => {})
    }, 4000)
    return () => clearInterval(t)
  }, [file, id])

  if (loading) return <div style={s.page}><p style={{ color: 'var(--text2)' }}>Chargement…</p></div>
  if (error)   return <div style={s.page}><p style={{ color: 'var(--infected)' }}>{error}</p></div>

  const isLocked = !file.downloadable
  const isPending = file.scanStatus === 'PENDING' || file.scanStatus === 'SCANNING'

  return (
    <div style={s.page} className="fade-up">

      {/* Back */}
      <button onClick={() => navigate('/files')} style={s.backBtn}>
        <ArrowLeft size={15} />
        Retour aux fichiers
      </button>

      {/* Title */}
      <div style={s.header}>
        <div style={s.fileIcon}>
          <File size={22} color="var(--accent)" />
        </div>
        <div>
          <h1 style={s.fileName}>{file.originalFileName}</h1>
          <div style={{ marginTop: 8 }}>
            <StatusBadge status={file.scanStatus} />
          </div>
        </div>
      </div>

      {/* Pending notice */}
      {isPending && (
        <div style={s.notice}>
          <Clock size={15} />
          <span>
            Ce fichier est en cours d'analyse par l'antivirus.
            Le téléchargement sera disponible une fois le scan terminé.
            La page se met à jour automatiquement.
          </span>
        </div>
      )}

      {/* Infected notice */}
      {file.scanStatus === 'INFECTED' && (
        <div style={{ ...s.notice, ...s.noticeDanger }}>
          <AlertCircle size={15} />
          <span>Ce fichier a été détecté comme infecté et ne peut pas être téléchargé.</span>
        </div>
      )}

      {/* Detail card */}
      <div style={s.card}>
        <h2 style={s.cardTitle}>Informations</h2>
        <div style={s.rows}>
          <Row icon={Tag}        label="Nom"           value={file.originalFileName} />
          <Row icon={File}       label="Type MIME"     value={file.contentType}      mono />
          <Row icon={Weight}     label="Taille"        value={formatSize(file.fileSize)} mono />
          <Row icon={Calendar}   label="Uploadé le"
               value={format(new Date(file.uploadedAt), "d MMMM yyyy 'à' HH:mm", { locale: fr })} />
          <Row icon={User}       label="Uploadé par"   value={file.uploadedBy || 'anonymous'} />
          <Row icon={ShieldCheck} label="Résultat scan" value={file.scanResult} />
          {file.scannedAt && (
            <Row icon={Calendar} label="Scanné le"
                 value={format(new Date(file.scannedAt), "d MMMM yyyy 'à' HH:mm", { locale: fr })} />
          )}
          <Row icon={Tag} label="ID" value={file.id} mono />
        </div>
      </div>

      {/* Download */}
      {!isLocked && (
        <a
          href={filesApi.downloadUrl(file.id)}
          download={file.originalFileName}
          style={s.dlBtn}
        >
          <Download size={16} />
          Télécharger le fichier
        </a>
      )}
    </div>
  )
}

const s = {
  page: { padding: '40px 48px', maxWidth: 700 },
  backBtn: {
    display: 'inline-flex', alignItems: 'center', gap: 6,
    fontSize: 13, color: 'var(--text2)', background: 'none',
    border: 'none', marginBottom: 32, padding: 0,
    transition: 'color var(--transition)',
  },
  header: {
    display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 24,
  },
  fileIcon: {
    width: 48, height: 48, borderRadius: 10,
    background: 'rgba(79,124,255,0.1)', border: '1px solid rgba(79,124,255,0.2)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  fileName: {
    fontFamily: 'var(--font-head)', fontSize: 20,
    fontWeight: 700, letterSpacing: '-0.02em',
    wordBreak: 'break-all',
  },
  notice: {
    display: 'flex', alignItems: 'flex-start', gap: 10,
    padding: '12px 16px', borderRadius: 8, marginBottom: 20,
    background: 'rgba(240,168,52,0.08)', border: '1px solid rgba(240,168,52,0.25)',
    color: 'var(--pending)', fontSize: 13, lineHeight: 1.5,
  },
  noticeDanger: {
    background: 'rgba(232,68,90,0.08)', border: '1px solid rgba(232,68,90,0.25)',
    color: 'var(--infected)',
  },
  card: {
    background: 'var(--bg2)', border: '1px solid var(--border)',
    borderRadius: 12, overflow: 'hidden', marginBottom: 24,
  },
  cardTitle: {
    padding: '14px 20px', fontSize: 11, fontWeight: 500,
    color: 'var(--text3)', fontFamily: 'var(--font-mono)',
    textTransform: 'uppercase', letterSpacing: '0.06em',
    borderBottom: '1px solid var(--border)',
  },
  rows: {},
  row: {
    display: 'flex', alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 20px', borderBottom: '1px solid var(--border)',
    fontSize: 13,
  },
  rowLabel: {
    display: 'flex', alignItems: 'center', gap: 8,
    color: 'var(--text2)', minWidth: 130,
  },
  rowValue: { color: 'var(--text)', textAlign: 'right', wordBreak: 'break-all' },
  dlBtn: {
    display: 'inline-flex', alignItems: 'center', gap: 8,
    padding: '11px 22px', borderRadius: 9,
    background: 'var(--accent)', color: '#fff',
    fontSize: 14, fontWeight: 500,
    transition: 'opacity var(--transition)',
    border: 'none',
  },
}

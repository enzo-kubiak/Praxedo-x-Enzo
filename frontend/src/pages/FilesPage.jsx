import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import {
  FileText, FileImage, FileArchive, FileCode,
  Download, RefreshCw, AlertCircle, Search, File
} from 'lucide-react'
import { useFiles } from '../hooks/useFiles'
import StatusBadge from '../components/StatusBadge'
import { filesApi } from '../services/api'

// ── File icon by MIME type ──────────────────────────────────
function FileIcon({ contentType, size = 18 }) {
  if (contentType?.startsWith('image/'))       return <FileImage  size={size} />
  if (contentType?.includes('zip') ||
      contentType?.includes('tar') ||
      contentType?.includes('gzip'))           return <FileArchive size={size} />
  if (contentType?.includes('json') ||
      contentType?.includes('xml')  ||
      contentType?.includes('javascript'))     return <FileCode   size={size} />
  if (contentType?.includes('pdf') ||
      contentType?.includes('text') ||
      contentType?.includes('word'))           return <FileText   size={size} />
  return <File size={size} />
}

// ── Format bytes ────────────────────────────────────────────
function formatSize(bytes) {
  if (bytes < 1024)        return `${bytes} B`
  if (bytes < 1024 ** 2)   return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1024 ** 3)   return `${(bytes / 1024 ** 2).toFixed(1)} MB`
  return `${(bytes / 1024 ** 3).toFixed(2)} GB`
}

export default function FilesPage() {
  const navigate = useNavigate()
  const { files, loading, error, refresh } = useFiles()
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('ALL')

  const pendingCount = files.filter(f =>
    f.scanStatus === 'PENDING' || f.scanStatus === 'SCANNING'
  ).length

  const filtered = files.filter(f => {
    const matchSearch = f.originalFileName
      .toLowerCase()
      .includes(search.toLowerCase())
    const matchFilter = filter === 'ALL' || f.scanStatus === filter
    return matchSearch && matchFilter
  })

  return (
    <div style={s.page} className="fade-up">

      {/* ── Header ── */}
      <div style={s.header}>
        <div>
          <h1 style={s.title}>Fichiers</h1>
          <p style={s.subtitle}>
            {files.length} fichier{files.length !== 1 ? 's' : ''}
            {pendingCount > 0 && (
              <span style={s.pendingNote}>
                &nbsp;· {pendingCount} en cours d'analyse
              </span>
            )}
          </p>
        </div>
        <button onClick={refresh} style={s.refreshBtn} title="Rafraîchir">
          <RefreshCw size={15} />
        </button>
      </div>

      {/* ── Toolbar ── */}
      <div style={s.toolbar}>
        <div style={s.searchWrap}>
          <Search size={14} style={s.searchIcon} />
          <input
            type="text"
            placeholder="Rechercher un fichier…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={s.searchInput}
          />
        </div>

        <div style={s.filters}>
          {['ALL', 'PENDING', 'SCANNING', 'CLEAN', 'INFECTED'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{ ...s.filterBtn, ...(filter === f ? s.filterActive : {}) }}
            >
              {f === 'ALL' ? 'Tous' : f}
            </button>
          ))}
        </div>
      </div>

      {/* ── Content ── */}
      {error && (
        <div style={s.errorBox}>
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {loading && (
        <div style={s.emptyState}>
          <span style={s.loadingText}>Chargement…</span>
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div style={s.emptyState}>
          <File size={40} color="var(--text3)" />
          <p style={{ color: 'var(--text2)', marginTop: 12 }}>Aucun fichier trouvé</p>
        </div>
      )}

      {!loading && filtered.length > 0 && (
        <div style={s.tableWrap}>
          <table style={s.table}>
            <thead>
              <tr>
                {['Fichier', 'Type', 'Taille', 'Uploadé', 'Statut', ''].map(h => (
                  <th key={h} style={s.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="stagger">
              {filtered.map(file => {
                const isLocked = file.scanStatus !== 'CLEAN'
                return (
                  <tr
                    key={file.id}
                    style={{
                      ...s.tr,
                      opacity: isLocked ? 0.45 : 1,
                      cursor: 'pointer',
                    }}
                    onClick={() => navigate(`/files/${file.id}`)}
                  >
                    {/* Name + icon */}
                    <td style={s.td}>
                      <div style={s.nameCell}>
                        <span style={{ color: isLocked ? 'var(--text3)' : 'var(--accent)' }}>
                          <FileIcon contentType={file.contentType} />
                        </span>
                        <span style={s.fileName}>{file.originalFileName}</span>
                      </div>
                    </td>

                    {/* MIME */}
                    <td style={s.td}>
                      <span style={s.mono2}>{file.contentType?.split('/')[1] ?? '—'}</span>
                    </td>

                    {/* Size */}
                    <td style={s.td}>
                      <span style={s.mono2}>{formatSize(file.fileSize)}</span>
                    </td>

                    {/* Date */}
                    <td style={s.td}>
                      <span style={s.dateText}>
                        {formatDistanceToNow(new Date(file.uploadedAt), { addSuffix: true, locale: fr })}
                      </span>
                    </td>

                    {/* Status */}
                    <td style={s.td}>
                      <StatusBadge status={file.scanStatus} />
                    </td>

                    {/* Download */}
                    <td style={{ ...s.td, textAlign: 'right' }}>
                      {file.downloadable && (
                        <a
                          href={filesApi.downloadUrl(file.id)}
                          download={file.originalFileName}
                          onClick={e => e.stopPropagation()}
                          style={s.dlBtn}
                          title="Télécharger"
                        >
                          <Download size={14} />
                        </a>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

const s = {
  page: { padding: '40px 48px', maxWidth: 1100 },
  header: {
    display: 'flex', alignItems: 'flex-start',
    justifyContent: 'space-between', marginBottom: 28,
  },
  title: {
    fontFamily: 'var(--font-head)', fontSize: 26,
    fontWeight: 700, letterSpacing: '-0.03em',
  },
  subtitle: { fontSize: 13, color: 'var(--text2)', marginTop: 4 },
  pendingNote: { color: 'var(--pending)' },
  refreshBtn: {
    background: 'var(--bg3)', border: '1px solid var(--border)',
    color: 'var(--text2)', borderRadius: 8, padding: '7px 10px',
    display: 'flex', alignItems: 'center',
    transition: 'all var(--transition)',
  },
  toolbar: {
    display: 'flex', gap: 16, alignItems: 'center',
    marginBottom: 24, flexWrap: 'wrap',
  },
  searchWrap: {
    position: 'relative', flex: 1, minWidth: 200,
  },
  searchIcon: {
    position: 'absolute', left: 12, top: '50%',
    transform: 'translateY(-50%)', color: 'var(--text3)',
    pointerEvents: 'none',
  },
  searchInput: {
    width: '100%', padding: '9px 12px 9px 36px',
    background: 'var(--bg2)', border: '1px solid var(--border)',
    borderRadius: 8, color: 'var(--text)', fontSize: 13,
    outline: 'none',
  },
  filters: { display: 'flex', gap: 6 },
  filterBtn: {
    padding: '6px 12px', borderRadius: 6, fontSize: 11,
    fontFamily: 'var(--font-mono)', fontWeight: 500,
    background: 'transparent', border: '1px solid var(--border)',
    color: 'var(--text2)', transition: 'all var(--transition)',
    textTransform: 'uppercase', letterSpacing: '0.04em',
  },
  filterActive: {
    background: 'var(--bg3)', border: '1px solid var(--border2)',
    color: 'var(--text)',
  },
  errorBox: {
    display: 'flex', alignItems: 'center', gap: 8,
    padding: 14, borderRadius: 8, marginBottom: 20,
    background: 'rgba(232,68,90,0.1)', border: '1px solid rgba(232,68,90,0.3)',
    color: 'var(--infected)', fontSize: 13,
  },
  emptyState: {
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    paddingTop: 80,
  },
  loadingText: { color: 'var(--text3)', fontSize: 13 },
  tableWrap: {
    background: 'var(--bg2)', borderRadius: 12,
    border: '1px solid var(--border)', overflow: 'hidden',
  },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: {
    padding: '11px 16px', textAlign: 'left',
    fontSize: 11, fontWeight: 500,
    color: 'var(--text3)', fontFamily: 'var(--font-mono)',
    textTransform: 'uppercase', letterSpacing: '0.06em',
    borderBottom: '1px solid var(--border)',
    background: 'var(--bg2)',
  },
  tr: {
    borderBottom: '1px solid var(--border)',
    transition: 'background var(--transition)',
  },
  td: { padding: '13px 16px', fontSize: 13 },
  nameCell: { display: 'flex', alignItems: 'center', gap: 10 },
  fileName: { fontWeight: 400, color: 'var(--text)' },
  mono2: { fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text2)' },
  dateText: { fontSize: 12, color: 'var(--text2)' },
  dlBtn: {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    width: 30, height: 30, borderRadius: 6,
    background: 'rgba(79,124,255,0.12)', border: '1px solid rgba(79,124,255,0.25)',
    color: 'var(--accent)', transition: 'all var(--transition)',
  },
}

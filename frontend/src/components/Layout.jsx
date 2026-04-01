import { NavLink } from 'react-router-dom'
import { Files, Upload, Mail, Shield } from 'lucide-react'

const NAV = [
  { to: '/files',   icon: Files,  label: 'Fichiers'  },
  { to: '/upload',  icon: Upload, label: 'Envoyer'   },
  { to: '/contact', icon: Mail,   label: 'Contact'   },
]

export default function Layout({ children }) {
  return (
    <div style={s.shell}>
      <aside style={s.sidebar}>
        <div style={s.logo}>
          <Shield size={20} color="var(--accent)" />
          <span style={s.logoText}>Securisation de fichiers</span>
        </div>

        <nav style={s.nav}>
          {NAV.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              style={({ isActive }) => ({
                ...s.link,
                ...(isActive ? s.linkActive : {})
              })}
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div style={s.footer}>
          <span style={s.footerText}>Praxedo x Enzo © 2026</span>
        </div>
      </aside>

      <main style={s.main}>
        {children}
      </main>
    </div>
  )
}

const s = {
  shell: {
    display: 'flex',
    minHeight: '100vh',
  },
  sidebar: {
    width: 220,
    flexShrink: 0,
    background: 'var(--bg2)',
    borderRight: '1px solid var(--border)',
    display: 'flex',
    flexDirection: 'column',
    padding: '28px 0',
    position: 'sticky',
    top: 0,
    height: '100vh',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '0 24px 32px',
  },
  logoText: {
    fontFamily: 'var(--font-head)',
    fontWeight: 700,
    fontSize: 17,
    letterSpacing: '-0.02em',
    color: 'var(--text)',
  },
  nav: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
    padding: '0 12px',
    flex: 1,
  },
  link: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '9px 12px',
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 400,
    color: 'var(--text2)',
    transition: 'all var(--transition)',
    border: '1px solid transparent',
  },
  linkActive: {
    color: 'var(--text)',
    background: 'var(--bg3)',
    border: '1px solid var(--border)',
  },
  footer: {
    padding: '0 24px',
  },
  footerText: {
    fontSize: 11,
    color: 'var(--text3)',
    fontFamily: 'var(--font-mono)',
  },
}

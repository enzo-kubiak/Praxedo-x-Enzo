import { useState } from 'react'
import { Send, CheckCircle, Mail, User, Tag, MessageSquare } from 'lucide-react'
import { contactApi } from '../services/api'

export default function ContactPage() {
  const [form, setForm]       = useState({ name: '', email: '', subject: '', message: '' })
  const [status, setStatus]   = useState('idle') // idle | sending | sent | error
  const [errMsg, setErrMsg]   = useState('')

  const set = (k) => (e) => setForm(prev => ({ ...prev, [k]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.message) return

    setStatus('sending')
    try {
      await contactApi.send(form)
      setStatus('sent')
      setForm({ name: '', email: '', subject: '', message: '' })
    } catch {
      setStatus('error')
      setErrMsg('Impossible d\'envoyer le message. Réessayez plus tard.')
    }
  }

  return (
    <div style={s.page} className="fade-up">
      <div style={s.header}>
        <h1 style={s.title}>Nous contacter</h1>
        <p style={s.subtitle}>
          Une question sur un fichier, un problème technique ? Écrivez-nous.
        </p>
      </div>

      {status === 'sent' ? (
        <div style={s.successBox}>
          <CheckCircle size={32} color="var(--clean)" />
          <div>
            <p style={{ fontWeight: 500, marginBottom: 4 }}>Message envoyé !</p>
            <p style={{ fontSize: 13, color: 'var(--text2)' }}>
              Nous vous répondrons dans les plus brefs délais.
            </p>
          </div>
          <button onClick={() => setStatus('idle')} style={s.newMsgBtn}>
            Nouveau message
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={s.form}>

          <div style={s.row2}>
            <Field icon={User}  label="Nom *"   type="text"  placeholder="Jean Dupont"
                   value={form.name}    onChange={set('name')} required />
            <Field icon={Mail}  label="Email *" type="email" placeholder="jean@exemple.fr"
                   value={form.email}   onChange={set('email')} required />
          </div>

          <Field icon={Tag} label="Sujet" type="text" placeholder="Objet du message"
                 value={form.subject} onChange={set('subject')} />

          <div style={s.fieldWrap}>
            <label style={s.label}>
              <MessageSquare size={12} />
              Message *
            </label>
            <textarea
              placeholder="Décrivez votre demande…"
              value={form.message}
              onChange={set('message')}
              required
              rows={6}
              style={s.textarea}
            />
          </div>

          {status === 'error' && (
            <p style={s.errorText}>{errMsg}</p>
          )}

          <button
            type="submit"
            disabled={status === 'sending'}
            style={{ ...s.submitBtn, opacity: status === 'sending' ? 0.6 : 1 }}
          >
            <Send size={15} />
            {status === 'sending' ? 'Envoi…' : 'Envoyer le message'}
          </button>
        </form>
      )}
    </div>
  )
}

function Field({ icon: Icon, label, type, placeholder, value, onChange, required }) {
  return (
    <div style={s.fieldWrap}>
      <label style={s.label}>
        <Icon size={12} />
        {label}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        style={s.input}
      />
    </div>
  )
}

const s = {
  page:   { padding: '40px 48px', maxWidth: 600 },
  header: { marginBottom: 32 },
  title:  {
    fontFamily: 'var(--font-head)', fontSize: 26,
    fontWeight: 700, letterSpacing: '-0.03em',
  },
  subtitle: { fontSize: 13, color: 'var(--text2)', marginTop: 6, lineHeight: 1.6 },
  form:   { display: 'flex', flexDirection: 'column', gap: 18 },
  row2:   { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 },
  fieldWrap: { display: 'flex', flexDirection: 'column', gap: 6 },
  label:  {
    display: 'flex', alignItems: 'center', gap: 6,
    fontSize: 12, color: 'var(--text2)', fontWeight: 400,
  },
  input:  {
    padding: '10px 12px', background: 'var(--bg2)',
    border: '1px solid var(--border)', borderRadius: 8,
    color: 'var(--text)', fontSize: 13, outline: 'none',
    transition: 'border-color var(--transition)',
  },
  textarea: {
    padding: '10px 12px', background: 'var(--bg2)',
    border: '1px solid var(--border)', borderRadius: 8,
    color: 'var(--text)', fontSize: 13, outline: 'none',
    resize: 'vertical', minHeight: 120,
    transition: 'border-color var(--transition)',
  },
  submitBtn: {
    display: 'inline-flex', alignItems: 'center', gap: 8,
    padding: '11px 22px', borderRadius: 9, alignSelf: 'flex-start',
    background: 'var(--accent)', color: '#fff',
    border: 'none', fontSize: 14, fontWeight: 500,
    cursor: 'pointer',
  },
  errorText: { fontSize: 13, color: 'var(--infected)' },
  successBox: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    gap: 16, padding: '48px 32px', textAlign: 'center',
    background: 'var(--bg2)', border: '1px solid var(--border)',
    borderRadius: 14,
  },
  newMsgBtn: {
    padding: '8px 18px', borderRadius: 8,
    background: 'var(--bg3)', border: '1px solid var(--border)',
    color: 'var(--text2)', fontSize: 13, cursor: 'pointer',
    fontFamily: 'var(--font)',
  },
}

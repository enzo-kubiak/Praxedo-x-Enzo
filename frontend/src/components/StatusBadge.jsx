import { Clock, CheckCircle, AlertTriangle, Loader } from 'lucide-react'

const CONFIG = {
  PENDING:  { label: 'En attente', icon: Clock,         cls: 'badge-pending'  },
  SCANNING: { label: 'Scan...',    icon: Loader,        cls: 'badge-scanning' },
  CLEAN:    { label: 'Sain',       icon: CheckCircle,   cls: 'badge-clean'    },
  INFECTED: { label: 'Infecté',    icon: AlertTriangle, cls: 'badge-infected' },
}

export default function StatusBadge({ status }) {
  const { label, icon: Icon, cls } = CONFIG[status] ?? CONFIG.PENDING
  const spinning = status === 'SCANNING'

  return (
    <span className={`badge ${cls}`}>
      <Icon
        size={10}
        className={spinning ? 'pulse' : ''}
        style={spinning ? { animation: 'pulse-dot 1s ease-in-out infinite' } : {}}
      />
      {label}
    </span>
  )
}

import { Menu } from 'lucide-react'
import { useUIStore } from '@/store/uiStore'
import { useLocation } from 'react-router-dom'

const titles: Record<string, { title: string; subtitle: string }> = {
  '/':          { title: 'Dashboard',   subtitle: 'Overview of your student management system' },
  '/students':  { title: 'Students',    subtitle: 'Manage all student records' },
  '/analytics': { title: 'Analytics',   subtitle: 'Visual insights and enrollment statistics' },
  '/logs':      { title: 'Activity Log',subtitle: 'Audit trail of all system actions' },
}

export function Header() {
  const { toggleSidebar } = useUIStore()
  const location = useLocation()
  const meta = titles[location.pathname] ?? { title: 'SMS Portal', subtitle: '' }

  return (
    <header className="header">
      <button
        className="btn btn-ghost btn-icon mobile-menu-btn"
        onClick={toggleSidebar}
        aria-label="Toggle sidebar"
        style={{ display: 'none' }} 
      >
        <Menu size={20} />
      </button>
      <div>
        <div className="header-title">{meta.title}</div>
        <div className="header-subtitle">{meta.subtitle}</div>
      </div>
    </header>
  )
}

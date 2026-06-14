import { NavLink } from 'react-router-dom'
import { Users, LayoutDashboard, BarChart3, ClipboardList, X, GraduationCap } from 'lucide-react'
import { useUIStore } from '@/store/uiStore'

const navItems = [
  { to: '/',          label: 'Dashboard',  icon: LayoutDashboard },
  { to: '/students',  label: 'Students',   icon: Users },
  { to: '/analytics', label: 'Analytics',  icon: BarChart3 },
  { to: '/logs',      label: 'Activity Log', icon: ClipboardList },
]

export function Sidebar() {
  const { sidebarOpen, toggleSidebar } = useUIStore()


  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
            zIndex: 99, display: 'none',
          }}
          className="mobile-overlay"
          onClick={toggleSidebar}
        />
      )}

      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        {/* Logo */}
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">
            <GraduationCap size={20} color="#fff" />
          </div>
          <div>
            <div className="sidebar-logo-text">SMS Portal</div>
            <div className="sidebar-logo-sub">Management System</div>
          </div>
          <button
            className="btn btn-ghost btn-icon"
            style={{ marginLeft: 'auto', display: 'none' }}
            onClick={toggleSidebar}
            aria-label="Close sidebar"
          >
            <X size={16} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          <div className="sidebar-section-label">Main Menu</div>
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={() => sidebarOpen && toggleSidebar()}
            >
              <Icon size={18} className="nav-icon" />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div style={{ padding: '16px', borderTop: '1px solid var(--border)' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
            <strong style={{ color: 'var(--text-secondary)' }}>Student Management</strong><br />
            v1.0.0 · Built with Fastify + React
          </div>
        </div>
      </aside>
    </>
  )
}

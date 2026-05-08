import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

const NAV = [
  { to: '/', label: 'Dashboard', icon: '📊', end: true },
  { to: '/carreras', label: 'Carreras', icon: '🎓' },
  { to: '/colegios', label: 'Colegios', icon: '🏫' },
  { to: '/trivia', label: 'Trivia', icon: '🧠' },
  { to: '/premios', label: 'Premios', icon: '🎁' },
  { to: '/feedback', label: 'Feedback', icon: '💬' },
  { to: '/recordatorios', label: 'Recordatorios', icon: '🗓️' },
  { to: '/admins', label: 'Administradores', icon: '👥' },
]

export default function AdminLayout() {
  const { admin, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const initials = admin?.correo
    ? admin.correo.split('@')[0].slice(0, 2).toUpperCase()
    : 'AD'

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-sidebar__brand">
          <div className="admin-sidebar__logo">UCB</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, color: '#fff', lineHeight: 1 }}>Explorer</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: 2 }}>Panel de Control</div>
          </div>
        </div>

        <div className="admin-sidebar__divider" />

        <nav style={{ flex: 1 }}>
          {NAV.map((n) => (
            <NavLink key={n.to} to={n.to} end={n.end}>
              <span className="admin-sidebar__icon">{n.icon}</span>
              <span>{n.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="admin-sidebar__divider" />

        <div className="admin-sidebar__user">
          <div className="admin-sidebar__avatar">{initials}</div>
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <div style={{ fontSize: 12, color: '#fff', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {admin?.correo}
            </div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 1 }}>{admin?.rol || 'ADMIN'}</div>
          </div>
          <button
            onClick={handleLogout}
            title="Cerrar sesión"
            style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: 16, padding: 4 }}
          >
            ⏻
          </button>
        </div>
      </aside>

      <main className="admin-content">
        <Outlet />
      </main>
    </div>
  )
}

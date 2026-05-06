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

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <h1>UCB · Admin</h1>
        {NAV.map((n) => (
          <NavLink key={n.to} to={n.to} end={n.end}>
            <span style={{ fontSize: 18 }}>{n.icon}</span>
            <span>{n.label}</span>
          </NavLink>
        ))}
        <div style={{ marginTop: 'auto', paddingTop: 20, fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>
          {admin?.correo}
          <button onClick={handleLogout} className="admin-btn admin-btn--ghost admin-btn--sm" style={{ marginTop: 8, width: '100%' }}>
            Cerrar sesión
          </button>
        </div>
      </aside>
      <main className="admin-content">
        <Outlet />
      </main>
    </div>
  )
}

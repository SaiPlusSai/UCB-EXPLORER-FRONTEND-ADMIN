import { useEffect, useState } from 'react'
import { authApi } from '../api/endpoints'
import { useAuth } from '../context/AuthContext.jsx'

function getUserId(correo) {
  if (!correo) return '—'
  const prefix = correo.split('@')[0].toUpperCase().replace(/[^A-Z0-9]/g, '')
  return `ADM-${prefix.slice(0, 8)}`
}

function getRolColor(rol) {
  if (rol === 'SUPER_ADMIN') return { background: '#fef3c7', color: '#92400e' }
  return { background: '#dbeafe', color: '#1e40af' }
}

export default function AdminsPage() {
  const { admin: actual } = useAuth()
  const [items, setItems] = useState([])
  const [cargando, setCargando] = useState(true)
  const [creando, setCreando] = useState(false)
  const [error, setError] = useState('')

  const cargar = async () => {
    try {
      const { data } = await authApi.listar()
      setItems(data.data)
    } catch (e) {
      setError(e.response?.data?.error || 'Error cargando administradores')
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => { cargar() }, [])

  const toggleActivo = async (a) => {
    try {
      await authApi.actualizar(a.id, { activo: !a.activo })
      cargar()
    } catch (e) {
      setError(e.response?.data?.error || 'Error')
    }
  }

  const eliminar = async (id) => {
    if (!window.confirm('¿Eliminar administrador? Esta acción no se puede deshacer.')) return
    try {
      await authApi.eliminar(id)
      cargar()
    } catch (e) {
      setError(e.response?.data?.error || 'No se pudo eliminar')
    }
  }

  const cambiarPassword = async (id) => {
    const nueva = window.prompt('Nueva contraseña (mínimo 4 caracteres):')
    if (!nueva) return
    try {
      await authApi.cambiarPassword(id, nueva)
      window.alert('Contraseña actualizada exitosamente.')
    } catch (e) {
      setError(e.response?.data?.error || 'Error al cambiar contraseña')
    }
  }

  return (
    <>
      <div className="admin-topbar">
        <div>
          <h2 style={{ margin: 0 }}>Administradores</h2>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#6b7280' }}>
            Gestión de acceso al panel UCB Explorer
          </p>
        </div>
        <button className="admin-btn admin-btn--accent" onClick={() => setCreando(true)}>
          + Nuevo administrador
        </button>
      </div>

      {error && <div className="admin-error">{error}</div>}

      {cargando ? <div className="admin-loader" /> : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>User ID</th>
              <th>Correo</th>
              <th>Rol</th>
              <th>Estado</th>
              <th>Creado</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {items.map((a) => (
              <tr key={a.id}>
                <td>
                  <span style={{
                    fontFamily: 'monospace',
                    background: '#f1f5f9',
                    padding: '2px 8px',
                    borderRadius: 6,
                    fontSize: 13,
                    fontWeight: 600,
                    color: '#002d54',
                  }}>
                    {getUserId(a.correo)}
                  </span>
                  {actual?.id === a.id && (
                    <span className="admin-chip admin-chip--gold" style={{ marginLeft: 8 }}>tú</span>
                  )}
                </td>
                <td style={{ fontSize: 14 }}>{a.correo}</td>
                <td>
                  <span style={{
                    ...getRolColor(a.rol),
                    padding: '3px 10px',
                    borderRadius: 999,
                    fontSize: 12,
                    fontWeight: 600,
                    display: 'inline-block',
                  }}>
                    {a.rol}
                  </span>
                </td>
                <td>
                  <span className={`admin-chip ${a.activo ? 'admin-chip--ok' : 'admin-chip--off'}`}>
                    {a.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td style={{ fontSize: 12, color: '#6b7280' }}>
                  {a.creado_en ? new Date(a.creado_en).toLocaleDateString('es-BO') : '—'}
                </td>
                <td className="admin-row">
                  <button className="admin-btn admin-btn--ghost admin-btn--sm" onClick={() => cambiarPassword(a.id)}>
                    Cambiar pass
                  </button>
                  <button className="admin-btn admin-btn--ghost admin-btn--sm" onClick={() => toggleActivo(a)}>
                    {a.activo ? 'Desactivar' : 'Activar'}
                  </button>
                  {actual?.id !== a.id && (
                    <button className="admin-btn admin-btn--danger admin-btn--sm" onClick={() => eliminar(a.id)}>
                      Eliminar
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr><td colSpan="6" style={{ textAlign: 'center', color: '#6b7280' }}>Sin administradores registrados</td></tr>
            )}
          </tbody>
        </table>
      )}

      {creando && (
        <AdminModal
          onCerrar={() => setCreando(false)}
          onGuardar={async (datos) => {
            try {
              await authApi.crear(datos)
              setCreando(false)
              cargar()
            } catch (e) {
              throw new Error(e.response?.data?.error || 'No se pudo crear')
            }
          }}
        />
      )}
    </>
  )
}

function AdminModal({ onCerrar, onGuardar }) {
  const [form, setForm] = useState({ correo: '', password: '', rol: 'ADMIN' })
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState('')

  const previewId = getUserId(form.correo)

  const submit = async (e) => {
    e.preventDefault()
    setEnviando(true)
    setError('')
    try {
      await onGuardar(form)
    } catch (e) {
      setError(e.message)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="admin-modal-overlay" onClick={onCerrar}>
      <form className="admin-modal" onClick={(e) => e.stopPropagation()} onSubmit={submit}>
        <h3>Nuevo administrador</h3>

        <label className="admin-label">Correo institucional</label>
        <input
          className="admin-input" required type="email"
          value={form.correo} placeholder="usuario@ucb.edu.bo"
          onChange={(e) => setForm({ ...form, correo: e.target.value })}
        />
        {form.correo && (
          <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>
            User ID generado: <strong style={{ fontFamily: 'monospace', color: '#002d54' }}>{previewId}</strong>
          </div>
        )}

        <label className="admin-label">Contraseña temporal</label>
        <input
          className="admin-input" required type="password" minLength={4}
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />

        <label className="admin-label">Rol</label>
        <select
          className="admin-select" value={form.rol}
          onChange={(e) => setForm({ ...form, rol: e.target.value })}
        >
          <option value="ADMIN">ADMIN — Acceso estándar</option>
          <option value="SUPER_ADMIN">SUPER_ADMIN — Acceso completo</option>
        </select>

        {error && <div className="admin-error">{error}</div>}

        <div className="admin-row" style={{ justifyContent: 'flex-end', marginTop: 18 }}>
          <button type="button" className="admin-btn admin-btn--ghost" onClick={onCerrar}>Cancelar</button>
          <button className="admin-btn" disabled={enviando}>{enviando ? 'Creando…' : 'Crear administrador'}</button>
        </div>
      </form>
    </div>
  )
}

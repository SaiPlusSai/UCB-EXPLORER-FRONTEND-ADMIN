import { useEffect, useState } from 'react'
import { authApi } from '../api/endpoints'
import { useAuth } from '../context/AuthContext.jsx'

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
      setError(e.response?.data?.error || 'Error')
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => { cargar() }, [])

  const toggleActivo = async (a) => {
    await authApi.actualizar(a.id, { activo: !a.activo })
    cargar()
  }

  const eliminar = async (id) => {
    if (!window.confirm('¿Eliminar administrador?')) return
    try {
      await authApi.eliminar(id)
      cargar()
    } catch (e) {
      setError(e.response?.data?.error || 'No se pudo eliminar')
    }
  }

  const cambiarPassword = async (id) => {
    const nueva = window.prompt('Nueva password (mínimo 4 caracteres):')
    if (!nueva) return
    try {
      await authApi.cambiarPassword(id, nueva)
      window.alert('Password actualizada')
    } catch (e) {
      setError(e.response?.data?.error || 'Error')
    }
  }

  return (
    <>
      <div className="admin-topbar">
        <h2>Administradores</h2>
        <button className="admin-btn admin-btn--accent" onClick={() => setCreando(true)}>+ Nuevo admin</button>
      </div>

      {error && <div className="admin-error">{error}</div>}

      {cargando ? <div className="admin-loader" /> : (
        <table className="admin-table">
          <thead>
            <tr><th>ID</th><th>Correo</th><th>Rol</th><th>Estado</th><th></th></tr>
          </thead>
          <tbody>
            {items.map((a) => (
              <tr key={a.id}>
                <td>#{a.id}</td>
                <td>
                  {a.correo}
                  {actual?.id === a.id && <span className="admin-chip admin-chip--gold" style={{ marginLeft: 8 }}>tú</span>}
                </td>
                <td>{a.rol}</td>
                <td>
                  <span className={`admin-chip ${a.activo ? 'admin-chip--ok' : 'admin-chip--off'}`}>
                    {a.activo ? 'Activo' : 'Inactivo'}
                  </span>
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
        <label className="admin-label">Correo</label>
        <input
          className="admin-input" required type="email"
          value={form.correo}
          onChange={(e) => setForm({ ...form, correo: e.target.value })}
        />
        <label className="admin-label">Password</label>
        <input
          className="admin-input" required type="password" minLength={4}
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        <label className="admin-label">Rol</label>
        <select
          className="admin-select"
          value={form.rol}
          onChange={(e) => setForm({ ...form, rol: e.target.value })}
        >
          <option value="ADMIN">ADMIN</option>
          <option value="SUPER_ADMIN">SUPER_ADMIN</option>
        </select>

        {error && <div className="admin-error">{error}</div>}

        <div className="admin-row" style={{ justifyContent: 'flex-end', marginTop: 18 }}>
          <button type="button" className="admin-btn admin-btn--ghost" onClick={onCerrar}>Cancelar</button>
          <button className="admin-btn" disabled={enviando}>{enviando ? 'Creando…' : 'Crear'}</button>
        </div>
      </form>
    </div>
  )
}

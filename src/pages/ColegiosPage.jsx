import { useEffect, useState } from 'react'
import { colegiosApi } from '../api/endpoints'

export default function ColegiosPage() {
  const [items, setItems] = useState([])
  const [cargando, setCargando] = useState(true)
  const [nombre, setNombre] = useState('')
  const [editando, setEditando] = useState(null)
  const [error, setError] = useState('')

  const cargar = async () => {
    try {
      const { data } = await colegiosApi.listar()
      setItems(data.data)
    } catch (e) {
      setError(e.response?.data?.error || 'Error')
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => { cargar() }, [])

  const crear = async (e) => {
    e.preventDefault()
    if (!nombre.trim()) return
    try {
      await colegiosApi.crear(nombre.trim())
      setNombre('')
      cargar()
    } catch (e) {
      setError(e.response?.data?.error || 'No se pudo crear')
    }
  }

  const actualizar = async (c, nuevoNombre) => {
    if (!nuevoNombre.trim()) return
    try {
      await colegiosApi.actualizar(c.id, nuevoNombre.trim())
      setEditando(null)
      cargar()
    } catch (e) {
      setError(e.response?.data?.error || 'No se pudo actualizar')
    }
  }

  const eliminar = async (id) => {
    if (!window.confirm('¿Eliminar colegio?')) return
    try {
      await colegiosApi.eliminar(id)
      cargar()
    } catch (e) {
      setError(e.response?.data?.error || 'No se pudo eliminar')
    }
  }

  return (
    <>
      <div className="admin-topbar"><h2>Colegios</h2></div>

      <form onSubmit={crear} className="admin-card admin-row" style={{ marginBottom: 16 }}>
        <input
          className="admin-input"
          placeholder="Nombre del colegio"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
        />
        <button className="admin-btn admin-btn--accent">Agregar</button>
      </form>

      {error && <div className="admin-error">{error}</div>}

      {cargando ? <div className="admin-loader" /> : (
        <table className="admin-table">
          <thead><tr><th>ID</th><th>Nombre</th><th></th></tr></thead>
          <tbody>
            {items.map((c) => (
              <tr key={c.id}>
                <td>#{c.id}</td>
                <td>
                  {editando?.id === c.id ? (
                    <input
                      className="admin-input"
                      autoFocus
                      defaultValue={c.nombre}
                      onBlur={(e) => actualizar(c, e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && actualizar(c, e.target.value)}
                    />
                  ) : (
                    c.nombre
                  )}
                </td>
                <td className="admin-row">
                  <button className="admin-btn admin-btn--ghost admin-btn--sm" onClick={() => setEditando(c)}>
                    Editar
                  </button>
                  <button className="admin-btn admin-btn--danger admin-btn--sm" onClick={() => eliminar(c.id)}>
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
            {items.length === 0 && <tr><td colSpan="3">Sin colegios registrados</td></tr>}
          </tbody>
        </table>
      )}
    </>
  )
}

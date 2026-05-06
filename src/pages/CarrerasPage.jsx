import { useEffect, useState } from 'react'
import { carrerasApi } from '../api/endpoints'

export default function CarrerasPage() {
  const [items, setItems] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [editando, setEditando] = useState(null)

  const cargar = async () => {
    setCargando(true)
    try {
      const { data } = await carrerasApi.listar()
      setItems(data.data)
    } catch (e) {
      setError(e.response?.data?.error || 'Error')
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => { cargar() }, [])

  const guardar = async (datos) => {
    try {
      if (editando?.id) await carrerasApi.actualizar(editando.id, datos)
      else await carrerasApi.crear(datos)
      setEditando(null)
      cargar()
    } catch (e) {
      setError(e.response?.data?.error || 'No se pudo guardar')
    }
  }

  const toggleActiva = async (c) => {
    await carrerasApi.actualizar(c.id, { activa: !c.activa })
    cargar()
  }

  const eliminar = async (id) => {
    if (!window.confirm('¿Eliminar esta carrera?')) return
    try {
      await carrerasApi.eliminar(id)
      cargar()
    } catch (e) {
      setError(e.response?.data?.error || 'No se pudo eliminar')
    }
  }

  return (
    <>
      <div className="admin-topbar">
        <h2>Carreras</h2>
        <button className="admin-btn admin-btn--accent" onClick={() => setEditando({})}>
          + Nueva carrera
        </button>
      </div>

      {error && <div className="admin-error">{error}</div>}

      {cargando ? (
        <div className="admin-loader" />
      ) : (
        <table className="admin-table">
          <thead>
            <tr><th>Nombre</th><th>Descripción</th><th>Estado</th><th></th></tr>
          </thead>
          <tbody>
            {items.map((c) => (
              <tr key={c.id}>
                <td><strong>{c.nombre}</strong></td>
                <td style={{ color: '#475569' }}>{c.descripcion || '—'}</td>
                <td>
                  <span className={`admin-chip ${c.activa ? 'admin-chip--ok' : 'admin-chip--off'}`}>
                    {c.activa ? 'Activa' : 'Inactiva'}
                  </span>
                </td>
                <td className="admin-row">
                  <button className="admin-btn admin-btn--ghost admin-btn--sm" onClick={() => setEditando(c)}>Editar</button>
                  <button className="admin-btn admin-btn--ghost admin-btn--sm" onClick={() => toggleActiva(c)}>
                    {c.activa ? 'Desactivar' : 'Activar'}
                  </button>
                  <button className="admin-btn admin-btn--danger admin-btn--sm" onClick={() => eliminar(c.id)}>Eliminar</button>
                </td>
              </tr>
            ))}
            {items.length === 0 && <tr><td colSpan="4">Sin carreras</td></tr>}
          </tbody>
        </table>
      )}

      {editando && (
        <CarreraModal
          inicial={editando}
          onCerrar={() => setEditando(null)}
          onGuardar={guardar}
        />
      )}
    </>
  )
}

function CarreraModal({ inicial, onCerrar, onGuardar }) {
  const [form, setForm] = useState({
    nombre: inicial.nombre || '',
    descripcion: inicial.descripcion || '',
    activa: inicial.activa ?? true,
  })
  const [enviando, setEnviando] = useState(false)
  const submit = async (e) => {
    e.preventDefault()
    setEnviando(true)
    await onGuardar(form)
    setEnviando(false)
  }
  return (
    <div className="admin-modal-overlay" onClick={onCerrar}>
      <form className="admin-modal" onClick={(e) => e.stopPropagation()} onSubmit={submit}>
        <h3>{inicial.id ? 'Editar carrera' : 'Nueva carrera'}</h3>
        <label className="admin-label">Nombre</label>
        <input
          className="admin-input"
          required
          value={form.nombre}
          onChange={(e) => setForm({ ...form, nombre: e.target.value })}
        />
        <label className="admin-label">Descripción</label>
        <textarea
          className="admin-textarea"
          rows={3}
          value={form.descripcion}
          onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
        />
        {inicial.id && (
          <label style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <input
              type="checkbox"
              checked={form.activa}
              onChange={(e) => setForm({ ...form, activa: e.target.checked })}
            />
            Activa
          </label>
        )}
        <div className="admin-row" style={{ justifyContent: 'flex-end', marginTop: 18 }}>
          <button type="button" className="admin-btn admin-btn--ghost" onClick={onCerrar}>Cancelar</button>
          <button className="admin-btn" disabled={enviando}>{enviando ? 'Guardando…' : 'Guardar'}</button>
        </div>
      </form>
    </div>
  )
}

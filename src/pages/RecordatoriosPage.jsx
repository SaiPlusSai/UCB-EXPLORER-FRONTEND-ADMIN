import { useEffect, useState } from 'react'
import { recordatoriosApi, carrerasApi } from '../api/endpoints'

export default function RecordatoriosPage() {
  const [items, setItems] = useState([])
  const [carreras, setCarreras] = useState([])
  const [cargando, setCargando] = useState(true)
  const [editando, setEditando] = useState(null)
  const [error, setError] = useState('')

  const cargar = async () => {
    try {
      const [r, c] = await Promise.all([recordatoriosApi.listar(), carrerasApi.listar()])
      setItems(r.data.data)
      setCarreras(c.data.data)
    } catch (e) {
      setError(e.response?.data?.error || 'Error')
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => { cargar() }, [])

  const guardar = async (datos) => {
    if (editando?.id) await recordatoriosApi.actualizar(editando.id, datos)
    else await recordatoriosApi.crear(datos)
    setEditando(null)
    cargar()
  }

  const eliminar = async (id) => {
    if (!window.confirm('¿Eliminar recordatorio?')) return
    await recordatoriosApi.eliminar(id)
    cargar()
  }

  return (
    <>
      <div className="admin-topbar">
        <h2>Recordatorios oficiales</h2>
        <button className="admin-btn admin-btn--accent" onClick={() => setEditando({})}>
          + Nuevo recordatorio
        </button>
      </div>

      {error && <div className="admin-error">{error}</div>}

      {cargando ? <div className="admin-loader" /> : (
        <table className="admin-table">
          <thead>
            <tr><th>Título</th><th>Carrera</th><th>Fecha</th><th>Origen</th><th></th></tr>
          </thead>
          <tbody>
            {items.map((r) => (
              <tr key={r.id}>
                <td>
                  <strong>{r.titulo}</strong>
                  {r.descripcion && <div style={{ fontSize: 12, color: '#64748b' }}>{r.descripcion}</div>}
                </td>
                <td>{r.carrera_nombre || '—'}</td>
                <td>{r.fecha_recordatorio ? new Date(r.fecha_recordatorio).toLocaleString() : '—'}</td>
                <td>
                  <span className={`admin-chip ${r.creado_por_admin ? 'admin-chip--gold' : 'admin-chip--off'}`}>
                    {r.creado_por_admin ? 'Admin' : 'Visitante'}
                  </span>
                </td>
                <td className="admin-row">
                  {r.creado_por_admin && (
                    <>
                      <button className="admin-btn admin-btn--ghost admin-btn--sm" onClick={() => setEditando(r)}>Editar</button>
                      <button className="admin-btn admin-btn--danger admin-btn--sm" onClick={() => eliminar(r.id)}>Eliminar</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
            {items.length === 0 && <tr><td colSpan="5">Sin recordatorios</td></tr>}
          </tbody>
        </table>
      )}

      {editando && (
        <RecordatorioModal
          inicial={editando}
          carreras={carreras}
          onCerrar={() => setEditando(null)}
          onGuardar={guardar}
        />
      )}
    </>
  )
}

function RecordatorioModal({ inicial, carreras, onCerrar, onGuardar }) {
  const [form, setForm] = useState({
    titulo: inicial.titulo || '',
    descripcion: inicial.descripcion || '',
    carrera_id: inicial.carrera_id || '',
    fecha_recordatorio: inicial.fecha_recordatorio
      ? new Date(inicial.fecha_recordatorio).toISOString().slice(0, 16)
      : '',
  })
  const [enviando, setEnviando] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setEnviando(true)
    await onGuardar({
      titulo: form.titulo.trim(),
      descripcion: form.descripcion.trim() || null,
      carrera_id: form.carrera_id ? Number(form.carrera_id) : null,
      fecha_recordatorio: form.fecha_recordatorio || null,
    })
    setEnviando(false)
  }

  return (
    <div className="admin-modal-overlay" onClick={onCerrar}>
      <form className="admin-modal" onClick={(e) => e.stopPropagation()} onSubmit={submit}>
        <h3>{inicial.id ? 'Editar recordatorio' : 'Nuevo recordatorio'}</h3>

        <label className="admin-label">Título</label>
        <input
          className="admin-input" required
          value={form.titulo}
          onChange={(e) => setForm({ ...form, titulo: e.target.value })}
        />

        <label className="admin-label">Descripción</label>
        <textarea
          className="admin-textarea" rows={3}
          value={form.descripcion}
          onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
        />

        <label className="admin-label">Carrera</label>
        <select
          className="admin-select"
          value={form.carrera_id || ''}
          onChange={(e) => setForm({ ...form, carrera_id: e.target.value })}
        >
          <option value="">— Sin carrera específica —</option>
          {carreras.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
        </select>

        <label className="admin-label">Fecha</label>
        <input
          type="datetime-local"
          className="admin-input"
          value={form.fecha_recordatorio}
          onChange={(e) => setForm({ ...form, fecha_recordatorio: e.target.value })}
        />

        <div className="admin-row" style={{ justifyContent: 'flex-end', marginTop: 18 }}>
          <button type="button" className="admin-btn admin-btn--ghost" onClick={onCerrar}>Cancelar</button>
          <button className="admin-btn" disabled={enviando}>{enviando ? 'Guardando…' : 'Guardar'}</button>
        </div>
      </form>
    </div>
  )
}

import { useEffect, useState } from 'react'
import { remindersApi, carrerasApi } from '../api/endpoints'

export default function RecordatoriosPage() {
  const [items, setItems] = useState([])
  const [carreras, setCarreras] = useState([])
  const [cargando, setCargando] = useState(true)
  const [editando, setEditando] = useState(null)
  const [error, setError] = useState('')

  const cargar = async () => {
    setCargando(true)
    try {
      const [recRes, carrerasRes] = await Promise.all([
        remindersApi.listarAdmin(),
        carrerasApi.listar(),
      ])
      setItems(recRes.data.data)
      setCarreras(carrerasRes.data.data)
    } catch (e) {
      setError(e.response?.data?.error || 'Error cargando recordatorios')
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => { cargar() }, [])

  const eliminar = async (id) => {
    if (!window.confirm('¿Eliminar recordatorio?')) return
    try {
      await remindersApi.eliminarAdmin(id)
      cargar()
    } catch (e) {
      setError(e.response?.data?.error || 'No se pudo eliminar')
    }
  }

  const guardar = async (datos) => {
    try {
      if (editando?.id) {
        await remindersApi.actualizarAdmin(editando.id, datos)
      } else {
        await remindersApi.crearAdmin(datos)
      }
      setEditando(null)
      cargar()
    } catch (e) {
      throw new Error(e.response?.data?.error || 'No se pudo guardar')
    }
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
            <tr>
              <th>Título</th>
              <th>Carrera</th>
              <th>Fecha</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {items.map((r) => (
              <tr key={r.id}>
                <td>
                  <strong>{r.titulo}</strong>
                  {r.descripcion && (
                    <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{r.descripcion}</div>
                  )}
                </td>
                <td>
                  {r.carrera_nombre
                    ? <span className="admin-chip admin-chip--gold">{r.carrera_nombre}</span>
                    : <span style={{ color: '#6b7280' }}>Todos</span>
                  }
                </td>
                <td>
                  {r.fecha_recordatorio
                    ? new Date(r.fecha_recordatorio).toLocaleString('es-BO')
                    : '—'}
                </td>
                <td className="admin-row">
                  <button className="admin-btn admin-btn--ghost admin-btn--sm" onClick={() => setEditando(r)}>
                    Editar
                  </button>
                  <button className="admin-btn admin-btn--danger admin-btn--sm" onClick={() => eliminar(r.id)}>
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr><td colSpan="4" style={{ textAlign: 'center', color: '#6b7280' }}>Sin recordatorios registrados</td></tr>
            )}
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
      ? inicial.fecha_recordatorio.slice(0, 16)
      : '',
  })
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    setEnviando(true)
    setError('')
    try {
      await onGuardar({
        titulo: form.titulo.trim(),
        descripcion: form.descripcion.trim() || null,
        carrera_id: form.carrera_id ? Number(form.carrera_id) : null,
        fecha_recordatorio: form.fecha_recordatorio || null,
      })
    } catch (e) {
      setError(e.message)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="admin-modal-overlay" onClick={onCerrar}>
      <form className="admin-modal" onClick={(e) => e.stopPropagation()} onSubmit={submit}>
        <h3>{inicial.id ? 'Editar recordatorio' : 'Nuevo recordatorio'}</h3>

        <label className="admin-label">Título</label>
        <input
          className="admin-input" required value={form.titulo}
          onChange={(e) => setForm({ ...form, titulo: e.target.value })}
        />

        <label className="admin-label">Descripción</label>
        <textarea
          className="admin-textarea" rows={3} value={form.descripcion}
          onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
          placeholder="Detalles del evento o aviso..."
        />

        <label className="admin-label">Carrera específica</label>
        <select
          className="admin-select" value={form.carrera_id || ''}
          onChange={(e) => setForm({ ...form, carrera_id: e.target.value })}
        >
          <option value="">— Todos los visitantes —</option>
          {carreras.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
        </select>

        <label className="admin-label">Fecha y hora</label>
        <input
          type="datetime-local" className="admin-input" value={form.fecha_recordatorio}
          onChange={(e) => setForm({ ...form, fecha_recordatorio: e.target.value })}
        />

        {error && <div className="admin-error">{error}</div>}

        <div className="admin-row" style={{ justifyContent: 'flex-end', marginTop: 18 }}>
          <button type="button" className="admin-btn admin-btn--ghost" onClick={onCerrar}>Cancelar</button>
          <button className="admin-btn" disabled={enviando}>{enviando ? 'Guardando…' : 'Guardar'}</button>
        </div>
      </form>
    </div>
  )
}

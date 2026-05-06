import { useEffect, useState } from 'react'
import { feedbackApi } from '../api/endpoints'

const TIPOS = [
  { value: 'rating', label: 'Rating (1-5)' },
  { value: 'texto', label: 'Texto libre' },
]

export default function FeedbackPage() {
  const [items, setItems] = useState([])
  const [respuestas, setRespuestas] = useState([])
  const [cargando, setCargando] = useState(true)
  const [editando, setEditando] = useState(null)
  const [error, setError] = useState('')

  const cargar = async () => {
    try {
      const [pre, res] = await Promise.all([feedbackApi.listar(), feedbackApi.respuestas()])
      setItems(pre.data.data)
      setRespuestas(res.data.data)
    } catch (e) {
      setError(e.response?.data?.error || 'Error')
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => { cargar() }, [])

  const guardar = async (datos) => {
    if (editando?.id) await feedbackApi.actualizar(editando.id, datos)
    else await feedbackApi.crear(datos)
    setEditando(null)
    cargar()
  }

  const eliminar = async (id) => {
    if (!window.confirm('¿Eliminar pregunta de feedback?')) return
    await feedbackApi.eliminar(id)
    cargar()
  }

  return (
    <>
      <div className="admin-topbar">
        <h2>Feedback</h2>
        <button className="admin-btn admin-btn--accent" onClick={() => setEditando({ tipo_pregunta: 'rating' })}>
          + Nueva pregunta
        </button>
      </div>

      {error && <div className="admin-error">{error}</div>}

      {cargando ? <div className="admin-loader" /> : (
        <table className="admin-table">
          <thead>
            <tr><th>Pregunta</th><th>Tipo</th><th>Categoría</th><th>Estado</th><th></th></tr>
          </thead>
          <tbody>
            {items.map((p) => (
              <tr key={p.id}>
                <td>{p.pregunta}</td>
                <td><span className="admin-chip admin-chip--gold">{p.tipo_pregunta}</span></td>
                <td>{p.categoria || '—'}</td>
                <td>
                  <span className={`admin-chip ${p.activa ? 'admin-chip--ok' : 'admin-chip--off'}`}>
                    {p.activa ? 'Activa' : 'Inactiva'}
                  </span>
                </td>
                <td className="admin-row">
                  <button className="admin-btn admin-btn--ghost admin-btn--sm" onClick={() => setEditando(p)}>Editar</button>
                  <button className="admin-btn admin-btn--danger admin-btn--sm" onClick={() => eliminar(p.id)}>Eliminar</button>
                </td>
              </tr>
            ))}
            {items.length === 0 && <tr><td colSpan="5">Sin preguntas</td></tr>}
          </tbody>
        </table>
      )}

      <h3 style={{ marginTop: 30 }}>Respuestas recientes</h3>
      <table className="admin-table">
        <thead><tr><th>Pregunta</th><th>Tipo</th><th>Respuesta</th><th>Visitante</th><th>Fecha</th></tr></thead>
        <tbody>
          {respuestas.slice(0, 100).map((r) => (
            <tr key={r.id}>
              <td>{r.pregunta}</td>
              <td>{r.tipo_pregunta}</td>
              <td>
                {r.tipo_pregunta === 'rating'
                  ? `⭐ ${r.valor_rating}/5`
                  : r.respuesta_texto || '—'}
              </td>
              <td>#{r.visitante_id}</td>
              <td>{new Date(r.respondido_en).toLocaleString()}</td>
            </tr>
          ))}
          {respuestas.length === 0 && <tr><td colSpan="5">Sin respuestas</td></tr>}
        </tbody>
      </table>

      {editando && (
        <FeedbackModal
          inicial={editando}
          onCerrar={() => setEditando(null)}
          onGuardar={guardar}
        />
      )}
    </>
  )
}

function FeedbackModal({ inicial, onCerrar, onGuardar }) {
  const [form, setForm] = useState({
    pregunta: inicial.pregunta || '',
    tipo_pregunta: inicial.tipo_pregunta || 'rating',
    categoria: inicial.categoria || '',
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
        <h3>{inicial.id ? 'Editar pregunta' : 'Nueva pregunta'}</h3>

        <label className="admin-label">Pregunta</label>
        <textarea
          className="admin-textarea" rows={2} required
          value={form.pregunta}
          onChange={(e) => setForm({ ...form, pregunta: e.target.value })}
        />

        <label className="admin-label">Tipo</label>
        <select
          className="admin-select"
          value={form.tipo_pregunta}
          onChange={(e) => setForm({ ...form, tipo_pregunta: e.target.value })}
        >
          {TIPOS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>

        <label className="admin-label">Categoría (opcional)</label>
        <input
          className="admin-input"
          value={form.categoria}
          onChange={(e) => setForm({ ...form, categoria: e.target.value })}
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

import { useEffect, useState } from 'react'
import { triviaApi, carrerasApi } from '../api/endpoints'

export default function TriviaPage() {
  const [items, setItems] = useState([])
  const [carreras, setCarreras] = useState([])
  const [cargando, setCargando] = useState(true)
  const [editando, setEditando] = useState(null)
  const [error, setError] = useState('')
  const [filtroCarrera, setFiltroCarrera] = useState('')

  const cargar = async () => {
    setCargando(true)
    try {
      const [triviaRes, carrerasRes] = await Promise.all([
        triviaApi.listar(filtroCarrera || undefined),
        carrerasApi.listar(),
      ])
      setItems(triviaRes.data.data)
      setCarreras(carrerasRes.data.data)
    } catch (e) {
      setError(e.response?.data?.error || 'Error cargando trivia')
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => { cargar() }, [filtroCarrera])

  const eliminar = async (id) => {
    if (!window.confirm('¿Eliminar pregunta?')) return
    try {
      await triviaApi.eliminar(id)
      cargar()
    } catch (e) {
      setError(e.response?.data?.error || 'No se pudo eliminar')
    }
  }

  const toggleActiva = async (p) => {
    try {
      await triviaApi.actualizar(p.id, { activa: !p.activa })
      cargar()
    } catch (e) {
      setError(e.response?.data?.error || 'Error')
    }
  }

  const guardar = async (datos) => {
    try {
      if (editando?.id) {
        await triviaApi.actualizar(editando.id, datos)
      } else {
        await triviaApi.crear(datos)
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
        <h2>Trivia</h2>
        <div className="admin-row">
          <select
            className="admin-select"
            style={{ width: 200 }}
            value={filtroCarrera}
            onChange={(e) => setFiltroCarrera(e.target.value)}
          >
            <option value="">Todas las carreras</option>
            {carreras.map((c) => (
              <option key={c.id} value={c.id}>{c.nombre}</option>
            ))}
          </select>
          <button
            className="admin-btn admin-btn--accent"
            onClick={() => setEditando({ opciones: [{ texto_opcion: '', es_correcta: true }, { texto_opcion: '', es_correcta: false }] })}
          >
            + Nueva pregunta
          </button>
        </div>
      </div>

      {error && <div className="admin-error">{error}</div>}

      {cargando ? <div className="admin-loader" /> : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Pregunta</th>
              <th>Carrera</th>
              <th>Puntos</th>
              <th>Estado</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {items.map((p) => (
              <tr key={p.id}>
                <td>
                  <strong>{p.pregunta}</strong>
                  {p.mensaje_feedback && (
                    <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                      Feedback: {p.mensaje_feedback}
                    </div>
                  )}
                </td>
                <td>{p.carrera_nombre || '—'}</td>
                <td>
                  <span className="admin-chip admin-chip--gold">{p.puntos} pts</span>
                </td>
                <td>
                  <span className={`admin-chip ${p.activa ? 'admin-chip--ok' : 'admin-chip--off'}`}>
                    {p.activa ? 'Activa' : 'Inactiva'}
                  </span>
                </td>
                <td className="admin-row">
                  <button className="admin-btn admin-btn--ghost admin-btn--sm" onClick={() => setEditando(p)}>
                    Editar
                  </button>
                  <button className="admin-btn admin-btn--ghost admin-btn--sm" onClick={() => toggleActiva(p)}>
                    {p.activa ? 'Desactivar' : 'Activar'}
                  </button>
                  <button className="admin-btn admin-btn--danger admin-btn--sm" onClick={() => eliminar(p.id)}>
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr><td colSpan="5" style={{ textAlign: 'center', color: '#6b7280' }}>Sin preguntas registradas</td></tr>
            )}
          </tbody>
        </table>
      )}

      {editando && (
        <PreguntaModal
          inicial={editando}
          carreras={carreras}
          onCerrar={() => setEditando(null)}
          onGuardar={guardar}
        />
      )}
    </>
  )
}

function PreguntaModal({ inicial, carreras, onCerrar, onGuardar }) {
  const [form, setForm] = useState({
    pregunta: inicial.pregunta || '',
    carrera_id: inicial.carrera_id || '',
    puntos: inicial.puntos ?? 100,
    mensaje_feedback: inicial.mensaje_feedback || '',
    activa: inicial.activa ?? true,
    opciones: inicial.opciones?.length
      ? inicial.opciones.map((o) => ({ texto_opcion: o.texto_opcion, es_correcta: !!o.es_correcta }))
      : [{ texto_opcion: '', es_correcta: true }, { texto_opcion: '', es_correcta: false }],
  })
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState('')

  const updateOp = (idx, campo, valor) => {
    setForm({ ...form, opciones: form.opciones.map((o, i) => i === idx ? { ...o, [campo]: valor } : o) })
  }

  const addOp = () => setForm({ ...form, opciones: [...form.opciones, { texto_opcion: '', es_correcta: false }] })

  const removeOp = (idx) => setForm({ ...form, opciones: form.opciones.filter((_, i) => i !== idx) })

  const submit = async (e) => {
    e.preventDefault()
    setEnviando(true)
    setError('')
    try {
      await onGuardar({
        ...form,
        carrera_id: form.carrera_id ? Number(form.carrera_id) : null,
        opciones: form.opciones.filter((o) => o.texto_opcion.trim()),
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
        <h3>{inicial.id ? 'Editar pregunta' : 'Nueva pregunta'}</h3>

        <label className="admin-label">Pregunta</label>
        <textarea
          className="admin-textarea" rows={2} required value={form.pregunta}
          onChange={(e) => setForm({ ...form, pregunta: e.target.value })}
        />

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12 }}>
          <div>
            <label className="admin-label">Carrera</label>
            <select
              className="admin-select" value={form.carrera_id || ''}
              onChange={(e) => setForm({ ...form, carrera_id: e.target.value })}
            >
              <option value="">— General —</option>
              {carreras.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
            </select>
          </div>
          <div>
            <label className="admin-label">Puntos</label>
            <input
              className="admin-input" type="number" min="0" value={form.puntos}
              onChange={(e) => setForm({ ...form, puntos: Number(e.target.value) })}
            />
          </div>
        </div>

        <label className="admin-label">Mensaje de feedback</label>
        <input
          className="admin-input" value={form.mensaje_feedback}
          onChange={(e) => setForm({ ...form, mensaje_feedback: e.target.value })}
          placeholder="Ej: ¡Correcto! La respuesta es..."
        />

        <label className="admin-label">Opciones de respuesta</label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {form.opciones.map((op, idx) => (
            <div key={idx} className="admin-row">
              <input
                className="admin-input" value={op.texto_opcion}
                placeholder={`Opción ${idx + 1}`}
                onChange={(e) => updateOp(idx, 'texto_opcion', e.target.value)}
              />
              <label className="admin-row" style={{ minWidth: 110 }}>
                <input
                  type="checkbox" checked={op.es_correcta}
                  onChange={(e) => updateOp(idx, 'es_correcta', e.target.checked)}
                />
                Correcta
              </label>
              <button type="button" className="admin-btn admin-btn--ghost admin-btn--sm" onClick={() => removeOp(idx)}>✕</button>
            </div>
          ))}
          <button type="button" className="admin-btn admin-btn--ghost admin-btn--sm" onClick={addOp}>
            + Agregar opción
          </button>
        </div>

        {inicial.id && (
          <label style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <input type="checkbox" checked={form.activa} onChange={(e) => setForm({ ...form, activa: e.target.checked })} />
            Activa
          </label>
        )}

        {error && <div className="admin-error">{error}</div>}

        <div className="admin-row" style={{ justifyContent: 'flex-end', marginTop: 18 }}>
          <button type="button" className="admin-btn admin-btn--ghost" onClick={onCerrar}>Cancelar</button>
          <button className="admin-btn" disabled={enviando}>{enviando ? 'Guardando…' : 'Guardar'}</button>
        </div>
      </form>
    </div>
  )
}

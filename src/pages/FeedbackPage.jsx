import { useState } from 'react'

const TIPOS = [
  { value: 'rating', label: 'Rating (1-5)' },
  { value: 'texto', label: 'Texto libre' },
]

const MOCK_PREGUNTAS = [
  {
    id: 1,
    pregunta: '¿Qué te pareció el evento?',
    tipo_pregunta: 'rating',
    categoria: 'Evento',
    activa: true,
  },
  {
    id: 2,
    pregunta: '¿Qué mejorarías?',
    tipo_pregunta: 'texto',
    categoria: 'Sugerencias',
    activa: true,
  },
]

const MOCK_RESPUESTAS = [
  {
    id: 1,
    pregunta: '¿Qué te pareció el evento?',
    tipo_pregunta: 'rating',
    valor_rating: 5,
    respuesta_texto: null,
    visitante_id: 12,
    respondido_en: '2026-05-10T10:00',
  },
  {
    id: 2,
    pregunta: '¿Qué mejorarías?',
    tipo_pregunta: 'texto',
    valor_rating: null,
    respuesta_texto: 'Más actividades interactivas.',
    visitante_id: 7,
    respondido_en: '2026-05-10T11:20',
  },
]

export default function FeedbackPage() {

  const [items, setItems] = useState(MOCK_PREGUNTAS)

  const [respuestas] = useState(MOCK_RESPUESTAS)

  const [editando, setEditando] = useState(null)

  const eliminar = (id) => {

    if (!window.confirm('¿Eliminar pregunta de feedback?')) return

    setItems(items.filter((item) => item.id !== id))
  }

  const guardar = (datos) => {

    if (editando?.id) {

      setItems(
        items.map((item) =>
          item.id === editando.id
            ? {
                ...item,
                ...datos,
              }
            : item
        )
      )

    } else {

      const nuevo = {
        id: Date.now(),
        ...datos,
      }

      setItems([...items, nuevo])
    }

    setEditando(null)
  }

  return (
    <>
      <div className="admin-topbar">

        <h2>
          Feedback
        </h2>

        <button
          className="admin-btn admin-btn--accent"
          onClick={() =>
            setEditando({
              tipo_pregunta: 'rating',
            })
          }
        >
          + Nueva pregunta
        </button>

      </div>

      <table className="admin-table">

        <thead>

          <tr>
            <th>Pregunta</th>
            <th>Tipo</th>
            <th>Categoría</th>
            <th>Estado</th>
            <th></th>
          </tr>

        </thead>

        <tbody>

          {items.map((p) => (

            <tr key={p.id}>

              <td>
                {p.pregunta}
              </td>

              <td>

                <span className="admin-chip admin-chip--gold">
                  {p.tipo_pregunta}
                </span>

              </td>

              <td>
                {p.categoria || '—'}
              </td>

              <td>

                <span
                  className={`admin-chip ${
                    p.activa
                      ? 'admin-chip--ok'
                      : 'admin-chip--off'
                  }`}
                >

                  {p.activa
                    ? 'Activa'
                    : 'Inactiva'}

                </span>

              </td>

              <td className="admin-row">

                <button
                  className="admin-btn admin-btn--ghost admin-btn--sm"
                  onClick={() => setEditando(p)}
                >
                  Editar
                </button>

                <button
                  className="admin-btn admin-btn--danger admin-btn--sm"
                  onClick={() => eliminar(p.id)}
                >
                  Eliminar
                </button>

              </td>

            </tr>

          ))}

          {items.length === 0 && (
            <tr>
              <td colSpan="5">
                Sin preguntas
              </td>
            </tr>
          )}

        </tbody>

      </table>

      <h3 style={{ marginTop: 30 }}>
        Respuestas recientes
      </h3>

      <table className="admin-table">

        <thead>

          <tr>
            <th>Pregunta</th>
            <th>Tipo</th>
            <th>Respuesta</th>
            <th>Visitante</th>
            <th>Fecha</th>
          </tr>

        </thead>

        <tbody>

          {respuestas.slice(0, 100).map((r) => (

            <tr key={r.id}>

              <td>
                {r.pregunta}
              </td>

              <td>
                {r.tipo_pregunta}
              </td>

              <td>

                {r.tipo_pregunta === 'rating'
                  ? `⭐ ${r.valor_rating}/5`
                  : r.respuesta_texto || '—'}

              </td>

              <td>
                #{r.visitante_id}
              </td>

              <td>
                {new Date(r.respondido_en).toLocaleString()}
              </td>

            </tr>

          ))}

          {respuestas.length === 0 && (
            <tr>
              <td colSpan="5">
                Sin respuestas
              </td>
            </tr>
          )}

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

function FeedbackModal({
  inicial,
  onCerrar,
  onGuardar,
}) {

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

    onGuardar(form)

    setEnviando(false)
  }

  return (
    <div
      className="admin-modal-overlay"
      onClick={onCerrar}
    >

      <form
        className="admin-modal"
        onClick={(e) => e.stopPropagation()}
        onSubmit={submit}
      >

        <h3>
          {inicial.id
            ? 'Editar pregunta'
            : 'Nueva pregunta'}
        </h3>

        <label className="admin-label">
          Pregunta
        </label>

        <textarea
          className="admin-textarea"
          rows={2}
          required
          value={form.pregunta}
          onChange={(e) =>
            setForm({
              ...form,
              pregunta: e.target.value,
            })
          }
        />

        <label className="admin-label">
          Tipo
        </label>

        <select
          className="admin-select"
          value={form.tipo_pregunta}
          onChange={(e) =>
            setForm({
              ...form,
              tipo_pregunta: e.target.value,
            })
          }
        >

          {TIPOS.map((t) => (

            <option
              key={t.value}
              value={t.value}
            >
              {t.label}
            </option>

          ))}

        </select>

        <label className="admin-label">
          Categoría
        </label>

        <input
          className="admin-input"
          value={form.categoria}
          onChange={(e) =>
            setForm({
              ...form,
              categoria: e.target.value,
            })
          }
        />

        {inicial.id && (

          <label
            style={{
              display: 'flex',
              gap: 8,
              marginTop: 12,
            }}
          >

            <input
              type="checkbox"
              checked={form.activa}
              onChange={(e) =>
                setForm({
                  ...form,
                  activa: e.target.checked,
                })
              }
            />

            Activa

          </label>

        )}

        <div
          className="admin-row"
          style={{
            justifyContent: 'flex-end',
            marginTop: 18,
          }}
        >

          <button
            type="button"
            className="admin-btn admin-btn--ghost"
            onClick={onCerrar}
          >
            Cancelar
          </button>

          <button
            className="admin-btn"
            disabled={enviando}
          >

            {enviando
              ? 'Guardando…'
              : 'Guardar'}

          </button>

        </div>

      </form>

    </div>
  )
}
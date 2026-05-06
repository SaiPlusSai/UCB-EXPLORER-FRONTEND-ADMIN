import { useState } from 'react'

const MOCK_CARRERAS = [
  { id: 1, nombre: 'Ingeniería de Sistemas' },
  { id: 2, nombre: 'Medicina' },
  { id: 3, nombre: 'Derecho' },
  { id: 4, nombre: 'Arquitectura' },
]

const MOCK_PREGUNTAS = [
  {
    id: 1,
    pregunta: '¿Qué es la programación?',
    carrera_nombre: 'Ingeniería de Sistemas',
    carrera_id: 1,
    puntos: 100,
    activa: true,
    mensaje_feedback: '',
    opciones: [
      { texto_opcion: 'Un lenguaje', es_correcta: false },
      { texto_opcion: 'Resolver problemas con lógica', es_correcta: true },
    ],
  },
  {
    id: 2,
    pregunta: '¿Cuántos huesos tiene el cuerpo humano?',
    carrera_nombre: 'Medicina',
    carrera_id: 2,
    puntos: 150,
    activa: true,
    mensaje_feedback: '',
    opciones: [
      { texto_opcion: '206', es_correcta: true },
      { texto_opcion: '150', es_correcta: false },
    ],
  },
]

export default function TriviaPage() {

  const [items, setItems] = useState(MOCK_PREGUNTAS)
  const [carreras] = useState(MOCK_CARRERAS)

  const [editando, setEditando] = useState(null)

  const eliminar = (id) => {
    if (!window.confirm('¿Eliminar pregunta?')) return

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
                carrera_nombre:
                  carreras.find((c) => c.id === Number(datos.carrera_id))?.nombre || 'General',
              }
            : item
        )
      )

    } else {

      const nueva = {
        id: Date.now(),
        ...datos,
        carrera_nombre:
          carreras.find((c) => c.id === Number(datos.carrera_id))?.nombre || 'General',
      }

      setItems([...items, nueva])
    }

    setEditando(null)
  }

  return (
    <>
      <div className="admin-topbar">
        <h2>Trivia</h2>

        <button
          className="admin-btn admin-btn--accent"
          onClick={() =>
            setEditando({
              opciones: [
                { texto_opcion: '', es_correcta: true },
                { texto_opcion: '', es_correcta: false },
              ],
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
              </td>

              <td>{p.carrera_nombre}</td>

              <td>{p.puntos}</td>

              <td>
                <span
                  className={`admin-chip ${
                    p.activa ? 'admin-chip--ok' : 'admin-chip--off'
                  }`}
                >
                  {p.activa ? 'Activa' : 'Inactiva'}
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
              <td colSpan="5">Sin preguntas</td>
            </tr>
          )}

        </tbody>
      </table>

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

function PreguntaModal({
  inicial,
  carreras,
  onCerrar,
  onGuardar,
}) {

  const [form, setForm] = useState({
    pregunta: inicial.pregunta || '',
    carrera_id: inicial.carrera_id || '',
    tipo_pregunta: inicial.tipo_pregunta || 'multiple',
    puntos: inicial.puntos ?? 100,
    mensaje_feedback: inicial.mensaje_feedback || '',
    activa: inicial.activa ?? true,

    opciones:
      inicial.opciones && inicial.opciones.length
        ? inicial.opciones.map((o) => ({
            texto_opcion: o.texto_opcion,
            es_correcta: !!o.es_correcta,
          }))
        : [
            { texto_opcion: '', es_correcta: true },
            { texto_opcion: '', es_correcta: false },
          ],
  })

  const updateOp = (idx, campo, valor) => {

    const next = form.opciones.map((o, i) =>
      i === idx
        ? { ...o, [campo]: valor }
        : o
    )

    setForm({
      ...form,
      opciones: next,
    })
  }

  const addOp = () => {

    setForm({
      ...form,
      opciones: [
        ...form.opciones,
        {
          texto_opcion: '',
          es_correcta: false,
        },
      ],
    })
  }

  const removeOp = (idx) => {

    setForm({
      ...form,
      opciones: form.opciones.filter((_, i) => i !== idx),
    })
  }

  const submit = (e) => {

    e.preventDefault()

    onGuardar({
      ...form,

      carrera_id: form.carrera_id || null,

      opciones: form.opciones.filter((o) =>
        o.texto_opcion.trim()
      ),
    })
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

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1fr',
            gap: 12,
          }}
        >

          <div>

            <label className="admin-label">
              Carrera
            </label>

            <select
              className="admin-select"
              value={form.carrera_id || ''}
              onChange={(e) =>
                setForm({
                  ...form,
                  carrera_id: e.target.value,
                })
              }
            >

              <option value="">
                — General —
              </option>

              {carreras.map((c) => (
                <option
                  key={c.id}
                  value={c.id}
                >
                  {c.nombre}
                </option>
              ))}

            </select>

          </div>

          <div>

            <label className="admin-label">
              Puntos
            </label>

            <input
              className="admin-input"
              type="number"
              min="0"
              value={form.puntos}
              onChange={(e) =>
                setForm({
                  ...form,
                  puntos: Number(e.target.value),
                })
              }
            />

          </div>

        </div>

        <label className="admin-label">
          Mensaje de feedback
        </label>

        <input
          className="admin-input"
          value={form.mensaje_feedback}
          onChange={(e) =>
            setForm({
              ...form,
              mensaje_feedback: e.target.value,
            })
          }
        />

        <label className="admin-label">
          Opciones
        </label>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
          }}
        >

          {form.opciones.map((op, idx) => (

            <div
              key={idx}
              className="admin-row"
            >

              <input
                className="admin-input"
                value={op.texto_opcion}
                placeholder={`Opción ${idx + 1}`}
                onChange={(e) =>
                  updateOp(
                    idx,
                    'texto_opcion',
                    e.target.value
                  )
                }
              />

              <label
                className="admin-row"
                style={{ minWidth: 110 }}
              >

                <input
                  type="checkbox"
                  checked={op.es_correcta}
                  onChange={(e) =>
                    updateOp(
                      idx,
                      'es_correcta',
                      e.target.checked
                    )
                  }
                />

                Correcta

              </label>

              <button
                type="button"
                className="admin-btn admin-btn--ghost admin-btn--sm"
                onClick={() => removeOp(idx)}
              >
                ✕
              </button>

            </div>

          ))}

          <button
            type="button"
            className="admin-btn admin-btn--ghost admin-btn--sm"
            onClick={addOp}
          >
            + Agregar opción
          </button>

        </div>

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

          <button className="admin-btn">
            Guardar
          </button>

        </div>

      </form>

    </div>
  )
}
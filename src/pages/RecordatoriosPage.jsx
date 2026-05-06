import { useState } from 'react'

const MOCK_CARRERAS = [
  { id: 1, nombre: 'Ingeniería de Sistemas' },
  { id: 2, nombre: 'Medicina' },
  { id: 3, nombre: 'Derecho' },
  { id: 4, nombre: 'Arquitectura' },
]

const MOCK_RECORDATORIOS = [
  {
    id: 1,
    titulo: 'Inicio del recorrido',
    descripcion: 'Presentación principal del Open House.',
    carrera_nombre: 'Ingeniería de Sistemas',
    carrera_id: 1,
    fecha_recordatorio: '2026-05-10T09:00',
    creado_por_admin: true,
  },
  {
    id: 2,
    titulo: 'Charla Medicina',
    descripcion: 'Auditorio central.',
    carrera_nombre: 'Medicina',
    carrera_id: 2,
    fecha_recordatorio: '2026-05-10T11:30',
    creado_por_admin: true,
  },
]

export default function RecordatoriosPage() {

  const [items, setItems] = useState(MOCK_RECORDATORIOS)

  const [carreras] = useState(MOCK_CARRERAS)

  const [editando, setEditando] = useState(null)

  const eliminar = (id) => {

    if (!window.confirm('¿Eliminar recordatorio?')) return

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
                  carreras.find((c) => c.id === Number(datos.carrera_id))?.nombre || '—',
              }
            : item
        )
      )

    } else {

      const nuevo = {
        id: Date.now(),
        ...datos,
        creado_por_admin: true,
        carrera_nombre:
          carreras.find((c) => c.id === Number(datos.carrera_id))?.nombre || '—',
      }

      setItems([...items, nuevo])
    }

    setEditando(null)
  }

  return (
    <>
      <div className="admin-topbar">

        <h2>
          Recordatorios oficiales
        </h2>

        <button
          className="admin-btn admin-btn--accent"
          onClick={() => setEditando({})}
        >
          + Nuevo recordatorio
        </button>

      </div>

      <table className="admin-table">

        <thead>

          <tr>
            <th>Título</th>
            <th>Carrera</th>
            <th>Fecha</th>
            <th>Origen</th>
            <th></th>
          </tr>

        </thead>

        <tbody>

          {items.map((r) => (

            <tr key={r.id}>

              <td>

                <strong>
                  {r.titulo}
                </strong>

                {r.descripcion && (
                  <div
                    style={{
                      fontSize: 12,
                      color: '#64748b',
                    }}
                  >
                    {r.descripcion}
                  </div>
                )}

              </td>

              <td>
                {r.carrera_nombre || '—'}
              </td>

              <td>

                {r.fecha_recordatorio
                  ? new Date(r.fecha_recordatorio).toLocaleString()
                  : '—'}

              </td>

              <td>

                <span
                  className={`admin-chip ${
                    r.creado_por_admin
                      ? 'admin-chip--gold'
                      : 'admin-chip--off'
                  }`}
                >

                  {r.creado_por_admin
                    ? 'Admin'
                    : 'Visitante'}

                </span>

              </td>

              <td className="admin-row">

                {r.creado_por_admin && (
                  <>

                    <button
                      className="admin-btn admin-btn--ghost admin-btn--sm"
                      onClick={() => setEditando(r)}
                    >
                      Editar
                    </button>

                    <button
                      className="admin-btn admin-btn--danger admin-btn--sm"
                      onClick={() => eliminar(r.id)}
                    >
                      Eliminar
                    </button>

                  </>
                )}

              </td>

            </tr>

          ))}

          {items.length === 0 && (
            <tr>
              <td colSpan="5">
                Sin recordatorios
              </td>
            </tr>
          )}

        </tbody>

      </table>

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

function RecordatorioModal({
  inicial,
  carreras,
  onCerrar,
  onGuardar,
}) {

  const [form, setForm] = useState({
    titulo: inicial.titulo || '',
    descripcion: inicial.descripcion || '',
    carrera_id: inicial.carrera_id || '',

    fecha_recordatorio:
      inicial.fecha_recordatorio || '',
  })

  const [enviando, setEnviando] = useState(false)

  const submit = async (e) => {

    e.preventDefault()

    setEnviando(true)

    onGuardar({
      titulo: form.titulo.trim(),
      descripcion: form.descripcion.trim() || null,
      carrera_id: form.carrera_id
        ? Number(form.carrera_id)
        : null,
      fecha_recordatorio:
        form.fecha_recordatorio || null,
    })

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
            ? 'Editar recordatorio'
            : 'Nuevo recordatorio'}
        </h3>

        <label className="admin-label">
          Título
        </label>

        <input
          className="admin-input"
          required
          value={form.titulo}
          onChange={(e) =>
            setForm({
              ...form,
              titulo: e.target.value,
            })
          }
        />

        <label className="admin-label">
          Descripción
        </label>

        <textarea
          className="admin-textarea"
          rows={3}
          value={form.descripcion}
          onChange={(e) =>
            setForm({
              ...form,
              descripcion: e.target.value,
            })
          }
        />

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
            — Sin carrera específica —
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

        <label className="admin-label">
          Fecha
        </label>

        <input
          type="datetime-local"
          className="admin-input"
          value={form.fecha_recordatorio}
          onChange={(e) =>
            setForm({
              ...form,
              fecha_recordatorio: e.target.value,
            })
          }
        />

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
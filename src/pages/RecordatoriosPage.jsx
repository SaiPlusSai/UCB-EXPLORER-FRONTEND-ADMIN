import { useEffect, useState } from 'react'

import {
  Plus,
  Pencil,
  Trash2,
  Bell,
  CalendarDays,
  GraduationCap,
  X,
} from 'lucide-react'

import {
  remindersApi,
  carrerasApi,
} from '../api/endpoints'

export default function RecordatoriosPage() {

  const [items, setItems] = useState([])

  const [carreras, setCarreras] =
    useState([])

  const [cargando, setCargando] =
    useState(true)

  const [editando, setEditando] =
    useState(null)

  const [error, setError] =
    useState('')

  const cargar = async () => {

    setCargando(true)

    try {

      const [
        recRes,
        carrerasRes,
      ] = await Promise.all([
        remindersApi.listarAdmin(),
        carrerasApi.listar(),
      ])

      setItems(recRes.data.data)

      setCarreras(carrerasRes.data.data)

    } catch (e) {

      setError(
        e.response?.data?.error ||
        'Error cargando recordatorios'
      )

    } finally {

      setCargando(false)

    }
  }

  useEffect(() => {
    cargar()
  }, [])

  const eliminar = async (id) => {

    if (
      !window.confirm(
        '¿Eliminar recordatorio?'
      )
    ) return

    try {

      await remindersApi.eliminarAdmin(
        id
      )

      cargar()

    } catch (e) {

      setError(
        e.response?.data?.error ||
        'No se pudo eliminar'
      )

    }
  }

  const guardar = async (datos) => {

    try {

      if (editando?.id) {

        await remindersApi.actualizarAdmin(
          editando.id,
          datos
        )

      } else {

        await remindersApi.crearAdmin(
          datos
        )

      }

      setEditando(null)

      cargar()

    } catch (e) {

      throw new Error(
        e.response?.data?.error ||
        'No se pudo guardar'
      )

    }
  }

  return (

    <div className="panel-page">

      <div className="panel-topbar">

        <div>

          <p className="panel-subtitle">
            Panel Administrativo
          </p>

          <h1 className="panel-title">
            Recordatorios
          </h1>

        </div>

        <button
          className="panel-create-btn"
          onClick={() =>
            setEditando({})
          }
        >

          <Plus size={18} />

          Nuevo Recordatorio

        </button>

      </div>

      {error && (
        <div className="admin-error">
          {error}
        </div>
      )}

      {cargando ? (

        <div className="admin-loader" />

      ) : (

        <div className="panel-table-card">

          <div className="panel-table-header">

            <div className="panel-count">

              {items.length} recordatorios

            </div>

          </div>

          <div className="panel-table-wrapper">

            <table className="panel-table">

              <thead>

                <tr>

                  <th>Título</th>

                  <th>Carrera</th>

                  <th>Fecha</th>

                  <th>Acciones</th>

                </tr>

              </thead>

              <tbody>

                {items.map((r) => (

                  <tr key={r.id}>

                    <td>

                      <div className="panel-entity">

                        <Bell size={18} />

                        <div>

                          <strong>
                            {r.titulo}
                          </strong>

                          {r.descripcion && (

                            <p>
                              {r.descripcion}
                            </p>

                          )}

                        </div>

                      </div>

                    </td>

                    <td>

                      {r.carrera_nombre ? (

                        <span className="panel-pill panel-pill-warning">

                          <GraduationCap
                            size={14}
                            style={{
                              marginRight: 6,
                            }}
                          />

                          {r.carrera_nombre}

                        </span>

                      ) : (

                        <span
                          style={{
                            color:
                              '#64748b',
                          }}
                        >

                          Todos

                        </span>

                      )}

                    </td>

                    <td>

                      <div className="panel-location">

                        <CalendarDays
                          size={16}
                        />

                        <span>

                          {r.fecha_recordatorio
                            ? new Date(
                                r.fecha_recordatorio
                              ).toLocaleString(
                                'es-BO'
                              )
                            : '—'}

                        </span>

                      </div>

                    </td>

                    <td>

                      <div className="panel-actions">

                        <button
                          className="panel-icon-btn edit"
                          data-tooltip="Editar"
                          onClick={() =>
                            setEditando(r)
                          }
                        >

                          <Pencil size={16} />

                        </button>

                        <button
                          className="panel-icon-btn delete"
                          data-tooltip="Eliminar Recordatorio"
                          onClick={() =>
                            eliminar(r.id)
                          }
                        >

                          <Trash2 size={16} />

                        </button>

                      </div>

                    </td>

                  </tr>

                ))}

                {items.length === 0 && (

                  <tr>

                    <td
                      colSpan="4"
                      style={{
                        textAlign:
                          'center',
                        padding: 40,
                        opacity: 0.7,
                      }}
                    >

                      Sin recordatorios registrados

                    </td>

                  </tr>

                )}

              </tbody>

            </table>

          </div>

        </div>

      )}

      {editando && (

        <RecordatorioModal
          inicial={editando}
          carreras={carreras}
          onCerrar={() =>
            setEditando(null)
          }
          onGuardar={guardar}
        />

      )}

    </div>
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
    descripcion:
      inicial.descripcion || '',
    carrera_id:
      inicial.carrera_id || '',

    fecha_recordatorio:
      inicial.fecha_recordatorio
        ? inicial.fecha_recordatorio.slice(
            0,
            16
          )
        : '',
  })

  const [enviando, setEnviando] =
    useState(false)

  const [error, setError] =
    useState('')

  const submit = async (e) => {

    e.preventDefault()

    setEnviando(true)

    setError('')

    try {

      await onGuardar({
        titulo:
          form.titulo.trim(),

        descripcion:
          form.descripcion.trim() ||
          null,

        carrera_id:
          form.carrera_id
            ? Number(
                form.carrera_id
              )
            : null,

        fecha_recordatorio:
          form.fecha_recordatorio ||
          null,
      })

    } catch (e) {

      setError(e.message)

    } finally {

      setEnviando(false)

    }
  }

  return (

    <div
      className="panel-modal-overlay"
      onClick={onCerrar}
    >

      <form
        className="panel-modal"
        onClick={(e) =>
          e.stopPropagation()
        }
        onSubmit={submit}
      >

        <div className="panel-modal-header">

          <div>

            <p>
              Administración
            </p>

            <h3>
              {inicial.id
                ? 'Editar Recordatorio'
                : 'Nuevo Recordatorio'}
            </h3>

          </div>

          <button
            type="button"
            className="panel-close-btn"
            onClick={onCerrar}
          >

            <X size={18} />

          </button>

        </div>

        <div className="panel-modal-form">

          <div className="panel-form-group">

            <label>
              Título
            </label>

            <input
              className="panel-input"
              required
              value={form.titulo}
              onChange={(e) =>
                setForm({
                  ...form,
                  titulo:
                    e.target.value,
                })
              }
            />

          </div>

          <div className="panel-form-group">

            <label>
              Descripción
            </label>

            <textarea
              className="panel-input"
              rows={4}
              value={form.descripcion}
              onChange={(e) =>
                setForm({
                  ...form,
                  descripcion:
                    e.target.value,
                })
              }
              placeholder="Detalles del evento o aviso..."
            />

          </div>

          <div className="panel-form-group">

            <label>
              Carrera específica
            </label>

            <select
              className="panel-input"
              value={
                form.carrera_id || ''
              }
              onChange={(e) =>
                setForm({
                  ...form,
                  carrera_id:
                    e.target.value,
                })
              }
            >

              <option value="">
                — Todos los visitantes —
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

          <div className="panel-form-group">

            <label>
              Fecha y hora
            </label>

            <input
              type="datetime-local"
              className="panel-input"
              value={
                form.fecha_recordatorio
              }
              onChange={(e) =>
                setForm({
                  ...form,
                  fecha_recordatorio:
                    e.target.value,
                })
              }
            />

          </div>

          {error && (
            <div className="admin-error">
              {error}
            </div>
          )}

          <button
            className="panel-save-btn"
            disabled={enviando}
          >

            {enviando
              ? 'Guardando...'
              : 'Guardar'}

          </button>

        </div>

      </form>

    </div>
  )
}
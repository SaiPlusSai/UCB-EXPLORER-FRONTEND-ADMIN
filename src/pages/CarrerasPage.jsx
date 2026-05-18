import { useEffect, useState } from 'react'

import {
  Plus,
  Pencil,
  Trash2,
  Power,
  X,
  GraduationCap,
} from 'lucide-react'

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

      setError(
        e.response?.data?.error || 'Error'
      )

    } finally {

      setCargando(false)

    }
  }

  useEffect(() => {
    cargar()
  }, [])

  const guardar = async (datos) => {

    try {

      if (editando?.id) {

        await carrerasApi.actualizar(
          editando.id,
          datos
        )

      } else {

        await carrerasApi.crear(datos)

      }

      setEditando(null)

      cargar()

    } catch (e) {

      setError(
        e.response?.data?.error ||
        'No se pudo guardar'
      )

    }
  }

  const toggleActiva = async (c) => {

    await carrerasApi.actualizar(
      c.id,
      {
        activa: !c.activa,
      }
    )

    cargar()

  }

  const eliminar = async (id) => {

    if (
      !window.confirm(
        '¿Eliminar esta carrera?'
      )
    ) return

    try {

      await carrerasApi.eliminar(id)

      cargar()

    } catch (e) {

      setError(
        e.response?.data?.error ||
        'No se pudo eliminar'
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
            Carreras
          </h1>

        </div>

        <button
          className="panel-create-btn"
          onClick={() => setEditando({})}
        >

          <Plus size={18} />

          Nueva Carrera

        </button>

      </div>

      {error && (
        <div className="admin-error">
          {error}
        </div>
      )}

      <div className="panel-table-card">

        <div className="panel-table-header">

          <div className="panel-count">

            {items.length} carreras

          </div>

        </div>

        {cargando ? (

          <div className="admin-loader" />

        ) : (

          <div className="panel-table-wrapper">

            <table className="panel-table">

              <thead>

                <tr>

                  <th>Nombre</th>

                  <th>Descripción</th>

                  <th>Estado</th>

                  <th>Acciones</th>

                </tr>

              </thead>

              <tbody>

                {items.map((c) => (

                  <tr key={c.id}>

                    <td>

                      <div className="panel-entity">

                        <GraduationCap size={18} />

                        <div>

                          <strong>
                            {c.nombre}
                          </strong>

                        </div>

                      </div>

                    </td>

                    <td
                      style={{
                        color: '#64748b',
                        maxWidth: 520,
                      }}
                    >

                      {c.descripcion || '—'}

                    </td>

                    <td>

                      <span
                        className={`panel-pill ${
                          c.activa
                            ? 'panel-pill-success'
                            : 'panel-pill-neutral'
                        }`}
                      >

                        {c.activa
                          ? 'Activa'
                          : 'Inactiva'}

                      </span>

                    </td>

                    <td>

                      <div className="panel-actions">

                        <button
                          className="panel-icon-btn edit"
                          data-tooltip="Editar"
                          onClick={() => setEditando(c)}
                        >

                          <Pencil size={16} />

                        </button>

                        <button
                          className="panel-icon-btn warning"
                          data-tooltip="Activar/Desactivar Carrera"
                          onClick={() =>
                            toggleActiva(c)
                          }
                        >

                          <Power size={16} />

                        </button>

                        <button
                          className="panel-icon-btn delete"
                          data-tooltip="Eliminar Carrera"
                          onClick={() =>
                            eliminar(c.id)
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
                        textAlign: 'center',
                        padding: 40,
                        opacity: 0.7,
                      }}
                    >

                      Sin carreras

                    </td>

                  </tr>

                )}

              </tbody>

            </table>

          </div>

        )}

      </div>

      {editando && (

        <CarreraModal
          inicial={editando}
          onCerrar={() => setEditando(null)}
          onGuardar={guardar}
        />

      )}

    </div>
  )
}

function CarreraModal({
  inicial,
  onCerrar,
  onGuardar,
}) {

  const [form, setForm] = useState({
    nombre: inicial.nombre || '',
    descripcion:
      inicial.descripcion || '',
    activa: inicial.activa ?? true,
  })

  const [enviando, setEnviando] =
    useState(false)

  const submit = async (e) => {

    e.preventDefault()

    setEnviando(true)

    await onGuardar(form)

    setEnviando(false)

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
                ? 'Editar Carrera'
                : 'Nueva Carrera'}
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
              Nombre
            </label>

            <input
              className="panel-input"
              required
              value={form.nombre}
              onChange={(e) =>
                setForm({
                  ...form,
                  nombre:
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
            />

          </div>

          {inicial.id && (

            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                marginTop: -6,
              }}
            >

              <input
                type="checkbox"
                checked={form.activa}
                onChange={(e) =>
                  setForm({
                    ...form,
                    activa:
                      e.target.checked,
                  })
                }
              />

              Activa

            </label>

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
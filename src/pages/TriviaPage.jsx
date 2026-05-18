import { useEffect, useState } from 'react'

import {
  Plus,
  Pencil,
  Trash2,
  Power,
  Brain,
  Trophy,
  MessageSquare,
  X,
  Search,
} from 'lucide-react'

import {
  triviaApi,
  carrerasApi,
} from '../api/endpoints'

export default function TriviaPage() {

  const [items, setItems] = useState([])

  const [carreras, setCarreras] = useState([])

  const [cargando, setCargando] =
    useState(true)

  const [editando, setEditando] =
    useState(null)

  const [error, setError] = useState('')

  const [filtroCarrera, setFiltroCarrera] =
    useState('')

  const cargar = async () => {

    setCargando(true)

    try {

      const [
        triviaRes,
        carrerasRes,
      ] = await Promise.all([
        triviaApi.listar(
  filtroCarrera &&
  filtroCarrera !== 'general'
    ? filtroCarrera
    : undefined
),
        carrerasApi.listar(),
      ])

      setItems(triviaRes.data.data)

      setCarreras(carrerasRes.data.data)

    } catch (e) {

      setError(
        e.response?.data?.error ||
        'Error cargando trivia'
      )

    } finally {

      setCargando(false)

    }
  }

  useEffect(() => {
    cargar()
  }, [filtroCarrera])

  const eliminar = async (id) => {

    if (
      !window.confirm(
        '¿Eliminar pregunta?'
      )
    ) return

    try {

      await triviaApi.eliminar(id)

      cargar()

    } catch (e) {

      setError(
        e.response?.data?.error ||
        'No se pudo eliminar'
      )

    }
  }

  const toggleActiva = async (p) => {

    try {

      await triviaApi.actualizar(
        p.id,
        {
          activa: !p.activa,
        }
      )

      cargar()

    } catch (e) {

      setError(
        e.response?.data?.error ||
        'Error'
      )

    }
  }

  const guardar = async (datos) => {

    try {

      if (editando?.id) {

        await triviaApi.actualizar(
          editando.id,
          datos
        )

      } else {

        await triviaApi.crear(datos)

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
            Trivia
          </h1>

        </div>

        <button
          className="panel-create-btn"
          onClick={() =>
            setEditando({
              opciones: [
                {
                  texto_opcion: '',
                  es_correcta: true,
                },
                {
                  texto_opcion: '',
                  es_correcta: false,
                },
              ],
            })
          }
        >

          <Plus size={18} />

          Nueva Pregunta

        </button>

      </div>

      {error && (
        <div className="admin-error">
          {error}
        </div>
      )}

      <div className="panel-table-card">

        <div className="panel-table-header">
          <div
  className="panel-search-box"
  style={{
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    minWidth: 320,
  }}
>

  <Search
    size={18}
    style={{
      flexShrink: 0,
    }}
  />

  <select
    value={filtroCarrera}
    onChange={(e) =>
      setFiltroCarrera(
        e.target.value
      )
    }
    style={{
      border: 'none',
      outline: 'none',
      background: 'transparent',
      width: '100%',
      height: '100%',
      paddingLeft: 10,
      paddingRight: 42,
      fontSize: 15,
      fontWeight: 500,
      color: '#0f172a',
      cursor: 'pointer',
      appearance: 'none',
      WebkitAppearance: 'none',
      MozAppearance: 'none',
    }}
  >

    <option value="">
      Todas las carreras
    </option>

    <option value="general">
      General
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

  <span
    style={{
      position: 'absolute',
      right: 18,
      top: '50%',
      transform: 'translateY(-50%)',
      pointerEvents: 'none',
      color: '#64748b',
      fontSize: 11,
    }}
  >

    ▼

  </span>

</div>
          <div className="panel-count">

            {items.length} preguntas

          </div>

        </div>

        {cargando ? (

          <div className="admin-loader" />

        ) : (

          <div className="panel-table-wrapper">

            <table className="panel-table">

              <thead>

                <tr>

                  <th>Pregunta</th>

                  <th>Carrera</th>

                  <th>Puntos</th>

                  <th>Estado</th>

                  <th>Acciones</th>

                </tr>

              </thead>

              <tbody>

                {items.map((p) => (

                  <tr key={p.id}>

                    <td>

                      <div className="panel-entity">

                        <Brain size={18} />

                        <div>

                          <strong>
                            {p.pregunta}
                          </strong>

                          {p.mensaje_feedback && (

                            <p
                              style={{
                                marginTop: 8,
                              }}
                            >

                              <MessageSquare
                                size={13}
                                style={{
                                  marginRight: 4,
                                }}
                              />

                              {p.mensaje_feedback}

                            </p>

                          )}

                        </div>

                      </div>

                    </td>

                    <td>

                      <span
  className="panel-pill panel-pill-neutral"
  style={{
    whiteSpace: 'nowrap',
  }}
>
  {p.carrera_nombre ||
    'General'}

</span>

                    </td>

                    <td>

                      <span
  className="panel-pill panel-pill-warning"
  style={{
    whiteSpace: 'nowrap',
    minWidth: 86,
    justifyContent: 'center',
  }}
>
                        {p.puntos} pts

                      </span>

                    </td>

                    <td>

                      <span
                        className={`panel-pill ${
                          p.activa
                            ? 'panel-pill-success'
                            : 'panel-pill-neutral'
                        }`}
                      >

                        {p.activa
                          ? 'Activa'
                          : 'Inactiva'}

                      </span>

                    </td>

                    <td>

                      <div className="panel-actions">

                        <button
                          className="panel-icon-btn edit"
                          data-tooltip="Editar"
                          onClick={() =>
                            setEditando(p)
                          }
                        >

                          <Pencil size={16} />

                        </button>

                        <button
                          className="panel-icon-btn warning"
                          data-tooltip="Activar/Desactivar Pregunta"
                          onClick={() =>
                            toggleActiva(p)
                          }
                        >

                          <Power size={16} />

                        </button>

                        <button
                          className="panel-icon-btn delete"
                          data-tooltip="Eliminar Pregunta"
                          onClick={() =>
                            eliminar(p.id)
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
                      colSpan="5"
                      style={{
                        textAlign: 'center',
                        padding: 40,
                        opacity: 0.7,
                      }}
                    >

                      Sin preguntas registradas

                    </td>

                  </tr>

                )}

              </tbody>

            </table>

          </div>

        )}

      </div>

      {editando && (

        <PreguntaModal
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

function PreguntaModal({
  inicial,
  carreras,
  onCerrar,
  onGuardar,
}) {

  const [form, setForm] = useState({
    pregunta: inicial.pregunta || '',
    carrera_id:
      inicial.carrera_id || '',
    puntos:
      inicial.puntos ?? 100,
    mensaje_feedback:
      inicial.mensaje_feedback || '',
    activa:
      inicial.activa ?? true,

    opciones:
      inicial.opciones?.length
        ? inicial.opciones.map(
            (o) => ({
              texto_opcion:
                o.texto_opcion,
              es_correcta:
                !!o.es_correcta,
            })
          )
        : [
            {
              texto_opcion: '',
              es_correcta: true,
            },
            {
              texto_opcion: '',
              es_correcta: false,
            },
          ],
  })

  const [enviando, setEnviando] =
    useState(false)

  const [error, setError] =
    useState('')

  const updateOp = (
    idx,
    campo,
    valor
  ) => {

    setForm({
      ...form,
      opciones: form.opciones.map(
        (o, i) =>
          i === idx
            ? {
                ...o,
                [campo]: valor,
              }
            : o
      ),
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
      opciones:
        form.opciones.filter(
          (_, i) => i !== idx
        ),
    })

  }

  const submit = async (e) => {

    e.preventDefault()

    setEnviando(true)

    setError('')

    try {

      await onGuardar({
        ...form,

        carrera_id:
          form.carrera_id
            ? Number(
                form.carrera_id
              )
            : null,

        opciones:
          form.opciones.filter(
            (o) =>
              o.texto_opcion.trim()
          ),
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
                ? 'Editar Pregunta'
                : 'Nueva Pregunta'}
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
              Pregunta
            </label>

            <textarea
              className="panel-input"
              rows={3}
              required
              value={form.pregunta}
              onChange={(e) =>
                setForm({
                  ...form,
                  pregunta:
                    e.target.value,
                })
              }
            />

          </div>

          <div className="panel-form-row">

            <div className="panel-form-group">

              <label>
                Carrera
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

            <div className="panel-form-group">

              <label>
                Puntos
              </label>

              <input
                className="panel-input"
                type="number"
                min="0"
                value={form.puntos}
                onChange={(e) =>
                  setForm({
                    ...form,
                    puntos: Number(
                      e.target.value
                    ),
                  })
                }
              />

            </div>

          </div>

          <div className="panel-form-group">

            <label>
              Feedback
            </label>

            <input
              className="panel-input"
              value={
                form.mensaje_feedback
              }
              onChange={(e) =>
                setForm({
                  ...form,
                  mensaje_feedback:
                    e.target.value,
                })
              }
              placeholder="Ej: ¡Correcto!"
            />

          </div>

          <div className="panel-form-group">

            <label>
              Opciones
            </label>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
              }}
            >

              {form.opciones.map(
                (op, idx) => (

                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      gap: 10,
                      alignItems:
                        'center',
                    }}
                  >

                    <input
                      className="panel-input"
                      value={
                        op.texto_opcion
                      }
                      placeholder={`Opción ${
                        idx + 1
                      }`}
                      onChange={(e) =>
                        updateOp(
                          idx,
                          'texto_opcion',
                          e.target.value
                        )
                      }
                    />

                    <label
                      style={{
                        display: 'flex',
                        alignItems:
                          'center',
                        gap: 8,
                        minWidth: 110,
                      }}
                    >

                      <input
                        type="checkbox"
                        checked={
                          op.es_correcta
                        }
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
                      className="panel-icon-btn delete"
                      onClick={() =>
                        removeOp(idx)
                      }
                    >

                      <Trash2 size={15} />

                    </button>

                  </div>

                )
              )}

              <button
                type="button"
                className="panel-create-btn"
                onClick={addOp}
                style={{
                  width: 'fit-content',
                  marginTop: 6,
                }}
              >

                <Plus size={16} />

                Agregar opción

              </button>

            </div>

          </div>

          {inicial.id && (

            <label
              style={{
                display: 'flex',
                gap: 10,
                alignItems: 'center',
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
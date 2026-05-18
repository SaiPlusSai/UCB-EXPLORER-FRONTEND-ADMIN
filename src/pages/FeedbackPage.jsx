import { useEffect, useState } from 'react'

import {
  Plus,
  Pencil,
  Trash2,
  Power,
  Star,
  MessageSquare,
  ChartColumn,
  LayoutGrid,
  CalendarDays,
  X,
} from 'lucide-react'

import { feedbackApi } from '../api/endpoints'

const TIPOS = [
  {
    value: 'rating',
    label: '⭐ Rating (1–5)',
  },
  {
    value: 'texto_libre',
    label: '✏️ Texto libre',
  },
]

const CATEGORIAS = [
  'Evento',
  'Carreras',
  'Instalaciones',
  'Organización',
  'Atención',
  'Experiencia',
  'General',
]

function BarChart({ data }) {

  const filtrado =
    data.filter((d) => d.valor > 0)

  const max = Math.max(
    ...filtrado.map((d) => d.valor),
    1
  )

  return (

    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
      }}
    >

      {filtrado.map((d) => (

        <div
          key={d.label}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >

          <span
            style={{
              width: 28,
              fontSize: 12,
              fontWeight: 700,
              color: '#475569',
            }}
          >

            {d.label}

          </span>

          <div
            style={{
              flex: 1,
              height: 20,
              background: '#e2e8f0',
              borderRadius: 999,
              overflow: 'hidden',
            }}
          >

            <div
              style={{
                width: `${
                  (d.valor / max) * 100
                }%`,
                height: '100%',
                background:
                  'linear-gradient(90deg,#facc15,#eab308)',
                borderRadius: 999,
                transition:
                  'width .25s ease',
              }}
            />

          </div>

          <span
            style={{
              width: 30,
              fontSize: 12,
              color: '#64748b',
            }}
          >

            {d.valor}

          </span>

        </div>

      ))}

    </div>
  )
}

export default function FeedbackPage() {

  const [items, setItems] =
    useState([])

  const [respuestas, setRespuestas] =
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
        pregRes,
        respRes,
      ] = await Promise.all([
        feedbackApi.listarAdmin(),
        feedbackApi.respuestas(),
      ])

      setItems(pregRes.data.data)

      setRespuestas(respRes.data.data)

    } catch (e) {

      setError(
        e.response?.data?.error ||
        'Error cargando feedback'
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
        '¿Eliminar pregunta de feedback?'
      )
    ) return

    try {

      await feedbackApi.eliminar(id)

      cargar()

    } catch (e) {

      setError(
        e.response?.data?.error ||
        'No se pudo eliminar'
      )

    }
  }

  const toggleActiva = async (
    item
  ) => {

    try {

      await feedbackApi.actualizar(
        item.id,
        {
          activa: !item.activa,
        }
      )

      cargar()

    } catch (e) {

      setError(
        e.response?.data?.error ||
        'No se pudo actualizar'
      )

    }
  }

  const guardar = async (
    datos
  ) => {

    try {

      if (editando?.id) {

        await feedbackApi.actualizar(
          editando.id,
          datos
        )

      } else {

        await feedbackApi.crear(
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

  const ratingPorPregunta = (
    preguntaId
  ) => {

    const rs =
      respuestas.filter(
        (r) =>
          r.pregunta_id ===
            preguntaId &&
          r.valor_rating != null
      )

    if (rs.length === 0)
      return null

    const prom =
      rs.reduce(
        (s, r) =>
          s +
          Number(
            r.valor_rating
          ),
        0
      ) / rs.length

    return prom.toFixed(1)
  }

  const distribucionRating = (
    preguntaId
  ) => {

    const rs =
      respuestas.filter(
        (r) =>
          r.pregunta_id ===
            preguntaId &&
          r.valor_rating != null
      )

    return [1, 2, 3, 4, 5].map(
      (n) => ({
        label: `${n}★`,
        valor: rs.filter(
          (r) =>
            Number(
              r.valor_rating
            ) === n
        ).length,
      })
    )
  }

  const totalRespuestasPorPregunta =
    (id) =>
      respuestas.filter(
        (r) =>
          r.pregunta_id === id
      ).length

  const resumenCategorias =
    CATEGORIAS.map((cat) => ({
      categoria: cat,
      total: items.filter(
        (i) =>
          i.categoria === cat
      ).length,
    })).filter((c) => c.total > 0)

  return (

    <div className="panel-page">

      <div className="panel-topbar">

        <div>

          <p className="panel-subtitle">
            Panel Administrativo
          </p>

          <h1 className="panel-title">
            Feedback
          </h1>

        </div>

        <button
          className="panel-create-btn"
          onClick={() =>
            setEditando({
              tipo_pregunta:
                'rating',
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

      {cargando ? (

        <div className="admin-loader" />

      ) : (

        <>
          <div
            style={{
              display: 'flex',
              gap: 10,
              flexWrap: 'wrap',
              marginBottom: 22,
            }}
          >

            {resumenCategorias.map(
              (c) => (

                <span
                  key={
                    c.categoria
                  }
                  className="panel-pill panel-pill-neutral"
                >

                  <LayoutGrid
                    size={13}
                    style={{
                      marginRight: 6,
                    }}
                  />

                  {c.categoria}:{' '}
                  {c.total}

                </span>

              )
            )}

          </div>

          <div className="panel-table-card">

            <div className="panel-table-wrapper">

              <table className="panel-table">

                <thead>

                  <tr>

                    <th>Pregunta</th>

                    <th>Tipo</th>

                    <th>Categoría</th>

                    <th>Respuestas</th>

                    <th>Promedio</th>

                    <th>Estado</th>

                    <th>Acciones</th>

                  </tr>

                </thead>

                <tbody>

                  {items.map((p) => (

                    <tr key={p.id}>

                      <td>

                        <div className="panel-entity">

                          <MessageSquare
                            size={18}
                          />

                          <div>

                            <strong>
                              {
                                p.pregunta
                              }
                            </strong>

                          </div>

                        </div>

                      </td>

                      <td>

                        <span
                          className={`panel-pill ${
                            p.tipo_pregunta ===
                            'rating'
                              ? 'panel-pill-warning'
                              : 'panel-pill-neutral'
                          }`}
                        >

                          {p.tipo_pregunta ===
                          'rating'
                            ? '⭐ Rating'
                            : '✏️ Texto'}

                        </span>

                      </td>

                      <td>

                        <span className="panel-pill panel-pill-neutral">

                          {
                            p.categoria
                          }

                        </span>

                      </td>

                      <td>

                        {
                          totalRespuestasPorPregunta(
                            p.id
                          )
                        }

                      </td>

                      <td>

                        {p.tipo_pregunta ===
                        'rating' ? (

                          ratingPorPregunta(
                            p.id
                          ) ? (

                            <span className="panel-pill panel-pill-warning">

                              ⭐{' '}
                              {ratingPorPregunta(
                                p.id
                              )}
                              /5

                            </span>

                          ) : (
                            '—'
                          )

                        ) : (
                          '—'
                        )}

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
                              setEditando(
                                p
                              )
                            }
                          >

                            <Pencil size={16} />

                          </button>

                          <button
                            className="panel-icon-btn warning"
                            data-tooltip="Activar/Desactivar Pregunta"
                            onClick={() =>
                              toggleActiva(
                                p
                              )
                            }
                          >

                            <Power size={16} />

                          </button>

                          <button
                            className="panel-icon-btn delete"
                            data-tooltip="Eliminar Pregunta"
                            onClick={() =>
                              eliminar(
                                p.id
                              )
                            }
                          >

                            <Trash2 size={16} />

                          </button>

                        </div>

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          </div>

          {items.filter(
            (p) =>
              p.tipo_pregunta ===
              'rating'
          ).length > 0 && (

            <>
              <div
                style={{
                  marginTop: 34,
                  marginBottom: 18,
                }}
              >

                <p className="panel-subtitle">
                  Estadísticas
                </p>

                <h2
                  style={{
                    margin: 0,
                    color:
                      'var(--ucb-azul-oscuro)',
                  }}
                >

                  Análisis de Ratings

                </h2>

              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns:
                    'repeat(auto-fit,minmax(320px,1fr))',
                  gap: 20,
                  marginBottom: 30,
                }}
              >

                {items
                  .filter(
                    (p) =>
                      p.tipo_pregunta ===
                      'rating'
                  )
                  .map((p) => (

                    <div
                      key={p.id}
                      className="panel-table-card"
                      style={{
                        padding: 24,
                      }}
                    >

                      <div
                        style={{
                          display:
                            'flex',
                          alignItems:
                            'center',
                          gap: 8,
                          marginBottom: 16,
                        }}
                      >

                        <ChartColumn
                          size={18}
                        />

                        <strong>

                          {
                            p.pregunta
                          }

                        </strong>

                      </div>

                      {ratingPorPregunta(
                        p.id
                      ) ? (

                        <>
                          <div
                            style={{
                              fontSize: 42,
                              fontWeight: 800,
                              color:
                                '#eab308',
                              marginBottom: 18,
                            }}
                          >

                            ⭐{' '}
                            {ratingPorPregunta(
                              p.id
                            )}

                            <span
                              style={{
                                fontSize: 16,
                                color:
                                  '#94a3b8',
                              }}
                            >

                              /5

                            </span>

                          </div>

                          <BarChart
                            data={distribucionRating(
                              p.id
                            )}
                          />

                        </>

                      ) : (

                        <div
                          style={{
                            color:
                              '#64748b',
                          }}
                        >

                          Sin respuestas aún

                        </div>

                      )}

                    </div>

                  ))}

              </div>

            </>
          )}

          <div
            style={{
              display: 'flex',
              justifyContent:
                'space-between',
              alignItems: 'center',
              marginBottom: 16,
            }}
          >

            <div>

              <p className="panel-subtitle">
                Actividad
              </p>

              <h2
                style={{
                  margin: 0,
                  color:
                    'var(--ucb-azul-oscuro)',
                }}
              >

                Respuestas recientes

              </h2>

            </div>

            <span className="panel-pill panel-pill-warning">

              {respuestas.length}{' '}
              total

            </span>

          </div>

          <div className="panel-table-card">

            <div className="panel-table-wrapper">

              <table className="panel-table">

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

                  {respuestas
                    .slice(0, 100)
                    .map((r) => (

                      <tr key={r.id}>

                        <td>

                          {
                            r.pregunta
                          }

                        </td>

                        <td>

                          <span
                            className={`panel-pill ${
                              r.tipo_pregunta ===
                              'rating'
                                ? 'panel-pill-warning'
                                : 'panel-pill-neutral'
                            }`}
                          >

                            {r.tipo_pregunta ===
                            'rating'
                              ? '⭐ Rating'
                              : '✏️ Texto'}

                          </span>

                        </td>

                        <td>

                          {r.tipo_pregunta ===
                          'rating' ? (

                            <span className="panel-pill panel-pill-warning">

                              ⭐{' '}
                              {
                                r.valor_rating
                              }
                              /5

                            </span>

                          ) : (

                            r.respuesta_texto ||
                            '—'

                          )}

                        </td>

                        <td>

                          #
                          {
                            r.visitante_id
                          }

                        </td>

                        <td>

                          <div className="panel-location">

                            <CalendarDays
                              size={15}
                            />

                            <span>

                              {new Date(
                                r.respondido_en
                              ).toLocaleString(
                                'es-BO'
                              )}

                            </span>

                          </div>

                        </td>

                      </tr>

                    ))}

                </tbody>

              </table>

            </div>

          </div>
        </>
      )}

      {editando && (

        <FeedbackModal
          inicial={editando}
          onCerrar={() =>
            setEditando(null)
          }
          onGuardar={guardar}
        />

      )}

    </div>
  )
}

function FeedbackModal({
  inicial,
  onCerrar,
  onGuardar,
}) {

  const [form, setForm] =
    useState({
      pregunta:
        inicial.pregunta || '',

      tipo_pregunta:
        inicial.tipo_pregunta ||
        'rating',

      categoria:
        inicial.categoria || '',

      activa:
        inicial.activa ?? true,
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

      await onGuardar(form)

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
              value={
                form.pregunta
              }
              onChange={(e) =>
                setForm({
                  ...form,
                  pregunta:
                    e.target.value,
                })
              }
            />

          </div>

          <div className="panel-form-group">

            <label>
              Tipo
            </label>

            <select
              className="panel-input"
              value={
                form.tipo_pregunta
              }
              onChange={(e) =>
                setForm({
                  ...form,
                  tipo_pregunta:
                    e.target.value,
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

          </div>

          <div className="panel-form-group">

            <label>
              Categoría
            </label>

            <select
              className="panel-input"
              value={
                form.categoria
              }
              onChange={(e) =>
                setForm({
                  ...form,
                  categoria:
                    e.target.value,
                })
              }
            >

              <option value="">
                Seleccionar categoría
              </option>

              {CATEGORIAS.map(
                (cat) => (

                  <option
                    key={cat}
                    value={cat}
                  >

                    {cat}

                  </option>

                )
              )}

            </select>

          </div>

          {inicial.id && (

            <label
              style={{
                display: 'flex',
                gap: 10,
                alignItems:
                  'center',
              }}
            >

              <input
                type="checkbox"
                checked={
                  form.activa
                }
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
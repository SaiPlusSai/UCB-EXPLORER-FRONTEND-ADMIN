import { useEffect, useState } from 'react'
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
        gap: 6,
      }}
    >

      {filtrado.map((d) => (

        <div
          key={d.label}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >

          <span
            style={{
              width: 20,
              textAlign: 'right',
              fontSize: 12,
              fontWeight: 600,
              color: '#004077',
            }}
          >
            {d.label}
          </span>

          <div
            style={{
              flex: 1,
              background: '#f0f4f8',
              borderRadius: 6,
              height: 20,
              overflow: 'hidden',
            }}
          >

            <div
              style={{
                width: `${(d.valor / max) * 100}%`,
                height: '100%',
                background:
                  'linear-gradient(90deg, #004077, #1d6fb1)',
                borderRadius: 6,
                transition: 'width 0.5s ease',
              }}
            />

          </div>

          <span
            style={{
              fontSize: 12,
              width: 30,
              color: '#6b7280',
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

      const [pregRes, respRes] =
        await Promise.all([
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

  const toggleActiva = async (item) => {

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

  const guardar = async (datos) => {

    try {

      if (editando?.id) {

        await feedbackApi.actualizar(
          editando.id,
          datos
        )

      } else {

        await feedbackApi.crear(datos)
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

    const rs = respuestas.filter(
      (r) =>
        r.pregunta_id === preguntaId &&
        r.valor_rating != null
    )

    if (rs.length === 0) return null

    const prom =
      rs.reduce(
        (s, r) =>
          s + Number(r.valor_rating),
        0
      ) / rs.length

    return prom.toFixed(1)
  }

  const distribucionRating = (
    preguntaId
  ) => {

    const rs = respuestas.filter(
      (r) =>
        r.pregunta_id === preguntaId &&
        r.valor_rating != null
    )

    return [1, 2, 3, 4, 5].map((n) => ({
      label: `${n}★`,
      valor: rs.filter(
        (r) =>
          Number(r.valor_rating) === n
      ).length,
    }))
  }

  const totalRespuestasPorPregunta =
    (id) =>
      respuestas.filter(
        (r) => r.pregunta_id === id
      ).length

  const resumenCategorias =
    CATEGORIAS.map((cat) => ({
      categoria: cat,
      total: items.filter(
        (i) => i.categoria === cat
      ).length,
    })).filter((c) => c.total > 0)

  return (
    <>

      <div className="admin-topbar">

        <h2>Feedback</h2>

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
              marginBottom: 18,
            }}
          >

            {resumenCategorias.map((c) => (

              <span
                key={c.categoria}
                className="admin-chip admin-chip--off"
              >
                {c.categoria}: {c.total}
              </span>

            ))}

          </div>

          <table className="admin-table">

            <thead>

              <tr>
                <th>Pregunta</th>
                <th>Tipo</th>
                <th>Categoría</th>
                <th>Respuestas</th>
                <th>Promedio</th>
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

                    <span
                      className={`admin-chip ${
                        p.tipo_pregunta === 'rating'
                          ? 'admin-chip--gold'
                          : 'admin-chip--off'
                      }`}
                    >
                      {p.tipo_pregunta === 'rating'
                        ? '⭐ Rating'
                        : '✏️ Texto'}
                    </span>

                  </td>

                  <td>

                    <span className="admin-chip admin-chip--off">
                      {p.categoria || 'General'}
                    </span>

                  </td>

                  <td>
                    {totalRespuestasPorPregunta(p.id)}
                  </td>

                  <td>

                    {p.tipo_pregunta === 'rating'
                      ? (
                        ratingPorPregunta(p.id)
                          ? `⭐ ${ratingPorPregunta(p.id)}/5`
                          : '—'
                      )
                      : '—'}

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
                      className="admin-btn admin-btn--ghost admin-btn--sm"
                      onClick={() => toggleActiva(p)}
                    >
                      {p.activa
                        ? 'Desactivar'
                        : 'Activar'}
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

                  <td
                    colSpan="7"
                    style={{
                      textAlign: 'center',
                      color: '#6b7280',
                    }}
                  >
                    Sin preguntas registradas
                  </td>

                </tr>
              )}

            </tbody>

          </table>

          {items.filter(
            (p) =>
              p.tipo_pregunta === 'rating'
          ).length > 0 && (

            <>

              <h3
                style={{
                  marginTop: 28,
                  marginBottom: 14,
                  color: '#002d54',
                }}
              >
                Análisis de ratings
              </h3>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns:
                    'repeat(auto-fit, minmax(280px, 1fr))',
                  gap: 16,
                  marginBottom: 24,
                }}
              >

                {items
                  .filter(
                    (p) =>
                      p.tipo_pregunta === 'rating'
                  )
                  .map((p) => (

                    <div
                      key={p.id}
                      className="admin-card"
                    >

                      <div
                        style={{
                          fontWeight: 600,
                          fontSize: 14,
                          marginBottom: 4,
                          color: '#002d54',
                        }}
                      >
                        {p.pregunta}
                      </div>

                      {ratingPorPregunta(p.id)
                        ? (
                          <>

                            <div
                              style={{
                                fontSize: 28,
                                fontWeight: 700,
                                color: '#004077',
                                marginBottom: 10,
                              }}
                            >
                              ⭐ {ratingPorPregunta(p.id)}

                              <span
                                style={{
                                  fontSize: 14,
                                  fontWeight: 400,
                                  color: '#6b7280',
                                }}
                              >
                                /5
                              </span>

                            </div>

                            <BarChart
                              data={
                                distribucionRating(p.id)
                              }
                            />

                          </>
                        )
                        : (
                          <div
                            style={{
                              color: '#6b7280',
                              fontSize: 13,
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
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 10,
            }}
          >

            <h3
              style={{
                margin: 0,
                color: '#002d54',
              }}
            >
              Respuestas recientes
            </h3>

            <span className="admin-chip admin-chip--gold">
              {respuestas.length} total
            </span>

          </div>

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

              {respuestas
                .slice(0, 100)
                .map((r) => (

                  <tr key={r.id}>

                    <td
                      style={{
                        maxWidth: 200,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {r.pregunta}
                    </td>

                    <td>

                      <span
                        className={`admin-chip ${
                          r.tipo_pregunta === 'rating'
                            ? 'admin-chip--gold'
                            : 'admin-chip--off'
                        }`}
                      >
                        {r.tipo_pregunta === 'rating'
                          ? '⭐ Rating'
                          : '✏️ Texto'}
                      </span>

                    </td>

                    <td>

                      {r.tipo_pregunta === 'rating'
                        ? (
                          <span className="admin-chip admin-chip--gold">
                            ⭐ {r.valor_rating}/5
                          </span>
                        )
                        : (
                          <span
                            style={{
                              fontSize: 13,
                              color: '#374151',
                            }}
                          >
                            {r.respuesta_texto || '—'}
                          </span>
                        )}

                    </td>

                    <td>
                      #{r.visitante_id}
                    </td>

                    <td
                      style={{
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {new Date(
                        r.respondido_en
                      ).toLocaleString('es-BO')}
                    </td>

                  </tr>
                ))}

              {respuestas.length === 0 && (

                <tr>

                  <td
                    colSpan="5"
                    style={{
                      textAlign: 'center',
                      color: '#6b7280',
                    }}
                  >
                    Sin respuestas aún
                  </td>

                </tr>
              )}

            </tbody>

          </table>

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

    </>
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
      className="admin-modal-overlay"
      onClick={onCerrar}
    >

      <form
        className="admin-modal"
        onClick={(e) =>
          e.stopPropagation()
        }
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
              pregunta:
                e.target.value,
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

        <label className="admin-label">
          Categoría
        </label>

        <select
          className="admin-select"
          value={form.categoria}
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

          {CATEGORIAS.map((cat) => (
            <option
              key={cat}
              value={cat}
            >
              {cat}
            </option>
          ))}

        </select>

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
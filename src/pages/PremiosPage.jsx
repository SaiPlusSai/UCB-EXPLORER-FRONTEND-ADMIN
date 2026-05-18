import { useEffect, useState } from 'react'

import {
  Plus,
  Pencil,
  Trash2,
  Power,
  Gift,
  Trophy,
  Package,
  History,
  Image as ImageIcon,
  X,
} from 'lucide-react'

import { rewardsApi } from '../api/endpoints'

export default function PremiosPage() {

  const [items, setItems] = useState([])

  const [canjes, setCanjes] = useState([])

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
        premiosRes,
        canjesRes,
      ] = await Promise.all([
        rewardsApi.listarAdmin(),
        rewardsApi.canjes(),
      ])

      setItems(premiosRes.data.data)

      setCanjes(canjesRes.data.data)

    } catch (e) {

      setError(
        e.response?.data?.error ||
        'Error cargando premios'
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
        '¿Eliminar premio?'
      )
    ) return

    try {

      await rewardsApi.eliminar(id)

      cargar()

    } catch (e) {

      setError(
        e.response?.data?.error ||
        'No se pudo eliminar'
      )

    }
  }

  const toggleActivo = async (p) => {

    try {

      await rewardsApi.actualizar(
        p.id,
        {
          activo: !p.activo,
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

        await rewardsApi.actualizar(
          editando.id,
          datos
        )

      } else {

        await rewardsApi.crear(datos)

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

  const canjesPorPremio =
    canjes.reduce((acc, c) => {

      acc[c.premio_id] =
        (acc[c.premio_id] || 0) + 1

      return acc

    }, {})

  return (

    <div className="panel-page">

      <div className="panel-topbar">

        <div>

          <p className="panel-subtitle">
            Panel Administrativo
          </p>

          <h1 className="panel-title">
            Premios
          </h1>

        </div>

        <button
          className="panel-create-btn"
          onClick={() =>
            setEditando({})
          }
        >

          <Plus size={18} />

          Nuevo Premio

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
          <div className="panel-table-card">

            <div className="panel-table-header">

              <div className="panel-count">

                {items.length} premios

              </div>

            </div>

            <div className="panel-table-wrapper">

              <table className="panel-table">

                <thead>

                  <tr>

                    <th>Premio</th>

                    <th>Costo</th>

                    <th>Stock</th>

                    <th>Canjes</th>

                    <th>Estado</th>

                    <th>Acciones</th>

                  </tr>

                </thead>

                <tbody>

                  {items.map((p) => (

                    <tr key={p.id}>

                      <td>

                        <div className="panel-entity">

                          <Gift size={18} />

                          <div>

                            <strong>
                              {p.nombre}
                            </strong>

                            {p.descripcion && (

                              <p>
                                {p.descripcion}
                              </p>

                            )}

                          </div>

                        </div>

                      </td>

                      <td>

                        <span className="panel-pill panel-pill-warning">

                          <Trophy
                            size={14}
                            style={{
                              marginRight: 6,
                            }}
                          />

                          {p.costo_puntos} pts

                        </span>

                      </td>

                      <td>

                        <span
                          className={`panel-pill ${
                            p.stock === 0
                              ? 'panel-pill-danger'
                              : 'panel-pill-neutral'
                          }`}
                        >

                          <Package
                            size={14}
                            style={{
                              marginRight: 6,
                            }}
                          />

                          {p.stock}

                        </span>

                      </td>

                      <td>

                        {canjesPorPremio[
                          p.id
                        ] || 0}

                      </td>

                      <td>

                        <span
                          className={`panel-pill ${
                            p.activo
                              ? 'panel-pill-success'
                              : 'panel-pill-neutral'
                          }`}
                        >

                          {p.activo
                            ? 'Activo'
                            : 'Inactivo'}

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
                            data-tooltip="Activar/Desactivar Premio"
                            onClick={() =>
                              toggleActivo(p)
                            }
                          >

                            <Power size={16} />

                          </button>

                          <button
                            className="panel-icon-btn delete"
                            data-tooltip="Eliminar Premio"
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
                        colSpan="6"
                        style={{
                          textAlign:
                            'center',
                          padding: 40,
                          opacity: 0.7,
                        }}
                      >

                        Sin premios registrados

                      </td>

                    </tr>

                  )}

                </tbody>

              </table>

            </div>

          </div>

          <div
            style={{
              display: 'flex',
              justifyContent:
                'space-between',
              alignItems: 'center',
              marginTop: 30,
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

                Historial de Canjes

              </h2>

            </div>

            <span className="panel-pill panel-pill-warning">

              <History
                size={14}
                style={{
                  marginRight: 6,
                }}
              />

              {canjes.length} total

            </span>

          </div>

          <div className="panel-table-card">

            <div className="panel-table-wrapper">

              <table className="panel-table">

                <thead>

                  <tr>

                    <th>Fecha</th>

                    <th>Premio</th>

                    <th>Costo</th>

                    <th>Visitante</th>

                  </tr>

                </thead>

                <tbody>

                  {canjes
                    .slice(0, 100)
                    .map((c) => (

                      <tr key={c.id}>

                        <td>

                          {new Date(
                            c.canjeado_en
                          ).toLocaleString(
                            'es-BO'
                          )}

                        </td>

                        <td>

                          {c.premio_nombre}

                        </td>

                        <td>

                          <span className="panel-pill panel-pill-warning">

                            {c.costo_puntos} pts

                          </span>

                        </td>

                        <td>

                          #{c.visitante_id}

                        </td>

                      </tr>

                    ))}

                  {canjes.length === 0 && (

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

                        Sin canjes aún

                      </td>

                    </tr>

                  )}

                </tbody>

              </table>

            </div>

          </div>
        </>
      )}

      {editando && (

        <PremioModal
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

function PremioModal({
  inicial,
  onCerrar,
  onGuardar,
}) {

  const [form, setForm] = useState({
    nombre: inicial.nombre || '',
    descripcion:
      inicial.descripcion || '',
    imagen_url:
      inicial.imagen_url || '',
    costo_puntos:
      inicial.costo_puntos ?? 100,
    stock: inicial.stock ?? 1,
    activo:
      inicial.activo ?? true,
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
                ? 'Editar Premio'
                : 'Nuevo Premio'}
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
              rows={3}
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

          <div className="panel-form-group">

            <label>
              Imagen
            </label>

            <input
              className="panel-input"
              type="file"
              accept="image/*"
              onChange={async (e) => {

                const file =
                  e.target.files?.[0]

                if (!file) return

                try {

                  setError('')

                  const res =
                    await rewardsApi.uploadImagen(
                      file
                    )

                  setForm({
                    ...form,
                    imagen_url:
                      res.data.url,
                  })

                } catch (error) {

                  setError(
                    error.response?.data
                      ?.error ||
                      'Error subiendo imagen'
                  )

                }
              }}
            />

            {form.imagen_url && (

              <div
                style={{
                  marginTop: 14,
                }}
              >

                <img
                  src={form.imagen_url}
                  alt="preview"
                  style={{
                    width: '100%',
                    maxHeight: 220,
                    objectFit: 'cover',
                    borderRadius: 18,
                    border:
                      '1px solid #e2e8f0',
                  }}
                />

              </div>

            )}

          </div>

          <div className="panel-form-row">

            <div className="panel-form-group">

              <label>
                Costo
              </label>

              <input
                className="panel-input"
                type="number"
                min="0"
                required
                value={form.costo_puntos}
                onChange={(e) =>
                  setForm({
                    ...form,
                    costo_puntos:
                      Number(
                        e.target.value
                      ),
                  })
                }
              />

            </div>

            <div className="panel-form-group">

              <label>
                Stock
              </label>

              <input
                className="panel-input"
                type="number"
                min="0"
                value={form.stock}
                onChange={(e) =>
                  setForm({
                    ...form,
                    stock: Number(
                      e.target.value
                    ),
                  })
                }
              />

            </div>

          </div>

          {inicial.id && (

            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
              }}
            >

              <input
                type="checkbox"
                checked={form.activo}
                onChange={(e) =>
                  setForm({
                    ...form,
                    activo:
                      e.target.checked,
                  })
                }
              />

              Activo

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
import { useEffect, useState } from 'react'

import {
  Plus,
  Shield,
  ShieldCheck,
  UserCog,
  KeyRound,
  Trash2,
  Power,
  CalendarDays,
  X,
} from 'lucide-react'

import { authApi } from '../api/endpoints'

import { useAuth } from '../context/AuthContext.jsx'

function getUserId(correo) {

  if (!correo) return '—'

  const prefix =
    correo
      .split('@')[0]
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '')

  return `ADM-${prefix.slice(0, 8)}`
}

export default function AdminsPage() {

  const { admin: actual } = useAuth()

  const [items, setItems] =
    useState([])

  const [cargando, setCargando] =
    useState(true)

  const [creando, setCreando] =
    useState(false)

  const [error, setError] =
    useState('')

  const cargar = async () => {

    try {

      const { data } =
        await authApi.listar()

      setItems(data.data)

    } catch (e) {

      setError(
        e.response?.data?.error ||
        'Error cargando administradores'
      )

    } finally {

      setCargando(false)

    }
  }

  useEffect(() => {
    cargar()
  }, [])

  const toggleActivo = async (a) => {

    try {

      await authApi.actualizar(
        a.id,
        {
          activo: !a.activo,
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

  const eliminar = async (id) => {

    if (
      !window.confirm(
        '¿Eliminar administrador?'
      )
    ) return

    try {

      await authApi.eliminar(id)

      cargar()

    } catch (e) {

      setError(
        e.response?.data?.error ||
        'No se pudo eliminar'
      )

    }
  }

  const cambiarPassword =
    async (id) => {

      const nueva =
        window.prompt(
          'Nueva contraseña (mínimo 4 caracteres):'
        )

      if (!nueva) return

      try {

        await authApi.cambiarPassword(
          id,
          nueva
        )

        window.alert(
          'Contraseña actualizada exitosamente.'
        )

      } catch (e) {

        setError(
          e.response?.data?.error ||
          'Error al cambiar contraseña'
        )

      }
    }

  return (

    <div className="panel-page">

      <div className="panel-topbar">

        <div>

          <p className="panel-subtitle">
            Seguridad y Acceso
          </p>

          <h1 className="panel-title">
            Administradores
          </h1>

        </div>

        <button
          className="panel-create-btn"
          onClick={() =>
            setCreando(true)
          }
        >

          <Plus size={18} />

          Nuevo Administrador

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

              {items.length} administradores

            </div>

          </div>

          <div className="panel-table-wrapper">

            <table className="panel-table">

              <thead>

                <tr>

                  <th>User ID</th>

                  <th>Correo</th>

                  <th>Rol</th>

                  <th>Estado</th>

                  <th>Creado</th>

                  <th>Acciones</th>

                </tr>

              </thead>

              <tbody>

                {items.map((a) => (

                  <tr key={a.id}>

                    <td>

                      <div
                        style={{
                          display: 'flex',
                          alignItems:
                            'center',
                          gap: 10,
                        }}
                      >

                        <span
                          className="panel-pill panel-pill-neutral"
                          style={{
                            fontFamily:
                              'monospace',
                          }}
                        >

                          {getUserId(
                            a.correo
                          )}

                        </span>

                        {actual?.id ===
                          a.id && (

                          <span className="panel-pill panel-pill-warning">

                            Tú

                          </span>

                        )}

                      </div>

                    </td>

                    <td>

                      {a.correo}

                    </td>

                    <td>

                      <span
                        className={`panel-pill ${
                          a.rol ===
                          'SUPER_ADMIN'
                            ? 'panel-pill-warning'
                            : 'panel-pill-success'
                        }`}
                      >

                        {a.rol ===
                        'SUPER_ADMIN' ? (

                          <>
                            <ShieldCheck
                              size={14}
                              style={{
                                marginRight: 6,
                              }}
                            />

                            SUPER ADMIN
                          </>

                        ) : (

                          <>
                            <Shield
                              size={14}
                              style={{
                                marginRight: 6,
                              }}
                            />

                            ADMIN
                          </>

                        )}

                      </span>

                    </td>

                    <td>

                      <span
                        className={`panel-pill ${
                          a.activo
                            ? 'panel-pill-success'
                            : 'panel-pill-neutral'
                        }`}
                      >

                        {a.activo
                          ? 'Activo'
                          : 'Inactivo'}

                      </span>

                    </td>

                    <td>

                      <div className="panel-location">

                        <CalendarDays
                          size={15}
                        />

                        <span>

                          {a.creado_en
                            ? new Date(
                                a.creado_en
                              ).toLocaleDateString(
                                'es-BO'
                              )
                            : '—'}

                        </span>

                      </div>

                    </td>

                    <td>

                      <div className="panel-actions">

                        <button
                          className="panel-icon-btn warning"
                          data-tooltip="Cambiar contraseña"
                          onClick={() =>
                            cambiarPassword(
                              a.id
                            )
                          }
                        >

                          <KeyRound size={16} />

                        </button>

                        <button
                          className="panel-icon-btn edit"
                          data-tooltip="Activar/Desactivar Usuario"
                          onClick={() =>
                            toggleActivo(a)
                          }
                        >

                          <Power size={16} />

                        </button>

                        {actual?.id !==
                          a.id && (

                          <button
                            className="panel-icon-btn delete"
                            onClick={() =>
                              eliminar(a.id)
                            }
                          >

                            <Trash2 size={16} />

                          </button>

                        )}

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

                      Sin administradores registrados

                    </td>

                  </tr>

                )}

              </tbody>

            </table>

          </div>

        </div>

      )}

      {creando && (

        <AdminModal
          onCerrar={() =>
            setCreando(false)
          }
          onGuardar={async (
            datos
          ) => {

            try {

              await authApi.crear(
                datos
              )

              setCreando(false)

              cargar()

            } catch (e) {

              throw new Error(
                e.response?.data
                  ?.error ||
                  'No se pudo crear'
              )

            }
          }}
        />

      )}

    </div>
  )
}

function AdminModal({
  onCerrar,
  onGuardar,
}) {

  const [form, setForm] =
    useState({
      correo: '',
      password: '',
      rol: 'ADMIN',
    })

  const [enviando, setEnviando] =
    useState(false)

  const [error, setError] =
    useState('')

  const previewId =
    getUserId(form.correo)

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
              Seguridad
            </p>

            <h3>
              Nuevo Administrador
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
              Correo institucional
            </label>

            <input
              className="panel-input"
              required
              type="email"
              placeholder="usuario@ucb.edu.bo"
              value={form.correo}
              onChange={(e) =>
                setForm({
                  ...form,
                  correo:
                    e.target.value,
                })
              }
            />

            {form.correo && (

              <div
                style={{
                  fontSize: 13,
                  color: '#64748b',
                  marginTop: 4,
                }}
              >

                User ID generado:{' '}

                <strong
                  style={{
                    fontFamily:
                      'monospace',
                    color:
                      'var(--ucb-azul-oscuro)',
                  }}
                >

                  {previewId}

                </strong>

              </div>

            )}

          </div>

          <div className="panel-form-group">

            <label>
              Contraseña temporal
            </label>

            <input
              className="panel-input"
              required
              type="password"
              minLength={4}
              value={form.password}
              onChange={(e) =>
                setForm({
                  ...form,
                  password:
                    e.target.value,
                })
              }
            />

          </div>

          <div className="panel-form-group">

            <label>
              Rol
            </label>

            <select
              className="panel-input"
              value={form.rol}
              onChange={(e) =>
                setForm({
                  ...form,
                  rol:
                    e.target.value,
                })
              }
            >

              <option value="ADMIN">

                ADMIN — Acceso estándar

              </option>

              <option value="SUPER_ADMIN">

                SUPER_ADMIN — Acceso completo

              </option>

            </select>

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

            <UserCog
              size={17}
              style={{
                marginRight: 8,
              }}
            />

            {enviando
              ? 'Creando...'
              : 'Crear Administrador'}

          </button>

        </div>

      </form>

    </div>
  )
}
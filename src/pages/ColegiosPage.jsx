import { useEffect, useMemo, useState } from 'react'

import {
  Plus,
  Pencil,
  Trash2,
  Search,
  X,
  Building2,
  MapPin,
} from 'lucide-react'

import { colegiosApi } from '../api/endpoints'

const ciudadesBolivia = [
  'La Paz',
  'El Alto',
  'Cochabamba',
  'Santa Cruz',
  'Sucre',
  'Oruro',
  'Potosí',
  'Tarija',
  'Trinidad',
  'Cobija',
]

const departamentosBolivia = [
  'La Paz',
  'Cochabamba',
  'Santa Cruz',
  'Chuquisaca',
  'Oruro',
  'Potosí',
  'Tarija',
  'Beni',
  'Pando',
]

const initialForm = {
  nombre: '',
  direccion: '',
  ciudad: '',
  departamento: '',
  pais: 'Bolivia',
}

export default function ColegiosPage() {

  const [items, setItems] = useState([])

  const [cargando, setCargando] = useState(true)

  const [form, setForm] = useState(initialForm)

  const [busqueda, setBusqueda] = useState('')

  const [modalOpen, setModalOpen] = useState(false)

  const [modoEdicion, setModoEdicion] = useState(false)

  const [colegioEditando, setColegioEditando] = useState(null)

  const [error, setError] = useState('')

  const [success, setSuccess] = useState('')

  const cargar = async () => {
    try {

      const { data } = await colegiosApi.listar()

      setItems(data.data)

    } catch (e) {

      setError(
        e.response?.data?.error ||
        'Error al cargar colegios'
      )

    } finally {

      setCargando(false)

    }
  }

  useEffect(() => {
    cargar()
  }, [])

  const handleChange = (e) => {

    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))

  }

  const abrirCrear = () => {

    setModoEdicion(false)

    setColegioEditando(null)

    setForm(initialForm)

    setModalOpen(true)

  }

  const abrirEditar = (colegio) => {

    setModoEdicion(true)

    setColegioEditando(colegio)

    setForm({
      nombre: colegio.nombre || '',
      direccion: colegio.direccion || '',
      ciudad: colegio.ciudad || '',
      departamento: colegio.departamento || '',
      pais: colegio.pais || 'Bolivia',
    })

    setModalOpen(true)

  }

  const guardar = async (e) => {

    e.preventDefault()

    setError('')

    setSuccess('')

    if (
      !form.nombre.trim() ||
      !form.ciudad.trim() ||
      !form.departamento.trim()
    ) {

      setError(
        'Nombre, ciudad y departamento son obligatorios'
      )

      return
    }

    try {

      if (modoEdicion) {

        await colegiosApi.actualizar(
          colegioEditando.id,
          form
        )

        setSuccess(
          'Colegio actualizado correctamente'
        )

      } else {

        await colegiosApi.crear(form)

        setSuccess(
          'Colegio creado correctamente'
        )

      }

      setModalOpen(false)

      setForm(initialForm)

      cargar()

    } catch (e) {

      setError(
        e.response?.data?.error ||
        'No se pudo guardar'
      )

    }
  }

  const eliminar = async (id) => {

    if (!window.confirm('¿Eliminar colegio?')) return

    try {

      await colegiosApi.eliminar(id)

      cargar()

    } catch (e) {

      setError(
        e.response?.data?.error ||
        'No se pudo eliminar'
      )

    }
  }

  const filtrados = useMemo(() => {

    return items.filter((c) =>
      [
        c.nombre,
        c.ciudad,
        c.departamento,
        c.pais,
      ]
        .join(' ')
        .toLowerCase()
        .includes(busqueda.toLowerCase())
    )

  }, [items, busqueda])

  return (

    <div className="panel-page">

      <div className="panel-topbar">

        <div>

          <p className="panel-subtitle">
            Panel Administrativo
          </p>

          <h1 className="panel-title">
            Colegios
          </h1>

        </div>

        <button
          className="panel-create-btn"
          onClick={abrirCrear}
        >

          <Plus size={18} />

          Nuevo Colegio

        </button>

      </div>

      {error && (
        <div className="admin-error">
          {error}
        </div>
      )}

      {success && (
        <div className="admin-success">
          {success}
        </div>
      )}

      <div className="panel-table-card">

        <div className="panel-table-header">

          <div className="panel-search-box">

            <Search size={18} />

            <input
              type="text"
              placeholder="Buscar colegio..."
              value={busqueda}
              onChange={(e) =>
                setBusqueda(e.target.value)
              }
            />

          </div>

          <div className="panel-count">

            {filtrados.length} colegios

          </div>

        </div>

        {cargando ? (

          <div className="admin-loader" />

        ) : (

          <div className="panel-table-wrapper">

            <table className="panel-table">

              <thead>

                <tr>
                  <th>Colegio</th>
                  <th>Ubicación</th>
                  <th>País</th>
                  <th>Acciones</th>
                </tr>

              </thead>

              <tbody>

                {filtrados.map((c) => (

                  <tr key={c.id}>

                    <td>

                      <div className="panel-entity">

                        <Building2 size={17} />

                        <div>

                          <strong>
                            {c.nombre}
                          </strong>

                          {c.direccion && (
                            <p>
                              {c.direccion}
                            </p>
                          )}

                        </div>

                      </div>

                    </td>

                    <td>

                      <div className="panel-location">

                        <MapPin size={16} />

                        <span>
                          {c.ciudad}, {c.departamento}
                        </span>

                      </div>

                    </td>

                    <td>

                      <span className="panel-pill panel-pill-warning">
                        {c.pais}
                      </span>

                    </td>

                    <td>

                      <div className="panel-actions">

                        <button
                          className="panel-icon-btn edit"
                          data-tooltip="Editar"
                          onClick={() => abrirEditar(c)}
                        >
                          <Pencil size={16} />
                        </button>

                        <button
                          className="panel-icon-btn delete"
                          data-tooltip="Eliminar Colegio"
                          onClick={() => eliminar(c.id)}
                        >
                          <Trash2 size={16} />
                        </button>

                      </div>

                    </td>

                  </tr>

                ))}

                {filtrados.length === 0 && (

                  <tr>

                    <td
                      colSpan="4"
                      style={{
                        textAlign: 'center',
                        padding: 40,
                        opacity: 0.7,
                      }}
                    >

                      No hay colegios registrados

                    </td>

                  </tr>

                )}

              </tbody>

            </table>

          </div>
        )}

      </div>

      {modalOpen && (

        <div
          className="panel-modal-overlay"
          onClick={() => setModalOpen(false)}
        >

          <div
            className="panel-modal"
            onClick={(e) => e.stopPropagation()}
          >

            <div className="panel-modal-header">

              <div>

                <p>
                  Administración
                </p>

                <h3>
                  {modoEdicion
                    ? 'Editar Colegio'
                    : 'Nuevo Colegio'}
                </h3>

              </div>

              <button
                className="panel-close-btn"
                onClick={() => setModalOpen(false)}
              >

                <X size={18} />

              </button>

            </div>

            <form
              onSubmit={guardar}
              className="panel-modal-form"
            >

              <div className="panel-form-group">

                <label>
                  Nombre del colegio
                </label>

                <input
                  className="panel-input"
                  placeholder="Unidad Educativa..."
                  name="nombre"
                  value={form.nombre}
                  onChange={handleChange}
                />

              </div>

              <div className="panel-form-group">

                <label>
                  Dirección
                </label>

                <input
                  className="panel-input"
                  placeholder="Av. ..."
                  name="direccion"
                  value={form.direccion}
                  onChange={handleChange}
                />

              </div>

              <div className="panel-form-row">

                <div className="panel-form-group">

                  <label>
                    Ciudad
                  </label>

                  <select
                    className="panel-input"
                    name="ciudad"
                    value={form.ciudad}
                    onChange={handleChange}
                  >

                    <option value="">
                      Seleccionar ciudad
                    </option>

                    {ciudadesBolivia.map((c) => (

                      <option
                        key={c}
                        value={c}
                      >
                        {c}
                      </option>

                    ))}

                  </select>

                </div>

                <div className="panel-form-group">

                  <label>
                    Departamento
                  </label>

                  <select
                    className="panel-input"
                    name="departamento"
                    value={form.departamento}
                    onChange={handleChange}
                  >

                    <option value="">
                      Seleccionar departamento
                    </option>

                    {departamentosBolivia.map((d) => (

                      <option
                        key={d}
                        value={d}
                      >
                        {d}
                      </option>

                    ))}

                  </select>

                </div>

              </div>

              <div className="panel-form-group">

                <label>
                  País
                </label>

                <input
                  className="panel-input"
                  placeholder="Bolivia"
                  name="pais"
                  value={form.pais}
                  onChange={handleChange}
                />

              </div>

              <button
                type="submit"
                className="panel-save-btn"
              >

                {modoEdicion
                  ? 'Guardar Cambios'
                  : 'Crear Colegio'}

              </button>

            </form>

          </div>

        </div>

      )}

    </div>
  )
}
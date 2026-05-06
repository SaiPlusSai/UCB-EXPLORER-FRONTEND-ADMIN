import { useState } from 'react'

const MOCK_PREMIOS = [
  {
    id: 1,
    nombre: 'Polera UCB',
    descripcion: 'Polera oficial del Open House.',
    imagen_url: '',
    costo_puntos: 500,
    stock: 20,
    activo: true,
  },
  {
    id: 2,
    nombre: 'Taza Institucional',
    descripcion: 'Taza edición especial.',
    imagen_url: '',
    costo_puntos: 300,
    stock: 15,
    activo: true,
  },
]

const MOCK_CANJES = [
  {
    id: 1,
    canjeado_en: '2026-05-10T10:30',
    premio_nombre: 'Polera UCB',
    visitante_id: 12,
  },
  {
    id: 2,
    canjeado_en: '2026-05-10T11:00',
    premio_nombre: 'Taza Institucional',
    visitante_id: 8,
  },
]

export default function PremiosPage() {

  const [items, setItems] = useState(MOCK_PREMIOS)

  const [canjes] = useState(MOCK_CANJES)

  const [editando, setEditando] = useState(null)

  const eliminar = (id) => {

    if (!window.confirm('¿Eliminar premio?')) return

    setItems(items.filter((item) => item.id !== id))
  }

  const toggleActivo = (premio) => {

    setItems(
      items.map((item) =>
        item.id === premio.id
          ? {
              ...item,
              activo: !item.activo,
            }
          : item
      )
    )
  }

  const guardar = (datos) => {

    if (editando?.id) {

      setItems(
        items.map((item) =>
          item.id === editando.id
            ? {
                ...item,
                ...datos,
              }
            : item
        )
      )

    } else {

      const nuevo = {
        id: Date.now(),
        ...datos,
      }

      setItems([...items, nuevo])
    }

    setEditando(null)
  }

  return (
    <>
      <div className="admin-topbar">

        <h2>
          Premios
        </h2>

        <button
          className="admin-btn admin-btn--accent"
          onClick={() => setEditando({})}
        >
          + Nuevo premio
        </button>

      </div>

      <table className="admin-table">

        <thead>

          <tr>
            <th>Nombre</th>
            <th>Costo</th>
            <th>Stock</th>
            <th>Estado</th>
            <th></th>
          </tr>

        </thead>

        <tbody>

          {items.map((p) => (

            <tr key={p.id}>

              <td>

                <div style={{ fontWeight: 600 }}>
                  {p.nombre}
                </div>

                {p.descripcion && (
                  <div
                    style={{
                      fontSize: 12,
                      color: '#64748b',
                    }}
                  >
                    {p.descripcion}
                  </div>
                )}

              </td>

              <td>

                <span className="admin-chip admin-chip--gold">
                  {p.costo_puntos} pts
                </span>

              </td>

              <td>
                {p.stock}
              </td>

              <td>

                <span
                  className={`admin-chip ${
                    p.activo
                      ? 'admin-chip--ok'
                      : 'admin-chip--off'
                  }`}
                >

                  {p.activo
                    ? 'Activo'
                    : 'Inactivo'}

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
                  onClick={() => toggleActivo(p)}
                >

                  {p.activo
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
              <td colSpan="5">
                Sin premios registrados
              </td>
            </tr>
          )}

        </tbody>

      </table>

      <h3 style={{ marginTop: 30 }}>
        Últimos canjes
      </h3>

      <table className="admin-table">

        <thead>

          <tr>
            <th>Fecha</th>
            <th>Premio</th>
            <th>Visitante</th>
          </tr>

        </thead>

        <tbody>

          {canjes.slice(0, 50).map((c) => (

            <tr key={c.id}>

              <td>
                {new Date(c.canjeado_en).toLocaleString()}
              </td>

              <td>
                {c.premio_nombre}
              </td>

              <td>
                #{c.visitante_id}
              </td>

            </tr>

          ))}

          {canjes.length === 0 && (
            <tr>
              <td colSpan="3">
                Sin canjes aún
              </td>
            </tr>
          )}

        </tbody>

      </table>

      {editando && (

        <PremioModal
          inicial={editando}
          onCerrar={() => setEditando(null)}
          onGuardar={guardar}
        />

      )}
    </>
  )
}

function PremioModal({
  inicial,
  onCerrar,
  onGuardar,
}) {

  const [form, setForm] = useState({
    nombre: inicial.nombre || '',
    descripcion: inicial.descripcion || '',
    imagen_url: inicial.imagen_url || '',
    costo_puntos: inicial.costo_puntos ?? 100,
    stock: inicial.stock ?? 1,
    activo: inicial.activo ?? true,
  })

  const [enviando, setEnviando] = useState(false)

  const submit = async (e) => {

    e.preventDefault()

    setEnviando(true)

    onGuardar(form)

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
            ? 'Editar premio'
            : 'Nuevo premio'}
        </h3>

        <label className="admin-label">
          Nombre
        </label>

        <input
          className="admin-input"
          required
          value={form.nombre}
          onChange={(e) =>
            setForm({
              ...form,
              nombre: e.target.value,
            })
          }
        />

        <label className="admin-label">
          Descripción
        </label>

        <textarea
          className="admin-textarea"
          rows={2}
          value={form.descripcion}
          onChange={(e) =>
            setForm({
              ...form,
              descripcion: e.target.value,
            })
          }
        />

        <label className="admin-label">
          URL de imagen
        </label>

        <input
          className="admin-input"
          type="url"
          value={form.imagen_url}
          onChange={(e) =>
            setForm({
              ...form,
              imagen_url: e.target.value,
            })
          }
        />

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 12,
          }}
        >

          <div>

            <label className="admin-label">
              Costo (puntos)
            </label>

            <input
              className="admin-input"
              type="number"
              min="0"
              required
              value={form.costo_puntos}
              onChange={(e) =>
                setForm({
                  ...form,
                  costo_puntos: Number(e.target.value),
                })
              }
            />

          </div>

          <div>

            <label className="admin-label">
              Stock
            </label>

            <input
              className="admin-input"
              type="number"
              min="0"
              value={form.stock}
              onChange={(e) =>
                setForm({
                  ...form,
                  stock: Number(e.target.value),
                })
              }
            />

          </div>

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
              checked={form.activo}
              onChange={(e) =>
                setForm({
                  ...form,
                  activo: e.target.checked,
                })
              }
            />

            Activo

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
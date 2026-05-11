import { useEffect, useState } from 'react'
import { rewardsApi } from '../api/endpoints'

export default function PremiosPage() {
  const [items, setItems] = useState([])
  const [canjes, setCanjes] = useState([])
  const [cargando, setCargando] = useState(true)
  const [editando, setEditando] = useState(null)
  const [error, setError] = useState('')

  const cargar = async () => {
    setCargando(true)
    try {
      const [premiosRes, canjesRes] = await Promise.all([
        rewardsApi.listarAdmin(),
        rewardsApi.canjes(),
      ])
      setItems(premiosRes.data.data)
      setCanjes(canjesRes.data.data)
    } catch (e) {
      setError(e.response?.data?.error || 'Error cargando premios')
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => { cargar() }, [])

  const eliminar = async (id) => {
    if (!window.confirm('¿Eliminar premio?')) return
    try {
      await rewardsApi.eliminar(id)
      cargar()
    } catch (e) {
      setError(e.response?.data?.error || 'No se pudo eliminar')
    }
  }

  const toggleActivo = async (p) => {
    try {
      await rewardsApi.actualizar(p.id, { activo: !p.activo })
      cargar()
    } catch (e) {
      setError(e.response?.data?.error || 'Error')
    }
  }

  const guardar = async (datos) => {
    try {
      if (editando?.id) {
        await rewardsApi.actualizar(editando.id, datos)
      } else {
        await rewardsApi.crear(datos)
      }
      setEditando(null)
      cargar()
    } catch (e) {
      throw new Error(e.response?.data?.error || 'No se pudo guardar')
    }
  }

  const canjesPorPremio = canjes.reduce((acc, c) => {
    acc[c.premio_id] = (acc[c.premio_id] || 0) + 1
    return acc
  }, {})

  return (
    <>
      <div className="admin-topbar">
        <h2>Premios</h2>
        <button className="admin-btn admin-btn--accent" onClick={() => setEditando({})}>
          + Nuevo premio
        </button>
      </div>

      {error && <div className="admin-error">{error}</div>}

      {cargando ? <div className="admin-loader" /> : (
        <>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Costo</th>
                <th>Stock</th>
                <th>Canjes</th>
                <th>Estado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((p) => (
                <tr key={p.id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{p.nombre}</div>
                    {p.descripcion && (
                      <div style={{ fontSize: 12, color: '#64748b' }}>{p.descripcion}</div>
                    )}
                  </td>
                  <td>
                    <span className="admin-chip admin-chip--gold">{p.costo_puntos} pts</span>
                  </td>
                  <td>
                    <span style={{ fontWeight: p.stock === 0 ? 700 : 400, color: p.stock === 0 ? '#d92d20' : 'inherit' }}>
                      {p.stock}
                    </span>
                  </td>
                  <td>{canjesPorPremio[p.id] || 0}</td>
                  <td>
                    <span className={`admin-chip ${p.activo ? 'admin-chip--ok' : 'admin-chip--off'}`}>
                      {p.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="admin-row">
                    <button className="admin-btn admin-btn--ghost admin-btn--sm" onClick={() => setEditando(p)}>
                      Editar
                    </button>
                    <button className="admin-btn admin-btn--ghost admin-btn--sm" onClick={() => toggleActivo(p)}>
                      {p.activo ? 'Desactivar' : 'Activar'}
                    </button>
                    <button className="admin-btn admin-btn--danger admin-btn--sm" onClick={() => eliminar(p.id)}>
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr><td colSpan="6" style={{ textAlign: 'center', color: '#6b7280' }}>Sin premios registrados</td></tr>
              )}
            </tbody>
          </table>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 28, marginBottom: 10 }}>
            <h3 style={{ margin: 0, color: '#002d54' }}>Historial de canjes</h3>
            <span className="admin-chip admin-chip--gold">{canjes.length} total</span>
          </div>

          <table className="admin-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Premio</th>
                <th>Costo</th>
                <th>Visitante</th>
              </tr>
            </thead>
            <tbody>
              {canjes.slice(0, 100).map((c) => (
                <tr key={c.id}>
                  <td>{new Date(c.canjeado_en).toLocaleString('es-BO')}</td>
                  <td>{c.premio_nombre}</td>
                  <td><span className="admin-chip admin-chip--gold">{c.costo_puntos} pts</span></td>
                  <td>#{c.visitante_id}</td>
                </tr>
              ))}
              {canjes.length === 0 && (
                <tr><td colSpan="4" style={{ textAlign: 'center', color: '#6b7280' }}>Sin canjes aún</td></tr>
              )}
            </tbody>
          </table>
        </>
      )}

      {editando && (
        <PremioModal inicial={editando} onCerrar={() => setEditando(null)} onGuardar={guardar} />
      )}
    </>
  )
}

function PremioModal({ inicial, onCerrar, onGuardar }) {
  const [form, setForm] = useState({
    nombre: inicial.nombre || '',
    descripcion: inicial.descripcion || '',
    imagen_url: inicial.imagen_url || '',
    costo_puntos: inicial.costo_puntos ?? 100,
    stock: inicial.stock ?? 1,
    activo: inicial.activo ?? true,
  })
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState('')

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
    <div className="admin-modal-overlay" onClick={onCerrar}>
      <form className="admin-modal" onClick={(e) => e.stopPropagation()} onSubmit={submit}>
        <h3>{inicial.id ? 'Editar premio' : 'Nuevo premio'}</h3>

        <label className="admin-label">Nombre</label>
        <input
          className="admin-input" required value={form.nombre}
          onChange={(e) => setForm({ ...form, nombre: e.target.value })}
        />

        <label className="admin-label">Descripción</label>
        <textarea
          className="admin-textarea" rows={2} value={form.descripcion}
          onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
        />

        <label className="admin-label">
  Imagen
</label>

<input
  className="admin-input"
  type="file"
  accept="image/*"
  onChange={async (e) => {

    const file = e.target.files?.[0]

    if (!file) return

    try {

      setError('')

      const res =
        await rewardsApi.uploadImagen(file)

      setForm({
        ...form,
        imagen_url: res.data.url,
      })

    } catch (error) {

      setError(
        error.response?.data?.error ||
        'Error subiendo imagen'
      )
    }
  }}
/>

{form.imagen_url && (
  <img
    src={form.imagen_url}
    alt="preview"
    style={{
      width: '100%',
      maxHeight: 180,
      objectFit: 'cover',
      borderRadius: 12,
      marginTop: 12,
    }}
  />
)}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label className="admin-label">Costo (puntos)</label>
            <input
              className="admin-input" type="number" min="0" required value={form.costo_puntos}
              onChange={(e) => setForm({ ...form, costo_puntos: Number(e.target.value) })}
            />
          </div>
          <div>
            <label className="admin-label">Stock</label>
            <input
              className="admin-input" type="number" min="0" value={form.stock}
              onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })}
            />
          </div>
        </div>

        {inicial.id && (
          <label style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <input type="checkbox" checked={form.activo} onChange={(e) => setForm({ ...form, activo: e.target.checked })} />
            Activo
          </label>
        )}

        {error && <div className="admin-error">{error}</div>}

        <div className="admin-row" style={{ justifyContent: 'flex-end', marginTop: 18 }}>
          <button type="button" className="admin-btn admin-btn--ghost" onClick={onCerrar}>Cancelar</button>
          <button className="admin-btn" disabled={enviando}>{enviando ? 'Guardando…' : 'Guardar'}</button>
        </div>
      </form>
    </div>
  )
}

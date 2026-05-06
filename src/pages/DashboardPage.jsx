import { useEffect, useState } from 'react'
import { analyticsApi } from '../api/endpoints'

const STAT = [
  { key: 'total_visitantes', label: 'Visitantes' },
  { key: 'total_tickets', label: 'Tickets' },
  { key: 'total_respuestas_trivia', label: 'Respuestas Trivia' },
  { key: 'trivia_correctas', label: 'Respuestas correctas' },
  { key: 'total_canjes', label: 'Canjes premios' },
  { key: 'total_escaneos', label: 'Escaneos QR' },
  { key: 'total_feedback', label: 'Feedback recibido' },
  { key: 'carreras_activas', label: 'Carreras activas' },
  { key: 'premios_activos', label: 'Premios activos' },
]

export default function DashboardPage() {
  const [resumen, setResumen] = useState(null)
  const [colegios, setColegios] = useState([])
  const [carreras, setCarreras] = useState([])
  const [top, setTop] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([
      analyticsApi.resumen(),
      analyticsApi.colegios(),
      analyticsApi.carreras(),
      analyticsApi.topVisitantes(),
    ])
      .then(([r, c, ca, t]) => {
        setResumen(r.data.data)
        setColegios(c.data.data)
        setCarreras(ca.data.data)
        setTop(t.data.data)
      })
      .catch((e) => setError(e.response?.data?.error || 'Error cargando analytics'))
  }, [])

  if (error) return <div className="admin-error">{error}</div>
  if (!resumen) return <div className="admin-loader" />

  return (
    <>
      <div className="admin-topbar">
        <h2>Dashboard</h2>
      </div>

      <div className="admin-grid admin-grid--3" style={{ marginBottom: 24 }}>
        {STAT.map((s) => (
          <div key={s.key} className="admin-stat">
            <div className="admin-stat__label">{s.label}</div>
            <div className="admin-stat__num">{resumen[s.key] ?? 0}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>
        <div className="admin-card">
          <h3 style={{ marginTop: 0 }}>Visitantes por colegio</h3>
          <table className="admin-table">
            <thead><tr><th>Colegio</th><th>Visitantes</th></tr></thead>
            <tbody>
              {colegios.map((c) => (
                <tr key={c.id}>
                  <td>{c.nombre}</td>
                  <td>{c.visitantes}</td>
                </tr>
              ))}
              {colegios.length === 0 && <tr><td colSpan="2">Sin datos</td></tr>}
            </tbody>
          </table>
        </div>

        <div className="admin-card">
          <h3 style={{ marginTop: 0 }}>Carreras más elegidas</h3>
          <table className="admin-table">
            <thead><tr><th>Carrera</th><th>Total</th><th>1ra opc.</th></tr></thead>
            <tbody>
              {carreras.map((c) => (
                <tr key={c.id}>
                  <td>{c.nombre}</td>
                  <td>{c.elecciones}</td>
                  <td>{c.prioridad_1}</td>
                </tr>
              ))}
              {carreras.length === 0 && <tr><td colSpan="3">Sin datos</td></tr>}
            </tbody>
          </table>
        </div>

        <div className="admin-card">
          <h3 style={{ marginTop: 0 }}>Top visitantes (puntos)</h3>
          <table className="admin-table">
            <thead><tr><th>Visitante</th><th>Colegio</th><th>Puntos</th></tr></thead>
            <tbody>
              {top.map((v) => (
                <tr key={v.id}>
                  <td>#{v.id}</td>
                  <td>{v.colegio || '—'}</td>
                  <td>{v.puntos_totales}</td>
                </tr>
              ))}
              {top.length === 0 && <tr><td colSpan="3">Sin datos</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}

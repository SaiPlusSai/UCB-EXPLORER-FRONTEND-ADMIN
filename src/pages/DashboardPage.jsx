import { useEffect, useState } from 'react'
import { analyticsApi } from '../api/endpoints'

function HorizBar({ label, valor, max, color = '#004077', suffix = '' }) {
  const pct = max > 0 ? (valor / max) * 100 : 0
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
        <span style={{ color: '#374151', fontWeight: 500 }}>{label}</span>
        <span style={{ fontWeight: 700, color }}>{valor}{suffix}</span>
      </div>
      <div style={{ background: '#e8edf4', borderRadius: 6, height: 12, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 6, transition: 'width 0.6s ease' }} />
      </div>
    </div>
  )
}

function KPI({ label, valor, sub, color }) {
  return (
    <div style={{
      background: `linear-gradient(135deg, ${color || '#004077'} 0%, #1d6fb1 100%)`,
      color: '#fff',
      padding: '18px 20px',
      borderRadius: 14,
      display: 'flex',
      flexDirection: 'column',
      boxShadow: '0 4px 14px rgba(0,0,0,0.1)',
    }}>
      <span style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.5px', opacity: 0.85 }}>{label}</span>
      <span style={{ fontSize: 34, fontWeight: 800, marginTop: 6, lineHeight: 1 }}>{valor}</span>
      {sub && <span style={{ fontSize: 12, opacity: 0.75, marginTop: 6 }}>{sub}</span>}
    </div>
  )
}

function DonutStat({ label, numerador, denominador, color = '#ffd700' }) {
  const pct = denominador > 0 ? Math.round((numerador / denominador) * 100) : 0
  const circ = 2 * Math.PI * 30
  const offset = circ - (pct / 100) * circ
  return (
    <div className="admin-card" style={{ textAlign: 'center', padding: '20px 16px' }}>
      <svg width="80" height="80" viewBox="0 0 80 80" style={{ margin: '0 auto 8px', display: 'block' }}>
        <circle cx="40" cy="40" r="30" fill="none" stroke="#e8edf4" strokeWidth="10" />
        <circle
          cx="40" cy="40" r="30" fill="none"
          stroke={color} strokeWidth="10"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 40 40)"
          style={{ transition: 'stroke-dashoffset 0.8s ease' }}
        />
        <text x="40" y="45" textAnchor="middle" fontSize="16" fontWeight="700" fill="#002d54">{pct}%</text>
      </svg>
      <div style={{ fontWeight: 600, fontSize: 13, color: '#002d54' }}>{label}</div>
      <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>{numerador} / {denominador}</div>
    </div>
  )
}

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

  const tasaTrivia = resumen.total_visitantes > 0
    ? Math.round((resumen.total_respuestas_trivia / resumen.total_visitantes) * 100)
    : 0

  const tasaFeedback = resumen.total_visitantes > 0
    ? Math.round((resumen.total_feedback / resumen.total_visitantes) * 100)
    : 0

  const tasaCanjes = resumen.total_visitantes > 0
    ? Math.round((resumen.total_canjes / resumen.total_visitantes) * 100)
    : 0

  const pctTriviaCorrecta = resumen.total_respuestas_trivia > 0
    ? Math.round((resumen.trivia_correctas / resumen.total_respuestas_trivia) * 100)
    : 0

  const maxColegios = Math.max(...colegios.map((c) => Number(c.visitantes)), 1)
  const maxCarreras = Math.max(...carreras.map((c) => Number(c.elecciones)), 1)

  return (
    <>
      <div className="admin-topbar">
        <h2>Dashboard</h2>
        <span style={{ fontSize: 13, color: '#6b7280' }}>
          UCB Explorer — Open House
        </span>
      </div>

      {/* KPIs principales */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 24 }}>
        <KPI label="Visitantes" valor={resumen.total_visitantes} sub="registrados" color="#002d54" />
        <KPI label="Tickets activos" valor={resumen.total_tickets} sub="emitidos" color="#004077" />
        <KPI label="Escaneos QR" valor={resumen.total_escaneos} sub="puntos de control" color="#1d6fb1" />
        <KPI label="Canjes premios" valor={resumen.total_canjes} sub={`${tasaCanjes}% de visitantes`} color="#d4af00" />
        <KPI label="Trivia respondida" valor={resumen.total_respuestas_trivia} sub={`${pctTriviaCorrecta}% correctas`} color="#004077" />
        <KPI label="Feedback recibido" valor={resumen.total_feedback} sub={`${tasaFeedback}% de visitantes`} color="#002d54" />
      </div>

      {/* Participación */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14, marginBottom: 24 }}>
        <DonutStat
          label="Participación trivia"
          numerador={resumen.total_respuestas_trivia}
          denominador={resumen.total_visitantes}
          color="#004077"
        />
        <DonutStat
          label="Correctas trivia"
          numerador={Number(resumen.trivia_correctas)}
          denominador={resumen.total_respuestas_trivia}
          color="#1d6fb1"
        />
        <DonutStat
          label="Feedback dado"
          numerador={resumen.total_feedback}
          denominador={resumen.total_visitantes}
          color="#002d54"
        />
        <DonutStat
          label="Premios canjeados"
          numerador={resumen.total_canjes}
          denominador={resumen.total_visitantes}
          color="#ffd700"
        />
      </div>

      {/* Gráficos horizontales */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 16, marginBottom: 24 }}>
        <div className="admin-card">
          <h3 style={{ marginTop: 0, marginBottom: 16, color: '#002d54', fontSize: 16 }}>
            Visitantes por colegio
          </h3>
          {colegios.length > 0
            ? colegios.slice(0, 10).map((c) => (
              <HorizBar
                key={c.id}
                label={c.nombre}
                valor={Number(c.visitantes)}
                max={maxColegios}
              />
            ))
            : <div style={{ color: '#6b7280', fontSize: 13 }}>Sin datos aún</div>
          }
        </div>

        <div className="admin-card">
          <h3 style={{ marginTop: 0, marginBottom: 16, color: '#002d54', fontSize: 16 }}>
            Carreras más elegidas
          </h3>
          {carreras.length > 0
            ? carreras.slice(0, 10).map((c) => (
              <div key={c.id} style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                  <span style={{ color: '#374151', fontWeight: 500 }}>{c.nombre}</span>
                  <span style={{ color: '#6b7280', fontSize: 12 }}>
                    <strong style={{ color: '#004077' }}>{c.elecciones}</strong> total · <strong>{c.prioridad_1}</strong> 1ra opc.
                  </span>
                </div>
                <div style={{ background: '#e8edf4', borderRadius: 6, height: 12, overflow: 'hidden', display: 'flex' }}>
                  <div style={{ width: `${(Number(c.prioridad_1) / maxCarreras) * 100}%`, height: '100%', background: '#ffd700', borderRadius: '6px 0 0 6px' }} />
                  <div style={{ width: `${((Number(c.elecciones) - Number(c.prioridad_1)) / maxCarreras) * 100}%`, height: '100%', background: '#004077' }} />
                </div>
                <div style={{ display: 'flex', gap: 12, fontSize: 11, marginTop: 3, color: '#6b7280' }}>
                  <span style={{ color: '#8a6d00' }}>■ 1ra opción</span>
                  <span style={{ color: '#004077' }}>■ Otras opciones</span>
                </div>
              </div>
            ))
            : <div style={{ color: '#6b7280', fontSize: 13 }}>Sin datos aún</div>
          }
        </div>
      </div>

      {/* Top visitantes + estado recursos */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 16 }}>
        <div className="admin-card">
          <h3 style={{ marginTop: 0, marginBottom: 14, color: '#002d54', fontSize: 16 }}>
            Top visitantes por puntos
          </h3>
          <table className="admin-table" style={{ boxShadow: 'none', borderRadius: 8 }}>
            <thead>
              <tr>
                <th>#</th>
                <th>ID</th>
                <th>Colegio</th>
                <th>Puntos</th>
              </tr>
            </thead>
            <tbody>
              {top.slice(0, 10).map((v, i) => (
                <tr key={v.id}>
                  <td>
                    <span style={{
                      fontWeight: 700,
                      color: i === 0 ? '#d4af00' : i === 1 ? '#9ca3af' : i === 2 ? '#cd7f32' : '#6b7280'
                    }}>
                      {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}`}
                    </span>
                  </td>
                  <td>#{v.id}</td>
                  <td style={{ fontSize: 13, color: '#6b7280' }}>{v.colegio || '—'}</td>
                  <td><span className="admin-chip admin-chip--gold">{v.puntos_totales} pts</span></td>
                </tr>
              ))}
              {top.length === 0 && <tr><td colSpan="4" style={{ textAlign: 'center' }}>Sin datos</td></tr>}
            </tbody>
          </table>
        </div>

        <div className="admin-card">
          <h3 style={{ marginTop: 0, marginBottom: 14, color: '#002d54', fontSize: 16 }}>
            Estado del evento
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ padding: '12px 16px', background: '#f0f7ff', borderRadius: 10, borderLeft: '4px solid #004077' }}>
              <div style={{ fontWeight: 600, color: '#002d54', fontSize: 14 }}>Trivia</div>
              <div style={{ color: '#6b7280', fontSize: 13, marginTop: 2 }}>
                Tasa de participación: <strong style={{ color: '#004077' }}>{tasaTrivia}%</strong>
              </div>
              <div style={{ color: '#6b7280', fontSize: 13 }}>
                Aciertos: <strong style={{ color: '#004077' }}>{pctTriviaCorrecta}%</strong>
              </div>
            </div>
            <div style={{ padding: '12px 16px', background: '#fffbeb', borderRadius: 10, borderLeft: '4px solid #ffd700' }}>
              <div style={{ fontWeight: 600, color: '#002d54', fontSize: 14 }}>Premios</div>
              <div style={{ color: '#6b7280', fontSize: 13, marginTop: 2 }}>
                Activos: <strong style={{ color: '#8a6d00' }}>{resumen.premios_activos}</strong>
              </div>
              <div style={{ color: '#6b7280', fontSize: 13 }}>
                Tasa de canje: <strong style={{ color: '#8a6d00' }}>{tasaCanjes}%</strong>
              </div>
            </div>
            <div style={{ padding: '12px 16px', background: '#f0fdf4', borderRadius: 10, borderLeft: '4px solid #16a34a' }}>
              <div style={{ fontWeight: 600, color: '#002d54', fontSize: 14 }}>Carreras activas</div>
              <div style={{ color: '#6b7280', fontSize: 13, marginTop: 2 }}>
                <strong style={{ color: '#16a34a' }}>{resumen.carreras_activas}</strong> disponibles para visitar
              </div>
            </div>
            <div style={{ padding: '12px 16px', background: '#fef2f2', borderRadius: 10, borderLeft: '4px solid #dc2626' }}>
              <div style={{ fontWeight: 600, color: '#002d54', fontSize: 14 }}>Feedback</div>
              <div style={{ color: '#6b7280', fontSize: 13, marginTop: 2 }}>
                Tasa de respuesta: <strong style={{ color: '#dc2626' }}>{tasaFeedback}%</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

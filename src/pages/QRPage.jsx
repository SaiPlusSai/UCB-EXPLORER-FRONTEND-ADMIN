import { useEffect, useState } from 'react'

import {
  QrCode,
  Gift,
  Info,
  Download,
  Sparkles,
} from 'lucide-react'

import { qrApi } from '../api/endpoints'

export default function QRPage() {

  const [tipo, setTipo] =
    useState('puntos')

  const [puntos, setPuntos] =
    useState(100)

  const [titulo, setTitulo] =
    useState('')

  const [descripcion, setDescripcion] =
    useState('')

  const [qrGenerados, setQrGenerados] =
    useState([])

  const [cargando, setCargando] =
    useState(true)

  const [error, setError] =
    useState('')

  const [generando, setGenerando] =
    useState(false)

  const cargar = async () => {

    try {

      const res =
        await qrApi.listarGenerados()

      setQrGenerados(
        res.data.data
      )

    } catch (e) {

      setError(
        e.response?.data?.error ||
        'Error cargando QRs'
      )

    } finally {

      setCargando(false)

    }
  }

  useEffect(() => {

    cargar()

  }, [])

  const generarQR = async (
    e
  ) => {

    e.preventDefault()

    setGenerando(true)

    setError('')

    try {

      const payload =
        tipo === 'puntos'
          ? {
              tipo,
              puntos,
            }
          : {
              tipo,
              titulo,
              descripcion,
            }

      await qrApi.generar(
        payload
      )

      setTitulo('')

      setDescripcion('')

      cargar()

    } catch (e) {

      setError(
        e.response?.data?.error ||
        'No se pudo generar QR'
      )

    } finally {

      setGenerando(false)

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
            Gestión QR
          </h1>

        </div>

      </div>

      {error && (
        <div className="admin-error">
          {error}
        </div>
      )}

      <div
        className="panel-table-card"
        style={{
          marginBottom: 30,
        }}
      >

        <form
          onSubmit={generarQR}
          className="panel-modal-form"
          style={{
            padding: 28,
          }}
        >

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              marginBottom: 10,
            }}
          >

            <QrCode size={24} />

            <h2
              style={{
                margin: 0,
                color:
                  'var(--ucb-azul-oscuro)',
              }}
            >

              Generar QR

            </h2>

          </div>

          <div className="panel-form-group">

            <label>
              Tipo QR
            </label>

            <select
              className="panel-input"
              value={tipo}
              onChange={(e) =>
                setTipo(
                  e.target.value
                )
              }
            >

              <option value="puntos">
                🎁 Puntos
              </option>

              <option value="informacion">
                ℹ️ Información
              </option>

            </select>

          </div>

          {tipo === 'puntos' ? (

            <div className="panel-form-group">

              <label>
                Puntos
              </label>

              <input
                className="panel-input"
                type="number"
                min="1"
                value={puntos}
                onChange={(e) =>
                  setPuntos(
                    e.target.value
                  )
                }
              />

            </div>

          ) : (

            <>
              <div className="panel-form-group">

                <label>
                  Título
                </label>

                <input
                  className="panel-input"
                  value={titulo}
                  onChange={(e) =>
                    setTitulo(
                      e.target.value
                    )
                  }
                />

              </div>

              <div className="panel-form-group">

                <label>
                  Descripción
                </label>

                <textarea
                  rows={4}
                  className="panel-input"
                  value={descripcion}
                  onChange={(e) =>
                    setDescripcion(
                      e.target.value
                    )
                  }
                />

              </div>
            </>
          )}

          <button
            className="panel-save-btn"
            disabled={generando}
          >

            <Sparkles
              size={17}
              style={{
                marginRight: 8,
              }}
            />

            {generando
              ? 'Generando...'
              : 'Generar QR'}

          </button>

        </form>

      </div>

      <div
        style={{
          marginBottom: 18,
        }}
      >

        <p className="panel-subtitle">
          Historial
        </p>

        <h2
          style={{
            margin: 0,
            color:
              'var(--ucb-azul-oscuro)',
          }}
        >

          QRs Generados

        </h2>

      </div>

      {cargando ? (

        <div className="admin-loader" />

      ) : (

        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(auto-fit, minmax(320px, 1fr))',
            gap: 22,
          }}
        >

          {qrGenerados.map((qr) => (

            <div
              key={qr.id}
              className="panel-table-card"
              style={{
                padding: 24,
              }}
            >

              <div
                style={{
                  display: 'flex',
                  justifyContent:
                    'space-between',
                  alignItems:
                    'center',
                  marginBottom: 20,
                }}
              >

                <span
                  className={`panel-pill ${
                    qr.tipo ===
                    'puntos'
                      ? 'panel-pill-warning'
                      : 'panel-pill-success'
                  }`}
                >

                  {qr.tipo ===
                  'puntos' ? (

                    <>
                      <Gift
                        size={14}
                        style={{
                          marginRight: 6,
                        }}
                      />

                      Puntos
                    </>

                  ) : (

                    <>
                      <Info
                        size={14}
                        style={{
                          marginRight: 6,
                        }}
                      />

                      Información
                    </>

                  )}

                </span>

                <span
                  style={{
                    fontSize: 13,
                    color: '#94a3b8',
                  }}
                >

                  #{qr.id}

                </span>

              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent:
                    'center',
                  marginBottom: 22,
                }}
              >

                <img
                  src={qr.qr_base64}
                  alt="QR"
                  style={{
                    width: 220,
                    height: 220,
                    objectFit:
                      'contain',
                    borderRadius: 24,
                    background:
                      '#ffffff',
                    padding: 14,
                    border:
                      '1px solid #e2e8f0',
                    boxShadow:
                      '0 10px 30px rgba(0,0,0,.08)',
                    cursor:
                      'pointer',
                    transition:
                      '.2s ease',
                  }}
                  onClick={() =>
                    window.open(
                      qr.qr_base64,
                      '_blank'
                    )
                  }
                />

              </div>

              <div
                style={{
                  background:
                    '#f8fafc',
                  border:
                    '1px solid #e2e8f0',
                  borderRadius: 16,
                  padding: 16,
                  marginBottom: 18,
                }}
              >

                <pre
                  style={{
                    margin: 0,
                    whiteSpace:
                      'pre-wrap',
                    fontSize: 13,
                    color:
                      '#475569',
                  }}
                >

                  {JSON.stringify(
                    qr.contenido_json,
                    null,
                    2
                  )}

                </pre>

              </div>

              <a
                href={qr.qr_base64}
                download={`qr-${qr.id}.png`}
                className="panel-create-btn"
                style={{
                  width: '100%',
                  justifyContent:
                    'center',
                }}
              >

                <Download
                  size={17}
                />

                Descargar QR

              </a>

            </div>

          ))}

        </div>

      )}

    </div>
  )
}
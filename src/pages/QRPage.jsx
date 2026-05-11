import { useEffect, useState } from 'react'

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
    <>

      <div className="admin-topbar">

        <h2>
          Gestión QR
        </h2>

      </div>

      {error && (
        <div className="admin-error">
          {error}
        </div>
      )}

      <form
        className="admin-card"
        onSubmit={generarQR}
        style={{
          marginBottom: 24,
        }}
      >

        <h3
          style={{
            marginTop: 0,
          }}
        >
          Generar QR
        </h3>

        <label className="admin-label">
          Tipo QR
        </label>

        <select
          className="admin-select"
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

        {tipo === 'puntos' ? (

          <>

            <label className="admin-label">
              Puntos
            </label>

            <input
              className="admin-input"
              type="number"
              min="1"
              value={puntos}
              onChange={(e) =>
                setPuntos(
                  e.target.value
                )
              }
            />

          </>

        ) : (

          <>

            <label className="admin-label">
              Título
            </label>

            <input
              className="admin-input"
              value={titulo}
              onChange={(e) =>
                setTitulo(
                  e.target.value
                )
              }
            />

            <label className="admin-label">
              Descripción
            </label>

            <textarea
              rows={4}
              className="admin-textarea"
              value={descripcion}
              onChange={(e) =>
                setDescripcion(
                  e.target.value
                )
              }
            />

          </>

        )}

        <button
          className="admin-btn"
          disabled={generando}
          style={{
            marginTop: 18,
          }}
        >

          {generando
            ? 'Generando...'
            : 'Generar QR'}

        </button>

      </form>

      <h3
        style={{
          marginBottom: 16,
        }}
      >
        QRs generados
      </h3>

      {cargando ? (

        <div className="admin-loader" />

      ) : (

        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 18,
          }}
        >

          {qrGenerados.map((qr) => (

            <div
              key={qr.id}
              className="admin-card"
            >

              <div
                style={{
                  display: 'flex',
                  justifyContent:
                    'space-between',
                  marginBottom: 12,
                }}
              >

                <span
                  className={`admin-chip ${
                    qr.tipo ===
                    'puntos'
                      ? 'admin-chip--gold'
                      : 'admin-chip--ok'
                  }`}
                >

                  {qr.tipo ===
                  'puntos'
                    ? '🎁 Puntos'
                    : 'ℹ️ Información'}

                </span>

                <span
                  style={{
                    fontSize: 12,
                    color: '#6b7280',
                  }}
                >
                  #{qr.id}
                </span>

              </div>

              <div
  style={{
    display: 'flex',
    justifyContent: 'center',
    marginBottom: 14,
  }}
>

  <img
    src={qr.qr_base64}
    alt="QR"
    style={{
      width: 180,
      height: 180,
      objectFit: 'contain',
      borderRadius: 16,
      background: '#fff',
      padding: 10,
      border: '1px solid #e5e7eb',
      boxShadow:
        '0 4px 14px rgba(0,0,0,.08)',
      cursor: 'pointer',
      transition: '.2s',
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
                  fontSize: 13,
                  color: '#374151',
                  marginBottom: 12,
                  wordBreak:
                    'break-word',
                }}
              >

                <pre
                  style={{
                    whiteSpace:
                      'pre-wrap',
                    margin: 0,
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
                className="admin-btn admin-btn--ghost"
                style={{
                  width: '100%',
                  textAlign: 'center',
                }}
              >
                Descargar QR
              </a>

            </div>
          ))}

        </div>
      )}

    </>
  )
}
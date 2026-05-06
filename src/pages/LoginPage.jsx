import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import logoUcb from '../assets/images/UCB.png'
import { useAuth } from '../context/AuthContext.jsx'

export default function LoginPage() {
  const navigate = useNavigate()
  const { login, token } = useAuth()
  const [correo, setCorreo] = useState('admin@ucb')
  const [password, setPassword] = useState('admin')
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (token) navigate('/')
  }, [token, navigate])

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setEnviando(true)
    try {
      await login(correo.trim(), password)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo iniciar sesión')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="admin-login">
      <form className="admin-login__card" onSubmit={submit}>
        <img src={logoUcb} alt="UCB" />
        <h1>Backoffice UCB Explorer</h1>
        <p>Acceso restringido a administradores</p>

        <label className="admin-label">Correo</label>
        <input
          className="admin-input"
          type="email"
          value={correo}
          onChange={(e) => setCorreo(e.target.value)}
          placeholder="admin@ucb"
          required
        />

        <label className="admin-label">Password</label>
        <input
          className="admin-input"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="********"
          required
        />

        {error && <div className="admin-error">{error}</div>}

        <button className="admin-btn" style={{ width: '100%', marginTop: 16 }} disabled={enviando}>
          {enviando ? 'Entrando…' : 'Ingresar'}
        </button>
      </form>
    </div>
  )
}

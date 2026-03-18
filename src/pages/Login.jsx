import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const VALID_USERS = [
  { username: 'hanshatch',  password: 'Hx#9mK2$vL8n' },
  { username: 'aisir_admin', password: 'Nq@7wR4!zT6j' },
]

export default function Login() {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [pwd, setPwd]           = useState('')
  const [error, setError]       = useState(false)
  const [loading, setLoading]   = useState(false)

  useEffect(() => {
    if (localStorage.getItem('aisir_auth')) navigate('/agentes', { replace: true })
  }, [navigate])

  function handleSubmit(e) {
    e.preventDefault()
    setError(false)
    setLoading(true)
    setTimeout(() => {
      const ok = VALID_USERS.some(
        (u) => u.username === username.trim().toLowerCase() && u.password === pwd
      )
      if (ok) {
        localStorage.setItem('aisir_auth', '1')
        navigate('/agentes', { replace: true })
      } else {
        setError(true)
        setLoading(false)
      }
    }, 400)
  }

  const inputStyle = (hasError) => ({
    width: '100%',
    fontFamily: '"Roboto Mono", monospace',
    fontSize: 14,
    padding: '10px 14px',
    background: '#efeded',
    border: `1.5px solid ${hasError ? '#878787' : '#ababab'}`,
    borderRadius: 7,
    color: '#373737',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.15s, box-shadow 0.15s',
  })

  return (
    <div style={{
      width: '100vw',
      minHeight: '100vh',
      backgroundImage: 'url(/BG_login.jpg)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Roboto, sans-serif',
      margin: 0,
      padding: 0,
    }}>
      <div style={{ width: 380, maxWidth: 'calc(100vw - 32px)' }} className="animate-fade-up">

        {/* Card */}
        <div style={{
          background: 'rgba(255,255,255,0.80)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(171,171,171,0.4)',
          borderRadius: 12,
          padding: '32px 32px 28px',
          boxShadow: '0 8px 40px rgba(0,0,0,0.18)',
        }}>
          {/* Logo dentro del card */}
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <h1 style={{
              fontFamily: '"Nunito Sans", sans-serif',
              fontWeight: 800,
              fontSize: 36,
              lineHeight: 1,
              letterSpacing: '-0.02em',
              marginBottom: 6,
            }}>
              <span style={{ color: '#373737' }}>hans</span>
              <span style={{ color: '#86a43b' }}>hatch</span>
            </h1>
            <p style={{
              fontFamily: 'Roboto, sans-serif',
              fontSize: 10,
              fontWeight: 700,
              color: '#373737',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}>
              AISIR | Intelligence Agents
            </p>
          </div>
          <form onSubmit={handleSubmit}>
            {/* Usuario */}
            <div style={{ marginBottom: 14 }}>
              <label style={{
                display: 'block',
                fontFamily: 'Roboto, sans-serif',
                fontSize: 11, fontWeight: 500,
                color: '#373737',
                marginBottom: 7,
                letterSpacing: '0.02em',
              }}>
                Usuario
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => { setUsername(e.target.value); setError(false) }}
                autoFocus
                autoComplete="username"
                placeholder="usuario"
                style={inputStyle(error)}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#86a43b'
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(118,167,43,0.12)'
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = error ? '#878787' : '#ababab'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              />
            </div>

            {/* Contraseña */}
            <div style={{ marginBottom: 16 }}>
              <label style={{
                display: 'block',
                fontFamily: 'Roboto, sans-serif',
                fontSize: 11, fontWeight: 500,
                color: '#373737',
                marginBottom: 7,
                letterSpacing: '0.02em',
              }}>
                Contraseña
              </label>
              <input
                type="password"
                value={pwd}
                onChange={(e) => { setPwd(e.target.value); setError(false) }}
                autoComplete="current-password"
                placeholder="••••••••••"
                style={inputStyle(error)}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#86a43b'
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(118,167,43,0.12)'
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = error ? '#878787' : '#ababab'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              />
            </div>

            {error && (
              <p style={{
                fontFamily: 'Roboto, sans-serif',
                fontSize: 12,
                color: '#878787',
                marginBottom: 12,
              }}>
                Usuario o contraseña incorrectos.
              </p>
            )}

            <button
              type="submit"
              disabled={loading || !username || !pwd}
              style={{
                width: '100%',
                fontFamily: '"Nunito Sans", sans-serif',
                fontWeight: 800,
                fontSize: 13,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                padding: '11px 0',
                background: loading || !username || !pwd ? 'rgba(134,164,59,0.4)' : '#86a43b',
                color: '#ffffff',
                border: 'none',
                borderRadius: 7,
                cursor: loading || !username || !pwd ? 'not-allowed' : 'pointer',
                transition: 'background 0.15s',
                marginTop: 4,
              }}
              onMouseEnter={(e) => {
                if (!loading && username && pwd) e.currentTarget.style.background = '#86a43b'
              }}
              onMouseLeave={(e) => {
                if (!loading && username && pwd) e.currentTarget.style.background = '#86a43b'
              }}
            >
              {loading ? 'Autenticando…' : 'Ingresar'}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p style={{
          textAlign: 'center',
          fontFamily: 'Roboto, sans-serif',
          fontSize: 10,
          color: '#ababab',
          marginTop: 24,
        }}>
          hatch co. · {new Date().getFullYear()}
        </p>
      </div>
    </div>
  )
}

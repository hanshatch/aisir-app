import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const VALID_USERS = [
  { username: 'hans',  password: 'aisir2026' },
  { username: 'admin', password: 'hatch2026' },
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
    background: '#fafaf9',
    border: `1.5px solid ${hasError ? '#dc2626' : '#e4e1db'}`,
    borderRadius: 7,
    color: '#2a2a2a',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.15s, box-shadow 0.15s',
  })

  return (
    <div style={{
      width: '100vw',
      minHeight: '100vh',
      background: '#efeded',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Roboto, sans-serif',
      margin: 0,
      padding: 0,
    }}>
      <div style={{ width: 380, maxWidth: 'calc(100vw - 32px)' }} className="animate-fade-up">

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <h1 style={{
            fontFamily: '"Nunito Sans", sans-serif',
            fontWeight: 800,
            fontSize: 40,
            lineHeight: 1,
            letterSpacing: '-0.02em',
            marginBottom: 8,
          }}>
            <span style={{ color: '#373737' }}>hans</span>
            <span style={{ color: '#76a72b' }}>hatch</span>
          </h1>
          <p style={{
            fontFamily: 'Roboto, sans-serif',
            fontSize: 11,
            color: '#ababab',
            letterSpacing: '0.05em',
          }}>
            AISIR | Intelligence Agents
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: '#ffffff',
          border: '1px solid #e4e1db',
          borderRadius: 12,
          padding: '32px 32px 28px',
          boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
        }}>
          <p style={{
            fontFamily: 'Roboto, sans-serif',
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: '#ababab',
            marginBottom: 20,
          }}>
            Acceso al sistema
          </p>

          <form onSubmit={handleSubmit}>
            {/* Usuario */}
            <div style={{ marginBottom: 14 }}>
              <label style={{
                display: 'block',
                fontFamily: 'Roboto, sans-serif',
                fontSize: 11, fontWeight: 500,
                color: '#878787',
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
                  e.currentTarget.style.borderColor = '#76a72b'
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(118,167,43,0.12)'
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = error ? '#dc2626' : '#e4e1db'
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
                color: '#878787',
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
                  e.currentTarget.style.borderColor = '#76a72b'
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(118,167,43,0.12)'
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = error ? '#dc2626' : '#e4e1db'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              />
            </div>

            {error && (
              <p style={{
                fontFamily: 'Roboto, sans-serif',
                fontSize: 12,
                color: '#dc2626',
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
                background: loading || !username || !pwd ? '#d4dfc7' : '#76a72b',
                color: '#ffffff',
                border: 'none',
                borderRadius: 7,
                cursor: loading || !username || !pwd ? 'not-allowed' : 'pointer',
                transition: 'background 0.15s',
                marginTop: 4,
              }}
              onMouseEnter={(e) => {
                if (!loading && username && pwd) e.currentTarget.style.background = '#5c8420'
              }}
              onMouseLeave={(e) => {
                if (!loading && username && pwd) e.currentTarget.style.background = '#76a72b'
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
          color: '#c5c2bc',
          marginTop: 24,
        }}>
          hatch co. · {new Date().getFullYear()}
        </p>
      </div>
    </div>
  )
}

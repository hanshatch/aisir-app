import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '@/api/client'

export default function Login() {
  const navigate = useNavigate()
  const [pwd, setPwd] = useState('')
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (localStorage.getItem('aisir_auth')) navigate('/agentes', { replace: true })
  }, [navigate])

  async function handleSubmit(e) {
    e.preventDefault()
    setError(false)
    setLoading(true)
    try {
      await api.login(pwd)
      localStorage.setItem('aisir_auth', '1')
      navigate('/agentes', { replace: true })
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f0eeea',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Roboto, sans-serif',
    }}>
      <div style={{ width: 380 }} className="animate-fade-up">

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <p style={{
            fontFamily: 'Roboto, sans-serif',
            fontSize: 9, fontWeight: 500,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: '#ababab',
            marginBottom: 12,
          }}>
            AiSir · Ecosistema
          </p>
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
            Norse Intelligence Agents
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
            <div style={{ marginBottom: 16 }}>
              <label htmlFor="pwd" style={{
                display: 'block',
                fontFamily: 'Roboto, sans-serif',
                fontSize: 11,
                fontWeight: 500,
                color: '#878787',
                marginBottom: 7,
                letterSpacing: '0.02em',
              }}>
                Contraseña
              </label>
              <input
                id="pwd"
                type="password"
                value={pwd}
                onChange={(e) => { setPwd(e.target.value); setError(false) }}
                autoFocus
                autoComplete="current-password"
                placeholder="••••••••••"
                style={{
                  width: '100%',
                  fontFamily: '"Roboto Mono", monospace',
                  fontSize: 14,
                  padding: '10px 14px',
                  background: '#fafaf9',
                  border: `1.5px solid ${error ? '#dc2626' : '#e4e1db'}`,
                  borderRadius: 7,
                  color: '#2a2a2a',
                  outline: 'none',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.15s, box-shadow 0.15s',
                }}
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
                Contraseña incorrecta. Verifica e intenta de nuevo.
              </p>
            )}

            <button
              type="submit"
              disabled={loading || !pwd}
              style={{
                width: '100%',
                fontFamily: '"Nunito Sans", sans-serif',
                fontWeight: 800,
                fontSize: 13,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                padding: '11px 0',
                background: loading || !pwd ? '#d4dfc7' : '#76a72b',
                color: '#ffffff',
                border: 'none',
                borderRadius: 7,
                cursor: loading || !pwd ? 'not-allowed' : 'pointer',
                transition: 'background 0.15s, transform 0.1s',
                marginTop: 4,
              }}
              onMouseEnter={(e) => {
                if (!loading && pwd) e.currentTarget.style.background = '#5c8420'
              }}
              onMouseLeave={(e) => {
                if (!loading && pwd) e.currentTarget.style.background = '#76a72b'
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

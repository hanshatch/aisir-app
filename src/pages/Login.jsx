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
    <div
      className="min-h-screen flex items-center justify-center"
      style={{
        background: '#060908',
        backgroundImage: 'radial-gradient(ellipse 60% 40% at 50% 30%, rgba(126,200,50,0.05) 0%, transparent 70%)',
      }}
    >
      {/* Scan-line texture overlay */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, #7ec832, #7ec832 1px, transparent 1px, transparent 4px)',
        }}
      />

      <div
        className="relative animate-fade-in"
        style={{ width: 360 }}
      >
        {/* Top accent bar */}
        <div
          style={{
            height: 2,
            background: '#7ec832',
            boxShadow: '0 0 16px rgba(126,200,50,0.6)',
            borderRadius: '3px 3px 0 0',
          }}
        />

        <div
          style={{
            background: '#0d110d',
            border: '1px solid #1e2d1a',
            borderTop: 'none',
            borderRadius: '0 0 4px 4px',
            padding: '36px 32px 32px',
          }}
        >
          {/* Brand */}
          <div className="text-center mb-8">
            <p className="font-mono text-[9px] uppercase tracking-widest mb-2" style={{ color: '#3d5535' }}>
              Sistema · AiSir
            </p>
            <h1 className="font-display font-black text-4xl tracking-tight leading-none mb-1">
              <span style={{ color: '#3d5535' }}>hans</span>
              <span
                style={{ color: '#7ec832', textShadow: '0 0 24px rgba(126,200,50,0.6)' }}
              >
                Hatch
              </span>
            </h1>
            <p className="font-mono text-[10px] tracking-widest mt-2" style={{ color: '#3d5535' }}>
              Norse Intelligence Agents
            </p>
          </div>

          {/* Divider */}
          <div className="mb-6" style={{ height: 1, background: '#1e2d1a' }} />

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="pwd"
                className="block font-mono text-[10px] uppercase tracking-widest mb-2"
                style={{ color: '#5c7a50' }}
              >
                Contraseña de acceso
              </label>
              <input
                id="pwd"
                type="password"
                value={pwd}
                onChange={(e) => { setPwd(e.target.value); setError(false) }}
                autoFocus
                autoComplete="current-password"
                className="w-full font-mono text-sm px-3 py-2.5 outline-none transition-all"
                style={{
                  background: '#080c08',
                  border: `1px solid ${error ? '#e04545' : '#1e2d1a'}`,
                  borderRadius: 3,
                  color: '#d4e6c8',
                  boxShadow: error ? '0 0 0 1px rgba(224,69,69,0.2)' : undefined,
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#7ec832'
                  e.currentTarget.style.boxShadow = '0 0 0 1px rgba(126,200,50,0.25), 0 0 12px rgba(126,200,50,0.1)'
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = error ? '#e04545' : '#1e2d1a'
                  e.currentTarget.style.boxShadow = error ? '0 0 0 1px rgba(224,69,69,0.2)' : ''
                }}
                placeholder="••••••••••"
              />
            </div>

            {error && (
              <p className="font-mono text-xs text-center" style={{ color: '#e04545' }}>
                Contraseña incorrecta
              </p>
            )}

            <button
              type="submit"
              disabled={loading || !pwd}
              className="w-full font-display font-extrabold text-sm py-3 transition-all duration-150"
              style={{
                background: loading || !pwd ? '#3d5535' : '#7ec832',
                color: '#060908',
                borderRadius: 3,
                cursor: loading || !pwd ? 'not-allowed' : 'pointer',
                boxShadow: loading || !pwd ? 'none' : '0 0 16px rgba(126,200,50,0.35)',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
              }}
            >
              {loading ? 'Autenticando…' : 'Ingresar al sistema'}
            </button>
          </form>

          <p className="font-mono text-center mt-6 text-[10px]" style={{ color: '#2a3d24' }}>
            hatch co. · {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </div>
  )
}

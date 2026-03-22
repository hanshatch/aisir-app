import { useState, useEffect } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  Bot, Layers, Calendar, GitBranch, Sparkles, DollarSign,
  BarChart3, Brain, Activity, Terminal, LogOut, Newspaper, CalendarRange,
} from 'lucide-react'

const NAV = [
  {
    label: 'Operaciones',
    items: [
      { to: '/agentes',    label: 'Agentes',     icon: Bot },
      { to: '/flujos',     label: 'Flujos',      icon: GitBranch },
      { to: '/planeacion', label: 'Planeación',  icon: CalendarRange },
      { to: '/pipeline',   label: 'Pipeline',    icon: Layers },
      { to: '/calendario', label: 'Calendario',  icon: Calendar },
      { to: '/metricas',   label: 'Métricas',    icon: BarChart3 },
      { to: '/costos',     label: 'Costos',      icon: DollarSign },
    ],
  },
  {
    label: 'Base de conocimiento',
    items: [
      { to: '/columnas',    label: 'Columnas',    icon: Newspaper },
      { to: '/inspiracion', label: 'Inspiración', icon: Sparkles },
      { to: '/cerebro',     label: 'Cerebro',     icon: Brain },
    ],
  },
  {
    label: 'Sistema',
    items: [
      { to: '/actividad', label: 'Actividad', icon: Activity },
      { to: '/comandos',  label: 'Comandos',  icon: Terminal },
    ],
  },
]

export default function AppShell() {
  const navigate = useNavigate()
  const [time, setTime]   = useState('')
  const [date, setDate]   = useState('')

  useEffect(() => {
    function tick() {
      const d = new Date()
      setTime(d.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: false }))
      setDate(d.toLocaleDateString('es-MX', { weekday: 'short', day: 'numeric', month: 'short' }))
    }
    tick()
    const id = setInterval(tick, 30_000)
    return () => clearInterval(id)
  }, [])

  return (
    <div style={{ display: 'flex', height: '100%', width: '100%', overflow: 'hidden' }}>

      {/* ── Sidebar — color #373737 del manual de marca ── */}
      <aside style={{
        width: 240,
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        background: '#373737',
        borderRight: '1px solid rgba(0,0,0,0.15)',
      }}>

        {/* ── Logo / Brand ── */}
        <div style={{
          padding: '24px 20px 20px',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
        }}>
          {/* Logotipo */}
          <h1 style={{
            fontFamily: 'Roboto, sans-serif',
            fontWeight: 700,
            fontSize: 26,
            lineHeight: 1,
            letterSpacing: '-0.01em',
          }}>
            <span style={{ color: '#ffffff' }}>hans</span>
            <span style={{ color: '#86a43b' }}>hatch</span>
          </h1>

          <p style={{
            fontFamily: 'Roboto, sans-serif',
            fontSize: 10, color: 'rgba(255,255,255,0.25)',
            marginTop: 5, letterSpacing: '0.03em',
          }}>
            AISIR | Intelligence Agents
          </p>

          {/* Status */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 7,
            marginTop: 14, padding: '6px 10px',
            background: 'rgba(118,167,43,0.12)',
            border: '1px solid rgba(118,167,43,0.25)',
            borderRadius: 6,
          }}>
            <span
              className="status-dot animate-pulse-dot"
              style={{ background: '#86a43b' }}
            />
            <span style={{
              fontFamily: 'Roboto, sans-serif', fontSize: 10,
              color: '#9dc454', flex: 1,
            }}>
              Sistema activo
            </span>
            <span style={{
              fontFamily: '"Roboto Mono", monospace', fontSize: 10,
              color: 'rgba(255,255,255,0.2)',
            }}>
              {time || '--:--'}
            </span>
          </div>
        </div>

        {/* ── Nav ── */}
        <nav style={{ flex: 1, padding: '16px 12px', overflowY: 'auto' }}>
          {NAV.map((section) => (
            <div key={section.label} style={{ marginBottom: 24 }}>
              <p style={{
                fontFamily: 'Roboto, sans-serif',
                fontSize: 9, fontWeight: 700,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.2)',
                padding: '0 12px',
                marginBottom: 6,
              }}>
                {section.label}
              </p>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 2 }}>
                {section.items.map(({ to, label, icon: Icon }) => (
                  <li key={to}>
                    <NavLink
                      to={to}
                      className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
                    >
                      <Icon size={15} style={{ flexShrink: 0 }} />
                      <span>{label}</span>
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        {/* ── Stats del sistema ── */}
        <div style={{
          margin: '0 12px 12px',
          padding: '10px 12px',
          background: 'rgba(0,0,0,0.2)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: 7,
        }}>
          <p style={{
            fontFamily: 'Roboto, sans-serif', fontSize: 9, fontWeight: 700,
            letterSpacing: '0.18em', textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.2)', marginBottom: 8,
          }}>
            Estado
          </p>
          {[
            { label: 'uptime',     value: '99.8%' },
            { label: 'agentes',    value: '10 / 10' },
            { label: 'posts/sem',  value: '12' },
          ].map(({ label, value }) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
              <span style={{ fontFamily: 'Roboto, sans-serif', fontSize: 10, color: 'rgba(255,255,255,0.25)' }}>
                {label}
              </span>
              <span style={{ fontFamily: '"Roboto Mono", monospace', fontSize: 10, color: 'rgba(255,255,255,0.5)', fontWeight: 500 }}>
                {value}
              </span>
            </div>
          ))}
        </div>

        {/* ── Footer ── */}
        <div style={{
          padding: '14px 16px',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div>
            <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: 10, color: 'rgba(255,255,255,0.2)' }}>
              hatch co. · {new Date().getFullYear()}
            </p>
            <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: 9, color: 'rgba(255,255,255,0.15)', marginTop: 2 }}>
              {date}
            </p>
          </div>
          <button
            onClick={() => { localStorage.removeItem('aisir_auth'); navigate('/') }}
            style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '6px 10px',
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 5,
              color: 'rgba(255,255,255,0.3)',
              cursor: 'pointer',
              fontFamily: 'Roboto, sans-serif', fontSize: 10,
              fontWeight: 500,
              transition: 'all 0.15s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'rgba(244,63,94,0.5)'
              e.currentTarget.style.color = '#878787'
              e.currentTarget.style.background = 'rgba(244,63,94,0.08)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'
              e.currentTarget.style.color = 'rgba(255,255,255,0.3)'
              e.currentTarget.style.background = 'transparent'
            }}
          >
            <LogOut size={11} />
            salir
          </button>
        </div>
      </aside>

      {/* ── Main content — fondo claro de marca ── */}
      <main style={{
        flex: 1,
        overflowY: 'auto',
        overflowX: 'hidden',
        background: '#efeded',
      }}>
        <Outlet />
      </main>

    </div>
  )
}

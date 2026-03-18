import { useState, useEffect } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  Bot, Layers, Calendar, GitBranch, Sparkles,
  Share2, BarChart3, Brain, Activity, Terminal, LogOut,
} from 'lucide-react'

const NAV = [
  {
    label: 'Operaciones',
    items: [
      { to: '/agentes',    label: 'Agentes',     icon: Bot },
      { to: '/pipeline',   label: 'Pipeline',    icon: Layers },
      { to: '/calendario', label: 'Calendario',  icon: Calendar },
    ],
  },
  {
    label: 'Contenido',
    items: [
      { to: '/flujos',      label: 'Flujos',      icon: GitBranch },
      { to: '/inspiracion', label: 'Inspiración', icon: Sparkles },
      { to: '/red',         label: 'Red Social',  icon: Share2 },
      { to: '/metricas',    label: 'Métricas',    icon: BarChart3 },
    ],
  },
  {
    label: 'Sistema',
    items: [
      { to: '/cerebro',   label: 'Cerebro',   icon: Brain },
      { to: '/actividad', label: 'Actividad', icon: Activity },
      { to: '/comandos',  label: 'Comandos',  icon: Terminal },
    ],
  },
]

export default function AppShell() {
  const navigate = useNavigate()
  const [time, setTime] = useState('')

  useEffect(() => {
    function tick() {
      const d = new Date()
      setTime(
        d.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: false })
      )
    }
    tick()
    const id = setInterval(tick, 10_000)
    return () => clearInterval(id)
  }, [])

  function handleLogout() {
    localStorage.removeItem('aisir_auth')
    navigate('/')
  }

  return (
    <div className="flex h-full w-full overflow-hidden">
      {/* Sidebar */}
      <aside
        className="flex flex-col flex-shrink-0 overflow-y-auto"
        style={{
          width: 228,
          background: '#060908',
          borderRight: '1px solid #161d16',
        }}
      >
        {/* Brand */}
        <div className="px-5 pt-6 pb-5" style={{ borderBottom: '1px solid #161d16' }}>
          <p className="font-mono text-[9px] uppercase tracking-widest text-sb-muted mb-1">
            Sistema · AiSir
          </p>
          <h1 className="font-display font-black text-2xl leading-none tracking-tight">
            <span style={{ color: '#3d5535' }}>hans</span>
            <span
              className="text-glow"
              style={{ color: '#7ec832', textShadow: '0 0 18px rgba(126,200,50,0.55)' }}
            >
              Hatch
            </span>
          </h1>
          <p className="font-mono text-[9px] tracking-widest mt-1" style={{ color: '#3d5535' }}>
            Norse Intelligence Agents
          </p>
          {/* DB status */}
          <div className="flex items-center gap-2 mt-3">
            <span
              className="inline-block w-2 h-2 rounded-full animate-pulse-dot"
              style={{ background: '#7ec832', color: '#7ec832' }}
            />
            <span className="font-mono text-[10px]" style={{ color: '#5c7a50' }}>
              Conectado
            </span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-5">
          {NAV.map((section) => (
            <div key={section.label}>
              <p
                className="font-mono text-[9px] uppercase tracking-widest px-2 mb-1"
                style={{ color: '#2a3d24' }}
              >
                {section.label}
              </p>
              <ul className="space-y-0.5">
                {section.items.map(({ to, label, icon: Icon }) => (
                  <li key={to}>
                    <NavLink
                      to={to}
                      className={({ isActive }) =>
                        [
                          'flex items-center gap-2.5 px-2 py-2 text-sm font-medium transition-all duration-150',
                          isActive
                            ? 'text-green border-l-2 border-green pl-[6px]'
                            : 'text-sb-text border-l-2 border-transparent pl-[6px] hover:text-ink hover:bg-surface',
                        ].join(' ')
                      }
                      style={({ isActive }) =>
                        isActive
                          ? { background: 'rgba(126,200,50,0.07)', borderRadius: 3 }
                          : { borderRadius: 3 }
                      }
                    >
                      <Icon size={14} className="flex-shrink-0" />
                      <span>{label}</span>
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div
          className="px-5 py-4 flex items-center justify-between"
          style={{ borderTop: '1px solid #161d16' }}
        >
          <span className="font-mono text-xs" style={{ color: '#3d5535' }}>
            {time}
          </span>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 font-mono text-[11px] transition-colors"
            style={{ color: '#3d5535' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#e04545')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#3d5535')}
          >
            <LogOut size={11} />
            salir
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto bg-bg">
        <Outlet />
      </main>
    </div>
  )
}

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { X } from 'lucide-react'
import { api } from '@/api/client'
import { ago } from '@/lib/utils'

const AGENTS = [
  {
    key: 'aisir',
    name: 'AiSir',
    rol: 'Orquestador',
    icon: '⚙️',
    color: '#4f9eff',
    desc: 'Coordina todos los agentes. Recibe instrucciones vía Telegram.',
    proceso: [
      'Recibe instrucción de Hans',
      'Identifica qué agente activa',
      'Delega la tarea',
      'Consolida la respuesta',
      'Notifica vía Telegram',
    ],
  },
  {
    key: 'huginn',
    name: 'Huginn',
    rol: 'Curador',
    icon: '🔍',
    color: '#a78bfa',
    desc: 'El cuervo del pensamiento. Genera el brief semanal con los mejores temas.',
    proceso: [
      'Escanea RSS (Adweek, MIT, HubSpot)',
      'Analiza Google Trends MX',
      'Revisa TikTok Creative Center',
      'Genera brief con scoring por pilar',
    ],
  },
  {
    key: 'bragi',
    name: 'Bragi',
    rol: 'Redactor',
    icon: '✍️',
    color: '#34d399',
    desc: 'Dios de la poesía. Escribe artículos SEO, newsletters y scripts.',
    proceso: [
      'Recibe tema aprobado',
      'Carga reglas de Mimir',
      'Genera contenido con GPT-4o',
      'Aplica Brand Voice',
      'Exporta .docx o HTML',
    ],
  },
  {
    key: 'loki',
    name: 'Loki',
    rol: 'Social Media',
    icon: '📱',
    color: '#f59e0b',
    desc: 'Maestro de la transformación. Adapta contenido por red social.',
    proceso: [
      'Recibe contenido base',
      'Adapta por red (formato, extensión, tono)',
      'Aplica estructura por red',
      'Genera hashtags',
      'Envía a Publer',
    ],
  },
  {
    key: 'ratatoskr',
    name: 'Ratatoskr',
    rol: 'Investigación SEO',
    icon: '🔎',
    color: '#10b981',
    desc: 'La ardilla de Yggdrasil. Investiga el top 10 y genera el brief SEO.',
    proceso: [
      'Recibe keyword aprobada',
      'Consulta SerpAPI — top 10',
      'Extrae H2/H3, PAA, brechas',
      'Genera brief para Bragi',
      'Audita artículo (umbral ≥80/100)',
    ],
  },
  {
    key: 'kvasir',
    name: 'Kvasir',
    rol: 'Inspiración',
    icon: '✨',
    color: '#e879f9',
    desc: 'El ser más sabio. Analiza referentes y genera el brief de inspiración mensual.',
    proceso: [
      'Días 28-30: descarga posts referentes',
      'Calcula engagement rate',
      'GPT-4 Vision analiza tops',
      'Extrae patrones ganadores',
      'Genera brief con 10-15 ideas',
    ],
  },
  {
    key: 'idunn',
    name: 'Idunn',
    rol: 'Creativo',
    icon: '🎨',
    color: '#fb923c',
    desc: 'Diosa de la renovación. Genera prompts DALL-E y estructura carousels.',
    proceso: [
      'Analiza contenido a ilustrar',
      'Define concepto visual',
      'Genera prompt DALL-E 3',
      'Propone estructura carousel',
      'Sugiere paleta y estilo',
    ],
  },
  {
    key: 'odin',
    name: 'Odin',
    rol: 'Comentarista',
    icon: '💬',
    color: '#f43f5e',
    desc: 'Allfather. Monitorea líderes y genera comentarios de autoridad.',
    proceso: [
      '9 AM y 3 PM: escanea líderes',
      'Score ≥70 activa generación',
      'Genera 2 versiones del comentario',
      'Hans elige en Telegram',
      'X publica automático',
    ],
  },
  {
    key: 'frigg',
    name: 'Frigg',
    rol: 'Planner editorial',
    icon: '📅',
    color: '#06b6d4',
    desc: 'Reina del Asgard. Organiza el calendario y programa en Publer.',
    proceso: [
      'Recibe temas aprobados',
      'Distribuye por día y red',
      'Asigna horarios óptimos',
      'Programa en Publer via API',
      'Notifica calendario a Hans',
    ],
  },
  {
    key: 'mimir',
    name: 'Mimir',
    rol: 'Cerebro Hans',
    icon: '🧠',
    color: '#8b5cf6',
    desc: 'Guardián del pozo de sabiduría. Memoria adaptativa del sistema.',
    proceso: [
      'Registra cada aprobación/rechazo',
      'Extrae reglas de patrones',
      'Dom 9 PM: consolida la semana',
      'Actualiza pesos de reglas',
      'Aplica al próximo contenido',
    ],
  },
]

function isActive(lastAt) {
  if (!lastAt) return false
  return (Date.now() - new Date(lastAt)) < 2 * 60 * 60 * 1000
}

function AgentCard({ agent, stat, onClick }) {
  const active = isActive(stat?.last_at)
  return (
    <button
      onClick={() => onClick(agent)}
      className="text-left w-full flex flex-col transition-all duration-200 hover:scale-[1.02] group"
      style={{
        background: '#0d110d',
        border: '1px solid #1e2d1a',
        borderRadius: 4,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = agent.color + '55'
        e.currentTarget.style.boxShadow = `0 0 20px ${agent.color}18`
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = '#1e2d1a'
        e.currentTarget.style.boxShadow = 'none'
      }}
    >
      {/* Accent bar */}
      <div
        style={{
          height: 2,
          background: agent.color,
          boxShadow: `0 0 10px ${agent.color}80`,
          borderRadius: '3px 3px 0 0',
        }}
      />

      <div className="p-4 flex flex-col gap-3">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {/* Avatar */}
            <div
              className="w-11 h-11 flex items-center justify-center text-2xl flex-shrink-0"
              style={{
                border: `1px solid ${agent.color}60`,
                borderRadius: 4,
                background: agent.color + '12',
                boxShadow: `0 0 12px ${agent.color}20`,
              }}
            >
              {agent.icon}
            </div>
            <div>
              <p className="font-display font-bold text-sm text-ink leading-tight">
                {agent.name}
              </p>
              <p
                className="font-mono text-[9px] uppercase tracking-widest mt-0.5"
                style={{ color: agent.color }}
              >
                {agent.rol}
              </p>
            </div>
          </div>
          {/* Status dot */}
          <div className="flex items-center gap-1.5 mt-1">
            <span
              className={active ? 'animate-pulse-dot' : ''}
              style={{
                display: 'inline-block',
                width: 7,
                height: 7,
                borderRadius: '50%',
                background: active ? '#7ec832' : '#2a3d24',
                color: active ? '#7ec832' : '#2a3d24',
                boxShadow: active ? '0 0 8px #7ec832' : 'none',
              }}
            />
            <span className="font-mono text-[9px]" style={{ color: active ? '#7ec832' : '#3d5535' }}>
              {active ? 'activo' : 'idle'}
            </span>
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: '#1e2d1a' }} />

        {/* Stats */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <p className="font-mono text-[10px]" style={{ color: '#3d5535' }}>Operaciones</p>
            <p className="font-display font-bold text-lg" style={{ color: agent.color }}>
              {stat?.ops ?? '—'}
            </p>
          </div>
          <div>
            <p className="font-mono text-[10px]" style={{ color: '#3d5535' }}>Último</p>
            <p className="font-mono text-[11px] text-muted">
              {ago(stat?.last_at)}
            </p>
          </div>
        </div>
      </div>
    </button>
  )
}

function DetailPanel({ agent, stat, onClose }) {
  if (!agent) return null
  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40"
        style={{ background: 'rgba(6,9,8,0.7)' }}
        onClick={onClose}
      />
      {/* Panel */}
      <div
        className="fixed top-0 right-0 h-full z-50 overflow-y-auto animate-slide-in"
        style={{
          width: 400,
          background: '#0d110d',
          borderLeft: `1px solid ${agent.color}40`,
          boxShadow: `-8px 0 40px ${agent.color}15`,
        }}
      >
        {/* Top bar */}
        <div
          style={{
            height: 3,
            background: agent.color,
            boxShadow: `0 0 16px ${agent.color}70`,
          }}
        />
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div
                className="w-14 h-14 flex items-center justify-center text-3xl"
                style={{
                  border: `2px solid ${agent.color}60`,
                  borderRadius: 4,
                  background: agent.color + '15',
                  boxShadow: `0 0 20px ${agent.color}25`,
                }}
              >
                {agent.icon}
              </div>
              <div>
                <h2
                  className="font-display font-black text-2xl"
                  style={{ color: agent.color, textShadow: `0 0 16px ${agent.color}50` }}
                >
                  {agent.name}
                </h2>
                <p
                  className="font-mono text-[10px] uppercase tracking-widest mt-0.5"
                  style={{ color: agent.color + 'aa' }}
                >
                  {agent.rol}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 transition-colors"
              style={{ color: '#3d5535', borderRadius: 3 }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#d4e6c8')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#3d5535')}
            >
              <X size={16} />
            </button>
          </div>

          {/* Stats row */}
          <div
            className="grid grid-cols-2 gap-3 mb-6 p-3"
            style={{ background: '#080c08', border: '1px solid #1e2d1a', borderRadius: 3 }}
          >
            <div>
              <p className="font-mono text-[10px] mb-1" style={{ color: '#3d5535' }}>Operaciones</p>
              <p className="font-display font-bold text-2xl" style={{ color: agent.color }}>
                {stat?.ops ?? '—'}
              </p>
            </div>
            <div>
              <p className="font-mono text-[10px] mb-1" style={{ color: '#3d5535' }}>Última actividad</p>
              <p className="font-mono text-xs text-muted">{ago(stat?.last_at)}</p>
            </div>
          </div>

          {/* Description */}
          <div className="mb-6">
            <p className="font-mono text-[10px] uppercase tracking-widest mb-2" style={{ color: '#3d5535' }}>
              Descripción
            </p>
            <p className="text-sm leading-relaxed" style={{ color: '#8aab78' }}>
              {agent.desc}
            </p>
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: '#1e2d1a', marginBottom: 24 }} />

          {/* Process */}
          <div>
            <p className="font-mono text-[10px] uppercase tracking-widest mb-4" style={{ color: '#3d5535' }}>
              Proceso de trabajo
            </p>
            <ol className="space-y-0">
              {agent.proceso.map((step, i) => (
                <li key={i} className="flex gap-3">
                  {/* Number + line */}
                  <div className="flex flex-col items-center">
                    <div
                      className="w-6 h-6 flex items-center justify-center flex-shrink-0 font-mono text-[10px] font-bold"
                      style={{
                        border: `1px solid ${agent.color}60`,
                        borderRadius: 3,
                        background: agent.color + '15',
                        color: agent.color,
                      }}
                    >
                      {i + 1}
                    </div>
                    {i < agent.proceso.length - 1 && (
                      <div
                        style={{
                          width: 1,
                          flex: 1,
                          minHeight: 16,
                          background: `linear-gradient(to bottom, ${agent.color}40, transparent)`,
                          margin: '2px 0',
                        }}
                      />
                    )}
                  </div>
                  {/* Text */}
                  <p className="text-sm pb-3 pt-0.5 leading-snug" style={{ color: '#8aab78' }}>
                    {step}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </>
  )
}

export default function Agentes() {
  const [selected, setSelected] = useState(null)
  const { data, isLoading, isError } = useQuery({
    queryKey: ['agentes'],
    queryFn: api.agentes,
    refetchInterval: 60_000,
  })

  const statsMap = {}
  if (Array.isArray(data)) {
    data.forEach((a) => { statsMap[a.key ?? a.agente] = a })
  }

  return (
    <div className="p-6 animate-fade-in">
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-display font-black text-2xl text-ink">Agentes</h1>
        <p className="font-mono text-xs mt-1 text-muted">
          {AGENTS.length} agentes Norse Intelligence
        </p>
      </div>

      {isError && (
        <div
          className="mb-4 px-4 py-3 font-mono text-xs"
          style={{ background: '#1a0808', border: '1px solid #e04545', borderRadius: 3, color: '#e04545' }}
        >
          Error cargando datos de agentes
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
          {AGENTS.map((a) => (
            <div
              key={a.key}
              className="h-40 animate-pulse"
              style={{ background: '#0d110d', border: '1px solid #1e2d1a', borderRadius: 4 }}
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
          {AGENTS.map((agent) => (
            <AgentCard
              key={agent.key}
              agent={agent}
              stat={statsMap[agent.key]}
              onClick={setSelected}
            />
          ))}
        </div>
      )}

      <DetailPanel
        agent={selected}
        stat={selected ? statsMap[selected.key] : null}
        onClose={() => setSelected(null)}
      />
    </div>
  )
}

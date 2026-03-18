import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { X, Activity, Clock, Cpu } from 'lucide-react'
import { api } from '@/api/client'
import { ago } from '@/lib/utils'

const AGENTS = [
  { key: 'aisir',     name: 'AiSir',      rol: 'Orquestador',      icon: '⚙',  color: '#2563eb',
    desc: 'Coordina todos los agentes. Recibe instrucciones vía Telegram y delega tareas.',
    proceso: ['Recibe instrucción de Hans','Identifica qué agente activa','Delega la tarea','Consolida la respuesta','Notifica vía Telegram'] },
  { key: 'huginn',    name: 'Huginn',     rol: 'Curador',           icon: '🔍', color: '#7c3aed',
    desc: 'El cuervo del pensamiento. Genera el brief semanal con los mejores temas.',
    proceso: ['Escanea RSS (Adweek, MIT, HubSpot)','Analiza Google Trends MX','Revisa TikTok Creative Center','Genera brief con scoring por pilar'] },
  { key: 'bragi',     name: 'Bragi',      rol: 'Redactor',          icon: '✍', color: '#059669',
    desc: 'Dios de la poesía. Escribe artículos SEO, newsletters y scripts.',
    proceso: ['Recibe tema aprobado','Carga reglas de Mimir','Genera contenido con GPT-4o','Aplica Brand Voice','Exporta .docx o HTML'] },
  { key: 'loki',      name: 'Loki',       rol: 'Social Media',      icon: '📱', color: '#d97706',
    desc: 'Maestro de la transformación. Adapta contenido por red social.',
    proceso: ['Recibe contenido base','Adapta por red (formato, extensión, tono)','Aplica estructura por red','Genera hashtags','Envía a Publer'] },
  { key: 'ratatoskr', name: 'Ratatoskr',  rol: 'Investigación SEO', icon: '🔎', color: '#0891b2',
    desc: 'La ardilla de Yggdrasil. Investiga el top 10 y genera el brief SEO.',
    proceso: ['Recibe keyword aprobada','Consulta SerpAPI — top 10','Extrae H2/H3, PAA, brechas','Genera brief para Bragi','Audita artículo (umbral ≥80/100)'] },
  { key: 'kvasir',    name: 'Kvasir',     rol: 'Inspiración',       icon: '✨', color: '#db2777',
    desc: 'El ser más sabio. Analiza referentes y genera el brief de inspiración mensual.',
    proceso: ['Días 28-30: descarga posts referentes','Calcula engagement rate','GPT-4 Vision analiza tops','Extrae patrones ganadores','Genera brief con 10-15 ideas'] },
  { key: 'idunn',     name: 'Idunn',      rol: 'Creativo',          icon: '🎨', color: '#ea580c',
    desc: 'Diosa de la renovación. Genera prompts DALL-E y estructura carousels.',
    proceso: ['Analiza contenido a ilustrar','Define concepto visual','Genera prompt DALL-E 3','Propone estructura carousel','Sugiere paleta y estilo'] },
  { key: 'odin',      name: 'Odin',       rol: 'Comentarista',      icon: '💬', color: '#dc2626',
    desc: 'Allfather. Monitorea líderes y genera comentarios de autoridad.',
    proceso: ['9 AM y 3 PM: escanea líderes','Score ≥70 activa generación','Genera 2 versiones del comentario','Hans elige en Telegram','X publica automático'] },
  { key: 'frigg',     name: 'Frigg',      rol: 'Planner editorial', icon: '📅', color: '#0284c7',
    desc: 'Reina del Asgard. Organiza el calendario y programa en Publer.',
    proceso: ['Recibe temas aprobados','Distribuye por día y red','Asigna horarios óptimos','Programa en Publer via API','Notifica calendario a Hans'] },
  { key: 'mimir',     name: 'Mimir',      rol: 'Cerebro Hans',      icon: '🧠', color: '#76a72b',
    desc: 'Guardián del pozo de sabiduría. Memoria adaptativa del sistema.',
    proceso: ['Registra cada aprobación/rechazo','Extrae reglas de patrones','Dom 9 PM: consolida la semana','Actualiza pesos de reglas','Aplica al próximo contenido'] },
]

function isActive(lastAt) {
  if (!lastAt) return false
  return (Date.now() - new Date(lastAt)) < 2 * 60 * 60 * 1000
}

function AgentCard({ agent, stat, onClick }) {
  const active = isActive(stat?.last_at)
  const ops    = stat?.ops ?? null

  return (
    <button
      onClick={() => onClick(agent)}
      className="card card-hover animate-fade-up"
      style={{ padding: 0, overflow: 'hidden', cursor: 'pointer', textAlign: 'left', width: '100%' }}
    >
      {/* Color accent bar */}
      <div className="accent-bar" style={{ background: agent.color }} />

      <div style={{ padding: '16px 16px 14px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* Icon */}
            <div style={{
              width: 40, height: 40, flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18,
              background: agent.color + '12',
              border: `1px solid ${agent.color}25`,
              borderRadius: 8,
            }}>
              {agent.icon}
            </div>
            <div>
              <p style={{
                fontFamily: '"Nunito Sans", sans-serif',
                fontWeight: 800, fontSize: 15,
                color: '#2a2a2a', lineHeight: 1.1,
              }}>
                {agent.name}
              </p>
              <p style={{
                fontFamily: 'Roboto, sans-serif', fontSize: 10,
                fontWeight: 600, letterSpacing: '0.06em',
                textTransform: 'uppercase',
                color: agent.color, marginTop: 3,
              }}>
                {agent.rol}
              </p>
            </div>
          </div>

          {/* Status badge */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 5,
            padding: '3px 8px',
            background: active ? '#f0f7e6' : '#f5f4f0',
            border: `1px solid ${active ? '#76a72b30' : '#e4e1db'}`,
            borderRadius: 20,
          }}>
            <span
              className={`status-dot ${active ? 'animate-pulse-dot' : ''}`}
              style={{ background: active ? '#76a72b' : '#ababab', width: 6, height: 6 }}
            />
            <span style={{
              fontFamily: 'Roboto, sans-serif', fontSize: 9, fontWeight: 600,
              color: active ? '#5c8420' : '#ababab',
            }}>
              {active ? 'activo' : 'idle'}
            </span>
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: '#f0eeea', marginBottom: 12 }} />

        {/* Metrics */}
        <div style={{ display: 'flex', gap: 20 }}>
          <div>
            <p className="label-caps" style={{ marginBottom: 4 }}>Operaciones</p>
            <p className="metric-num" style={{
              fontSize: '1.9rem',
              color: ops !== null ? agent.color : '#e4e1db',
            }}>
              {ops !== null ? ops.toLocaleString() : '—'}
            </p>
          </div>
          <div>
            <p className="label-caps" style={{ marginBottom: 4 }}>Último</p>
            <p style={{
              fontFamily: '"Roboto Mono", monospace', fontSize: 11,
              color: '#878787', marginTop: 6,
            }}>
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
  const active = isActive(stat?.last_at)

  return (
    <>
      <div
        className="animate-fade-in"
        style={{
          position: 'fixed', inset: 0, zIndex: 40,
          background: 'rgba(55,55,55,0.4)',
          backdropFilter: 'blur(3px)',
        }}
        onClick={onClose}
      />
      <div
        className="animate-slide-in"
        style={{
          position: 'fixed', top: 0, right: 0, bottom: 0,
          width: 420, zIndex: 50,
          display: 'flex', flexDirection: 'column',
          background: '#ffffff',
          borderLeft: '1px solid #e4e1db',
          boxShadow: '-8px 0 40px rgba(0,0,0,0.12)',
          overflowY: 'auto',
        }}
      >
        {/* Accent */}
        <div style={{ height: 4, background: agent.color }} />

        <div style={{ padding: 28, flex: 1 }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{
                width: 52, height: 52,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 24,
                background: agent.color + '12',
                border: `2px solid ${agent.color}30`,
                borderRadius: 12,
              }}>
                {agent.icon}
              </div>
              <div>
                <h2 style={{
                  fontFamily: '"Nunito Sans", sans-serif',
                  fontWeight: 900, fontSize: 24, lineHeight: 1,
                  color: '#2a2a2a',
                }}>
                  {agent.name}
                </h2>
                <p style={{
                  fontFamily: 'Roboto, sans-serif', fontSize: 10, fontWeight: 600,
                  letterSpacing: '0.06em', textTransform: 'uppercase',
                  color: agent.color, marginTop: 5,
                }}>
                  {agent.rol}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              style={{
                padding: 8, background: 'transparent',
                border: '1px solid #e4e1db', borderRadius: 7,
                color: '#ababab', cursor: 'pointer', transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#878787'; e.currentTarget.style.color = '#373737' }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e4e1db'; e.currentTarget.style.color = '#ababab' }}
            >
              <X size={15} />
            </button>
          </div>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 24 }}>
            {[
              { label: 'Ops',     value: stat?.ops?.toLocaleString() ?? '—', icon: Cpu,      color: agent.color },
              { label: 'Último',  value: ago(stat?.last_at),                  icon: Clock,    color: '#878787'  },
              { label: 'Estado',  value: active ? 'Activo' : 'Idle',          icon: Activity, color: active ? '#76a72b' : '#ababab' },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} style={{
                padding: '12px 10px', textAlign: 'center',
                background: '#f7f6f3',
                border: '1px solid #e4e1db',
                borderRadius: 8,
              }}>
                <Icon size={13} color={color} style={{ margin: '0 auto 6px' }} />
                <p className="label-caps" style={{ marginBottom: 5 }}>{label}</p>
                <p style={{ fontFamily: '"Nunito Sans"', fontWeight: 700, fontSize: 13, color }}>{value}</p>
              </div>
            ))}
          </div>

          {/* Descripción */}
          <div style={{
            padding: '14px 16px', marginBottom: 24,
            background: '#f7f6f3',
            border: '1px solid #e4e1db',
            borderRadius: 8,
          }}>
            <p className="label-caps" style={{ marginBottom: 8 }}>Descripción</p>
            <p style={{ fontSize: 13, lineHeight: 1.65, color: '#555', fontFamily: 'Roboto, sans-serif' }}>
              {agent.desc}
            </p>
          </div>

          {/* Proceso */}
          <div>
            <p className="label-caps" style={{ marginBottom: 16 }}>Proceso de trabajo</p>
            <ol style={{ listStyle: 'none', display: 'flex', flexDirection: 'column' }}>
              {agent.proceso.map((step, i) => (
                <li key={i} style={{ display: 'flex', gap: 12 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                    <div style={{
                      width: 26, height: 26,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontFamily: '"Roboto Mono"', fontSize: 11, fontWeight: 700,
                      background: agent.color + '14',
                      border: `1px solid ${agent.color}30`,
                      borderRadius: 6,
                      color: agent.color,
                    }}>
                      {i + 1}
                    </div>
                    {i < agent.proceso.length - 1 && (
                      <div style={{
                        width: 1, flex: 1, minHeight: 16,
                        background: `linear-gradient(to bottom, ${agent.color}30, transparent)`,
                        margin: '2px 0',
                      }} />
                    )}
                  </div>
                  <p style={{
                    fontSize: 13, lineHeight: 1.5,
                    color: '#555', fontFamily: 'Roboto, sans-serif',
                    paddingBottom: 14, paddingTop: 4,
                  }}>
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
  const { data, isLoading } = useQuery({
    queryKey: ['agentes'],
    queryFn:  api.agentes,
    refetchInterval: 60_000,
  })

  const statsMap = {}
  if (Array.isArray(data)) data.forEach((a) => { statsMap[a.key ?? a.agente] = a })

  const totalOps    = Object.values(statsMap).reduce((s, a) => s + (a.ops ?? 0), 0)
  const activeCount = AGENTS.filter((a) => isActive(statsMap[a.key]?.last_at)).length

  return (
    <div style={{ padding: '32px 32px 48px' }}>

      {/* Header */}
      <div style={{ marginBottom: 28, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div>
          <p className="label-caps" style={{ marginBottom: 6 }}>Norse Intelligence · Ecosistema</p>
          <h1 style={{
            fontFamily: '"Nunito Sans", sans-serif',
            fontWeight: 900, fontSize: 34, lineHeight: 1,
            color: '#2a2a2a', letterSpacing: '-0.02em',
          }}>
            Agentes
          </h1>
        </div>

        {!isLoading && (
          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{
              padding: '7px 14px',
              background: '#f0f7e6',
              border: '1px solid #76a72b30',
              borderRadius: 8,
              display: 'flex', alignItems: 'center', gap: 7,
            }}>
              <span className="status-dot animate-pulse-dot" style={{ background: '#76a72b' }} />
              <span style={{ fontFamily: 'Roboto, sans-serif', fontSize: 12, fontWeight: 600, color: '#5c8420' }}>
                {activeCount} activos
              </span>
            </div>
            <div style={{
              padding: '7px 14px',
              background: '#ffffff',
              border: '1px solid #e4e1db',
              borderRadius: 8,
            }}>
              <span style={{ fontFamily: '"Roboto Mono"', fontSize: 12, color: '#878787' }}>
                {totalOps.toLocaleString()} ops totales
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Grid */}
      {isLoading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14 }}>
          {AGENTS.map((a) => (
            <div key={a.key} className="card" style={{ height: 150 }}>
              <div style={{ height: 3, background: a.color, borderRadius: '10px 10px 0 0', opacity: 0.3 }} />
            </div>
          ))}
        </div>
      ) : (
        <div
          className="stagger"
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14 }}
        >
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

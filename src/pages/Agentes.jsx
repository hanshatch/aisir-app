import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { X, Activity, Clock, Cpu } from 'lucide-react'
import { api } from '@/api/client'
import { ago } from '@/lib/utils'

const AGENTS = [
  { key: 'aisir',  name: 'AiSir',  rol: 'Orquestador',      color: '#86a43b',
    desc: 'Coordina todos los agentes. Recibe instrucciones vía Telegram y delega tareas.',
    proceso: ['Recibe instrucción de Hans','Identifica qué agente activa','Delega la tarea','Consolida la respuesta','Notifica vía Telegram'] },
  { key: 'huginn', name: 'Huginn', rol: 'Curador',           color: '#86a43b',
    desc: 'El cuervo del pensamiento. Genera el brief semanal con los mejores temas.',
    proceso: ['Escanea RSS (Adweek, MIT, HubSpot)','Analiza Google Trends MX','Revisa TikTok Creative Center','Genera brief con scoring por pilar'] },
  { key: 'bragi',  name: 'Bragi',  rol: 'Redactor',          color: '#86a43b',
    desc: 'Dios de la poesía. Escribe artículos SEO, newsletters y scripts.',
    proceso: ['Recibe tema aprobado','Carga reglas de Mimir','Genera contenido con GPT-4o','Aplica Brand Voice','Exporta .docx o HTML'] },
  { key: 'loki',   name: 'Loki',   rol: 'Social Media',      color: '#86a43b',
    desc: 'Maestro de la transformación. Adapta contenido por red social.',
    proceso: ['Recibe contenido base','Adapta por red (formato, extensión, tono)','Aplica estructura por red','Genera hashtags','Envía a Publer'] },
  { key: 'floki',  name: 'Floki',  rol: 'Investigación SEO', color: '#86a43b',
    desc: 'La ardilla de Yggdrasil. Investiga el top 10 y genera el brief SEO.',
    proceso: ['Recibe keyword aprobada','Consulta SerpAPI — top 10','Extrae H2/H3, PAA, brechas','Genera brief para Bragi','Audita artículo (umbral ≥80/100)'] },
  { key: 'kvasir', name: 'Kvasir', rol: 'Inspiración',       color: '#86a43b',
    desc: 'El ser más sabio. Analiza referentes y genera el brief de inspiración mensual.',
    proceso: ['Días 28-30: descarga posts referentes','Calcula engagement rate','GPT-4 Vision analiza tops','Extrae patrones ganadores','Genera brief con 10-15 ideas'] },
  { key: 'idunn',  name: 'Idunn',  rol: 'Creativo',          color: '#86a43b',
    desc: 'Diosa de la renovación. Genera prompts DALL-E y estructura carousels.',
    proceso: ['Analiza contenido a ilustrar','Define concepto visual','Genera prompt DALL-E 3','Propone estructura carousel','Sugiere paleta y estilo'] },
  { key: 'odin',   name: 'Odin',   rol: 'Comentarista',      color: '#878787',
    desc: 'Allfather. Monitorea líderes y genera comentarios de autoridad.',
    proceso: ['9 AM y 3 PM: escanea líderes','Score ≥70 activa generación','Genera 2 versiones del comentario','Hans elige en Telegram','X publica automático'] },
  { key: 'frigg',  name: 'Frigg',  rol: 'Planner editorial', color: '#86a43b',
    desc: 'Reina del Asgard. Organiza el calendario y programa en Publer.',
    proceso: ['Recibe temas aprobados','Distribuye por día y red','Asigna horarios óptimos','Programa en Publer via API','Notifica calendario a Hans'] },
  { key: 'mimir',  name: 'Mimir',  rol: 'Cerebro Hans',      color: '#86a43b',
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
  const [hovered, setHovered] = useState(false)

  return (
    <button
      onClick={() => onClick(agent)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="animate-fade-up"
      style={{
        position: 'relative',
        background: '#ffffff',
        border: '1px solid #ababab',
        borderRadius: 12,
        overflow: 'hidden',
        cursor: 'pointer',
        textAlign: 'left',
        width: '100%',
        padding: 0,
        transition: 'box-shadow 0.2s, transform 0.2s',
        boxShadow: hovered
          ? '0 8px 32px rgba(0,0,0,0.13)'
          : '0 1px 4px rgba(0,0,0,0.06)',
        transform: hovered ? 'translateY(-3px)' : 'translateY(0)',
      }}
    >
      {/* Avatar */}
      <div style={{ position: 'relative', width: '100%', paddingTop: '100%', overflow: 'hidden', background: '#000000' }}>
        <img
          src={`/avatars/${agent.key}.png`}
          alt={agent.name}
          style={{
            position: 'absolute', inset: 0,
            width: '100%', height: '100%',
            objectFit: 'contain',
            transition: 'transform 0.3s',
            transform: hovered ? 'scale(1.04)' : 'scale(1)',
          }}
        />
        {/* Status dot */}
        <div style={{
          position: 'absolute', top: 10, right: 10,
          display: 'flex', alignItems: 'center', gap: 5,
          padding: '4px 8px',
          background: active ? 'rgba(240,247,230,0.95)' : 'rgba(245,244,240,0.95)',
          border: `1px solid ${active ? '#86a43b40' : '#ababab'}`,
          borderRadius: 20,
          backdropFilter: 'blur(4px)',
        }}>
          <span style={{
            width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
            background: active ? '#86a43b' : '#ababab',
          }} />
          <span style={{
            fontFamily: 'Roboto, sans-serif', fontSize: 9, fontWeight: 600,
            color: active ? '#86a43b' : '#ababab',
          }}>
            {active ? 'activo' : 'idle'}
          </span>
        </div>
      </div>

      {/* Info */}
      <div style={{ padding: '12px 14px 14px' }}>
        <p style={{
          fontFamily: 'Roboto, sans-serif',
          fontWeight: 900, fontSize: 17, lineHeight: 1.1,
          color: '#373737', marginBottom: 3,
        }}>
          {agent.name}
        </p>
        <p style={{
          fontFamily: 'Roboto, sans-serif', fontSize: 10,
          fontWeight: 600, letterSpacing: '0.07em',
          textTransform: 'uppercase',
          color: agent.color, marginBottom: 10,
        }}>
          {agent.rol}
        </p>

        {/* Bottom bar */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          paddingTop: 10,
          borderTop: '1px solid #efeded',
        }}>
          <span style={{
            fontFamily: '"Roboto Mono", monospace', fontSize: 11,
            color: ops !== null ? agent.color : '#d4d0c9',
            fontWeight: 600,
          }}>
            {ops !== null ? `${ops.toLocaleString()} ops` : '— ops'}
          </span>
          <span style={{
            fontFamily: 'Roboto, sans-serif', fontSize: 10,
            color: '#ababab',
          }}>
            {ago(stat?.last_at)}
          </span>
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
          borderLeft: '1px solid #ababab',
          boxShadow: '-8px 0 40px rgba(0,0,0,0.12)',
          overflowY: 'auto',
        }}
      >
        {/* Top accent */}
        <div style={{ height: 4, background: agent.color, flexShrink: 0 }} />

        {/* Avatar banner */}
        <div style={{
          position: 'relative', width: '100%', paddingTop: '90%',
          background: '#000000', flexShrink: 0, overflow: 'hidden',
        }}>
          <img
            src={`/avatars/${agent.key}.png`}
            alt={agent.name}
            style={{
              position: 'absolute', inset: 0,
              width: '100%', height: '100%',
              objectFit: 'contain',
            }}
          />
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(to bottom, transparent 75%, rgba(255,255,255,0.97) 100%)',
          }} />
          {/* Name over gradient */}
          <div style={{ position: 'absolute', bottom: 16, left: 20, right: 52 }}>
            <p style={{
              fontFamily: 'Roboto, sans-serif',
              fontWeight: 900, fontSize: 28, lineHeight: 1,
              color: '#373737',
            }}>
              {agent.name}
            </p>
            <p style={{
              fontFamily: 'Roboto, sans-serif', fontSize: 10, fontWeight: 600,
              letterSpacing: '0.07em', textTransform: 'uppercase',
              color: agent.color, marginTop: 4,
            }}>
              {agent.rol}
            </p>
          </div>
          {/* Close button */}
          <button
            onClick={onClose}
            style={{
              position: 'absolute', top: 12, right: 12,
              padding: 7, background: 'rgba(255,255,255,0.9)',
              border: '1px solid #ababab', borderRadius: 7,
              color: '#ababab', cursor: 'pointer', transition: 'all 0.15s',
              backdropFilter: 'blur(4px)',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#878787'; e.currentTarget.style.color = '#373737' }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#ababab'; e.currentTarget.style.color = '#ababab' }}
          >
            <X size={15} />
          </button>
        </div>

        <div style={{ padding: '20px 24px 32px', flex: 1 }}>
          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 20 }}>
            {[
              { label: 'Ops',    value: stat?.ops?.toLocaleString() ?? '—', icon: Cpu,      color: agent.color },
              { label: 'Último', value: ago(stat?.last_at),                  icon: Clock,    color: '#878787'  },
              { label: 'Estado', value: active ? 'Activo' : 'Idle',          icon: Activity, color: active ? '#86a43b' : '#ababab' },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} style={{
                padding: '12px 10px', textAlign: 'center',
                background: '#efeded',
                border: '1px solid #ababab',
                borderRadius: 8,
              }}>
                <Icon size={13} color={color} style={{ margin: '0 auto 6px' }} />
                <p style={{
                  fontFamily: 'Roboto, sans-serif', fontSize: 9, fontWeight: 700,
                  letterSpacing: '0.08em', textTransform: 'uppercase',
                  color: '#ababab', marginBottom: 5,
                }}>
                  {label}
                </p>
                <p style={{ fontFamily: 'Roboto', fontWeight: 700, fontSize: 13, color }}>
                  {value}
                </p>
              </div>
            ))}
          </div>

          {/* Descripción */}
          <div style={{
            padding: '14px 16px', marginBottom: 20,
            background: '#efeded',
            border: '1px solid #ababab',
            borderRadius: 8,
          }}>
            <p style={{
              fontFamily: 'Roboto, sans-serif', fontSize: 9, fontWeight: 700,
              letterSpacing: '0.08em', textTransform: 'uppercase',
              color: '#ababab', marginBottom: 8,
            }}>
              Descripción
            </p>
            <p style={{ fontSize: 13, lineHeight: 1.65, color: '#555', fontFamily: 'Roboto, sans-serif' }}>
              {agent.desc}
            </p>
          </div>

          {/* Proceso */}
          <div>
            <p style={{
              fontFamily: 'Roboto, sans-serif', fontSize: 9, fontWeight: 700,
              letterSpacing: '0.08em', textTransform: 'uppercase',
              color: '#ababab', marginBottom: 16,
            }}>
              Proceso de trabajo
            </p>
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
          <p style={{
            fontFamily: 'Roboto, sans-serif', fontSize: 9, fontWeight: 700,
            letterSpacing: '0.12em', textTransform: 'uppercase',
            color: '#ababab', marginBottom: 6,
          }}>
            AISIR | Intelligence Agents
          </p>
          <h1 style={{
            fontFamily: 'Roboto, sans-serif',
            fontWeight: 900, fontSize: 34, lineHeight: 1,
            color: '#373737', letterSpacing: '-0.02em',
          }}>
            Agentes
          </h1>
        </div>

        {!isLoading && (
          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{
              padding: '7px 14px',
              background: '#efeded',
              border: '1px solid #86a43b30',
              borderRadius: 8,
              display: 'flex', alignItems: 'center', gap: 7,
            }}>
              <span className="status-dot animate-pulse-dot" style={{ background: '#86a43b' }} />
              <span style={{ fontFamily: 'Roboto, sans-serif', fontSize: 12, fontWeight: 600, color: '#86a43b' }}>
                {activeCount} activos
              </span>
            </div>
            <div style={{
              padding: '7px 14px',
              background: '#ffffff',
              border: '1px solid #ababab',
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
          {AGENTS.map((a) => (
            <div key={a.key} style={{
              background: '#ffffff', border: '1px solid #ababab',
              borderRadius: 12, overflow: 'hidden',
            }}>
              <div style={{ paddingTop: '72%', background: '#efeded', animation: 'pulse 1.5s infinite' }} />
              <div style={{ padding: '12px 14px 14px' }}>
                <div style={{ height: 14, width: '60%', background: '#efeded', borderRadius: 4, marginBottom: 8 }} />
                <div style={{ height: 10, width: '40%', background: '#efeded', borderRadius: 4 }} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div
          className="stagger"
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}
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

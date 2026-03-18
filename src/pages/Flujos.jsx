import { useState } from 'react'
import { GitBranch, Clock } from 'lucide-react'

const AGENT_COLORS = {
  aisir:     { color: '#2563eb', label: 'AiSir' },
  huginn:    { color: '#7c3aed', label: 'Huginn' },
  bragi:     { color: '#059669', label: 'Bragi' },
  loki:      { color: '#d97706', label: 'Loki' },
  ratatoskr: { color: '#0891b2', label: 'Ratatoskr' },
  kvasir:    { color: '#db2777', label: 'Kvasir' },
  idunn:     { color: '#ea580c', label: 'Idunn' },
  odin:      { color: '#dc2626', label: 'Odin' },
  frigg:     { color: '#0284c7', label: 'Frigg' },
  mimir:     { color: '#76a72b', label: 'Mimir' },
  hans:      { color: '#76a72b', label: 'Hans' },
  telegram:  { color: '#2563eb', label: 'Telegram' },
  publer:    { color: '#d97706', label: 'Publer' },
  serpapi:   { color: '#059669', label: 'SerpAPI' },
  sistema:   { color: '#878787', label: 'Sistema' },
}

const FLUJOS = [
  {
    id: 'A',
    titulo: 'Flujo A — Semana Estándar',
    descripcion: 'Ciclo semanal completo: curaduría, redacción, adaptación y programación.',
    color: '#76a72b',
    pasos: [
      { agente: 'sistema', accion: 'Lunes 6 AM — Trigger automático semanal',                                   tiempo: 'Lun 6:00'   },
      { agente: 'huginn',  accion: 'Curador genera brief con temas y scoring',                                  tiempo: '~20min'     },
      { agente: 'hans',    accion: 'Hans aprueba temas vía Telegram',                                          tiempo: 'Manual'     },
      { agente: 'bragi',   accion: 'Redactor genera contenido base (artículo/newsletter/script)',               tiempo: '~15min'     },
      { agente: 'loki',    accion: 'Social Media adapta para cada red',                                        tiempo: '~10min'     },
      { agente: 'idunn',   accion: 'Creativo genera prompts DALL-E y estructura carousel',                     tiempo: '~5min'      },
      { agente: 'hans',    accion: 'Hans revisa y aprueba/edita en Telegram',                                  tiempo: 'Manual'     },
      { agente: 'frigg',   accion: 'Planner programa en Publer con horarios óptimos',                          tiempo: '~5min'      },
      { agente: 'mimir',   accion: 'Dom 9 PM — Cerebro Hans consolida aprendizajes',                           tiempo: 'Dom 21:00'  },
    ],
  },
  {
    id: 'B',
    titulo: 'Flujo B — Modo Momento',
    descripcion: 'Publicación on-demand desde foto o audio enviado por Telegram.',
    color: '#2563eb',
    pasos: [
      { agente: 'hans',   accion: 'Hans envía foto o audio a Telegram',                                        tiempo: 'On-demand'  },
      { agente: 'aisir',  accion: 'Orquestador detecta media y activa Modo Momento',                           tiempo: '<1s'        },
      { agente: 'bragi',  accion: 'Vision (GPT-4o) analiza la foto O Whisper transcribe audio',                tiempo: '~5s'        },
      { agente: 'loki',   accion: 'Social Media genera posts para 4 redes simultáneamente',                    tiempo: '~10min'     },
      { agente: 'hans',   accion: 'Preview en Telegram — Hans aprueba por red',                                tiempo: 'Manual'     },
      { agente: 'publer', accion: 'LinkedIn/IG/FB → Publer; X → API directa',                                 tiempo: '<30s'       },
    ],
  },
  {
    id: 'C',
    titulo: 'Flujo C — Comentario de Autoridad',
    descripcion: 'Monitoreo de líderes y generación de comentarios estratégicos.',
    color: '#dc2626',
    pasos: [
      { agente: 'sistema', accion: '9 AM y 3 PM — Trigger automático Odin',                                   tiempo: '2x/día'     },
      { agente: 'odin',    accion: 'Escanea posts recientes de líderes monitoreados',                          tiempo: '~2min'      },
      { agente: 'odin',    accion: 'Score ≥70 activa generación de 2 versiones',                               tiempo: '~5min'      },
      { agente: 'hans',    accion: 'Hans elige versión preferida vía Telegram',                                tiempo: 'Manual'     },
      { agente: 'publer',  accion: 'X → publica automático; LinkedIn → copia + URL',                          tiempo: '<10s'       },
    ],
  },
  {
    id: 'E',
    titulo: 'Flujo E — Artículo SM',
    descripcion: 'Producción quincenal: artículo SEO para Soy.Marketing + distribución de piezas por red.',
    color: '#059669',
    pasos: [
      { agente: 'sistema',   accion: '/proponer_articulo — Jueves 6 PM auto o Hans lo dispara manualmente',   tiempo: 'Jueves'     },
      { agente: 'ratatoskr', accion: 'Propone 5 temas SEO con keyword, dificultad y justificación (SerpAPI)', tiempo: '~40-60s'    },
      { agente: 'hans',      accion: 'Hans elige el tema en Telegram (botón de selección)',                   tiempo: 'Manual'     },
      { agente: 'ratatoskr', accion: '/articulo [tema_id] — Investiga top 10 SERP + PAA + brechas de contenido', tiempo: '~15min' },
      { agente: 'bragi',     accion: 'Redacta artículo 2000+ palabras con voz de Hans y Brand Voice',        tiempo: '~20min'     },
      { agente: 'ratatoskr', accion: 'Audita artículo — score ≥80/100 en 10 criterios (SEO, EEAT, voz…)',    tiempo: '~5min'      },
      { agente: 'hans',      accion: 'Recibe artículo + score en Telegram — aprueba o rechaza',              tiempo: 'Manual'     },
      { agente: 'sistema',   accion: 'Artículo aprobado se sube a Google Drive (.docx)',                      tiempo: '<10s'       },
      { agente: 'hans',      accion: '/articulo [URL] — Hans publica en Soy.Marketing y envía la URL',       tiempo: 'Manual'     },
      { agente: 'bragi',     accion: 'Genera distribución: post LinkedIn, Facebook, X + guión video + WhatsApp', tiempo: '~10min' },
      { agente: 'hans',      accion: 'Hans aprueba cada pieza de distribución en Telegram',                  tiempo: 'Manual'     },
      { agente: 'frigg',     accion: 'Programa piezas aprobadas en Publer con horarios óptimos',             tiempo: '~5min'      },
    ],
  },
  {
    id: 'W',
    titulo: 'Flujo W — Artículo HH',
    descripcion: 'Publicación mensual en hanshatch.com (WordPress) con guión de video y distribución por redes.',
    color: '#7c3aed',
    pasos: [
      { agente: 'sistema',   accion: '/blog [keyword] — Día 1 del mes auto o Hans lo dispara manualmente',   tiempo: 'Mensual'    },
      { agente: 'ratatoskr', accion: 'Investiga top 10 SERP para la keyword seleccionada',                   tiempo: '~15min'     },
      { agente: 'bragi',     accion: 'Redacta artículo blog con HTML listo para WordPress + excerpt + SEO',  tiempo: '~20min'     },
      { agente: 'sistema',   accion: 'Sube borrador a WordPress (draft) — Hans recibe link de edición',      tiempo: '<10s'       },
      { agente: 'bragi',     accion: 'Genera guión de video basado en el artículo → sube a Google Drive',    tiempo: '~10min'     },
      { agente: 'hans',      accion: 'Hans revisa borrador en WordPress, edita y publica manualmente',       tiempo: 'Manual'     },
      { agente: 'sistema',   accion: 'Monitor detecta publicación → dispara generación de posts',            tiempo: 'Auto'       },
      { agente: 'bragi',     accion: 'Genera posts de distribución por red (LinkedIn, IG, X, WhatsApp)',     tiempo: '~10min'     },
      { agente: 'hans',      accion: 'Hans aprueba posts de distribución en Telegram',                       tiempo: 'Manual'     },
      { agente: 'frigg',     accion: 'Programa posts aprobados en Publer',                                   tiempo: '~5min'      },
    ],
  },
  {
    id: 'I',
    titulo: 'Flujo I — Inspiración Mensual',
    descripcion: 'Análisis de cuentas referentes y brief de inspiración para el mes siguiente.',
    color: '#db2777',
    pasos: [
      { agente: 'sistema', accion: 'Días 28-30 del mes — Trigger automático',                                 tiempo: 'Mensual'    },
      { agente: 'kvasir',  accion: 'Descarga los últimos 30 posts de cuentas activas',                        tiempo: '~10min'     },
      { agente: 'kvasir',  accion: 'Calcula engagement rate por cuenta y red',                                tiempo: '~5min'      },
      { agente: 'kvasir',  accion: 'GPT-4o analiza tops — identifica patrones ganadores',                     tiempo: '~10min'     },
      { agente: 'kvasir',  accion: 'Genera brief con 10-15 ideas adaptadas a Hans',                           tiempo: '~5min'      },
      { agente: 'hans',    accion: 'Hans recibe brief mensual en Telegram',                                   tiempo: 'Auto'       },
    ],
  },
]

function StepItem({ step, index, isLast, flowColor }) {
  const agent = AGENT_COLORS[step.agente] ?? { color: '#878787', label: step.agente }

  return (
    <li style={{ display: 'flex', gap: 14 }}>
      {/* Timeline */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0, width: 28 }}>
        <div style={{
          width: 28, height: 28,
          borderRadius: '50%',
          background: agent.color + '15',
          border: `2px solid ${agent.color}`,
          color: agent.color,
          fontFamily: '"Roboto Mono", monospace',
          fontSize: 10, fontWeight: 700,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0, zIndex: 1,
        }}>
          {index + 1}
        </div>
        {!isLast && (
          <div style={{
            width: 2, flex: 1, minHeight: 16,
            background: `linear-gradient(to bottom, ${flowColor}35, ${flowColor}08)`,
            margin: '3px 0',
          }} />
        )}
      </div>

      {/* Content */}
      <div style={{ flex: 1, paddingBottom: 18, paddingTop: 3 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
          <span style={{
            fontFamily: '"Nunito Sans", sans-serif', fontWeight: 700, fontSize: 11,
            padding: '2px 9px',
            background: agent.color + '12',
            color: agent.color,
            border: `1px solid ${agent.color}30`,
            borderRadius: 5,
          }}>
            {agent.label}
          </span>
          <span style={{
            display: 'flex', alignItems: 'center', gap: 4,
            fontFamily: '"Roboto Mono", monospace', fontSize: 10,
            color: '#ababab',
          }}>
            <Clock size={9} />
            {step.tiempo}
          </span>
        </div>
        <p style={{
          fontFamily: 'Roboto, sans-serif', fontSize: 13, lineHeight: 1.5,
          color: '#2a2a2a',
        }}>
          {step.accion}
        </p>
      </div>
    </li>
  )
}

export default function Flujos() {
  const [selected, setSelected] = useState(FLUJOS[0])

  return (
    <div style={{ display: 'flex', height: '100%' }}>

      {/* Sidebar */}
      <div style={{
        width: 230, flexShrink: 0,
        background: '#ffffff',
        borderRight: '1px solid #e4e1db',
        overflowY: 'auto',
        display: 'flex', flexDirection: 'column',
      }}>
        <div style={{ padding: '24px 16px 12px' }}>
          <p className="label-caps" style={{ marginBottom: 14 }}>Flujos del sistema</p>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 2 }}>
            {FLUJOS.map((f) => {
              const isActive = selected?.id === f.id
              return (
                <li key={f.id}>
                  <button
                    onClick={() => setSelected(f)}
                    style={{
                      width: '100%', textAlign: 'left',
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '9px 12px',
                      borderRadius: 7,
                      background: isActive ? f.color + '10' : 'transparent',
                      boxShadow: isActive ? `inset 3px 0 0 ${f.color}` : 'none',
                      border: 'none', cursor: 'pointer',
                      transition: 'all 0.12s',
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) e.currentTarget.style.background = '#f7f6f3'
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) e.currentTarget.style.background = 'transparent'
                    }}
                  >
                    <span style={{
                      fontFamily: '"Roboto Mono", monospace', fontSize: 10, fontWeight: 700,
                      padding: '2px 6px',
                      background: isActive ? f.color + '18' : '#f7f6f3',
                      color: isActive ? f.color : '#878787',
                      border: `1px solid ${isActive ? f.color + '40' : '#e4e1db'}`,
                      borderRadius: 4,
                    }}>
                      {f.id}
                    </span>
                    <span style={{
                      fontFamily: 'Roboto, sans-serif', fontSize: 12, fontWeight: isActive ? 600 : 400,
                      color: isActive ? '#2a2a2a' : '#878787',
                      lineHeight: 1.3,
                    }}>
                      {f.titulo.split('—')[1]?.trim() ?? f.titulo}
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      </div>

      {/* Detail */}
      {selected && (
        <div style={{ flex: 1, overflowY: 'auto', padding: '32px 32px 40px' }}>

          {/* Header */}
          <div style={{ marginBottom: 28 }}>
            <p className="label-caps" style={{ marginBottom: 8 }}>Sistema · Flujos</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
              <div style={{
                width: 8, height: 8, borderRadius: '50%',
                background: selected.color, flexShrink: 0,
              }} />
              <h1 style={{
                fontFamily: '"Nunito Sans", sans-serif', fontWeight: 900,
                fontSize: 28, color: '#2a2a2a', letterSpacing: '-0.02em',
              }}>
                {selected.titulo}
              </h1>
            </div>
            <p style={{
              fontFamily: 'Roboto, sans-serif', fontSize: 14,
              color: '#878787', lineHeight: 1.5,
              marginLeft: 20,
            }}>
              {selected.descripcion}
            </p>
          </div>

          {/* Steps card */}
          <div className="card shadow-card" style={{ padding: '20px 24px 8px' }}>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              marginBottom: 20,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <GitBranch size={14} style={{ color: selected.color }} />
                <span style={{
                  fontFamily: '"Nunito Sans", sans-serif', fontWeight: 700, fontSize: 13,
                  color: '#2a2a2a',
                }}>
                  Etapas del flujo
                </span>
              </div>
              <span style={{
                fontFamily: '"Roboto Mono", monospace', fontSize: 10,
                padding: '3px 9px',
                background: selected.color + '10',
                color: selected.color,
                border: `1px solid ${selected.color}30`,
                borderRadius: 5,
                fontWeight: 600,
              }}>
                {selected.pasos.length} pasos
              </span>
            </div>

            <ol style={{ listStyle: 'none' }}>
              {selected.pasos.map((paso, i) => (
                <StepItem
                  key={i}
                  step={paso}
                  index={i}
                  isLast={i === selected.pasos.length - 1}
                  flowColor={selected.color}
                />
              ))}
            </ol>
          </div>
        </div>
      )}
    </div>
  )
}

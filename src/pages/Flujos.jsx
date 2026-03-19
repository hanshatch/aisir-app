import { useState } from 'react'
import { GitBranch, Clock } from 'lucide-react'

const AGENT_COLORS = {
  aisir:     { color: '#86a43b', label: 'AiSir' },
  huginn:    { color: '#86a43b', label: 'Huginn' },
  bragi:     { color: '#86a43b', label: 'Bragi' },
  loki:      { color: '#86a43b', label: 'Loki' },
  floki: { color: '#86a43b', label: 'Floki' },
  kvasir:    { color: '#86a43b', label: 'Kvasir' },
  idunn:     { color: '#86a43b', label: 'Idunn' },
  odin:      { color: '#878787', label: 'Odin' },
  frigg:     { color: '#86a43b', label: 'Frigg' },
  mimir:     { color: '#86a43b', label: 'Mimir' },
  hans:      { color: '#86a43b', label: 'Hans' },
  telegram:  { color: '#86a43b', label: 'Telegram' },
  publer:    { color: '#86a43b', label: 'Publer' },
  serpapi:   { color: '#86a43b', label: 'SerpAPI' },
  sistema:   { color: '#878787', label: 'Sistema' },
}

const FLUJOS = [
  {
    id: 'A',
    titulo: 'Flujo A — Semana Estándar',
    descripcion: 'Ciclo semanal completo: curaduría, redacción, adaptación y programación.',
    color: '#86a43b',
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
    color: '#86a43b',
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
    color: '#878787',
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
    color: '#86a43b',
    pasos: [
      { agente: 'sistema',   accion: '/proponer_articulo — Jueves 6 PM auto o Hans lo dispara manualmente',   tiempo: 'Jueves'     },
      { agente: 'floki', accion: 'Propone 5 temas SEO con keyword, dificultad y justificación (SerpAPI)', tiempo: '~40-60s'    },
      { agente: 'hans',      accion: 'Hans elige el tema en Telegram (botón de selección)',                   tiempo: 'Manual'     },
      { agente: 'floki', accion: '/articulo [tema_id] — Investiga top 10 SERP + PAA + brechas de contenido', tiempo: '~15min' },
      { agente: 'bragi',     accion: 'Redacta artículo 2000+ palabras con voz de Hans y Brand Voice',        tiempo: '~20min'     },
      { agente: 'floki', accion: 'Audita artículo — score ≥80/100 en 10 criterios (SEO, EEAT, voz…)',    tiempo: '~5min'      },
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
    color: '#86a43b',
    pasos: [
      { agente: 'sistema',   accion: '/blog [keyword] — Día 1 del mes auto o Hans lo dispara manualmente',   tiempo: 'Mensual'    },
      { agente: 'floki', accion: 'Investiga top 10 SERP para la keyword seleccionada',                   tiempo: '~15min'     },
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
    id: 'K',
    titulo: 'Flujo K — Columnas SM / HH',
    descripcion: 'Detección automática de columnas publicadas en Soy.Marketing y hanshatch.com, generación de distribución y re-promoción futura.',
    color: '#86a43b',
    pasos: [
      { agente: 'sistema', accion: 'Cron cada 4 horas — revisa RSS/WordPress de SM y HH',           tiempo: 'Cada 4h'   },
      { agente: 'floki',   accion: 'Detecta columna nueva de Hans · guarda en blog_articulos',       tiempo: 'Auto'      },
      { agente: 'hans',    accion: 'Telegram: "Columna publicada: [título]" + botón Generar',         tiempo: 'Notif'     },
      { agente: 'hans',    accion: 'Hans da clic en Telegram (o desde dashboard)',                   tiempo: 'Manual'    },
      { agente: 'bragi',   accion: 'Genera 5 piezas: LinkedIn · Facebook · X · Threads · Guión',     tiempo: '~30-60s'   },
      { agente: 'hans',    accion: 'Cada pieza llega a Telegram con [Aprobar] [Rechazar]',           tiempo: 'Manual'    },
      { agente: 'frigg',   accion: 'Piezas aprobadas → Publer para programar',                       tiempo: 'Auto'      },
      { agente: 'sistema', accion: 'Columna queda en historial para re-promoción futura',            tiempo: 'Siempre'   },
    ],
  },
  {
    id: 'I',
    titulo: 'Flujo I — Inspiración Kvasir',
    descripcion: 'Scraping, análisis visual, scoring y brief mensual de cuentas referentes de Instagram.',
    color: '#86a43b',
    pasos: [
      { agente: 'sistema', accion: 'Paso 1 — Lunes 6:30 AM (auto) o POST /inspiracion/scrape (manual)',       tiempo: 'Lun 6:30'   },
      { agente: 'kvasir',  accion: 'Lee inspiracion_cuentas · llama Apify por cada cuenta activa',            tiempo: '~10min'     },
      { agente: 'kvasir',  accion: 'Guarda posts en inspiracion_posts: caption, likes, media, estado=pendiente', tiempo: '~2min'   },
      { agente: 'sistema', accion: 'Paso 2 — Lunes 7:30 AM · Extracción visual de posts sin texto_visual',    tiempo: 'Lun 7:30'   },
      { agente: 'kvasir',  accion: 'Imagen → GPT-4o Vision extrae texto visible del visual',                  tiempo: '~5s/post'   },
      { agente: 'kvasir',  accion: 'Video → ffmpeg extrae audio → Whisper transcribe',                        tiempo: '~30s/post'  },
      { agente: 'kvasir',  accion: 'Resultado guardado en texto_visual en BD',                                tiempo: 'Auto'       },
      { agente: 'sistema', accion: 'Paso 3 — Lunes 8:00 AM · Análisis y scoring con GPT-4o',                  tiempo: 'Lun 8:00'   },
      { agente: 'kvasir',  accion: 'GPT-4o analiza como Hans: hook, formato, tema, por_qué',                  tiempo: '~5s/post'   },
      { agente: 'kvasir',  accion: 'Asigna score 0-100 (relevancia pilares + hook + engagement)',              tiempo: 'Auto'       },
      { agente: 'kvasir',  accion: 'Actualiza estado = analizado en BD',                                      tiempo: 'Auto'       },
      { agente: 'sistema', accion: 'Paso 4 — Día 1 de cada mes · Brief mensual',                              tiempo: 'Mensual'    },
      { agente: 'kvasir',  accion: 'Toma posts top-score del mes · GPT-4o genera brief JSON',                 tiempo: '~10min'     },
      { agente: 'kvasir',  accion: 'Brief: patrones_formato, temas_engagement, recomendaciones, resumen',     tiempo: 'Auto'       },
      { agente: 'kvasir',  accion: 'Guarda en inspiracion_briefs · envía resumen por Telegram',               tiempo: 'Auto'       },
      { agente: 'hans',    accion: 'Paso 5 — Frontend consume: posts analizados + brief desde app-aisir',     tiempo: 'On-demand'  },
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
            fontFamily: 'Roboto, sans-serif', fontWeight: 700, fontSize: 11,
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
          color: '#373737',
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
        borderRight: '1px solid #ababab',
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
                      if (!isActive) e.currentTarget.style.background = '#efeded'
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) e.currentTarget.style.background = 'transparent'
                    }}
                  >
                    <span style={{
                      fontFamily: '"Roboto Mono", monospace', fontSize: 10, fontWeight: 700,
                      padding: '2px 6px',
                      background: isActive ? f.color + '18' : '#efeded',
                      color: isActive ? f.color : '#878787',
                      border: `1px solid ${isActive ? f.color + '40' : '#ababab'}`,
                      borderRadius: 4,
                    }}>
                      {f.id}
                    </span>
                    <span style={{
                      fontFamily: 'Roboto, sans-serif', fontSize: 12, fontWeight: isActive ? 600 : 400,
                      color: isActive ? '#373737' : '#878787',
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
                fontFamily: 'Roboto, sans-serif', fontWeight: 900,
                fontSize: 28, color: '#373737', letterSpacing: '-0.02em',
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
                  fontFamily: 'Roboto, sans-serif', fontWeight: 700, fontSize: 13,
                  color: '#373737',
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

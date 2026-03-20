import { useState, useRef, useCallback, useEffect, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '../api/client'
import {
  GitBranch, Clock, User, Send, CalendarCheck, Search, FileText,
  Share2, Palette, CalendarDays, Brain, Bot, Eye, Sparkles,
  TrendingUp, Zap,
} from 'lucide-react'

const AGENT_COLORS = {
  aisir:    { color: '#4f9eff', label: 'AiSir',    icon: Bot         },
  huginn:   { color: '#a78bfa', label: 'Huginn',   icon: Search      },
  bragi:    { color: '#34d399', label: 'Bragi',    icon: FileText    },
  loki:     { color: '#f59e0b', label: 'Loki',     icon: Share2      },
  floki:    { color: '#10b981', label: 'Floki',    icon: TrendingUp  },
  kvasir:   { color: '#e879f9', label: 'Kvasir',   icon: Sparkles    },
  idunn:    { color: '#fb923c', label: 'Idunn',    icon: Palette     },
  odin:     { color: '#f43f5e', label: 'Odin',     icon: Eye         },
  frigg:    { color: '#06b6d4', label: 'Frigg',    icon: CalendarDays},
  mimir:    { color: '#8b5cf6', label: 'Mimir',    icon: Brain       },
  hans:     { color: '#373737', label: 'Hans',     icon: User        },
  telegram: { color: '#2AABEE', label: 'Telegram', icon: Send        },
  publer:   { color: '#5ba4cf', label: 'Publer',   icon: CalendarCheck},
  serpapi:  { color: '#f59e0b', label: 'SerpAPI',  icon: Search      },
  sistema:  { color: '#878787', label: 'Sistema',  icon: Zap         },
}

const FLUJOS = [
  {
    id: 'A',
    titulo: 'Flujo A — Semana Estándar',
    descripcion: 'Ciclo semanal completo: curaduría, redacción, adaptación y programación.',
    color: '#86a43b',
    pasos: [
      { agente: 'sistema', accion: 'Trigger semanal automático',          tiempo: 'Lun 6:00'  },
      { agente: 'huginn',  accion: 'Genera brief con temas y scoring',    tiempo: '~20min'    },
      { agente: 'hans',    accion: 'Aprueba temas vía Telegram',          tiempo: 'Manual'    },
      { agente: 'bragi',   accion: 'Genera contenido base (artículo / newsletter / script)', tiempo: '~15min' },
      {
        type: 'parallel',
        branches: [
          { agente: 'loki',  accion: 'Adapta contenido para cada red social', tiempo: '~10min' },
          { agente: 'idunn', accion: 'Genera prompts DALL-E y carousel',      tiempo: '~5min'  },
        ],
      },
      { agente: 'hans',  accion: 'Revisa y aprueba/edita en Telegram',   tiempo: 'Manual'    },
      { agente: 'frigg', accion: 'Programa en Publer con horarios óptimos', tiempo: '~5min'  },
      { agente: 'mimir', accion: 'Consolida aprendizajes de la semana',   tiempo: 'Dom 21:00' },
    ],
  },
  {
    id: 'B',
    titulo: 'Flujo B — Modo Momento',
    descripcion: 'Publicación on-demand desde foto o audio enviado por Telegram.',
    color: '#86a43b',
    pasos: [
      { agente: 'hans',  accion: 'Envía foto o audio por Telegram',       tiempo: 'On-demand' },
      { agente: 'aisir', accion: 'Detecta media y activa Modo Momento',   tiempo: '<1s'       },
      {
        type: 'parallel',
        branches: [
          { agente: 'bragi', accion: 'GPT-4o Vision analiza la foto',     tiempo: '~5s'  },
          { agente: 'bragi', accion: 'Whisper transcribe el audio',       tiempo: '~10s' },
        ],
      },
      {
        type: 'parallel',
        branches: [
          { agente: 'loki', accion: 'Genera post LinkedIn',               tiempo: '~3min' },
          { agente: 'loki', accion: 'Genera post Instagram',              tiempo: '~3min' },
          { agente: 'loki', accion: 'Genera post X (Twitter)',            tiempo: '~2min' },
          { agente: 'loki', accion: 'Genera post Facebook',               tiempo: '~2min' },
        ],
      },
      { agente: 'hans', accion: 'Revisa preview por red y aprueba',       tiempo: 'Manual' },
      {
        type: 'parallel',
        branches: [
          { agente: 'publer', accion: 'Programa LinkedIn + IG + FB',      tiempo: '<10s' },
          { agente: 'sistema', accion: 'X → publica vía API directa',     tiempo: '<5s'  },
        ],
      },
    ],
  },
  {
    id: 'C',
    titulo: 'Flujo C — Comentario de Autoridad',
    descripcion: 'Monitoreo de líderes y generación de comentarios estratégicos.',
    color: '#878787',
    pasos: [
      { agente: 'sistema', accion: 'Trigger automático 9 AM y 3 PM',     tiempo: '2x/día'  },
      { agente: 'odin',    accion: 'Escanea posts de líderes monitoreados', tiempo: '~2min' },
      { agente: 'odin',    accion: 'Score ≥70 → activa generación',       tiempo: '~1min'   },
      {
        type: 'parallel',
        branches: [
          { agente: 'odin', accion: 'Genera versión A — directa / confrontacional', tiempo: '~3min' },
          { agente: 'odin', accion: 'Genera versión B — constructiva / autoridad',  tiempo: '~3min' },
        ],
      },
      { agente: 'hans', accion: 'Elige versión preferida en Telegram',    tiempo: 'Manual' },
      {
        type: 'parallel',
        branches: [
          { agente: 'sistema', accion: 'X → publica automáticamente',    tiempo: '<5s'   },
          { agente: 'hans',    accion: 'LinkedIn → copia texto + abre URL', tiempo: 'Manual' },
        ],
      },
    ],
  },
  {
    id: 'E',
    titulo: 'Flujo E — Artículo SM',
    descripcion: 'Producción quincenal: artículo SEO para Soy.Marketing + distribución de piezas por red.',
    color: '#86a43b',
    pasos: [
      { agente: 'sistema', accion: 'Trigger /proponer_articulo (Jueves 6 PM o manual)', tiempo: 'Jueves' },
      { agente: 'floki',   accion: 'Propone 5 temas SEO con keyword y scoring',  tiempo: '~40-60s' },
      { agente: 'hans',    accion: 'Elige tema en Telegram',                      tiempo: 'Manual'  },
      {
        type: 'parallel',
        branches: [
          { agente: 'floki', accion: 'Investiga top 10 SERP + PAA',              tiempo: '~10min' },
          { agente: 'floki', accion: 'Detecta brechas de contenido y keywords',  tiempo: '~5min'  },
        ],
      },
      { agente: 'bragi', accion: 'Redacta artículo 2000+ palabras',              tiempo: '~20min' },
      { agente: 'floki', accion: 'Audita artículo — score ≥80/100',              tiempo: '~5min'  },
      { agente: 'hans',  accion: 'Aprueba artículo + score en Telegram',         tiempo: 'Manual' },
      {
        type: 'parallel',
        branches: [
          { agente: 'sistema', accion: 'Sube .docx a Google Drive',             tiempo: '<10s'  },
          { agente: 'hans',    accion: 'Publica en Soy.Marketing y envía URL',  tiempo: 'Manual' },
        ],
      },
      {
        type: 'parallel',
        branches: [
          { agente: 'bragi', accion: 'Post LinkedIn',                            tiempo: '~2min' },
          { agente: 'bragi', accion: 'Post Facebook',                            tiempo: '~2min' },
          { agente: 'bragi', accion: 'Post X',                                   tiempo: '~1min' },
          { agente: 'bragi', accion: 'Guión video + WhatsApp',                   tiempo: '~3min' },
        ],
      },
      { agente: 'hans',  accion: 'Aprueba cada pieza en Telegram',               tiempo: 'Manual' },
      { agente: 'frigg', accion: 'Programa piezas aprobadas en Publer',          tiempo: '~5min'  },
    ],
  },
  {
    id: 'W',
    titulo: 'Flujo W — Artículo HH',
    descripcion: 'Publicación mensual en hanshatch.com (WordPress) con guión de video y distribución por redes.',
    color: '#86a43b',
    pasos: [
      { agente: 'sistema', accion: 'Trigger /blog [keyword] — Día 1 del mes o manual', tiempo: 'Mensual' },
      { agente: 'floki',   accion: 'Investiga top 10 SERP para la keyword',     tiempo: '~15min'  },
      {
        type: 'parallel',
        branches: [
          { agente: 'bragi', accion: 'Redacta artículo HTML para WordPress',     tiempo: '~20min' },
          { agente: 'bragi', accion: 'Genera guión de video del artículo',       tiempo: '~10min' },
        ],
      },
      { agente: 'sistema', accion: 'Sube borrador a WordPress — Hans recibe link', tiempo: '<10s' },
      { agente: 'hans',    accion: 'Edita borrador y publica en WordPress',      tiempo: 'Manual'  },
      { agente: 'sistema', accion: 'Monitor detecta publicación → dispara posts', tiempo: 'Auto'  },
      {
        type: 'parallel',
        branches: [
          { agente: 'bragi', accion: 'Post LinkedIn',                             tiempo: '~2min' },
          { agente: 'bragi', accion: 'Post Instagram',                            tiempo: '~2min' },
          { agente: 'bragi', accion: 'Post X',                                    tiempo: '~1min' },
          { agente: 'bragi', accion: 'Mensaje WhatsApp',                          tiempo: '~1min' },
        ],
      },
      { agente: 'hans',  accion: 'Aprueba posts en Telegram',                    tiempo: 'Manual' },
      { agente: 'frigg', accion: 'Programa posts aprobados en Publer',           tiempo: '~5min'  },
    ],
  },
  {
    id: 'K',
    titulo: 'Flujo K — Columnas SM / HH',
    descripcion: 'Detección automática de columnas publicadas en Soy.Marketing y hanshatch.com, generación de distribución y re-promoción futura.',
    color: '#86a43b',
    pasos: [
      {
        type: 'parallel',
        branches: [
          { agente: 'sistema', accion: 'Cron cada 4h — RSS Soy.Marketing', tiempo: 'Cada 4h' },
          { agente: 'sistema', accion: 'Cron cada 4h — RSS hanshatch.com', tiempo: 'Cada 4h' },
        ],
      },
      { agente: 'floki', accion: 'Detecta columna nueva y guarda en BD',   tiempo: 'Auto'    },
      { agente: 'hans',  accion: 'Notificación + botón Generar en Telegram', tiempo: 'Notif' },
      { agente: 'hans',  accion: 'Confirma generación (Telegram o dashboard)', tiempo: 'Manual' },
      {
        type: 'parallel',
        branches: [
          { agente: 'bragi', accion: 'Post LinkedIn',                       tiempo: '~2min' },
          { agente: 'bragi', accion: 'Post Facebook',                       tiempo: '~2min' },
          { agente: 'bragi', accion: 'Post X',                              tiempo: '~1min' },
          { agente: 'bragi', accion: 'Post Threads',                        tiempo: '~1min' },
          { agente: 'bragi', accion: 'Guión / script',                      tiempo: '~3min' },
        ],
      },
      { agente: 'hans',   accion: 'Aprueba/rechaza cada pieza en Telegram', tiempo: 'Manual'   },
      { agente: 'frigg',  accion: 'Piezas aprobadas → Publer',              tiempo: 'Auto'     },
      { agente: 'sistema', accion: 'Guarda en historial para re-promoción', tiempo: 'Siempre'  },
    ],
  },
  {
    id: 'I',
    titulo: 'Flujo I — Inspiración Kvasir',
    descripcion: 'Scraping, análisis visual, scoring y brief mensual de cuentas referentes de Instagram.',
    color: '#86a43b',
    pasos: [
      { agente: 'sistema', accion: 'Trigger Lunes 6:30 AM o POST /inspiracion/scrape', tiempo: 'Lun 6:30' },
      {
        type: 'parallel',
        branches: [
          { agente: 'kvasir', accion: 'Scraping cuenta 1 vía Apify', tiempo: '~10min' },
          { agente: 'kvasir', accion: 'Scraping cuenta 2 vía Apify', tiempo: '~10min' },
          { agente: 'kvasir', accion: 'Scraping cuenta N vía Apify', tiempo: '~10min' },
        ],
      },
      { agente: 'kvasir',  accion: 'Guarda posts en BD (estado=pendiente)',  tiempo: '~2min'    },
      { agente: 'sistema', accion: 'Trigger Lunes 7:30 AM — extracción visual', tiempo: 'Lun 7:30' },
      {
        type: 'parallel',
        branches: [
          { agente: 'kvasir', accion: 'Imagen → GPT-4o Vision extrae texto visible', tiempo: '~5s/post'  },
          { agente: 'kvasir', accion: 'Video → ffmpeg + Whisper transcribe audio',   tiempo: '~30s/post' },
        ],
      },
      { agente: 'kvasir',  accion: 'Guarda texto_visual en BD',              tiempo: 'Auto'     },
      { agente: 'sistema', accion: 'Trigger Lunes 8:00 AM — análisis y scoring', tiempo: 'Lun 8:00' },
      {
        type: 'parallel',
        branches: [
          { agente: 'kvasir', accion: 'Analiza hook, formato y tema (GPT-4o)', tiempo: '~5s/post' },
          { agente: 'kvasir', accion: 'Asigna score 0-100 por relevancia',     tiempo: '~2s/post' },
        ],
      },
      { agente: 'kvasir',  accion: 'Actualiza estado=analizado en BD',       tiempo: 'Auto'     },
      { agente: 'sistema', accion: 'Trigger Día 1 del mes — brief mensual',  tiempo: 'Mensual'  },
      {
        type: 'parallel',
        branches: [
          { agente: 'kvasir', accion: 'Genera brief: tendencias y formatos',    tiempo: '~5min' },
          { agente: 'kvasir', accion: 'Genera recomendaciones para Hans',       tiempo: '~5min' },
        ],
      },
      { agente: 'kvasir', accion: 'Guarda brief en BD · envía resumen por Telegram', tiempo: 'Auto' },
      { agente: 'hans',   accion: 'Consulta posts + brief desde app-aisir',   tiempo: 'On-demand' },
    ],
  },
]

// ─── Diagrama de nodos ────────────────────────────────────────────────────────

const AVATAR_AGENTS = new Set(['aisir', 'huginn', 'bragi', 'loki', 'floki', 'kvasir', 'idunn', 'odin', 'frigg', 'mimir'])

const NODE_W = 110
const NODE_H = 134
const GAP_Y  = 10   // gap entre ramas paralelas
const FW     = 30   // ancho del SVG fork/join

function NodeCard({ paso, stepNum }) {
  const agent = AGENT_COLORS[paso.agente] ?? { color: '#878787', label: paso.agente, icon: Zap }
  const Icon  = agent.icon
  return (
    <div style={{
      width: NODE_W, height: NODE_H,
      background: '#ffffff',
      border: '1px solid #e4e1db',
      borderRadius: 10,
      padding: '12px 10px 10px',
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7,
      boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
      flexShrink: 0, position: 'relative',
    }}>
      {/* Número de paso */}
      {stepNum !== undefined && (
        <div style={{
          position: 'absolute', top: -8, right: -8,
          width: 18, height: 18, borderRadius: '50%',
          background: agent.color,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: '"Roboto Mono", monospace', fontSize: 9, fontWeight: 700,
          color: '#ffffff',
          boxShadow: '0 1px 4px rgba(0,0,0,0.18)',
          zIndex: 2,
        }}>
          {stepNum}
        </div>
      )}

      {AVATAR_AGENTS.has(paso.agente) ? (
        <img
          src={`/avatars/${paso.agente}.png`}
          alt={agent.label}
          style={{ width: 42, height: 42, borderRadius: 9, objectFit: 'cover', flexShrink: 0 }}
        />
      ) : (
        <div style={{
          width: 42, height: 42, borderRadius: 9,
          background: agent.color + '18',
          border: `1.5px solid ${agent.color}40`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <Icon size={19} style={{ color: agent.color }} strokeWidth={1.8} />
        </div>
      )}
      <span style={{
        fontFamily: 'Roboto, sans-serif', fontSize: 10, fontWeight: 700,
        color: agent.color, textAlign: 'center',
      }}>
        {agent.label}
      </span>
      {/* Texto resumido — 1 línea, el detalle está abajo */}
      <p style={{
        fontFamily: 'Roboto, sans-serif', fontSize: 9, color: '#878787',
        lineHeight: 1.35, textAlign: 'center', margin: 0, flex: 1,
        display: '-webkit-box', WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical', overflow: 'hidden',
      }}>
        {paso.accion}
      </p>
      <span style={{
        fontFamily: '"Roboto Mono", monospace', fontSize: 8,
        color: '#ababab', background: '#f5f3f0',
        padding: '2px 6px', borderRadius: 4, whiteSpace: 'nowrap',
      }}>
        {paso.tiempo}
      </span>
    </div>
  )
}

function Connector() {
  return (
    <div style={{ width: 36, flexShrink: 0, display: 'flex', alignItems: 'center' }}>
      <svg width="36" height="16" viewBox="0 0 36 16" fill="none">
        <line x1="1" y1="8" x2="27" y2="8" stroke="#ccc8c2" strokeWidth="1.5" strokeDasharray="3 2"/>
        <polyline points="23,4 29,8 23,12" stroke="#ccc8c2" strokeWidth="1.5"
          strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      </svg>
    </div>
  )
}

function ParallelBlock({ branches, startNum }) {
  const n      = branches.length
  const totalH = n * NODE_H + (n - 1) * GAP_Y
  const midY   = totalH / 2
  const centers = Array.from({ length: n }, (_, i) => i * (NODE_H + GAP_Y) + NODE_H / 2)
  const topC   = centers[0]
  const botC   = centers[n - 1]

  return (
    <div style={{ display: 'flex', alignItems: 'flex-start' }}>
      {/* Fork SVG */}
      <svg width={FW} height={totalH} viewBox={`0 0 ${FW} ${totalH}`} fill="none" style={{ flexShrink: 0, display: 'block' }}>
        <line x1="0" y1={midY} x2={FW / 2} y2={midY} stroke="#ccc8c2" strokeWidth="1.5"/>
        <line x1={FW / 2} y1={topC} x2={FW / 2} y2={botC} stroke="#ccc8c2" strokeWidth="1.5"/>
        {centers.map((cy, i) => (
          <line key={i} x1={FW / 2} y1={cy} x2={FW} y2={cy} stroke="#ccc8c2" strokeWidth="1.5" strokeDasharray="3 2"/>
        ))}
        {centers.map((cy, i) => (
          <circle key={i} cx={FW / 2} cy={cy} r="2.5" fill="#ccc8c2"/>
        ))}
        <circle cx={FW / 2} cy={midY} r="3" fill="white" stroke="#ccc8c2" strokeWidth="1.5"/>
      </svg>

      {/* Stacked nodes */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: GAP_Y }}>
        {branches.map((branch, i) => <NodeCard key={i} paso={branch} stepNum={startNum !== undefined ? startNum + i : undefined} />)}
      </div>

      {/* Join SVG */}
      <svg width={FW} height={totalH} viewBox={`0 0 ${FW} ${totalH}`} fill="none" style={{ flexShrink: 0, display: 'block' }}>
        {centers.map((cy, i) => (
          <line key={i} x1="0" y1={cy} x2={FW / 2} y2={cy} stroke="#ccc8c2" strokeWidth="1.5" strokeDasharray="3 2"/>
        ))}
        {centers.map((cy, i) => (
          <circle key={i} cx={FW / 2} cy={cy} r="2.5" fill="#ccc8c2"/>
        ))}
        <line x1={FW / 2} y1={topC} x2={FW / 2} y2={botC} stroke="#ccc8c2" strokeWidth="1.5"/>
        <line x1={FW / 2} y1={midY} x2={FW} y2={midY} stroke="#ccc8c2" strokeWidth="1.5"/>
        <circle cx={FW / 2} cy={midY} r="3" fill="white" stroke="#ccc8c2" strokeWidth="1.5"/>
        <polyline points={`${FW - 8},${midY - 4} ${FW - 2},${midY} ${FW - 8},${midY + 4}`}
          stroke="#ccc8c2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      </svg>
    </div>
  )
}

function FlowCanvas({ children }) {
  const [zoom, setZoom]       = useState(0.82)
  const [pan, setPan]         = useState({ x: 28, y: 28 })
  const [dragging, setDrag]   = useState(false)
  const dragRef               = useRef(null)
  const containerRef          = useRef(null)

  const handleWheel = useCallback((e) => {
    e.preventDefault()
    const delta = e.deltaY < 0 ? 0.08 : -0.08
    setZoom(z => Math.min(2.5, Math.max(0.2, z + delta)))
  }, [])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    el.addEventListener('wheel', handleWheel, { passive: false })
    return () => el.removeEventListener('wheel', handleWheel)
  }, [handleWheel])

  const onMouseDown = (e) => {
    if (e.button !== 0) return
    setDrag(true)
    dragRef.current = { sx: e.clientX - pan.x, sy: e.clientY - pan.y }
  }
  const onMouseMove = (e) => {
    if (!dragging || !dragRef.current) return
    setPan({ x: e.clientX - dragRef.current.sx, y: e.clientY - dragRef.current.sy })
  }
  const onMouseUp = () => { setDrag(false); dragRef.current = null }

  const fit = () => { setZoom(0.82); setPan({ x: 28, y: 28 }) }

  return (
    <div
      ref={containerRef}
      style={{
        height: 490, overflow: 'hidden', position: 'relative',
        background: '#faf9f7',
        border: '1px solid #e4e1db', borderRadius: 10,
        cursor: dragging ? 'grabbing' : 'grab',
        userSelect: 'none',
      }}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
    >
      {/* Dot grid (moves with pan) */}
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
        <defs>
          <pattern
            id="dotgrid"
            x={pan.x % (18 * zoom)}
            y={pan.y % (18 * zoom)}
            width={18 * zoom}
            height={18 * zoom}
            patternUnits="userSpaceOnUse"
          >
            <circle cx="1" cy="1" r="0.9" fill="#d4cfc9" opacity="0.55"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dotgrid)"/>
      </svg>

      {/* Scrollable content */}
      <div style={{
        position: 'absolute', top: 0, left: 0,
        transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
        transformOrigin: '0 0',
      }}>
        {children}
      </div>

      {/* Controls */}
      <div
        style={{ position: 'absolute', bottom: 10, right: 10, display: 'flex', gap: 3 }}
        onMouseDown={e => e.stopPropagation()}
      >
        {[
          { label: '+', fn: () => setZoom(z => Math.min(2.5, z + 0.15)) },
          { label: '⊡', fn: fit },
          { label: '−', fn: () => setZoom(z => Math.max(0.2, z - 0.15)) },
        ].map(({ label, fn }) => (
          <button key={label} onClick={fn} style={{
            width: 26, height: 26, borderRadius: 6,
            background: '#ffffff', border: '1px solid #e4e1db',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: '"Roboto Mono", monospace', fontSize: 13, fontWeight: 700,
            color: '#878787', boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
          }}>
            {label}
          </button>
        ))}
      </div>

      {/* Zoom % */}
      <div style={{ position: 'absolute', bottom: 14, left: 12, pointerEvents: 'none' }}>
        <span style={{ fontFamily: '"Roboto Mono", monospace', fontSize: 9, color: '#ababab' }}>
          {Math.round(zoom * 100)}%
        </span>
      </div>

      {/* Hint */}
      <div style={{ position: 'absolute', top: 10, right: 10, pointerEvents: 'none' }}>
        <span style={{ fontFamily: 'Roboto, sans-serif', fontSize: 9, color: '#ccc8c2' }}>
          scroll para zoom · arrastrar para mover
        </span>
      </div>
    </div>
  )
}

function FlowDiagram({ pasos }) {
  // Calcular números de paso (paralelas cuentan como n pasos seguidos)
  let counter = 0
  const withNums = pasos.map((paso) => {
    if (paso.type === 'parallel') {
      const start = counter + 1
      counter += paso.branches.length
      return { ...paso, startNum: start }
    }
    counter += 1
    return { ...paso, stepNum: counter }
  })

  return (
    <FlowCanvas>
      <div style={{
        display: 'inline-flex', alignItems: 'center',
        padding: '20px 24px',
      }}>
        {withNums.map((paso, i) => {
          const isLast     = i === withNums.length - 1
          const isParallel = paso.type === 'parallel'

          return (
            <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
              {isParallel
                ? <ParallelBlock branches={paso.branches} startNum={paso.startNum} />
                : <NodeCard paso={paso} stepNum={paso.stepNum} />
              }
              {!isLast && <Connector />}
            </div>
          )
        })}
      </div>
    </FlowCanvas>
  )
}

// ─── Step list ────────────────────────────────────────────────────────────────

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
  const { data: remoteFlujos } = useQuery({
    queryKey: ['flujos'],
    queryFn: api.flujos,
    staleTime: 5 * 60 * 1000,      // considera fresco por 5 min
    refetchOnWindowFocus: true,     // refresca al volver a la pestaña
  })

  const flujos = useMemo(() => {
    if (Array.isArray(remoteFlujos) && remoteFlujos.length > 0) return remoteFlujos
    return FLUJOS  // fallback al hardcoded si falla el API
  }, [remoteFlujos])

  const [selected,  setSelected]  = useState(null)
  const [expanded, setExpanded]  = useState(false)

  // Seleccionar el primero cuando carguen los flujos
  useEffect(() => {
    if (!selected && flujos.length > 0) setSelected(flujos[0])
  }, [flujos, selected])

  return (
    <div style={{ display: 'flex', height: '100%' }}>

      {/* ── Sidebar colapsable ── */}
      <div style={{
        width: expanded ? 210 : 52,
        flexShrink: 0,
        background: '#ffffff',
        borderRight: '1px solid #e4e1db',
        display: 'flex', flexDirection: 'column',
        transition: 'width 0.18s ease',
        overflow: 'hidden',
      }}>
        {/* Toggle */}
        <button
          onClick={() => setExpanded(e => !e)}
          title={expanded ? 'Colapsar' : 'Expandir'}
          style={{
            width: '100%', height: 44, flexShrink: 0,
            background: 'transparent',
            border: 'none', borderBottom: '1px solid #e4e1db',
            cursor: 'pointer',
            display: 'flex', alignItems: 'center',
            justifyContent: expanded ? 'flex-end' : 'center',
            padding: expanded ? '0 14px' : '0',
            color: '#ababab',
            transition: 'color 0.12s',
          }}
          onMouseEnter={e => { e.currentTarget.style.color = '#373737'; e.currentTarget.style.background = '#f5f3f0' }}
          onMouseLeave={e => { e.currentTarget.style.color = '#ababab'; e.currentTarget.style.background = 'transparent' }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            {expanded
              ? <polyline points="9,2 4,7 9,12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              : <polyline points="5,2 10,7 5,12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            }
          </svg>
        </button>

        {/* Lista de flujos */}
        <ul style={{
          listStyle: 'none', flex: 1, overflowY: 'auto', overflowX: 'hidden',
          padding: '8px 6px',
          display: 'flex', flexDirection: 'column', gap: 2,
          scrollbarWidth: 'thin', scrollbarColor: '#e4e1db transparent',
        }}>
          {flujos.map((f) => {
            const isActive = selected?.id === f.id
            return (
              <li key={f.id}>
                <button
                  onClick={() => setSelected(f)}
                  title={f.titulo}
                  style={{
                    width: '100%', textAlign: 'left',
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: expanded ? '8px 10px' : '8px 0',
                    justifyContent: expanded ? 'flex-start' : 'center',
                    borderRadius: 7,
                    background: isActive ? f.color + '12' : 'transparent',
                    boxShadow: isActive && expanded ? `inset 3px 0 0 ${f.color}` : 'none',
                    border: 'none', cursor: 'pointer',
                    transition: 'background 0.1s',
                  }}
                  onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = '#f5f3f0' }}
                  onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent' }}
                >
                  <span style={{
                    fontFamily: '"Roboto Mono", monospace', fontSize: 10, fontWeight: 700,
                    width: 24, height: 24, borderRadius: 6, flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: isActive ? f.color : '#f0eeea',
                    color: isActive ? '#ffffff' : '#878787',
                    transition: 'all 0.12s',
                  }}>
                    {f.id}
                  </span>
                  {expanded && (
                    <span style={{
                      fontFamily: 'Roboto, sans-serif', fontSize: 12,
                      fontWeight: isActive ? 600 : 400,
                      color: isActive ? '#373737' : '#878787',
                      whiteSpace: 'nowrap', overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}>
                      {f.titulo.split('—')[1]?.trim() ?? f.titulo}
                    </span>
                  )}
                </button>
              </li>
            )
          })}
        </ul>
      </div>

      {/* Detail */}
      {selected && (
        <div style={{ flex: 1, overflowY: 'auto', padding: '28px 32px 40px' }}>

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

            {/* Diagrama horizontal */}
            <FlowDiagram pasos={selected.pasos} />

            <div style={{ borderTop: '1px solid #F0EEEA', margin: '20px 0 16px' }} />

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

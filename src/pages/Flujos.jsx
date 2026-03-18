import { useState } from 'react'
import { GitBranch } from 'lucide-react'

const AGENT_COLORS = {
  aisir:     { color: '#4f9eff', label: 'AiSir' },
  huginn:    { color: '#a78bfa', label: 'Huginn' },
  bragi:     { color: '#34d399', label: 'Bragi' },
  loki:      { color: '#f59e0b', label: 'Loki' },
  ratatoskr: { color: '#10b981', label: 'Ratatoskr' },
  kvasir:    { color: '#e879f9', label: 'Kvasir' },
  idunn:     { color: '#fb923c', label: 'Idunn' },
  odin:      { color: '#f43f5e', label: 'Odin' },
  frigg:     { color: '#06b6d4', label: 'Frigg' },
  mimir:     { color: '#8b5cf6', label: 'Mimir' },
  hans:      { color: '#7ec832', label: 'Hans' },
  telegram:  { color: '#4f9eff', label: 'Telegram' },
  publer:    { color: '#e09820', label: 'Publer' },
  serpapi:   { color: '#10b981', label: 'SerpAPI' },
  sistema:   { color: '#5c7a50', label: 'Sistema' },
}

const FLUJOS = [
  {
    id: 'A',
    titulo: 'Flujo A — Semana Estándar',
    descripcion: 'Ciclo semanal completo: curaduría, redacción, adaptación y programación.',
    color: '#7ec832',
    pasos: [
      { agente: 'sistema', accion: 'Lunes 6 AM — Trigger automático semanal', tiempo: 'Lun 6:00' },
      { agente: 'huginn',  accion: 'Curador genera brief con temas y scoring', tiempo: '~20min' },
      { agente: 'hans',    accion: 'Hans aprueba temas vía Telegram', tiempo: 'Manual' },
      { agente: 'bragi',   accion: 'Redactor genera contenido base (artículo/newsletter/script)', tiempo: '~15min' },
      { agente: 'loki',    accion: 'Social Media adapta para cada red', tiempo: '~10min' },
      { agente: 'idunn',   accion: 'Creativo genera prompts DALL-E y estructura carousel', tiempo: '~5min' },
      { agente: 'hans',    accion: 'Hans revisa y aprueba/edita en Telegram', tiempo: 'Manual' },
      { agente: 'frigg',   accion: 'Planner programa en Publer con horarios óptimos', tiempo: '~5min' },
      { agente: 'mimir',   accion: 'Dom 9 PM — Cerebro Hans consolida aprendizajes', tiempo: 'Dom 21:00' },
    ],
  },
  {
    id: 'B',
    titulo: 'Flujo B — Modo Momento',
    descripcion: 'Publicación on-demand desde foto o audio enviado por Telegram.',
    color: '#4f9eff',
    pasos: [
      { agente: 'hans',    accion: 'Hans envía foto o audio a Telegram', tiempo: 'On-demand' },
      { agente: 'aisir',   accion: 'Orquestador detecta media y activa Modo Momento', tiempo: '<1s' },
      { agente: 'bragi',   accion: 'Vision (GPT-4o) analiza la foto O Whisper transcribe audio', tiempo: '~5s' },
      { agente: 'loki',    accion: 'Social Media genera posts para 4 redes simultáneamente', tiempo: '~10min' },
      { agente: 'hans',    accion: 'Preview en Telegram — Hans aprueba por red', tiempo: 'Manual' },
      { agente: 'publer',  accion: 'LinkedIn/IG/FB → Publer; X → API directa', tiempo: '<30s' },
    ],
  },
  {
    id: 'C',
    titulo: 'Flujo C — Comentario de Autoridad',
    descripcion: 'Monitoreo de líderes y generación de comentarios estratégicos.',
    color: '#f43f5e',
    pasos: [
      { agente: 'sistema', accion: '9 AM y 3 PM — Trigger automático Odin', tiempo: '2x/día' },
      { agente: 'odin',    accion: 'Escanea posts recientes de líderes monitoreados', tiempo: '~2min' },
      { agente: 'odin',    accion: 'Score ≥70 activa generación de 2 versiones', tiempo: '~5min' },
      { agente: 'hans',    accion: 'Hans elige versión preferida vía Telegram', tiempo: 'Manual' },
      { agente: 'publer',  accion: 'X → publica automático; LinkedIn → copia + URL', tiempo: '<10s' },
    ],
  },
  {
    id: 'E',
    titulo: 'Flujo E — Artículo + 8 Piezas',
    descripcion: 'Producción quincenal: artículo SEO completo con derivados por red.',
    color: '#34d399',
    pasos: [
      { agente: 'ratatoskr', accion: 'Investiga keyword en SerpAPI — top 10 + PAA + brechas', tiempo: '~15min' },
      { agente: 'ratatoskr', accion: 'Genera brief SEO completo para Bragi', tiempo: '~5min' },
      { agente: 'bragi',     accion: 'Redacta artículo 2000+ palabras con Brand Voice', tiempo: '~20min' },
      { agente: 'ratatoskr', accion: 'Audita artículo — umbral ≥80/100', tiempo: '~5min' },
      { agente: 'loki',      accion: 'Genera: carousel, reel script, newsletter, 4 posts', tiempo: '~15min' },
      { agente: 'idunn',     accion: 'Genera prompts visuales para carousel', tiempo: '~5min' },
      { agente: 'hans',      accion: 'Paquete completo en Telegram para aprobación', tiempo: 'Manual' },
      { agente: 'frigg',     accion: 'Programa paquete en Publer con horarios', tiempo: '~5min' },
    ],
  },
  {
    id: 'W',
    titulo: 'Flujo W — Blog hanshatch.com',
    descripcion: 'Publicación mensual en WordPress con distribución por redes.',
    color: '#e879f9',
    pasos: [
      { agente: 'sistema',   accion: 'Día 1 del mes, 9 AM — Trigger automático', tiempo: 'Mensual' },
      { agente: 'huginn',    accion: 'Curador selecciona mejor tema del mes', tiempo: '~10min' },
      { agente: 'ratatoskr', accion: 'Brief SEO para el tema seleccionado', tiempo: '~15min' },
      { agente: 'bragi',     accion: 'Articulo blog optimizado para WordPress', tiempo: '~20min' },
      { agente: 'hans',      accion: 'Hans aprueba artículo vía Telegram', tiempo: 'Manual' },
      { agente: 'sistema',   accion: 'Publica en WordPress via REST API', tiempo: '<10s' },
      { agente: 'loki',      accion: 'Genera posts de distribución por cada red', tiempo: '~10min' },
      { agente: 'frigg',     accion: 'Programa distribución en Publer', tiempo: '~5min' },
    ],
  },
  {
    id: 'I',
    titulo: 'Flujo I — Inspiración Mensual',
    descripcion: 'Análisis de cuentas referentes y brief de inspiración para el mes siguiente.',
    color: '#e879f9',
    pasos: [
      { agente: 'sistema', accion: 'Días 28-30 del mes — Trigger automático', tiempo: 'Mensual' },
      { agente: 'kvasir',  accion: 'Descarga los últimos 30 posts de cuentas activas', tiempo: '~10min' },
      { agente: 'kvasir',  accion: 'Calcula engagement rate por cuenta y red', tiempo: '~5min' },
      { agente: 'kvasir',  accion: 'GPT-4o analiza tops — identifica patrones ganadores', tiempo: '~10min' },
      { agente: 'kvasir',  accion: 'Genera brief con 10-15 ideas adaptadas a Hans', tiempo: '~5min' },
      { agente: 'hans',    accion: 'Hans recibe brief mensual en Telegram', tiempo: 'Auto' },
    ],
  },
]

function StepItem({ step, isLast, flowColor }) {
  const agent = AGENT_COLORS[step.agente] ?? { color: '#5c7a50', label: step.agente }
  return (
    <li className="flex gap-3">
      <div className="flex flex-col items-center">
        <div
          className="w-6 h-6 flex items-center justify-center flex-shrink-0 font-mono text-[10px] font-bold"
          style={{
            border: `1px solid ${flowColor}50`,
            borderRadius: 3,
            background: flowColor + '12',
            color: flowColor,
          }}
        />
        {!isLast && (
          <div
            style={{
              width: 1,
              flex: 1,
              minHeight: 12,
              background: `linear-gradient(to bottom, ${flowColor}30, transparent)`,
              margin: '2px 0',
            }}
          />
        )}
      </div>
      <div className="flex-1 pb-3">
        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
          <span
            className="font-mono text-[9px] uppercase px-1.5 py-0.5"
            style={{
              background: agent.color + '18',
              color: agent.color,
              border: `1px solid ${agent.color}35`,
              borderRadius: 2,
            }}
          >
            {agent.label}
          </span>
          <span
            className="font-mono text-[9px] px-1.5 py-0.5"
            style={{
              background: '#080c08',
              color: '#3d5535',
              border: '1px solid #1e2d1a',
              borderRadius: 2,
            }}
          >
            {step.tiempo}
          </span>
        </div>
        <p className="text-xs leading-snug" style={{ color: '#8aab78' }}>
          {step.accion}
        </p>
      </div>
    </li>
  )
}

export default function Flujos() {
  const [selected, setSelected] = useState(FLUJOS[0])

  return (
    <div className="flex h-full animate-fade-in">
      {/* Left sidebar */}
      <div
        className="flex-shrink-0 overflow-y-auto"
        style={{
          width: 220,
          background: '#0d110d',
          borderRight: '1px solid #1e2d1a',
        }}
      >
        <div className="px-4 py-4">
          <p className="font-mono text-[9px] uppercase tracking-widest mb-3" style={{ color: '#3d5535' }}>
            Flujos del sistema
          </p>
          <ul className="space-y-1">
            {FLUJOS.map((f) => (
              <li key={f.id}>
                <button
                  onClick={() => setSelected(f)}
                  className="w-full text-left px-3 py-2.5 flex items-center gap-2.5 transition-all"
                  style={{
                    borderRadius: 3,
                    background: selected?.id === f.id ? f.color + '12' : 'transparent',
                    borderLeft: `2px solid ${selected?.id === f.id ? f.color : 'transparent'}`,
                    paddingLeft: selected?.id === f.id ? 10 : 12,
                  }}
                  onMouseEnter={(e) => {
                    if (selected?.id !== f.id) e.currentTarget.style.background = '#111611'
                  }}
                  onMouseLeave={(e) => {
                    if (selected?.id !== f.id) e.currentTarget.style.background = 'transparent'
                  }}
                >
                  <span
                    className="font-mono text-[10px] font-bold px-1.5"
                    style={{
                      color: selected?.id === f.id ? f.color : '#3d5535',
                      border: `1px solid ${selected?.id === f.id ? f.color + '50' : '#1e2d1a'}`,
                      borderRadius: 2,
                      background: selected?.id === f.id ? f.color + '15' : 'transparent',
                    }}
                  >
                    {f.id}
                  </span>
                  <span
                    className="text-xs font-medium leading-tight"
                    style={{ color: selected?.id === f.id ? '#d4e6c8' : '#5c7a50' }}
                  >
                    {f.titulo.split('—')[1]?.trim() ?? f.titulo}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Detail */}
      {selected && (
        <div className="flex-1 overflow-y-auto p-6">
          {/* Top accent */}
          <div
            style={{
              height: 2,
              width: 48,
              background: selected.color,
              boxShadow: `0 0 12px ${selected.color}70`,
              borderRadius: 1,
              marginBottom: 16,
            }}
          />

          <div className="flex items-center gap-3 mb-2">
            <GitBranch size={18} style={{ color: selected.color }} />
            <h2 className="font-display font-black text-xl" style={{ color: selected.color }}>
              {selected.titulo}
            </h2>
          </div>
          <p className="text-sm mb-6 leading-relaxed" style={{ color: '#8aab78' }}>
            {selected.descripcion}
          </p>

          <div
            className="p-5"
            style={{
              background: '#0d110d',
              border: `1px solid ${selected.color}30`,
              borderRadius: 4,
              boxShadow: `0 0 24px ${selected.color}08`,
            }}
          >
            <p className="font-mono text-[10px] uppercase tracking-widest mb-4" style={{ color: '#3d5535' }}>
              Pasos · {selected.pasos.length} etapas
            </p>
            <ol className="space-y-0">
              {selected.pasos.map((paso, i) => (
                <StepItem
                  key={i}
                  step={paso}
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

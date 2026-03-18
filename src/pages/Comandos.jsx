import { useState } from 'react'
import { Copy, Check } from 'lucide-react'

const COMANDOS = [
  {
    categoria: 'Generación de contenido',
    color: '#34d399',
    items: [
      {
        cmd: '/generar',
        args: '[tema]',
        desc: 'Inicia el flujo completo de generación: curador → redactor → social media → planner.',
        ejemplo: '/generar marketing con IA en PyMEs mexicanas',
      },
      {
        cmd: '/articulo',
        args: '[tema]',
        desc: 'Genera artículo SEO completo (2000+ palabras) con brief de Ratatoskr + redacción de Bragi.',
        ejemplo: '/articulo estrategia de contenidos B2B 2025',
      },
      {
        cmd: '/newsletter',
        args: '[tema?]',
        desc: 'Genera newsletter HTML listo para Acumbamail. Si no se especifica tema, usa el artículo más reciente.',
        ejemplo: '/newsletter tendencias marketing Q1 2025',
      },
      {
        cmd: '/momento',
        args: '',
        desc: 'Activa Modo Momento. Envía la foto o audio justo después de este comando.',
        ejemplo: '/momento',
      },
      {
        cmd: '/blog',
        args: '[tema?]',
        desc: 'Genera y publica artículo en hanshatch.com via WordPress REST API.',
        ejemplo: '/blog el futuro de las agencias de marketing',
      },
    ],
  },
  {
    categoria: 'Aprobación y calendario',
    color: '#4f9eff',
    items: [
      {
        cmd: '/calendario',
        args: '[semana?]',
        desc: 'Muestra el calendario editorial de la semana actual o una específica.',
        ejemplo: '/calendario',
      },
      {
        cmd: '/aprobar',
        args: '[id]',
        desc: 'Aprueba un contenido específico por ID para su programación en Publer.',
        ejemplo: '/aprobar 142',
      },
      {
        cmd: '/rechazar',
        args: '[id] [motivo]',
        desc: 'Rechaza un contenido con motivo opcional. Mimir aprende del rechazo.',
        ejemplo: '/rechazar 142 tono muy corporativo',
      },
      {
        cmd: '/reprogramar',
        args: '[id] [fecha]',
        desc: 'Cambia la fecha de programación de un contenido aprobado.',
        ejemplo: '/reprogramar 142 2025-01-20 14:00',
      },
    ],
  },
  {
    categoria: 'Temas y curación',
    color: '#a78bfa',
    items: [
      {
        cmd: '/temas',
        args: '',
        desc: 'Muestra el brief semanal de Huginn con temas y scoring por pilar.',
        ejemplo: '/temas',
      },
      {
        cmd: '/aprobar_tema',
        args: '[id]',
        desc: 'Aprueba un tema del brief para que Bragi proceda a redactarlo.',
        ejemplo: '/aprobar_tema 8',
      },
      {
        cmd: '/curar',
        args: '',
        desc: 'Fuerza a Huginn a generar nuevo brief ahora, sin esperar el trigger del lunes.',
        ejemplo: '/curar',
      },
    ],
  },
  {
    categoria: 'Comentarista Odin',
    color: '#f43f5e',
    items: [
      {
        cmd: '/comentarios',
        args: '',
        desc: 'Muestra oportunidades de comentario detectadas por Odin con score ≥70.',
        ejemplo: '/comentarios',
      },
      {
        cmd: '/lider',
        args: '[usuario] [red]',
        desc: 'Agrega un nuevo líder a la lista de monitoreo de Odin.',
        ejemplo: '/lider @neilpatel x',
      },
      {
        cmd: '/scan',
        args: '',
        desc: 'Fuerza escaneo inmediato de Odin sin esperar el trigger de 9 AM / 3 PM.',
        ejemplo: '/scan',
      },
    ],
  },
  {
    categoria: 'Cerebro Hans (Mimir)',
    color: '#8b5cf6',
    items: [
      {
        cmd: '/cerebro',
        args: '',
        desc: 'Muestra el estado del Cerebro Hans: reglas activas, vocabulario, aprendizajes recientes.',
        ejemplo: '/cerebro',
      },
      {
        cmd: '/aprender',
        args: '',
        desc: 'Procesa eventos pendientes y extrae nuevas reglas de voz y estilo.',
        ejemplo: '/aprender',
      },
      {
        cmd: '/consolidar',
        args: '',
        desc: 'Fuerza consolidación semanal ahora. Normalmente corre automático cada domingo a las 9 PM.',
        ejemplo: '/consolidar',
      },
      {
        cmd: '/reglas',
        args: '',
        desc: 'Lista todas las reglas activas con categoría y peso.',
        ejemplo: '/reglas',
      },
    ],
  },
  {
    categoria: 'Sistema',
    color: '#06b6d4',
    items: [
      {
        cmd: '/estado',
        args: '',
        desc: 'Health check completo del sistema: agentes, DB, APIs, Redis.',
        ejemplo: '/estado',
      },
      {
        cmd: '/logs',
        args: '[n?]',
        desc: 'Últimas N entradas del log de agentes. Default: 20.',
        ejemplo: '/logs 50',
      },
      {
        cmd: '/metricas',
        args: '',
        desc: 'Resumen de métricas: contenido generado/aprobado/publicado, tasa de aprobación.',
        ejemplo: '/metricas',
      },
      {
        cmd: '/inspiracion',
        args: '',
        desc: 'Fuerza a Kvasir a analizar cuentas referentes ahora y generar brief.',
        ejemplo: '/inspiracion',
      },
    ],
  },
]

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }

  return (
    <button
      onClick={handleCopy}
      className="p-1 transition-colors flex-shrink-0"
      style={{
        color: copied ? '#7ec832' : '#3d5535',
        background: copied ? '#0d1f08' : 'transparent',
        border: `1px solid ${copied ? '#7ec83240' : '#1e2d1a'}`,
        borderRadius: 2,
      }}
      title="Copiar"
    >
      {copied ? <Check size={11} /> : <Copy size={11} />}
    </button>
  )
}

function CmdCard({ item }) {
  return (
    <div
      style={{
        background: '#0d110d',
        border: '1px solid #1e2d1a',
        borderRadius: 4,
        padding: '14px 16px',
      }}
    >
      {/* Command */}
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-baseline gap-2 flex-wrap">
          <span
            className="font-mono text-sm font-bold"
            style={{ color: '#7ec832', textShadow: '0 0 12px rgba(126,200,50,0.3)' }}
          >
            {item.cmd}
          </span>
          {item.args && (
            <span
              className="font-mono text-[11px] px-1.5 py-0.5"
              style={{
                background: '#111611',
                color: '#5c7a50',
                border: '1px solid #1e2d1a',
                borderRadius: 2,
              }}
            >
              {item.args}
            </span>
          )}
        </div>
      </div>

      {/* Description */}
      <p className="text-xs leading-relaxed mb-3" style={{ color: '#8aab78' }}>
        {item.desc}
      </p>

      {/* Example */}
      <div
        className="flex items-center justify-between gap-2 px-3 py-2"
        style={{ background: '#080c08', border: '1px solid #161d16', borderRadius: 3 }}
      >
        <span className="font-mono text-[11px] flex-1 min-w-0 truncate" style={{ color: '#5c7a50' }}>
          {item.ejemplo}
        </span>
        <CopyButton text={item.ejemplo} />
      </div>
    </div>
  )
}

export default function Comandos() {
  const [activeCat, setActiveCat] = useState(COMANDOS[0].categoria)
  const active = COMANDOS.find((c) => c.categoria === activeCat) ?? COMANDOS[0]

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
            Categorías
          </p>
          <ul className="space-y-0.5">
            {COMANDOS.map((cat) => (
              <li key={cat.categoria}>
                <button
                  onClick={() => setActiveCat(cat.categoria)}
                  className="w-full text-left px-3 py-2.5 flex items-center gap-2 transition-all"
                  style={{
                    borderRadius: 3,
                    background: activeCat === cat.categoria ? cat.color + '12' : 'transparent',
                    borderLeft: `2px solid ${activeCat === cat.categoria ? cat.color : 'transparent'}`,
                    paddingLeft: activeCat === cat.categoria ? 10 : 12,
                  }}
                  onMouseEnter={(e) => {
                    if (activeCat !== cat.categoria) e.currentTarget.style.background = '#111611'
                  }}
                  onMouseLeave={(e) => {
                    if (activeCat !== cat.categoria) e.currentTarget.style.background = 'transparent'
                  }}
                >
                  <div
                    className="w-2 h-2 flex-shrink-0"
                    style={{
                      borderRadius: '50%',
                      background: activeCat === cat.categoria ? cat.color : '#2a3d24',
                    }}
                  />
                  <span
                    className="text-xs font-medium leading-tight"
                    style={{ color: activeCat === cat.categoria ? '#d4e6c8' : '#5c7a50' }}
                  >
                    {cat.categoria}
                  </span>
                  <span
                    className="ml-auto font-mono text-[10px]"
                    style={{ color: activeCat === cat.categoria ? cat.color : '#2a3d24' }}
                  >
                    {cat.items.length}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <div
            className="w-2 h-2"
            style={{ borderRadius: '50%', background: active.color, boxShadow: `0 0 8px ${active.color}` }}
          />
          <h2 className="font-display font-black text-xl text-ink">
            {active.categoria}
          </h2>
          <span
            className="font-mono text-[10px] px-2 py-0.5"
            style={{
              background: active.color + '18',
              color: active.color,
              border: `1px solid ${active.color}40`,
              borderRadius: 2,
            }}
          >
            {active.items.length} comandos
          </span>
        </div>
        <p className="font-mono text-xs text-muted mb-6">
          Enviar via Telegram · @AiS1rBot
        </p>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
          {active.items.map((item) => (
            <CmdCard key={item.cmd} item={item} />
          ))}
        </div>
      </div>
    </div>
  )
}

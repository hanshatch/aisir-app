import { useState } from 'react'
import { Copy, Check } from 'lucide-react'

/* ─── Commands data ─────────────────────────────────────── */
const COMANDOS = [
  {
    categoria: 'Generación de contenido',
    color: '#76a72b',
    colorBg: '#f0f7e6',
    colorText: '#4a7018',
    items: [
      {
        cmd: '/generar',
        args: '[tema]',
        desc: 'Inicia el flujo completo de generación: Huginn (curador) evalúa el tema, Bragi lo redacta y Loki adapta el contenido para cada red social. El resultado llega a Telegram para aprobación.',
        ejemplo: '/generar marketing con IA en PyMEs mexicanas',
      },
      {
        cmd: '/articulo',
        args: '[tema]',
        desc: 'Genera artículo SEO de 2000+ palabras con brief de Ratatoskr y redacción de Bragi. Entrega el .docx con 8 piezas derivadas: carousel, reel, newsletter, posts por red.',
        ejemplo: '/articulo estrategia de contenidos B2B 2025',
      },
      {
        cmd: '/newsletter',
        args: '[tema?]',
        desc: 'Genera newsletter HTML listo para enviar vía Acumbamail. Si no se especifica tema, Bragi usa el artículo más reciente aprobado como base editorial.',
        ejemplo: '/newsletter tendencias marketing Q1 2025',
      },
      {
        cmd: '/momento',
        args: '',
        desc: 'Activa el Modo Momento. Envía una foto o audio inmediatamente después de este comando. Vision y Whisper procesan el contexto y Loki genera posts para todas las redes.',
        ejemplo: '/momento',
      },
      {
        cmd: '/blog',
        args: '[tema?]',
        desc: 'Genera y publica artículo directamente en hanshatch.com vía WordPress REST API. Si no se indica tema, usa el artículo aprobado más reciente en la cola.',
        ejemplo: '/blog el futuro de las agencias de marketing',
      },
    ],
  },
  {
    categoria: 'Aprobación y calendario',
    color: '#0a66c2',
    colorBg: '#eff6ff',
    colorText: '#1d4ed8',
    items: [
      {
        cmd: '/calendario',
        args: '[semana?]',
        desc: 'Muestra el calendario editorial de la semana actual o de una semana específica. Incluye contenido programado por red social, estado y hora de publicación en Publer.',
        ejemplo: '/calendario',
      },
      {
        cmd: '/aprobar',
        args: '[id]',
        desc: 'Aprueba un contenido específico por su ID para programación inmediata en Publer. Mimir registra el evento como aprobación y lo toma en cuenta en la consolidación.',
        ejemplo: '/aprobar 142',
      },
      {
        cmd: '/rechazar',
        args: '[id] [motivo]',
        desc: 'Rechaza un contenido con motivo opcional. Mimir aprende del rechazo: extrae reglas de voz, tono o estructura y ajusta futuros contenidos automáticamente.',
        ejemplo: '/rechazar 142 tono muy corporativo',
      },
      {
        cmd: '/reprogramar',
        args: '[id] [fecha]',
        desc: 'Cambia la fecha y hora de publicación de un contenido ya aprobado en Publer. Usa formato YYYY-MM-DD HH:MM (hora Ciudad de México).',
        ejemplo: '/reprogramar 142 2025-01-20 14:00',
      },
    ],
  },
  {
    categoria: 'Temas y curación',
    color: '#7c3aed',
    colorBg: '#f5f3ff',
    colorText: '#6d28d9',
    items: [
      {
        cmd: '/temas',
        args: '',
        desc: 'Muestra el brief semanal generado por Huginn: temas con scoring por pilar temático, relevancia en el mercado mexicano y recomendación de formato de contenido.',
        ejemplo: '/temas',
      },
      {
        cmd: '/aprobar_tema',
        args: '[id]',
        desc: 'Aprueba un tema del brief semanal para que Bragi proceda a redactarlo. El tema entra a la cola del Planner y se asigna fecha de publicación automáticamente.',
        ejemplo: '/aprobar_tema 8',
      },
      {
        cmd: '/curar',
        args: '',
        desc: 'Fuerza a Huginn a generar un nuevo brief de temas ahora mismo, sin esperar el trigger automático del lunes a las 6 AM. Útil tras eventos de coyuntura.',
        ejemplo: '/curar',
      },
    ],
  },
  {
    categoria: 'Comentarista Odin',
    color: '#e1306c',
    colorBg: '#fdf2f8',
    colorText: '#be185d',
    items: [
      {
        cmd: '/comentarios',
        args: '',
        desc: 'Muestra las oportunidades de comentario detectadas por Odin en los últimos posts de líderes monitoreados. Solo aparecen posts con score de relevancia ≥ 70.',
        ejemplo: '/comentarios',
      },
      {
        cmd: '/lider',
        args: '[usuario] [red]',
        desc: 'Agrega un nuevo líder a la lista de monitoreo de Odin. Las redes disponibles son x, linkedin e instagram. El tier se asigna automáticamente por engagement histórico.',
        ejemplo: '/lider @neilpatel x',
      },
      {
        cmd: '/scan',
        args: '',
        desc: 'Fuerza un escaneo inmediato de Odin en todos los líderes monitoreados sin esperar los triggers automáticos de 9 AM y 3 PM. Útil tras eventos virales.',
        ejemplo: '/scan',
      },
    ],
  },
  {
    categoria: 'Cerebro Hans (Mimir)',
    color: '#7c3aed',
    colorBg: '#f5f3ff',
    colorText: '#6d28d9',
    items: [
      {
        cmd: '/cerebro',
        args: '',
        desc: 'Muestra el estado completo del Cerebro Hans: total de reglas activas, aprendizajes de la semana, vocabulario controlado y próxima consolidación programada.',
        ejemplo: '/cerebro',
      },
      {
        cmd: '/aprender',
        args: '',
        desc: 'Procesa todos los eventos pendientes (aprobaciones, rechazos, ediciones) y extrae nuevas reglas de voz, tono y estructura. No espera la consolidación dominical.',
        ejemplo: '/aprender',
      },
      {
        cmd: '/consolidar',
        args: '',
        desc: 'Fuerza la consolidación semanal del Cerebro ahora mismo. Normalmente corre automático cada domingo a las 9 PM. Genera resumen de aprendizajes y ajusta pesos.',
        ejemplo: '/consolidar',
      },
      {
        cmd: '/reglas',
        args: '',
        desc: 'Lista todas las reglas activas del Cerebro con categoría, contenido y peso de influencia. Muestra cuáles fueron aprendidas por interacción vs. cargadas manualmente.',
        ejemplo: '/reglas',
      },
    ],
  },
  {
    categoria: 'Sistema',
    color: '#d97706',
    colorBg: '#fffbeb',
    colorText: '#b45309',
    items: [
      {
        cmd: '/estado',
        args: '',
        desc: 'Health check completo del sistema: estado de los 10 agentes, conexión a MySQL y Redis, respuesta de todas las APIs externas (OpenAI, Publer, Acumbamail, X).',
        ejemplo: '/estado',
      },
      {
        cmd: '/logs',
        args: '[n?]',
        desc: 'Muestra las últimas N entradas del log centralizado de agentes. Por defecto muestra 20. Incluye agente, acción, timestamp y resultado de cada operación.',
        ejemplo: '/logs 50',
      },
      {
        cmd: '/metricas',
        args: '',
        desc: 'Resumen de métricas operativas: contenido generado, aprobado y publicado en el período, tasa de aprobación, engagement promedio y rendimiento por red social.',
        ejemplo: '/metricas',
      },
      {
        cmd: '/inspiracion',
        args: '',
        desc: 'Fuerza a Kvasir a analizar ahora las cuentas referentes configuradas y generar un brief de inspiración creativa. No espera el trigger programado.',
        ejemplo: '/inspiracion',
      },
    ],
  },
]

/* ─── Total command count ───────────────────────────────── */
const TOTAL_COMANDOS = COMANDOS.reduce((sum, c) => sum + c.items.length, 0)

/* ─── Copy button ───────────────────────────────────────── */
function CopyButton({ text }) {
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
    })
  }

  return (
    <button
      onClick={handleCopy}
      title="Copiar"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        padding: '4px 8px',
        borderRadius: 5,
        border: `1px solid ${copied ? '#c6e8a0' : '#e4e1db'}`,
        background: copied ? '#f0f7e6' : '#f7f6f3',
        color: copied ? '#4a7018' : '#878787',
        cursor: 'pointer',
        fontSize: 11,
        fontFamily: 'Roboto, sans-serif',
        fontWeight: 500,
        transition: 'all 0.15s',
        flexShrink: 0,
        whiteSpace: 'nowrap',
      }}
      onMouseEnter={(e) => {
        if (!copied) {
          e.currentTarget.style.borderColor = '#ccc9c2'
          e.currentTarget.style.background = '#ede9e3'
          e.currentTarget.style.color = '#373737'
        }
      }}
      onMouseLeave={(e) => {
        if (!copied) {
          e.currentTarget.style.borderColor = '#e4e1db'
          e.currentTarget.style.background = '#f7f6f3'
          e.currentTarget.style.color = '#878787'
        }
      }}
    >
      {copied ? <Check size={12} strokeWidth={2.5} /> : <Copy size={12} />}
      {copied ? 'Copiado' : 'Copiar'}
    </button>
  )
}

/* ─── Command card ──────────────────────────────────────── */
function CmdCard({ item, accentColor, accentText }) {
  return (
    <div
      className="card shadow-card"
      style={{
        borderRadius: 10,
        overflow: 'hidden',
        transition: 'box-shadow 0.2s, border-color 0.2s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.09), 0 1px 4px rgba(0,0,0,0.05)'
        e.currentTarget.style.borderColor = '#ccc9c2'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.05)'
        e.currentTarget.style.borderColor = '#e4e1db'
      }}
    >
      {/* Top accent line */}
      <div
        style={{
          height: 2,
          background: accentColor,
          opacity: 0.5,
        }}
      />

      <div style={{ padding: '16px 18px' }}>
        {/* Command + args */}
        <div
          style={{
            display: 'flex',
            alignItems: 'baseline',
            gap: 8,
            marginBottom: 10,
            flexWrap: 'wrap',
          }}
        >
          <span
            style={{
              fontFamily: '"Roboto Mono", monospace',
              fontWeight: 700,
              fontSize: 15,
              color: accentColor,
              letterSpacing: '-0.01em',
            }}
          >
            {item.cmd}
          </span>
          {item.args && (
            <span
              style={{
                fontFamily: '"Roboto Mono", monospace',
                fontSize: 11,
                color: '#ababab',
                padding: '2px 7px',
                borderRadius: 4,
                background: '#f7f6f3',
                border: '1px solid #e4e1db',
              }}
            >
              {item.args}
            </span>
          )}
        </div>

        {/* Description */}
        <p
          style={{
            fontFamily: 'Roboto, sans-serif',
            fontSize: 13,
            color: '#555',
            lineHeight: 1.6,
            marginBottom: 14,
          }}
        >
          {item.desc}
        </p>

        {/* Example block */}
        <div
          style={{
            background: '#f7f6f3',
            border: '1px solid #e4e1db',
            borderRadius: 7,
            padding: '10px 12px',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <p
              style={{
                fontFamily: 'Roboto, sans-serif',
                fontSize: 9,
                letterSpacing: '0.07em',
                textTransform: 'uppercase',
                color: '#ababab',
                marginBottom: 4,
              }}
            >
              Ejemplo
            </p>
            <span
              style={{
                fontFamily: '"Roboto Mono", monospace',
                fontSize: 12,
                color: '#373737',
                display: 'block',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {item.ejemplo}
            </span>
          </div>
          <CopyButton text={item.ejemplo} />
        </div>
      </div>
    </div>
  )
}

/* ─── Telegram icon ─────────────────────────────────────── */
function TelegramIcon({ size = 18 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path d="M11.994 2C6.477 2 2 6.477 2 12s4.477 10 9.994 10C17.52 22 22 17.523 22 12S17.52 2 11.994 2zm4.93 6.836l-1.694 7.98c-.125.558-.455.694-.92.432l-2.546-1.876-1.228 1.183c-.136.136-.25.25-.513.25l.183-2.594 4.726-4.27c.205-.183-.045-.284-.317-.101L8.1 14.73l-2.51-.784c-.546-.17-.558-.546.114-.808l9.773-3.768c.455-.168.853.101.447.466z" />
    </svg>
  )
}

/* ─── Search input ──────────────────────────────────────── */
function SearchInput({ value, onChange }) {
  return (
    <div style={{ position: 'relative' }}>
      <svg
        width={14}
        height={14}
        viewBox="0 0 24 24"
        fill="none"
        stroke="#ababab"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{
          position: 'absolute',
          left: 11,
          top: '50%',
          transform: 'translateY(-50%)',
          pointerEvents: 'none',
        }}
      >
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.35-4.35" />
      </svg>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Buscar comando..."
        style={{
          width: '100%',
          padding: '8px 12px 8px 32px',
          fontFamily: 'Roboto, sans-serif',
          fontSize: 13,
          color: '#373737',
          background: '#ffffff',
          border: '1px solid #e4e1db',
          borderRadius: 8,
          outline: 'none',
          transition: 'border-color 0.15s, box-shadow 0.15s',
        }}
        onFocus={(e) => {
          e.target.style.borderColor = '#76a72b'
          e.target.style.boxShadow = '0 0 0 3px rgba(118,167,43,0.1)'
        }}
        onBlur={(e) => {
          e.target.style.borderColor = '#e4e1db'
          e.target.style.boxShadow = 'none'
        }}
      />
      {value && (
        <button
          onClick={() => onChange('')}
          style={{
            position: 'absolute',
            right: 9,
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: '#ababab',
            display: 'flex',
            alignItems: 'center',
            padding: 2,
          }}
        >
          <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      )}
    </div>
  )
}

/* ─── Page ──────────────────────────────────────────────── */
export default function Comandos() {
  const [activeCat, setActiveCat]   = useState(COMANDOS[0].categoria)
  const [searchQuery, setSearchQuery] = useState('')

  const query = searchQuery.trim().toLowerCase()

  // If there's a search query, show all matching commands across categories
  const isSearching = query.length > 0

  const filteredCats = isSearching
    ? COMANDOS.map((cat) => ({
        ...cat,
        items: cat.items.filter(
          (item) =>
            item.cmd.toLowerCase().includes(query) ||
            item.desc.toLowerCase().includes(query) ||
            item.ejemplo.toLowerCase().includes(query) ||
            (item.args && item.args.toLowerCase().includes(query))
        ),
      })).filter((cat) => cat.items.length > 0)
    : COMANDOS.filter((c) => c.categoria === activeCat)

  const active = COMANDOS.find((c) => c.categoria === activeCat) ?? COMANDOS[0]
  const displayedCats = isSearching ? filteredCats : filteredCats
  const totalResults = displayedCats.reduce((s, c) => s + c.items.length, 0)

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

      {/* ── Page header ── */}
      <div style={{ padding: '32px 32px 0' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 24 }}>
          <div>
            <p className="label-caps" style={{ marginBottom: 6 }}>Bot de Telegram</p>
            <h1
              style={{
                fontFamily: '"Nunito Sans", sans-serif',
                fontWeight: 900,
                fontSize: 34,
                color: '#2a2a2a',
                letterSpacing: '-0.02em',
                lineHeight: 1,
              }}
            >
              Comandos
            </h1>
          </div>

          {/* Telegram badge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 14px',
              borderRadius: 8,
              background: '#eff6ff',
              border: '1px solid #bfdbfe',
              marginTop: 8,
            }}
          >
            <span style={{ color: '#0a66c2' }}>
              <TelegramIcon size={15} />
            </span>
            <span
              style={{
                fontFamily: '"Roboto Mono", monospace',
                fontSize: 12,
                color: '#1d4ed8',
                fontWeight: 500,
              }}
            >
              @AiS1rBot
            </span>
            <span
              style={{
                fontFamily: 'Roboto, sans-serif',
                fontSize: 10,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                color: '#93c5fd',
                paddingLeft: 6,
                borderLeft: '1px solid #bfdbfe',
              }}
            >
              {TOTAL_COMANDOS} comandos
            </span>
          </div>
        </div>

        {/* Search bar */}
        <div style={{ marginTop: 20, marginBottom: 0, maxWidth: 360 }}>
          <SearchInput value={searchQuery} onChange={setSearchQuery} />
        </div>
      </div>

      {/* ── Body: sidebar + content ── */}
      <div
        style={{
          display: 'flex',
          flex: 1,
          overflow: 'hidden',
          marginTop: 24,
        }}
      >
        {/* ── Left sidebar (categories) ── */}
        {!isSearching && (
          <div
            style={{
              width: 236,
              flexShrink: 0,
              borderRight: '1px solid #e4e1db',
              overflowY: 'auto',
              padding: '4px 16px 24px',
            }}
          >
            <p className="label-caps" style={{ marginBottom: 10, paddingLeft: 8 }}>
              Categorías
            </p>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 2 }}>
              {COMANDOS.map((cat) => {
                const isActive = activeCat === cat.categoria
                return (
                  <li key={cat.categoria}>
                    <button
                      onClick={() => setActiveCat(cat.categoria)}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 9,
                        padding: '9px 10px 9px 12px',
                        borderRadius: 7,
                        background: isActive ? cat.colorBg : 'transparent',
                        border: `1px solid ${isActive ? cat.color + '30' : 'transparent'}`,
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                        boxShadow: isActive ? `inset 3px 0 0 ${cat.color}` : 'none',
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.background = '#f7f6f3'
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.background = 'transparent'
                        }
                      }}
                    >
                      {/* Color dot */}
                      <div
                        style={{
                          width: 7,
                          height: 7,
                          borderRadius: '50%',
                          background: isActive ? cat.color : '#e4e1db',
                          flexShrink: 0,
                          transition: 'background 0.15s',
                        }}
                      />
                      <span
                        style={{
                          fontFamily: 'Roboto, sans-serif',
                          fontSize: 13,
                          fontWeight: isActive ? 600 : 400,
                          color: isActive ? cat.colorText : '#555',
                          flex: 1,
                          lineHeight: 1.35,
                        }}
                      >
                        {cat.categoria}
                      </span>
                      {/* Count badge */}
                      <span
                        style={{
                          fontFamily: '"Roboto Mono", monospace',
                          fontSize: 10,
                          fontWeight: 500,
                          padding: '1px 6px',
                          borderRadius: 10,
                          background: isActive ? cat.color + '20' : '#f7f6f3',
                          color: isActive ? cat.colorText : '#ababab',
                          border: `1px solid ${isActive ? cat.color + '40' : '#e4e1db'}`,
                          flexShrink: 0,
                        }}
                      >
                        {cat.items.length}
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>
        )}

        {/* ── Main content ── */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '0 32px 32px',
          }}
        >
          {isSearching ? (
            /* Search results view */
            <div>
              {/* Result count */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  marginBottom: 20,
                  paddingTop: 4,
                }}
              >
                <p
                  style={{
                    fontFamily: 'Roboto, sans-serif',
                    fontSize: 13,
                    color: '#878787',
                  }}
                >
                  {totalResults === 0
                    ? `Sin resultados para "${searchQuery}"`
                    : `${totalResults} resultado${totalResults !== 1 ? 's' : ''} para "${searchQuery}"`}
                </p>
              </div>

              {/* Results grouped by category */}
              {filteredCats.map((cat) => (
                <div key={cat.categoria} style={{ marginBottom: 28 }}>
                  {/* Category header */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      marginBottom: 12,
                    }}
                  >
                    <div
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        background: cat.color,
                        flexShrink: 0,
                      }}
                    />
                    <span
                      style={{
                        fontFamily: '"Nunito Sans", sans-serif',
                        fontWeight: 800,
                        fontSize: 14,
                        color: '#373737',
                        letterSpacing: '-0.01em',
                      }}
                    >
                      {cat.categoria}
                    </span>
                    <span
                      style={{
                        fontFamily: '"Roboto Mono", monospace',
                        fontSize: 10,
                        padding: '2px 7px',
                        borderRadius: 10,
                        background: cat.colorBg,
                        color: cat.colorText,
                        border: `1px solid ${cat.color}30`,
                      }}
                    >
                      {cat.items.length}
                    </span>
                  </div>

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
                      gap: 12,
                    }}
                  >
                    {cat.items.map((item) => (
                      <CmdCard
                        key={item.cmd}
                        item={item}
                        accentColor={cat.color}
                        accentText={cat.colorText}
                      />
                    ))}
                  </div>
                </div>
              ))}

              {/* Empty state */}
              {filteredCats.length === 0 && (
                <div
                  style={{
                    textAlign: 'center',
                    padding: '60px 20px',
                    color: '#ababab',
                  }}
                >
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: '50%',
                      background: '#f7f6f3',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 16px',
                      border: '1px solid #e4e1db',
                    }}
                  >
                    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#ababab" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="11" cy="11" r="8" />
                      <path d="m21 21-4.35-4.35" />
                    </svg>
                  </div>
                  <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: 14, color: '#878787' }}>
                    No se encontraron comandos
                  </p>
                  <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: 12, color: '#ababab', marginTop: 4 }}>
                    Intenta con otro término de búsqueda
                  </p>
                </div>
              )}
            </div>
          ) : (
            /* Category detail view */
            <div>
              {/* Category heading */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  marginBottom: 6,
                  paddingTop: 4,
                }}
              >
                <div
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    background: active.color,
                    flexShrink: 0,
                    boxShadow: `0 0 0 3px ${active.color}20`,
                  }}
                />
                <h2
                  style={{
                    fontFamily: '"Nunito Sans", sans-serif',
                    fontWeight: 900,
                    fontSize: 22,
                    color: '#2a2a2a',
                    letterSpacing: '-0.02em',
                  }}
                >
                  {active.categoria}
                </h2>
                <span
                  style={{
                    fontFamily: '"Roboto Mono", monospace',
                    fontSize: 11,
                    fontWeight: 500,
                    padding: '3px 10px',
                    borderRadius: 20,
                    background: active.colorBg,
                    color: active.colorText,
                    border: `1px solid ${active.color}30`,
                  }}
                >
                  {active.items.length} comandos
                </span>
              </div>

              <p
                style={{
                  fontFamily: 'Roboto, sans-serif',
                  fontSize: 12,
                  color: '#ababab',
                  marginBottom: 20,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                }}
              >
                <span style={{ color: '#0a66c2' }}>
                  <TelegramIcon size={12} />
                </span>
                Enviar via Telegram · @AiS1rBot
              </p>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
                  gap: 14,
                }}
              >
                {active.items.map((item) => (
                  <CmdCard
                    key={item.cmd}
                    item={item}
                    accentColor={active.color}
                    accentText={active.colorText}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

import { useQuery } from '@tanstack/react-query'
import { api } from '@/api/client'

/* ─── Category metadata ─────────────────────────────────── */
const CAT_META = {
  voz:         { label: 'Voz',         color: '#76a72b', bg: '#f0f7e6', text: '#4a7018' },
  tono:        { label: 'Tono',        color: '#0a66c2', bg: '#eff6ff', text: '#1d4ed8' },
  estructura:  { label: 'Estructura',  color: '#7c3aed', bg: '#f5f3ff', text: '#6d28d9' },
  vocabulario: { label: 'Vocabulario', color: '#d97706', bg: '#fffbeb', text: '#b45309' },
  postura:     { label: 'Postura',     color: '#e1306c', bg: '#fdf2f8', text: '#be185d' },
  formato:     { label: 'Formato',     color: '#059669', bg: '#ecfdf5', text: '#047857' },
  pilar:       { label: 'Pilar',       color: '#0891b2', bg: '#ecfeff', text: '#0e7490' },
  brand_voice: { label: 'Brand Voice', color: '#76a72b', bg: '#f0f7e6', text: '#4a7018' },
}

function getCat(cat) {
  const key = (cat ?? '').toLowerCase().replace(/\s+/g, '_')
  return CAT_META[key] ?? { label: cat ?? '—', color: '#878787', bg: '#f7f6f3', text: '#555' }
}

/* ─── Stat card ─────────────────────────────────────────── */
function StatCard({ label, value, accentColor, subtitle }) {
  return (
    <div
      className="card shadow-card"
      style={{ borderRadius: 10, overflow: 'hidden' }}
    >
      <div
        style={{
          height: 3,
          background: accentColor,
          borderRadius: '10px 10px 0 0',
        }}
      />
      <div style={{ padding: '20px 22px 22px' }}>
        <p className="label-caps" style={{ marginBottom: 10 }}>{label}</p>
        <p
          className="metric-num"
          style={{ color: accentColor, lineHeight: 1 }}
        >
          {value ?? '—'}
        </p>
        {subtitle && (
          <p
            style={{
              fontFamily: 'Roboto, sans-serif',
              fontSize: 11,
              color: '#ababab',
              marginTop: 6,
            }}
          >
            {subtitle}
          </p>
        )}
      </div>
    </div>
  )
}

/* ─── Skeleton placeholder ──────────────────────────────── */
function Skeleton({ height = 20, width = '100%', radius = 6 }) {
  return (
    <div
      style={{
        height,
        width,
        borderRadius: radius,
        background: 'linear-gradient(90deg, #ede9e3 0%, #f5f3ef 50%, #ede9e3 100%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.4s ease infinite',
      }}
    />
  )
}

/* ─── Category badge ────────────────────────────────────── */
function CatBadge({ cat }) {
  const meta = getCat(cat)
  return (
    <span
      style={{
        display: 'inline-block',
        fontFamily: 'Roboto, sans-serif',
        fontWeight: 500,
        fontSize: 10,
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
        padding: '2px 8px',
        borderRadius: 4,
        background: meta.bg,
        color: meta.text,
        border: `1px solid ${meta.color}30`,
        whiteSpace: 'nowrap',
        flexShrink: 0,
      }}
    >
      {meta.label}
    </span>
  )
}

/* ─── Regla row ─────────────────────────────────────────── */
function ReglaRow({ regla, isLast }) {
  const contenido = regla.contenido ?? regla.regla ?? regla.texto ?? '—'
  const peso = regla.peso

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 12,
        padding: '13px 20px',
        borderBottom: isLast ? 'none' : '1px solid #f0eeea',
        transition: 'background 0.15s',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.background = '#faf9f7' }}
      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
    >
      <CatBadge cat={regla.categoria} />
      <p
        style={{
          fontFamily: 'Roboto, sans-serif',
          fontSize: 13,
          color: '#373737',
          lineHeight: 1.55,
          flex: 1,
          minWidth: 0,
        }}
      >
        {contenido}
      </p>
      {peso != null && (
        <span
          style={{
            fontFamily: '"Roboto Mono", monospace',
            fontSize: 11,
            color: '#ababab',
            flexShrink: 0,
            paddingTop: 1,
          }}
        >
          {typeof peso === 'number' ? peso.toFixed(2) : peso}
        </span>
      )}
    </div>
  )
}

/* ─── Vocabulary pill ───────────────────────────────────── */
function VocabPill({ palabra, tipo }) {
  const isProhibida = tipo === 'prohibida' || tipo === 'prohibido'
  return (
    <span
      style={{
        display: 'inline-block',
        fontFamily: 'Roboto, sans-serif',
        fontSize: 12,
        padding: '4px 10px',
        borderRadius: 20,
        background: isProhibida ? '#fef2f2' : '#f0f7e6',
        color: isProhibida ? '#dc2626' : '#4a7018',
        border: `1px solid ${isProhibida ? '#fecaca' : '#c6e8a0'}`,
        lineHeight: 1.3,
      }}
    >
      {palabra}
    </span>
  )
}

/* ─── Progress bar ──────────────────────────────────────── */
function ProgressBar({ value, max, color = '#76a72b', label }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0
  return (
    <div style={{ marginTop: 20 }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 6,
        }}
      >
        <span
          style={{
            fontFamily: 'Roboto, sans-serif',
            fontSize: 12,
            color: '#878787',
          }}
        >
          {label}
        </span>
        <span
          style={{
            fontFamily: '"Roboto Mono", monospace',
            fontSize: 11,
            color: color,
            fontWeight: 500,
          }}
        >
          {pct}%
        </span>
      </div>
      <div
        style={{
          height: 5,
          borderRadius: 3,
          background: '#f0eeea',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${pct}%`,
            background: color,
            borderRadius: 3,
            transition: 'width 0.6s cubic-bezier(0.4,0,0.2,1)',
          }}
        />
      </div>
    </div>
  )
}

/* ─── Page ──────────────────────────────────────────────── */
export default function Cerebro() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['cerebro'],
    queryFn: api.cerebro,
    refetchInterval: 60_000,
  })

  const reglas      = data?.reglas      ?? []
  const vocabulario = data?.vocabulario ?? []
  const stats       = data?.stats       ?? {}

  const prohibidas = vocabulario.filter((v) => v.tipo === 'prohibida' || v.tipo === 'prohibido')
  const preferidas = vocabulario.filter((v) => v.tipo === 'preferida' || v.tipo === 'preferido')

  const totalReglas     = stats.total_reglas    ?? reglas.length
  const aprendidas      = stats.reglas_aprendidas ?? stats.aprendidas ?? 0
  const eventosSemana   = stats.eventos_semana   ?? stats.eventos     ?? 0
  const consolidaciones = stats.consolidaciones  ?? 0

  return (
    <div className="animate-fade-in" style={{ padding: '0 0 40px' }}>

      {/* ── Page header ── */}
      <div style={{ padding: '32px 32px 24px' }}>
        <p className="label-caps" style={{ marginBottom: 6 }}>Memoria adaptativa</p>
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
          Cerebro Hans
        </h1>
        <p
          style={{
            fontFamily: 'Roboto, sans-serif',
            fontSize: 13,
            color: '#878787',
            marginTop: 6,
          }}
        >
          Mimir · Reglas de voz, tono y vocabulario aprendidas por el sistema
        </p>
      </div>

      {/* ── Error banner ── */}
      {isError && (
        <div
          style={{
            margin: '0 32px 20px',
            padding: '12px 16px',
            borderRadius: 8,
            background: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#dc2626',
            fontFamily: 'Roboto, sans-serif',
            fontSize: 13,
          }}
        >
          Error cargando datos del Cerebro. Verifica la conexión con el backend.
        </div>
      )}

      {/* ── Stat cards ── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 16,
          padding: '0 32px 28px',
        }}
      >
        {isLoading ? (
          [...Array(4)].map((_, i) => (
            <div key={i} className="card" style={{ borderRadius: 10, padding: '22px 22px 24px' }}>
              <Skeleton height={10} width={80} radius={4} />
              <div style={{ marginTop: 14 }}>
                <Skeleton height={36} width={60} radius={6} />
              </div>
            </div>
          ))
        ) : (
          <>
            <StatCard
              label="Total reglas"
              value={totalReglas}
              accentColor="#76a72b"
              subtitle="en el sistema"
            />
            <StatCard
              label="Aprendidas"
              value={aprendidas}
              accentColor="#0a66c2"
              subtitle="por interacción"
            />
            <StatCard
              label="Eventos semana"
              value={eventosSemana}
              accentColor="#d97706"
              subtitle="aprobaciones y rechazos"
            />
            <StatCard
              label="Consolidaciones"
              value={consolidaciones}
              accentColor="#7c3aed"
              subtitle="ciclos dominicales"
            />
          </>
        )}
      </div>

      {/* ── Main content grid ── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr',
          gap: 20,
          padding: '0 32px',
        }}
      >
        {/* Left: Reglas activas */}
        <div className="card shadow-card" style={{ borderRadius: 10, overflow: 'hidden' }}>
          {/* Card header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px 20px',
              borderBottom: '1px solid #f0eeea',
            }}
          >
            <p className="label-caps" style={{ margin: 0 }}>Reglas activas</p>
            {!isLoading && (
              <span
                style={{
                  fontFamily: '"Roboto Mono", monospace',
                  fontSize: 11,
                  fontWeight: 500,
                  padding: '3px 9px',
                  borderRadius: 20,
                  background: '#f0f7e6',
                  color: '#4a7018',
                  border: '1px solid #c6e8a0',
                }}
              >
                {reglas.length}
              </span>
            )}
          </div>

          {/* Progress bar */}
          {!isLoading && totalReglas > 0 && (
            <div style={{ padding: '0 20px 4px' }}>
              <ProgressBar
                value={aprendidas}
                max={totalReglas}
                color="#76a72b"
                label="Reglas aprendidas por interacción"
              />
            </div>
          )}

          {/* Rows */}
          {isLoading ? (
            <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[...Array(7)].map((_, i) => (
                <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <Skeleton height={22} width={72} radius={4} />
                  <Skeleton height={14} radius={4} />
                </div>
              ))}
            </div>
          ) : reglas.length === 0 ? (
            <div
              style={{
                padding: '48px 20px',
                textAlign: 'center',
                color: '#ababab',
                fontFamily: 'Roboto, sans-serif',
                fontSize: 13,
              }}
            >
              Sin reglas activas todavía
            </div>
          ) : (
            <div style={{ overflow: 'auto', maxHeight: 460 }}>
              {reglas.map((r, i) => (
                <ReglaRow key={r.id ?? i} regla={r} isLast={i === reglas.length - 1} />
              ))}
            </div>
          )}
        </div>

        {/* Right: Vocabulario */}
        <div className="card shadow-card" style={{ borderRadius: 10, overflow: 'hidden' }}>
          {/* Card header */}
          <div
            style={{
              padding: '16px 20px',
              borderBottom: '1px solid #f0eeea',
            }}
          >
            <p className="label-caps" style={{ margin: 0 }}>Vocabulario controlado</p>
          </div>

          <div style={{ padding: '20px' }}>

            {/* Prohibidas */}
            <div style={{ marginBottom: 24 }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  marginBottom: 12,
                }}
              >
                <div
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    background: '#dc2626',
                    flexShrink: 0,
                  }}
                />
                <span
                  style={{
                    fontFamily: 'Roboto, sans-serif',
                    fontWeight: 600,
                    fontSize: 11,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    color: '#dc2626',
                  }}
                >
                  Prohibidas
                </span>
                {!isLoading && (
                  <span
                    style={{
                      marginLeft: 'auto',
                      fontFamily: '"Roboto Mono", monospace',
                      fontSize: 10,
                      color: '#ababab',
                    }}
                  >
                    {prohibidas.length}
                  </span>
                )}
              </div>

              {isLoading ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} height={26} width={70 + i * 10} radius={20} />
                  ))}
                </div>
              ) : prohibidas.length === 0 ? (
                <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: 12, color: '#ababab' }}>
                  Sin palabras prohibidas registradas
                </p>
              ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {prohibidas.map((v, i) => (
                    <VocabPill key={v.id ?? i} palabra={v.palabra ?? v.word} tipo="prohibida" />
                  ))}
                </div>
              )}
            </div>

            {/* Divider */}
            <div style={{ height: 1, background: '#f0eeea', margin: '0 0 20px' }} />

            {/* Preferidas */}
            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  marginBottom: 12,
                }}
              >
                <div
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    background: '#76a72b',
                    flexShrink: 0,
                  }}
                />
                <span
                  style={{
                    fontFamily: 'Roboto, sans-serif',
                    fontWeight: 600,
                    fontSize: 11,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    color: '#4a7018',
                  }}
                >
                  Preferidas
                </span>
                {!isLoading && (
                  <span
                    style={{
                      marginLeft: 'auto',
                      fontFamily: '"Roboto Mono", monospace',
                      fontSize: 10,
                      color: '#ababab',
                    }}
                  >
                    {preferidas.length}
                  </span>
                )}
              </div>

              {isLoading ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} height={26} width={80 + i * 12} radius={20} />
                  ))}
                </div>
              ) : preferidas.length === 0 ? (
                <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: 12, color: '#ababab' }}>
                  Sin palabras preferidas registradas
                </p>
              ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {preferidas.map((v, i) => (
                    <VocabPill key={v.id ?? i} palabra={v.palabra ?? v.word} tipo="preferida" />
                  ))}
                </div>
              )}
            </div>

            {/* Bottom note */}
            {!isLoading && (prohibidas.length > 0 || preferidas.length > 0) && (
              <p
                style={{
                  fontFamily: 'Roboto, sans-serif',
                  fontSize: 11,
                  color: '#ababab',
                  marginTop: 20,
                  paddingTop: 16,
                  borderTop: '1px solid #f0eeea',
                  lineHeight: 1.5,
                }}
              >
                Actualizado automáticamente por Mimir en cada consolidación dominical.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ── Shimmer keyframe inline ── */}
      <style>{`
        @keyframes shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  )
}

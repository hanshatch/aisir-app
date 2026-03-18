import { useQuery } from '@tanstack/react-query'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { api } from '@/api/client'
import { ago } from '@/lib/utils'

// ─── Brand constants ────────────────────────────────────────────────────────

const NET_COLORS = {
  linkedin:   { color: '#86a43b', bg: '#efeded' },
  instagram:  { color: '#878787', bg: '#efeded' },
  x:          { color: '#373737', bg: '#efeded' },
  tiktok:     { color: '#878787', bg: '#efeded' },
  facebook:   { color: '#86a43b', bg: '#efeded' },
  newsletter: { color: '#86a43b', bg: '#efeded' },
  articulo:   { color: '#86a43b', bg: '#efeded' },
  carousel:   { color: '#86a43b', bg: '#fff7ed' },
  whatsapp:   { color: '#86a43b', bg: '#efeded' },
}

const STATUS_STYLES = {
  pendiente_aprobacion: { label: 'Pendiente',  color: '#86a43b', bg: '#efeded', border: '#efeded' },
  aprobado:             { label: 'Aprobado',   color: '#86a43b', bg: '#efeded', border: '#bbf7d0' },
  rechazado:            { label: 'Rechazado',  color: '#878787', bg: '#efeded', border: '#ababab' },
  borrador:             { label: 'Borrador',   color: '#878787', bg: '#efeded', border: '#ababab' },
  publicado:            { label: 'Publicado',  color: '#86a43b', bg: '#efeded', border: '#efeded' },
}

const PILAR_COLORS = {
  ia:              { color: '#86a43b', bg: '#efeded' },
  posicionamiento: { color: '#86a43b', bg: '#efeded' },
  data:            { color: '#86a43b', bg: '#ecfeff' },
  agencia:         { color: '#86a43b', bg: '#efeded' },
  academia:        { color: '#86a43b', bg: '#efeded' },
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function netStyle(tipo) {
  return NET_COLORS[tipo] ?? { color: '#878787', bg: '#efeded' }
}

function scoreColor(score) {
  if (score >= 80) return '#86a43b'
  if (score >= 60) return '#86a43b'
  return '#878787'
}

function scoreBg(score) {
  if (score >= 80) return '#efeded'
  if (score >= 60) return '#efeded'
  return '#efeded'
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatusBadge({ status }) {
  const s = STATUS_STYLES[status] ?? STATUS_STYLES.borrador
  return (
    <span
      style={{
        fontFamily: 'Roboto Mono, monospace',
        fontSize: 9,
        fontWeight: 500,
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        padding: '2px 7px',
        borderRadius: 4,
        background: s.bg,
        color: s.color,
        border: `1px solid ${s.border}`,
        whiteSpace: 'nowrap',
      }}
    >
      {s.label}
    </span>
  )
}

function NetworkBadge({ tipo }) {
  const { color, bg } = netStyle(tipo)
  return (
    <span
      style={{
        fontFamily: 'Roboto Mono, monospace',
        fontSize: 9,
        fontWeight: 500,
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        padding: '2px 7px',
        borderRadius: 4,
        background: bg,
        color: color,
        border: `1px solid ${color}30`,
        whiteSpace: 'nowrap',
      }}
    >
      {tipo}
    </span>
  )
}

function StatCard({ label, value, color = '#86a43b', loading }) {
  if (loading) {
    return (
      <div
        className="animate-pulse"
        style={{
          background: '#ffffff',
          border: '1px solid #ababab',
          borderRadius: 10,
          boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.05)',
          height: 88,
        }}
      />
    )
  }
  return (
    <div
      style={{
        background: '#ffffff',
        border: '1px solid #ababab',
        borderRadius: 10,
        boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.05)',
        padding: '16px 20px',
        borderTop: `3px solid ${color}`,
      }}
    >
      <p className="label-caps" style={{ marginBottom: 8 }}>{label}</p>
      <p
        className="metric-num"
        style={{ color: '#373737' }}
      >
        {value ?? '—'}
      </p>
    </div>
  )
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div
      style={{
        background: '#ffffff',
        border: '1px solid #ababab',
        borderRadius: 6,
        padding: '8px 12px',
        fontFamily: 'Roboto, sans-serif',
        fontSize: 12,
        color: '#373737',
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
      }}
    >
      <p style={{ color: '#878787', marginBottom: 4, fontFamily: 'Roboto Mono, monospace', fontSize: 10 }}>{label}</p>
      <p style={{ fontWeight: 600 }}>{payload[0]?.value} piezas</p>
    </div>
  )
}

// ─── Skeleton rows ────────────────────────────────────────────────────────────

function SkeletonRow() {
  return (
    <div
      className="animate-pulse"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '14px 20px',
        borderBottom: '1px solid #efeded',
      }}
    >
      <div style={{ width: 3, height: 40, borderRadius: 2, background: '#ababab', flexShrink: 0 }} />
      <div style={{ flex: 1 }}>
        <div style={{ width: '40%', height: 10, background: '#efeded', borderRadius: 4, marginBottom: 8 }} />
        <div style={{ width: '70%', height: 13, background: '#efeded', borderRadius: 4, marginBottom: 6 }} />
        <div style={{ width: '25%', height: 9, background: '#efeded', borderRadius: 4 }} />
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Pipeline() {
  const { data, isLoading } = useQuery({
    queryKey: ['pipeline'],
    queryFn: api.pipeline,
    refetchInterval: 60_000,
  })
  const { data: temasData, isLoading: temasLoading } = useQuery({
    queryKey: ['temas'],
    queryFn: api.temas,
  })

  const items = data?.items ?? data ?? []
  const temas = temasData?.items ?? temasData ?? []

  // Stat counts
  const total      = items.length
  const pendientes = items.filter((i) => i.estado === 'pendiente_aprobacion').length
  const aprobados  = items.filter((i) => i.estado === 'aprobado').length
  const publicados = items.filter((i) => i.estado === 'publicado').length

  // Bar chart data
  const redCount = {}
  items.forEach((item) => {
    const k = item.tipo ?? item.red ?? 'otros'
    redCount[k] = (redCount[k] ?? 0) + 1
  })
  const barData = Object.entries(redCount).map(([name, value]) => ({ name, value }))

  return (
    <div style={{ padding: '32px 32px 48px' }} className="animate-fade-in">
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <p className="label-caps" style={{ marginBottom: 6 }}>Sistema · Pipeline</p>
        <h1
          style={{
            fontFamily: 'Roboto, sans-serif',
            fontWeight: 900,
            fontSize: 34,
            color: '#373737',
            letterSpacing: '-0.02em',
            lineHeight: 1.1,
          }}
        >
          Pipeline
        </h1>
        <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: 14, color: '#878787', marginTop: 4 }}>
          Contenido en proceso · últimos 7 días
        </p>
      </div>

      {/* Stat cards */}
      <div
        className="stagger"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 14,
          marginBottom: 24,
        }}
      >
        <StatCard label="Total en pipeline" value={isLoading ? null : total}      color="#86a43b" loading={isLoading} />
        <StatCard label="Pendientes"         value={isLoading ? null : pendientes} color="#86a43b" loading={isLoading} />
        <StatCard label="Aprobados"          value={isLoading ? null : aprobados}  color="#86a43b" loading={isLoading} />
        <StatCard label="Publicados"         value={isLoading ? null : publicados} color="#86a43b" loading={isLoading} />
      </div>

      {/* Main layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: 20, alignItems: 'start' }}>

        {/* LEFT — Content list */}
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #ababab',
            borderRadius: 10,
            boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.05)',
            overflow: 'hidden',
          }}
        >
          {/* Card header */}
          <div
            style={{
              padding: '14px 20px',
              borderBottom: '1px solid #efeded',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <p className="label-caps" style={{ margin: 0 }}>Contenido en pipeline</p>
            <span
              style={{
                fontFamily: 'Roboto Mono, monospace',
                fontSize: 11,
                fontWeight: 500,
                padding: '2px 10px',
                borderRadius: 20,
                background: '#efeded',
                color: '#86a43b',
                border: '1px solid #c7dfa0',
              }}
            >
              {items.length}
            </span>
          </div>

          {/* List */}
          {isLoading ? (
            <div>
              {[...Array(6)].map((_, i) => <SkeletonRow key={i} />)}
            </div>
          ) : items.length === 0 ? (
            <div style={{ padding: '48px 20px', textAlign: 'center' }}>
              <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: 14, color: '#ababab' }}>
                Sin contenido en pipeline
              </p>
            </div>
          ) : (
            <div>
              {items.map((item, idx) => {
                const tipo = item.tipo ?? item.red ?? 'otros'
                const { color: netColor } = netStyle(tipo)
                return (
                  <div
                    key={item.id ?? idx}
                    style={{
                      display: 'flex',
                      alignItems: 'stretch',
                      gap: 0,
                      borderBottom: idx < items.length - 1 ? '1px solid #efeded' : 'none',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = '#efeded' }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
                  >
                    {/* Left network accent border */}
                    <div
                      style={{
                        width: 3,
                        background: netColor,
                        flexShrink: 0,
                        borderRadius: 0,
                        opacity: 0.7,
                      }}
                    />
                    <div style={{ flex: 1, padding: '13px 18px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5, flexWrap: 'wrap' }}>
                        <NetworkBadge tipo={tipo} />
                        <StatusBadge status={item.estado} />
                      </div>
                      <p
                        style={{
                          fontFamily: 'Roboto, sans-serif',
                          fontSize: 13.5,
                          fontWeight: 500,
                          color: '#373737',
                          lineHeight: 1.35,
                          marginBottom: 4,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {item.titulo ?? item.title ?? `Pieza #${item.id}`}
                      </p>
                      <p
                        style={{
                          fontFamily: 'Roboto Mono, monospace',
                          fontSize: 10,
                          color: '#ababab',
                        }}
                      >
                        #{item.id} · {ago(item.created_at ?? item.fecha)}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* RIGHT — Charts + Temas */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Bar chart card */}
          <div
            style={{
              background: '#ffffff',
              border: '1px solid #ababab',
              borderRadius: 10,
              boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.05)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                padding: '14px 20px',
                borderBottom: '1px solid #efeded',
              }}
            >
              <p className="label-caps" style={{ margin: 0 }}>Distribución por red · 7 días</p>
            </div>
            <div style={{ padding: '16px 12px 12px' }}>
              {isLoading ? (
                <div
                  className="animate-pulse"
                  style={{ height: 160, background: '#efeded', borderRadius: 6 }}
                />
              ) : barData.length === 0 ? (
                <p
                  style={{
                    fontFamily: 'Roboto, sans-serif',
                    fontSize: 13,
                    color: '#ababab',
                    textAlign: 'center',
                    padding: '40px 0',
                  }}
                >
                  Sin datos
                </p>
              ) : (
                <ResponsiveContainer width="100%" height={165}>
                  <BarChart
                    data={barData}
                    barSize={16}
                    margin={{ top: 4, right: 4, left: -24, bottom: 4 }}
                  >
                    <XAxis
                      dataKey="name"
                      tick={{ fontFamily: 'Roboto Mono, monospace', fontSize: 9, fill: '#ababab' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontFamily: 'Roboto Mono, monospace', fontSize: 9, fill: '#ababab' }}
                      axisLine={false}
                      tickLine={false}
                      allowDecimals={false}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: '#efeded' }} />
                    <Bar dataKey="value" radius={[3, 3, 0, 0]}>
                      {barData.map((entry) => (
                        <Cell
                          key={entry.name}
                          fill={NET_COLORS[entry.name]?.color ?? '#ababab'}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Temas pendientes card */}
          <div
            style={{
              background: '#ffffff',
              border: '1px solid #ababab',
              borderRadius: 10,
              boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.05)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                padding: '14px 20px',
                borderBottom: '1px solid #efeded',
              }}
            >
              <p className="label-caps" style={{ margin: 0 }}>Temas pendientes</p>
            </div>

            {temasLoading ? (
              <div style={{ padding: '12px 20px' }}>
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="animate-pulse"
                    style={{
                      height: 44,
                      background: '#efeded',
                      borderRadius: 6,
                      marginBottom: 8,
                    }}
                  />
                ))}
              </div>
            ) : temas.length === 0 ? (
              <div style={{ padding: '32px 20px', textAlign: 'center' }}>
                <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: 13, color: '#ababab' }}>
                  Sin temas pendientes
                </p>
              </div>
            ) : (
              <div>
                {temas.slice(0, 8).map((t, i) => {
                  const pilarStyle = PILAR_COLORS[t.pilar] ?? { color: '#878787', bg: '#efeded' }
                  const sc = t.score
                  return (
                    <div
                      key={t.id ?? i}
                      style={{
                        padding: '10px 20px',
                        borderBottom: i < Math.min(temas.length, 8) - 1 ? '1px solid #efeded' : 'none',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                      }}
                    >
                      {/* Score */}
                      {sc != null && (
                        <div
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: 8,
                            background: scoreBg(sc),
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          <span
                            style={{
                              fontFamily: 'Nunito Sans, sans-serif',
                              fontWeight: 800,
                              fontSize: 13,
                              color: scoreColor(sc),
                              lineHeight: 1,
                            }}
                          >
                            {sc}
                          </span>
                        </div>
                      )}
                      {/* Info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p
                          style={{
                            fontFamily: 'Roboto, sans-serif',
                            fontSize: 12.5,
                            fontWeight: 500,
                            color: '#373737',
                            lineHeight: 1.3,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            marginBottom: t.pilar ? 4 : 0,
                          }}
                        >
                          {t.titulo ?? t.tema ?? t.title}
                        </p>
                        {t.pilar && (
                          <span
                            style={{
                              fontFamily: 'Roboto Mono, monospace',
                              fontSize: 9,
                              fontWeight: 500,
                              textTransform: 'uppercase',
                              letterSpacing: '0.08em',
                              padding: '1px 6px',
                              borderRadius: 3,
                              background: pilarStyle.bg,
                              color: pilarStyle.color,
                            }}
                          >
                            {t.pilar}
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

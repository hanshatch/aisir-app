import { useQuery } from '@tanstack/react-query'
import {
  BarChart, Bar, LineChart, Line, CartesianGrid,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from 'recharts'
import { api } from '@/api/client'

// ─── Brand constants ────────────────────────────────────────────────────────

const NET_COLORS = {
  linkedin:   '#0a66c2',
  instagram:  '#e1306c',
  x:          '#374151',
  tiktok:     '#ee1d52',
  facebook:   '#1877f2',
  newsletter: '#d97706',
  articulo:   '#76a72b',
  carousel:   '#ea580c',
  whatsapp:   '#16a34a',
}

// ─── Stat card ───────────────────────────────────────────────────────────────

function StatCard({ label, value, color = '#76a72b', sublabel, loading }) {
  if (loading) {
    return (
      <div
        className="animate-pulse"
        style={{
          background: '#ffffff',
          border: '1px solid #e4e1db',
          borderRadius: 10,
          boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.05)',
          height: 96,
        }}
      />
    )
  }
  return (
    <div
      style={{
        background: '#ffffff',
        border: '1px solid #e4e1db',
        borderRadius: 10,
        boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.05)',
        padding: '18px 22px 16px',
        borderTop: `3px solid ${color}`,
      }}
    >
      <p className="label-caps" style={{ marginBottom: 10 }}>{label}</p>
      <p
        className="metric-num"
        style={{ color: '#373737' }}
      >
        {value ?? '—'}
      </p>
      {sublabel && (
        <p
          style={{
            fontFamily: 'Roboto, sans-serif',
            fontSize: 11.5,
            color: '#ababab',
            marginTop: 5,
          }}
        >
          {sublabel}
        </p>
      )}
    </div>
  )
}

// ─── Tooltip ─────────────────────────────────────────────────────────────────

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div
      style={{
        background: '#ffffff',
        border: '1px solid #e4e1db',
        borderRadius: 6,
        padding: '10px 14px',
        fontFamily: 'Roboto, sans-serif',
        fontSize: 12,
        color: '#373737',
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
      }}
    >
      <p
        style={{
          fontFamily: 'Roboto Mono, monospace',
          fontSize: 10,
          color: '#878787',
          marginBottom: 6,
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
        }}
      >
        {label}
      </p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color ?? '#373737', fontWeight: 600, marginBottom: i < payload.length - 1 ? 3 : 0 }}>
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  )
}

// ─── Chart card wrapper ───────────────────────────────────────────────────────

function ChartCard({ title, loading, skeletonHeight = 200, children }) {
  return (
    <div
      style={{
        background: '#ffffff',
        border: '1px solid #e4e1db',
        borderRadius: 10,
        boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.05)',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          padding: '14px 22px',
          borderBottom: '1px solid #f0eeea',
        }}
      >
        <p className="label-caps" style={{ margin: 0 }}>{title}</p>
      </div>
      <div style={{ padding: '20px 16px 16px' }}>
        {loading ? (
          <div
            className="animate-pulse"
            style={{ height: skeletonHeight, background: '#f7f6f3', borderRadius: 6 }}
          />
        ) : children}
      </div>
    </div>
  )
}

// ─── Empty state ─────────────────────────────────────────────────────────────

function EmptyChart({ height = 200 }) {
  return (
    <div
      style={{
        height,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: 13, color: '#ababab' }}>
        Sin datos disponibles
      </p>
    </div>
  )
}

// ─── Legend dot ──────────────────────────────────────────────────────────────

function LegendItem({ color, label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <div
        style={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          background: color,
          flexShrink: 0,
        }}
      />
      <span
        style={{
          fontFamily: 'Roboto, sans-serif',
          fontSize: 12,
          color: '#878787',
        }}
      >
        {label}
      </span>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Metricas() {
  const { data, isLoading } = useQuery({
    queryKey: ['metricas'],
    queryFn: api.metricas,
    refetchInterval: 120_000,
  })

  const stats   = data?.stats ?? {}
  const porTipo = data?.por_tipo ?? data?.por_red ?? []
  const semanal = data?.semanal ?? data?.actividad_semanal ?? []

  const barData = Array.isArray(porTipo)
    ? porTipo
    : Object.entries(porTipo).map(([name, value]) => ({ name, value }))

  const tasaAprobacion =
    stats.tasa_aprobacion != null
      ? `${Number(stats.tasa_aprobacion).toFixed(0)}%`
      : stats.aprobado && stats.generado
      ? `${Math.round((stats.aprobado / stats.generado) * 100)}%`
      : '—'

  const generado  = stats.generado ?? stats.total
  const aprobado  = stats.aprobado
  const rechazado = stats.rechazado

  return (
    <div style={{ padding: '32px 32px 48px' }} className="animate-fade-in">
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <p className="label-caps" style={{ marginBottom: 6 }}>Sistema · Métricas</p>
        <h1
          style={{
            fontFamily: '"Nunito Sans", sans-serif',
            fontWeight: 900,
            fontSize: 34,
            color: '#2a2a2a',
            letterSpacing: '-0.02em',
            lineHeight: 1.1,
          }}
        >
          Métricas
        </h1>
        <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: 14, color: '#878787', marginTop: 4 }}>
          Rendimiento del sistema · últimos 30 días
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
        <StatCard
          label="Contenido generado"
          value={isLoading ? null : generado}
          color="#76a72b"
          sublabel="piezas totales"
          loading={isLoading}
        />
        <StatCard
          label="Aprobado"
          value={isLoading ? null : aprobado}
          color="#16a34a"
          sublabel="piezas aprobadas"
          loading={isLoading}
        />
        <StatCard
          label="Rechazado"
          value={isLoading ? null : rechazado}
          color="#dc2626"
          sublabel="piezas rechazadas"
          loading={isLoading}
        />
        <StatCard
          label="Tasa de aprobación"
          value={isLoading ? null : tasaAprobacion}
          color="#0a66c2"
          sublabel="del contenido generado"
          loading={isLoading}
        />
      </div>

      {/* Chart row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 20,
        }}
      >
        {/* Bar chart — Contenido por tipo / red */}
        <ChartCard title="Contenido por tipo / red" loading={isLoading} skeletonHeight={210}>
          {barData.length === 0 ? (
            <EmptyChart height={210} />
          ) : (
            <ResponsiveContainer width="100%" height={210}>
              <BarChart
                data={barData}
                barSize={18}
                margin={{ top: 4, right: 8, left: -24, bottom: 4 }}
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
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f7f6f3' }} />
                <Bar dataKey="value" radius={[3, 3, 0, 0]} name="Piezas">
                  {barData.map((entry) => (
                    <Cell
                      key={entry.name}
                      fill={NET_COLORS[entry.name] ?? '#ccc9c2'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        {/* Line chart — Actividad semanal */}
        <ChartCard title="Actividad semanal" loading={isLoading} skeletonHeight={210}>
          {semanal.length === 0 ? (
            <EmptyChart height={210} />
          ) : (
            <>
              {/* Legend */}
              <div
                style={{
                  display: 'flex',
                  gap: 20,
                  marginBottom: 12,
                  paddingLeft: 8,
                }}
              >
                <LegendItem color="#76a72b" label="Generado" />
                <LegendItem color="#0a66c2" label="Aprobado" />
              </div>
              <ResponsiveContainer width="100%" height={185}>
                <LineChart
                  data={semanal}
                  margin={{ top: 4, right: 8, left: -24, bottom: 4 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0eeea" vertical={false} />
                  <XAxis
                    dataKey="semana"
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
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="generado"
                    stroke="#76a72b"
                    strokeWidth={2}
                    dot={{ fill: '#76a72b', r: 3, strokeWidth: 0 }}
                    activeDot={{ r: 5, fill: '#76a72b', stroke: '#ffffff', strokeWidth: 2 }}
                    name="Generado"
                  />
                  <Line
                    type="monotone"
                    dataKey="aprobado"
                    stroke="#0a66c2"
                    strokeWidth={2}
                    dot={{ fill: '#0a66c2', r: 3, strokeWidth: 0 }}
                    activeDot={{ r: 5, fill: '#0a66c2', stroke: '#ffffff', strokeWidth: 2 }}
                    name="Aprobado"
                  />
                </LineChart>
              </ResponsiveContainer>
            </>
          )}
        </ChartCard>
      </div>
    </div>
  )
}

import { useQuery } from '@tanstack/react-query'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  LineChart, Line, CartesianGrid,
} from 'recharts'
import { api } from '@/api/client'
import { RED_COLORS } from '@/lib/utils'

function StatCard({ label, value, delta, color = '#7ec832', loading }) {
  if (loading) {
    return (
      <div
        className="h-24 animate-pulse"
        style={{ background: '#0d110d', border: '1px solid #1e2d1a', borderRadius: 4 }}
      />
    )
  }
  return (
    <div
      style={{
        background: '#0d110d',
        border: '1px solid #1e2d1a',
        borderRadius: 4,
        padding: '16px 20px',
        borderTop: `2px solid ${color}`,
      }}
    >
      <p className="font-mono text-[10px] uppercase tracking-widest mb-2" style={{ color: '#3d5535' }}>
        {label}
      </p>
      <p
        className="font-display font-black text-3xl"
        style={{ color, textShadow: `0 0 16px ${color}35` }}
      >
        {value ?? '—'}
      </p>
      {delta != null && (
        <p
          className="font-mono text-[10px] mt-1"
          style={{ color: delta >= 0 ? '#7ec832' : '#e04545' }}
        >
          {delta >= 0 ? '+' : ''}{delta}% vs semana anterior
        </p>
      )}
    </div>
  )
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div
      style={{
        background: '#0d110d',
        border: '1px solid #1e2d1a',
        borderRadius: 3,
        padding: '8px 12px',
        fontFamily: '"Share Tech Mono", monospace',
        fontSize: 11,
        color: '#d4e6c8',
      }}
    >
      <p style={{ color: '#5c7a50', marginBottom: 4 }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color ?? '#7ec832' }}>
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  )
}

export default function Metricas() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['metricas'],
    queryFn: api.metricas,
    refetchInterval: 120_000,
  })

  const stats = data?.stats ?? {}
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

  return (
    <div className="p-6 animate-fade-in">
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-display font-black text-2xl text-ink">Métricas</h1>
        <p className="font-mono text-xs mt-1 text-muted">
          Rendimiento del sistema · últimos 30 días
        </p>
      </div>

      {isError && (
        <div
          className="mb-4 px-4 py-3 font-mono text-xs"
          style={{ background: '#1a0808', border: '1px solid #e04545', borderRadius: 3, color: '#e04545' }}
        >
          Error cargando métricas
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 mb-6">
        <StatCard label="Contenido generado" value={stats.generado ?? stats.total} color="#7ec832" loading={isLoading} />
        <StatCard label="Aprobado" value={stats.aprobado} color="#4f9eff" loading={isLoading} />
        <StatCard label="Rechazado" value={stats.rechazado} color="#e04545" loading={isLoading} />
        <StatCard label="Tasa de aprobación" value={tasaAprobacion} color="#e879f9" loading={isLoading} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {/* Bar chart — contenido por tipo */}
        <div
          style={{
            background: '#0d110d',
            border: '1px solid #1e2d1a',
            borderRadius: 4,
          }}
        >
          <div
            className="px-4 py-3"
            style={{ borderBottom: '1px solid #1e2d1a' }}
          >
            <p className="font-mono text-xs uppercase tracking-widest text-muted">
              Contenido por tipo / red
            </p>
          </div>
          <div className="p-4">
            {isLoading ? (
              <div className="h-44 animate-pulse" style={{ background: '#111611', borderRadius: 3 }} />
            ) : barData.length === 0 ? (
              <p className="font-mono text-xs text-muted text-center py-10">Sin datos</p>
            ) : (
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={barData} barSize={18} margin={{ top: 4, right: 4, left: -20, bottom: 4 }}>
                  <XAxis
                    dataKey="name"
                    tick={{ fontFamily: '"Share Tech Mono"', fontSize: 9, fill: '#5c7a50' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontFamily: '"Share Tech Mono"', fontSize: 9, fill: '#5c7a50' }}
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" radius={[2, 2, 0, 0]}>
                    {barData.map((entry) => (
                      <Cell
                        key={entry.name}
                        fill={RED_COLORS[entry.name] ?? '#2a3d24'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Line chart — actividad semanal */}
        <div
          style={{
            background: '#0d110d',
            border: '1px solid #1e2d1a',
            borderRadius: 4,
          }}
        >
          <div
            className="px-4 py-3"
            style={{ borderBottom: '1px solid #1e2d1a' }}
          >
            <p className="font-mono text-xs uppercase tracking-widest text-muted">
              Actividad semanal
            </p>
          </div>
          <div className="p-4">
            {isLoading ? (
              <div className="h-44 animate-pulse" style={{ background: '#111611', borderRadius: 3 }} />
            ) : semanal.length === 0 ? (
              <p className="font-mono text-xs text-muted text-center py-10">Sin datos</p>
            ) : (
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={semanal} margin={{ top: 4, right: 4, left: -20, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e2d1a" />
                  <XAxis
                    dataKey="semana"
                    tick={{ fontFamily: '"Share Tech Mono"', fontSize: 9, fill: '#5c7a50' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontFamily: '"Share Tech Mono"', fontSize: 9, fill: '#5c7a50' }}
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="generado"
                    stroke="#7ec832"
                    strokeWidth={2}
                    dot={{ fill: '#7ec832', r: 3 }}
                    activeDot={{ r: 5, fill: '#7ec832', stroke: '#060908', strokeWidth: 2 }}
                    name="Generado"
                  />
                  <Line
                    type="monotone"
                    dataKey="aprobado"
                    stroke="#4f9eff"
                    strokeWidth={2}
                    dot={{ fill: '#4f9eff', r: 3 }}
                    activeDot={{ r: 5 }}
                    name="Aprobado"
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

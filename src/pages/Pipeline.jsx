import { useQuery } from '@tanstack/react-query'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { api } from '@/api/client'
import { ago } from '@/lib/utils'
import { RED_COLORS } from '@/lib/utils'

const STATUS_STYLES = {
  pendiente_aprobacion: { label: 'Pendiente',  bg: '#2a1f00', color: '#e09820', border: '#e09820' },
  aprobado:             { label: 'Aprobado',   bg: '#0d1f08', color: '#7ec832', border: '#7ec832' },
  rechazado:            { label: 'Rechazado',  bg: '#1a0808', color: '#e04545', border: '#e04545' },
  borrador:             { label: 'Borrador',   bg: '#111611', color: '#5c7a50', border: '#2a3d24' },
  publicado:            { label: 'Publicado',  bg: '#081420', color: '#4f9eff', border: '#4f9eff' },
}

const PILARS_COLORS = {
  ia:           '#a78bfa',
  posicionamiento: '#4f9eff',
  data:         '#34d399',
  agencia:      '#f59e0b',
  academia:     '#e879f9',
}

function StatusBadge({ status }) {
  const s = STATUS_STYLES[status] ?? STATUS_STYLES.borrador
  return (
    <span
      className="font-mono text-[9px] uppercase tracking-wide px-1.5 py-0.5"
      style={{
        background: s.bg,
        color: s.color,
        border: `1px solid ${s.border}40`,
        borderRadius: 2,
      }}
    >
      {s.label}
    </span>
  )
}

function NetworkTag({ tipo }) {
  const color = RED_COLORS[tipo] ?? '#5c7a50'
  return (
    <span
      className="font-mono text-[9px] uppercase tracking-wide px-1.5 py-0.5"
      style={{
        background: color + '18',
        color,
        border: `1px solid ${color}40`,
        borderRadius: 2,
      }}
    >
      {tipo}
    </span>
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
      <p style={{ color: '#5c7a50', marginBottom: 2 }}>{label}</p>
      <p>{payload[0]?.value} piezas</p>
    </div>
  )
}

export default function Pipeline() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['pipeline'],
    queryFn: api.pipeline,
    refetchInterval: 60_000,
  })
  const { data: temasData } = useQuery({
    queryKey: ['temas'],
    queryFn: api.temas,
  })

  const items = data?.items ?? data ?? []
  const temas = temasData?.items ?? temasData ?? []

  // Build bar chart data from items by tipo
  const redCount = {}
  items.forEach((item) => {
    const k = item.tipo ?? item.red ?? 'otros'
    redCount[k] = (redCount[k] ?? 0) + 1
  })
  const barData = Object.entries(redCount).map(([name, value]) => ({ name, value }))

  return (
    <div className="p-6 animate-fade-in">
      <div className="mb-6">
        <h1 className="font-display font-black text-2xl text-ink">Pipeline</h1>
        <p className="font-mono text-xs mt-1 text-muted">
          Contenido en proceso · últimos 7 días
        </p>
      </div>

      {isError && (
        <div
          className="mb-4 px-4 py-3 font-mono text-xs"
          style={{ background: '#1a0808', border: '1px solid #e04545', borderRadius: 3, color: '#e04545' }}
        >
          Error cargando datos del pipeline
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* LEFT: Content list */}
        <div className="lg:col-span-3">
          <div
            style={{
              background: '#0d110d',
              border: '1px solid #1e2d1a',
              borderRadius: 4,
            }}
          >
            <div
              className="px-4 py-3 flex items-center justify-between"
              style={{ borderBottom: '1px solid #1e2d1a' }}
            >
              <p className="font-mono text-xs uppercase tracking-widest text-muted">
                Contenido en pipeline
              </p>
              <span
                className="font-mono text-[10px] px-2 py-0.5"
                style={{ background: '#7ec83218', color: '#7ec832', border: '1px solid #7ec83240', borderRadius: 2 }}
              >
                {items.length}
              </span>
            </div>

            {isLoading ? (
              <div className="p-4 space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-16 animate-pulse" style={{ background: '#111611', borderRadius: 3 }} />
                ))}
              </div>
            ) : items.length === 0 ? (
              <div className="px-4 py-10 text-center">
                <p className="font-mono text-xs text-muted">Sin contenido en pipeline</p>
              </div>
            ) : (
              <div className="divide-y" style={{ borderColor: '#161d16' }}>
                {items.map((item) => (
                  <div key={item.id} className="px-4 py-3 flex items-start justify-between gap-3 hover:bg-surface2 transition-colors">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <NetworkTag tipo={item.tipo ?? item.red} />
                        <StatusBadge status={item.estado} />
                      </div>
                      <p className="text-sm text-ink leading-snug line-clamp-1 font-medium">
                        {item.titulo ?? item.title ?? `Pieza #${item.id}`}
                      </p>
                      <p className="font-mono text-[10px] text-muted mt-0.5">
                        #{item.id} · {ago(item.created_at ?? item.fecha)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: Charts + Temas */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          {/* Bar chart */}
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
                Distribución por red (7 días)
              </p>
            </div>
            <div className="p-4">
              {barData.length === 0 ? (
                <p className="font-mono text-xs text-muted text-center py-4">Sin datos</p>
              ) : (
                <ResponsiveContainer width="100%" height={160}>
                  <BarChart data={barData} barSize={14} margin={{ top: 4, right: 4, left: -20, bottom: 4 }}>
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

          {/* Temas pendientes */}
          <div
            style={{
              background: '#0d110d',
              border: '1px solid #1e2d1a',
              borderRadius: 4,
              flex: 1,
            }}
          >
            <div
              className="px-4 py-3"
              style={{ borderBottom: '1px solid #1e2d1a' }}
            >
              <p className="font-mono text-xs uppercase tracking-widest text-muted">
                Temas pendientes
              </p>
            </div>
            <div className="divide-y" style={{ borderColor: '#161d16' }}>
              {(temas.slice(0, 8)).map((t, i) => (
                <div key={t.id ?? i} className="px-4 py-2.5 flex items-center justify-between gap-2">
                  <p className="text-xs text-ink line-clamp-1 flex-1">
                    {t.titulo ?? t.tema ?? t.title}
                  </p>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {t.pilar && (
                      <span
                        className="font-mono text-[9px] px-1.5 py-0.5"
                        style={{
                          background: (PILARS_COLORS[t.pilar] ?? '#9b72e8') + '20',
                          color: PILARS_COLORS[t.pilar] ?? '#9b72e8',
                          border: `1px solid ${PILARS_COLORS[t.pilar] ?? '#9b72e8'}40`,
                          borderRadius: 2,
                        }}
                      >
                        {t.pilar}
                      </span>
                    )}
                    {t.score != null && (
                      <span
                        className="font-mono text-[10px] font-bold"
                        style={{ color: '#9b72e8' }}
                      >
                        {t.score}
                      </span>
                    )}
                  </div>
                </div>
              ))}
              {temas.length === 0 && (
                <p className="font-mono text-xs text-muted text-center py-6">Sin temas pendientes</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

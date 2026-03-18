import { useEffect, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/api/client'
import { ago } from '@/lib/utils'

const LEVEL_STYLES = {
  INFO:    { color: '#7ec832', bg: '#0d1f08', border: '#7ec83240', label: 'INFO' },
  ERROR:   { color: '#e04545', bg: '#1a0808', border: '#e0454540', label: 'ERR!' },
  WARNING: { color: '#e09820', bg: '#2a1f00', border: '#e0982040', label: 'WARN' },
  WARN:    { color: '#e09820', bg: '#2a1f00', border: '#e0982040', label: 'WARN' },
  DEBUG:   { color: '#5c7a50', bg: '#111611', border: '#2a3d24',   label: 'DBG ' },
}

const AGENT_COLORS = {
  aisir:     '#4f9eff',
  huginn:    '#a78bfa',
  bragi:     '#34d399',
  loki:      '#f59e0b',
  ratatoskr: '#10b981',
  kvasir:    '#e879f9',
  idunn:     '#fb923c',
  odin:      '#f43f5e',
  frigg:     '#06b6d4',
  mimir:     '#8b5cf6',
}

function LogLine({ log }) {
  const level = (log.level ?? log.nivel ?? 'INFO').toUpperCase()
  const s = LEVEL_STYLES[level] ?? LEVEL_STYLES.INFO
  const agente = log.agente ?? log.agent ?? 'sistema'
  const agentColor = AGENT_COLORS[agente.toLowerCase()] ?? '#5c7a50'
  const msg = log.mensaje ?? log.message ?? log.msg ?? ''

  return (
    <div
      className="flex items-start gap-3 px-4 py-2 font-mono text-xs group hover:bg-surface2 transition-colors"
      style={{ borderBottom: '1px solid #0f160f' }}
    >
      {/* Level badge */}
      <span
        className="flex-shrink-0 text-[9px] px-1.5 py-0.5 mt-0.5"
        style={{
          background: s.bg,
          color: s.color,
          border: `1px solid ${s.border}`,
          borderRadius: 2,
          minWidth: 36,
          textAlign: 'center',
        }}
      >
        {s.label}
      </span>

      {/* Agent */}
      <span
        className="flex-shrink-0 text-[10px] mt-0.5"
        style={{ color: agentColor, minWidth: 72 }}
      >
        [{agente}]
      </span>

      {/* Message */}
      <span className="flex-1 text-[11px] leading-relaxed break-all" style={{ color: '#8aab78' }}>
        {msg}
      </span>

      {/* Time */}
      <span
        className="flex-shrink-0 text-[9px] mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ color: '#3d5535' }}
      >
        {ago(log.created_at ?? log.timestamp ?? log.fecha)}
      </span>
    </div>
  )
}

export default function Actividad() {
  const bottomRef = useRef(null)
  const { data, isLoading, isError } = useQuery({
    queryKey: ['actividad'],
    queryFn: () => api.actividad(200),
    refetchInterval: 30_000,
  })

  const logs = data?.logs ?? data ?? []

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [logs.length])

  return (
    <div className="p-6 animate-fade-in h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div>
          <h1 className="font-display font-black text-2xl text-ink">Actividad</h1>
          <p className="font-mono text-xs mt-1 text-muted">
            Log del sistema · auto-refresh 30s
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="inline-block w-2 h-2 rounded-full animate-pulse-dot"
            style={{ background: '#7ec832', color: '#7ec832' }}
          />
          <span className="font-mono text-[10px] text-muted">Live</span>
        </div>
      </div>

      {isError && (
        <div
          className="mb-4 px-4 py-3 font-mono text-xs flex-shrink-0"
          style={{ background: '#1a0808', border: '1px solid #e04545', borderRadius: 3, color: '#e04545' }}
        >
          Error cargando actividad
        </div>
      )}

      {/* Terminal */}
      <div
        className="flex-1 overflow-y-auto"
        style={{
          background: '#060908',
          border: '1px solid #1e2d1a',
          borderRadius: 4,
          fontFamily: '"Share Tech Mono", monospace',
        }}
      >
        {/* Terminal title bar */}
        <div
          className="flex items-center gap-2 px-4 py-2 flex-shrink-0"
          style={{ background: '#0d110d', borderBottom: '1px solid #1e2d1a' }}
        >
          <div className="flex gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#e04545' }} />
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#e09820' }} />
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#7ec832' }} />
          </div>
          <span className="font-mono text-[10px] ml-2" style={{ color: '#3d5535' }}>
            hatch-agents · system.log · {logs.length} entradas
          </span>
        </div>

        {isLoading ? (
          <div className="p-6 space-y-2">
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="h-6 animate-pulse"
                style={{ background: '#0d110d', borderRadius: 2, width: `${60 + Math.random() * 35}%` }}
              />
            ))}
          </div>
        ) : logs.length === 0 ? (
          <div className="px-4 py-10 text-center">
            <p className="font-mono text-xs text-muted">Sin actividad registrada</p>
          </div>
        ) : (
          <div>
            {logs.map((log, i) => (
              <LogLine key={log.id ?? i} log={log} />
            ))}
            <div ref={bottomRef} />
          </div>
        )}
      </div>
    </div>
  )
}

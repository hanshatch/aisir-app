import { useEffect, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/api/client'
import { ago } from '@/lib/utils'

const LEVEL = {
  INFO:    { color: '#86a43b', bg: '#efeded', border: '#efeded', label: 'INFO' },
  ERROR:   { color: '#878787', bg: '#efeded', border: '#ababab', label: 'ERR'  },
  WARNING: { color: '#86a43b', bg: '#efeded', border: '#efeded', label: 'WARN' },
  WARN:    { color: '#86a43b', bg: '#efeded', border: '#efeded', label: 'WARN' },
  DEBUG:   { color: '#9ca3af', bg: '#efeded', border: '#e5e7eb', label: 'DBG'  },
}

const AGENT_COLORS = {
  aisir: '#86a43b', huginn: '#86a43b', bragi: '#86a43b', loki: '#86a43b',
  floki: '#86a43b', kvasir: '#86a43b', idunn: '#86a43b', odin: '#878787',
  frigg: '#86a43b', mimir: '#86a43b',
}

function LogLine({ log }) {
  const lvl    = (log.level ?? log.nivel ?? 'INFO').toUpperCase()
  const s      = LEVEL[lvl] ?? LEVEL.INFO
  const agente = log.agente ?? log.agent ?? 'sistema'
  const ac     = AGENT_COLORS[agente.toLowerCase()] ?? '#878787'
  const msg    = log.mensaje ?? log.message ?? log.msg ?? ''

  return (
    <div
      style={{
        display: 'flex', alignItems: 'flex-start', gap: 10,
        padding: '10px 16px',
        borderBottom: '1px solid #efeded',
        transition: 'background 0.1s',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.background = '#efeded' }}
      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
    >
      <span style={{
        flexShrink: 0,
        fontFamily: '"Roboto Mono", monospace', fontSize: 9, fontWeight: 600,
        padding: '3px 7px',
        background: s.bg, color: s.color,
        border: `1px solid ${s.border}`,
        borderRadius: 4,
        minWidth: 38, textAlign: 'center',
        marginTop: 1,
      }}>
        {s.label}
      </span>

      <span style={{
        flexShrink: 0,
        fontFamily: 'Roboto, sans-serif', fontSize: 11, fontWeight: 700,
        color: ac, minWidth: 82, marginTop: 1,
      }}>
        {agente}
      </span>

      <span style={{
        flex: 1, fontSize: 13, lineHeight: 1.5,
        color: '#373737', fontFamily: 'Roboto, sans-serif',
      }}>
        {msg}
      </span>

      <span style={{
        flexShrink: 0,
        fontFamily: '"Roboto Mono"', fontSize: 10,
        color: '#ababab', marginTop: 2, whiteSpace: 'nowrap',
      }}>
        {ago(log.created_at ?? log.timestamp ?? log.fecha)}
      </span>
    </div>
  )
}

export default function Actividad() {
  const bottomRef = useRef(null)
  const { data, isLoading } = useQuery({
    queryKey: ['actividad'],
    queryFn:  () => api.actividad(200),
    refetchInterval: 30_000,
  })

  const logs = data?.logs ?? data ?? []

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [logs.length])

  return (
    <div style={{ padding: '32px 32px 0', height: '100%', display: 'flex', flexDirection: 'column' }}>

      {/* Header */}
      <div style={{ marginBottom: 24, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexShrink: 0 }}>
        <div>
          <p className="label-caps" style={{ marginBottom: 6 }}>Sistema · Log</p>
          <h1 style={{
            fontFamily: 'Roboto, sans-serif', fontWeight: 900,
            fontSize: 34, color: '#373737', letterSpacing: '-0.02em',
          }}>
            Actividad
          </h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <span className="status-dot animate-pulse-dot" style={{ background: '#86a43b' }} />
          <span style={{ fontFamily: 'Roboto, sans-serif', fontSize: 12, color: '#878787' }}>
            Live · refresh 30s
          </span>
        </div>
      </div>

      {/* Log panel */}
      <div
        className="card shadow-card"
        style={{
          flex: 1, display: 'flex', flexDirection: 'column',
          overflow: 'hidden', marginBottom: 32,
        }}
      >
        {/* Title bar */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '11px 16px',
          background: '#efeded',
          borderBottom: '1px solid #ababab',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', gap: 5 }}>
            {['#878787', '#86a43b', '#86a43b'].map((c) => (
              <span key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c, opacity: 0.7, display: 'block' }} />
            ))}
          </div>
          <span style={{ fontFamily: '"Roboto Mono"', fontSize: 10, color: '#ababab', marginLeft: 4 }}>
            hatch-agents · system.log
          </span>
          <span style={{
            marginLeft: 'auto',
            fontFamily: '"Roboto Mono"', fontSize: 10,
            padding: '2px 8px',
            background: '#efeded',
            border: '1px solid #86a43b30',
            borderRadius: 4,
            color: '#86a43b', fontWeight: 600,
          }}>
            {logs.length} entradas
          </span>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', background: '#ffffff' }}>
          {isLoading ? (
            <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[...Array(10)].map((_, i) => (
                <div key={i} style={{
                  height: 24, background: '#efeded', borderRadius: 4,
                  width: `${50 + (i * 7) % 45}%`,
                }} />
              ))}
            </div>
          ) : logs.length === 0 ? (
            <div style={{ padding: 48, textAlign: 'center' }}>
              <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: 13, color: '#ababab' }}>
                Sin actividad registrada
              </p>
            </div>
          ) : (
            <div>
              {[...logs].reverse().map((log, i) => (
                <LogLine key={log.id ?? i} log={log} />
              ))}
              <div ref={bottomRef} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

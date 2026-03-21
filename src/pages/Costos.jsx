import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '../api/client'
import {
  DollarSign, Zap, Bot, GitBranch, Cpu, TrendingUp,
  Search, FileText, Share2, Palette, CalendarDays, Brain,
  Eye, Sparkles, Send,
} from 'lucide-react'

const PERIODOS = [
  { label: '7d',  dias: 7 },
  { label: '30d', dias: 30 },
  { label: '90d', dias: 90 },
  { label: '1a',  dias: 365 },
]

const PROVEEDOR_META = {
  openai:   { color: '#10a37f', label: 'OpenAI' },
  deepseek: { color: '#4f6ef7', label: 'DeepSeek' },
  gemini:   { color: '#8b6cf6', label: 'Gemini' },
}

const AGENTE_META = {
  huginn:  { color: '#a78bfa', label: 'Huginn',  icon: Search },
  bragi:   { color: '#34d399', label: 'Bragi',   icon: FileText },
  loki:    { color: '#f59e0b', label: 'Loki',    icon: Share2 },
  floki:   { color: '#10b981', label: 'Floki',   icon: TrendingUp },
  kvasir:  { color: '#e879f9', label: 'Kvasir',  icon: Sparkles },
  idunn:   { color: '#fb923c', label: 'Idunn',   icon: Palette },
  odin:    { color: '#f43f5e', label: 'Odin',    icon: Eye },
  frigg:   { color: '#06b6d4', label: 'Frigg',   icon: CalendarDays },
  mimir:   { color: '#8b5cf6', label: 'Mimir',   icon: Brain },
  aisir:   { color: '#4f9eff', label: 'AiSir',   icon: Bot },
  muninn:  { color: '#878787', label: 'Muninn',  icon: Brain },
}

function fmt(n) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K'
  return n.toString()
}

function usd(n) {
  if (n < 0.01) return '$' + n.toFixed(4)
  return '$' + n.toFixed(2)
}

function StatCard({ icon: Icon, label, value, sub, color = '#86a43b' }) {
  return (
    <div style={{
      background: '#ffffff', border: '1px solid #e4e1db', borderRadius: 10,
      padding: '18px 20px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <div style={{
          width: 30, height: 30, borderRadius: 8,
          background: color + '12', border: `1px solid ${color}25`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon size={14} color={color} />
        </div>
        <span style={{
          fontFamily: 'Roboto, sans-serif', fontSize: 11, fontWeight: 600,
          color: '#ababab', textTransform: 'uppercase', letterSpacing: '0.05em',
        }}>{label}</span>
      </div>
      <p style={{
        fontFamily: '"Roboto Mono", monospace', fontSize: 24, fontWeight: 700,
        color: '#373737', lineHeight: 1,
      }}>{value}</p>
      {sub && (
        <p style={{
          fontFamily: 'Roboto, sans-serif', fontSize: 11,
          color: '#ababab', marginTop: 4,
        }}>{sub}</p>
      )}
    </div>
  )
}

function BarRow({ label, value, maxValue, color, extra }) {
  const pct = maxValue > 0 ? Math.max((value / maxValue) * 100, 2) : 0
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
      <span style={{
        fontFamily: 'Roboto, sans-serif', fontSize: 12, fontWeight: 600,
        color: '#373737', width: 100, flexShrink: 0,
        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
      }}>{label}</span>
      <div style={{ flex: 1, height: 22, background: '#f5f3f0', borderRadius: 5, overflow: 'hidden' }}>
        <div style={{
          width: `${pct}%`, height: '100%',
          background: `linear-gradient(90deg, ${color}, ${color}99)`,
          borderRadius: 5,
          display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
          paddingRight: 8, minWidth: 40,
        }}>
          <span style={{
            fontFamily: '"Roboto Mono", monospace', fontSize: 10, fontWeight: 600,
            color: '#ffffff',
          }}>{extra}</span>
        </div>
      </div>
      <span style={{
        fontFamily: '"Roboto Mono", monospace', fontSize: 11,
        color: '#878787', width: 65, textAlign: 'right', flexShrink: 0,
      }}>{fmt(value)} tok</span>
    </div>
  )
}

function MiniChart({ data }) {
  if (!data || data.length === 0) return null
  const maxCosto = Math.max(...data.map(d => d.costo_usd), 0.001)
  const barW = Math.max(Math.floor(500 / Math.max(data.length, 1)), 4)

  return (
    <div style={{
      display: 'flex', alignItems: 'flex-end', gap: 2,
      height: 80, padding: '0 4px',
    }}>
      {data.map((d, i) => {
        const h = Math.max((d.costo_usd / maxCosto) * 70, 2)
        return (
          <div
            key={i}
            title={`${d.fecha}: ${usd(d.costo_usd)} · ${fmt(d.total_tokens)} tokens · ${d.llamadas} llamadas`}
            style={{
              width: barW, height: h,
              background: 'linear-gradient(to top, #86a43b, #86a43bcc)',
              borderRadius: '3px 3px 0 0',
              cursor: 'default',
              transition: 'opacity 0.1s',
            }}
            onMouseEnter={e => { e.currentTarget.style.opacity = '0.7' }}
            onMouseLeave={e => { e.currentTarget.style.opacity = '1' }}
          />
        )
      })}
    </div>
  )
}

export default function Costos() {
  const [dias, setDias] = useState(30)

  const { data, isLoading } = useQuery({
    queryKey: ['costos', dias],
    queryFn: () => api.costos(dias),
    staleTime: 60_000,
    refetchOnWindowFocus: true,
  })

  const t = data?.totales ?? { llamadas: 0, prompt_tokens: 0, completion_tokens: 0, total_tokens: 0, costo_usd: 0 }

  return (
    <div style={{ padding: '28px 32px 40px', background: '#efeded', minHeight: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <p style={{
            fontFamily: 'Roboto, sans-serif', fontSize: 9, fontWeight: 700,
            letterSpacing: '0.18em', textTransform: 'uppercase', color: '#ababab',
            marginBottom: 6,
          }}>Operaciones · Costos</p>
          <h1 style={{
            fontFamily: 'Roboto, sans-serif', fontWeight: 900,
            fontSize: 26, color: '#373737', letterSpacing: '-0.02em',
          }}>Consumo de tokens</h1>
        </div>

        {/* Periodo */}
        <div style={{ display: 'flex', gap: 4 }}>
          {PERIODOS.map(p => (
            <button
              key={p.dias}
              onClick={() => setDias(p.dias)}
              style={{
                fontFamily: '"Roboto Mono", monospace', fontSize: 11, fontWeight: 600,
                padding: '6px 14px', borderRadius: 6, cursor: 'pointer',
                border: dias === p.dias ? '1px solid #86a43b' : '1px solid #e4e1db',
                background: dias === p.dias ? '#86a43b' : '#ffffff',
                color: dias === p.dias ? '#ffffff' : '#878787',
                transition: 'all 0.12s',
              }}
            >{p.label}</button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16,
        }}>
          {[...Array(4)].map((_, i) => (
            <div key={i} style={{
              height: 110, background: '#ffffff', borderRadius: 10,
              border: '1px solid #e4e1db', animation: 'pulse 1.5s infinite',
            }} />
          ))}
        </div>
      ) : (
        <>
          {/* Stats row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
            <StatCard
              icon={DollarSign} label="Costo total" color="#86a43b"
              value={usd(t.costo_usd)}
              sub={`${t.llamadas} llamadas en ${dias}d`}
            />
            <StatCard
              icon={Zap} label="Tokens totales" color="#f59e0b"
              value={fmt(t.total_tokens)}
              sub={`${fmt(t.prompt_tokens)} in · ${fmt(t.completion_tokens)} out`}
            />
            <StatCard
              icon={Cpu} label="Promedio / llamada" color="#4f9eff"
              value={t.llamadas > 0 ? fmt(Math.round(t.total_tokens / t.llamadas)) : '0'}
              sub={t.llamadas > 0 ? `${usd(t.costo_usd / t.llamadas)} por llamada` : 'Sin datos'}
            />
            <StatCard
              icon={TrendingUp} label="Costo / día" color="#e879f9"
              value={dias > 0 ? usd(t.costo_usd / dias) : '$0'}
              sub={`Proyección mensual: ${usd((t.costo_usd / Math.max(dias, 1)) * 30)}`}
            />
          </div>

          {/* Tendencia + Modelos */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
            {/* Tendencia diaria */}
            <div style={{
              background: '#ffffff', border: '1px solid #e4e1db', borderRadius: 10,
              padding: '18px 20px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            }}>
              <p style={{
                fontFamily: 'Roboto, sans-serif', fontSize: 12, fontWeight: 700,
                color: '#373737', marginBottom: 16,
              }}>Tendencia diaria</p>
              {data?.por_dia?.length > 0 ? (
                <>
                  <MiniChart data={data.por_dia} />
                  <div style={{
                    display: 'flex', justifyContent: 'space-between',
                    marginTop: 6, padding: '0 4px',
                  }}>
                    <span style={{ fontFamily: '"Roboto Mono", monospace', fontSize: 9, color: '#ababab' }}>
                      {data.por_dia[0]?.fecha}
                    </span>
                    <span style={{ fontFamily: '"Roboto Mono", monospace', fontSize: 9, color: '#ababab' }}>
                      {data.por_dia[data.por_dia.length - 1]?.fecha}
                    </span>
                  </div>
                </>
              ) : (
                <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: 13, color: '#ababab', textAlign: 'center', padding: 20 }}>
                  Sin datos en este periodo
                </p>
              )}
            </div>

            {/* Por modelo */}
            <div style={{
              background: '#ffffff', border: '1px solid #e4e1db', borderRadius: 10,
              padding: '18px 20px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            }}>
              <p style={{
                fontFamily: 'Roboto, sans-serif', fontSize: 12, fontWeight: 700,
                color: '#373737', marginBottom: 16,
              }}>Por modelo</p>
              {data?.por_modelo?.length > 0 ? (
                <>
                  {(() => {
                    const max = Math.max(...data.por_modelo.map(m => m.total_tokens))
                    return data.por_modelo.map((m, i) => (
                      <BarRow
                        key={i}
                        label={m.modelo}
                        value={m.total_tokens}
                        maxValue={max}
                        color={PROVEEDOR_META[m.proveedor]?.color ?? '#878787'}
                        extra={usd(m.costo_usd)}
                      />
                    ))
                  })()}
                </>
              ) : (
                <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: 13, color: '#ababab', textAlign: 'center', padding: 20 }}>
                  Sin datos
                </p>
              )}
            </div>
          </div>

          {/* Agentes + Flujos */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
            {/* Por agente */}
            <div style={{
              background: '#ffffff', border: '1px solid #e4e1db', borderRadius: 10,
              padding: '18px 20px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            }}>
              <p style={{
                fontFamily: 'Roboto, sans-serif', fontSize: 12, fontWeight: 700,
                color: '#373737', marginBottom: 16,
              }}>Por agente</p>
              {data?.por_agente?.length > 0 ? (
                <>
                  {(() => {
                    const max = Math.max(...data.por_agente.map(a => a.total_tokens))
                    return data.por_agente.map((a, i) => {
                      const meta = AGENTE_META[a.agente] ?? { color: '#878787', label: a.agente }
                      return (
                        <BarRow
                          key={i}
                          label={meta.label}
                          value={a.total_tokens}
                          maxValue={max}
                          color={meta.color}
                          extra={usd(a.costo_usd)}
                        />
                      )
                    })
                  })()}
                </>
              ) : (
                <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: 13, color: '#ababab', textAlign: 'center', padding: 20 }}>
                  Sin datos
                </p>
              )}
            </div>

            {/* Por flujo */}
            <div style={{
              background: '#ffffff', border: '1px solid #e4e1db', borderRadius: 10,
              padding: '18px 20px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            }}>
              <p style={{
                fontFamily: 'Roboto, sans-serif', fontSize: 12, fontWeight: 700,
                color: '#373737', marginBottom: 16,
              }}>Por flujo</p>
              {data?.por_flujo?.length > 0 ? (
                <>
                  {(() => {
                    const max = Math.max(...data.por_flujo.map(f => f.total_tokens))
                    return data.por_flujo.map((f, i) => (
                      <BarRow
                        key={i}
                        label={f.flujo}
                        value={f.total_tokens}
                        maxValue={max}
                        color="#86a43b"
                        extra={usd(f.costo_usd)}
                      />
                    ))
                  })()}
                </>
              ) : (
                <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: 13, color: '#ababab', textAlign: 'center', padding: 20 }}>
                  Sin datos
                </p>
              )}
            </div>
          </div>

          {/* Por proveedor resumen */}
          <div style={{
            background: '#ffffff', border: '1px solid #e4e1db', borderRadius: 10,
            padding: '18px 20px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          }}>
            <p style={{
              fontFamily: 'Roboto, sans-serif', fontSize: 12, fontWeight: 700,
              color: '#373737', marginBottom: 16,
            }}>Resumen por proveedor</p>
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.max(data?.por_proveedor?.length ?? 1, 1)}, 1fr)`, gap: 16 }}>
              {(data?.por_proveedor ?? []).map((p, i) => {
                const meta = PROVEEDOR_META[p.proveedor] ?? { color: '#878787', label: p.proveedor }
                return (
                  <div key={i} style={{
                    padding: '14px 16px',
                    background: meta.color + '08',
                    border: `1px solid ${meta.color}20`,
                    borderRadius: 8,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                      <div style={{
                        width: 8, height: 8, borderRadius: '50%',
                        background: meta.color,
                      }} />
                      <span style={{
                        fontFamily: 'Roboto, sans-serif', fontSize: 13, fontWeight: 700,
                        color: '#373737',
                      }}>{meta.label}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontFamily: 'Roboto, sans-serif', fontSize: 11, color: '#ababab' }}>Costo</span>
                      <span style={{ fontFamily: '"Roboto Mono", monospace', fontSize: 12, fontWeight: 600, color: '#373737' }}>{usd(p.costo_usd)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontFamily: 'Roboto, sans-serif', fontSize: 11, color: '#ababab' }}>Tokens</span>
                      <span style={{ fontFamily: '"Roboto Mono", monospace', fontSize: 12, color: '#878787' }}>{fmt(p.total_tokens)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontFamily: 'Roboto, sans-serif', fontSize: 11, color: '#ababab' }}>Llamadas</span>
                      <span style={{ fontFamily: '"Roboto Mono", monospace', fontSize: 12, color: '#878787' }}>{p.llamadas}</span>
                    </div>
                  </div>
                )
              })}
            </div>
            {(!data?.por_proveedor || data.por_proveedor.length === 0) && (
              <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: 13, color: '#ababab', textAlign: 'center', padding: 20 }}>
                Los datos de consumo se registran automáticamente con cada llamada a los modelos LLM.
              </p>
            )}
          </div>
        </>
      )}
    </div>
  )
}

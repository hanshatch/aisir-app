import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { CheckCircle, RefreshCw, ChevronDown, ChevronUp, Zap } from 'lucide-react'
import { api } from '@/api/client'

// ─── Constants ───────────────────────────────────────────────────────────────

const RED_ICONS = {
  linkedin:  '💼',
  instagram: '📸',
  x:         '🐦',
  tiktok:    '🎵',
  youtube:   '▶️',
  whatsapp:  '💬',
  sistema:   '⚙️',
}

const RED_COLORS = {
  linkedin:  '#0077b5',
  instagram: '#e1306c',
  x:         '#14171a',
  tiktok:    '#ff0050',
  youtube:   '#ff0000',
  whatsapp:  '#25d366',
  sistema:   '#ababab',
}

const ESTADO_STYLES = {
  borrador:      { label: 'Borrador',      color: '#878787', bg: '#f5f5f5',  border: '#e4e1db' },
  aprobado:      { label: 'Aprobado',      color: '#86a43b', bg: '#f0f6e8',  border: '#c3d88a' },
  en_ejecucion:  { label: 'En ejecución',  color: '#6366f1', bg: '#eef2ff',  border: '#c7d2fe' },
  completado:    { label: 'Completado',    color: '#ababab', bg: '#f5f5f5',  border: '#e4e1db' },
}

const DIAS_LABEL = {
  lunes: 'Lun', martes: 'Mar', miercoles: 'Mié',
  jueves: 'Jue', viernes: 'Vie', sabado: 'Sáb', domingo: 'Dom',
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmtMes(mesNombre) {
  if (!mesNombre) return ''
  return mesNombre.charAt(0).toUpperCase() + mesNombre.slice(1)
}

function fmtFecha(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })
}

// ─── Chips ────────────────────────────────────────────────────────────────────

function EstadoBadge({ estado }) {
  const s = ESTADO_STYLES[estado] ?? ESTADO_STYLES.borrador
  return (
    <span style={{
      background: s.bg, color: s.color, border: `1px solid ${s.border}`,
      borderRadius: 5, padding: '3px 10px',
      fontFamily: 'Roboto, sans-serif', fontSize: 10, fontWeight: 700,
      textTransform: 'uppercase', letterSpacing: '0.08em',
    }}>
      {s.label}
    </span>
  )
}

function RedChip({ red }) {
  const color = RED_COLORS[red] || '#ababab'
  const icon  = RED_ICONS[red]  || '•'
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      background: color + '12', color, border: `1px solid ${color}30`,
      borderRadius: 4, padding: '2px 7px',
      fontFamily: 'Roboto, sans-serif', fontSize: 10, fontWeight: 600,
      whiteSpace: 'nowrap',
    }}>
      <span style={{ fontSize: 11 }}>{icon}</span>
      {red}
    </span>
  )
}

// ─── Día row ──────────────────────────────────────────────────────────────────

function DiaRow({ dia, piezas }) {
  const label = DIAS_LABEL[dia] || dia
  const redes = piezas.filter(p => p.red !== 'sistema').map(p => p.red)
  const sistemaPiezas = piezas.filter(p => p.red === 'sistema')

  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: 12,
      padding: '8px 0',
      borderBottom: '1px solid #f0eeea',
    }}>
      <span style={{
        width: 32, flexShrink: 0, textAlign: 'center',
        fontFamily: '"Roboto Mono", monospace', fontSize: 10,
        fontWeight: 600, color: '#ababab',
        paddingTop: 3,
      }}>
        {label}
      </span>
      <div style={{ flex: 1 }}>
        {redes.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: sistemaPiezas.length ? 4 : 0 }}>
            {redes.map((red, i) => <RedChip key={i} red={red} />)}
          </div>
        )}
        {sistemaPiezas.map((p, i) => (
          <p key={i} style={{
            fontFamily: 'Roboto, sans-serif', fontSize: 10, color: '#ababab',
            margin: '2px 0 0',
          }}>
            ⚙️ {p.descripcion}
          </p>
        ))}
      </div>
      <span style={{
        flexShrink: 0,
        fontFamily: '"Roboto Mono", monospace', fontSize: 10,
        color: '#ababab',
        paddingTop: 3,
      }}>
        {redes.length > 0 ? `${redes.length} piezas` : ''}
      </span>
    </div>
  )
}

// ─── Semana card ──────────────────────────────────────────────────────────────

function SemanaCard({ semana }) {
  const [open, setOpen] = useState(semana.numero <= 2)
  const piezasSem = semana.piezas.filter(p => p.red !== 'sistema')
  const hasPodcast = semana.hay_podcast

  // Agrupar por día
  const porDia = {}
  semana.piezas.forEach(p => {
    if (!porDia[p.dia]) porDia[p.dia] = []
    porDia[p.dia].push(p)
  })

  return (
    <div style={{
      background: '#fff',
      border: '1px solid #e8e5e0',
      borderRadius: 8,
      overflow: 'hidden',
    }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center',
          padding: '12px 16px', gap: 12,
          background: 'transparent', border: 'none', cursor: 'pointer',
          textAlign: 'left',
        }}
      >
        <span style={{
          width: 28, height: 28, borderRadius: 6,
          background: '#86a43b15', border: '1px solid #86a43b30',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: '"Roboto Mono", monospace', fontSize: 12, fontWeight: 700,
          color: '#86a43b', flexShrink: 0,
        }}>
          {semana.numero}
        </span>
        <div style={{ flex: 1 }}>
          <span style={{ fontFamily: 'Roboto, sans-serif', fontSize: 13, fontWeight: 600, color: '#373737' }}>
            Semana {semana.numero}
          </span>
          {hasPodcast && (
            <span style={{
              marginLeft: 8,
              fontFamily: 'Roboto, sans-serif', fontSize: 10, fontWeight: 600,
              color: '#6366f1', background: '#eef2ff', border: '1px solid #c7d2fe',
              borderRadius: 4, padding: '1px 6px',
            }}>
              🎙️ podcast
            </span>
          )}
        </div>
        <span style={{ fontFamily: '"Roboto Mono", monospace', fontSize: 10, color: '#ababab' }}>
          {piezasSem.length} piezas
        </span>
        {open
          ? <ChevronUp size={14} color="#ababab" />
          : <ChevronDown size={14} color="#ababab" />
        }
      </button>

      {open && (
        <div style={{ padding: '0 16px 12px' }}>
          {Object.entries(porDia).map(([dia, piezas]) => (
            <DiaRow key={dia} dia={dia} piezas={piezas} />
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Distribución por plataforma ──────────────────────────────────────────────

function DistribucionBar({ plan }) {
  if (!plan?.semanas) return null

  const conteo = {}
  plan.semanas.forEach(s => s.piezas.forEach(p => {
    if (p.red !== 'sistema') conteo[p.red] = (conteo[p.red] || 0) + 1
  }));
  (plan.articulos_hanshatch_premium || []).forEach(a =>
    a.piezas.forEach(p => { conteo[p.red] = (conteo[p.red] || 0) + 1 })
  )
  conteo['linkedin'] = (conteo['linkedin'] || 0) + 10
  conteo['x']        = (conteo['x']        || 0) + 10

  const total = Object.values(conteo).reduce((a, b) => a + b, 0)
  const sorted = Object.entries(conteo).sort((a, b) => b[1] - a[1])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {sorted.map(([red, cnt]) => {
        const pct = Math.round((cnt / total) * 100)
        const color = RED_COLORS[red] || '#ababab'
        return (
          <div key={red} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{
              width: 70, flexShrink: 0,
              fontFamily: 'Roboto, sans-serif', fontSize: 11, color: '#878787',
              textTransform: 'capitalize',
            }}>
              {RED_ICONS[red]} {red}
            </span>
            <div style={{ flex: 1, background: '#f0eeea', borderRadius: 3, height: 8, overflow: 'hidden' }}>
              <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 3 }} />
            </div>
            <span style={{
              width: 32, textAlign: 'right', flexShrink: 0,
              fontFamily: '"Roboto Mono", monospace', fontSize: 10, color: '#ababab',
            }}>
              ~{cnt}
            </span>
          </div>
        )
      })}
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function Planeacion() {
  const qc = useQueryClient()

  const { data: planeaciones = [], isLoading } = useQuery({
    queryKey: ['planeaciones'],
    queryFn:  () => api.planeaciones(),
  })

  const [selMes, setSelMes] = useState(null)
  const plan = selMes
    ? planeaciones.find(p => p.mes === selMes)
    : planeaciones[0] ?? null

  const [genError, setGenError] = useState(null)

  const genMut = useMutation({
    mutationFn: (mes) => api.generarPlaneacion(mes),
    onSuccess: (data) => {
      setGenError(null)
      if (data?.mock) {
        setGenError('Sin conexión al servidor')
        return
      }
      qc.invalidateQueries({ queryKey: ['planeaciones'] })
    },
    onError: (e) => setGenError(e.message),
  })

  const aprobMut = useMutation({
    mutationFn: (mes) => api.aprobarPlaneacion(mes),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['planeaciones'] }),
  })

  if (isLoading) return (
    <div style={{ padding: 32, fontFamily: 'Roboto, sans-serif', color: '#ababab' }}>
      Cargando planeación…
    </div>
  )

  const puedaAprobar = plan && plan.estado === 'borrador'

  return (
    <div style={{ padding: 32, maxWidth: 860, margin: '0 auto' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, gap: 16 }}>
        <div>
          <h1 style={{
            fontFamily: 'Roboto, sans-serif', fontWeight: 700,
            fontSize: 22, color: '#373737', margin: 0,
          }}>
            Planeación Mensual
          </h1>
          <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: 12, color: '#ababab', marginTop: 4 }}>
            Flujo M — calendario completo del mes siguiente (~108 piezas)
          </p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
          <button
            onClick={() => genMut.mutate('2026-04')}
            disabled={genMut.isPending}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '8px 14px',
              background: genMut.isPending ? '#f0eeea' : '#fff',
              border: '1px solid #e4e1db',
              borderRadius: 6, cursor: genMut.isPending ? 'not-allowed' : 'pointer',
              fontFamily: 'Roboto, sans-serif', fontSize: 12, fontWeight: 500, color: '#878787',
            }}
          >
            <RefreshCw size={13} style={{ animation: genMut.isPending ? 'spin 1s linear infinite' : 'none' }} />
            {genMut.isPending ? 'Generando…' : 'Generar abril 2026'}
          </button>
          {genError && (
            <span style={{ fontFamily: 'Roboto, sans-serif', fontSize: 11, color: '#ef4444' }}>
              {genError}
            </span>
          )}
        </div>
      </div>

      {/* Sin datos */}
      {planeaciones.length === 0 && (
        <div style={{
          padding: 48, textAlign: 'center',
          background: '#fff', border: '1px solid #e8e5e0', borderRadius: 8,
        }}>
          <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: 14, color: '#ababab' }}>
            No hay planeaciones generadas aún.
          </p>
          <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: 12, color: '#c8c4be', marginTop: 6 }}>
            El sistema genera automáticamente el día 5 de cada mes, o puedes generarla manualmente arriba.
          </p>
        </div>
      )}

      {plan && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 20, alignItems: 'start' }}>

          {/* ── Columna izquierda: semanas ── */}
          <div>

            {/* Selector de mes si hay varias */}
            {planeaciones.length > 1 && (
              <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
                {planeaciones.map(p => (
                  <button
                    key={p.mes}
                    onClick={() => setSelMes(p.mes)}
                    style={{
                      padding: '5px 12px',
                      borderRadius: 5, cursor: 'pointer',
                      fontFamily: 'Roboto, sans-serif', fontSize: 11, fontWeight: 500,
                      border: '1px solid',
                      borderColor: (selMes ?? planeaciones[0].mes) === p.mes ? '#86a43b' : '#e4e1db',
                      color:       (selMes ?? planeaciones[0].mes) === p.mes ? '#86a43b' : '#878787',
                      background:  (selMes ?? planeaciones[0].mes) === p.mes ? '#f0f6e8' : '#fff',
                    }}
                  >
                    {fmtMes(p.mes_nombre)}
                  </button>
                ))}
              </div>
            )}

            {/* Semanas */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {(plan.plan_json?.semanas || []).map(s => (
                <SemanaCard key={s.numero} semana={s} />
              ))}
            </div>

            {/* Artículos premium hanshatch.com */}
            {(plan.plan_json?.articulos_hanshatch_premium || []).length > 0 && (
              <div style={{ marginTop: 16 }}>
                <p style={{
                  fontFamily: 'Roboto, sans-serif', fontSize: 10, fontWeight: 700,
                  letterSpacing: '0.14em', textTransform: 'uppercase',
                  color: '#ababab', marginBottom: 8,
                }}>
                  Artículos hanshatch.com premium
                </p>
                {plan.plan_json.articulos_hanshatch_premium.map((art, i) => (
                  <div key={i} style={{
                    background: '#fff', border: '1px solid #e8e5e0',
                    borderRadius: 8, padding: '12px 16px', marginBottom: 8,
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ fontFamily: 'Roboto, sans-serif', fontSize: 12, fontWeight: 600, color: '#373737' }}>
                        Semana {art.semana} — hanshatch.com
                      </span>
                      <span style={{ fontFamily: '"Roboto Mono", monospace', fontSize: 10, color: '#ababab' }}>
                        {art.total_piezas} piezas
                      </span>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                      {art.piezas.map((p, j) => <RedChip key={j} red={p.red} />)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Columna derecha: resumen + aprobar ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

            {/* Card estado */}
            <div style={{
              background: '#fff', border: '1px solid #e8e5e0',
              borderRadius: 8, padding: '16px',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div>
                  <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: 16, fontWeight: 700, color: '#373737', margin: 0 }}>
                    {fmtMes(plan.mes_nombre)}
                  </p>
                  <p style={{ fontFamily: '"Roboto Mono", monospace', fontSize: 10, color: '#ababab', marginTop: 2 }}>
                    {plan.mes}
                  </p>
                </div>
                <EstadoBadge estado={plan.estado} />
              </div>

              <div style={{
                display: 'flex', alignItems: 'baseline', gap: 6,
                padding: '10px 0', borderTop: '1px solid #f0eeea',
              }}>
                <span style={{ fontFamily: '"Roboto Mono", monospace', fontSize: 28, fontWeight: 700, color: '#373737' }}>
                  ~{plan.total_piezas}
                </span>
                <span style={{ fontFamily: 'Roboto, sans-serif', fontSize: 12, color: '#ababab' }}>
                  piezas de contenido
                </span>
              </div>

              {plan.aprobado_at && (
                <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: 10, color: '#ababab', marginTop: 4 }}>
                  Aprobado: {fmtFecha(plan.aprobado_at)}
                </p>
              )}

              {/* Botón aprobar */}
              {puedaAprobar && (
                <button
                  onClick={() => aprobMut.mutate(plan.mes)}
                  disabled={aprobMut.isPending}
                  style={{
                    width: '100%', marginTop: 14,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    padding: '10px 0',
                    background: aprobMut.isPending ? '#c8d98f' : '#86a43b',
                    border: 'none', borderRadius: 6,
                    cursor: aprobMut.isPending ? 'not-allowed' : 'pointer',
                    fontFamily: 'Roboto, sans-serif', fontSize: 13, fontWeight: 700,
                    color: '#fff', letterSpacing: '0.02em',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => { if (!aprobMut.isPending) e.currentTarget.style.background = '#759135' }}
                  onMouseLeave={e => { if (!aprobMut.isPending) e.currentTarget.style.background = '#86a43b' }}
                >
                  <CheckCircle size={15} />
                  {aprobMut.isPending ? 'Aprobando…' : 'Aprobar planeación'}
                </button>
              )}

              {plan.estado === 'aprobado' && (
                <div style={{
                  marginTop: 12, padding: '8px 12px',
                  background: '#f0f6e8', border: '1px solid #c3d88a',
                  borderRadius: 6, display: 'flex', alignItems: 'center', gap: 6,
                }}>
                  <Zap size={12} color="#86a43b" />
                  <span style={{ fontFamily: 'Roboto, sans-serif', fontSize: 11, color: '#86a43b' }}>
                    Los flujos ejecutarán este calendario desde el día 1 del mes.
                  </span>
                </div>
              )}
            </div>

            {/* Distribución */}
            <div style={{
              background: '#fff', border: '1px solid #e8e5e0',
              borderRadius: 8, padding: '14px 16px',
            }}>
              <p style={{
                fontFamily: 'Roboto, sans-serif', fontSize: 10, fontWeight: 700,
                letterSpacing: '0.14em', textTransform: 'uppercase',
                color: '#ababab', marginBottom: 12,
              }}>
                Por plataforma
              </p>
              <DistribucionBar plan={plan.plan_json} />
            </div>

            {/* Info estructura */}
            <div style={{
              background: '#fff', border: '1px solid #e8e5e0',
              borderRadius: 8, padding: '14px 16px',
            }}>
              <p style={{
                fontFamily: 'Roboto, sans-serif', fontSize: 10, fontWeight: 700,
                letterSpacing: '0.14em', textTransform: 'uppercase',
                color: '#ababab', marginBottom: 10,
              }}>
                Estructura
              </p>
              {[
                { label: 'Semanas', value: `${plan.plan_json?.semanas?.length ?? 0}` },
                { label: 'Episodios podcast', value: 'Semanas 1 y 3' },
                { label: 'Artículos HH premium', value: '2 (semanas 2 y 4)' },
                { label: 'Comentarios autoridad', value: '~20 automáticos' },
              ].map(({ label, value }) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontFamily: 'Roboto, sans-serif', fontSize: 11, color: '#878787' }}>{label}</span>
                  <span style={{ fontFamily: '"Roboto Mono", monospace', fontSize: 10, color: '#373737', fontWeight: 500 }}>{value}</span>
                </div>
              ))}
            </div>

          </div>
        </div>
      )}

    </div>
  )
}

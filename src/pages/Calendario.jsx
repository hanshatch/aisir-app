import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ChevronLeft, ChevronRight, Check, X, LayoutGrid, List, Clock, AlertCircle } from 'lucide-react'
import { api } from '@/api/client'

// ─── Colores de redes adaptados al tema claro ──────────────────
const NET = {
  linkedin:  { color: '#86a43b', bg: '#efeded', label: 'LinkedIn'  },
  instagram: { color: '#878787', bg: '#efeded', label: 'Instagram' },
  x:         { color: '#373737', bg: '#efeded', label: 'X / Twitter' },
  tiktok:    { color: '#878787', bg: '#efeded', label: 'TikTok'    },
  facebook:  { color: '#86a43b', bg: '#efeded', label: 'Facebook'  },
  newsletter:{ color: '#86a43b', bg: '#efeded', label: 'Newsletter' },
  articulo:  { color: '#86a43b', bg: '#efeded', label: 'Artículo'  },
  carousel:  { color: '#86a43b', bg: '#fff7ed', label: 'Carousel'  },
  whatsapp:  { color: '#86a43b', bg: '#efeded', label: 'WhatsApp'  },
}

const STATUS = {
  pendiente_aprobacion: { label: 'Pendiente',  color: '#86a43b', bg: '#efeded', border: '#efeded' },
  aprobado:             { label: 'Aprobado',   color: '#86a43b', bg: '#efeded', border: '#bbf7d0' },
  rechazado:            { label: 'Rechazado',  color: '#878787', bg: '#efeded', border: '#ababab' },
  borrador:             { label: 'Borrador',   color: '#878787', bg: '#efeded', border: '#ababab' },
  publicado:            { label: 'Publicado',  color: '#86a43b', bg: '#efeded', border: '#efeded' },
}

const DAYS_ES   = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
const MONTHS_ES = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre']

// ─── Helpers ──────────────────────────────────────────────────
function getWeekStart(offset = 0) {
  const d = new Date()
  const day = d.getDay()
  const monday = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + monday + offset * 7)
  d.setHours(0, 0, 0, 0)
  return d
}

function isoDate(d) { return d.toISOString().split('T')[0] }

function formatRange(start) {
  const end = new Date(start)
  end.setDate(end.getDate() + 6)
  if (start.getMonth() === end.getMonth()) {
    return `${start.getDate()}–${end.getDate()} ${MONTHS_ES[start.getMonth()]} ${start.getFullYear()}`
  }
  return `${start.getDate()} ${MONTHS_ES[start.getMonth()]} – ${end.getDate()} ${MONTHS_ES[end.getMonth()]} ${start.getFullYear()}`
}

function formatDateLong(dateStr) {
  const d = new Date(dateStr + 'T12:00:00')
  return d.toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })
}

// ─── Shared sub-components ─────────────────────────────────────
function NetBadge({ red }) {
  const n = NET[red] ?? { color: '#878787', bg: '#efeded', label: red }
  return (
    <span style={{
      fontFamily: 'Roboto, sans-serif', fontSize: 9, fontWeight: 700,
      letterSpacing: '0.06em', textTransform: 'uppercase',
      padding: '2px 7px',
      color: n.color, background: n.bg,
      border: `1px solid ${n.color}30`,
      borderRadius: 4, whiteSpace: 'nowrap',
    }}>
      {n.label}
    </span>
  )
}

function StatusBadge({ estado }) {
  const s = STATUS[estado] ?? STATUS.borrador
  return (
    <span style={{
      fontFamily: 'Roboto, sans-serif', fontSize: 9, fontWeight: 600,
      padding: '2px 7px',
      color: s.color, background: s.bg,
      border: `1px solid ${s.border}`,
      borderRadius: 4, whiteSpace: 'nowrap',
    }}>
      {s.label}
    </span>
  )
}

function ApproveRow({ event, onAprobar, onRechazar }) {
  const [rejecting, setRejecting] = useState(false)
  const [motivo,    setMotivo]    = useState('')
  if (event.estado !== 'pendiente_aprobacion') return null

  if (rejecting) {
    return (
      <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
        <input
          autoFocus
          placeholder="Motivo del rechazo…"
          value={motivo}
          onChange={(e) => setMotivo(e.target.value)}
          style={{
            flex: 1, fontFamily: 'Roboto, sans-serif', fontSize: 12,
            padding: '5px 10px',
            border: '1px solid #fca5a5', borderRadius: 5,
            outline: 'none', background: '#efeded', color: '#373737',
          }}
        />
        <button
          onClick={() => { onRechazar(event.id, motivo); setRejecting(false) }}
          style={{
            padding: '5px 12px',
            background: '#878787', color: '#fff',
            border: 'none', borderRadius: 5,
            fontFamily: 'Roboto, sans-serif', fontSize: 12, fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Confirmar
        </button>
        <button
          onClick={() => setRejecting(false)}
          style={{
            padding: '5px 10px',
            background: '#efeded', color: '#878787',
            border: '1px solid #ababab', borderRadius: 5,
            fontFamily: 'Roboto, sans-serif', fontSize: 12,
            cursor: 'pointer',
          }}
        >
          Cancelar
        </button>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', gap: 5, marginTop: 6 }}>
      <button
        onClick={() => onAprobar(event.id)}
        style={{
          display: 'flex', alignItems: 'center', gap: 4,
          padding: '4px 10px',
          background: '#efeded', color: '#86a43b',
          border: '1px solid #86a43b40', borderRadius: 5,
          fontFamily: 'Roboto, sans-serif', fontSize: 11, fontWeight: 600,
          cursor: 'pointer', transition: 'all 0.15s',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = '#86a43b'; e.currentTarget.style.color = '#fff' }}
        onMouseLeave={(e) => { e.currentTarget.style.background = '#efeded'; e.currentTarget.style.color = '#86a43b' }}
      >
        <Check size={11} /> Aprobar
      </button>
      <button
        onClick={() => setRejecting(true)}
        style={{
          display: 'flex', alignItems: 'center', gap: 4,
          padding: '4px 10px',
          background: '#efeded', color: '#878787',
          border: '1px solid #ababab', borderRadius: 5,
          fontFamily: 'Roboto, sans-serif', fontSize: 11, fontWeight: 600,
          cursor: 'pointer', transition: 'all 0.15s',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = '#878787'; e.currentTarget.style.color = '#fff' }}
        onMouseLeave={(e) => { e.currentTarget.style.background = '#efeded'; e.currentTarget.style.color = '#878787' }}
      >
        <X size={11} /> Rechazar
      </button>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// VISTA CALENDARIO — grid semanal
// ═══════════════════════════════════════════════════════════════
function CalendarEventChip({ event, onAprobar, onRechazar }) {
  const red   = event.red ?? event.tipo ?? 'otros'
  const net   = NET[red] ?? { color: '#878787', bg: '#efeded' }
  const isPending = event.estado === 'pendiente_aprobacion'
  const [open, setOpen] = useState(false)

  return (
    <div
      style={{
        borderLeft: `3px solid ${net.color}`,
        background: open ? net.bg : '#ffffff',
        border: `1px solid ${net.color}25`,
        borderLeft: `3px solid ${net.color}`,
        borderRadius: '0 6px 6px 0',
        padding: '6px 8px',
        cursor: 'pointer',
        transition: 'all 0.15s',
        boxShadow: open ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
      }}
      onClick={() => setOpen((p) => !p)}
    >
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 3 }}>
        {event.hora && (
          <span style={{ fontFamily: '"Roboto Mono"', fontSize: 9, color: '#ababab' }}>
            {event.hora}
          </span>
        )}
        {isPending && (
          <AlertCircle size={9} color="#86a43b" style={{ flexShrink: 0 }} />
        )}
      </div>

      {/* Title */}
      <p style={{
        fontFamily: 'Roboto, sans-serif', fontSize: 11, fontWeight: 600,
        color: '#373737', lineHeight: 1.3,
        overflow: 'hidden',
        display: '-webkit-box', WebkitLineClamp: open ? 'unset' : 2, WebkitBoxOrient: 'vertical',
      }}>
        {event.titulo ?? event.title ?? `Pieza #${event.id}`}
      </p>

      {/* Badges */}
      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 5 }}>
        <NetBadge red={red} />
      </div>

      {/* Expand: approve/reject */}
      {open && (
        <div onClick={(e) => e.stopPropagation()}>
          <div style={{ marginTop: 6 }}>
            <StatusBadge estado={event.estado} />
          </div>
          <ApproveRow event={event} onAprobar={onAprobar} onRechazar={onRechazar} />
        </div>
      )}
    </div>
  )
}

function CalendarView({ weekStart, byDay, onAprobar, onRechazar, isLoading }) {
  const today = new Date()

  if (isLoading) {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8 }}>
        {DAYS_ES.map((d) => (
          <div key={d} className="card" style={{ height: 280, opacity: 0.5 }}>
            <div style={{ padding: '10px 12px', borderBottom: '1px solid #efeded' }}>
              <div style={{ width: 24, height: 12, background: '#efeded', borderRadius: 3 }} />
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8 }}>
      {Object.entries(byDay).map(([dateStr, dayEvents], i) => {
        const d       = new Date(dateStr + 'T12:00:00')
        const isToday = d.toDateString() === today.toDateString()
        const isPast  = d < today && !isToday

        return (
          <div
            key={dateStr}
            className="card"
            style={{
              overflow: 'hidden',
              opacity: isPast ? 0.7 : 1,
              border: isToday ? '2px solid #86a43b' : '1px solid #ababab',
              boxShadow: isToday ? '0 0 0 3px rgba(118,167,43,0.1)' : undefined,
            }}
          >
            {/* Day header */}
            <div style={{
              padding: '8px 10px',
              background: isToday ? '#86a43b' : '#efeded',
              borderBottom: `1px solid ${isToday ? 'transparent' : '#efeded'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <span style={{
                fontFamily: 'Roboto, sans-serif', fontSize: 9, fontWeight: 700,
                letterSpacing: '0.1em', textTransform: 'uppercase',
                color: isToday ? 'rgba(255,255,255,0.8)' : '#ababab',
              }}>
                {DAYS_ES[i]}
              </span>
              <span style={{
                fontFamily: 'Roboto, sans-serif', fontWeight: 800, fontSize: 15,
                color: isToday ? '#ffffff' : '#373737',
              }}>
                {d.getDate()}
              </span>
            </div>

            {/* Events */}
            <div style={{ padding: 6, display: 'flex', flexDirection: 'column', gap: 5, minHeight: 80 }}>
              {dayEvents.length === 0 ? (
                <p style={{
                  textAlign: 'center', padding: '16px 0',
                  fontFamily: 'Roboto, sans-serif', fontSize: 11, color: '#ababab',
                }}>
                  —
                </p>
              ) : (
                dayEvents.map((ev) => (
                  <CalendarEventChip
                    key={ev.id}
                    event={ev}
                    onAprobar={onAprobar}
                    onRechazar={onRechazar}
                  />
                ))
              )}

              {/* Count badge if many */}
              {dayEvents.length >= 3 && (
                <p style={{
                  textAlign: 'center',
                  fontFamily: 'Roboto, sans-serif', fontSize: 9, color: '#ababab',
                  paddingTop: 2,
                }}>
                  {dayEvents.length} publicaciones
                </p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// VISTA LISTA — cronológica agrupada por día
// ═══════════════════════════════════════════════════════════════
function ListEventRow({ event, onAprobar, onRechazar }) {
  const red    = event.red ?? event.tipo ?? 'otros'
  const net    = NET[red] ?? { color: '#878787', bg: '#efeded' }
  const status = STATUS[event.estado] ?? STATUS.borrador

  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: 16,
      padding: '14px 20px',
      borderBottom: '1px solid #efeded',
      transition: 'background 0.1s',
    }}
    onMouseEnter={(e) => { e.currentTarget.style.background = '#fafaf8' }}
    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
    >
      {/* Hora */}
      <div style={{ flexShrink: 0, width: 48, paddingTop: 2 }}>
        {event.hora ? (
          <span style={{
            fontFamily: '"Roboto Mono"', fontSize: 12, fontWeight: 500,
            color: '#373737',
          }}>
            {event.hora}
          </span>
        ) : (
          <span style={{ fontFamily: '"Roboto Mono"', fontSize: 11, color: '#ababab' }}>—:—</span>
        )}
      </div>

      {/* Color stripe */}
      <div style={{
        width: 3, flexShrink: 0, alignSelf: 'stretch',
        background: net.color, borderRadius: 3, minHeight: 40,
      }} />

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          fontFamily: 'Roboto, sans-serif', fontWeight: 700, fontSize: 14,
          color: '#373737', lineHeight: 1.3, marginBottom: 6,
        }}>
          {event.titulo ?? event.title ?? `Pieza #${event.id}`}
        </p>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
          <NetBadge red={red} />
          <StatusBadge estado={event.estado} />
        </div>
        <ApproveRow event={event} onAprobar={onAprobar} onRechazar={onRechazar} />
      </div>

      {/* ID */}
      <span style={{
        flexShrink: 0, fontFamily: '"Roboto Mono"', fontSize: 10,
        color: '#ababab', paddingTop: 3,
      }}>
        #{event.id}
      </span>
    </div>
  )
}

function ListView({ byDay, onAprobar, onRechazar, isLoading }) {
  const today = new Date()

  if (isLoading) {
    return (
      <div className="card" style={{ overflow: 'hidden' }}>
        {[...Array(5)].map((_, i) => (
          <div key={i} style={{ padding: '14px 20px', borderBottom: '1px solid #efeded', display: 'flex', gap: 12 }}>
            <div style={{ width: 48, height: 16, background: '#efeded', borderRadius: 3 }} />
            <div style={{ flex: 1 }}>
              <div style={{ width: '60%', height: 14, background: '#efeded', borderRadius: 3, marginBottom: 8 }} />
              <div style={{ width: '30%', height: 10, background: '#efeded', borderRadius: 3 }} />
            </div>
          </div>
        ))}
      </div>
    )
  }

  const hasAny = Object.values(byDay).some((evs) => evs.length > 0)
  if (!hasAny) {
    return (
      <div className="card" style={{ padding: 48, textAlign: 'center' }}>
        <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: 14, color: '#ababab' }}>
          Sin publicaciones programadas esta semana
        </p>
      </div>
    )
  }

  return (
    <div className="card shadow-card" style={{ overflow: 'hidden' }}>
      {/* Table header */}
      <div style={{
        display: 'grid', gridTemplateColumns: '48px 3px 1fr auto',
        gap: 16, padding: '10px 20px',
        background: '#efeded', borderBottom: '1px solid #ababab',
      }}>
        {['Hora', '', 'Publicación', 'ID'].map((h) => (
          <span key={h} className="label-caps" style={{ fontSize: 9 }}>{h}</span>
        ))}
      </div>

      {Object.entries(byDay).map(([dateStr, dayEvents]) => {
        if (dayEvents.length === 0) return null
        const d       = new Date(dateStr + 'T12:00:00')
        const isToday = d.toDateString() === today.toDateString()

        return (
          <div key={dateStr}>
            {/* Day separator */}
            <div style={{
              padding: '8px 20px',
              background: isToday ? '#efeded' : '#fafaf8',
              borderBottom: '1px solid #efeded',
              display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <span style={{
                fontFamily: 'Roboto, sans-serif', fontWeight: 800,
                fontSize: 12, color: isToday ? '#86a43b' : '#373737',
                textTransform: 'capitalize',
              }}>
                {formatDateLong(dateStr)}
              </span>
              {isToday && (
                <span style={{
                  fontFamily: 'Roboto, sans-serif', fontSize: 9, fontWeight: 700,
                  padding: '2px 7px', background: '#86a43b', color: '#fff',
                  borderRadius: 4, letterSpacing: '0.06em', textTransform: 'uppercase',
                }}>
                  Hoy
                </span>
              )}
              <span style={{
                marginLeft: 'auto',
                fontFamily: 'Roboto, sans-serif', fontSize: 10, color: '#ababab',
              }}>
                {dayEvents.length} {dayEvents.length === 1 ? 'publicación' : 'publicaciones'}
              </span>
            </div>

            {dayEvents.map((ev) => (
              <ListEventRow
                key={ev.id}
                event={ev}
                onAprobar={onAprobar}
                onRechazar={onRechazar}
              />
            ))}
          </div>
        )
      })}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// PÁGINA PRINCIPAL
// ═══════════════════════════════════════════════════════════════
export default function Calendario() {
  const [weekOffset, setWeekOffset] = useState(0)
  const [view,       setView]       = useState('calendar') // 'calendar' | 'list'
  const qc       = useQueryClient()
  const weekStart = getWeekStart(weekOffset)

  const { data, isLoading } = useQuery({
    queryKey: ['calendario', weekOffset],
    queryFn:  () => api.calendario(isoDate(weekStart)),
    refetchInterval: 60_000,
  })

  const aprobar = useMutation({
    mutationFn: (id) => api.aprobarContent(id),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['calendario'] }),
  })
  const rechazar = useMutation({
    mutationFn: ({ id, motivo }) => api.rechazarContent(id, motivo),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['calendario'] }),
  })

  // Build byDay map: 7 días de la semana
  const byDay = {}
  for (let i = 0; i < 7; i++) {
    const d = new Date(weekStart)
    d.setDate(d.getDate() + i)
    byDay[isoDate(d)] = []
  }
  const events = data?.entradas ?? data?.events ?? []
  events.forEach((ev) => {
    const day = ev.fecha_programada?.split('T')[0] ?? ev.fecha?.split('T')[0]
    if (day && byDay[day] !== undefined) byDay[day].push(ev)
  })

  const totalThisWeek = events.length
  const pendingCount  = events.filter((e) => e.estado === 'pendiente_aprobacion').length

  const handleAprobar  = (id)          => aprobar.mutate(id)
  const handleRechazar = (id, motivo)  => rechazar.mutate({ id, motivo })

  return (
    <div style={{ padding: '32px 32px 48px' }} className="animate-fade-in">

      {/* ── Header ── */}
      <div style={{
        display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
        marginBottom: 24, gap: 16, flexWrap: 'wrap',
      }}>
        <div>
          <p className="label-caps" style={{ marginBottom: 6 }}>Editorial · Planificación</p>
          <h1 style={{
            fontFamily: 'Roboto, sans-serif',
            fontWeight: 900, fontSize: 34, lineHeight: 1,
            color: '#373737', letterSpacing: '-0.02em',
          }}>
            Calendario
          </h1>
          <p style={{
            fontFamily: 'Roboto, sans-serif', fontSize: 13,
            color: '#878787', marginTop: 5, textTransform: 'capitalize',
          }}>
            {formatRange(weekStart)}
          </p>
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>

          {/* Summary pills */}
          {!isLoading && totalThisWeek > 0 && (
            <div style={{ display: 'flex', gap: 6 }}>
              <div style={{
                padding: '6px 12px', borderRadius: 8,
                background: '#ffffff', border: '1px solid #ababab',
              }}>
                <span style={{ fontFamily: 'Roboto, sans-serif', fontSize: 11, color: '#878787' }}>
                  <strong style={{ color: '#373737', fontWeight: 700 }}>{totalThisWeek}</strong> esta semana
                </span>
              </div>
              {pendingCount > 0 && (
                <div style={{
                  padding: '6px 12px', borderRadius: 8,
                  background: '#efeded', border: '1px solid #efeded',
                  display: 'flex', alignItems: 'center', gap: 5,
                }}>
                  <AlertCircle size={11} color="#86a43b" />
                  <span style={{ fontFamily: 'Roboto, sans-serif', fontSize: 11, color: '#86a43b', fontWeight: 600 }}>
                    {pendingCount} pendiente{pendingCount > 1 ? 's' : ''}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Week nav */}
          <div style={{ display: 'flex', gap: 0, border: '1px solid #ababab', borderRadius: 8, overflow: 'hidden' }}>
            {[
              { onClick: () => setWeekOffset((p) => p - 1), children: <ChevronLeft size={15} />, title: 'Semana anterior' },
              { onClick: () => setWeekOffset(0), children: <span style={{ fontFamily: 'Roboto, sans-serif', fontSize: 12, fontWeight: 600 }}>Hoy</span>, title: 'Ir a esta semana' },
              { onClick: () => setWeekOffset((p) => p + 1), children: <ChevronRight size={15} />, title: 'Semana siguiente' },
            ].map(({ onClick, children, title }, idx) => (
              <button
                key={idx}
                onClick={onClick}
                title={title}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  padding: '7px 12px',
                  background: '#ffffff', border: 'none',
                  borderRight: idx < 2 ? '1px solid #ababab' : 'none',
                  color: '#373737', cursor: 'pointer',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#efeded' }}
                onMouseLeave={(e) => { e.currentTarget.style.background = '#ffffff' }}
              >
                {children}
              </button>
            ))}
          </div>

          {/* View toggle */}
          <div style={{
            display: 'flex', gap: 0,
            background: '#ffffff', border: '1px solid #ababab', borderRadius: 8, overflow: 'hidden',
          }}>
            {[
              { key: 'calendar', icon: <LayoutGrid size={14} />, label: 'Calendario' },
              { key: 'list',     icon: <List size={14} />,        label: 'Lista' },
            ].map(({ key, icon, label }) => (
              <button
                key={key}
                onClick={() => setView(key)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '7px 14px',
                  background: view === key ? '#86a43b' : '#ffffff',
                  color: view === key ? '#ffffff' : '#878787',
                  border: 'none', cursor: 'pointer',
                  borderRight: key === 'calendar' ? '1px solid #ababab' : 'none',
                  fontFamily: 'Roboto, sans-serif', fontSize: 12, fontWeight: 600,
                  transition: 'all 0.15s',
                }}
                onMouseEnter={(e) => {
                  if (view !== key) { e.currentTarget.style.background = '#efeded'; e.currentTarget.style.color = '#373737' }
                }}
                onMouseLeave={(e) => {
                  if (view !== key) { e.currentTarget.style.background = '#ffffff'; e.currentTarget.style.color = '#878787' }
                }}
              >
                {icon}
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      {view === 'calendar' ? (
        <CalendarView
          weekStart={weekStart}
          byDay={byDay}
          onAprobar={handleAprobar}
          onRechazar={handleRechazar}
          isLoading={isLoading}
        />
      ) : (
        <ListView
          byDay={byDay}
          onAprobar={handleAprobar}
          onRechazar={handleRechazar}
          isLoading={isLoading}
        />
      )}
    </div>
  )
}

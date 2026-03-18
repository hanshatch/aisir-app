import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ChevronLeft, ChevronRight, Check, X } from 'lucide-react'
import { api } from '@/api/client'
import { RED_COLORS } from '@/lib/utils'

const DAYS_ES = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
const MONTHS_ES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']

function getWeekOffset(offset = 0) {
  const d = new Date()
  d.setDate(d.getDate() - d.getDay() + 1 + offset * 7)
  d.setHours(0, 0, 0, 0)
  return d
}

function formatSemana(date) {
  const end = new Date(date)
  end.setDate(end.getDate() + 6)
  if (date.getMonth() === end.getMonth()) {
    return `${date.getDate()}–${end.getDate()} ${MONTHS_ES[date.getMonth()]} ${date.getFullYear()}`
  }
  return `${date.getDate()} ${MONTHS_ES[date.getMonth()]} – ${end.getDate()} ${MONTHS_ES[end.getMonth()]} ${date.getFullYear()}`
}

function isoDate(d) {
  return d.toISOString().split('T')[0]
}

function NetworkBadge({ red }) {
  const color = RED_COLORS[red] ?? '#5c7a50'
  return (
    <span
      className="font-mono text-[9px] uppercase px-1.5 py-0.5"
      style={{ background: color + '18', color, border: `1px solid ${color}35`, borderRadius: 2 }}
    >
      {red}
    </span>
  )
}

function EventCard({ event, onAprobar, onRechazar }) {
  const red = event.red ?? event.tipo ?? 'otros'
  const color = RED_COLORS[red] ?? '#5c7a50'
  const isPending = event.estado === 'pendiente_aprobacion'
  const [rejecting, setRejecting] = useState(false)
  const [motivo, setMotivo] = useState('')

  return (
    <div
      className="text-left"
      style={{
        borderLeft: `3px solid ${color}`,
        background: '#111611',
        borderRadius: '0 3px 3px 0',
        padding: '8px 10px',
        borderTop: '1px solid #1e2d1a',
        borderRight: '1px solid #1e2d1a',
        borderBottom: '1px solid #1e2d1a',
      }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <NetworkBadge red={red} />
            {event.hora && (
              <span className="font-mono text-[9px]" style={{ color: '#3d5535' }}>
                {event.hora}
              </span>
            )}
          </div>
          <p className="text-xs text-ink font-medium leading-snug line-clamp-2">
            {event.titulo ?? event.title ?? `Pieza #${event.id}`}
          </p>
          {(event.contenido_snippet ?? event.snippet) && (
            <p className="font-mono text-[10px] mt-1 line-clamp-1" style={{ color: '#3d5535' }}>
              {event.contenido_snippet ?? event.snippet}
            </p>
          )}
        </div>

        {isPending && !rejecting && (
          <div className="flex gap-1 flex-shrink-0">
            <button
              onClick={() => onAprobar(event.id)}
              className="p-1 transition-colors"
              style={{ background: '#0d1f08', border: '1px solid #7ec83240', borderRadius: 2, color: '#7ec832' }}
              title="Aprobar"
            >
              <Check size={12} />
            </button>
            <button
              onClick={() => setRejecting(true)}
              className="p-1 transition-colors"
              style={{ background: '#1a0808', border: '1px solid #e0454540', borderRadius: 2, color: '#e04545' }}
              title="Rechazar"
            >
              <X size={12} />
            </button>
          </div>
        )}
      </div>

      {rejecting && (
        <div className="mt-2 flex gap-2">
          <input
            className="flex-1 font-mono text-xs px-2 py-1 outline-none"
            style={{
              background: '#080c08',
              border: '1px solid #e0454540',
              borderRadius: 2,
              color: '#d4e6c8',
            }}
            placeholder="Motivo…"
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            autoFocus
          />
          <button
            onClick={() => { onRechazar(event.id, motivo); setRejecting(false) }}
            className="font-mono text-[10px] px-2 py-1"
            style={{ background: '#e04545', color: '#fff', borderRadius: 2 }}
          >
            OK
          </button>
          <button
            onClick={() => setRejecting(false)}
            className="font-mono text-[10px] px-2 py-1"
            style={{ background: '#1e2d1a', color: '#5c7a50', borderRadius: 2 }}
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  )
}

export default function Calendario() {
  const [weekOffset, setWeekOffset] = useState(0)
  const qc = useQueryClient()
  const weekStart = getWeekOffset(weekOffset)

  const { data, isLoading, isError } = useQuery({
    queryKey: ['calendario', weekOffset],
    queryFn: () => api.calendario(isoDate(weekStart)),
    refetchInterval: 60_000,
  })

  const aprobar = useMutation({
    mutationFn: (id) => api.aprobarContent(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['calendario'] }),
  })
  const rechazar = useMutation({
    mutationFn: ({ id, motivo }) => api.rechazarContent(id, motivo),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['calendario'] }),
  })

  const events = data?.events ?? data ?? []

  // Group by day
  const byDay = {}
  for (let i = 0; i < 7; i++) {
    const d = new Date(weekStart)
    d.setDate(d.getDate() + i)
    byDay[isoDate(d)] = []
  }
  events.forEach((ev) => {
    const day = ev.fecha_programada?.split('T')[0] ?? ev.fecha?.split('T')[0]
    if (day && byDay[day] !== undefined) byDay[day].push(ev)
  })

  return (
    <div className="p-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-black text-2xl text-ink">Calendario</h1>
          <p className="font-mono text-xs mt-1 text-muted">
            {formatSemana(weekStart)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setWeekOffset((p) => p - 1)}
            className="p-2 transition-colors"
            style={{ background: '#0d110d', border: '1px solid #1e2d1a', borderRadius: 3, color: '#5c7a50' }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#2a3d24')}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#1e2d1a')}
          >
            <ChevronLeft size={14} />
          </button>
          <button
            onClick={() => setWeekOffset(0)}
            className="font-mono text-[10px] px-3 py-2 transition-colors"
            style={{ background: '#0d110d', border: '1px solid #1e2d1a', borderRadius: 3, color: '#5c7a50' }}
          >
            Hoy
          </button>
          <button
            onClick={() => setWeekOffset((p) => p + 1)}
            className="p-2 transition-colors"
            style={{ background: '#0d110d', border: '1px solid #1e2d1a', borderRadius: 3, color: '#5c7a50' }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#2a3d24')}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#1e2d1a')}
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {isError && (
        <div
          className="mb-4 px-4 py-3 font-mono text-xs"
          style={{ background: '#1a0808', border: '1px solid #e04545', borderRadius: 3, color: '#e04545' }}
        >
          Error cargando calendario
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-7 gap-2">
          {[...Array(7)].map((_, i) => (
            <div key={i} className="h-64 animate-pulse" style={{ background: '#0d110d', borderRadius: 4 }} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2">
          {Object.entries(byDay).map(([dateStr, dayEvents], i) => {
            const d = new Date(dateStr + 'T12:00:00')
            const today = new Date()
            const isToday = d.toDateString() === today.toDateString()
            return (
              <div
                key={dateStr}
                style={{
                  background: '#0d110d',
                  border: `1px solid ${isToday ? '#7ec83260' : '#1e2d1a'}`,
                  borderRadius: 4,
                  boxShadow: isToday ? '0 0 12px rgba(126,200,50,0.1)' : 'none',
                  minHeight: 100,
                }}
              >
                {/* Day header */}
                <div
                  className="px-2 py-2 flex items-center justify-between"
                  style={{
                    borderBottom: '1px solid #1e2d1a',
                    background: isToday ? 'rgba(126,200,50,0.06)' : 'transparent',
                  }}
                >
                  <span
                    className="font-mono text-[10px] uppercase tracking-wide"
                    style={{ color: isToday ? '#7ec832' : '#5c7a50' }}
                  >
                    {DAYS_ES[i]}
                  </span>
                  <span
                    className="font-display font-bold text-sm"
                    style={{ color: isToday ? '#7ec832' : '#8aab78' }}
                  >
                    {d.getDate()}
                  </span>
                </div>

                {/* Events */}
                <div className="p-1.5 space-y-1.5">
                  {dayEvents.map((ev) => (
                    <EventCard
                      key={ev.id}
                      event={ev}
                      onAprobar={(id) => aprobar.mutate(id)}
                      onRechazar={(id, motivo) => rechazar.mutate({ id, motivo })}
                    />
                  ))}
                  {dayEvents.length === 0 && (
                    <p className="font-mono text-[9px] text-center py-3" style={{ color: '#1e2d1a' }}>
                      —
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

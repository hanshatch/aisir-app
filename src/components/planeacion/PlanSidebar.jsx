import { useMutation, useQueryClient } from '@tanstack/react-query'
import { CheckCircle, Zap, Package } from 'lucide-react'
import { api } from '@/api/client'

const RED_ICONS  = { linkedin:'💼', instagram:'📸', x:'🐦', tiktok:'🎵', youtube:'▶️', whatsapp:'💬' }
const RED_COLORS = { linkedin:'#0077b5', instagram:'#e1306c', x:'#14171a', tiktok:'#ff0050', youtube:'#ff0000', whatsapp:'#25d366' }

const ESTADO_STYLES = {
  borrador:     { label:'Borrador',     color:'#878787', bg:'#f5f5f5',  border:'#e4e1db' },
  aprobado:     { label:'Aprobado',     color:'#86a43b', bg:'#f0f6e8',  border:'#c3d88a' },
  en_ejecucion: { label:'En ejecución', color:'#6366f1', bg:'#eef2ff',  border:'#c7d2fe' },
  completado:   { label:'Completado',   color:'#ababab', bg:'#f5f5f5',  border:'#e4e1db' },
}

function fmtFecha(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })
}

function fmtMes(mesNombre) {
  if (!mesNombre) return ''
  return mesNombre.charAt(0).toUpperCase() + mesNombre.slice(1)
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
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
      {Object.entries(conteo).sort((a, b) => b[1] - a[1]).map(([red, cnt]) => {
        const pct = Math.round((cnt / total) * 100)
        const color = RED_COLORS[red] || '#ababab'
        return (
          <div key={red} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 72, flexShrink: 0, fontFamily: 'Roboto, sans-serif', fontSize: 10, color: '#878787', textTransform: 'capitalize' }}>
              {RED_ICONS[red]} {red}
            </span>
            <div style={{ flex: 1, background: '#f0eeea', borderRadius: 3, height: 6, overflow: 'hidden' }}>
              <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 3 }} />
            </div>
            <span style={{ width: 28, textAlign: 'right', flexShrink: 0, fontFamily: '"Roboto Mono", monospace', fontSize: 9, color: '#ababab' }}>
              ~{cnt}
            </span>
          </div>
        )
      })}
    </div>
  )
}

// ─── PlanSidebar ──────────────────────────────────────────────────────────────

export default function PlanSidebar({ plan, tieneContenido, aprobMut }) {
  const qc = useQueryClient()
  const estadoStyle = ESTADO_STYLES[plan.estado] ?? ESTADO_STYLES.borrador

  // Calcular progreso
  const semanas = plan.plan_json?.semanas || []
  const todasPiezas = semanas.flatMap(s => s.piezas.filter(p => p.red !== 'sistema'))
  const aprobadas   = todasPiezas.filter(p => p.estado === 'aprobado' || p.estado === 'editado').length
  const rechazadas  = todasPiezas.filter(p => p.estado === 'rechazado').length
  const totalActivas = todasPiezas.length - rechazadas
  const pct = totalActivas > 0 ? Math.round((aprobadas / totalActivas) * 100) : 0
  const todasAprobadas = aprobadas >= totalActivas && totalActivas > 0

  const materMut = useMutation({
    mutationFn: () => api.materializarPlan(plan.mes),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['planeaciones'] }),
  })

  const puedaMaterializar = todasAprobadas && plan.estado !== 'en_ejecucion'
  const puedaAprobar = plan.estado === 'borrador' && !tieneContenido

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

      {/* ── Card estado ── */}
      <div style={{ background: '#fff', border: '1px solid #e8e5e0', borderRadius: 8, padding: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
          <div>
            <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: 16, fontWeight: 700, color: '#373737', margin: 0 }}>
              {fmtMes(plan.mes_nombre)}
            </p>
            <p style={{ fontFamily: '"Roboto Mono", monospace', fontSize: 10, color: '#ababab', marginTop: 2 }}>
              {plan.mes}
            </p>
          </div>
          <span style={{
            background: estadoStyle.bg, color: estadoStyle.color, border: `1px solid ${estadoStyle.border}`,
            borderRadius: 5, padding: '3px 10px',
            fontFamily: 'Roboto, sans-serif', fontSize: 9, fontWeight: 700,
            textTransform: 'uppercase', letterSpacing: '0.08em',
          }}>
            {estadoStyle.label}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, padding: '10px 0', borderTop: '1px solid #f0eeea' }}>
          <span style={{ fontFamily: '"Roboto Mono", monospace', fontSize: 28, fontWeight: 700, color: '#373737' }}>
            ~{plan.total_piezas}
          </span>
          <span style={{ fontFamily: 'Roboto, sans-serif', fontSize: 12, color: '#ababab' }}>
            piezas de contenido
          </span>
        </div>

        {plan.aprobado_at && (
          <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: 10, color: '#ababab', marginTop: 2 }}>
            Aprobado: {fmtFecha(plan.aprobado_at)}
          </p>
        )}

        {/* Aprobar toda la planeación (solo si es borrador sin contenido generado) */}
        {puedaAprobar && (
          <button
            onClick={() => aprobMut.mutate(plan.mes)}
            disabled={aprobMut.isPending}
            style={{
              width: '100%', marginTop: 14, display: 'flex', alignItems: 'center',
              justifyContent: 'center', gap: 8, padding: '10px 0',
              background: aprobMut.isPending ? '#c8d98f' : '#86a43b',
              border: 'none', borderRadius: 6, cursor: aprobMut.isPending ? 'not-allowed' : 'pointer',
              fontFamily: 'Roboto, sans-serif', fontSize: 13, fontWeight: 700, color: '#fff',
            }}
          >
            <CheckCircle size={15} />
            {aprobMut.isPending ? 'Aprobando…' : 'Aprobar planeación'}
          </button>
        )}

        {plan.estado === 'en_ejecucion' && (
          <div style={{ marginTop: 12, padding: '8px 12px', background: '#f0f6e8', border: '1px solid #c3d88a', borderRadius: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Zap size={12} color="#86a43b" />
            <span style={{ fontFamily: 'Roboto, sans-serif', fontSize: 11, color: '#86a43b' }}>
              Contenido materializado y listo para Publer.
            </span>
          </div>
        )}
      </div>

      {/* ── Progreso de aprobación (si hay contenido) ── */}
      {tieneContenido && todasPiezas.length > 0 && (
        <div style={{ background: '#fff', border: '1px solid #e8e5e0', borderRadius: 8, padding: '14px 16px' }}>
          <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#ababab', marginBottom: 10 }}>
            Progreso de aprobación
          </p>

          {/* Barra grande */}
          <div style={{ background: '#f0eeea', borderRadius: 4, height: 10, overflow: 'hidden', marginBottom: 8 }}>
            <div style={{
              width: `${pct}%`, height: '100%',
              background: todasAprobadas ? '#86a43b' : '#6366f1',
              borderRadius: 4, transition: 'width 0.3s',
            }} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontFamily: '"Roboto Mono", monospace', fontSize: 12, fontWeight: 700, color: '#373737' }}>
              {aprobadas}<span style={{ color: '#ababab', fontWeight: 400 }}>/{totalActivas}</span>
            </span>
            <span style={{ fontFamily: '"Roboto Mono", monospace', fontSize: 12, color: '#6366f1', fontWeight: 700 }}>
              {pct}%
            </span>
          </div>

          {rechazadas > 0 && (
            <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: 10, color: '#ef4444', marginTop: 6 }}>
              {rechazadas} piezas rechazadas
            </p>
          )}

          {/* Botón materializar */}
          {puedaMaterializar && (
            <button
              onClick={() => materMut.mutate()}
              disabled={materMut.isPending}
              style={{
                width: '100%', marginTop: 14, display: 'flex', alignItems: 'center',
                justifyContent: 'center', gap: 8, padding: '10px 0',
                background: materMut.isPending ? '#c8d98f' : '#86a43b',
                border: 'none', borderRadius: 6, cursor: materMut.isPending ? 'not-allowed' : 'pointer',
                fontFamily: 'Roboto, sans-serif', fontSize: 13, fontWeight: 700, color: '#fff',
              }}
            >
              <Package size={15} />
              {materMut.isPending ? 'Materializando…' : 'Materializar y programar'}
            </button>
          )}

          {!todasAprobadas && (
            <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: 10, color: '#ababab', marginTop: 8, textAlign: 'center' }}>
              Aprueba todas las piezas para materializar
            </p>
          )}
        </div>
      )}

      {/* ── Distribución por plataforma ── */}
      <div style={{ background: '#fff', border: '1px solid #e8e5e0', borderRadius: 8, padding: '14px 16px' }}>
        <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#ababab', marginBottom: 12 }}>
          Por plataforma
        </p>
        <DistribucionBar plan={plan.plan_json} />
      </div>

      {/* ── Estructura ── */}
      <div style={{ background: '#fff', border: '1px solid #e8e5e0', borderRadius: 8, padding: '14px 16px' }}>
        <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#ababab', marginBottom: 10 }}>
          Estructura
        </p>
        {[
          { label: 'Semanas',             value: `${plan.plan_json?.semanas?.length ?? 0}` },
          { label: 'Episodios podcast',   value: 'Semanas 1 y 3' },
          { label: 'Artículos HH',        value: '2 premium (sem 2 y 4)' },
          { label: 'Comentarios auth.',   value: '~20 automáticos' },
        ].map(({ label, value }) => (
          <div key={label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontFamily: 'Roboto, sans-serif', fontSize: 11, color: '#878787' }}>{label}</span>
            <span style={{ fontFamily: '"Roboto Mono", monospace', fontSize: 10, color: '#373737', fontWeight: 500 }}>{value}</span>
          </div>
        ))}
      </div>

    </div>
  )
}

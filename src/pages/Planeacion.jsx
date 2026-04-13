import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { RefreshCw, ChevronRight, ArrowLeft, Calendar } from 'lucide-react'
import { api } from '@/api/client'
import SemanaCard from '@/components/planeacion/SemanaCard'
import PlanSidebar from '@/components/planeacion/PlanSidebar'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmtMes(mesNombre) {
  if (!mesNombre) return ''
  return mesNombre.charAt(0).toUpperCase() + mesNombre.slice(1)
}

function tieneContenidoGenerado(planJson) {
  if (!planJson?.semanas) return false
  return planJson.semanas.some(s => s.piezas.some(p => p.contenido_generado || p.tema))
}

function mesProximo() {
  const d = new Date()
  d.setMonth(d.getMonth() + 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

const ESTADO_STYLES = {
  borrador:     { label: 'Borrador',     color: '#878787', bg: '#f5f5f5',  border: '#e4e1db' },
  aprobado:     { label: 'Aprobado',     color: '#86a43b', bg: '#f0f6e8',  border: '#c3d88a' },
  en_ejecucion: { label: 'En ejecución', color: '#6366f1', bg: '#eef2ff',  border: '#c7d2fe' },
  completado:   { label: 'Completado',   color: '#ababab', bg: '#f5f5f5',  border: '#e4e1db' },
}

// ─── Vista lista de meses ─────────────────────────────────────────────────────

function ListaMeses({ planeaciones, onSelect, onGenerar, isPending }) {
  const proximo = mesProximo()

  return (
    <div style={{ padding: 32, maxWidth: 720, margin: '0 auto' }}>

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28, gap: 16 }}>
        <div>
          <h1 style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 700, fontSize: 22, color: '#373737', margin: 0 }}>
            Planeación Mensual
          </h1>
          <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: 12, color: '#ababab', marginTop: 4 }}>
            Flujo M — propuestas creativas por pieza, aprobación y materialización
          </p>
        </div>
        <button
          onClick={() => onGenerar(proximo)}
          disabled={isPending}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '8px 14px', flexShrink: 0,
            background: '#fff', border: '1px solid #e4e1db',
            borderRadius: 6, cursor: isPending ? 'not-allowed' : 'pointer',
            fontFamily: 'Roboto, sans-serif', fontSize: 12, fontWeight: 500, color: '#878787',
          }}
        >
          <RefreshCw size={12} style={{ animation: isPending ? 'spin 1s linear infinite' : 'none' }} />
          {isPending ? 'Generando…' : `Generar ${proximo}`}
        </button>
      </div>

      {planeaciones.length === 0 ? (
        <div style={{ padding: 48, textAlign: 'center', background: '#fff', border: '1px solid #e8e5e0', borderRadius: 8 }}>
          <Calendar size={32} color="#e4e1db" style={{ margin: '0 auto 12px' }} />
          <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: 14, color: '#ababab', margin: 0 }}>
            No hay planeaciones generadas aún.
          </p>
          <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: 12, color: '#c8c4be', marginTop: 6 }}>
            El sistema genera automáticamente el día 5 de cada mes, o genera manualmente arriba.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {planeaciones.map(p => {
            const estadoStyle = ESTADO_STYLES[p.estado] ?? ESTADO_STYLES.borrador
            const semanas = p.plan_json?.semanas || []
            const todasPiezas = semanas.flatMap(s => s.piezas.filter(x => x.red !== 'sistema'))
            const aprobadas  = todasPiezas.filter(x => x.estado === 'aprobado' || x.estado === 'editado').length
            const tieneContenido = tieneContenidoGenerado(p.plan_json)
            const pct = todasPiezas.length > 0 ? Math.round((aprobadas / todasPiezas.length) * 100) : 0

            return (
              <button
                key={p.mes}
                onClick={() => onSelect(p.mes)}
                style={{
                  width: '100%', textAlign: 'left', cursor: 'pointer',
                  background: '#fff', border: '1px solid #e8e5e0',
                  borderRadius: 8, padding: '16px 20px',
                  display: 'flex', alignItems: 'center', gap: 16,
                }}
              >
                {/* Mes */}
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: tieneContenido ? 8 : 0 }}>
                    <span style={{ fontFamily: 'Roboto, sans-serif', fontSize: 15, fontWeight: 600, color: '#373737' }}>
                      {fmtMes(p.mes_nombre)}
                    </span>
                    <span style={{ fontFamily: '"Roboto Mono", monospace', fontSize: 10, color: '#c8c4be' }}>
                      {p.mes}
                    </span>
                    <span style={{
                      background: estadoStyle.bg, color: estadoStyle.color, border: `1px solid ${estadoStyle.border}`,
                      borderRadius: 4, padding: '2px 8px',
                      fontFamily: 'Roboto, sans-serif', fontSize: 9, fontWeight: 700,
                      textTransform: 'uppercase', letterSpacing: '0.08em',
                    }}>
                      {estadoStyle.label}
                    </span>
                  </div>

                  {tieneContenido && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ flex: 1, background: '#f0eeea', borderRadius: 3, height: 4, overflow: 'hidden' }}>
                        <div style={{
                          width: `${pct}%`, height: '100%',
                          background: pct === 100 ? '#86a43b' : '#6366f1',
                          borderRadius: 3, transition: 'width 0.3s',
                        }} />
                      </div>
                      <span style={{ fontFamily: '"Roboto Mono", monospace', fontSize: 10, color: '#ababab', whiteSpace: 'nowrap' }}>
                        {aprobadas}/{todasPiezas.length} aprobadas
                      </span>
                    </div>
                  )}
                </div>

                {/* Total piezas */}
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <span style={{ fontFamily: '"Roboto Mono", monospace', fontSize: 20, fontWeight: 700, color: '#373737' }}>
                    ~{p.total_piezas}
                  </span>
                  <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: 10, color: '#ababab', margin: 0 }}>
                    piezas
                  </p>
                </div>

                <ChevronRight size={16} color="#c8c4be" style={{ flexShrink: 0 }} />
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ─── Vista detalle de un mes ──────────────────────────────────────────────────

function DetalleMes({ plan, planeaciones, onVolver, qc }) {
  const [genError, setGenError] = useState(null)
  const [generandoSemana, setGenerandoSemana] = useState(null)  // número de semana que está generando

  const tieneContenido = tieneContenidoGenerado(plan?.plan_json)

  const genMut = useMutation({
    mutationFn: (mes) => api.generarPlaneacion(mes),
    onSuccess: (data) => {
      setGenError(null)
      if (data?.mock) { setGenError('Sin conexión al servidor'); return }
      qc.invalidateQueries({ queryKey: ['planeaciones'] })
    },
    onError: (e) => setGenError(e.message),
  })

  const aprobMut = useMutation({
    mutationFn: (mes) => api.aprobarPlaneacion(mes),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['planeaciones'] }),
  })

  async function handleGenerarSemana(numSemana) {
    setGenerandoSemana(numSemana)
    try {
      await api.generarContenidoPlan(plan.mes, numSemana)
      qc.invalidateQueries({ queryKey: ['planeaciones'] })
    } catch (e) {
      setGenError(e.message)
    } finally {
      setGenerandoSemana(null)
    }
  }

  return (
    <div style={{ padding: 32, maxWidth: 1000, margin: '0 auto' }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, gap: 16 }}>
        <div>
          <button
            onClick={onVolver}
            style={{
              display: 'flex', alignItems: 'center', gap: 5, marginBottom: 8,
              background: 'none', border: 'none', cursor: 'pointer', padding: 0,
              fontFamily: 'Roboto, sans-serif', fontSize: 11, color: '#ababab',
            }}
          >
            <ArrowLeft size={12} /> Planeaciones
          </button>
          <h1 style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 700, fontSize: 22, color: '#373737', margin: 0 }}>
            {fmtMes(plan.mes_nombre)}
          </h1>
          <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: 12, color: '#ababab', marginTop: 4 }}>
            {plan.mes} · ~{plan.total_piezas} piezas · genera el contenido semana por semana
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
          <button
            onClick={() => genMut.mutate(plan.mes)}
            disabled={genMut.isPending || generandoSemana !== null}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '7px 13px',
              background: '#fff', border: '1px solid #e4e1db',
              borderRadius: 6, cursor: genMut.isPending ? 'not-allowed' : 'pointer',
              fontFamily: 'Roboto, sans-serif', fontSize: 12, fontWeight: 500, color: '#878787',
            }}
          >
            <RefreshCw size={12} style={{ animation: genMut.isPending ? 'spin 1s linear infinite' : 'none' }} />
            {genMut.isPending ? 'Regenerando…' : 'Regenerar estructura'}
          </button>

          {genError && (
            <span style={{ fontFamily: 'Roboto, sans-serif', fontSize: 11, color: '#ef4444' }}>
              {genError}
            </span>
          )}
        </div>
      </div>

      {/* ── Grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 20, alignItems: 'start' }}>

        <div>
          {/* Semanas */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {(plan.plan_json?.semanas || []).map(s => (
              <SemanaCard
                key={s.numero}
                semana={s}
                mes={plan.mes}
                generandoSemana={generandoSemana === s.numero}
                onGenerarContenido={plan.estado !== 'en_ejecucion' ? handleGenerarSemana : null}
              />
            ))}
          </div>

          {/* Artículos hanshatch premium */}
          {(plan.plan_json?.articulos_hanshatch_premium || []).length > 0 && (
            <div style={{ marginTop: 16 }}>
              <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#ababab', marginBottom: 8 }}>
                Artículos hanshatch.com premium
              </p>
              {plan.plan_json.articulos_hanshatch_premium.map((art, i) => (
                <div key={i} style={{ background: '#fff', border: '1px solid #e8e5e0', borderRadius: 8, padding: '12px 16px', marginBottom: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontFamily: 'Roboto, sans-serif', fontSize: 12, fontWeight: 600, color: '#373737' }}>
                      Semana {art.semana} — hanshatch.com
                    </span>
                    <span style={{ fontFamily: '"Roboto Mono", monospace', fontSize: 10, color: '#ababab' }}>
                      {art.total_piezas} piezas
                    </span>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                    {art.piezas.map((p, j) => {
                      const c = { linkedin:'#0077b5', instagram:'#e1306c', x:'#14171a', whatsapp:'#25d366', facebook:'#1877f2', threads:'#101010' }[p.red] || '#ababab'
                      return (
                        <span key={j} style={{ display:'inline-flex', alignItems:'center', gap:3, background:c+'12', color:c, border:`1px solid ${c}30`, borderRadius:4, padding:'2px 7px', fontFamily:'Roboto,sans-serif', fontSize:10, fontWeight:600 }}>
                          {p.red}
                        </span>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <PlanSidebar
          plan={plan}
          tieneContenido={tieneContenido}
          aprobMut={aprobMut}
        />
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function Planeacion() {
  const qc = useQueryClient()
  const [selMes, setSelMes] = useState(null)

  const { data: planeaciones = [], isLoading } = useQuery({
    queryKey: ['planeaciones'],
    queryFn:  () => api.planeaciones(),
  })

  const genMutLista = useMutation({
    mutationFn: (mes) => api.generarPlaneacion(mes),
    onSuccess: (data, mes) => {
      if (!data?.mock) {
        qc.invalidateQueries({ queryKey: ['planeaciones'] })
        setSelMes(mes)
      }
    },
  })

  if (isLoading) return (
    <div style={{ padding: 32, fontFamily: 'Roboto, sans-serif', color: '#ababab' }}>
      Cargando planeación…
    </div>
  )

  const plan = selMes ? planeaciones.find(p => p.mes === selMes) : null

  if (selMes && plan) {
    return (
      <DetalleMes
        plan={plan}
        planeaciones={planeaciones}
        onVolver={() => setSelMes(null)}
        qc={qc}
      />
    )
  }

  return (
    <ListaMeses
      planeaciones={planeaciones}
      onSelect={setSelMes}
      onGenerar={(mes) => genMutLista.mutate(mes)}
      isPending={genMutLista.isPending}
    />
  )
}

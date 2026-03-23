import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { RefreshCw, Sparkles } from 'lucide-react'
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

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function Planeacion() {
  const qc = useQueryClient()
  const [selMes, setSelMes] = useState(null)
  const [genError, setGenError] = useState(null)
  const [contError, setContError] = useState(null)

  const { data: planeaciones = [], isLoading } = useQuery({
    queryKey: ['planeaciones'],
    queryFn:  () => api.planeaciones(),
  })

  const plan = selMes
    ? planeaciones.find(p => p.mes === selMes)
    : planeaciones[0] ?? null

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

  const contMut = useMutation({
    mutationFn: (mes) => api.generarContenidoPlan(mes),
    onSuccess: (data) => {
      setContError(null)
      if (data?.mock) { setContError('Sin conexión al servidor'); return }
      qc.invalidateQueries({ queryKey: ['planeaciones'] })
    },
    onError: (e) => setContError(e.message),
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

  const mesActual = plan?.mes

  return (
    <div style={{ padding: 32, maxWidth: 1000, margin: '0 auto' }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, gap: 16 }}>
        <div>
          <h1 style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 700, fontSize: 22, color: '#373737', margin: 0 }}>
            Planeación Mensual
          </h1>
          <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: 12, color: '#ababab', marginTop: 4 }}>
            Flujo M — propuestas creativas por pieza, aprobación y materialización
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
          {/* Botón generar estructura */}
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => genMut.mutate('2026-04')}
              disabled={genMut.isPending || contMut.isPending}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '7px 13px',
                background: '#fff', border: '1px solid #e4e1db',
                borderRadius: 6, cursor: genMut.isPending ? 'not-allowed' : 'pointer',
                fontFamily: 'Roboto, sans-serif', fontSize: 12, fontWeight: 500, color: '#878787',
              }}
            >
              <RefreshCw size={12} style={{ animation: genMut.isPending ? 'spin 1s linear infinite' : 'none' }} />
              {genMut.isPending ? 'Generando…' : plan ? 'Regenerar estructura' : 'Generar abril 2026'}
            </button>

            {/* Botón generar contenido creativo */}
            {plan && plan.estado !== 'en_ejecucion' && (
              <button
                onClick={() => { setContError(null); contMut.mutate(mesActual) }}
                disabled={genMut.isPending || contMut.isPending}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '7px 13px',
                  background: contMut.isPending ? '#eef2ff' : '#6366f1',
                  border: '1px solid #6366f1',
                  borderRadius: 6, cursor: contMut.isPending ? 'not-allowed' : 'pointer',
                  fontFamily: 'Roboto, sans-serif', fontSize: 12, fontWeight: 600, color: '#fff',
                }}
              >
                <Sparkles size={12} style={{ animation: contMut.isPending ? 'spin 1s linear infinite' : 'none' }} />
                {contMut.isPending ? 'Generando contenido (~30s)…' : tieneContenido ? 'Regenerar contenido' : 'Generar contenido'}
              </button>
            )}
          </div>

          {(genError || contError) && (
            <span style={{ fontFamily: 'Roboto, sans-serif', fontSize: 11, color: '#ef4444' }}>
              {genError || contError}
            </span>
          )}
        </div>
      </div>

      {/* ── Sin datos ── */}
      {planeaciones.length === 0 && (
        <div style={{ padding: 48, textAlign: 'center', background: '#fff', border: '1px solid #e8e5e0', borderRadius: 8 }}>
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
            {/* Selector de mes */}
            {planeaciones.length > 1 && (
              <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
                {planeaciones.map(p => {
                  const activo = (selMes ?? planeaciones[0].mes) === p.mes
                  return (
                    <button key={p.mes} onClick={() => setSelMes(p.mes)} style={{
                      padding: '5px 12px', borderRadius: 5, cursor: 'pointer',
                      fontFamily: 'Roboto, sans-serif', fontSize: 11, fontWeight: 500,
                      border: '1px solid', borderColor: activo ? '#86a43b' : '#e4e1db',
                      color: activo ? '#86a43b' : '#878787',
                      background: activo ? '#f0f6e8' : '#fff',
                    }}>
                      {fmtMes(p.mes_nombre)}
                    </button>
                  )
                })}
              </div>
            )}

            {/* Loading de contenido */}
            {contMut.isPending && (
              <div style={{
                padding: '12px 16px', marginBottom: 12,
                background: '#eef2ff', border: '1px solid #c7d2fe',
                borderRadius: 8, display: 'flex', alignItems: 'center', gap: 8,
              }}>
                <Sparkles size={14} color="#6366f1" />
                <span style={{ fontFamily: 'Roboto, sans-serif', fontSize: 12, color: '#6366f1' }}>
                  Generando propuestas creativas con IA… Tier 1 (matriz temática) → Tier 2 (7 redes en paralelo)
                </span>
              </div>
            )}

            {/* Semanas */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {(plan.plan_json?.semanas || []).map(s => (
                <SemanaCard key={s.numero} semana={s} mes={plan.mes} tieneContenido={tieneContenido} />
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
                        const c = { linkedin:'#0077b5', instagram:'#e1306c', x:'#14171a', whatsapp:'#25d366' }[p.red] || '#ababab'
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

          {/* ── Columna derecha: sidebar ── */}
          <PlanSidebar
            plan={plan}
            tieneContenido={tieneContenido}
            aprobMut={aprobMut}
          />
        </div>
      )}

    </div>
  )
}

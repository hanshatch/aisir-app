import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ChevronDown, ChevronUp, CheckCircle } from 'lucide-react'
import { api } from '@/api/client'
import PiezaCard from './PiezaCard'

const ARCO_LABEL = {
  introducir: 'Introduce el gran tema',
  profundizar: 'Profundiza con datos',
  desafiar:    'Ángulo contrarian',
  cerrar:      'Postura definitiva',
}

export default function SemanaCard({ semana, mes, tieneContenido }) {
  const qc = useQueryClient()
  const [open, setOpen] = useState(semana.numero <= 2)

  const piezasActivas = semana.piezas.filter(p => p.red !== 'sistema')
  const aprobadas     = piezasActivas.filter(p => p.estado === 'aprobado' || p.estado === 'editado').length
  const rechazadas    = piezasActivas.filter(p => p.estado === 'rechazado').length
  const pendientes    = piezasActivas.length - aprobadas - rechazadas
  const pct           = piezasActivas.length > 0 ? Math.round((aprobadas / piezasActivas.length) * 100) : 0

  // Arco detectado de la primera pieza con arco asignado
  const arco = piezasActivas.find(p => p.arco_semana)?.arco_semana

  const aprobSemMut = useMutation({
    mutationFn: () => api.aprobarSemana(mes, semana.numero),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['planeaciones'] }),
  })

  return (
    <div style={{
      background: '#fff',
      border: '1px solid #e8e5e0',
      borderRadius: 8,
      overflow: 'hidden',
    }}>
      {/* ── Header ── */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center',
          padding: '12px 16px', gap: 10,
          background: 'transparent', border: 'none', cursor: 'pointer',
          textAlign: 'left',
        }}
      >
        {/* Número semana */}
        <span style={{
          width: 28, height: 28, borderRadius: 6,
          background: '#86a43b15', border: '1px solid #86a43b30',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: '"Roboto Mono", monospace', fontSize: 12, fontWeight: 700,
          color: '#86a43b', flexShrink: 0,
        }}>
          {semana.numero}
        </span>

        {/* Info */}
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontFamily: 'Roboto, sans-serif', fontSize: 13, fontWeight: 600, color: '#373737' }}>
              Semana {semana.numero}
            </span>
            {semana.hay_podcast && (
              <span style={{
                fontFamily: 'Roboto, sans-serif', fontSize: 9, fontWeight: 600,
                color: '#6366f1', background: '#eef2ff', border: '1px solid #c7d2fe',
                borderRadius: 4, padding: '1px 6px',
              }}>🎙️ podcast</span>
            )}
            {arco && (
              <span style={{
                fontFamily: 'Roboto, sans-serif', fontSize: 9,
                color: '#ababab', fontStyle: 'italic',
              }}>
                {ARCO_LABEL[arco] || arco}
              </span>
            )}
          </div>

          {/* Barra de progreso */}
          {tieneContenido && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
              <div style={{ flex: 1, background: '#f0eeea', borderRadius: 3, height: 4 }}>
                <div style={{
                  width: `${pct}%`, height: '100%',
                  background: pct === 100 ? '#86a43b' : '#6366f1',
                  borderRadius: 3, transition: 'width 0.3s',
                }} />
              </div>
              <span style={{ fontFamily: '"Roboto Mono", monospace', fontSize: 9, color: '#ababab', whiteSpace: 'nowrap' }}>
                {aprobadas}/{piezasActivas.length}
              </span>
            </div>
          )}
        </div>

        {/* Stats rápidos */}
        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
          {tieneContenido && aprobadas > 0 && (
            <span style={{ fontFamily: '"Roboto Mono", monospace', fontSize: 10, color: '#86a43b', fontWeight: 700 }}>
              ✓{aprobadas}
            </span>
          )}
          {tieneContenido && pendientes > 0 && (
            <span style={{ fontFamily: '"Roboto Mono", monospace', fontSize: 10, color: '#6366f1' }}>
              ·{pendientes}
            </span>
          )}
          {!tieneContenido && (
            <span style={{ fontFamily: '"Roboto Mono", monospace', fontSize: 10, color: '#ababab' }}>
              {piezasActivas.length} piezas
            </span>
          )}
        </div>

        {open ? <ChevronUp size={14} color="#ababab" /> : <ChevronDown size={14} color="#ababab" />}
      </button>

      {open && (
        <div style={{ padding: '0 16px 16px', borderTop: '1px solid #f0eeea' }}>

          {/* Botón aprobar semana (si hay contenido y piezas pendientes) */}
          {tieneContenido && pendientes > 0 && (
            <div style={{ padding: '10px 0', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={(e) => { e.stopPropagation(); aprobSemMut.mutate() }}
                disabled={aprobSemMut.isPending}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '6px 14px',
                  background: '#f0f6e8', color: '#86a43b',
                  border: '1px solid #c3d88a', borderRadius: 6,
                  fontFamily: 'Roboto, sans-serif', fontSize: 11, fontWeight: 600,
                  cursor: aprobSemMut.isPending ? 'not-allowed' : 'pointer',
                }}
              >
                <CheckCircle size={12} />
                {aprobSemMut.isPending ? 'Aprobando…' : `Aprobar ${pendientes} piezas pendientes`}
              </button>
            </div>
          )}

          {/* Piezas: si tiene contenido, mostrar PiezaCard; si no, mostrar lista simple */}
          {tieneContenido ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
              {piezasActivas.map(p => (
                <PiezaCard key={p.id} pieza={p} mes={mes} />
              ))}
            </div>
          ) : (
            <div style={{ marginTop: 8 }}>
              {Object.entries(
                semana.piezas.reduce((acc, p) => {
                  if (!acc[p.dia]) acc[p.dia] = []
                  acc[p.dia].push(p)
                  return acc
                }, {})
              ).map(([dia, piezas]) => (
                <DiaRowSimple key={dia} dia={dia} piezas={piezas} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Vista simple sin contenido ───────────────────────────────────────────────

const DIAS_LABEL = { lunes:'Lun', martes:'Mar', miercoles:'Mié', jueves:'Jue', viernes:'Vie', sabado:'Sáb', domingo:'Dom' }
const RED_ICONS  = { linkedin:'💼', instagram:'📸', x:'🐦', tiktok:'🎵', youtube:'▶️', whatsapp:'💬', facebook:'📘', threads:'🧵', sistema:'⚙️' }
const RED_COLORS = { linkedin:'#0077b5', instagram:'#e1306c', x:'#14171a', tiktok:'#ff0050', youtube:'#ff0000', whatsapp:'#25d366', facebook:'#1877f2', threads:'#101010' }

function DiaRowSimple({ dia, piezas }) {
  const redes = piezas.filter(p => p.red !== 'sistema')
  const sistema = piezas.filter(p => p.red === 'sistema')
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '6px 0', borderBottom: '1px solid #f0eeea' }}>
      <span style={{ width: 32, flexShrink: 0, textAlign: 'center', fontFamily: '"Roboto Mono", monospace', fontSize: 10, fontWeight: 600, color: '#ababab', paddingTop: 3 }}>
        {DIAS_LABEL[dia] || dia}
      </span>
      <div style={{ flex: 1 }}>
        {redes.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {redes.map((p, i) => {
              const c = RED_COLORS[p.red] || '#ababab'
              return (
                <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 3, background: c + '12', color: c, border: `1px solid ${c}30`, borderRadius: 4, padding: '2px 7px', fontFamily: 'Roboto, sans-serif', fontSize: 10, fontWeight: 600 }}>
                  {RED_ICONS[p.red]} {p.red}
                </span>
              )
            })}
          </div>
        )}
        {sistema.map((p, i) => (
          <p key={i} style={{ fontFamily: 'Roboto, sans-serif', fontSize: 10, color: '#ababab', margin: '2px 0 0' }}>
            ⚙️ {p.descripcion}
          </p>
        ))}
      </div>
      <span style={{ fontFamily: '"Roboto Mono", monospace', fontSize: 10, color: '#ababab', paddingTop: 3 }}>
        {redes.length > 0 ? `${redes.length}` : ''}
      </span>
    </div>
  )
}

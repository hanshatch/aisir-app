import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ChevronDown, ChevronUp, CheckCircle, Sparkles } from 'lucide-react'
import { api } from '@/api/client'
import PiezaCard from './PiezaCard'

const ARCO_LABEL = {
  introducir: 'Introduce el gran tema',
  profundizar: 'Profundiza con datos',
  desafiar:    'Ángulo contrarian',
  cerrar:      'Postura definitiva',
}

export default function SemanaCard({ semana, mes, generandoSemana, onGenerarContenido }) {
  const qc = useQueryClient()
  const [open, setOpen] = useState(semana.numero <= 2)

  const piezasActivas        = semana.piezas.filter(p => p.red !== 'sistema')
  const tieneContenidoSemana = piezasActivas.some(p => p.contenido_generado || p.tema)
  const aprobadas            = piezasActivas.filter(p => p.estado === 'aprobado' || p.estado === 'editado').length
  const rechazadas           = piezasActivas.filter(p => p.estado === 'rechazado').length
  const pendientes           = piezasActivas.length - aprobadas - rechazadas
  const pct                  = piezasActivas.length > 0 ? Math.round((aprobadas / piezasActivas.length) * 100) : 0

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
          {tieneContenidoSemana && (
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
          {tieneContenidoSemana && aprobadas > 0 && (
            <span style={{ fontFamily: '"Roboto Mono", monospace', fontSize: 10, color: '#86a43b', fontWeight: 700 }}>
              ✓{aprobadas}
            </span>
          )}
          {tieneContenidoSemana && pendientes > 0 && (
            <span style={{ fontFamily: '"Roboto Mono", monospace', fontSize: 10, color: '#6366f1' }}>
              ·{pendientes}
            </span>
          )}
          {!tieneContenidoSemana && (
            <span style={{ fontFamily: '"Roboto Mono", monospace', fontSize: 10, color: '#ababab' }}>
              {piezasActivas.length} piezas
            </span>
          )}
        </div>

        {open ? <ChevronUp size={14} color="#ababab" /> : <ChevronDown size={14} color="#ababab" />}
      </button>

      {open && (
        <div style={{ padding: '0 16px 16px', borderTop: '1px solid #f0eeea' }}>

          {/* Botón generar contenido para esta semana */}
          {!tieneContenidoSemana && (
            <div style={{ padding: '10px 0', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={(e) => { e.stopPropagation(); onGenerarContenido && onGenerarContenido(semana.numero) }}
                disabled={generandoSemana}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '6px 14px',
                  background: generandoSemana ? '#eef2ff' : '#fff',
                  color: '#6366f1', border: '1px solid #c7d2fe', borderRadius: 6,
                  fontFamily: 'Roboto, sans-serif', fontSize: 11, fontWeight: 600,
                  cursor: generandoSemana ? 'not-allowed' : 'pointer',
                }}
              >
                <Sparkles size={12} style={{ animation: generandoSemana ? 'spin 1s linear infinite' : 'none' }} />
                {generandoSemana ? 'Generando con IA…' : 'Generar contenido con IA'}
              </button>
            </div>
          )}

          {/* Botón aprobar semana (si hay contenido y piezas pendientes) */}
          {tieneContenidoSemana && pendientes > 0 && (
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
          {tieneContenidoSemana ? (
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

const CATEGORIA_STYLE = {
  original: { label: 'original', color: '#6366f1', bg: '#eef2ff', border: '#c7d2fe' },
  momento:  { label: 'momento',  color: '#f59e0b', bg: '#fffbeb', border: '#fde68a' },
  archivo:  { label: 'archivo',  color: '#86a43b', bg: '#f0f6e8', border: '#c3d88a' },
  repost:   { label: 'archivo',  color: '#86a43b', bg: '#f0f6e8', border: '#c3d88a' }, // legacy
}

const PILAR_VOZ_LABEL = {
  el_practicante:       'El Practicante',
  el_estratega:         'El Estratega',
  el_profesor_practica: 'El Profesor',
  el_constructor:       'El Constructor',
  la_voz_honesta:       'La Voz Honesta',
}

function PiezaRowSimple({ pieza }) {
  const c = RED_COLORS[pieza.red] || '#ababab'
  const cat = CATEGORIA_STYLE[pieza.categoria] || CATEGORIA_STYLE.original
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: 8,
      padding: '6px 0', borderBottom: '1px solid #f8f7f5',
    }}>
      {/* Categoría badge */}
      <span style={{
        flexShrink: 0,
        fontFamily: '"Roboto Mono", monospace', fontSize: 8, fontWeight: 700,
        color: cat.color, background: cat.bg, border: `1px solid ${cat.border}`,
        borderRadius: 4, padding: '2px 5px', textTransform: 'uppercase', letterSpacing: '0.06em',
        minWidth: 52, textAlign: 'center',
      }}>
        {cat.label}
      </span>

      {/* Red chip */}
      <span style={{
        flexShrink: 0, display: 'inline-flex', alignItems: 'center', gap: 3,
        background: c + '12', color: c, border: `1px solid ${c}30`,
        borderRadius: 4, padding: '2px 7px',
        fontFamily: 'Roboto, sans-serif', fontSize: 10, fontWeight: 600,
        minWidth: 88,
      }}>
        {RED_ICONS[pieza.red]} {pieza.red}
      </span>

      {/* Formato */}
      <span style={{
        flexShrink: 0,
        fontFamily: '"Roboto Mono", monospace', fontSize: 9, color: '#ababab',
        background: '#f5f5f5', border: '1px solid #e4e1db',
        borderRadius: 4, padding: '2px 6px', textTransform: 'uppercase', letterSpacing: '0.06em',
      }}>
        {pieza.formato}
      </span>

      {/* Descripción + pilar voz */}
      <div style={{ flex: 1 }}>
        <span style={{ fontFamily: 'Roboto, sans-serif', fontSize: 11, color: '#878787', lineHeight: 1.4 }}>
          {pieza.descripcion}
        </span>
        {pieza.pilar_voz && (
          <span style={{
            display: 'inline-block', marginLeft: 6,
            fontFamily: 'Roboto, sans-serif', fontSize: 9, fontStyle: 'italic', color: '#6366f1',
          }}>
            · {PILAR_VOZ_LABEL[pieza.pilar_voz] || pieza.pilar_voz}
          </span>
        )}
      </div>
    </div>
  )
}

function DiaRowSimple({ dia, piezas }) {
  const activas = piezas.filter(p => p.red !== 'sistema')
  const sistema = piezas.filter(p => p.red === 'sistema')
  return (
    <div style={{ padding: '8px 0', borderBottom: '1px solid #f0eeea' }}>
      {/* Día header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: activas.length > 0 ? 6 : 0 }}>
        <span style={{
          width: 32, flexShrink: 0, textAlign: 'center',
          fontFamily: '"Roboto Mono", monospace', fontSize: 10, fontWeight: 700, color: '#ababab',
        }}>
          {DIAS_LABEL[dia] || dia}
        </span>
        <span style={{ fontFamily: '"Roboto Mono", monospace', fontSize: 9, color: '#c8c4be' }}>
          {activas.length > 0 ? `${activas.length} piezas` : ''}
        </span>
      </div>

      {/* Piezas activas */}
      {activas.length > 0 && (
        <div style={{ paddingLeft: 40 }}>
          {activas.map((p, i) => <PiezaRowSimple key={i} pieza={p} />)}
        </div>
      )}

      {/* Piezas de sistema */}
      {sistema.map((p, i) => (
        <p key={i} style={{ fontFamily: 'Roboto, sans-serif', fontSize: 10, color: '#ababab', margin: '2px 0 0', paddingLeft: 40 }}>
          ⚙️ {p.descripcion}
        </p>
      ))}
    </div>
  )
}

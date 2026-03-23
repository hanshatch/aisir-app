import { useState } from 'react'
import { CheckCircle, XCircle, Pencil, RefreshCw, ChevronDown, ChevronUp, Anchor } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/api/client'

// ─── Constants ────────────────────────────────────────────────────────────────

const RED_ICONS = { linkedin:'💼', instagram:'📸', x:'🐦', tiktok:'🎵', youtube:'▶️', whatsapp:'💬', facebook:'📘', threads:'🧵' }
const RED_COLORS = { linkedin:'#0077b5', instagram:'#e1306c', x:'#14171a', tiktok:'#ff0050', youtube:'#ff0000', whatsapp:'#25d366', facebook:'#1877f2', threads:'#101010' }

const ESTADO_PIEZA = {
  planificado: { label:'Sin contenido', color:'#ababab', bg:'#f5f5f5', border:'#e4e1db' },
  generado:    { label:'Generado',      color:'#6366f1', bg:'#eef2ff', border:'#c7d2fe' },
  aprobado:    { label:'Aprobado',      color:'#86a43b', bg:'#f0f6e8', border:'#c3d88a' },
  rechazado:   { label:'Rechazado',     color:'#ef4444', bg:'#fef2f2', border:'#fecaca' },
  editado:     { label:'Editado',       color:'#f59e0b', bg:'#fffbeb', border:'#fde68a' },
}

const FUNNEL_COLOR = { alcance:'#6366f1', autoridad:'#86a43b', comunidad:'#f59e0b', conversion:'#ef4444' }

const HOOK_TIPO_EMOJI = { dato:'📊', pregunta:'❓', contrarian:'⚡', historia:'📖', prediccion:'🔮' }

// ─── Content Renderer ─────────────────────────────────────────────────────────

function ContenidoRenderer({ formato, texto }) {
  if (!texto) return null

  const baseStyle = {
    fontFamily: 'Roboto, sans-serif', fontSize: 12, color: '#525252',
    lineHeight: 1.6, margin: 0, whiteSpace: 'pre-wrap',
  }

  if (formato === 'video') {
    // Highlight [MARKERS] in video scripts
    const parts = texto.split(/(\[[^\]]+\])/g)
    return (
      <p style={baseStyle}>
        {parts.map((part, i) =>
          /^\[.+\]$/.test(part)
            ? <span key={i} style={{ color: '#6366f1', fontWeight: 600, fontFamily: '"Roboto Mono", monospace', fontSize: 11 }}>{part}</span>
            : part
        )}
      </p>
    )
  }

  if (formato === 'cita_visual') {
    return (
      <div style={{
        borderLeft: '3px solid #86a43b', paddingLeft: 12,
        fontFamily: 'Roboto, sans-serif', fontSize: 12, color: '#525252',
        fontStyle: 'italic', lineHeight: 1.6,
      }}>
        {texto}
      </div>
    )
  }

  return <p style={baseStyle}>{texto}</p>
}

// ─── PiezaCard ────────────────────────────────────────────────────────────────

export default function PiezaCard({ pieza, mes }) {
  const qc = useQueryClient()
  const [expanded, setExpanded] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [editText, setEditText] = useState('')

  const hasContent = !!(pieza.contenido_generado || pieza.contenido_editado)
  const textoMostrar = pieza.contenido_editado || pieza.contenido_generado
  const estadoStyle = ESTADO_PIEZA[pieza.estado] ?? ESTADO_PIEZA.planificado
  const redColor = RED_COLORS[pieza.red] || '#ababab'

  const invalidate = () => qc.invalidateQueries({ queryKey: ['planeaciones'] })

  const aprobMut = useMutation({
    mutationFn: () => api.actualizarPieza(mes, pieza.id, { estado: 'aprobado' }),
    onSuccess: invalidate,
  })
  const rechMut = useMutation({
    mutationFn: () => api.actualizarPieza(mes, pieza.id, { estado: 'rechazado' }),
    onSuccess: invalidate,
  })
  const editMut = useMutation({
    mutationFn: (contenido_editado) => api.actualizarPieza(mes, pieza.id, { contenido_editado, estado: 'editado' }),
    onSuccess: () => { setEditMode(false); invalidate() },
  })
  const regenMut = useMutation({
    mutationFn: () => api.regenerarPieza(mes, pieza.id),
    onSuccess: invalidate,
  })

  const isBusy = aprobMut.isPending || rechMut.isPending || editMut.isPending || regenMut.isPending

  return (
    <div style={{
      border: `1px solid ${pieza.estado === 'aprobado' ? '#c3d88a' : pieza.estado === 'rechazado' ? '#fecaca' : '#e8e5e0'}`,
      borderRadius: 8, background: '#fff', overflow: 'hidden',
      opacity: pieza.estado === 'rechazado' ? 0.6 : 1,
    }}>
      {/* ── Header ── */}
      <div style={{ padding: '10px 14px', display: 'flex', alignItems: 'flex-start', gap: 8 }}>
        {/* Red chip */}
        <span style={{
          flexShrink: 0, display: 'inline-flex', alignItems: 'center', gap: 3,
          background: redColor + '12', color: redColor, border: `1px solid ${redColor}30`,
          borderRadius: 4, padding: '2px 7px',
          fontFamily: 'Roboto, sans-serif', fontSize: 10, fontWeight: 600,
        }}>
          {RED_ICONS[pieza.red]} {pieza.red}
        </span>

        {/* Formato badge */}
        <span style={{
          flexShrink: 0,
          fontFamily: '"Roboto Mono", monospace', fontSize: 9, color: '#ababab',
          background: '#f5f5f5', border: '1px solid #e4e1db',
          borderRadius: 4, padding: '2px 6px', textTransform: 'uppercase', letterSpacing: '0.08em',
        }}>
          {pieza.formato}
        </span>

        {pieza.es_ancla && (
          <span title="Pieza ancla de la semana" style={{ color: '#f59e0b', display: 'flex', alignItems: 'center' }}>
            <Anchor size={11} />
          </span>
        )}

        <div style={{ flex: 1 }} />

        {/* Impacto */}
        {pieza.impacto_estimado && (
          <span style={{
            fontFamily: '"Roboto Mono", monospace', fontSize: 10, fontWeight: 700,
            color: pieza.impacto_estimado >= 8 ? '#86a43b' : '#ababab',
          }}>
            ↑{pieza.impacto_estimado}
          </span>
        )}

        {/* Estado badge */}
        <span style={{
          background: estadoStyle.bg, color: estadoStyle.color, border: `1px solid ${estadoStyle.border}`,
          borderRadius: 4, padding: '2px 7px',
          fontFamily: 'Roboto, sans-serif', fontSize: 9, fontWeight: 700,
          textTransform: 'uppercase', letterSpacing: '0.06em', flexShrink: 0,
        }}>
          {estadoStyle.label}
        </span>
      </div>

      {/* ── Body: tema + hook ── */}
      {(pieza.tema || pieza.hook) && (
        <div style={{ padding: '0 14px 10px' }}>
          {pieza.tema && (
            <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: 13, fontWeight: 600, color: '#373737', margin: '0 0 4px' }}>
              {HOOK_TIPO_EMOJI[pieza.hook_tipo] || ''} {pieza.tema}
            </p>
          )}
          {pieza.hook && (
            <p style={{
              fontFamily: 'Roboto, sans-serif', fontSize: 11, color: '#6366f1',
              margin: 0, fontStyle: 'italic', lineHeight: 1.5,
            }}>
              "{pieza.hook}"
            </p>
          )}
        </div>
      )}

      {!pieza.tema && (
        <p style={{ padding: '0 14px 10px', fontFamily: 'Roboto, sans-serif', fontSize: 11, color: '#c8c4be', margin: 0 }}>
          {pieza.descripcion}
        </p>
      )}

      {/* ── Contenido expandible ── */}
      {hasContent && (
        <>
          <button
            onClick={() => setExpanded(e => !e)}
            style={{
              width: '100%', textAlign: 'left', padding: '6px 14px',
              background: '#fafafa', border: 'none', borderTop: '1px solid #f0eeea',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            <span style={{ fontFamily: 'Roboto, sans-serif', fontSize: 10, color: '#ababab', flex: 1 }}>
              Ver contenido completo
            </span>
            {expanded ? <ChevronUp size={12} color="#ababab" /> : <ChevronDown size={12} color="#ababab" />}
          </button>

          {expanded && (
            <div style={{ padding: '12px 14px', borderTop: '1px solid #f0eeea' }}>
              {editMode ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <textarea
                    defaultValue={textoMostrar}
                    onChange={e => setEditText(e.target.value)}
                    rows={10}
                    style={{
                      width: '100%', fontFamily: 'Roboto, sans-serif', fontSize: 12,
                      border: '1px solid #c7d2fe', borderRadius: 6, padding: 10,
                      resize: 'vertical', lineHeight: 1.6, color: '#373737',
                    }}
                  />
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => editMut.mutate(editText)} disabled={editMut.isPending}
                      style={{ padding: '6px 14px', background: '#6366f1', color: '#fff', border: 'none', borderRadius: 5, fontSize: 11, cursor: 'pointer', fontFamily: 'Roboto, sans-serif' }}>
                      {editMut.isPending ? 'Guardando…' : 'Guardar edición'}
                    </button>
                    <button onClick={() => setEditMode(false)}
                      style={{ padding: '6px 14px', background: '#f5f5f5', color: '#878787', border: '1px solid #e4e1db', borderRadius: 5, fontSize: 11, cursor: 'pointer', fontFamily: 'Roboto, sans-serif' }}>
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <ContenidoRenderer formato={pieza.formato} texto={textoMostrar} />
              )}
            </div>
          )}
        </>
      )}

      {/* ── Tags footer ── */}
      <div style={{
        padding: '8px 14px', borderTop: '1px solid #f0eeea',
        display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center',
      }}>
        {pieza.pilar && (
          <span style={{ fontFamily: 'Roboto, sans-serif', fontSize: 9, color: '#86a43b', background: '#f0f6e8', border: '1px solid #c3d88a', borderRadius: 4, padding: '1px 6px' }}>
            {pieza.pilar.replace('_', ' ')}
          </span>
        )}
        {pieza.funnel && (
          <span style={{ fontFamily: 'Roboto, sans-serif', fontSize: 9, color: FUNNEL_COLOR[pieza.funnel] || '#ababab', background: (FUNNEL_COLOR[pieza.funnel] || '#ababab') + '15', border: `1px solid ${(FUNNEL_COLOR[pieza.funnel] || '#ababab')}30`, borderRadius: 4, padding: '1px 6px' }}>
            {pieza.funnel}
          </span>
        )}
        {pieza.serie && (
          <span style={{ fontFamily: '"Roboto Mono", monospace', fontSize: 9, color: '#ababab' }}>
            #{pieza.serie}
          </span>
        )}
        {pieza.gap_detectado && (
          <span style={{ fontFamily: 'Roboto, sans-serif', fontSize: 9, color: '#f59e0b' }} title={pieza.gap_detectado}>
            ⚠️ gap
          </span>
        )}
        <div style={{ flex: 1 }} />
        {pieza.inspiracion_ref && (
          <span style={{ fontFamily: 'Roboto, sans-serif', fontSize: 9, color: '#ababab', fontStyle: 'italic' }}>
            {pieza.inspiracion_ref}
          </span>
        )}
      </div>

      {/* ── Actions ── */}
      {pieza.estado !== 'rechazado' && (
        <div style={{
          padding: '8px 14px', borderTop: '1px solid #f0eeea',
          display: 'flex', gap: 6,
        }}>
          {pieza.estado !== 'aprobado' && (
            <button onClick={() => aprobMut.mutate()} disabled={isBusy}
              style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 10px', background: '#f0f6e8', color: '#86a43b', border: '1px solid #c3d88a', borderRadius: 5, fontSize: 11, cursor: 'pointer', fontFamily: 'Roboto, sans-serif', fontWeight: 600 }}>
              <CheckCircle size={12} /> Aprobar
            </button>
          )}
          <button onClick={() => rechMut.mutate()} disabled={isBusy}
            style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 10px', background: '#fef2f2', color: '#ef4444', border: '1px solid #fecaca', borderRadius: 5, fontSize: 11, cursor: 'pointer', fontFamily: 'Roboto, sans-serif' }}>
            <XCircle size={12} /> Rechazar
          </button>
          {hasContent && (
            <button onClick={() => { setEditMode(e => !e); setEditText(textoMostrar || ''); setExpanded(true) }} disabled={isBusy}
              style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 10px', background: '#fffbeb', color: '#f59e0b', border: '1px solid #fde68a', borderRadius: 5, fontSize: 11, cursor: 'pointer', fontFamily: 'Roboto, sans-serif' }}>
              <Pencil size={12} /> Editar
            </button>
          )}
          <button onClick={() => regenMut.mutate()} disabled={isBusy}
            style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 10px', background: '#f5f5f5', color: '#878787', border: '1px solid #e4e1db', borderRadius: 5, fontSize: 11, cursor: isBusy ? 'not-allowed' : 'pointer', fontFamily: 'Roboto, sans-serif' }}>
            <RefreshCw size={12} style={{ animation: regenMut.isPending ? 'spin 1s linear infinite' : 'none' }} />
            {regenMut.isPending ? 'Regenerando…' : 'Regenerar'}
          </button>
        </div>
      )}
    </div>
  )
}

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Plus, Trash2, Power, Youtube, Instagram,
  TrendingUp, MessageSquare, Repeat2, Eye,
  Heart, Bookmark, BarChart2, Lightbulb, Clock, Hash,
} from 'lucide-react'
import { api } from '@/api/client'

// ─── Constants ───────────────────────────────────────────────────────────────

const REDES = ['youtube', 'instagram', 'tiktok', 'x']

const RED_META = {
  youtube:   { color: '#878787', bg: '#efeded', label: 'YouTube',     Icon: Youtube },
  instagram: { color: '#878787', bg: '#efeded', label: 'Instagram',   Icon: Instagram },
  tiktok:    { color: '#373737', bg: '#efeded', label: 'TikTok',      Icon: null },
  x:         { color: '#373737', bg: '#efeded', label: 'X / Twitter', Icon: null },
}


const BRIEF_DATA = {
  generado: '2026-03-16',
  cuentas_analizadas: 5,
  posts_procesados: 47,
  tendencias: [
    { tema: 'Consistencia sobre viralidad',     frecuencia: 12, engagement_prom: 4.8 },
    { tema: 'Autoridad temática vs keywords',   frecuencia: 9,  engagement_prom: 6.2 },
    { tema: 'Video + texto largo (carruseles)', frecuencia: 11, engagement_prom: 5.5 },
    { tema: 'Datos locales México/LATAM',       frecuencia: 7,  engagement_prom: 7.1 },
    { tema: 'Crítica al marketing tradicional', frecuencia: 8,  engagement_prom: 5.9 },
  ],
  formatos_top: [
    { formato: 'Carrusel educativo', porcentaje: 38 },
    { formato: 'Video/Reel',         porcentaje: 31 },
    { formato: 'Thread largo',        porcentaje: 18 },
    { formato: 'Post con dato duro',  porcentaje: 13 },
  ],
  hora_optima: '7–9 AM y 7–9 PM (hora México)',
  frecuencia_recomendada: '5–7 posts/semana',
  insights: [
    'Los posts que inician con un dato o cifra tienen 2.3× más guardados que los que inician con pregunta.',
    'El tono directo y sin eufemismos genera 40% más comentarios críticos — que es engagement real.',
    'Contenido con referentes locales (Bimbo, Oxxo, Telcel) supera en alcance orgánico al contenido genérico.',
    'Los carruseles de 7–10 slides tienen mayor tasa de guardados que los de 3–5 slides.',
    'Las publicaciones en martes y jueves generan en promedio 22% más alcance en la audiencia MX.',
  ],
  oportunidades: [
    'Nadie está haciendo análisis de casos mexicanos con datos duros — nicho abierto.',
    'Video corto explicando conceptos de marca con ejemplos de empresas LATAM.',
    'Thread semanal "Lo que leí esta semana en marketing" — formato curaduría de alta retención.',
  ],
}

// ─── Icons ───────────────────────────────────────────────────────────────────

function TikTokIcon({ size = 14, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.35 6.35 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V9.16a8.27 8.27 0 004.84 1.55V7.27a4.85 4.85 0 01-1.07-.58z" />
    </svg>
  )
}

function XSocialIcon({ size = 14, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.734l7.736-8.846L2.085 2.25H8.23l4.259 5.632L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
    </svg>
  )
}

function RedPlatformIcon({ red, size = 14, color }) {
  const meta = RED_META[red]
  const iconColor = color ?? meta?.color ?? '#878787'
  if (!meta) return null
  if (red === 'youtube')   return <Youtube size={size} color={iconColor} />
  if (red === 'instagram') return <Instagram size={size} color={iconColor} />
  if (red === 'tiktok')    return <TikTokIcon size={size} color={iconColor} />
  if (red === 'x')         return <XSocialIcon size={size} color={iconColor} />
  return null
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmt(n) {
  if (n === null || n === undefined) return null
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}K`
  return String(n)
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function StatCard({ label, value, color }) {
  return (
    <div style={{
      background: '#ffffff',
      border: '1px solid #e4e1db',
      borderRadius: 10,
      boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.05)',
      padding: '16px 20px',
    }}>
      <p className="font-bold uppercase tracking-widest mb-1" style={{
        color: '#ababab', fontFamily: 'Roboto, sans-serif', fontSize: 10, letterSpacing: '0.09em',
      }}>
        {label}
      </p>
      <p className="font-black" style={{
        color: color ?? '#86a43b', fontFamily: 'Roboto, sans-serif', fontSize: 28, lineHeight: 1,
      }}>
        {value ?? '—'}
      </p>
    </div>
  )
}

function CuentaCard({ cuenta, onToggle, onDelete }) {
  const red = cuenta.red ?? cuenta.network ?? 'x'
  const meta = RED_META[red] ?? { color: '#878787', bg: '#efeded', label: red }
  const isActive = cuenta.activa ?? cuenta.active ?? true

  return (
    <div style={{
      background: '#ffffff',
      border: '1px solid #e4e1db',
      borderLeft: `3px solid ${isActive ? '#86a43b' : '#ababab'}`,
      borderRadius: 10,
      boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.05)',
      padding: '14px 16px',
      opacity: isActive ? 1 : 0.5,
      transition: 'opacity 0.15s',
    }}>
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center flex-shrink-0" style={{
          width: 36, height: 36, borderRadius: 8, background: meta.bg, color: meta.color,
        }}>
          <RedPlatformIcon red={red} size={16} color={meta.color} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold leading-tight truncate" style={{
            color: '#373737', fontFamily: 'Roboto, sans-serif', fontSize: 14,
          }}>
            {cuenta.username ?? cuenta.nombre ?? cuenta.name}
          </p>
          {cuenta.url && (
            <a
              href={cuenta.url} target="_blank" rel="noopener noreferrer"
              className="truncate block hover:underline"
              style={{ color: '#ababab', fontFamily: '"Roboto Mono", monospace', fontSize: 10, marginTop: 2 }}
            >
              {cuenta.url}
            </a>
          )}
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button
            onClick={() => onToggle(cuenta.id)}
            title={isActive ? 'Desactivar' : 'Activar'}
            className="flex items-center justify-center transition-all"
            style={{
              width: 30, height: 30, borderRadius: 7, background: '#F0EEEA',
              border: `1px solid ${isActive ? '#86a43b40' : '#ababab'}`,
              color: isActive ? '#86a43b' : '#ababab', cursor: 'pointer',
            }}
          >
            <Power size={13} />
          </button>
          <button
            onClick={() => onDelete(cuenta.id)}
            title="Eliminar"
            className="flex items-center justify-center transition-all"
            style={{
              width: 30, height: 30, borderRadius: 7, background: '#F0EEEA',
              border: '1px solid #e4e1db', color: '#ababab', cursor: 'pointer',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#87878740'; e.currentTarget.style.color = '#878787' }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e4e1db'; e.currentTarget.style.color = '#ababab' }}
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>
      {cuenta.notas && (
        <p className="mt-2 leading-relaxed" style={{
          color: '#ababab', fontFamily: 'Roboto, sans-serif', fontSize: 11,
        }}>
          {cuenta.notas}
        </p>
      )}
    </div>
  )
}

function PostCard({ post }) {
  const red  = post.red ?? 'instagram'
  const meta = RED_META[red] ?? { color: '#878787', bg: '#efeded', label: red }
  const isVideo = post.thumbnail_url && (post.thumbnail_url.includes('.mp4') || post.analisis_formato === 'video' || post.analisis_formato === 'reel')
  const fecha = post.fecha_post ? post.fecha_post.slice(0, 10) : ''

  return (
    <div style={{
      background: '#ffffff', border: '1px solid #e4e1db', borderRadius: 12,
      boxShadow: '0 1px 3px rgba(0,0,0,0.05), 0 4px 16px rgba(0,0,0,0.04)',
      overflow: 'hidden', display: 'flex', flexDirection: 'column',
      transition: 'box-shadow 0.15s, transform 0.15s',
    }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.1), 0 12px 32px rgba(0,0,0,0.07)'
        e.currentTarget.style.transform = 'translateY(-1px)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05), 0 4px 16px rgba(0,0,0,0.04)'
        e.currentTarget.style.transform = 'translateY(0)'
      }}
    >
      {/* Thumbnail */}
      {post.thumbnail_url && !isVideo && (
        <div style={{ width: '100%', height: 180, overflow: 'hidden', background: '#F0EEEA', flexShrink: 0 }}>
          <img
            src={post.thumbnail_url}
            alt=""
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={(e) => { e.currentTarget.parentElement.style.display = 'none' }}
          />
        </div>
      )}
      {post.thumbnail_url && isVideo && (
        <div style={{
          width: '100%', height: 180, background: '#F0EEEA', flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{
            width: 48, height: 48, borderRadius: '50%', background: 'rgba(55,55,55,0.12)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="#878787">
              <path d="M8 5v14l11-7z"/>
            </svg>
          </div>
        </div>
      )}

      <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center" style={{
              width: 26, height: 26, borderRadius: 6, background: meta.bg,
            }}>
              <RedPlatformIcon red={red} size={13} color={meta.color} />
            </div>
            <span className="font-bold" style={{ color: '#373737', fontFamily: 'Roboto, sans-serif', fontSize: 13 }}>
              {post.username}
            </span>
            {post.analisis_formato && (
              <span style={{
                background: '#F0EEEA', color: '#878787', border: '1px solid #e4e1db',
                borderRadius: 5, padding: '2px 7px', fontFamily: 'Roboto, sans-serif', fontSize: 10,
                fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em',
              }}>
                {post.analisis_formato}
              </span>
            )}
          </div>
          <span style={{ color: '#ababab', fontFamily: '"Roboto Mono", monospace', fontSize: 10 }}>
            {fecha}
          </span>
        </div>

        {/* Hook / caption */}
        {post.analisis_hook && (
          <p className="font-bold" style={{ color: '#373737', fontFamily: 'Roboto, sans-serif', fontSize: 13, lineHeight: 1.4 }}>
            {post.analisis_hook}
          </p>
        )}
        <p style={{
          color: '#878787', fontFamily: 'Roboto, sans-serif', fontSize: 12, lineHeight: 1.5, flex: 1,
          display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>
          {post.caption}
        </p>

        {/* Tema Kvasir */}
        {post.analisis_tema && (
          <div className="flex items-center gap-1.5">
            <span style={{
              background: '#86a43b10', color: '#86a43b', border: '1px solid #86a43b30',
              borderRadius: 4, padding: '2px 8px', fontFamily: 'Roboto, sans-serif', fontSize: 10, fontWeight: 600,
            }}>
              {post.analisis_tema}
            </span>
          </div>
        )}

        {/* Métricas + link */}
        <div className="flex items-center justify-between pt-2" style={{ borderTop: '1px solid #F0EEEA' }}>
          <div className="flex items-center gap-4">
            {post.likes > 0 && <MetricaItem icon={<Heart size={12} />} value={fmt(post.likes)} />}
            {post.comentarios > 0 && <MetricaItem icon={<MessageSquare size={12} />} value={fmt(post.comentarios)} />}
            {post.compartidos > 0 && <MetricaItem icon={<Repeat2 size={12} />} value={fmt(post.compartidos)} />}
            {post.engagement_rate > 0 && (
              <MetricaItem icon={<TrendingUp size={12} />} value={`${parseFloat(post.engagement_rate).toFixed(1)}%`} />
            )}
          </div>
          {post.url_post && (
            <a href={post.url_post} target="_blank" rel="noopener noreferrer" style={{
              color: '#ababab', fontFamily: 'Roboto, sans-serif', fontSize: 11,
              textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4,
            }}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#86a43b' }}
              onMouseLeave={(e) => { e.currentTarget.style.color = '#ababab' }}
            >
              Ver post →
            </a>
          )}
        </div>
      </div>
    </div>
  )
}

function MetricaItem({ icon, value }) {
  return (
    <div className="flex items-center gap-1" style={{ color: '#ababab' }}>
      {icon}
      <span style={{ fontFamily: '"Roboto Mono", monospace', fontSize: 11 }}>{value}</span>
    </div>
  )
}

function BriefKvasir() {
  const d = BRIEF_DATA

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Meta row */}
      <div style={{
        background: '#ffffff', border: '1px solid #e4e1db', borderRadius: 12,
        padding: '20px 24px', display: 'flex', flexWrap: 'wrap', gap: 24,
        alignItems: 'center',
      }}>
        <div>
          <p style={{ color: '#ababab', fontFamily: 'Roboto, sans-serif', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.09em', marginBottom: 4 }}>Generado</p>
          <p style={{ color: '#373737', fontFamily: '"Roboto Mono", monospace', fontSize: 14, fontWeight: 700 }}>{d.generado}</p>
        </div>
        <div style={{ width: 1, height: 32, background: '#e4e1db', flexShrink: 0 }} />
        <div>
          <p style={{ color: '#ababab', fontFamily: 'Roboto, sans-serif', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.09em', marginBottom: 4 }}>Cuentas analizadas</p>
          <p style={{ color: '#86a43b', fontFamily: '"Roboto Mono", monospace', fontSize: 22, fontWeight: 900, lineHeight: 1 }}>{d.cuentas_analizadas}</p>
        </div>
        <div style={{ width: 1, height: 32, background: '#e4e1db', flexShrink: 0 }} />
        <div>
          <p style={{ color: '#ababab', fontFamily: 'Roboto, sans-serif', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.09em', marginBottom: 4 }}>Posts procesados</p>
          <p style={{ color: '#86a43b', fontFamily: '"Roboto Mono", monospace', fontSize: 22, fontWeight: 900, lineHeight: 1 }}>{d.posts_procesados}</p>
        </div>
        <div style={{ width: 1, height: 32, background: '#e4e1db', flexShrink: 0 }} />
        <div>
          <p style={{ color: '#ababab', fontFamily: 'Roboto, sans-serif', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.09em', marginBottom: 4 }}>Hora óptima</p>
          <p style={{ color: '#373737', fontFamily: 'Roboto, sans-serif', fontSize: 13, fontWeight: 700 }}>{d.hora_optima}</p>
        </div>
        <div style={{ width: 1, height: 32, background: '#e4e1db', flexShrink: 0 }} />
        <div>
          <p style={{ color: '#ababab', fontFamily: 'Roboto, sans-serif', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.09em', marginBottom: 4 }}>Frecuencia</p>
          <p style={{ color: '#373737', fontFamily: 'Roboto, sans-serif', fontSize: 13, fontWeight: 700 }}>{d.frecuencia_recomendada}</p>
        </div>
        <div style={{ marginLeft: 'auto' }}>
          <span style={{
            background: '#86a43b10', color: '#86a43b', border: '1px solid #86a43b40',
            borderRadius: 6, padding: '5px 12px', fontFamily: 'Roboto, sans-serif',
            fontSize: 11, fontWeight: 700,
          }}>
            Kvasir · Análisis automático
          </span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Tendencias */}
        <div style={{
          background: '#ffffff', border: '1px solid #e4e1db', borderRadius: 12, padding: '20px 24px',
        }}>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={16} color="#86a43b" />
            <p style={{ color: '#373737', fontFamily: 'Roboto, sans-serif', fontSize: 14, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Temas recurrentes
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {d.tendencias.map((t, i) => (
              <div key={i}>
                <div className="flex items-center justify-between mb-1.5">
                  <span style={{ color: '#373737', fontFamily: 'Roboto, sans-serif', fontSize: 12, fontWeight: 600 }}>
                    {t.tema}
                  </span>
                  <div className="flex items-center gap-3">
                    <span style={{ color: '#ababab', fontFamily: '"Roboto Mono", monospace', fontSize: 10 }}>
                      {t.frecuencia}× · {t.engagement_prom}% eng
                    </span>
                  </div>
                </div>
                <div style={{ height: 4, background: '#F0EEEA', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', borderRadius: 2, background: '#86a43b',
                    width: `${(t.frecuencia / 12) * 100}%`,
                    transition: 'width 0.6s ease',
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Formatos top */}
        <div style={{
          background: '#ffffff', border: '1px solid #e4e1db', borderRadius: 12, padding: '20px 24px',
        }}>
          <div className="flex items-center gap-2 mb-4">
            <BarChart2 size={16} color="#86a43b" />
            <p style={{ color: '#373737', fontFamily: 'Roboto, sans-serif', fontSize: 14, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Formatos de mayor impacto
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {d.formatos_top.map((f, i) => (
              <div key={i}>
                <div className="flex items-center justify-between mb-1.5">
                  <span style={{ color: '#373737', fontFamily: 'Roboto, sans-serif', fontSize: 12, fontWeight: 600 }}>{f.formato}</span>
                  <span style={{ color: '#86a43b', fontFamily: '"Roboto Mono", monospace', fontSize: 12, fontWeight: 700 }}>{f.porcentaje}%</span>
                </div>
                <div style={{ height: 6, background: '#F0EEEA', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', borderRadius: 3,
                    background: i === 0 ? '#86a43b' : i === 1 ? '#86a43b99' : '#86a43b55',
                    width: `${f.porcentaje}%`,
                    transition: 'width 0.6s ease',
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Insights */}
      <div style={{
        background: '#ffffff', border: '1px solid #e4e1db', borderRadius: 12, padding: '20px 24px',
      }}>
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb size={16} color="#86a43b" />
          <p style={{ color: '#373737', fontFamily: 'Roboto, sans-serif', fontSize: 14, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Insights clave
          </p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {d.insights.map((ins, i) => (
            <div key={i} className="flex gap-3">
              <div style={{
                width: 20, height: 20, borderRadius: 5, background: '#86a43b15',
                color: '#86a43b', fontFamily: '"Roboto Mono", monospace', fontSize: 10,
                fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, marginTop: 1,
              }}>
                {i + 1}
              </div>
              <p style={{ color: '#373737', fontFamily: 'Roboto, sans-serif', fontSize: 13, lineHeight: 1.5 }}>
                {ins}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Oportunidades */}
      <div style={{
        background: '#ffffff', border: '1px solid #e4e1db',
        borderLeft: '3px solid #86a43b',
        borderRadius: 12, padding: '20px 24px',
      }}>
        <div className="flex items-center gap-2 mb-4">
          <Hash size={16} color="#86a43b" />
          <p style={{ color: '#373737', fontFamily: 'Roboto, sans-serif', fontSize: 14, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Oportunidades de contenido
          </p>
          <span style={{
            marginLeft: 'auto', background: '#86a43b10', color: '#86a43b',
            border: '1px solid #86a43b30', borderRadius: 5, padding: '2px 8px',
            fontFamily: 'Roboto, sans-serif', fontSize: 10, fontWeight: 700,
          }}>
            Para Hans
          </span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {d.oportunidades.map((op, i) => (
            <div key={i} className="flex gap-3 items-start">
              <div style={{
                width: 6, height: 6, borderRadius: '50%', background: '#86a43b',
                flexShrink: 0, marginTop: 6,
              }} />
              <p style={{ color: '#373737', fontFamily: 'Roboto, sans-serif', fontSize: 13, lineHeight: 1.5 }}>
                {op}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function Inspiracion() {
  const qc = useQueryClient()
  const [tab, setTab] = useState('cuentas')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ red: 'instagram', username: '', url: '', notas: '' })
  const [focusedField, setFocusedField] = useState(null)
  const [filtroRed, setFiltroRed] = useState('todas')

  const postsQuery = useQuery({
    queryKey: ['inspiracionPosts'],
    queryFn: () => api.inspiracionPosts({ limit: 100 }),
    enabled: tab === 'contenido',
    staleTime: 60_000,
  })

  const { data, isLoading, isError } = useQuery({
    queryKey: ['inspiracionCuentas'],
    queryFn: api.inspiracionCuentas,
    refetchInterval: 120_000,
  })

  const addMut = useMutation({
    mutationFn: api.addCuenta,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['inspiracionCuentas'] })
      setForm({ red: 'instagram', username: '', url: '', notas: '' })
      setShowForm(false)
    },
  })
  const toggleMut = useMutation({
    mutationFn: api.toggleCuenta,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['inspiracionCuentas'] }),
  })
  const delMut = useMutation({
    mutationFn: api.delCuenta,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['inspiracionCuentas'] }),
  })

  const cuentas = data?.cuentas ?? data ?? []
  const activas = cuentas.filter((c) => c.activa ?? c.active ?? true)

  const byRed = {}
  REDES.forEach((r) => { byRed[r] = [] })
  cuentas.forEach((c) => {
    const r = c.red ?? c.network ?? 'otros'
    if (!byRed[r]) byRed[r] = []
    byRed[r].push(c)
  })

  const redCounts = {}
  REDES.forEach((r) => { redCounts[r] = byRed[r]?.length ?? 0 })

  function handleSubmit(e) {
    e.preventDefault()
    if (!form.username) return
    addMut.mutate(form)
  }

  const inputStyle = (fieldName) => ({
    background: '#ffffff',
    border: `1px solid ${focusedField === fieldName ? '#86a43b' : '#e4e1db'}`,
    borderRadius: 8, color: '#373737', fontFamily: 'Roboto, sans-serif',
    fontSize: 13, padding: '10px 12px', outline: 'none', width: '100%',
    transition: 'border-color 0.15s',
  })


  const TABS = [
    { key: 'cuentas',  label: 'Cuentas',        count: cuentas.length },
    { key: 'contenido', label: 'Contenido',      count: postsQuery.data?.total ?? null },
    { key: 'brief',    label: 'Brief Kvasir',    count: null },
  ]

  return (
    <div className="p-6 animate-fade-in" style={{ background: '#F0EEEA', minHeight: '100%' }}>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="font-black" style={{
            color: '#373737', fontFamily: 'Roboto, sans-serif', fontSize: 24,
          }}>
            Inspiración
          </h1>
          <p className="mt-1" style={{
            color: '#878787', fontFamily: 'Roboto, sans-serif', fontSize: 13,
          }}>
            Kvasir · Monitor de cuentas referentes y extracción de contenido
          </p>
        </div>
        {tab === 'cuentas' && (
          <button
            onClick={() => setShowForm((p) => !p)}
            className="flex items-center gap-2 font-bold transition-all"
            style={{
              background: showForm ? '#ffffff' : '#86a43b',
              color: showForm ? '#878787' : '#ffffff',
              border: `1px solid ${showForm ? '#e4e1db' : '#86a43b'}`,
              borderRadius: 9, padding: '10px 18px',
              fontFamily: 'Roboto, sans-serif', fontSize: 13, cursor: 'pointer',
              boxShadow: showForm ? 'none' : '0 2px 8px rgba(134,164,59,0.25)',
            }}
          >
            <Plus size={15} />
            {showForm ? 'Cancelar' : 'Agregar cuenta'}
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 mb-5">
        <StatCard label="Total" value={cuentas.length} color="#86a43b" />
        <StatCard label="Activas" value={activas.length} color="#86a43b" />
        {REDES.map((r) => (
          <StatCard key={r} label={RED_META[r]?.label ?? r} value={redCounts[r]} color={RED_META[r]?.color ?? '#878787'} />
        ))}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-5" style={{
        background: '#ffffff', border: '1px solid #e4e1db', borderRadius: 10,
        padding: 4, width: 'fit-content',
      }}>
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className="flex items-center gap-2 font-bold transition-all"
            style={{
              background: tab === t.key ? '#86a43b' : 'transparent',
              color: tab === t.key ? '#ffffff' : '#878787',
              border: 'none',
              borderRadius: 7, padding: '8px 16px',
              fontFamily: 'Roboto, sans-serif', fontSize: 13, cursor: 'pointer',
            }}
          >
            {t.label}
            {t.count !== null && (
              <span style={{
                background: tab === t.key ? 'rgba(255,255,255,0.25)' : '#F0EEEA',
                color: tab === t.key ? '#ffffff' : '#ababab',
                borderRadius: 4, padding: '1px 6px',
                fontFamily: '"Roboto Mono", monospace', fontSize: 10, fontWeight: 700,
              }}>
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {isError && tab === 'cuentas' && (
        <div className="mb-4 px-4 py-3" style={{
          background: '#F0EEEA', border: '1px solid #87878740',
          borderRadius: 8, color: '#878787', fontFamily: 'Roboto, sans-serif', fontSize: 13,
        }}>
          Error cargando cuentas
        </div>
      )}

      {/* ── Tab: Cuentas ─────────────────────────────────────────────────── */}
      {tab === 'cuentas' && (
        <>
          {showForm && (
            <div className="mb-6" style={{
              background: '#ffffff', border: '1px solid #e4e1db', borderRadius: 10,
              boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.05)',
              padding: '20px 24px',
            }}>
              <p className="font-bold uppercase tracking-widest mb-4" style={{
                color: '#ababab', fontFamily: 'Roboto, sans-serif', fontSize: 10, letterSpacing: '0.09em',
              }}>
                Nueva cuenta referente
              </p>
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <select
                    value={form.red}
                    onChange={(e) => setForm((p) => ({ ...p, red: e.target.value }))}
                    style={{ ...inputStyle('red'), appearance: 'none', cursor: 'pointer' }}
                    onFocus={() => setFocusedField('red')}
                    onBlur={() => setFocusedField(null)}
                  >
                    {REDES.map((r) => (
                      <option key={r} value={r}>{RED_META[r]?.label ?? r}</option>
                    ))}
                  </select>
                  <input
                    type="text" placeholder="@username" value={form.username}
                    onChange={(e) => setForm((p) => ({ ...p, username: e.target.value }))}
                    required style={inputStyle('username')}
                    onFocus={() => setFocusedField('username')} onBlur={() => setFocusedField(null)}
                  />
                  <input
                    type="url" placeholder="https://..." value={form.url}
                    onChange={(e) => setForm((p) => ({ ...p, url: e.target.value }))}
                    style={inputStyle('url')}
                    onFocus={() => setFocusedField('url')} onBlur={() => setFocusedField(null)}
                  />
                  <button
                    type="submit" disabled={addMut.isPending || !form.username}
                    className="font-bold transition-all"
                    style={{
                      background: addMut.isPending || !form.username ? '#F0EEEA' : '#86a43b',
                      color: addMut.isPending || !form.username ? '#ababab' : '#ffffff',
                      border: '1px solid transparent', borderRadius: 8, padding: '10px 18px',
                      fontFamily: 'Roboto, sans-serif', fontSize: 13,
                      cursor: addMut.isPending ? 'wait' : !form.username ? 'not-allowed' : 'pointer',
                      boxShadow: !form.username ? 'none' : '0 2px 8px rgba(134,164,59,0.25)',
                    }}
                  >
                    {addMut.isPending ? 'Agregando…' : 'Agregar'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {isLoading ? (
            <div className="space-y-6">
              {[...Array(3)].map((_, i) => (
                <div key={i}>
                  <div className="h-4 w-28 animate-pulse mb-3" style={{ background: '#e4e1db', borderRadius: 6 }} />
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                    {[...Array(2)].map((_, j) => (
                      <div key={j} className="animate-pulse" style={{
                        height: 72, background: '#F0EEEA', borderRadius: 10, border: '1px solid #e4e1db',
                      }} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-8">
              {REDES.map((red) => {
                const items = byRed[red] ?? []
                if (items.length === 0) return null
                const meta = RED_META[red] ?? { color: '#878787', bg: '#efeded', label: red }
                return (
                  <div key={red}>
                    <div className="flex items-center gap-2.5 mb-3">
                      <div className="flex items-center justify-center" style={{
                        width: 28, height: 28, borderRadius: 7, background: meta.bg, color: meta.color, flexShrink: 0,
                      }}>
                        <RedPlatformIcon red={red} size={14} color={meta.color} />
                      </div>
                      <p className="font-bold" style={{ color: '#373737', fontFamily: 'Roboto, sans-serif', fontSize: 14 }}>
                        {meta.label}
                      </p>
                      <span className="font-bold" style={{
                        background: meta.bg, color: meta.color, border: `1px solid ${meta.color}30`,
                        borderRadius: 6, padding: '2px 8px', fontFamily: 'Roboto, sans-serif', fontSize: 11,
                      }}>
                        {items.length}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                      {items.map((cuenta) => (
                        <CuentaCard
                          key={cuenta.id} cuenta={cuenta}
                          onToggle={(id) => toggleMut.mutate(id)}
                          onDelete={(id) => delMut.mutate(id)}
                        />
                      ))}
                    </div>
                  </div>
                )
              })}

              {cuentas.length === 0 && (
                <div className="text-center py-16" style={{
                  background: '#ffffff', border: '1px solid #e4e1db', borderRadius: 10,
                }}>
                  <div className="flex items-center justify-center mx-auto mb-4" style={{
                    width: 56, height: 56, borderRadius: 14, background: '#F0EEEA',
                  }}>
                    <Instagram size={24} color="#ababab" />
                  </div>
                  <p className="font-bold mb-1" style={{ color: '#373737', fontFamily: 'Roboto, sans-serif', fontSize: 15 }}>
                    Sin cuentas configuradas
                  </p>
                  <p style={{ color: '#ababab', fontFamily: 'Roboto, sans-serif', fontSize: 13 }}>
                    Agrega cuentas referentes para el análisis mensual de Kvasir
                  </p>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* ── Tab: Contenido ───────────────────────────────────────────────── */}
      {tab === 'contenido' && (() => {
        const allPosts  = postsQuery.data?.posts ?? []
        const redesDisp = [...new Set(allPosts.map((p) => p.red))].filter(Boolean)
        const filtrados = filtroRed === 'todas' ? allPosts : allPosts.filter((p) => p.red === filtroRed)

        return (
          <div>
            {/* Filtros de red */}
            <div className="flex items-center gap-2 mb-5" style={{ flexWrap: 'wrap' }}>
              {['todas', ...redesDisp].map((r) => {
                const meta = r === 'todas' ? null : RED_META[r]
                const isActive = filtroRed === r
                return (
                  <button
                    key={r}
                    onClick={() => setFiltroRed(r)}
                    className="flex items-center gap-1.5 font-bold transition-all"
                    style={{
                      background: isActive ? '#86a43b' : '#ffffff',
                      color: isActive ? '#ffffff' : '#878787',
                      border: `1px solid ${isActive ? '#86a43b' : '#e4e1db'}`,
                      borderRadius: 7, padding: '6px 12px',
                      fontFamily: 'Roboto, sans-serif', fontSize: 12, cursor: 'pointer',
                    }}
                  >
                    {r !== 'todas' && (
                      <RedPlatformIcon red={r} size={12} color={isActive ? '#ffffff' : meta?.color} />
                    )}
                    {r === 'todas' ? 'Todas las redes' : meta?.label ?? r}
                    <span style={{
                      background: isActive ? 'rgba(255,255,255,0.25)' : '#F0EEEA',
                      color: isActive ? '#ffffff' : '#ababab',
                      borderRadius: 4, padding: '1px 6px',
                      fontFamily: '"Roboto Mono", monospace', fontSize: 10, fontWeight: 700,
                    }}>
                      {r === 'todas' ? allPosts.length : allPosts.filter((p) => p.red === r).length}
                    </span>
                  </button>
                )
              })}

              <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Clock size={12} color="#ababab" />
                <span style={{ color: '#ababab', fontFamily: 'Roboto, sans-serif', fontSize: 11 }}>
                  {postsQuery.isFetching ? 'Actualizando…' : `${allPosts.length} posts · Kvasir`}
                </span>
              </div>
            </div>

            {postsQuery.isLoading ? (
              <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16,
              }}>
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="animate-pulse" style={{
                    height: 280, background: '#ffffff', borderRadius: 12, border: '1px solid #e4e1db',
                  }} />
                ))}
              </div>
            ) : postsQuery.isError ? (
              <div className="text-center py-16" style={{
                background: '#ffffff', border: '1px solid #e4e1db', borderRadius: 10,
              }}>
                <p style={{ color: '#878787', fontFamily: 'Roboto, sans-serif', fontSize: 13 }}>
                  Error cargando posts
                </p>
              </div>
            ) : filtrados.length === 0 ? (
              <div className="text-center py-16" style={{
                background: '#ffffff', border: '1px solid #e4e1db', borderRadius: 10,
              }}>
                <p className="font-bold mb-1" style={{ color: '#373737', fontFamily: 'Roboto, sans-serif', fontSize: 15 }}>
                  Sin contenido extraído aún
                </p>
                <p style={{ color: '#ababab', fontFamily: 'Roboto, sans-serif', fontSize: 13 }}>
                  Kvasir extraerá posts de las cuentas activas automáticamente
                </p>
              </div>
            ) : (
              <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16,
              }}>
                {filtrados.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            )}
          </div>
        )
      })()}

      {/* ── Tab: Brief Kvasir ────────────────────────────────────────────── */}
      {tab === 'brief' && <BriefKvasir />}
    </div>
  )
}

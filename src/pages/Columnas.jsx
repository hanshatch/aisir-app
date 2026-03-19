import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ExternalLink, RefreshCw, Search, Zap, CheckCircle } from 'lucide-react'
import { api } from '@/api/client'

// ─── Mock data (mientras el endpoint no exista en el backend) ────────────────

const MOCK_COLUMNAS = [
  {
    id: 1, fuente: 'sm', titulo: 'Implementar IA en marketing: cómo hacerlo en tu estrategia',
    keyword_principal: 'implementar ia en marketing',
    permalink: 'https://soy.marketing/implementar-ia-en-marketing/',
    social_generado: true, publicado_at: '2026-03-19T10:00:00', categoria: 'columna',
  },
  {
    id: 2, fuente: 'sm', titulo: 'El error más común al medir el ROI de redes sociales',
    keyword_principal: 'roi redes sociales',
    permalink: 'https://soy.marketing/error-medir-roi-redes-sociales/',
    social_generado: false, publicado_at: '2026-03-14T09:00:00', categoria: 'columna',
  },
  {
    id: 3, fuente: 'hh', titulo: 'Cómo construí mi primer equipo de marketing digital',
    keyword_principal: 'equipo marketing digital',
    permalink: 'https://hanshatch.com/equipo-marketing-digital/',
    social_generado: true, publicado_at: '2026-03-10T08:00:00', categoria: 'blog',
  },
  {
    id: 4, fuente: 'sm', titulo: 'Data marketing en México: lo que las agencias no hacen',
    keyword_principal: 'data marketing mexico',
    permalink: 'https://soy.marketing/data-marketing-mexico/',
    social_generado: false, publicado_at: '2026-03-05T09:30:00', categoria: 'columna',
  },
  {
    id: 5, fuente: 'hh', titulo: 'Por qué el 80% de las estrategias de contenido fracasan',
    keyword_principal: 'estrategia contenido fracasa',
    permalink: 'https://hanshatch.com/estrategias-contenido-fracasan/',
    social_generado: true, publicado_at: '2026-02-28T10:00:00', categoria: 'blog',
  },
  {
    id: 6, fuente: 'sm', titulo: 'Liderazgo en agencias: el problema no es el cliente',
    keyword_principal: 'liderazgo agencias marketing',
    permalink: 'https://soy.marketing/liderazgo-agencias-marketing/',
    social_generado: true, publicado_at: '2026-02-20T09:00:00', categoria: 'columna',
  },
]

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmtFecha(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })
}

function FuenteChip({ fuente }) {
  const isSM = fuente === 'sm'
  return (
    <span style={{
      background: isSM ? '#86a43b15' : '#F0EEEA',
      color: isSM ? '#86a43b' : '#878787',
      border: `1px solid ${isSM ? '#86a43b40' : '#e4e1db'}`,
      borderRadius: 5, padding: '2px 8px',
      fontFamily: 'Roboto, sans-serif', fontSize: 10, fontWeight: 700,
      textTransform: 'uppercase', letterSpacing: '0.06em', flexShrink: 0,
    }}>
      {isSM ? 'Soy.Marketing' : 'hanshatch.com'}
    </span>
  )
}

// ─── Columna Card ─────────────────────────────────────────────────────────────

function ColumnaCard({ columna, onGenerar, generando }) {
  const generado = columna.social_generado

  return (
    <div style={{
      background: '#ffffff', border: '1px solid #e4e1db',
      borderLeft: `3px solid ${generado ? '#86a43b' : '#ababab'}`,
      borderRadius: 12,
      boxShadow: '0 1px 3px rgba(0,0,0,0.05), 0 4px 16px rgba(0,0,0,0.04)',
      padding: '16px 20px',
      display: 'flex', flexDirection: 'column', gap: 10,
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <FuenteChip fuente={columna.fuente} />
          <span style={{
            color: '#ababab', fontFamily: '"Roboto Mono", monospace', fontSize: 10,
          }}>
            {fmtFecha(columna.publicado_at)}
          </span>
        </div>
        <a
          href={columna.permalink} target="_blank" rel="noopener noreferrer"
          style={{
            display: 'flex', alignItems: 'center', gap: 4,
            color: '#ababab', fontFamily: 'Roboto, sans-serif', fontSize: 11,
            textDecoration: 'none', flexShrink: 0,
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = '#86a43b' }}
          onMouseLeave={(e) => { e.currentTarget.style.color = '#ababab' }}
        >
          Ver <ExternalLink size={11} />
        </a>
      </div>

      {/* Título */}
      <p className="font-bold" style={{
        color: '#373737', fontFamily: 'Roboto, sans-serif', fontSize: 14, lineHeight: 1.4,
      }}>
        {columna.titulo}
      </p>

      {/* Keyword */}
      <p style={{ color: '#ababab', fontFamily: '"Roboto Mono", monospace', fontSize: 11 }}>
        {columna.keyword_principal}
      </p>

      {/* Status + acciones */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        paddingTop: 10, borderTop: '1px solid #F0EEEA', flexWrap: 'wrap', gap: 8,
      }}>
        {/* Chip de estado */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{
            width: 7, height: 7, borderRadius: '50%',
            background: generado ? '#86a43b' : '#ababab',
          }} />
          <span style={{
            color: generado ? '#86a43b' : '#878787',
            fontFamily: 'Roboto, sans-serif', fontSize: 12, fontWeight: 600,
          }}>
            {generado ? 'Contenido generado' : 'Sin contenido'}
          </span>
        </div>

        {/* Botones */}
        <div style={{ display: 'flex', gap: 6 }}>
          {!generado && (
            <button
              onClick={() => onGenerar(columna.id)}
              disabled={generando}
              className="flex items-center gap-1.5 font-bold"
              style={{
                background: generando ? '#F0EEEA' : '#86a43b',
                color: generando ? '#ababab' : '#ffffff',
                border: 'none', borderRadius: 7,
                padding: '7px 14px', fontFamily: 'Roboto, sans-serif', fontSize: 12,
                cursor: generando ? 'wait' : 'pointer',
                boxShadow: generando ? 'none' : '0 2px 8px rgba(134,164,59,0.25)',
              }}
            >
              <Zap size={12} style={{ animation: generando ? 'spin 1s linear infinite' : 'none' }} />
              {generando ? 'Generando…' : 'Generar ahora'}
            </button>
          )}
          {generado && (
            <button
              onClick={() => onGenerar(columna.id)}
              disabled={generando}
              className="flex items-center gap-1.5"
              style={{
                background: '#F0EEEA', color: '#878787',
                border: '1px solid #e4e1db', borderRadius: 7,
                padding: '7px 14px', fontFamily: 'Roboto, sans-serif', fontSize: 12,
                cursor: generando ? 'wait' : 'pointer',
              }}
            >
              <RefreshCw size={12} />
              Generar de nuevo
            </button>
          )}
        </div>
      </div>

      {/* Feedback de éxito */}
      {columna._generadoOk && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: '#86a43b10', border: '1px solid #86a43b30',
          borderRadius: 6, padding: '8px 12px',
        }}>
          <CheckCircle size={13} color="#86a43b" />
          <span style={{ color: '#86a43b', fontFamily: 'Roboto, sans-serif', fontSize: 12 }}>
            Contenido enviado a Telegram para aprobación
          </span>
        </div>
      )}
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function Columnas() {
  const qc = useQueryClient()
  const [tab, setTab]           = useState('todas')
  const [filtroEstado, setFiltroEstado] = useState('todas')
  const [busqueda, setBusqueda] = useState('')
  const [vista, setVista]       = useState('recientes') // 'recientes' | 'repromotion'
  const [generandoId, setGenerandoId] = useState(null)
  const [okIds, setOkIds]       = useState(new Set())

  const { data, isLoading } = useQuery({
    queryKey: ['columnas'],
    queryFn: api.columnas,
    staleTime: 60_000,
  })

  const generarMut = useMutation({
    mutationFn: (id) => api.generarColumna(id),
    onMutate: (id) => setGenerandoId(id),
    onSuccess: (_, id) => {
      setOkIds((prev) => new Set([...prev, id]))
      setGenerandoId(null)
      qc.invalidateQueries({ queryKey: ['columnas'] })
    },
    onError: () => setGenerandoId(null),
  })

  const columnas = data?.columnas ?? MOCK_COLUMNAS

  const filtradas = columnas
    .filter((c) => tab === 'todas' || c.fuente === tab)
    .filter((c) => {
      if (filtroEstado === 'generado') return c.social_generado
      if (filtroEstado === 'sin')      return !c.social_generado
      return true
    })
    .filter((c) => {
      if (!busqueda) return true
      const q = busqueda.toLowerCase()
      return c.titulo.toLowerCase().includes(q) || (c.keyword_principal ?? '').toLowerCase().includes(q)
    })

  const conMarca = filtradas.map((c) => ({ ...c, _generadoOk: okIds.has(c.id) }))

  const TABS = [
    { key: 'todas', label: 'Todas',           count: columnas.length },
    { key: 'sm',    label: 'Soy.Marketing',   count: columnas.filter((c) => c.fuente === 'sm').length },
    { key: 'hh',    label: 'hanshatch.com',   count: columnas.filter((c) => c.fuente === 'hh').length },
  ]

  const sinGenerar = columnas.filter((c) => !c.social_generado).length

  return (
    <div className="p-6 animate-fade-in" style={{ background: '#F0EEEA', minHeight: '100%' }}>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="font-black" style={{
            color: '#373737', fontFamily: 'Roboto, sans-serif', fontSize: 24,
          }}>
            Columnas
          </h1>
          <p className="mt-1" style={{
            color: '#878787', fontFamily: 'Roboto, sans-serif', fontSize: 13,
          }}>
            Soy.Marketing · hanshatch.com — detección automática y distribución
          </p>
        </div>

        {/* Vista toggle */}
        <div style={{
          display: 'flex', background: '#ffffff', border: '1px solid #e4e1db',
          borderRadius: 9, padding: 3, gap: 2,
        }}>
          {[
            { key: 'recientes',   label: 'Recientes' },
            { key: 'repromotion', label: 'Repromotion' },
          ].map((v) => (
            <button
              key={v.key}
              onClick={() => setVista(v.key)}
              style={{
                background: vista === v.key ? '#86a43b' : 'transparent',
                color: vista === v.key ? '#ffffff' : '#878787',
                border: 'none', borderRadius: 7, padding: '7px 14px',
                fontFamily: 'Roboto, sans-serif', fontSize: 12, fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              {v.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        {[
          { label: 'Total',           value: columnas.length,                              color: '#86a43b' },
          { label: 'Soy.Marketing',   value: columnas.filter((c) => c.fuente === 'sm').length, color: '#878787' },
          { label: 'hanshatch.com',   value: columnas.filter((c) => c.fuente === 'hh').length, color: '#878787' },
          { label: 'Sin contenido',   value: sinGenerar,                                   color: sinGenerar > 0 ? '#878787' : '#86a43b' },
        ].map((s) => (
          <div key={s.label} style={{
            background: '#ffffff', border: '1px solid #e4e1db', borderRadius: 10,
            padding: '14px 18px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          }}>
            <p style={{ color: '#ababab', fontFamily: 'Roboto, sans-serif', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.09em', marginBottom: 4 }}>
              {s.label}
            </p>
            <p style={{ color: s.color, fontFamily: 'Roboto, sans-serif', fontSize: 26, fontWeight: 900, lineHeight: 1 }}>
              {s.value}
            </p>
          </div>
        ))}
      </div>

      {/* ── Vista: Recientes ───────────────────────────────────── */}
      {vista === 'recientes' && (
        <>
          {/* Filtros */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
            {/* Tabs fuente */}
            <div style={{
              display: 'flex', background: '#ffffff', border: '1px solid #e4e1db',
              borderRadius: 9, padding: 3, gap: 1,
            }}>
              {TABS.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  style={{
                    background: tab === t.key ? '#86a43b' : 'transparent',
                    color: tab === t.key ? '#ffffff' : '#878787',
                    border: 'none', borderRadius: 6, padding: '6px 12px',
                    fontFamily: 'Roboto, sans-serif', fontSize: 12, fontWeight: 700,
                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5,
                  }}
                >
                  {t.label}
                  <span style={{
                    background: tab === t.key ? 'rgba(255,255,255,0.25)' : '#F0EEEA',
                    color: tab === t.key ? '#ffffff' : '#ababab',
                    borderRadius: 4, padding: '1px 6px',
                    fontFamily: '"Roboto Mono", monospace', fontSize: 9, fontWeight: 700,
                  }}>
                    {t.count}
                  </span>
                </button>
              ))}
            </div>

            {/* Filtro estado */}
            {[
              { key: 'todas',    label: 'Todas' },
              { key: 'generado', label: 'Con contenido' },
              { key: 'sin',      label: 'Sin generar' },
            ].map((f) => (
              <button
                key={f.key}
                onClick={() => setFiltroEstado(f.key)}
                style={{
                  background: filtroEstado === f.key ? '#373737' : '#ffffff',
                  color: filtroEstado === f.key ? '#ffffff' : '#878787',
                  border: `1px solid ${filtroEstado === f.key ? '#373737' : '#e4e1db'}`,
                  borderRadius: 7, padding: '6px 12px',
                  fontFamily: 'Roboto, sans-serif', fontSize: 12, fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Lista */}
          {isLoading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse" style={{
                  height: 130, background: '#ffffff', borderRadius: 12, border: '1px solid #e4e1db',
                }} />
              ))}
            </div>
          ) : conMarca.length === 0 ? (
            <div className="text-center py-16" style={{
              background: '#ffffff', border: '1px solid #e4e1db', borderRadius: 10,
            }}>
              <p className="font-bold mb-1" style={{ color: '#373737', fontFamily: 'Roboto, sans-serif', fontSize: 15 }}>
                Sin columnas para este filtro
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {conMarca.map((columna) => (
                <ColumnaCard
                  key={columna.id}
                  columna={columna}
                  onGenerar={(id) => generarMut.mutate(id)}
                  generando={generandoId === columna.id}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* ── Vista: Repromotion ─────────────────────────────────── */}
      {vista === 'repromotion' && (
        <>
          {/* Buscador */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20,
            background: '#ffffff', border: '1px solid #e4e1db', borderRadius: 9,
            padding: '10px 14px',
          }}>
            <Search size={14} color="#ababab" />
            <input
              type="text"
              placeholder="Buscar por título o keyword…"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              style={{
                flex: 1, border: 'none', outline: 'none', background: 'transparent',
                fontFamily: 'Roboto, sans-serif', fontSize: 13, color: '#373737',
              }}
            />
          </div>

          {/* Tabla */}
          <div style={{
            background: '#ffffff', border: '1px solid #e4e1db', borderRadius: 12,
            overflow: 'hidden',
          }}>
            {/* Head */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '90px 1fr 180px 100px 90px 120px',
              gap: 0, borderBottom: '1px solid #F0EEEA',
              padding: '10px 20px',
            }}>
              {['Fuente', 'Título', 'Keyword', 'Publicado', 'Promovido', 'Acción'].map((h) => (
                <p key={h} style={{
                  color: '#ababab', fontFamily: 'Roboto, sans-serif',
                  fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em',
                }}>
                  {h}
                </p>
              ))}
            </div>

            {/* Rows */}
            {columnas
              .filter((c) => !busqueda || c.titulo.toLowerCase().includes(busqueda.toLowerCase()) || (c.keyword_principal ?? '').toLowerCase().includes(busqueda.toLowerCase()))
              .map((c, i) => (
              <div
                key={c.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '90px 1fr 180px 100px 90px 120px',
                  alignItems: 'center',
                  padding: '12px 20px',
                  borderBottom: i < columnas.length - 1 ? '1px solid #F0EEEA' : 'none',
                  transition: 'background 0.1s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#fafaf9' }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
              >
                <div><FuenteChip fuente={c.fuente} /></div>
                <div>
                  <p style={{
                    color: '#373737', fontFamily: 'Roboto, sans-serif', fontSize: 13, fontWeight: 600,
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '95%',
                  }}>
                    {c.titulo}
                  </p>
                </div>
                <p style={{
                  color: '#ababab', fontFamily: '"Roboto Mono", monospace', fontSize: 10,
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                }}>
                  {c.keyword_principal}
                </p>
                <p style={{ color: '#878787', fontFamily: 'Roboto, sans-serif', fontSize: 11 }}>
                  {fmtFecha(c.publicado_at)}
                </p>
                <div>
                  <span style={{
                    background: c.social_generado ? '#86a43b10' : '#F0EEEA',
                    color: c.social_generado ? '#86a43b' : '#ababab',
                    border: `1px solid ${c.social_generado ? '#86a43b30' : '#e4e1db'}`,
                    borderRadius: 5, padding: '2px 8px',
                    fontFamily: '"Roboto Mono", monospace', fontSize: 10, fontWeight: 700,
                  }}>
                    {c.social_generado ? '1×' : '0×'}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button
                    onClick={() => generarMut.mutate(c.id)}
                    disabled={generandoId === c.id}
                    style={{
                      background: '#86a43b', color: '#ffffff', border: 'none',
                      borderRadius: 6, padding: '5px 10px',
                      fontFamily: 'Roboto, sans-serif', fontSize: 11, fontWeight: 700,
                      cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
                    }}
                  >
                    <Zap size={10} />
                    Re-promover
                  </button>
                  <a
                    href={c.permalink} target="_blank" rel="noopener noreferrer"
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      width: 28, height: 28, borderRadius: 6,
                      background: '#F0EEEA', border: '1px solid #e4e1db', color: '#ababab',
                      textDecoration: 'none',
                    }}
                  >
                    <ExternalLink size={11} />
                  </a>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 flex items-center gap-2 px-4 py-3" style={{
            background: '#ffffff', border: '1px solid #e4e1db', borderRadius: 8,
          }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#ababab', flexShrink: 0 }} />
            <p style={{ color: '#ababab', fontFamily: 'Roboto, sans-serif', fontSize: 12 }}>
              Datos de demostración. Conectar a <code style={{ fontFamily: '"Roboto Mono", monospace' }}>GET /api/columnas</code> cuando el endpoint esté disponible en el backend.
            </p>
          </div>
        </>
      )}
    </div>
  )
}

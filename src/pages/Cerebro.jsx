import { useQuery } from '@tanstack/react-query'
import { api } from '@/api/client'

const CAT_COLORS = {
  voz:          { color: '#7ec832', label: 'Voz' },
  tono:         { color: '#4f9eff', label: 'Tono' },
  estructura:   { color: '#a78bfa', label: 'Estructura' },
  vocabulario:  { color: '#f59e0b', label: 'Vocabulario' },
  postura:      { color: '#e879f9', label: 'Postura' },
  formato:      { color: '#34d399', label: 'Formato' },
  pilar:        { color: '#06b6d4', label: 'Pilar' },
  brand_voice:  { color: '#7ec832', label: 'Brand Voice' },
}

function StatBlock({ label, value, color = '#7ec832', mono = false }) {
  return (
    <div
      style={{
        background: '#0d110d',
        border: '1px solid #1e2d1a',
        borderRadius: 4,
        padding: '16px 20px',
      }}
    >
      <p className="font-mono text-[10px] uppercase tracking-widest mb-2" style={{ color: '#3d5535' }}>
        {label}
      </p>
      <p
        className={`font-display font-black text-3xl ${mono ? 'font-mono' : ''}`}
        style={{ color, textShadow: `0 0 16px ${color}40` }}
      >
        {value ?? '—'}
      </p>
    </div>
  )
}

function ReglaRow({ regla }) {
  const cat = CAT_COLORS[regla.categoria?.toLowerCase()] ?? { color: '#5c7a50', label: regla.categoria ?? '—' }
  return (
    <div
      className="flex items-start gap-3 px-4 py-3 hover:bg-surface2 transition-colors"
      style={{ borderBottom: '1px solid #0f160f' }}
    >
      <span
        className="font-mono text-[9px] uppercase px-1.5 py-0.5 flex-shrink-0 mt-0.5"
        style={{
          background: cat.color + '15',
          color: cat.color,
          border: `1px solid ${cat.color}35`,
          borderRadius: 2,
          minWidth: 60,
          textAlign: 'center',
        }}
      >
        {cat.label}
      </span>
      <p className="text-xs leading-relaxed flex-1" style={{ color: '#8aab78' }}>
        {regla.contenido ?? regla.regla ?? regla.texto}
      </p>
      {regla.peso != null && (
        <span className="font-mono text-[10px] flex-shrink-0 mt-0.5" style={{ color: '#3d5535' }}>
          {typeof regla.peso === 'number' ? regla.peso.toFixed(2) : regla.peso}
        </span>
      )}
    </div>
  )
}

function VocabPill({ palabra, tipo }) {
  const isProhibida = tipo === 'prohibida' || tipo === 'prohibido'
  return (
    <span
      className="inline-block font-mono text-[11px] px-2.5 py-1"
      style={{
        background: isProhibida ? '#1a080820' : '#0d1f0820',
        color: isProhibida ? '#e04545' : '#7ec832',
        border: `1px solid ${isProhibida ? '#e0454535' : '#7ec83235'}`,
        borderRadius: 3,
      }}
    >
      {palabra}
    </span>
  )
}

export default function Cerebro() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['cerebro'],
    queryFn: api.cerebro,
    refetchInterval: 60_000,
  })

  const reglas = data?.reglas ?? []
  const vocabulario = data?.vocabulario ?? []
  const stats = data?.stats ?? {}

  const prohibidas = vocabulario.filter((v) => v.tipo === 'prohibida' || v.tipo === 'prohibido')
  const preferidas = vocabulario.filter((v) => v.tipo === 'preferida' || v.tipo === 'preferido')

  return (
    <div className="p-6 animate-fade-in">
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-display font-black text-2xl text-ink">Cerebro Hans</h1>
        <p className="font-mono text-xs mt-1 text-muted">
          Mimir · Memoria adaptativa del sistema
        </p>
      </div>

      {isError && (
        <div
          className="mb-4 px-4 py-3 font-mono text-xs"
          style={{ background: '#1a0808', border: '1px solid #e04545', borderRadius: 3, color: '#e04545' }}
        >
          Error cargando datos del Cerebro
        </div>
      )}

      {/* Stats */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-20 animate-pulse" style={{ background: '#0d110d', borderRadius: 4 }} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <StatBlock label="Total reglas" value={stats.total_reglas ?? reglas.length} color="#7ec832" />
          <StatBlock label="Aprendidas" value={stats.reglas_aprendidas ?? stats.aprendidas} color="#8b5cf6" />
          <StatBlock label="Eventos (semana)" value={stats.eventos_semana ?? stats.eventos} color="#4f9eff" />
          <StatBlock label="Consolidaciones" value={stats.consolidaciones} color="#e879f9" />
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Reglas */}
        <div
          className="xl:col-span-2"
          style={{
            background: '#0d110d',
            border: '1px solid #1e2d1a',
            borderRadius: 4,
          }}
        >
          <div
            className="px-4 py-3 flex items-center justify-between"
            style={{ borderBottom: '1px solid #1e2d1a' }}
          >
            <p className="font-mono text-xs uppercase tracking-widest text-muted">
              Reglas activas
            </p>
            <span
              className="font-mono text-[10px] px-2 py-0.5"
              style={{ background: '#7ec83218', color: '#7ec832', border: '1px solid #7ec83240', borderRadius: 2 }}
            >
              {reglas.length}
            </span>
          </div>
          {isLoading ? (
            <div className="p-4 space-y-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-10 animate-pulse" style={{ background: '#111611', borderRadius: 2 }} />
              ))}
            </div>
          ) : reglas.length === 0 ? (
            <div className="px-4 py-10 text-center">
              <p className="font-mono text-xs text-muted">Sin reglas activas</p>
            </div>
          ) : (
            <div className="overflow-y-auto" style={{ maxHeight: 440 }}>
              {reglas.map((r, i) => (
                <ReglaRow key={r.id ?? i} regla={r} />
              ))}
            </div>
          )}
        </div>

        {/* Vocabulario */}
        <div
          style={{
            background: '#0d110d',
            border: '1px solid #1e2d1a',
            borderRadius: 4,
          }}
        >
          <div
            className="px-4 py-3"
            style={{ borderBottom: '1px solid #1e2d1a' }}
          >
            <p className="font-mono text-xs uppercase tracking-widest text-muted">
              Vocabulario
            </p>
          </div>

          <div className="p-4 space-y-5">
            {/* Prohibidas */}
            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest mb-2" style={{ color: '#e04545' }}>
                Prohibidas · {prohibidas.length}
              </p>
              {prohibidas.length === 0 ? (
                <p className="font-mono text-xs text-muted">—</p>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {prohibidas.map((v, i) => (
                    <VocabPill key={v.id ?? i} palabra={v.palabra ?? v.word} tipo="prohibida" />
                  ))}
                </div>
              )}
            </div>

            <div style={{ height: 1, background: '#1e2d1a' }} />

            {/* Preferidas */}
            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest mb-2" style={{ color: '#7ec832' }}>
                Preferidas · {preferidas.length}
              </p>
              {preferidas.length === 0 ? (
                <p className="font-mono text-xs text-muted">—</p>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {preferidas.map((v, i) => (
                    <VocabPill key={v.id ?? i} palabra={v.palabra ?? v.word} tipo="preferida" />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Trash2, Power, Youtube, Instagram } from 'lucide-react'
import { api } from '@/api/client'

const REDES = ['youtube', 'instagram', 'tiktok', 'x']

const RED_META = {
  youtube:   { color: '#e04545', label: 'YouTube',   icon: Youtube },
  instagram: { color: '#e879f9', label: 'Instagram', icon: Instagram },
  tiktok:    { color: '#06b6d4', label: 'TikTok',    icon: null },
  x:         { color: '#a1a1aa', label: 'X / Twitter', icon: null },
}

function RedIcon({ red, size = 12 }) {
  const meta = RED_META[red] ?? { color: '#5c7a50' }
  const Icon = meta.icon
  if (Icon) return <Icon size={size} />
  if (red === 'tiktok') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.35 6.35 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V9.16a8.27 8.27 0 004.84 1.55V7.27a4.85 4.85 0 01-1.07-.58z" />
      </svg>
    )
  }
  // X icon
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.734l7.736-8.846L2.085 2.25H8.23l4.259 5.632L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
    </svg>
  )
}

function StatBadge({ label, value, color }) {
  return (
    <div
      style={{
        background: '#0d110d',
        border: '1px solid #1e2d1a',
        borderRadius: 4,
        padding: '12px 16px',
      }}
    >
      <p className="font-mono text-[10px] uppercase tracking-widest mb-1" style={{ color: '#3d5535' }}>
        {label}
      </p>
      <p
        className="font-display font-black text-2xl"
        style={{ color: color ?? '#7ec832' }}
      >
        {value ?? '—'}
      </p>
    </div>
  )
}

function CuentaCard({ cuenta, onToggle, onDelete }) {
  const red = cuenta.red ?? cuenta.network
  const meta = RED_META[red] ?? { color: '#5c7a50', label: red }
  const isActive = cuenta.activa ?? cuenta.active ?? true

  return (
    <div
      style={{
        background: '#0d110d',
        border: `1px solid ${isActive ? '#1e2d1a' : '#161d16'}`,
        borderRadius: 4,
        padding: '12px 14px',
        opacity: isActive ? 1 : 0.55,
      }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <div
            className="w-8 h-8 flex items-center justify-center flex-shrink-0"
            style={{
              border: `1px solid ${meta.color}40`,
              borderRadius: 3,
              background: meta.color + '12',
              color: meta.color,
            }}
          >
            <RedIcon red={red} size={14} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-ink leading-tight truncate">
              {cuenta.username ?? cuenta.nombre ?? cuenta.name}
            </p>
            {cuenta.url && (
              <a
                href={cuenta.url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-[10px] truncate block hover:underline"
                style={{ color: '#3d5535' }}
              >
                {cuenta.url}
              </a>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={() => onToggle(cuenta.id)}
            className="p-1.5 transition-colors"
            style={{
              color: isActive ? '#7ec832' : '#3d5535',
              background: isActive ? '#0d1f08' : '#111611',
              border: `1px solid ${isActive ? '#7ec83240' : '#1e2d1a'}`,
              borderRadius: 2,
            }}
            title={isActive ? 'Desactivar' : 'Activar'}
          >
            <Power size={11} />
          </button>
          <button
            onClick={() => onDelete(cuenta.id)}
            className="p-1.5 transition-colors"
            style={{ color: '#3d5535', background: '#111611', border: '1px solid #1e2d1a', borderRadius: 2 }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#e04545'; e.currentTarget.style.borderColor = '#e0454540' }}
            onMouseLeave={(e) => { e.currentTarget.style.color = '#3d5535'; e.currentTarget.style.borderColor = '#1e2d1a' }}
            title="Eliminar"
          >
            <Trash2 size={11} />
          </button>
        </div>
      </div>
      {cuenta.notas && (
        <p className="font-mono text-[10px] mt-2" style={{ color: '#3d5535' }}>
          {cuenta.notas}
        </p>
      )}
    </div>
  )
}

export default function Inspiracion() {
  const qc = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ red: 'instagram', username: '', url: '', notas: '' })

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

  // Group by red
  const byRed = {}
  REDES.forEach((r) => { byRed[r] = [] })
  cuentas.forEach((c) => {
    const r = c.red ?? c.network ?? 'otros'
    if (!byRed[r]) byRed[r] = []
    byRed[r].push(c)
  })

  // Stats per red
  const redCounts = {}
  REDES.forEach((r) => { redCounts[r] = byRed[r]?.length ?? 0 })

  function handleSubmit(e) {
    e.preventDefault()
    if (!form.username) return
    addMut.mutate(form)
  }

  return (
    <div className="p-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-black text-2xl text-ink">Inspiración</h1>
          <p className="font-mono text-xs mt-1 text-muted">
            Kvasir · Cuentas referentes para análisis mensual
          </p>
        </div>
        <button
          onClick={() => setShowForm((p) => !p)}
          className="flex items-center gap-2 px-3 py-2 font-mono text-xs font-bold transition-all"
          style={{
            background: showForm ? '#111611' : '#7ec832',
            color: showForm ? '#5c7a50' : '#060908',
            borderRadius: 3,
            border: `1px solid ${showForm ? '#2a3d24' : 'transparent'}`,
            boxShadow: showForm ? 'none' : '0 0 12px rgba(126,200,50,0.25)',
          }}
        >
          <Plus size={13} />
          {showForm ? 'Cancelar' : 'Agregar cuenta'}
        </button>
      </div>

      {isError && (
        <div
          className="mb-4 px-4 py-3 font-mono text-xs"
          style={{ background: '#1a0808', border: '1px solid #e04545', borderRadius: 3, color: '#e04545' }}
        >
          Error cargando cuentas
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 mb-6">
        <StatBadge label="Total" value={cuentas.length} color="#7ec832" />
        <StatBadge label="Activas" value={activas.length} color="#34d399" />
        {REDES.map((r) => (
          <StatBadge
            key={r}
            label={RED_META[r]?.label ?? r}
            value={redCounts[r]}
            color={RED_META[r]?.color ?? '#5c7a50'}
          />
        ))}
      </div>

      {/* Add form */}
      {showForm && (
        <div
          className="mb-6 p-4 animate-fade-in"
          style={{ background: '#0d110d', border: '1px solid #2a3d24', borderRadius: 4 }}
        >
          <p className="font-mono text-[10px] uppercase tracking-widest mb-3" style={{ color: '#3d5535' }}>
            Nueva cuenta referente
          </p>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <select
              value={form.red}
              onChange={(e) => setForm((p) => ({ ...p, red: e.target.value }))}
              className="font-mono text-xs px-3 py-2 outline-none"
              style={{
                background: '#080c08',
                border: '1px solid #1e2d1a',
                borderRadius: 3,
                color: '#d4e6c8',
              }}
            >
              {REDES.map((r) => (
                <option key={r} value={r}>{RED_META[r]?.label ?? r}</option>
              ))}
            </select>
            <input
              type="text"
              placeholder="@username"
              value={form.username}
              onChange={(e) => setForm((p) => ({ ...p, username: e.target.value }))}
              required
              className="font-mono text-xs px-3 py-2 outline-none"
              style={{ background: '#080c08', border: '1px solid #1e2d1a', borderRadius: 3, color: '#d4e6c8' }}
              onFocus={(e) => { e.currentTarget.style.borderColor = '#7ec832' }}
              onBlur={(e) => { e.currentTarget.style.borderColor = '#1e2d1a' }}
            />
            <input
              type="url"
              placeholder="https://..."
              value={form.url}
              onChange={(e) => setForm((p) => ({ ...p, url: e.target.value }))}
              className="font-mono text-xs px-3 py-2 outline-none"
              style={{ background: '#080c08', border: '1px solid #1e2d1a', borderRadius: 3, color: '#d4e6c8' }}
              onFocus={(e) => { e.currentTarget.style.borderColor = '#7ec832' }}
              onBlur={(e) => { e.currentTarget.style.borderColor = '#1e2d1a' }}
            />
            <button
              type="submit"
              disabled={addMut.isPending || !form.username}
              className="font-mono text-xs font-bold transition-all"
              style={{
                background: '#7ec832',
                color: '#060908',
                borderRadius: 3,
                cursor: addMut.isPending ? 'wait' : 'pointer',
                boxShadow: '0 0 10px rgba(126,200,50,0.2)',
              }}
            >
              {addMut.isPending ? 'Agregando…' : 'Agregar'}
            </button>
          </form>
        </div>
      )}

      {/* Grouped list */}
      {isLoading ? (
        <div className="space-y-6">
          {[...Array(3)].map((_, i) => (
            <div key={i}>
              <div className="h-4 w-24 animate-pulse mb-3" style={{ background: '#1e2d1a', borderRadius: 2 }} />
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                {[...Array(2)].map((_, j) => (
                  <div key={j} className="h-16 animate-pulse" style={{ background: '#0d110d', borderRadius: 4 }} />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {REDES.map((red) => {
            const items = byRed[red] ?? []
            if (items.length === 0) return null
            const meta = RED_META[red] ?? { color: '#5c7a50', label: red }
            return (
              <div key={red}>
                <div className="flex items-center gap-2 mb-3">
                  <span style={{ color: meta.color }}>
                    <RedIcon red={red} size={13} />
                  </span>
                  <p
                    className="font-mono text-[10px] uppercase tracking-widest"
                    style={{ color: meta.color }}
                  >
                    {meta.label}
                  </p>
                  <span
                    className="font-mono text-[9px] px-1.5 py-0.5"
                    style={{
                      background: meta.color + '15',
                      color: meta.color,
                      border: `1px solid ${meta.color}30`,
                      borderRadius: 2,
                    }}
                  >
                    {items.length}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                  {items.map((cuenta) => (
                    <CuentaCard
                      key={cuenta.id}
                      cuenta={cuenta}
                      onToggle={(id) => toggleMut.mutate(id)}
                      onDelete={(id) => delMut.mutate(id)}
                    />
                  ))}
                </div>
              </div>
            )
          })}

          {cuentas.length === 0 && (
            <div className="text-center py-16">
              <p className="font-mono text-xs text-muted mb-2">Sin cuentas configuradas</p>
              <p className="font-mono text-[10px]" style={{ color: '#2a3d24' }}>
                Agrega cuentas referentes para el análisis mensual de Kvasir
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

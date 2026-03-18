import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Trash2, Power, Youtube, Instagram, X as XIcon } from 'lucide-react'
import { api } from '@/api/client'

const REDES = ['youtube', 'instagram', 'tiktok', 'x']

const RED_META = {
  youtube:   { color: '#dc2626', bg: '#fef2f2', label: 'YouTube',    Icon: Youtube },
  instagram: { color: '#e1306c', bg: '#fff1f5', label: 'Instagram',  Icon: Instagram },
  tiktok:    { color: '#374151', bg: '#f9fafb', label: 'TikTok',     Icon: null },
  x:         { color: '#374151', bg: '#f9fafb', label: 'X / Twitter', Icon: null },
}

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
  if (red === 'youtube') return <Youtube size={size} color={iconColor} />
  if (red === 'instagram') return <Instagram size={size} color={iconColor} />
  if (red === 'tiktok') return <TikTokIcon size={size} color={iconColor} />
  if (red === 'x') return <XSocialIcon size={size} color={iconColor} />
  return null
}

function StatCard({ label, value, color, bg }) {
  return (
    <div
      style={{
        background: '#ffffff',
        border: '1px solid #e4e1db',
        borderRadius: 10,
        boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.05)',
        padding: '16px 20px',
      }}
    >
      <p
        className="font-bold uppercase tracking-widest mb-1"
        style={{
          color: '#ababab',
          fontFamily: '"Nunito Sans", sans-serif',
          fontSize: 10,
          letterSpacing: '0.09em',
        }}
      >
        {label}
      </p>
      <p
        className="font-black"
        style={{
          color: color ?? '#76a72b',
          fontFamily: '"Nunito Sans", sans-serif',
          fontSize: 28,
          lineHeight: 1,
        }}
      >
        {value ?? '—'}
      </p>
    </div>
  )
}

function CuentaCard({ cuenta, onToggle, onDelete }) {
  const red = cuenta.red ?? cuenta.network ?? 'x'
  const meta = RED_META[red] ?? { color: '#878787', bg: '#f7f6f3', label: red }
  const isActive = cuenta.activa ?? cuenta.active ?? true

  return (
    <div
      style={{
        background: '#ffffff',
        border: '1px solid #e4e1db',
        borderLeft: `3px solid ${meta.color}`,
        borderRadius: 10,
        boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.05)',
        padding: '14px 16px',
        opacity: isActive ? 1 : 0.5,
        transition: 'opacity 0.15s',
      }}
    >
      <div className="flex items-center gap-3">
        <div
          className="flex items-center justify-center flex-shrink-0"
          style={{
            width: 36,
            height: 36,
            borderRadius: 8,
            background: meta.bg,
            color: meta.color,
          }}
        >
          <RedPlatformIcon red={red} size={16} color={meta.color} />
        </div>

        <div className="flex-1 min-w-0">
          <p
            className="font-bold leading-tight truncate"
            style={{
              color: '#2a2a2a',
              fontFamily: '"Nunito Sans", sans-serif',
              fontSize: 14,
            }}
          >
            {cuenta.username ?? cuenta.nombre ?? cuenta.name}
          </p>
          {cuenta.url && (
            <a
              href={cuenta.url}
              target="_blank"
              rel="noopener noreferrer"
              className="truncate block hover:underline"
              style={{
                color: '#ababab',
                fontFamily: '"Roboto Mono", monospace',
                fontSize: 10,
                marginTop: 2,
              }}
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
              width: 30,
              height: 30,
              borderRadius: 7,
              background: isActive ? '#f0f7e6' : '#f5f4f0',
              border: `1px solid ${isActive ? '#76a72b40' : '#e4e1db'}`,
              color: isActive ? '#76a72b' : '#ababab',
              cursor: 'pointer',
            }}
          >
            <Power size={13} />
          </button>
          <button
            onClick={() => onDelete(cuenta.id)}
            title="Eliminar"
            className="flex items-center justify-center transition-all"
            style={{
              width: 30,
              height: 30,
              borderRadius: 7,
              background: '#f5f4f0',
              border: '1px solid #e4e1db',
              color: '#ababab',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#fef2f2'
              e.currentTarget.style.borderColor = '#dc262640'
              e.currentTarget.style.color = '#dc2626'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#f5f4f0'
              e.currentTarget.style.borderColor = '#e4e1db'
              e.currentTarget.style.color = '#ababab'
            }}
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>
      {cuenta.notas && (
        <p
          className="mt-2 leading-relaxed"
          style={{
            color: '#ababab',
            fontFamily: 'Roboto, sans-serif',
            fontSize: 11,
          }}
        >
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
  const [focusedField, setFocusedField] = useState(null)

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
    border: `1px solid ${focusedField === fieldName ? '#76a72b' : '#e4e1db'}`,
    borderRadius: 8,
    color: '#2a2a2a',
    fontFamily: 'Roboto, sans-serif',
    fontSize: 13,
    padding: '10px 12px',
    outline: 'none',
    width: '100%',
    transition: 'border-color 0.15s',
  })

  return (
    <div className="p-6 animate-fade-in" style={{ background: '#f0eeea', minHeight: '100%' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1
            className="font-black"
            style={{
              color: '#2a2a2a',
              fontFamily: '"Nunito Sans", sans-serif',
              fontSize: 24,
            }}
          >
            Inspiración
          </h1>
          <p
            className="mt-1"
            style={{
              color: '#878787',
              fontFamily: 'Roboto, sans-serif',
              fontSize: 13,
            }}
          >
            Kvasir · Cuentas referentes para análisis mensual
          </p>
        </div>
        <button
          onClick={() => setShowForm((p) => !p)}
          className="flex items-center gap-2 font-bold transition-all"
          style={{
            background: showForm ? '#ffffff' : '#76a72b',
            color: showForm ? '#878787' : '#ffffff',
            border: `1px solid ${showForm ? '#e4e1db' : '#76a72b'}`,
            borderRadius: 9,
            padding: '10px 18px',
            fontFamily: '"Nunito Sans", sans-serif',
            fontSize: 13,
            cursor: 'pointer',
            boxShadow: showForm ? 'none' : '0 2px 8px rgba(118,167,43,0.25)',
          }}
        >
          <Plus size={15} />
          {showForm ? 'Cancelar' : 'Agregar cuenta'}
        </button>
      </div>

      {isError && (
        <div
          className="mb-4 px-4 py-3"
          style={{
            background: '#fef2f2',
            border: '1px solid #dc262640',
            borderRadius: 8,
            color: '#dc2626',
            fontFamily: 'Roboto, sans-serif',
            fontSize: 13,
          }}
        >
          Error cargando cuentas
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 mb-6">
        <StatCard label="Total" value={cuentas.length} color="#76a72b" />
        <StatCard label="Activas" value={activas.length} color="#059669" />
        {REDES.map((r) => (
          <StatCard
            key={r}
            label={RED_META[r]?.label ?? r}
            value={redCounts[r]}
            color={RED_META[r]?.color ?? '#878787'}
            bg={RED_META[r]?.bg}
          />
        ))}
      </div>

      {/* Add form */}
      {showForm && (
        <div
          className="mb-6"
          style={{
            background: '#ffffff',
            border: '1px solid #e4e1db',
            borderRadius: 10,
            boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.05)',
            padding: '20px 24px',
          }}
        >
          <p
            className="font-bold uppercase tracking-widest mb-4"
            style={{
              color: '#ababab',
              fontFamily: '"Nunito Sans", sans-serif',
              fontSize: 10,
              letterSpacing: '0.09em',
            }}
          >
            Nueva cuenta referente
          </p>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <select
                value={form.red}
                onChange={(e) => setForm((p) => ({ ...p, red: e.target.value }))}
                style={{
                  ...inputStyle('red'),
                  appearance: 'none',
                  cursor: 'pointer',
                }}
                onFocus={() => setFocusedField('red')}
                onBlur={() => setFocusedField(null)}
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
                style={inputStyle('username')}
                onFocus={() => setFocusedField('username')}
                onBlur={() => setFocusedField(null)}
              />
              <input
                type="url"
                placeholder="https://..."
                value={form.url}
                onChange={(e) => setForm((p) => ({ ...p, url: e.target.value }))}
                style={inputStyle('url')}
                onFocus={() => setFocusedField('url')}
                onBlur={() => setFocusedField(null)}
              />
              <button
                type="submit"
                disabled={addMut.isPending || !form.username}
                className="font-bold transition-all"
                style={{
                  background: addMut.isPending || !form.username ? '#f7f6f3' : '#76a72b',
                  color: addMut.isPending || !form.username ? '#ababab' : '#ffffff',
                  border: '1px solid transparent',
                  borderRadius: 8,
                  padding: '10px 18px',
                  fontFamily: '"Nunito Sans", sans-serif',
                  fontSize: 13,
                  cursor: addMut.isPending ? 'wait' : !form.username ? 'not-allowed' : 'pointer',
                  boxShadow: !form.username ? 'none' : '0 2px 8px rgba(118,167,43,0.25)',
                }}
              >
                {addMut.isPending ? 'Agregando…' : 'Agregar'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Grouped list */}
      {isLoading ? (
        <div className="space-y-6">
          {[...Array(3)].map((_, i) => (
            <div key={i}>
              <div
                className="h-4 w-28 animate-pulse mb-3"
                style={{ background: '#e4e1db', borderRadius: 6 }}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                {[...Array(2)].map((_, j) => (
                  <div
                    key={j}
                    className="animate-pulse"
                    style={{
                      height: 72,
                      background: '#f7f6f3',
                      borderRadius: 10,
                      border: '1px solid #e4e1db',
                    }}
                  />
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
            const meta = RED_META[red] ?? { color: '#878787', bg: '#f5f4f0', label: red }
            return (
              <div key={red}>
                <div className="flex items-center gap-2.5 mb-3">
                  <div
                    className="flex items-center justify-center"
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 7,
                      background: meta.bg,
                      color: meta.color,
                      flexShrink: 0,
                    }}
                  >
                    <RedPlatformIcon red={red} size={14} color={meta.color} />
                  </div>
                  <p
                    className="font-bold"
                    style={{
                      color: '#2a2a2a',
                      fontFamily: '"Nunito Sans", sans-serif',
                      fontSize: 14,
                    }}
                  >
                    {meta.label}
                  </p>
                  <span
                    className="font-bold"
                    style={{
                      background: meta.bg,
                      color: meta.color,
                      border: `1px solid ${meta.color}30`,
                      borderRadius: 6,
                      padding: '2px 8px',
                      fontFamily: '"Nunito Sans", sans-serif',
                      fontSize: 11,
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
            <div
              className="text-center py-16"
              style={{
                background: '#ffffff',
                border: '1px solid #e4e1db',
                borderRadius: 10,
              }}
            >
              <div
                className="flex items-center justify-center mx-auto mb-4"
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 14,
                  background: '#f7f6f3',
                }}
              >
                <Instagram size={24} color="#ababab" />
              </div>
              <p
                className="font-bold mb-1"
                style={{
                  color: '#2a2a2a',
                  fontFamily: '"Nunito Sans", sans-serif',
                  fontSize: 15,
                }}
              >
                Sin cuentas configuradas
              </p>
              <p
                style={{
                  color: '#ababab',
                  fontFamily: 'Roboto, sans-serif',
                  fontSize: 13,
                }}
              >
                Agrega cuentas referentes para el análisis mensual de Kvasir
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

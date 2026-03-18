import { mockFor } from './mock'

const API = '/api'

// En desarrollo sin backend, cae al mock automáticamente
async function req(path, opts = {}) {
  try {
    const res = await fetch(`${API}${path}`, {
      headers: { 'Content-Type': 'application/json', ...opts.headers },
      ...opts,
    })
    if (!res.ok) throw new Error(`API ${res.status}: ${path}`)
    return res.json()
  } catch {
    // GET requests: fallback a datos mock
    if (!opts.method || opts.method === 'GET') {
      const mock = mockFor(path)
      if (mock !== null) return mock
    }
    // POST/PUT/DELETE sin backend: simular éxito silencioso
    return { ok: true, mock: true }
  }
}

export const api = {
  get:  (path)        => req(path),
  post: (path, body)  => req(path, { method: 'POST',   body: JSON.stringify(body) }),
  put:  (path, body)  => req(path, { method: 'PUT',    body: JSON.stringify(body) }),
  del:  (path)        => req(path, { method: 'DELETE' }),

  // Auth
  login:  (pwd) => req('/auth/login',  { method: 'POST', body: JSON.stringify({ password: pwd }) }),
  logout: ()    => req('/auth/logout', { method: 'POST' }),
  me:     ()    => req('/auth/me'),

  // Agentes
  agentes:    ()  => req('/agentes'),
  agenteLogs: (k) => req(`/agentes/${k}/logs`),

  // Pipeline
  pipeline: () => req('/pipeline'),
  temas:    () => req('/temas'),

  // Contenido
  contenido:       ()        => req('/contenido'),
  aprobarContent:  (id)      => req(`/contenido/${id}/aprobar`,  { method: 'POST' }),
  rechazarContent: (id, why) => req(`/contenido/${id}/rechazar`, { method: 'POST', body: JSON.stringify({ motivo: why }) }),

  // Calendario
  calendario: (semana) => req(`/calendario?semana=${semana ?? ''}`),

  // Actividad
  actividad: (limit = 100) => req(`/actividad?limit=${limit}`),

  // Cerebro
  cerebro: () => req('/cerebro'),

  // Métricas
  metricas: () => req('/metricas'),

  // Inspiración
  inspiracionCuentas: ()      => req('/inspiracion/cuentas'),
  addCuenta:    (data)        => req('/inspiracion/cuentas',            { method: 'POST',   body: JSON.stringify(data) }),
  toggleCuenta: (id)          => req(`/inspiracion/cuentas/${id}/toggle`, { method: 'POST' }),
  delCuenta:    (id)          => req(`/inspiracion/cuentas/${id}`,      { method: 'DELETE' }),
  inspiracionBrief: ()        => req('/inspiracion/brief'),
}

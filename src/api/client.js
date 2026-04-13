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
    return await res.json()
  } catch {
    // Fallback a mock para cualquier método
    const mock = mockFor(path, opts)
    if (mock !== null) return mock
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
  addCuenta:    (data)        => req('/inspiracion/cuentas',                   { method: 'POST',   body: JSON.stringify(data) }),
  toggleCuenta: (id)          => req(`/inspiracion/cuentas/${id}/toggle`,      { method: 'POST' }),
  delCuenta:    (id)          => req(`/inspiracion/cuentas/${id}`,             { method: 'DELETE' }),
  inspiracionBrief: ()        => req('/inspiracion/brief'),
  inspiracionPosts: (params = {}) => {
    const qs = new URLSearchParams(params).toString()
    return req(`/inspiracion/posts${qs ? '?' + qs : ''}`)
  },
  feedbackPost: (id, body)    => req(`/inspiracion/posts/${id}/feedback`,      { method: 'POST', body: JSON.stringify(body) }),
  scrapeInspiracion: ()       => req('/inspiracion/scrape',                    { method: 'POST' }),

  // Flujos (desde BD vía FastAPI)
  flujos: () => req('/flujos'),
  updateFlujo: (id, body) => req(`/flujos/${id}`, { method: 'PUT', body: JSON.stringify(body) }),

  // Costos
  costos: (dias = 30) => req(`/costos?dias=${dias}`),

  // Columnas SM / HH
  columnas:      (params = {}) => req(`/columnas${new URLSearchParams(params).toString() ? '?' + new URLSearchParams(params).toString() : ''}`),
  generarColumna: (id)         => req(`/columnas/${id}/generar`, { method: 'POST' }),

  // Planeación mensual
  planeaciones:        ()           => req('/planeacion'),
  planeacionVigente:   ()           => req('/planeacion/vigente'),
  generarPlaneacion:   (mes)        => req('/planeacion/generar', { method: 'POST', body: JSON.stringify(mes ? { mes } : {}) }),
  aprobarPlaneacion:   (mes)        => req(`/planeacion/${mes}/aprobar`, { method: 'POST' }),
  generarContenidoPlan:(mes, semana) => req(`/planeacion/${mes}/generar-contenido${semana != null ? `?semana=${semana}` : ''}`, { method: 'POST' }),
  actualizarPieza:     (mes, id, body) => req(`/planeacion/${mes}/pieza/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  regenerarPieza:      (mes, id)    => req(`/planeacion/${mes}/pieza/${id}/regenerar`, { method: 'POST' }),
  aprobarSemana:       (mes, num)   => req(`/planeacion/${mes}/semana/${num}/aprobar`, { method: 'POST' }),
  materializarPlan:    (mes)        => req(`/planeacion/${mes}/materializar`, { method: 'POST' }),
}

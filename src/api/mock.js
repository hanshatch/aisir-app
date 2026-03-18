const now = Date.now()
const t = (min) => new Date(now - min * 60 * 1000).toISOString()

// Persistencia en localStorage para desarrollo
const LS_KEY = 'aisir_mock_cuentas'
const DEFAULT_CUENTAS = [
  { id: 1, red: 'instagram', username: '@garyvee',         url: 'https://instagram.com/garyvee',        activa: true  },
  { id: 2, red: 'instagram', username: '@neilpatel',        url: 'https://instagram.com/neilpatel',      activa: true  },
  { id: 3, red: 'youtube',   username: 'Marketing con Roi', url: 'https://youtube.com/@marketingconroi', activa: true  },
  { id: 4, red: 'tiktok',    username: '@marketingtok',     url: 'https://tiktok.com/@marketingtok',     activa: false },
  { id: 5, red: 'x',         username: '@MarketingMX',      url: 'https://x.com/MarketingMX',            activa: true  },
]

function loadCuentas() {
  try { return JSON.parse(localStorage.getItem(LS_KEY)) || DEFAULT_CUENTAS }
  catch { return DEFAULT_CUENTAS }
}
function saveCuentas(cuentas) {
  localStorage.setItem(LS_KEY, JSON.stringify(cuentas))
}

let _cuentas = loadCuentas()
let _nextId = Math.max(..._cuentas.map(c => c.id), 5) + 1

export const MOCK = {
  agentes: [
    { key: 'aisir',     agente: 'aisir',     ops: 1_247, last_at: t(5)         },
    { key: 'huginn',    agente: 'huginn',    ops: 384,   last_at: t(120)        },
    { key: 'bragi',     agente: 'bragi',     ops: 521,   last_at: t(30)         },
    { key: 'loki',      agente: 'loki',      ops: 893,   last_at: t(45)         },
    { key: 'floki', agente: 'floki', ops: 156,   last_at: t(300)        },
    { key: 'kvasir',    agente: 'kvasir',    ops: 47,    last_at: t(60 * 24 * 3) },
    { key: 'idunn',     agente: 'idunn',     ops: 234,   last_at: t(60)         },
    { key: 'odin',      agente: 'odin',      ops: 78,    last_at: t(180)        },
    { key: 'frigg',     agente: 'frigg',     ops: 312,   last_at: t(20)         },
    { key: 'mimir',     agente: 'mimir',     ops: 89,    last_at: t(720)        },
  ],

  pipeline: {
    items: [
      { id: 1, titulo: 'IA y el futuro del marketing en México',       tipo: 'linkedin',  estado: 'pendiente_aprobacion', created_at: t(120) },
      { id: 2, titulo: 'Cómo Bimbo construyó su marca en 80 años',     tipo: 'instagram', estado: 'aprobado',             created_at: t(240) },
      { id: 3, titulo: 'Data marketing: decisiones sin datos no son estrategia', tipo: 'x', estado: 'borrador',       created_at: t(360) },
      { id: 4, titulo: 'El error más común en agencias de marketing',   tipo: 'tiktok',   estado: 'aprobado',             created_at: t(480) },
      { id: 5, titulo: 'Newsletter: Tendencias Q1 2026',               tipo: 'newsletter', estado: 'pendiente_aprobacion', created_at: t(600) },
      { id: 6, titulo: 'Lo que nadie dice sobre el posicionamiento',    tipo: 'linkedin',  estado: 'publicado',            created_at: t(1440) },
      { id: 7, titulo: 'Carousel: 5 métricas que sí importan',         tipo: 'carousel',  estado: 'borrador',             created_at: t(720) },
    ],
  },

  temas: [
    { id: 1, titulo: 'IA generativa en agencias MX: oportunidad o amenaza', pilar: 'ia',              score: 94 },
    { id: 2, titulo: 'El caso Oxxo: datos que definen el retail mexicano',   pilar: 'data',            score: 88 },
    { id: 3, titulo: 'Brecha academia-mercado: lo que no se enseña',         pilar: 'academia',        score: 82 },
    { id: 4, titulo: 'Cómo medir el ROI de marca en 2026',                  pilar: 'posicionamiento', score: 79 },
    { id: 5, titulo: 'Liderazgo en agencias: el problema no es el cliente',  pilar: 'agencia',         score: 75 },
    { id: 6, titulo: 'GPT-4o en producción: lecciones de 6 meses de uso',   pilar: 'ia',              score: 71 },
  ],

  calendario: {
    events: [
      { id: 1,  titulo: 'IA y marketing: post LinkedIn',              red: 'linkedin',   estado: 'aprobado',             fecha_programada: new Date(now).toISOString(),                hora: '09:00' },
      { id: 2,  titulo: 'Story: pregunta abierta a la comunidad',     red: 'instagram',  estado: 'aprobado',             fecha_programada: new Date(now).toISOString(),                hora: '12:00' },
      { id: 3,  titulo: 'Reel: historia de Bimbo en 80 años',         red: 'instagram',  estado: 'pendiente_aprobacion', fecha_programada: new Date(now + 86400000).toISOString(),     hora: '18:00' },
      { id: 4,  titulo: 'Thread: datos vs opiniones en marketing',    red: 'x',          estado: 'pendiente_aprobacion', fecha_programada: new Date(now + 86400000).toISOString(),     hora: '11:00' },
      { id: 5,  titulo: 'Post: posicionamiento de marca largo plazo', red: 'linkedin',   estado: 'aprobado',             fecha_programada: new Date(now + 86400000 * 2).toISOString(), hora: '09:00' },
      { id: 6,  titulo: 'TikTok: errores que destruyen agencias',     red: 'tiktok',     estado: 'borrador',             fecha_programada: new Date(now + 86400000 * 2).toISOString(), hora: '20:00' },
      { id: 7,  titulo: 'Carousel: 5 métricas que sí importan',      red: 'instagram',  estado: 'aprobado',             fecha_programada: new Date(now + 86400000 * 3).toISOString(), hora: '13:00' },
      { id: 8,  titulo: 'Tweet: academia vs mercado real',            red: 'x',          estado: 'aprobado',             fecha_programada: new Date(now + 86400000 * 3).toISOString(), hora: '17:00' },
      { id: 9,  titulo: 'Post: liderazgo en agencias',                red: 'linkedin',   estado: 'pendiente_aprobacion', fecha_programada: new Date(now + 86400000 * 4).toISOString(), hora: '09:00' },
      { id: 10, titulo: 'TikTok: ¿Qué hace la IA mejor que tú?',     red: 'tiktok',     estado: 'aprobado',             fecha_programada: new Date(now + 86400000 * 4).toISOString(), hora: '19:00' },
      { id: 11, titulo: 'Newsletter Q1 2026 — Tendencias',            red: 'newsletter', estado: 'aprobado',             fecha_programada: new Date(now + 86400000 * 5).toISOString(), hora: '07:00' },
      { id: 12, titulo: 'Artículo SEO: IA en marketing MX',          red: 'articulo',   estado: 'borrador',             fecha_programada: new Date(now + 86400000 * 6).toISOString(), hora: '08:00' },
    ],
  },

  actividad: {
    logs: [
      { id: 10, level: 'INFO',    agente: 'frigg',     mensaje: 'Calendario programado en Publer: 12 publicaciones esta semana.',        created_at: t(3)   },
      { id: 9,  level: 'INFO',    agente: 'aisir',     mensaje: 'Instrucción recibida vía Telegram: /generar "marketing con IA PyMEs"',   created_at: t(8)   },
      { id: 8,  level: 'INFO',    agente: 'loki',      mensaje: 'Contenido adaptado para 4 redes: LinkedIn, Instagram, X, TikTok.',      created_at: t(18)  },
      { id: 7,  level: 'INFO',    agente: 'bragi',     mensaje: 'Artículo generado: "IA y el futuro del marketing MX" — 2,340 palabras.', created_at: t(35)  },
      { id: 6,  level: 'INFO',    agente: 'floki', mensaje: 'Brief SEO completado. Score estimado: 94/100.',                         created_at: t(50)  },
      { id: 5,  level: 'WARNING', agente: 'odin',      mensaje: 'Score 68/100 en post de @marketinglider — por debajo del umbral.',      created_at: t(65)  },
      { id: 4,  level: 'INFO',    agente: 'huginn',    mensaje: 'Brief semanal generado: 8 temas con score ≥70.',                        created_at: t(90)  },
      { id: 3,  level: 'INFO',    agente: 'mimir',     mensaje: 'Consolidación dominical completada. 3 nuevas reglas extraídas.',        created_at: t(180) },
      { id: 2,  level: 'ERROR',   agente: 'kvasir',    mensaje: 'Rate limit en Instagram API. Reintentando en 15 minutos.',              created_at: t(240) },
      { id: 1,  level: 'INFO',    agente: 'idunn',     mensaje: 'Prompt DALL-E generado para carousel de 5 slides.',                     created_at: t(360) },
    ],
  },

  cerebro: {
    stats: { total_reglas: 47, reglas_aprendidas: 23, eventos_semana: 18, consolidaciones: 8 },
    reglas: [
      { id: 1, categoria: 'voz',         contenido: 'Empezar con dato o contexto — nunca con "hola" ni "hoy quiero hablarles".', peso: 0.95 },
      { id: 2, categoria: 'vocabulario', contenido: 'Evitar: potenciar, sinergia, disruptivo, innovador, gurú, omnicanal.',       peso: 0.98 },
      { id: 3, categoria: 'estructura',  contenido: 'Posts LinkedIn: 150–220 palabras. Terminar con pregunta abierta.',           peso: 0.92 },
      { id: 4, categoria: 'postura',     contenido: 'Citar siempre ejemplos mexicanos (Bimbo, Corona, Oxxo, Telcel).',            peso: 0.87 },
      { id: 5, categoria: 'tono',        contenido: 'Directo pero fundamentado. Opinión siempre respaldada por dato real.',       peso: 0.93 },
      { id: 6, categoria: 'brand_voice', contenido: 'Usar "los que nos dedicamos al marketing" para crear comunidad.',            peso: 0.85 },
      { id: 7, categoria: 'pilar',       contenido: 'IA y Tecnología: "La IA amplifica el criterio humano, no lo reemplaza".',    peso: 0.91 },
      { id: 8, categoria: 'formato',     contenido: 'Usar → y ↳ para listas. Sin bullets •. Sin signos de exclamación.',         peso: 0.88 },
    ],
    vocabulario: [
      { id: 1,  palabra: 'potenciar',             tipo: 'prohibida' },
      { id: 2,  palabra: 'sinergia',              tipo: 'prohibida' },
      { id: 3,  palabra: 'disruptivo',            tipo: 'prohibida' },
      { id: 4,  palabra: 'innovador',             tipo: 'prohibida' },
      { id: 5,  palabra: 'omnicanal',             tipo: 'prohibida' },
      { id: 6,  palabra: 'monetizar el engagement', tipo: 'prohibida' },
      { id: 7,  palabra: 'gurú',                  tipo: 'prohibida' },
      { id: 8,  palabra: 'criterio',              tipo: 'preferida' },
      { id: 9,  palabra: 'en la práctica',        tipo: 'preferida' },
      { id: 10, palabra: 'desde la agencia',      tipo: 'preferida' },
      { id: 11, palabra: 'en el mercado mexicano', tipo: 'preferida' },
      { id: 12, palabra: 'con datos',             tipo: 'preferida' },
      { id: 13, palabra: 'la realidad es que',    tipo: 'preferida' },
    ],
  },

  metricas: {
    stats: { generado: 284, aprobado: 231, rechazado: 53, tasa_aprobacion: 81.3 },
    por_tipo: [
      { name: 'linkedin',   value: 89 },
      { name: 'instagram',  value: 67 },
      { name: 'x',          value: 78 },
      { name: 'tiktok',     value: 34 },
      { name: 'newsletter', value: 16 },
    ],
    semanal: [
      { semana: 'S1 Feb', generado: 42, aprobado: 36 },
      { semana: 'S2 Feb', generado: 58, aprobado: 48 },
      { semana: 'S3 Feb', generado: 71, aprobado: 59 },
      { semana: 'S1 Mar', generado: 113, aprobado: 88 },
    ],
  },

  contenido: {
    items: [
      { id: 1, titulo: 'IA y el futuro del marketing en México',        tipo: 'linkedin',  estado: 'aprobado',             created_at: t(120), contenido_preview: 'En 20 años de agencia, nunca había visto una tecnología moverse tan rápido con tan poco criterio aplicado...' },
      { id: 2, titulo: 'Cómo Bimbo construyó su marca',                 tipo: 'instagram', estado: 'publicado',            created_at: t(240), contenido_preview: 'No es el logo. No es el osito. Es la consistencia de 80 años diciendo lo mismo de distintas formas.' },
      { id: 3, titulo: 'Thread: datos vs opiniones en marketing',        tipo: 'x',         estado: 'pendiente_aprobacion', created_at: t(360), contenido_preview: 'Decisiones sin datos son opiniones disfrazadas de estrategia. Hilo 🧵' },
      { id: 4, titulo: 'El error que destruye agencias',                 tipo: 'tiktok',    estado: 'aprobado',             created_at: t(480), contenido_preview: 'Las agencias no mueren por falta de clientes. Mueren por problemas internos...' },
      { id: 5, titulo: 'Post: liderazgo en agencias',                   tipo: 'linkedin',  estado: 'borrador',             created_at: t(720), contenido_preview: 'El CEO que dice "yo también puedo hacer ese trabajo del diseñador" ya perdió.' },
      { id: 6, titulo: 'Reel: academia vs mercado real',                 tipo: 'instagram', estado: 'pendiente_aprobacion', created_at: t(840), contenido_preview: 'Lo que enseñamos en las universidades vs lo que pide el mercado.' },
    ],
  },
}

export function mockFor(path, opts = {}) {
  const base = path.split('?')[0]
  const method = opts.method ?? 'GET'

  if (base === '/agentes')                return MOCK.agentes
  if (base.match(/^\/agentes\/.+\/logs/)) return MOCK.actividad
  if (base === '/pipeline')               return MOCK.pipeline
  if (base === '/temas')                  return MOCK.temas
  if (base === '/calendario')             return MOCK.calendario
  if (base === '/actividad')              return MOCK.actividad
  if (base === '/cerebro')                return MOCK.cerebro
  if (base === '/metricas')               return MOCK.metricas
  if (base === '/inspiracion/brief')      return { brief: 'Brief de inspiración no disponible.' }
  if (base === '/contenido')              return MOCK.contenido

  // Inspiración — GET
  if (base === '/inspiracion/cuentas' && method === 'GET') {
    return { cuentas: [..._cuentas] }
  }

  // Inspiración — POST (agregar cuenta)
  if (base === '/inspiracion/cuentas' && method === 'POST') {
    const body = opts.body ? JSON.parse(opts.body) : {}
    const nueva = { id: _nextId++, activa: true, ...body }
    _cuentas.push(nueva)
    saveCuentas(_cuentas)
    return nueva
  }

  // Inspiración — toggle
  if (base.match(/^\/inspiracion\/cuentas\/\d+\/toggle/)) {
    const id = parseInt(base.split('/')[3])
    const cuenta = _cuentas.find((c) => c.id === id)
    if (cuenta) cuenta.activa = !cuenta.activa
    saveCuentas(_cuentas)
    return { ok: true }
  }

  // Inspiración — DELETE
  if (base.match(/^\/inspiracion\/cuentas\/\d+$/) && method === 'DELETE') {
    const id = parseInt(base.split('/')[3])
    _cuentas = _cuentas.filter((c) => c.id !== id)
    saveCuentas(_cuentas)
    return { ok: true }
  }

  return null
}

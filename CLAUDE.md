# PROYECTO: AiSir Frontend — app-aisir
# Archivo de contexto para Claude Code
---

## QUIÉN SOY

Soy Hans Hatch. CEO de hatch co. (agencia de marketing digital, 20+ años).
Este repo es el frontend web del ecosistema de agentes AiSir —
el dashboard de control que me permite monitorear y gestionar todos los agentes AI.

---

## QUÉ ES ESTE REPO

Aplicación React que sirve como interfaz de control del sistema AiSir.
Reemplaza el dashboard PHP anterior.
Consume la API REST del backend en `github.com/hanshatch/aisir` (FastAPI en el VPS).

---

## STACK TECNOLÓGICO

```
Framework:   React 18 + Vite 5
Estilos:     Tailwind CSS 3
Routing:     React Router v6
Data:        TanStack Query v5 (server state)
Charts:      Recharts
Icons:       Lucide React
Fonts:       Exo 2 (display/UI) · Share Tech Mono (código/datos)
Deploy:      Hostinger (archivos estáticos del dist/)
API Backend: FastAPI en VPS Hostinger (hatch-agents repo)
```

---

## ESTRUCTURA DE ARCHIVOS

```
app-aisir/
├── CLAUDE.md                  # Este archivo
├── index.html
├── vite.config.js             # proxy /api → localhost:8000 en dev
├── tailwind.config.js
├── src/
│   ├── main.jsx               # Entry point
│   ├── App.jsx                # Router + QueryClient + auth guard
│   ├── index.css              # Tailwind base + fuentes Google
│   │
│   ├── api/
│   │   └── client.js          # Todas las llamadas a /api/*
│   │
│   ├── lib/
│   │   └── utils.js           # cn(), ago(), AGENT_COLORS, RED_COLORS
│   │
│   ├── components/
│   │   ├── AppShell.jsx       # Layout: sidebar fijo + <Outlet />
│   │   └── ui/
│   │       ├── Badge.jsx
│   │       ├── Button.jsx
│   │       ├── Card.jsx
│   │       ├── StatCard.jsx
│   │       └── EmptyState.jsx
│   │
│   └── pages/
│       ├── Login.jsx          # Autenticación con contraseña
│       ├── Agentes.jsx        # Grid de 10 agentes + panel de detalle
│       ├── Pipeline.jsx       # Contenido pendiente + distribución por red
│       ├── Calendario.jsx     # Calendario editorial semanal
│       ├── Flujos.jsx         # Documentación de flujos (A/B/C/E/W/I)
│       ├── Comandos.jsx       # Referencia de comandos Telegram
│       ├── Cerebro.jsx        # Reglas y memoria adaptativa
│       ├── Metricas.jsx       # Métricas de engagement y producción
│       ├── Inspiracion.jsx    # Gestión de cuentas referente (Kvasir)
│       ├── RedSocial.jsx      # Posts por red social
│       └── Actividad.jsx      # Logs del sistema en tiempo real
```

---

## DESIGN SYSTEM — NORSE COMMAND CENTER

Concepto: sala de guerra nórdica. Dark terminal con acento verde eléctrico.
No corporativo, no SaaS — inteligencia operacional.

### Paleta
```
Background:  #080c08  (negro con tinte verde)
Surface:     #0d110d
Surface2:    #111611
Border:      #1e2d1a
Border2:     #2a3d24
Ink (texto): #d4e6c8
Muted:       #5c7a50
Acento:      #7ec832  (verde eléctrico Hans Hatch)
Sidebar bg:  #060908
```

### Colores por agente
```js
aisir:     '#4f9eff'   // Azul
huginn:    '#a78bfa'   // Violeta
bragi:     '#34d399'   // Verde esmeralda
loki:      '#f59e0b'   // Ámbar
ratatoskr: '#10b981'   // Verde
kvasir:    '#e879f9'   // Fucsia
idunn:     '#fb923c'   // Naranja
odin:      '#f43f5e'   // Rojo
frigg:     '#06b6d4'   // Cyan
mimir:     '#8b5cf6'   // Púrpura
```

### Tipografía
- Display/UI: **Exo 2** (bold, angular, tech)
- Código/datos: **Share Tech Mono** (terminal feel)

### Principios de diseño
- Siempre dark — ningún fondo blanco
- Glow en hover y elementos activos
- Radios pequeños (3-6px) — más angular, menos SaaS
- Scrollbar delgada, verde oscuro

---

## AUTENTICACIÓN

Simple: contraseña en localStorage.
- Login → `POST /api/auth/login` → guarda `aisir_auth=1` en localStorage
- Rutas protegidas: si no hay `aisir_auth`, redirige a `/`
- Logout: borra localStorage + redirige a `/`
- La contraseña real vive en el backend (FastAPI)

---

## CONEXIÓN CON EL BACKEND

En desarrollo: Vite hace proxy de `/api` → `http://localhost:8000`
En producción: la variable `VITE_API_URL` apunta al VPS

```js
// vite.config.js
server: { proxy: { '/api': 'http://localhost:8000' } }
```

Todos los endpoints están centralizados en `src/api/client.js`.
Nunca hacer fetch directo en los componentes — siempre usar `api.*`.

---

## CONVENCIONES

- Componentes: PascalCase, un archivo por página
- Hooks: `useQuery` de TanStack Query para todo dato del servidor
- Estilos: Tailwind utility classes — no CSS inline salvo glow/shadow con color dinámico
- No agregar librerías nuevas sin necesidad real
- Mantener `api/client.js` como fuente única de endpoints
- Commits en español: "feat: página de métricas", "fix: sidebar active state"

---

## COMANDOS ÚTILES

```bash
npm run dev      # Dev server en localhost:5173
npm run build    # Build producción → dist/
npm run preview  # Preview del build
```

## DEPLOY

```bash
npm run build
# Subir dist/ a Hostinger via FTP o GitHub Actions
```

---

## RELACIÓN CON EL BACKEND

El backend (`hatch-agents`) expone endpoints en `/api/*`.
Este repo NO tiene lógica de negocio — solo consume y presenta datos.
Si falta un endpoint, se agrega en `hatch-agents/app/api/`.

---
*Última actualización: Marzo 2026 | hatch co. | hanshatch.com*

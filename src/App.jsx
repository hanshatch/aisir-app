import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import AppShell from './components/AppShell'
import Login from './pages/Login'
import Agentes from './pages/Agentes'
import Pipeline from './pages/Pipeline'
import Calendario from './pages/Calendario'
import Flujos from './pages/Flujos'
import Metricas from './pages/Metricas'
import Cerebro from './pages/Cerebro'
import Actividad from './pages/Actividad'
import Comandos from './pages/Comandos'
import Inspiracion from './pages/Inspiracion'
import Columnas from './pages/Columnas'
import Costos from './pages/Costos'
import Planeacion from './pages/Planeacion'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    },
  },
})

function TitleSync() {
  const location = useLocation()
  useEffect(() => { document.title = 'AISIR | Intelligence Agents' }, [location])
  return null
}

function isAuth() {
  return !!localStorage.getItem('aisir_auth')
}

function ProtectedRoute({ children }) {
  if (!isAuth()) return <Navigate to="/" replace />
  return children
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <TitleSync />
        <Routes>
          <Route path="/" element={isAuth() ? <Navigate to="/agentes" replace /> : <Login />} />
          <Route
            element={
              <ProtectedRoute>
                <AppShell />
              </ProtectedRoute>
            }
          >
            <Route path="/agentes"    element={<Agentes />} />
            <Route path="/pipeline"   element={<Pipeline />} />
            <Route path="/calendario" element={<Calendario />} />
            <Route path="/flujos"     element={<Flujos />} />
            <Route path="/metricas"   element={<Metricas />} />
            <Route path="/cerebro"    element={<Cerebro />} />
            <Route path="/actividad"  element={<Actividad />} />
            <Route path="/comandos"   element={<Comandos />} />
            <Route path="/inspiracion" element={<Inspiracion />} />
            <Route path="/columnas"    element={<Columnas />} />
            <Route path="/costos"     element={<Costos />} />
            <Route path="/planeacion" element={<Planeacion />} />
          </Route>
          <Route path="*" element={<Navigate to={isAuth() ? '/agentes' : '/'} replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

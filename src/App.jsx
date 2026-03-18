import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import AppShell from './components/AppShell'
import Login from './pages/Login'
import Agentes from './pages/Agentes'
import Pipeline from './pages/Pipeline'
import Calendario from './pages/Calendario'
import Flujos from './pages/Flujos'
import RedSocial from './pages/RedSocial'
import Metricas from './pages/Metricas'
import Cerebro from './pages/Cerebro'
import Actividad from './pages/Actividad'
import Comandos from './pages/Comandos'
import Inspiracion from './pages/Inspiracion'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    },
  },
})

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
            <Route path="/red"        element={<RedSocial />} />
            <Route path="/metricas"   element={<Metricas />} />
            <Route path="/cerebro"    element={<Cerebro />} />
            <Route path="/actividad"  element={<Actividad />} />
            <Route path="/comandos"   element={<Comandos />} />
            <Route path="/inspiracion" element={<Inspiracion />} />
          </Route>
          <Route path="*" element={<Navigate to={isAuth() ? '/agentes' : '/'} replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

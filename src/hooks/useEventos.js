import { useEffect, useRef } from 'react'

/**
 * Escucha eventos en tiempo real del backend via SSE.
 *
 * Uso:
 *   useEventos((evento) => {
 *     if (evento.tipo === 'contenido_aprobado') refetch()
 *   })
 *
 * Tipos de eventos que emite el backend:
 *   - contenido_aprobado   { id, tipo }
 *   - contenido_rechazado  { id, tipo }
 *   - contenido_regenerado { id, tipo }
 *   - conectado            (confirma conexión inicial)
 */
export function useEventos(onEvento) {
  const cbRef = useRef(onEvento)
  cbRef.current = onEvento

  useEffect(() => {
    let es
    let retryTimer

    function conectar() {
      es = new EventSource('/api/eventos')

      es.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data)
          cbRef.current?.(data)
        } catch {
          // ping o mensaje no-JSON — ignorar
        }
      }

      es.onerror = () => {
        es.close()
        // Reconectar en 5 segundos si se cae la conexión
        retryTimer = setTimeout(conectar, 5000)
      }
    }

    conectar()

    return () => {
      clearTimeout(retryTimer)
      es?.close()
    }
  }, [])
}

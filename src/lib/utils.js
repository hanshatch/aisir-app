import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function ago(dt) {
  if (!dt) return 'nunca'
  const diff = Math.floor((Date.now() - new Date(dt)) / 1000)
  if (diff < 60) return `hace ${diff}s`
  if (diff < 3600) return `hace ${Math.floor(diff/60)}min`
  if (diff < 86400) return `hace ${Math.floor(diff/3600)}h`
  return `hace ${Math.floor(diff/86400)}d`
}

export const AGENT_COLORS = {
  aisir:     '#86a43b',
  huginn:    '#86a43b',
  bragi:     '#86a43b',
  loki:      '#86a43b',
  floki: '#86a43b',
  kvasir:    '#86a43b',
  idunn:     '#86a43b',
  odin:      '#878787',
  frigg:     '#86a43b',
  mimir:     '#86a43b',
}

export const RED_COLORS = {
  linkedin:  '#4d9eff',
  instagram: '#86a43b',
  x:         '#a1a1aa',
  tiktok:    '#86a43b',
  facebook:  '#60a5fa',
  newsletter:'#86a43b',
  articulo:  '#86a43b',
  whatsapp:  '#4ade80',
  carousel:  '#86a43b',
}

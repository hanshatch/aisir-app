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
  aisir:     '#4f9eff',
  huginn:    '#a78bfa',
  bragi:     '#34d399',
  loki:      '#f59e0b',
  ratatoskr: '#10b981',
  kvasir:    '#e879f9',
  idunn:     '#fb923c',
  odin:      '#f43f5e',
  frigg:     '#06b6d4',
  mimir:     '#8b5cf6',
}

export const RED_COLORS = {
  linkedin:  '#4d9eff',
  instagram: '#e879f9',
  x:         '#a1a1aa',
  tiktok:    '#06b6d4',
  facebook:  '#60a5fa',
  newsletter:'#f59e0b',
  articulo:  '#7ec832',
  whatsapp:  '#4ade80',
  carousel:  '#fb923c',
}

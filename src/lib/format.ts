import type { Match } from '../engine/types'

export const fmtOdds = (o: number) => o.toFixed(2)
export const fmtUSDT = (n: number) => n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

export function clockLabel(m: Match) {
  if (m.status === 'ft') return 'FT'
  if (m.status !== 'live') return ''
  const min = Math.floor(m.clockSec / 60)
  if (min >= 90) return `90+${min - 89}'`
  if (min === 45 && m.clockSec % 60 < 1) return 'HT'
  return `${min + 1}'`
}

export function clockFull(m: Match) {
  const mm = Math.floor(m.clockSec / 60)
  const ss = m.clockSec % 60
  if (mm >= 90) return `90:00 +${mm - 90}:${String(ss).padStart(2, '0')}`
  return `${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}`
}

export function kickoffLabel(ts: number, now: number) {
  const diff = ts - now
  const d = new Date(ts)
  const time = d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
  if (diff <= 0) return 'Kicking off'
  if (diff < 60 * 60_000) {
    const mins = Math.ceil(diff / 60_000)
    return `in ${mins} min`
  }
  const today = new Date(now)
  const isToday = d.toDateString() === today.toDateString()
  const tomorrow = new Date(now + 86400_000)
  if (isToday) return `Today ${time}`
  if (d.toDateString() === tomorrow.toDateString()) return `Tomorrow ${time}`
  return d.toLocaleDateString('en-GB', { weekday: 'short' }) + ' ' + time
}

export function timeOfDay(ts: number) {
  return new Date(ts).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

export function dateTime(ts: number) {
  return new Date(ts).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}

export const cx = (...a: (string | false | null | undefined)[]) => a.filter(Boolean).join(' ')

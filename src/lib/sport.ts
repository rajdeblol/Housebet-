// Per-sport labels: clock, score text and period progress.
import type { Match } from '../engine/types'
import { clockFull, clockLabel } from './format'

const pad = (n: number) => String(n).padStart(2, '0')
const mmss = (s: number) => `${pad(Math.floor(s / 60))}:${pad(s % 60)}`
const ord = (n: number) => `${n}${n === 1 ? 'st' : n === 2 ? 'nd' : n === 3 ? 'rd' : 'th'}`

function periodClock(m: Match, len: number, prefix: string) {
  const p = Math.min(Math.floor(m.clockSec / len), Math.round(m.totalSec / len) - 1)
  const left = Math.max(0, (p + 1) * len - m.clockSec)
  return { p: p + 1, text: `${prefix}${p + 1} ${mmss(left)}` }
}

/** Short live label for rows (e.g. 63', Q3 07:42, Top 6th, 14.3 ov, R2 3:14, Set 2). */
export function statusShort(m: Match): string {
  if (m.status === 'ft') return m.sport === 'mma' && m.mma?.finish ? `${m.mma.finish.method}` : 'Final'
  if (m.status !== 'live') return ''
  switch (m.sport) {
    case 'football': return clockLabel(m)
    case 'basketball': return periodClock(m, 720, 'Q').text
    case 'americanfootball': return periodClock(m, 900, 'Q').text
    case 'icehockey': return periodClock(m, 1200, 'P').text
    case 'baseball': {
      const inn = Math.floor(m.clockSec / 6) + 1
      return `${m.clockSec % 6 < 3 ? 'Top' : 'Bot'} ${ord(Math.min(9, inn))}`
    }
    case 'cricket': {
      const c = m.cricket!
      const b = c.balls[c.inn]
      return `${Math.floor(b / 6)}.${b % 6} ov`
    }
    case 'mma': {
      const r = Math.min(3, Math.floor(m.clockSec / 300) + 1)
      return `R${r} ${mmss(m.clockSec - (r - 1) * 300)}`
    }
    case 'tennis': return `Set ${(m.tennis?.done.length ?? 0) + 1}`
  }
}

/** Longer label for the match page header. */
export function statusLong(m: Match): string {
  if (m.sport === 'football' && m.status === 'live') return clockFull(m)
  if (m.sport === 'baseball' && m.status === 'live') return `${statusShort(m)} · ${m.clockSec % 3} out`
  if (m.sport === 'mma' && m.status === 'live') return `Round ${Math.min(3, Math.floor(m.clockSec / 300) + 1)} of 3 · ${statusShort(m).split(' ')[1]}`
  return statusShort(m)
}

/** Score as two strings, or null when the sport has no running score (MMA). */
export function scoreText(m: Match): [string, string] | null {
  if (m.sport === 'mma') return null
  if (m.sport === 'cricket') {
    const c = m.cricket!
    const s = (i: 0 | 1) => (i === 1 && c.inn === 0 ? '–' : `${m.score[i]}/${c.wk[i]}`)
    return [s(0), s(1)]
  }
  return [String(m.score[0]), String(m.score[1])]
}

/** A one-line context string under the score. */
export function detailLine(m: Match): string | null {
  if (m.status === 'upcoming') return null
  if (m.sport === 'cricket') {
    const c = m.cricket!
    if (c.inn === 0) return `1st innings · run rate ${(m.score[0] / Math.max(1, c.balls[0] / 6)).toFixed(2)}`
    const need = m.score[0] + 1 - m.score[1]
    const left = 120 - c.balls[1]
    if (m.status === 'ft') return m.score[1] > m.score[0] ? 'Chase complete' : `Won by ${m.score[0] - m.score[1]} runs`
    return `Target ${m.score[0] + 1} · need ${Math.max(0, need)} from ${left} balls`
  }
  if (m.sport === 'tennis') {
    const t = m.tennis!
    const sets = t.done.map((x) => `${x[0]}–${x[1]}`)
    if (m.status === 'live') sets.push(`${t.games[0]}–${t.games[1]}`)
    return `Sets won · games ${sets.join('  ')}`
  }
  if (m.sport === 'mma') {
    const f = m.mma?.finish
    return f ? `Won by ${f.method} in round ${f.round}` : null
  }
  return null
}

/** Progress (0–1) and period ticks for the strip under the scoreboard. */
export function periodBar(m: Match): { progress: number; ticks: { at: number; label: string }[] } {
  const done = m.status === 'ft'
  const prog = (x: number) => (done ? 1 : Math.min(1, x))
  switch (m.sport) {
    case 'basketball': case 'americanfootball':
      return { progress: prog(m.clockSec / m.totalSec), ticks: ['Q1', 'Q2', 'Q3', 'Q4'].map((l, i) => ({ at: i / 4, label: l })) }
    case 'icehockey':
      return { progress: prog(m.clockSec / m.totalSec), ticks: ['P1', 'P2', 'P3'].map((l, i) => ({ at: i / 3, label: l })) }
    case 'baseball':
      return { progress: prog(m.clockSec / 54), ticks: Array.from({ length: 9 }, (_, i) => ({ at: i / 9, label: String(i + 1) })) }
    case 'cricket': {
      const c = m.cricket!
      return { progress: prog((c.balls[0] + c.balls[1]) / 240), ticks: [{ at: 0, label: '1st inns' }, { at: 0.5, label: '2nd inns' }] }
    }
    case 'mma':
      return { progress: prog(m.clockSec / 900), ticks: ['R1', 'R2', 'R3'].map((l, i) => ({ at: i / 3, label: l })) }
    case 'tennis': {
      const t = m.tennis!
      const setsPlayed = t.done.length + (done ? 0 : (t.games[0] + t.games[1]) / 12)
      return { progress: prog(setsPlayed / 3), ticks: ['Set 1', 'Set 2', 'Set 3'].map((l, i) => ({ at: i / 3, label: l })) }
    }
    default:
      return { progress: prog(m.clockSec / 5400), ticks: [] }
  }
}

/** The market shown on list rows. */
export const mainKey = (m: Match) => (m.sport === 'football' ? 'mr' : 'ml')

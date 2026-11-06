import type { Match } from './types'
import { ladder } from './odds'

/** A clearly labeled, repeatable demo trace with visible swings, ending at the live price. */
export function demoPriceHistory(odds: number, identity: string, match: Pick<Match, 'kickoff' | 'status' | 'clockSec'>, now: number) {
  const count = 48
  const seed = [...identity].reduce((value, char) => (value * 31 + char.charCodeAt(0)) >>> 0, 2166136261)
  const phase = (seed % 10000) / 10000 * Math.PI * 2
  const waveAt = (progress: number) =>
    Math.sin(progress * Math.PI * 2 * 4 + phase) * 0.14
    + Math.sin(progress * Math.PI * 2 * 9 + phase * 1.7) * 0.075
    + Math.sin(progress * Math.PI * 2 * 16 + phase * 0.6) * 0.045
  const finalWave = waveAt(1)
  const history = Array.from({ length: count }, (_, index) => {
    if (index === count - 1) return odds
    const progress = index / (count - 1)
    const swing = waveAt(progress) - finalWave * progress
    return ladder(odds * (1 + swing))
  })
  const historyAt = Array.from({ length: count }, (_, index) => {
    const progress = index / (count - 1)
    return match.status === 'live'
      ? match.kickoff + match.clockSec * 1000 * progress
      : now - (count - 1 - index) * 60_000
  })
  return { history, historyAt }
}

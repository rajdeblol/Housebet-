// Coherent in-play pricing from a simple Poisson model.
// Every market derives from the same expected-goals picture, so a goal moves them all sensibly.
import { teams } from '../data/teams'
import type { FootballKey, GroupId, Market, Match } from './types'
import { ladder, toOdds } from './odds'
import { buildOtherMarkets, priceOther, settleOther } from './multisport'

export { ladder }

const MAXG = 10
const CORNERS_PER_90 = 10.4
const CARDS_PER_90 = 4.2
const SCORER_SHARE = [0.32, 0.22, 0.15]

function poissonDist(lambda: number, max = MAXG) {
  const out: number[] = []
  let p = Math.exp(-lambda)
  for (let k = 0; k <= max; k++) {
    out.push(p)
    p = (p * lambda) / (k + 1)
  }
  return out
}

/** P(X > line) for X = current + Poisson(lambda) */
function pOver(current: number, lambda: number, line: number) {
  const need = Math.floor(line - current) + 1 // extra needed
  if (need <= 0) return 1
  const d = poissonDist(lambda, 40)
  let below = 0
  for (let k = 0; k < need; k++) below += d[k]
  return Math.max(0, 1 - below)
}

export interface MarketDef { key: FootballKey; group: GroupId; name: string; labels: (m: Match) => string[] }

const H = (m: Match) => teams[m.home].name
const A = (m: Match) => teams[m.away].name

export const marketDefs: MarketDef[] = [
  { key: 'mr', group: 'popular', name: 'Match result', labels: (m) => [H(m), 'Draw', A(m)] },
  { key: 'ou25', group: 'popular', name: 'Total goals 2.5', labels: () => ['Over 2.5', 'Under 2.5'] },
  { key: 'btts', group: 'popular', name: 'Both teams to score', labels: () => ['Yes', 'No'] },
  { key: 'ou15', group: 'goals', name: 'Total goals 1.5', labels: () => ['Over 1.5', 'Under 1.5'] },
  { key: 'ou35', group: 'goals', name: 'Total goals 3.5', labels: () => ['Over 3.5', 'Under 3.5'] },
  { key: 'ht', group: 'halves', name: '1st half result', labels: (m) => [H(m), 'Draw', A(m)] },
  { key: 'h1ou', group: 'halves', name: '1st half total goals 1.5', labels: () => ['Over 1.5', 'Under 1.5'] },
  { key: 'hcpA', group: 'handicaps', name: 'Handicap −1.5 / +1.5', labels: (m) => [`${H(m)} −1.5`, `${A(m)} +1.5`] },
  { key: 'hcpB', group: 'handicaps', name: 'Handicap +1.5 / −1.5', labels: (m) => [`${H(m)} +1.5`, `${A(m)} −1.5`] },
  { key: 'ags', group: 'scorers', name: 'Anytime goalscorer', labels: (m) => [...teams[m.home].players, ...teams[m.away].players] },
  { key: 'cor95', group: 'corners', name: 'Total corners 9.5', labels: () => ['Over 9.5', 'Under 9.5'] },
  { key: 'cor105', group: 'corners', name: 'Total corners 10.5', labels: () => ['Over 10.5', 'Under 10.5'] },
  { key: 'crd35', group: 'corners', name: 'Total cards 3.5', labels: () => ['Over 3.5', 'Under 3.5'] },
  { key: 'crd45', group: 'corners', name: 'Total cards 4.5', labels: () => ['Over 4.5', 'Under 4.5'] },
]

/** Markets a goal affects (they suspend during the goal scene). */
export const GOAL_GROUPS: GroupId[] = ['popular', 'goals', 'handicaps', 'scorers', 'lines', 'props']

export const cardsOf = (m: Match) => m.events.filter((e) => e.type !== 'goal').length

/** Returns probabilities for each selection of a market, or null when the market is closed. */
export function price(m: Match, key: FootballKey): { odds: number[]; closed?: string; selClosed?: boolean[] } {
  const elapsed = m.status === 'live' ? m.clockSec : m.status === 'ft' ? 90 * 60 : 0
  const rem = Math.max(0, 90 * 60 - elapsed) / (90 * 60)
  const lh = m.xg[0] * Math.exp(m.drift) * rem
  const la = m.xg[1] * Math.exp(-m.drift) * rem
  const [sh, sa] = m.score
  const dh = poissonDist(lh)
  const da = poissonDist(la)

  const joint = (fn: (h: number, a: number) => boolean) => {
    let p = 0
    for (let i = 0; i <= MAXG; i++) for (let j = 0; j <= MAXG; j++) if (fn(sh + i, sa + j)) p += dh[i] * da[j]
    return p
  }

  switch (key) {
    case 'mr': {
      const ps = [joint((h, a) => h > a), joint((h, a) => h === a), joint((h, a) => h < a)]
      return { odds: ps.map((p) => toOdds(p, 1.06)) }
    }
    case 'ou15': case 'ou25': case 'ou35': {
      const line = key === 'ou15' ? 1.5 : key === 'ou25' ? 2.5 : 3.5
      if (sh + sa > line) return { odds: [1.01, 51], closed: `Settled: ${line} goals already passed` }
      const p = pOver(sh + sa, lh + la, line)
      return { odds: [toOdds(p, 1.05), toOdds(1 - p, 1.05)] }
    }
    case 'btts': {
      if (sh > 0 && sa > 0) return { odds: [1.01, 51], closed: 'Settled: both teams have scored' }
      const p = joint((h, a) => h > 0 && a > 0)
      return { odds: [toOdds(p, 1.05), toOdds(1 - p, 1.05)] }
    }
    case 'ht': {
      if (elapsed >= 45 * 60) return { odds: [0, 0, 0], closed: 'Closed at half-time' }
      const r1 = (45 * 60 - elapsed) / (90 * 60)
      const h1 = poissonDist(m.xg[0] * Math.exp(m.drift) * r1)
      const a1 = poissonDist(m.xg[1] * Math.exp(-m.drift) * r1)
      const ps = [0, 0, 0]
      for (let i = 0; i <= MAXG; i++) for (let j = 0; j <= MAXG; j++) {
        const h = sh + i, a = sa + j, p = h1[i] * a1[j]
        ps[h > a ? 0 : h === a ? 1 : 2] += p
      }
      return { odds: ps.map((p) => toOdds(p, 1.07)) }
    }
    case 'h1ou': {
      if (elapsed >= 45 * 60) return { odds: [1.01, 51], closed: 'Closed at half-time' }
      const cur = sh + sa
      if (cur > 1.5) return { odds: [1.01, 51], closed: 'Settled: 1.5 goals passed in the 1st half' }
      const r1 = (45 * 60 - elapsed) / (90 * 60)
      const p = pOver(cur, (m.xg[0] * Math.exp(m.drift) + m.xg[1] * Math.exp(-m.drift)) * r1, 1.5)
      return { odds: [toOdds(p, 1.06), toOdds(1 - p, 1.06)] }
    }
    case 'hcpA': case 'hcpB': {
      const hcp = key === 'hcpA' ? -1.5 : 1.5
      const p = joint((h, a) => h + hcp > a)
      return { odds: [toOdds(p, 1.05), toOdds(1 - p, 1.05)] }
    }
    case 'ags': {
      const list = [...teams[m.home].players.map((n, i) => ({ n, i, l: lh })), ...teams[m.away].players.map((n, i) => ({ n, i, l: la }))]
      const scored = new Set(m.events.filter((e) => e.type === 'goal').map((e) => e.player))
      const selClosed = list.map((x) => scored.has(x.n))
      return {
        odds: list.map((x) => (scored.has(x.n) ? 1.01 : toOdds(1 - Math.exp(-SCORER_SHARE[x.i] * x.l), 1.22))),
        selClosed,
      }
    }
    case 'cor95': case 'cor105': {
      const line = key === 'cor95' ? 9.5 : 10.5
      const c = m.corners[0] + m.corners[1]
      if (c > line) return { odds: [1.01, 51], closed: `Settled: ${line} corners passed` }
      const p = pOver(c, CORNERS_PER_90 * rem, line)
      return { odds: [toOdds(p, 1.06), toOdds(1 - p, 1.06)] }
    }
    case 'crd35': case 'crd45': {
      const line = key === 'crd35' ? 3.5 : 4.5
      const c = cardsOf(m)
      if (c > line) return { odds: [1.01, 51], closed: `Settled: ${line} cards passed` }
      const p = pOver(c, CARDS_PER_90 * rem, line)
      return { odds: [toOdds(p, 1.06), toOdds(1 - p, 1.06)] }
    }
  }
}

function buildFootballMarkets(m: Match, now: number): Market[] {
  return marketDefs.map((d) => {
    const pr = price(m, d.key)
    const labels = d.labels(m)
    return {
      id: `${m.id}:${d.key}`,
      matchId: m.id,
      key: d.key,
      group: d.group,
      name: d.name,
      suspendedUntil: null,
      closed: !!pr.closed,
      closedReason: pr.closed,
      selections: labels.map((label, i) => {
        // Seed a visibly moving but bounded demo history so the market chart has
        // a useful shape immediately, before simulated live ticks accumulate.
        const o = pr.odds[i]
        const seedText = `${m.id}:${d.key}:${i}`
        const seed = [...seedText].reduce((value, char) => (value * 31 + char.charCodeAt(0)) >>> 0, 2166136261)
        const hist = Array.from({ length: 24 }, (_, index) => {
          const progress = index / 23
          const phase = (seed % 1000) / 1000 * Math.PI * 2
          const envelope = 1 - progress
          const wave = Math.sin(progress * Math.PI * 5 + phase) * 0.045
            + Math.sin(progress * Math.PI * 11 + phase * 1.7) * 0.022
            + Math.sin(progress * Math.PI * 19 + phase * 0.6) * 0.012
          return ladder(o * (1 + wave * envelope))
        })
        const tickTimes = Array.from({ length: 25 }, (_, index) => {
          const progress = index / 24
          if (m.status === 'live') return m.kickoff + m.clockSec * 1000 * progress
          return now - (24 - index) * 60_000
        })
        return {
          id: `${m.id}:${d.key}:${i}`, label, odds: o, prev: null, move: null, movedAt: 0,
          history: [...hist, o], historyAt: tickTimes, closed: !!pr.selClosed?.[i], note: pr.selClosed?.[i] ? 'Scored' : undefined,
        }
      }),
    } satisfies Market
  }).map((mk) => ({ ...mk, selections: mk.selections.map((s) => ({ ...s, movedAt: now - 10000 })) }))
}

/** Settle a selection for a finished match. */
function settles(m: Match, key: FootballKey, idx: number): boolean {
  const [h, a] = m.score
  const ht = m.htScore ?? m.score
  switch (key) {
    case 'mr': return [h > a, h === a, h < a][idx]
    case 'ht': return [ht[0] > ht[1], ht[0] === ht[1], ht[0] < ht[1]][idx]
    case 'h1ou': return idx === 0 ? ht[0] + ht[1] > 1.5 : ht[0] + ht[1] < 1.5
    case 'ou15': return idx === 0 ? h + a > 1.5 : h + a < 1.5
    case 'ou25': return idx === 0 ? h + a > 2.5 : h + a < 2.5
    case 'ou35': return idx === 0 ? h + a > 3.5 : h + a < 3.5
    case 'btts': return idx === 0 ? h > 0 && a > 0 : !(h > 0 && a > 0)
    case 'hcpA': return idx === 0 ? h - 1.5 > a : a + 1.5 > h
    case 'hcpB': return idx === 0 ? h + 1.5 > a : a - 1.5 > h
    case 'ags': {
      const name = [...teams[m.home].players, ...teams[m.away].players][idx]
      return m.events.some((e) => e.type === 'goal' && e.player === name)
    }
    case 'cor95': return idx === 0 ? m.corners[0] + m.corners[1] > 9.5 : m.corners[0] + m.corners[1] < 9.5
    case 'cor105': return idx === 0 ? m.corners[0] + m.corners[1] > 10.5 : m.corners[0] + m.corners[1] < 10.5
    case 'crd35': return idx === 0 ? cardsOf(m) > 3.5 : cardsOf(m) < 3.5
    case 'crd45': return idx === 0 ? cardsOf(m) > 4.5 : cardsOf(m) < 4.5
  }
}

// ---------------------------------------------------------------- sport dispatch

export function buildMarkets(m: Match, now: number): Market[] {
  return m.sport === 'football' ? buildFootballMarkets(m, now) : buildOtherMarkets(m, now)
}

export function priceMarket(m: Match, mk: Market): { odds: number[]; closed?: string; selClosed?: boolean[] } {
  return m.sport === 'football' ? price(m, mk.key as FootballKey) : priceOther(m, mk)
}

export function settleSel(m: Match, mk: Market, idx: number): boolean {
  return m.sport === 'football' ? settles(m, mk.key as FootballKey, idx) : settleOther(m, mk, idx)
}

// Pricing + live simulation for basketball, American football, baseball, ice hockey, cricket, MMA and tennis.
// Team sports use a normal approximation of the final margin/total from remaining expected scoring,
// so a score moves the moneyline, spread and total together.
import { teams } from '../data/teams'
import { ladder, logit, phi, sigmoid, toOdds } from './odds'
import type { GroupId, Market, Match, OtherKey, TennisState } from './types'

type TeamSport = 'basketball' | 'americanfootball' | 'baseball' | 'icehockey'

const TEAM: Record<TeamSport, { unit: number; altSpread: number; altTotal: number; fixedSpread?: number; ml: string; spread: string; total: string; pts: string }> = {
  basketball: { unit: 2.3, altSpread: 4, altTotal: 8, ml: 'Moneyline', spread: 'Point spread', total: 'Total points', pts: 'points' },
  americanfootball: { unit: 6.1, altSpread: 7, altTotal: 7, ml: 'Moneyline', spread: 'Point spread', total: 'Total points', pts: 'points' },
  baseball: { unit: 1.8, altSpread: 1, altTotal: 2, fixedSpread: 1.5, ml: 'Moneyline', spread: 'Run line', total: 'Total runs', pts: 'runs' },
  icehockey: { unit: 1.05, altSpread: 1, altTotal: 1, fixedSpread: 1.5, ml: 'Moneyline (incl. OT)', spread: 'Puck line', total: 'Total goals', pts: 'goals' },
}
const isTeam = (s: string): s is TeamSport => s in TEAM

const H = (m: Match) => teams[m.home].name
const A = (m: Match) => teams[m.away].name
const fmtLine = (x: number) => (x > 0 ? `+${x}` : `−${Math.abs(x)}`)

export const MMA_HAZARD = 0.6 / 900 // finishes per second
const BALL_WICKET = 0.045
const CRICKET_LINE_WKTS = 10.5

const remFrac = (m: Match) => (m.status === 'upcoming' ? 1 : m.status === 'ft' ? 0 : Math.max(0, 1 - m.clockSec / m.totalSec))

// ---------------------------------------------------------------- market definitions

interface Def { key: OtherKey; group: GroupId; name: string; labels: string[]; line?: number }

function defsFor(m: Match): Def[] {
  if (isTeam(m.sport)) {
    const c = TEAM[m.sport]
    const mu0 = m.xg[0] - m.xg[1]
    const sign = mu0 >= 0 ? 1 : -1
    const hl = -sign * (c.fixedSpread ?? Math.floor(Math.abs(mu0)) + 0.5) // home handicap
    const alt = hl - sign * c.altSpread
    const T = Math.floor(m.xg[0] + m.xg[1]) + 0.5
    return [
      { key: 'ml', group: 'popular', name: c.ml, labels: [H(m), A(m)] },
      { key: 'spread', group: 'popular', name: c.spread, labels: [`${H(m)} ${fmtLine(hl)}`, `${A(m)} ${fmtLine(-hl)}`], line: hl },
      { key: 'total', group: 'popular', name: `${c.total} ${T}`, labels: [`Over ${T}`, `Under ${T}`], line: T },
      { key: 'altspread', group: 'lines', name: `Alternative ${c.spread.toLowerCase()}`, labels: [`${H(m)} ${fmtLine(alt)}`, `${A(m)} ${fmtLine(-alt)}`], line: alt },
      { key: 'alttotal', group: 'lines', name: `${c.total} ${T + c.altTotal}`, labels: [`Over ${T + c.altTotal}`, `Under ${T + c.altTotal}`], line: T + c.altTotal },
    ]
  }
  if (m.sport === 'cricket') {
    const L = Math.floor(m.xg[0]) + 0.5
    return [
      { key: 'ml', group: 'popular', name: 'Match winner', labels: [H(m), A(m)] },
      { key: 'inn1', group: 'popular', name: `${H(m)} innings runs ${L}`, labels: [`Over ${L}`, `Under ${L}`], line: L },
      { key: 'wkts', group: 'lines', name: `Total match wickets ${CRICKET_LINE_WKTS}`, labels: [`Over ${CRICKET_LINE_WKTS}`, `Under ${CRICKET_LINE_WKTS}`], line: CRICKET_LINE_WKTS },
    ]
  }
  if (m.sport === 'mma') {
    return [
      { key: 'ml', group: 'popular', name: 'Fight winner', labels: [H(m), A(m)] },
      { key: 'rounds', group: 'popular', name: 'Total rounds 2.5', labels: ['Over 2.5', 'Under 2.5'], line: 2.5 },
      {
        key: 'method', group: 'props', name: 'Method of victory',
        labels: [`${H(m)} by KO/TKO`, `${H(m)} by submission`, `${H(m)} by decision`, `${A(m)} by KO/TKO`, `${A(m)} by submission`, `${A(m)} by decision`],
      },
    ]
  }
  // tennis
  return [
    { key: 'ml', group: 'popular', name: 'Match winner', labels: [H(m), A(m)] },
    { key: 'set1', group: 'popular', name: '1st set winner', labels: [H(m), A(m)] },
    { key: 'games', group: 'lines', name: 'Total games 22.5', labels: ['Over 22.5', 'Under 22.5'], line: 22.5 },
    { key: 'altgames', group: 'lines', name: 'Total games 20.5', labels: ['Over 20.5', 'Under 20.5'], line: 20.5 },
  ]
}

// ---------------------------------------------------------------- tennis maths

function tennisQ(m: Match) { return sigmoid(logit(m.xg[0]) + m.drift) }

function setProb(q: number, a: number, b: number, memo = new Map<string, number>()): number {
  if (a >= 6 && a - b >= 2) return 1
  if (b >= 6 && b - a >= 2) return 0
  if (a === 7 || b === 7) return a > b ? 1 : 0
  if (a === 6 && b === 6) return q // tiebreak
  const k = a + ',' + b
  if (memo.has(k)) return memo.get(k)!
  const v = q * setProb(q, a + 1, b, memo) + (1 - q) * setProb(q, a, b + 1, memo)
  memo.set(k, v)
  return v
}

function matchProb(ps: number, a: number, b: number): number {
  if (a === 2) return 1
  if (b === 2) return 0
  return ps * matchProb(ps, a + 1, b) + (1 - ps) * matchProb(ps, a, b + 1)
}

function seededRng(seed: number) {
  let x = seed >>> 0
  return () => { x = (x * 1664525 + 1013904223) >>> 0; return x / 4294967296 }
}

/** Advance a tennis state by one game won by `w`. */
export function tennisGame(t: TennisState, w: 0 | 1): { t: TennisState; setDone: boolean; matchDone: boolean } {
  const g = [...t.games] as [number, number]
  g[w]++
  const [a, b] = g
  const setWon = (a >= 6 && a - b >= 2) || (b >= 6 && b - a >= 2) || a === 7 || b === 7
  const server = (t.server ? 0 : 1) as 0 | 1
  if (!setWon) return { t: { ...t, games: g, server }, setDone: false, matchDone: false }
  const sets = [...t.sets] as [number, number]
  sets[a > b ? 0 : 1]++
  const nt: TennisState = { sets, games: [0, 0], done: [...t.done, g], server }
  return { t: nt, setDone: true, matchDone: sets[0] === 2 || sets[1] === 2 }
}

function tennisTotalGames(m: Match, line: number) {
  const q = tennisQ(m)
  const t0 = m.tennis ?? { sets: [0, 0], games: [0, 0], done: [], server: 0 }
  const rng = seededRng(97)
  const N = 1200
  let over = 0
  for (let i = 0; i < N; i++) {
    let t: TennisState = { ...t0, sets: [...t0.sets] as [number, number], games: [...t0.games] as [number, number], done: [...t0.done] }
    for (let guard = 0; guard < 60; guard++) {
      const r = tennisGame(t, rng() < q ? 0 : 1)
      t = r.t
      if (r.matchDone) break
    }
    const total = t.done.reduce((s, x) => s + x[0] + x[1], 0)
    if (total > line) over++
  }
  return over / N
}

// ---------------------------------------------------------------- pricing

export function priceOther(m: Match, mk: Market): { odds: number[]; closed?: string } {
  const key = mk.key as OtherKey
  const n = mk.selections.length

  if (isTeam(m.sport)) {
    const c = TEAM[m.sport]
    const rem = remFrac(m)
    const eh = m.xg[0] * rem * Math.exp(m.drift / 2)
    const ea = m.xg[1] * rem * Math.exp(-m.drift / 2)
    const [sh, sa] = m.score
    const mu = sh + eh - (sa + ea)
    const sd = Math.max(0.45, Math.sqrt((eh + ea) * c.unit))
    const two = (p: number, margin = 1.045) => [toOdds(p, margin), toOdds(1 - p, margin)]
    if (key === 'ml') return { odds: two(phi(mu / sd)) }
    if (key === 'spread' || key === 'altspread') return { odds: two(phi((mu + (mk.line ?? 0)) / sd)) }
    if (key === 'total' || key === 'alttotal') {
      const L = mk.line ?? 0
      if (sh + sa > L) return { odds: [1.01, 51], closed: `Settled: ${L} ${c.pts} passed` }
      return { odds: two(phi((sh + sa + eh + ea - L) / sd)) }
    }
  }

  if (m.sport === 'cricket') {
    const cs = m.cricket ?? { inn: 0, wk: [0, 0], balls: [0, 0] }
    const res = (w: number) => Math.sqrt(Math.max(0, 10 - w) / 10)
    const B0 = 120 - cs.balls[0], B1 = 120 - cs.balls[1]
    const inn0Done = cs.inn > 0
    const e0 = inn0Done || cs.wk[0] >= 10 ? 0 : (m.xg[0] / 120) * B0 * res(cs.wk[0]) * Math.exp(m.drift / 2)
    const sd0 = inn0Done ? 0.5 : Math.sqrt(B0) * 1.3 + 2
    const mu1 = m.score[0] + e0
    let pAway: number
    if (!inn0Done) {
      pAway = phi((m.xg[1] * Math.exp(-m.drift / 2) - mu1 - 0.5) / Math.sqrt(sd0 * sd0 + 24 * 24))
    } else {
      const need = m.score[0] + 1 - m.score[1]
      if (need <= 0) pAway = 1
      else if (B1 <= 0 || cs.wk[1] >= 10) pAway = 0
      else {
        const e1 = (m.xg[1] / 120) * B1 * res(cs.wk[1]) * Math.exp(-m.drift / 2)
        pAway = phi((e1 - need + 0.5) / (Math.sqrt(B1) * 1.3 + 2))
      }
    }
    if (key === 'ml') return { odds: [toOdds(1 - pAway, 1.045), toOdds(pAway, 1.045)] }
    if (key === 'inn1') {
      if (inn0Done) return { odds: [1.01, 51], closed: 'Settled: first innings complete' }
      const p = phi((mu1 - (mk.line ?? 0)) / sd0)
      return { odds: [toOdds(p, 1.05), toOdds(1 - p, 1.05)] }
    }
    if (key === 'wkts') {
      const cur = cs.wk[0] + cs.wk[1]
      const L = mk.line ?? CRICKET_LINE_WKTS
      if (cur > L) return { odds: [1.01, 51], closed: `Settled: ${L} wickets passed` }
      const ew = inn0Done
        ? Math.min(10 - cs.wk[1], B1 * BALL_WICKET)
        : Math.min(10 - cs.wk[0], B0 * BALL_WICKET) + 5.4
      const remBalls = (inn0Done ? 0 : B0 + 120) + (inn0Done ? B1 : 0)
      const sd = 0.5 + 2.1 * (remBalls / 240)
      const p = phi((cur + ew - L) / sd)
      return { odds: [toOdds(p, 1.06), toOdds(1 - p, 1.06)] }
    }
  }

  if (m.sport === 'mma') {
    const p = sigmoid(logit(m.xg[0]) + m.drift * 2.5)
    const remaining = Math.max(0, 900 - m.clockSec)
    const noFinish = Math.exp(-MMA_HAZARD * remaining)
    const fin = 1 - noFinish
    if (key === 'ml') return { odds: [toOdds(p, 1.05), toOdds(1 - p, 1.05)] }
    if (key === 'rounds') {
      if (m.clockSec >= 750) return { odds: [1.01, 51], closed: 'Settled: the fight passed 2.5 rounds' }
      const pOver = Math.exp(-MMA_HAZARD * (750 - m.clockSec))
      return { odds: [toOdds(pOver, 1.06), toOdds(1 - pOver, 1.06)] }
    }
    if (key === 'method') {
      const ps = [p * fin * 0.62, p * fin * 0.38, p * noFinish, (1 - p) * fin * 0.62, (1 - p) * fin * 0.38, (1 - p) * noFinish]
      return { odds: ps.map((x) => toOdds(x, 1.15)) }
    }
  }

  if (m.sport === 'tennis') {
    const q = tennisQ(m)
    const t = m.tennis ?? { sets: [0, 0], games: [0, 0], done: [], server: 0 as const }
    const ps0 = setProb(q, 0, 0)
    const pcur = setProb(q, t.games[0], t.games[1])
    const pMatch = pcur * matchProb(ps0, t.sets[0] + 1, t.sets[1]) + (1 - pcur) * matchProb(ps0, t.sets[0], t.sets[1] + 1)
    if (key === 'ml') return { odds: [toOdds(pMatch, 1.045), toOdds(1 - pMatch, 1.045)] }
    if (key === 'set1') {
      if (t.done.length > 0) return { odds: [1.01, 51], closed: 'Settled: first set complete' }
      return { odds: [toOdds(pcur, 1.05), toOdds(1 - pcur, 1.05)] }
    }
    if (key === 'games' || key === 'altgames') {
      const L = mk.line ?? 22.5
      const played = t.done.reduce((s, x) => s + x[0] + x[1], 0) + t.games[0] + t.games[1]
      if (played > L) return { odds: [1.01, 51], closed: `Settled: ${L} games passed` }
      const p = tennisTotalGames(m, L)
      return { odds: [toOdds(p, 1.06), toOdds(1 - p, 1.06)] }
    }
  }
  return { odds: Array(n).fill(2) }
}

export function buildOtherMarkets(m: Match, now: number): Market[] {
  return defsFor(m).map((d) => {
    const mk: Market = {
      id: `${m.id}:${d.key}`, matchId: m.id, key: d.key, group: d.group, name: d.name, line: d.line,
      suspendedUntil: null, closed: false, selections: [],
    }
    const tickTimes = Array.from({ length: 5 }, (_, index) => m.status === 'live'
      ? m.kickoff + (m.clockSec * 1000 * index) / 4
      : now - (4 - index) * 60_000)
    mk.selections = d.labels.map((label, i) => ({ id: `${m.id}:${d.key}:${i}`, label, odds: 2, prev: null, move: null, movedAt: now - 10000, history: [], historyAt: tickTimes, closed: false }))
    const pr = priceOther(m, mk)
    mk.closed = !!pr.closed
    mk.closedReason = pr.closed
    mk.selections = mk.selections.map((s, i) => {
      const o = pr.odds[i]
      const hist = [0, 0, 0, 0].map(() => ladder(o * (1 + (Math.random() - 0.5) * 0.1)))
      return { ...s, odds: o, history: [...hist, o], historyAt: [...s.historyAt, now].slice(-5) }
    })
    return mk
  })
}

// ---------------------------------------------------------------- settlement

export function settleOther(m: Match, mk: Market, idx: number): boolean {
  const [h, a] = m.score
  const key = mk.key as OtherKey
  const L = mk.line ?? 0
  if (m.sport === 'mma') {
    const f = m.mma?.finish
    if (!f) return false
    if (key === 'ml') return f.winner === idx
    if (key === 'rounds') return idx === 0 ? m.clockSec > 750 : m.clockSec <= 750
    if (key === 'method') {
      const mi = f.method === 'KO/TKO' ? 0 : f.method === 'Submission' ? 1 : 2
      return idx === f.winner * 3 + mi
    }
  }
  if (m.sport === 'tennis') {
    const t = m.tennis!
    if (key === 'ml') return t.sets[idx] === 2
    if (key === 'set1') return t.done[0] ? (t.done[0][0] > t.done[0][1] ? 0 : 1) === idx : false
    const total = t.done.reduce((s, x) => s + x[0] + x[1], 0)
    return idx === 0 ? total > L : total < L
  }
  if (m.sport === 'cricket') {
    if (key === 'ml') return idx === 0 ? h > a : a > h
    if (key === 'inn1') return idx === 0 ? h > L : h < L
    const w = (m.cricket?.wk[0] ?? 0) + (m.cricket?.wk[1] ?? 0)
    return idx === 0 ? w > L : w < L
  }
  if (key === 'ml') return idx === 0 ? h > a : a > h
  if (key === 'spread' || key === 'altspread') return idx === 0 ? h + L > a : a - L > h
  return idx === 0 ? h + a > L : h + a < L
}

// ---------------------------------------------------------------- live simulation

export interface SimResult { m: Match; scored?: { side: 0 | 1; label: string; text: string; suspend: boolean }; ended?: boolean }

const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)]

function addScore(m: Match, side: 0 | 1, pts: number): Match {
  const s = [...m.score] as [number, number]
  s[side] += pts
  return { ...m, score: s }
}

/** One second of play. */
export function simStep(m0: Match): SimResult {
  let m: Match = { ...m0 }
  const r = Math.random

  if (isTeam(m.sport)) {
    if (m.sport === 'baseball') {
      // an out every ~20 s; runs score before the out
      m.clockSec = m0.clockSec // outs stored in clockSec
      if (Math.floor(Date.now() / 1000) % 20 !== 0) return { m }
      const o = m.clockSec
      const batting: 0 | 1 = o % 6 < 3 ? 1 : 0 // away bats in the top
      let scored: SimResult['scored']
      const rate = m.xg[batting] / 27
      if (r() < rate * 0.85) {
        const runs = r() < 0.12 ? pick([2, 3, 4]) : 1
        m = addScore(m, batting, runs)
        scored = { side: batting, label: runs >= 2 && r() < 0.5 ? 'Home run' : 'Run scored', text: `${teams[batting ? m.away : m.home].name} · ${runs} ${runs === 1 ? 'run' : 'runs'}`, suspend: true }
      }
      m.clockSec = o + 1
      if (m.clockSec >= m.totalSec) {
        if (m.score[0] === m.score[1]) m = addScore(m, r() < 0.5 ? 0 : 1, 1)
        return { m, scored, ended: true }
      }
      return { m, scored }
    }
    m.clockSec = m0.clockSec + 1
    let scored: SimResult['scored']
    for (const side of [0, 1] as const) {
      const rate = m.xg[side] * Math.exp((side ? -1 : 1) * m.drift / 2)
      if (m.sport === 'basketball' && r() < rate / 2880 / 2.25) {
        const three = r() < 0.3
        m = addScore(m, side, three ? 3 : 2)
        scored = { side, label: three ? 'Three-pointer' : 'Basket', text: teams[side ? m.away : m.home].name, suspend: false }
      } else if (m.sport === 'americanfootball' && r() < rate / 3600 / 5.4) {
        const td = r() < 0.6
        m = addScore(m, side, td ? 7 : 3)
        scored = { side, label: td ? 'Touchdown' : 'Field goal', text: teams[side ? m.away : m.home].name, suspend: true }
      } else if (m.sport === 'icehockey' && r() < rate / 3600) {
        m = addScore(m, side, 1)
        scored = { side, label: 'Goal', text: teams[side ? m.away : m.home].name, suspend: true }
      }
    }
    if (m.clockSec >= m.totalSec) {
      if (m.score[0] === m.score[1]) m = addScore(m, r() < 0.5 ? 0 : 1, m.sport === 'basketball' ? 2 : m.sport === 'americanfootball' ? 3 : 1)
      return { m, scored, ended: true }
    }
    return { m, scored }
  }

  if (m.sport === 'cricket') {
    m.clockSec = m0.clockSec + 1
    if (m.clockSec % 6 !== 0) return { m }
    const cs = { ...(m.cricket ?? { inn: 0, wk: [0, 0], balls: [0, 0] }) } as NonNullable<Match['cricket']>
    cs.wk = [...cs.wk] as [number, number]
    cs.balls = [...cs.balls] as [number, number]
    const b = cs.inn
    let scored: SimResult['scored']
    cs.balls[b]++
    if (r() < BALL_WICKET) {
      cs.wk[b]++
      scored = { side: b as 0 | 1, label: 'Wicket', text: `${teams[b ? m.away : m.home].name} lose a wicket`, suspend: true }
    } else {
      const x = r()
      const runs = x < 0.35 ? 0 : x < 0.7 ? 1 : x < 0.8 ? 2 : x < 0.82 ? 3 : x < 0.93 ? 4 : 6
      m = addScore(m, b as 0 | 1, runs)
      if (runs === 6) scored = { side: b as 0 | 1, label: 'Six', text: teams[b ? m.away : m.home].name, suspend: false }
    }
    m.cricket = cs
    const innOver = cs.balls[b] >= 120 || cs.wk[b] >= 10
    if (b === 1 && (m.score[1] > m.score[0] || innOver)) return { m, scored, ended: true }
    if (b === 0 && innOver) m.cricket = { ...cs, inn: 1 }
    return { m, scored }
  }

  if (m.sport === 'mma') {
    m.clockSec = m0.clockSec + 1
    const p = sigmoid(logit(m.xg[0]) + m.drift * 2.5)
    if (r() < MMA_HAZARD) {
      const winner: 0 | 1 = r() < p ? 0 : 1
      const method = r() < 0.62 ? 'KO/TKO' : 'Submission'
      m.mma = { finish: { method, round: Math.floor(m.clockSec / 300) + 1, winner } }
      return { m, scored: { side: winner, label: method, text: `${teams[winner ? m.away : m.home].name} wins`, suspend: true }, ended: true }
    }
    if (r() < 0.003) {
      const side: 0 | 1 = r() < p ? 0 : 1
      m.drift = m0.drift + (side ? -0.25 : 0.25)
      return { m, scored: { side, label: 'Big shot', text: `${teams[side ? m.away : m.home].name} lands clean`, suspend: false } }
    }
    if (m.clockSec >= 900) {
      const winner: 0 | 1 = r() < p ? 0 : 1
      m.mma = { finish: { method: 'Decision', round: 3, winner } }
      return { m, ended: true }
    }
    return { m }
  }

  // tennis: a game every ~25 s
  m.clockSec = m0.clockSec + 1
  if (m.clockSec % 25 !== 0) return { m }
  const q = tennisQ(m)
  const t = m.tennis ?? { sets: [0, 0], games: [0, 0], done: [], server: 0 }
  const w: 0 | 1 = r() < q ? 0 : 1
  const res = tennisGame(t, w)
  m.tennis = res.t
  m.score = [...res.t.sets] as [number, number]
  const broke = w !== t.server
  const scored = broke ? { side: w, label: 'Break of serve', text: teams[w ? m.away : m.home].name, suspend: true } : undefined
  return { m, scored, ended: res.matchDone }
}

/** Demo control: force a scoring moment for `side`. */
export function forceScore(m0: Match, side: 0 | 1): SimResult {
  let m = { ...m0 }
  const team = teams[side ? m.away : m.home].name
  switch (m.sport) {
    case 'basketball': m = addScore(m, side, 3); return { m, scored: { side, label: 'Three-pointer', text: team, suspend: true } }
    case 'americanfootball': m = addScore(m, side, 7); return { m, scored: { side, label: 'Touchdown', text: team, suspend: true } }
    case 'baseball': m = addScore(m, side, 2); return { m, scored: { side, label: 'Home run', text: `${team} · 2 runs`, suspend: true } }
    case 'icehockey': m = addScore(m, side, 1); return { m, scored: { side, label: 'Goal', text: team, suspend: true } }
    case 'cricket': {
      const b = (m.cricket?.inn ?? 0) as 0 | 1
      m = addScore(m, b, 6)
      return { m, scored: { side: b, label: 'Six', text: teams[b ? m.away : m.home].name, suspend: true } }
    }
    case 'mma':
      m.drift = m0.drift + (side ? -0.6 : 0.6)
      return { m, scored: { side, label: 'Knockdown', text: `${team} drops the opponent`, suspend: true } }
    case 'tennis': {
      const t = m.tennis ?? { sets: [0, 0], games: [0, 0], done: [], server: 0 }
      const res = tennisGame(t, side)
      m.tennis = res.t
      m.score = [...res.t.sets] as [number, number]
      m.drift = m0.drift + (side ? -0.15 : 0.15)
      return { m, scored: { side, label: 'Break of serve', text: team, suspend: true }, ended: res.matchDone }
    }
    default: return { m }
  }
}

// A tiny external store + simulation engine (clock, odds drift, suspensions, goals, settlement).
import { useSyncExternalStore } from 'react'
import { matchSeeds } from '../data/matches'
import { teams } from '../data/teams'
import { compById } from '../data/competitions'
import { otherSeeds } from '../data/otherMatches'
import { buildMarkets, GOAL_GROUPS, ladder, priceMarket, settleSel } from './pricing'
import { forceScore, simStep, type SimResult } from './multisport'
import { PRICE_HISTORY_LIMIT, type Bet, type Market, type Match, type SlipItem, type State } from './types'

export const MIN_STAKE = 1
export const MAX_STAKE = 500
const SUSPEND_MS = 5000
const FOLLOW_KEY = 'hb.follows.v1'

// ---------------------------------------------------------------- init

const rand = (a: number, b: number) => a + Math.random() * (b - a)
const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)]
const round2 = (n: number) => Math.round(n * 100) / 100

export const betId = () => 'HB-' + Array.from({ length: 6 }, () => '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'[Math.floor(Math.random() * 32)]).join('')

function loadFollows(): State['follows'] {
  try {
    const raw = localStorage.getItem(FOLLOW_KEY)
    if (raw) return JSON.parse(raw)
  } catch { /* storage unavailable */ }
  return { teams: ['aurelia'], comps: ['ucl'] }
}

function sportState(sport: string, seed?: { cricket?: Match['cricket']; tennis?: Match['tennis'] }): Partial<Match> {
  if (sport === 'cricket') return { cricket: seed?.cricket ?? { inn: 0, wk: [0, 0], balls: [0, 0] } }
  if (sport === 'tennis') return { tennis: seed?.tennis ?? { sets: [0, 0], games: [0, 0], done: [], server: 0 } }
  if (sport === 'mma') return { mma: { finish: null } }
  return {}
}

function init(): State {
  const now = Date.now()
  const matches: Record<string, Match> = {}
  const markets: Record<string, Market> = {}
  const marketIds: Record<string, string[]> = {}
  for (const s of matchSeeds) {
    const live = s.kickoffIn <= 0
    const m: Match = {
      id: s.id, sport: 'football', totalSec: 90 * 60, compId: s.compId, home: s.home, away: s.away,
      kickoff: now + s.kickoffIn * 60_000,
      status: live ? 'live' : 'upcoming',
      clockSec: s.clockSec ?? 0,
      endSec: 90 * 60 + Math.round(rand(2, 5)) * 60,
      score: s.score ?? [0, 0],
      htScore: null,
      corners: s.corners ?? [0, 0],
      events: (s.events ?? []).map((event) => ({ ...event, at: now - Math.max(0, (s.clockSec ?? 0) - event.minute * 60) * 1000 })),
      xg: s.xg,
      drift: 0,
      goal: null,
    }
    if (live && m.clockSec >= 45 * 60) {
      const ht: [number, number] = [0, 0]
      for (const e of m.events) if (e.type === 'goal' && e.minute <= 45) ht[e.side]++
      m.htScore = ht
    }
    matches[m.id] = m
    const mks = buildMarkets(m, now)
    marketIds[m.id] = mks.map((x) => x.id)
    for (const x of mks) markets[x.id] = x
  }
  const totals: Record<string, number> = { basketball: 2880, americanfootball: 3600, baseball: 54, icehockey: 3600, cricket: 240, mma: 900, tennis: 1 }
  for (const s of otherSeeds) {
    const live = s.kickoffIn <= 0
    const m: Match = {
      id: s.id, sport: s.sport, compId: s.compId, home: s.home, away: s.away,
      kickoff: now + s.kickoffIn * 60_000,
      status: live ? 'live' : 'upcoming',
      clockSec: s.clockSec ?? 0, endSec: totals[s.sport], totalSec: totals[s.sport],
      score: s.score ?? [0, 0], htScore: null, corners: [0, 0], events: [],
      xg: s.rate, drift: 0, goal: null,
      ...sportState(s.sport, s),
    }
    matches[m.id] = m
    const mks = buildMarkets(m, now)
    marketIds[m.id] = mks.map((x) => x.id)
    for (const x of mks) markets[x.id] = x
  }

  const open = markets['har-red:mr'].selections[0]
  const bets: Bet[] = [
    {
      id: 'HB-4QK7TZ', placedAt: now - 26 * 60_000, matchId: 'har-red', marketId: 'har-red:mr', selId: open.id, sport: 'football',
      compName: 'Premier League', home: 'Arsenal', away: 'Chelsea', homeId: 'harrowgate', awayId: 'redfield',
      marketName: 'Match result', pick: 'Arsenal', odds: ladder(open.odds * 1.12), stake: 20, status: 'open',
    },
    {
      id: 'HB-9MXC2D', placedAt: now - 26 * 3600_000, matchId: null, marketId: null, selId: null, sport: 'football',
      compName: 'Premier League', home: 'Chelsea', away: 'Newcastle United', homeId: 'redfield', awayId: 'ashcombe',
      marketName: 'Total goals 2.5', pick: 'Over 2.5', odds: 1.85, stake: 25, status: 'won', returned: 46.25,
      settledAt: now - 24 * 3600_000, finalScore: [3, 1],
    },
    {
      id: 'HB-8CK9TR', placedAt: now - 3 * 3600_000, matchId: null, marketId: null, selId: null, sport: 'cricket',
      compName: 'Indian Premier League', home: 'Chennai Super Kings', away: 'Mumbai Indians', homeId: 'saffron', awayId: 'monsoon',
      marketName: 'Match winner', pick: 'Chennai Super Kings', odds: 2.15, stake: 50, status: 'won', returned: 107.50,
      settledAt: now - 1 * 3600_000, finalScore: [186, 172],
    },
    {
      id: 'HB-3BB6KD', placedAt: now - 12 * 3600_000, matchId: null, marketId: null, selId: null, sport: 'basketball',
      compName: 'NBA', home: 'Boston Celtics', away: 'Los Angeles Lakers', homeId: 'calder', awayId: 'ironvale',
      marketName: 'Moneyline', pick: 'Boston Celtics', odds: 1.95, stake: 40, status: 'cashed', returned: 68.20,
      settledAt: now - 10 * 3600_000, finalScore: [108, 102],
    },
    {
      id: 'HB-7RHN5W', placedAt: now - 50 * 3600_000, matchId: null, marketId: null, selId: null, sport: 'football',
      compName: 'Serie A', home: 'AC Milan', away: 'Inter Milan', homeId: 'calanne', awayId: 'montefiore',
      marketName: 'Both teams to score', pick: 'Yes', odds: 1.72, stake: 15, status: 'lost', returned: 0,
      settledAt: now - 48 * 3600_000, finalScore: [2, 0],
    },
  ]

  return {
    now, pricesAt: now, matches, markets, marketIds,
    slip: { items: [], status: 'idle', placed: [], placedAt: null, removed: null },
    bets, balance: 1250,
    follows: loadFollows(),
    demo: { failNext: false, offline: false, target: '' },
    netOffline: typeof navigator !== 'undefined' ? !navigator.onLine : false,
    sheetOpen: false, focusStakeAt: 0, cardBetId: null, toast: null,
  }
}

// ---------------------------------------------------------------- store plumbing

let state: State = init()
const listeners = new Set<() => void>()
export const getState = () => state
function set(patch: Partial<State> | ((s: State) => Partial<State>)) {
  const p = typeof patch === 'function' ? patch(state) : patch
  state = { ...state, ...p }
  listeners.forEach((l) => l())
}
const subscribe = (l: () => void) => { listeners.add(l); return () => listeners.delete(l) }
export function useStore<T>(sel: (s: State) => T): T {
  return useSyncExternalStore(subscribe, () => sel(state), () => sel(state))
}

export const isOffline = (s: State) => s.demo.offline || s.netOffline

// ---------------------------------------------------------------- pricing helpers

function repriceMarket(mk: Market, m: Match, now: number, force = false): Market {
  if (mk.suspendedUntil && !force) return mk
  const pr = priceMarket(m, mk)
  let changed = false
  const selections = mk.selections.map((s, i) => {
    const o = pr.odds[i]
    const selClosed = !!pr.selClosed?.[i]
    if (o === s.odds && selClosed === s.closed) return s
    changed = true
    if (pr.closed || selClosed || o === s.odds) return { ...s, closed: selClosed, note: selClosed ? 'Scored' : undefined }
    return {
      ...s, prev: s.odds, odds: o, move: o > s.odds ? ('up' as const) : ('down' as const), movedAt: now,
      history: [...s.history, o].slice(-PRICE_HISTORY_LIMIT), historyAt: [...s.historyAt, now].slice(-PRICE_HISTORY_LIMIT), closed: false, note: undefined,
    }
  })
  const closed = !!pr.closed
  if (!changed && closed === mk.closed && !force) return mk
  return { ...mk, selections, closed, closedReason: pr.closed, suspendedUntil: force ? null : mk.suspendedUntil }
}

function repriceMatch(s: State, matchId: string, now: number, onlyGroups?: string[]): Record<string, Market> {
  const m = s.matches[matchId]
  const out = { ...s.markets }
  for (const id of s.marketIds[matchId]) {
    const mk = out[id]
    if (onlyGroups && !onlyGroups.includes(mk.group)) continue
    out[id] = repriceMarket(mk, m, now)
  }
  return out
}

// ---------------------------------------------------------------- engine tick

let tickCount = 0
function tick() {
  const now = Date.now()
  tickCount++
  let s = state
  const offline = isOffline(s)
  const matches = { ...s.matches }
  let markets = s.markets
  let bets = s.bets
  let balance = s.balance

  for (const id of Object.keys(matches)) {
    let m = matches[id]
    if (m.status === 'upcoming' && m.kickoff <= now) {
      m = { ...m, status: 'live', clockSec: m.sport === 'football' ? Math.floor((now - m.kickoff) / 1000) : 0 }
    }
    if (m.status !== 'live') { matches[id] = m; continue }

    let ended = false
    if (m.sport !== 'football') {
      if (!offline) {
        const r = simStep(m)
        m = r.m
        if (r.scored) {
          matches[id] = m
          const p = applyScore({ ...s, matches, markets }, id, r, now)
          m = p.matches[id]; markets = p.markets
        }
        ended = !!r.ended
      }
    } else {
      m = { ...m, clockSec: m.clockSec + 1 }
      if (!m.htScore && m.clockSec >= 45 * 60) m.htScore = [...m.score] as [number, number]

      if (!offline) {
        const minute = Math.min(90, Math.floor(m.clockSec / 60) + 1)
        const goalRate = (m.xg[0] + m.xg[1]) / 5400
        if (Math.random() < goalRate * 0.8 && m.clockSec < m.endSec - 30) {
          // natural goal: same scene as the demo button
          matches[id] = m
          s = { ...s, matches, markets }
          const res = goalPatch(s, id, Math.random() < m.xg[0] / (m.xg[0] + m.xg[1]) ? 0 : 1, now)
          m = res.matches[id]; markets = res.markets
        } else if (Math.random() < 10.4 / 5400) {
          const side = Math.random() < 0.5 ? 0 : 1
          const c = [...m.corners] as [number, number]; c[side]++
          m = { ...m, corners: c }
        } else if (Math.random() < 4.2 / 5400) {
          const side = Math.random() < 0.5 ? 0 : 1
          m = { ...m, events: [...m.events, { minute, type: 'yellow', side, player: pick(teams[side ? m.away : m.home].players), at: now }] }
        }
      }
      ended = m.clockSec >= m.endSec
    }

    if (ended) {
      m = { ...m, status: 'ft' }
      // settle open bets on this match
      bets = bets.map((b) => {
        if (b.status !== 'open' || b.matchId !== id || !b.marketId || !b.selId) return b
        const mk = markets[b.marketId]
        const idx = mk.selections.findIndex((x) => x.id === b.selId)
        const won = settleSel(m, mk, idx)
        if (won) balance = round2(balance + b.stake * b.odds)
        return { ...b, status: won ? 'won' : 'lost', returned: won ? round2(b.stake * b.odds) : 0, settledAt: now, finalScore: m.score }
      })
      const mm = { ...markets }
      for (const mid of s.marketIds[id]) mm[mid] = { ...mm[mid], closed: true, closedReason: 'Match finished', suspendedUntil: null }
      markets = mm
    }
    matches[id] = m
  }
  s = { ...s, matches, markets, bets, balance }

  // reopen suspended markets with fresh prices
  let reopened = false
  const mm = { ...s.markets }
  for (const [id, mk] of Object.entries(mm)) {
    if (mk.suspendedUntil && mk.suspendedUntil <= now) {
      const m = s.matches[mk.matchId]
      mm[id] = repriceMarket({ ...mk }, m, now, true)
      reopened = true
    }
  }
  if (reopened) s = { ...s, markets: mm }

  if (!offline) {
    // live drift every 5s
    if (tickCount % 5 === 0) {
      const ms = { ...s.matches }
      for (const m of Object.values(ms)) {
        if (m.status !== 'live') continue
        ms[m.id] = { ...m, drift: Math.max(-0.35, Math.min(0.35, m.drift + rand(-0.05, 0.05))) }
      }
      s = { ...s, matches: ms }
      for (const m of Object.values(ms)) if (m.status === 'live') s = { ...s, markets: repriceMatch(s, m.id, now) }

      // occasional organic suspension (corner / free-kick danger)
      if (Math.random() < 0.12) {
        const live = Object.values(s.matches).filter((m) => m.status === 'live')
        if (live.length) {
          const m = pick(live)
          const candidates = s.marketIds[m.id].map((id) => s.markets[id]).filter((x) => !x.closed && !x.suspendedUntil && ['corners', 'handicaps', 'goals', 'halves', 'lines', 'props'].includes(x.group))
          if (candidates.length) {
            const mk = pick(candidates)
            s = { ...s, markets: { ...s.markets, [mk.id]: { ...mk, suspendedUntil: now + rand(3500, 6000) } } }
          }
        }
      }
    }
    // pre-match drift every 15s (smaller)
    if (tickCount % 15 === 7) {
      const ms = { ...s.matches }
      for (const m of Object.values(ms)) {
        if (m.status !== 'upcoming') continue
        ms[m.id] = { ...m, drift: Math.max(-0.2, Math.min(0.2, m.drift + rand(-0.025, 0.025))) }
      }
      s = { ...s, matches: ms }
      for (const m of Object.values(ms)) if (m.status === 'upcoming') s = { ...s, markets: repriceMatch(s, m.id, now) }
    }
  }

  // expire undo + toasts
  let slip = s.slip
  if (slip.removed && now - slip.removed.at > 5000) slip = { ...slip, removed: null }
  let toast = s.toast
  if (toast && now - toast.at > (toast.kind === 'undo' ? 5000 : 3000)) toast = null

  state = { ...s, slip, toast, now, pricesAt: offline ? s.pricesAt : now }
  listeners.forEach((l) => l())
}

let timer: number | undefined
export function startEngine() {
  if (timer) return
  timer = window.setInterval(tick, 1000)
  window.addEventListener('online', () => set({ netOffline: false }))
  window.addEventListener('offline', () => set({ netOffline: true }))
}

// ---------------------------------------------------------------- goal scene

function goalPatch(s: State, matchId: string, side: 0 | 1, now: number) {
  const m0 = s.matches[matchId]
  const minute = Math.min(90, Math.floor(m0.clockSec / 60) + 1)
  const team = teams[side ? m0.away : m0.home]
  const r = Math.random()
  const player = r < 0.45 ? team.players[0] : r < 0.75 ? team.players[1] : team.players[2]
  const score = [...m0.score] as [number, number]
  score[side]++
  const m: Match = { ...m0, score, events: [...m0.events, { minute, type: 'goal', side, player, at: now }], goal: { side, at: now, player, minute, label: 'Goal', text: `${team.name} · ${player} ${minute}'` } }
  const markets = { ...s.markets }
  for (const id of s.marketIds[matchId]) {
    const mk = markets[id]
    if (GOAL_GROUPS.includes(mk.group) && !mk.closed) markets[id] = { ...mk, suspendedUntil: now + SUSPEND_MS }
  }
  return { matches: { ...s.matches, [matchId]: m }, markets }
}

function applyScore(s: State, matchId: string, r: SimResult, now: number) {
  const sc = r.scored!
  const m: Match = { ...s.matches[matchId], goal: { side: sc.side, at: now, player: '', minute: 0, label: sc.label, text: sc.text } }
  const markets = { ...s.markets }
  if (sc.suspend) {
    for (const id of s.marketIds[matchId]) {
      const mk = markets[id]
      if (GOAL_GROUPS.includes(mk.group) && !mk.closed) markets[id] = { ...mk, suspendedUntil: now + SUSPEND_MS }
    }
  }
  return { matches: { ...s.matches, [matchId]: m }, markets }
}

const liveIds = (s: State) => Object.values(s.matches).filter((m) => m.status === 'live').map((m) => m.id)

export function demoTarget(s: State = state): string | null {
  const live = liveIds(s)
  if (s.demo.target && live.includes(s.demo.target)) return s.demo.target
  const fromSlip = s.slip.items.map((i) => i.matchId).find((id) => live.includes(id))
  return fromSlip ?? live[0] ?? null
}

// ---------------------------------------------------------------- actions

export const actions = {
  simulateGoal(side?: 0 | 1) {
    const id = demoTarget()
    if (!id) return actions.toast('No live match to score in right now.')
    const m = state.matches[id]
    const now = Date.now()
    if (m.sport !== 'football') {
      const sd = side ?? (Math.random() < 0.5 ? 0 : 1)
      const r = forceScore(m, sd)
      set((s) => applyScore({ ...s, matches: { ...s.matches, [id]: r.m } }, id, { ...r, scored: r.scored && { ...r.scored, suspend: true } }, now))
      return
    }
    const sd = side ?? (Math.random() < m.xg[0] / (m.xg[0] + m.xg[1]) ? 0 : 1)
    set((s) => goalPatch(s, id, sd, now))
  },

  shiftOdds() {
    const now = Date.now()
    const id = demoTarget()
    const ids = new Set<string>([...(id ? [id] : []), ...state.slip.items.map((i) => i.matchId)])
    set((s) => {
      const sign = Math.random() < 0.5 ? -1 : 1
      const matches = { ...s.matches }
      for (const mid of ids) matches[mid] = { ...matches[mid], drift: Math.max(-0.5, Math.min(0.5, matches[mid].drift + sign * rand(0.12, 0.2))) }
      let next: State = { ...s, matches }
      for (const mid of ids) next = { ...next, markets: repriceMatch(next, mid, now) }
      // guarantee every slip selection visibly moves
      const markets = { ...next.markets }
      for (const it of s.slip.items) {
        const mk = markets[it.marketId]
        if (mk.suspendedUntil || mk.closed) continue
        markets[mk.id] = {
          ...mk,
          selections: mk.selections.map((x) => {
            if (x.id !== it.selId || x.odds !== it.accepted) return x
            const o = ladder(x.odds * (sign > 0 ? 1.09 : 0.92))
            return { ...x, prev: x.odds, odds: o, move: o > x.odds ? 'up' : 'down', movedAt: now, history: [...x.history, o].slice(-PRICE_HISTORY_LIMIT), historyAt: [...x.historyAt, now].slice(-PRICE_HISTORY_LIMIT) }
          }),
        }
      }
      return { matches, markets }
    })
  },

  suspendMarket(durationMs = 8000) {
    const now = Date.now()
    set((s) => {
      const markets = { ...s.markets }
      const targets = new Set<string>(s.slip.items.map((i) => i.marketId))
      const id = demoTarget(s)
      if (id) targets.add(`${id}:mr`)
      for (const t of targets) if (markets[t] && !markets[t].closed) markets[t] = { ...markets[t], suspendedUntil: now + durationMs }
      return { markets }
    })
  },

  setFailNext: (v: boolean) => set((s) => ({ demo: { ...s.demo, failNext: v } })),
  setOffline: (v: boolean) => set((s) => ({ demo: { ...s.demo, offline: v } })),
  setTarget: (v: string) => set((s) => ({ demo: { ...s.demo, target: v } })),

  resetDemoScenario(matchId?: string) {
    const now = Date.now()
    set((s) => {
      const marketIds = new Set(s.slip.items.map((item) => item.marketId))
      if (matchId) for (const marketId of s.marketIds[matchId] ?? []) marketIds.add(marketId)
      const markets = { ...s.markets }
      for (const marketId of marketIds) {
        const market = markets[marketId]
        if (market?.suspendedUntil && !market.closed) markets[marketId] = repriceMarket({ ...market, suspendedUntil: null }, s.matches[market.matchId], now, true)
      }
      return { markets, demo: { ...s.demo, failNext: false, offline: false, ...(matchId ? { target: matchId } : {}) } }
    })
  },

  // ---- slip
  toggleSelection(selId: string) {
    const s = state
    const existing = s.slip.items.find((i) => i.selId === selId)
    if (existing) return actions.removeItem(selId)
    const [matchId, key] = selId.split(':')
    const marketId = `${matchId}:${key}`
    const mk = s.markets[marketId]
    const sel = mk.selections.find((x) => x.id === selId)!
    if (mk.closed || mk.suspendedUntil || sel.closed) return
    const m = s.matches[matchId]
    const item: SlipItem = {
      selId, marketId, matchId, accepted: sel.odds, stake: '', phase: m.status === 'live' ? 'live' : 'pre', addedAt: Date.now(),
    }
    set({
      slip: { ...s.slip, items: [...s.slip.items, item], status: s.slip.status === 'placed' ? 'idle' : s.slip.status === 'failed' ? 'idle' : s.slip.status, placed: s.slip.status === 'placed' ? [] : s.slip.placed },
    })
  },

  removeItem(selId: string) {
    const s = state
    const index = s.slip.items.findIndex((i) => i.selId === selId)
    if (index < 0) return
    const item = s.slip.items[index]
    const mk = s.markets[item.marketId]
    const label = mk.selections.find((x) => x.id === selId)?.label ?? 'Selection'
    set({
      slip: { ...s.slip, items: s.slip.items.filter((i) => i.selId !== selId), removed: { item, index, at: Date.now() } },
      toast: { id: Date.now(), kind: 'undo', text: `Removed ${label}`, at: Date.now() },
    })
  },

  undoRemove() {
    const s = state
    const r = s.slip.removed
    if (!r) return
    const items = [...s.slip.items]
    items.splice(Math.min(r.index, items.length), 0, r.item)
    set({ slip: { ...s.slip, items, removed: null }, toast: null })
  },

  clearSlip: () => set((s) => ({ slip: { ...s.slip, items: [], status: 'idle' } })),

  setStake(selId: string, stake: string) {
    const clean = stake.replace(',', '.').replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1').replace(/^(\d*\.\d{0,2}).*$/, '$1')
    set((s) => ({ slip: { ...s.slip, status: s.slip.status === 'failed' ? 'idle' : s.slip.status, items: s.slip.items.map((i) => (i.selId === selId ? { ...i, stake: clean } : i)) } }))
  },

  acceptOdds() {
    set((s) => ({
      slip: {
        ...s.slip,
        items: s.slip.items.map((i) => {
          const mk = s.markets[i.marketId]
          const sel = mk.selections.find((x) => x.id === i.selId)!
          return mk.suspendedUntil ? i : { ...i, accepted: sel.odds }
        }),
      },
    }))
  },

  placeBets() {
    if (state.slip.status === 'placing') return
    set((s) => ({ slip: { ...s.slip, status: 'placing' } }))
    window.setTimeout(() => {
      const s = state
      if (s.demo.failNext || isOffline(s)) {
        set({ slip: { ...s.slip, status: 'failed' }, demo: { ...s.demo, failNext: false } })
        return
      }
      const now = Date.now()
      const newBets: Bet[] = s.slip.items.map((i) => {
        const m = s.matches[i.matchId]
        const mk = s.markets[i.marketId]
        const sel = mk.selections.find((x) => x.id === i.selId)!
        return {
          id: betId(), placedAt: now, matchId: m.id, marketId: mk.id, selId: sel.id, sport: m.sport,
          compName: compById[m.compId].name, home: teams[m.home].name, away: teams[m.away].name, homeId: m.home, awayId: m.away,
          marketName: mk.name, pick: sel.label, odds: i.accepted, stake: round2(parseFloat(i.stake)), status: 'open',
        }
      })
      const total = newBets.reduce((a, b) => a + b.stake, 0)
      set({
        bets: [...newBets, ...s.bets],
        balance: round2(s.balance - total),
        slip: { items: [], status: 'placed', placed: newBets.map((b) => b.id), placedAt: now, removed: null },
      })
    }, 1400)
  },

  dismissPlaced: () => set((s) => ({ slip: { ...s.slip, status: 'idle', placed: [] } })),

  cashOut(betIdv: string, value: number) {
    const now = Date.now()
    set((s) => ({
      bets: s.bets.map((b) => (b.id === betIdv ? { ...b, status: 'cashed', returned: value, settledAt: now } : b)),
      balance: round2(s.balance + value),
      cardBetId: betIdv,
      toast: { id: now, kind: 'info', text: `Cashed out ${value.toFixed(2)} USDT. Check your shareable card!`, at: now },
    }))
  },

  deposit(amount: number) {
    const now = Date.now()
    set((s) => ({
      balance: round2(s.balance + amount),
      toast: { id: now, kind: 'info', text: `Added ${amount.toFixed(2)} demo USDT.`, at: now },
    }))
  },

  resetBalance(amount = 1250) {
    const now = Date.now()
    set(() => ({
      balance: amount,
      toast: { id: now, kind: 'info', text: `Wallet balance reset to ${amount.toFixed(2)} USDT.`, at: now },
    }))
  },

  toggleFollow(kind: 'teams' | 'comps', id: string) {
    set((s) => {
      const list = s.follows[kind]
      const follows = { ...s.follows, [kind]: list.includes(id) ? list.filter((x) => x !== id) : [...list, id] }
      try { localStorage.setItem(FOLLOW_KEY, JSON.stringify(follows)) } catch { /* ignore */ }
      return { follows }
    })
  },

  openSheet: (open: boolean, focus = false) => set({ sheetOpen: open, ...(focus ? { focusStakeAt: Date.now() } : {}) }),
  openCard: (id: string | null) => set({ cardBetId: id }),
  toast: (text: string) => set({ toast: { id: Date.now(), kind: 'info', text, at: Date.now() } }),
  dismissToast: () => set({ toast: null }),
}

// ---------------------------------------------------------------- derived helpers

export type ItemKind = 'ok' | 'changed' | 'suspended' | 'closed'

export function itemView(item: SlipItem, s: State) {
  const m = s.matches[item.matchId]
  const mk = s.markets[item.marketId]
  const sel = mk.selections.find((x) => x.id === item.selId)!
  let kind: ItemKind = 'ok'
  let reason = ''
  if (m.status === 'ft') { kind = 'closed'; reason = 'This match has finished. Remove it to continue.' }
  else if (item.phase === 'pre' && m.status === 'live') { kind = 'closed'; reason = 'This match has kicked off, so pre-match prices are closed. Remove it to continue.' }
  else if (mk.closed || sel.closed) { kind = 'closed'; reason = 'This market has closed. Remove it to continue.' }
  else if (mk.suspendedUntil) { kind = 'suspended'; reason = 'This market is paused. Remove it to continue.' }
  else if (sel.odds !== item.accepted) { kind = 'changed'; reason = sel.odds > item.accepted ? 'The price went up since you added this.' : 'The price went down since you added this.' }

  const stakeNum = parseFloat(item.stake)
  let stakeError = ''
  if (item.stake !== '' && !isNaN(stakeNum)) {
    if (stakeNum < MIN_STAKE) stakeError = `Stake too low. The minimum is ${MIN_STAKE.toFixed(2)} USDT.`
    else if (stakeNum > MAX_STAKE) stakeError = `Stake too high. The maximum for this selection is ${MAX_STAKE.toFixed(2)} USDT.`
  }
  return { m, mk, sel, kind, reason, stakeNum: isNaN(stakeNum) ? 0 : stakeNum, stakeError }
}

export function cashOutValue(b: Bet, s: State): { value: number | null; paused: boolean } {
  if (b.status !== 'open' || !b.marketId || !b.selId) return { value: null, paused: false }
  const mk = s.markets[b.marketId]
  const sel = mk.selections.find((x) => x.id === b.selId)
  if (!sel) return { value: null, paused: false }
  if (mk.suspendedUntil || isOffline(s)) return { value: null, paused: true }
  if (mk.closed || sel.closed) return { value: null, paused: true }
  return { value: Math.max(0.01, round2(((b.stake * b.odds) / sel.odds) * 0.95)), paused: false }
}

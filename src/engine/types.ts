import type { MatchEvent } from '../data/matches'

export type MatchStatus = 'upcoming' | 'live' | 'ft'
export type GroupId = 'popular' | 'goals' | 'halves' | 'handicaps' | 'scorers' | 'corners' | 'lines' | 'props'

export type SportId = 'football' | 'basketball' | 'americanfootball' | 'baseball' | 'icehockey' | 'cricket' | 'mma' | 'tennis'

export type FootballKey =
  | 'mr' | 'ou15' | 'ou25' | 'ou35' | 'btts' | 'ht' | 'h1ou'
  | 'hcpA' | 'hcpB' | 'ags' | 'cor95' | 'cor105' | 'crd35' | 'crd45'
/** Keys for the other sports */
export type OtherKey = 'ml' | 'spread' | 'altspread' | 'total' | 'alttotal' | 'inn1' | 'wkts' | 'rounds' | 'method' | 'set1' | 'games' | 'altgames'
export type MarketKey = FootballKey | OtherKey

export interface CricketState { inn: 0 | 1; wk: [number, number]; balls: [number, number] }
export interface TennisState { sets: [number, number]; games: [number, number]; done: [number, number][]; server: 0 | 1 }
export interface MmaState { finish: { method: 'KO/TKO' | 'Submission' | 'Decision'; round: number; winner: 0 | 1 } | null }

export interface Match {
  id: string
  sport: SportId
  compId: string
  home: string
  away: string
  kickoff: number // epoch ms
  status: MatchStatus
  clockSec: number
  endSec: number // full time incl. stoppage
  score: [number, number]
  htScore: [number, number] | null
  corners: [number, number]
  events: MatchEvent[]
  /** scoring rate per full game for home / away (xG for football) */
  xg: [number, number]
  drift: number
  /** last scoring moment, for the goal scene */
  goal: { side: 0 | 1; at: number; player: string; minute: number; label: string; text: string } | null
  /** regulation length in sport units (seconds; outs for baseball; balls for cricket) */
  totalSec: number
  cricket?: CricketState
  tennis?: TennisState
  mma?: MmaState
}

export interface Selection {
  id: string
  label: string
  odds: number
  prev: number | null
  move: 'up' | 'down' | null
  movedAt: number
  history: number[] // last 5 prices
  historyAt: number[] // matching simulated tick times
  closed: boolean // e.g. player already scored
  note?: string
}

export interface Market {
  id: string
  matchId: string
  key: MarketKey
  group: GroupId
  name: string
  selections: Selection[]
  suspendedUntil: number | null
  closed: boolean
  closedReason?: string
  /** handicap or total line where relevant */
  line?: number
}

export interface SlipItem {
  selId: string
  marketId: string
  matchId: string
  accepted: number // price the user has seen and accepted
  stake: string
  phase: 'pre' | 'live'
  addedAt: number
}

export type BetStatus = 'open' | 'won' | 'lost' | 'cashed'

export interface Bet {
  id: string
  placedAt: number
  matchId: string | null
  marketId: string | null
  selId: string | null
  sport: SportId
  compName: string
  home: string
  away: string
  homeId?: string
  awayId?: string
  marketName: string
  pick: string
  odds: number
  stake: number
  status: BetStatus
  returned?: number
  settledAt?: number
  finalScore?: [number, number]
}

export type SlipStatus = 'idle' | 'placing' | 'failed' | 'placed'

export interface Toast { id: number; kind: 'undo' | 'info'; text: string; at: number }

export interface State {
  now: number
  /** Last time prices and scores were refreshed (frozen while offline). */
  pricesAt: number
  matches: Record<string, Match>
  markets: Record<string, Market>
  marketIds: Record<string, string[]> // by match
  slip: {
    items: SlipItem[]
    status: SlipStatus
    placed: string[] // bet ids from last placement
    placedAt: number | null
    removed: { item: SlipItem; index: number; at: number } | null
  }
  bets: Bet[]
  balance: number
  follows: { teams: string[]; comps: string[] }
  demo: { failNext: boolean; offline: boolean; target: string }
  netOffline: boolean
  sheetOpen: boolean
  focusStakeAt: number
  cardBetId: string | null
  toast: Toast | null
}

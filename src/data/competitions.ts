// Competition labels are real; football crest/name references are real, while fixture activity remains simulated.
import type { GroupId, SportId } from '../engine/types'

export interface Competition {
  id: string
  sport: SportId
  name: string
  region: string
  short: string
}

export const competitions: Competition[] = [
  { id: 'epl', sport: 'football', name: 'Premier League', region: 'England', short: 'PL' },
  { id: 'ucl', sport: 'football', name: 'Champions League', region: 'Europe', short: 'UCL' },
  { id: 'laliga', sport: 'football', name: 'LaLiga', region: 'Spain', short: 'LL' },
  { id: 'seriea', sport: 'football', name: 'Serie A', region: 'Italy', short: 'SA' },
  { id: 'bundesliga', sport: 'football', name: 'Bundesliga', region: 'Germany', short: 'BL' },
  { id: 'nba', sport: 'basketball', name: 'NBA', region: 'USA', short: 'NBA' },
  { id: 'nfl', sport: 'americanfootball', name: 'NFL', region: 'USA', short: 'NFL' },
  { id: 'mlb', sport: 'baseball', name: 'MLB', region: 'USA', short: 'MLB' },
  { id: 'nhl', sport: 'icehockey', name: 'NHL', region: 'North America', short: 'NHL' },
  { id: 't20', sport: 'cricket', name: 'Indian Premier League', region: 'India', short: 'IPL' },
  { id: 'ufc', sport: 'mma', name: 'UFC Fight Night', region: 'Main card', short: 'UFC' },
  { id: 'atp', sport: 'tennis', name: 'ATP Tour', region: 'Hard court', short: 'ATP' },
]

export const compById = Object.fromEntries(competitions.map((c) => [c.id, c])) as Record<string, Competition>

export interface SportDef {
  id: SportId
  name: string
  enabled: boolean
  /** how the scoring moment is named in the goal scene */
  scoreWord: string
  groups: { id: GroupId; name: string }[]
  /** 2 or 3 way main market */
  twoWayTags: [string, string]
}

const lines = [
  { id: 'popular' as const, name: 'Popular' },
  { id: 'lines' as const, name: 'Spreads & totals' },
]

export const sports: SportDef[] = [
  {
    id: 'football', name: 'Football', enabled: true, scoreWord: 'Goal', twoWayTags: ['1', '2'],
    groups: [
      { id: 'popular', name: 'Popular' },
      { id: 'goals', name: 'Goals' },
      { id: 'halves', name: 'Halves' },
      { id: 'handicaps', name: 'Handicaps' },
      { id: 'scorers', name: 'Goalscorers' },
      { id: 'corners', name: 'Corners & cards' },
    ],
  },
  { id: 'basketball', name: 'Basketball', enabled: true, scoreWord: 'Basket', twoWayTags: ['1', '2'], groups: lines },
  { id: 'americanfootball', name: 'American football', enabled: true, scoreWord: 'Touchdown', twoWayTags: ['1', '2'], groups: lines },
  { id: 'baseball', name: 'Baseball', enabled: true, scoreWord: 'Run', twoWayTags: ['1', '2'], groups: lines },
  { id: 'icehockey', name: 'Ice hockey', enabled: true, scoreWord: 'Goal', twoWayTags: ['1', '2'], groups: lines },
  {
    id: 'cricket', name: 'Cricket', enabled: true, scoreWord: 'Six', twoWayTags: ['1', '2'],
    groups: [{ id: 'popular', name: 'Popular' }, { id: 'lines', name: 'Runs & wickets' }],
  },
  {
    id: 'mma', name: 'MMA', enabled: true, scoreWord: 'Knockdown', twoWayTags: ['1', '2'],
    groups: [{ id: 'popular', name: 'Popular' }, { id: 'props', name: 'Method of victory' }],
  },
  {
    id: 'tennis', name: 'Tennis', enabled: true, scoreWord: 'Break', twoWayTags: ['1', '2'],
    groups: [{ id: 'popular', name: 'Popular' }, { id: 'lines', name: 'Games' }],
  },
]

export const sportById = Object.fromEntries(sports.map((s) => [s.id, s])) as Record<SportId, SportDef>

export const sportPath = (id: SportId) => (id === 'football' ? '/football' : `/sport/${id}`)

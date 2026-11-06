// Seed fixtures. Live matches start mid-game; upcoming kick-offs are relative to page load.

export type EventType = 'goal' | 'yellow' | 'red'
export interface MatchEvent { minute: number; type: EventType; side: 0 | 1; player: string; at?: number }

export interface MatchSeed {
  id: string
  compId: string
  home: string
  away: string
  /** minutes from now (negative = already started) */
  kickoffIn: number
  /** for live seeds: elapsed match seconds */
  clockSec?: number
  score?: [number, number]
  corners?: [number, number]
  events?: MatchEvent[]
  /** expected goals per 90 for home / away */
  xg: [number, number]
}

export const matchSeeds: MatchSeed[] = [
  // ---- Live (4)
  {
    id: 'har-red', compId: 'epl', home: 'harrowgate', away: 'redfield', kickoffIn: -63, clockSec: 62 * 60 + 18,
    score: [1, 1], corners: [4, 3], xg: [1.55, 1.25],
    events: [
      { minute: 18, type: 'goal', side: 0, player: 'E. Cardle' },
      { minute: 34, type: 'yellow', side: 1, player: 'T. Halvard' },
      { minute: 51, type: 'goal', side: 1, player: 'K. Ambrose-Lyle' },
    ],
  },
  {
    id: 'aur-tor', compId: 'laliga', home: 'aurelia', away: 'torrenza', kickoffIn: -27, clockSec: 26 * 60 + 40,
    score: [0, 0], corners: [2, 1], xg: [1.45, 1.05], events: [{ minute: 22, type: 'yellow', side: 0, player: 'M. Corvesi' }],
  },
  {
    id: 'elb-dor', compId: 'bundesliga', home: 'elbstadt', away: 'dornbach', kickoffIn: -71, clockSec: 70 * 60 + 5,
    score: [2, 1], corners: [6, 4], xg: [1.7, 1.5],
    events: [
      { minute: 9, type: 'goal', side: 0, player: 'J. Wendrich' },
      { minute: 40, type: 'goal', side: 1, player: 'T. Ziemer' },
      { minute: 44, type: 'yellow', side: 1, player: 'L. Haubrecht' },
      { minute: 58, type: 'yellow', side: 0, player: 'N. Brakow' },
      { minute: 66, type: 'goal', side: 0, player: 'F. Oberlaus' },
    ],
  },
  {
    id: 'kin-cas', compId: 'ucl', home: 'kingsmere', away: 'castellar', kickoffIn: -41, clockSec: 40 * 60 + 30,
    score: [0, 1], corners: [3, 2], xg: [1.3, 1.6], events: [{ minute: 29, type: 'goal', side: 1, player: 'I. Morvedra' }],
  },
  // ---- Upcoming (6)
  { id: 'var-mon', compId: 'ucl', home: 'varena', away: 'montalbo', kickoffIn: 4, xg: [1.6, 1.0] },
  { id: 'ash-bla', compId: 'epl', home: 'ashcombe', away: 'blackwater', kickoffIn: 38, xg: [1.35, 1.3] },
  { id: 'cal-mtf', compId: 'seriea', home: 'calanne', away: 'montefiore', kickoffIn: 110, xg: [1.2, 1.15] },
  { id: 'rhe-kal', compId: 'seriea', home: 'rheinau', away: 'kalberg', kickoffIn: 180, xg: [1.75, 1.4] },
  { id: 'fen-alb', compId: 'ucl', home: 'fenwick', away: 'albera', kickoffIn: 60 * 22, xg: [1.5, 1.2] },
  { id: 'sal-cor', compId: 'primeira', home: 'salvara', away: 'corvera', kickoffIn: 60 * 26, xg: [1.25, 1.1] },
]

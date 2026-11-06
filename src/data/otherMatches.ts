// Seed events for the other sports. All participants are fictional.
import type { CricketState, SportId, TennisState } from '../engine/types'

export interface OtherSeed {
  id: string
  sport: SportId
  compId: string
  home: string
  away: string
  kickoffIn: number // minutes from now (negative = live)
  clockSec?: number
  score?: [number, number]
  /** per-game scoring rate home/away; MMA & tennis: [win probability of home, 0] */
  rate: [number, number]
  cricket?: CricketState
  tennis?: TennisState
}

export const otherSeeds: OtherSeed[] = [
  // Basketball — 4 x 12 min
  { id: 'cbc-ivf', sport: 'basketball', compId: 'nba', home: 'calder', away: 'ironvale', kickoffIn: -60, clockSec: 2 * 720 + 258, score: [78, 71], rate: [114, 109] },
  { id: 'sun-pwt', sport: 'basketball', compId: 'nba', home: 'sunmere', away: 'portwell', kickoffIn: -12, clockSec: 530, score: [14, 19], rate: [108, 112] },
  { id: 'gpr-lsl', sport: 'basketball', compId: 'nba', home: 'granite', away: 'lakeshore', kickoffIn: 55, rate: [111, 106] },
  { id: 'bwo-ccv', sport: 'basketball', compId: 'nba', home: 'brightwater', away: 'corran', kickoffIn: 240, rate: [107, 113] },
  // American football — 4 x 15 min
  { id: 'kbk-ibm', sport: 'americanfootball', compId: 'nfl', home: 'kestrel', away: 'ironbridge', kickoffIn: -40, clockSec: 900 + 346, score: [10, 7], rate: [24, 21] },
  { id: 'del-cas', sport: 'americanfootball', compId: 'nfl', home: 'delmont', away: 'cascade', kickoffIn: -95, clockSec: 2700 + 630, score: [20, 23], rate: [22, 23] },
  { id: 'ngs-rbb', sport: 'americanfootball', compId: 'nfl', home: 'northgate', away: 'riverbend', kickoffIn: 90, rate: [25, 20] },
  { id: 'smh-cww', sport: 'americanfootball', compId: 'nfl', home: 'saltmarsh', away: 'coldwater', kickoffIn: 60 * 20, rate: [21, 22] },
  // Baseball — clock counts outs (54 per game)
  { id: 'pco-mfm', sport: 'baseball', compId: 'mlb', home: 'pinecrest', away: 'marlowe', kickoffIn: -70, clockSec: 31, score: [2, 3], rate: [4.4, 4.8] },
  { id: 'epa-scc', sport: 'baseball', compId: 'mlb', home: 'eastport', away: 'sandcastle', kickoffIn: -20, clockSec: 11, score: [1, 0], rate: [4.6, 4.2] },
  { id: 'rsb-bwh', sport: 'baseball', compId: 'mlb', home: 'redstone', away: 'bluewater', kickoffIn: 25, rate: [4.5, 4.5] },
  { id: 'fhl-iwh', sport: 'baseball', compId: 'mlb', home: 'fairhaven', away: 'ironwood', kickoffIn: 200, rate: [4.1, 4.9] },
  // Ice hockey — 3 x 20 min
  { id: 'frl-gps', sport: 'icehockey', compId: 'nhl', home: 'frostholm', away: 'glacier', kickoffIn: -45, clockSec: 1200 + 460, score: [1, 1], rate: [3.2, 2.9] },
  { id: 'nsw-bmp', sport: 'icehockey', compId: 'nhl', home: 'northshire', away: 'baymouth', kickoffIn: -6, clockSec: 300, score: [0, 0], rate: [3.0, 3.3] },
  { id: 'hdr-cfm', sport: 'icehockey', compId: 'nhl', home: 'halden', away: 'copperfield', kickoffIn: 70, rate: [3.1, 3.0] },
  { id: 'ago-lps', sport: 'icehockey', compId: 'nhl', home: 'ashgrove', away: 'lakeport', kickoffIn: 300, rate: [2.8, 3.4] },
  // Cricket — T20, home bats first
  { id: 'scc-mnr', sport: 'cricket', compId: 't20', home: 'saffron', away: 'monsoon', kickoffIn: -110, score: [171, 98], rate: [168, 172], cricket: { inn: 1, wk: [6, 3], balls: [120, 68] } },
  { id: 'bcb-sbf', sport: 'cricket', compId: 't20', home: 'banyan', away: 'seabreeze', kickoffIn: -25, score: [54, 0], rate: [170, 165], cricket: { inn: 0, wk: [1, 0], balls: [38, 0] } },
  { id: 'tgt-rer', sport: 'cricket', compId: 't20', home: 'teagarden', away: 'redearth', kickoffIn: 45, rate: [166, 169] },
  // MMA — 3 x 5 min rounds
  { id: 'mor-okh', sport: 'mma', compId: 'ufc', home: 'morcaster', away: 'okonkwehale', kickoffIn: -7, clockSec: 400, rate: [0.58, 0] },
  { id: 'saa-tal', sport: 'mma', compId: 'ufc', home: 'saalberg', away: 'talverde', kickoffIn: 35, rate: [0.45, 0] },
  { id: 'wrn-qui', sport: 'mma', compId: 'ufc', home: 'wrenhollow', away: 'quillen', kickoffIn: 80, rate: [0.62, 0] },
  // Tennis — best of 3 sets; rate[0] = home game-win probability
  { id: 'var-str', sport: 'tennis', compId: 'atp', home: 'varenne', away: 'strand', kickoffIn: -50, score: [1, 0], rate: [0.53, 0], tennis: { sets: [1, 0], games: [2, 3], done: [[6, 4]], server: 0 } },
  { id: 'cor-nor', sport: 'tennis', compId: 'atp', home: 'corvaro', away: 'northam', kickoffIn: -30, score: [0, 0], rate: [0.5, 0], tennis: { sets: [0, 0], games: [4, 4], done: [], server: 1 } },
  { id: 'hav-val', sport: 'tennis', compId: 'atp', home: 'haverkamp', away: 'valich', kickoffIn: 50, rate: [0.51, 0] },
]

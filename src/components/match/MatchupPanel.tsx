import { Activity, ArrowUpRight, Sparkles } from 'lucide-react'
import type { Market, Match, SportId } from '../../engine/types'
import { teams } from '../../data/teams'
import { Crest } from '../ui'

const photoSets: Partial<Record<SportId, [string, string]>> = {
  // Representative stock photography: the named athletes in this prototype are fictional.
  tennis: [
    'https://images.pexels.com/photos/10340629/pexels-photo-10340629.jpeg?auto=compress&cs=tinysrgb&w=720',
    'https://images.pexels.com/photos/36400163/pexels-photo-36400163.jpeg?auto=compress&cs=tinysrgb&w=720',
  ],
  mma: [
    'https://images.pexels.com/photos/6295969/pexels-photo-6295969.jpeg?auto=compress&cs=tinysrgb&w=720',
    'https://images.pexels.com/photos/14845615/pexels-photo-14845615.jpeg?auto=compress&cs=tinysrgb&w=720',
  ],
}

const tennisDetails = [
  { age: 26, height: '1.84 m', hand: 'Right-handed', country: 'France', rank: '#18', record: '24–12' },
  { age: 24, height: '1.88 m', hand: 'Right-handed', country: 'Germany', rank: '#27', record: '21–14' },
  { age: 29, height: '1.81 m', hand: 'Left-handed', country: 'Italy', rank: '#34', record: '19–11' },
  { age: 23, height: '1.90 m', hand: 'Right-handed', country: 'Sweden', rank: '#41', record: '17–10' },
  { age: 28, height: '1.86 m', hand: 'Right-handed', country: 'Netherlands', rank: '#22', record: '22–13' },
  { age: 25, height: '1.83 m', hand: 'Left-handed', country: 'Croatia', rank: '#38', record: '18–12' },
]
const mmaDetails = [
  { age: 29, height: '1.78 m', reach: '1.83 m', country: 'Ireland', record: '14–3', division: 'Lightweight' },
  { age: 31, height: '1.85 m', reach: '1.91 m', country: 'United States', record: '18–5', division: 'Welterweight' },
  { age: 27, height: '1.80 m', reach: '1.86 m', country: 'Sweden', record: '12–2', division: 'Lightweight' },
  { age: 30, height: '1.88 m', reach: '1.94 m', country: 'Spain', record: '16–4', division: 'Middleweight' },
  { age: 26, height: '1.76 m', reach: '1.79 m', country: 'Japan', record: '11–1', division: 'Featherweight' },
  { age: 28, height: '1.82 m', reach: '1.89 m', country: 'Brazil', record: '15–3', division: 'Lightweight' },
]

function seedFor(value: string) {
  return [...value].reduce((seed, char) => (seed * 31 + char.charCodeAt(0)) >>> 0, 7)
}

function individualProfile(match: Match, id: string, side: 0 | 1) {
  const team = teams[id]
  const seed = seedFor(id)
  const order = Object.keys(teams).indexOf(id)
  const details = match.sport === 'tennis' ? tennisDetails[order % tennisDetails.length] : mmaDetails[order % mmaDetails.length]
  const stats = match.sport === 'tennis'
    ? [
        { label: 'World rank', value: tennisDetails[order % tennisDetails.length].rank },
        { label: 'Season W–L', value: details.record },
        { label: 'Aces / match', value: `${7 + (seed % 8)}.${seed % 10}` },
        { label: '1st serve points won', value: `${62 + (seed % 10)}%` },
      ]
    : [
        { label: 'Pro record', value: details.record },
        { label: 'Win by KO/TKO', value: `${35 + (seed % 36)}%` },
        { label: 'Reach', value: mmaDetails[order % mmaDetails.length].reach },
        { label: 'Weight class', value: mmaDetails[order % mmaDetails.length].division },
      ]
  return { id, name: team.name, team, seed, side, details, stats, sport: match.sport, photo: photoSets[match.sport]?.[side] }
}

function MetricRows({ values, align }: { values: { label: string; value: string }[]; align: 'left' | 'right' }) {
  return <dl className="mt-3 grid gap-1.5">
    {values.map((item) => <div key={item.label} className="flex items-center justify-between gap-2 rounded-lg bg-black/10 px-2.5 py-1.5">
      {align === 'left' ? <><dt className="truncate text-[10px] text-white/65">{item.label}</dt><dd className="tnum shrink-0 text-[11px] font-extrabold text-white">{item.value}</dd></> : <><dd className="tnum shrink-0 text-[11px] font-extrabold text-white">{item.value}</dd><dt className="truncate text-[10px] text-white/65">{item.label}</dt></>}
    </div>)}
  </dl>
}

function IndividualCard({ player, align }: { player: ReturnType<typeof individualProfile>; align: 'left' | 'right' }) {
  const right = align === 'right'
  const identity = player.details
  return <article className={`min-w-0 ${right ? 'text-right' : 'text-left'}`}>
    <div className={`flex items-center gap-3 ${right ? 'flex-row-reverse' : ''}`}>
      <img src={player.photo} alt={`Representative ${player.team.name} athlete portrait`} loading="lazy" decoding="async" className="faceoff-portrait h-[90px] w-[76px] shrink-0 rounded-[15px] border border-white/15 object-cover shadow-lg sm:h-[142px] sm:w-[116px]" />
      <div className="min-w-0">
        <p className="text-[9px] font-extrabold uppercase tracking-[.13em] text-white/55">{player.team.short} · {player.team.name}</p>
        <h3 className="mt-1 truncate text-[15px] font-black text-white sm:text-[18px]">{player.name}</h3>
        <p className="mt-1 text-[10px] font-semibold text-white/65">Age {identity.age} · {identity.height}</p>
        <p className="mt-0.5 truncate text-[10px] text-white/60">{identity.country} · {matchSportLabel(player)}</p>
      </div>
    </div>
    <MetricRows values={player.stats} align={align} />
  </article>
}

function matchSportLabel(player: ReturnType<typeof individualProfile>) {
  if (player.sport === 'tennis') return 'Singles · demo profile'
  return 'Fighter · demo profile'
}

function teamMetrics(match: Match, side: 0 | 1) {
  if (match.sport === 'football') {
    const cards = match.events.filter((event) => event.side === side && (event.type === 'yellow' || event.type === 'red')).length
    return [
      { label: 'Score', value: String(match.score[side]) },
      { label: 'Expected goals', value: match.xg[side].toFixed(2) },
      { label: 'Corners', value: String(match.corners[side]) },
      { label: 'Cards', value: String(cards) },
    ]
  }
  if (match.sport === 'cricket') {
    const balls = match.cricket?.balls[side] ?? 0
    const overs = `${Math.floor(balls / 6)}.${balls % 6}`
    const wickets = match.cricket?.wk[side] ?? 0
    return [
      { label: 'Runs', value: String(match.score[side]) },
      { label: 'Wickets', value: String(wickets) },
      { label: 'Overs', value: overs },
      { label: 'Run rate', value: balls ? (match.score[side] / (balls / 6)).toFixed(2) : '—' },
    ]
  }
  const sportWord: Partial<Record<SportId, string>> = { basketball: 'Points', americanfootball: 'Points', baseball: 'Runs', icehockey: 'Goals' }
  const metric = sportWord[match.sport] ?? 'Score'
  return [
    { label: metric, value: String(match.score[side]) },
    { label: `Model ${metric.toLowerCase()}`, value: match.xg[side].toFixed(1) },
    { label: 'Match state', value: match.status === 'live' ? 'In play' : match.status === 'ft' ? 'Final' : 'Upcoming' },
  ]
}

function TeamCard({ id, match, side, align }: { id: string; match: Match; side: 0 | 1; align: 'left' | 'right' }) {
  const team = teams[id]
  const right = align === 'right'
  const values = teamMetrics(match, side)
  return <article className={`min-w-0 ${right ? 'text-right' : 'text-left'}`}>
    <div className={`flex items-center gap-3 ${right ? 'flex-row-reverse' : ''}`}>
      <div className="grid h-[74px] w-[74px] shrink-0 place-items-center rounded-[18px] border border-white/15 bg-white/[.08] shadow-lg sm:h-[112px] sm:w-[112px]">
        <Crest id={id} size={78} className="!h-[54px] !w-[54px] sm:!h-[78px] sm:!w-[78px]" />
      </div>
      <div className="min-w-0">
        <p className="text-[9px] font-extrabold uppercase tracking-[.13em] text-white/55">Team snapshot</p>
        <h3 className="mt-1 line-clamp-2 text-[15px] font-black text-white sm:text-[19px]">{team.name}</h3>
        <p className="mt-1 text-[10px] font-semibold text-white/65">Match snapshot · demo</p>
        <p className="mt-1 text-[10px] font-bold text-white/55">{match.status === 'live' ? 'CURRENT MATCH' : 'MATCH PREVIEW'}</p>
      </div>
    </div>
    <MetricRows values={values} align={align} />
  </article>
}

export function MatchupPanel({ match, market }: { match: Match; market?: Market }) {
  const individual = match.sport === 'tennis' || match.sport === 'mma'
  const homeTeam = teams[match.home]
  const awayTeam = teams[match.away]
  const home = individual ? individualProfile(match, match.home, 0) : homeTeam
  const away = individual ? individualProfile(match, match.away, 1) : awayTeam
  const implied = market?.selections.map((selection) => 1 / Math.max(1.01, selection.odds)) ?? [0.5, 0.5]
  const total = implied.reduce((sum, value) => sum + value, 0) || 1
  const probabilities = implied.map((value) => value / total)
  const twoWay = probabilities.length === 2
  const homeChance = probabilities[0] ?? .5
  const drawChance = twoWay ? 0 : probabilities[1] ?? 0
  const awayChance = twoWay ? probabilities[1] ?? .5 : probabilities[probabilities.length - 1] ?? .5
  const favored = homeChance >= awayChance ? homeTeam : awayTeam
  const subject = individual ? 'Player face-off' : 'Team face-off'

  return (
    <section aria-labelledby="matchup-title" className="faceoff-enter overflow-hidden rounded-[20px] border border-line bg-card shadow-raised">
      <header className="flex items-center justify-between gap-3 border-b border-line px-4 py-4 sm:px-5">
        <div className="flex items-center gap-2.5"><span className="grid h-9 w-9 place-items-center rounded-xl bg-brand/10 text-brand"><Sparkles size={17} /></span><div><h2 id="matchup-title" className="text-[16px] font-extrabold">{subject}</h2><p className="text-[11px] text-muted">Head-to-head · demo match data</p></div></div>
        <span className="rounded-full bg-sunk px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-wider text-muted">Demo data</span>
      </header>

      <div className="relative overflow-hidden bg-[#07141D] p-4 sm:p-5">
        <div className="pointer-events-none absolute inset-0 opacity-25" style={{ background: `radial-gradient(ellipse at 0% 45%, ${homeTeam.primary} 0, transparent 44%), radial-gradient(ellipse at 100% 45%, ${awayTeam.primary} 0, transparent 44%)` }} />
        <div className="relative grid grid-cols-[1fr_auto_1fr] items-start gap-2 sm:gap-5">
          {individual ? <IndividualCard player={home as ReturnType<typeof individualProfile>} align="left" /> : <TeamCard id={match.home} match={match} side={0} align="left" />}
          <div className="faceoff-versus mt-7 grid h-9 w-9 place-items-center rounded-full border border-white/15 bg-white/10 text-[10px] font-black text-white/80 sm:mt-12 sm:h-11 sm:w-11">VS</div>
          {individual ? <IndividualCard player={away as ReturnType<typeof individualProfile>} align="right" /> : <TeamCard id={match.away} match={match} side={1} align="right" />}
        </div>
      </div>

      <div className="p-4 sm:p-5">
        <div className="flex items-center justify-between gap-2"><div><p className="text-[10px] font-extrabold uppercase tracking-[.15em] text-brand">Face-off result</p><h3 className="mt-0.5 text-[14px] font-extrabold">Demo market lean: {favored.name}</h3></div><ArrowUpRight size={17} className="text-muted" aria-hidden="true" /></div>
        <div className="mt-3 grid grid-cols-[1fr_auto_1fr] items-end gap-3">
          <div><p className="tnum text-[23px] font-black text-ink">{Math.round(homeChance * 100)}<span className="text-[13px]">%</span></p><p className="truncate text-[10px] font-bold text-muted">{homeTeam.name}</p></div>
          {twoWay ? <span className="pb-2 text-[10px] font-bold text-muted">VS</span> : <div className="pb-0.5 text-center"><p className="tnum text-[15px] font-extrabold text-muted">{Math.round(drawChance * 100)}%</p><p className="text-[9px] font-bold uppercase text-muted">Draw</p></div>}
          <div className="text-right"><p className="tnum text-[23px] font-black text-ink">{Math.round(awayChance * 100)}<span className="text-[13px]">%</span></p><p className="truncate text-[10px] font-bold text-muted">{awayTeam.name}</p></div>
        </div>
        <div className="mt-2 flex h-2 overflow-hidden rounded-full bg-sunk" aria-label={`Implied market probability: ${Math.round(homeChance * 100)} percent ${homeTeam.name}, ${Math.round(drawChance * 100)} percent draw, ${Math.round(awayChance * 100)} percent ${awayTeam.name}`}>
          <div className="faceoff-bar bg-brand" style={{ width: `${homeChance * 100}%` }} /><div className="faceoff-bar bg-muted/40" style={{ width: `${drawChance * 100}%` }} /><div className="faceoff-bar bg-accent" style={{ width: `${awayChance * 100}%` }} />
        </div>
        <p className="mt-2 text-[10px] leading-relaxed text-muted">{individual ? 'Illustrative profile details and stock athlete photos; participant names and records are fictional demo data.' : 'Team crests identify the clubs. Match facts are simulated for this prototype, not live or official statistics.'} Market percentages are calculated from the displayed demo odds.</p>
        {individual && <p className="mt-1 flex items-center gap-1 text-[9px] text-muted"><Activity size={10} /> Representative athlete photography · <a href="https://www.pexels.com/license/" target="_blank" rel="noreferrer" className="underline underline-offset-2">Pexels license</a></p>}
      </div>
    </section>
  )
}

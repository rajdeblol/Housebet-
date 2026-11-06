import { Activity, ArrowUpRight, Sparkles } from 'lucide-react'
import type { Market, Match } from '../../engine/types'
import { teams } from '../../data/teams'

const firstNames = ['Jordan', 'Kai', 'Tate', 'Evan', 'Noah', 'Rory', 'Ari', 'Milan', 'Drew', 'Luca', 'Micah', 'Theo']
const lastNames = ['Vale', 'Mercer', 'Rivers', 'Bennett', 'Santos', 'Morrow', 'Ellis', 'Hayes', 'Brooks', 'Reed', 'Foster', 'Cole']
const sportsTerms: Record<Match['sport'], string[]> = {
  football: ['Goals', 'Assists', 'Shots on target'], basketball: ['Points / game', 'Rebounds', 'Assists'],
  americanfootball: ['Touchdowns', 'Pass yards', 'Tackles'], baseball: ['Batting avg.', 'Home runs', 'RBIs'],
  icehockey: ['Goals', 'Assists', 'Shots'], cricket: ['Runs', 'Strike rate', 'Boundaries'],
  tennis: ['Ranking', 'Aces / match', 'First serve'], mma: ['Wins', 'KO rate', 'Reach'],
}

function seedFor(value: string) {
  return [...value].reduce((seed, char) => (seed * 31 + char.charCodeAt(0)) >>> 0, 7)
}

function playerFor(match: Match, id: string, side: 0 | 1) {
  const team = teams[id]
  const individual = match.sport === 'tennis' || match.sport === 'mma'
  const seed = seedFor(id)
  const name = individual ? team.name : team.players[0] || `${firstNames[seed % firstNames.length]} ${lastNames[(seed >>> 3) % lastNames.length]}`
  const stats = sportsTerms[match.sport].map((label, index) => {
    const n = seedFor(`${id}-${index}-${match.sport}`)
    const value = match.sport === 'tennis'
      ? index === 0 ? `#${(n % 75) + 8}` : index === 1 ? `${(n % 8) + 2}.4` : `${58 + n % 13}%`
      : match.sport === 'mma'
        ? index === 0 ? `${(n % 14) + 8}–${(n % 5) + 1}` : index === 1 ? `${35 + n % 50}%` : `${66 + n % 17} in`
        : match.sport === 'cricket'
          ? index === 0 ? `${(n % 800) + 180}` : index === 1 ? `${(n % 75) + 110}` : `${(n % 45) + 18}`
          : match.sport === 'basketball'
            ? index === 0 ? `${(n % 17) + 11}.${n % 10}` : `${(n % 7) + 3}.${n % 10}`
            : match.sport === 'americanfootball'
              ? index === 0 ? `${(n % 18) + 4}` : `${(n % 2800) + 900}`
              : match.sport === 'baseball'
                ? index === 0 ? `.${(n % 150) + 190}` : `${(n % 24) + 4}`
                : `${(n % 13) + 3}`
    return { label, value }
  })
  const form = (seed >>> 7) % 5
  return { id, name, team, individual, sport: match.sport, seed, stats, form, side }
}

function PlayerPortrait({ seed, primary, secondary }: { seed: number; primary: string; secondary: string }) {
  const skin = ['#C8865E', '#E4AE83', '#9C5F43', '#F0C7A3', '#734632'][seed % 5]
  const hair = ['#211B19', '#39271E', '#17191D', '#5B3824', '#D0A15F'][(seed >>> 2) % 5]
  const hairStyle = (seed >>> 5) % 3
  return (
    <svg viewBox="0 0 120 132" className="h-full w-full" role="img" aria-label="Illustrated demo player portrait">
      <defs>
        <linearGradient id={`portrait-bg-${seed}`} x1="0" y1="0" x2="1" y2="1"><stop stopColor={primary} /><stop offset="1" stopColor={secondary} /></linearGradient>
        <linearGradient id={`portrait-shine-${seed}`} x1="0" y1="0" x2="0.9" y2="1"><stop stopColor="#fff" stopOpacity=".18" /><stop offset="1" stopColor="#fff" stopOpacity="0" /></linearGradient>
      </defs>
      <rect width="120" height="132" rx="18" fill={`url(#portrait-bg-${seed})`} />
      <circle cx="96" cy="23" r="32" fill="#fff" opacity=".08" />
      <path d="M10 132c3-30 18-43 50-43s47 13 50 43" fill={primary} />
      <path d="M40 92l20 18 20-18-8-11H48z" fill={skin} />
      <path d="M35 47c0-21 11-32 26-32s25 11 25 32v17c0 18-12 30-26 30S35 82 35 64z" fill={skin} />
      <path d={hairStyle === 0 ? 'M33 54C27 28 39 12 61 12c23 0 31 17 25 41l-8-13c-14 2-25-2-34-9-2 9-5 16-11 23z' : hairStyle === 1 ? 'M34 54C26 29 39 10 61 12c22 2 30 18 24 40l-8-6-2-15c-12 7-25 7-38 2l-1 16z' : 'M33 53C27 26 43 10 64 13c22 3 28 22 20 42l-6-9c-14 3-28-1-38-9l-2 16z'} fill={hair} />
      <path d="M45 60h8m14 0h8" stroke="#35241D" strokeWidth="3" strokeLinecap="round" />
      <circle cx="49" cy="65" r="2" fill="#171717" /><circle cx="72" cy="65" r="2" fill="#171717" />
      <path d="M60 66l-3 12 6 1m-10 7c5 4 12 4 17 0" fill="none" stroke="#8B4D3D" strokeWidth="2" strokeLinecap="round" />
      <path d="M10 132c3-30 18-43 50-43s47 13 50 43" fill={`url(#portrait-shine-${seed})`} />
    </svg>
  )
}

function PlayerCard({ player, score, align }: { player: ReturnType<typeof playerFor>; score: number; align: 'left' | 'right' }) {
  const alignment = align === 'left' ? 'text-center sm:text-left' : 'text-center sm:text-right'
  const role = player.individual ? (player.sport === 'mma' ? 'Fighter' : 'Singles player') : 'Key player · demo profile'
  return (
    <article className={`min-w-0 ${alignment}`}>
      <div className={`flex flex-col items-center gap-2 sm:items-end sm:gap-3 ${align === 'left' ? 'sm:flex-row' : 'sm:flex-row-reverse'}`}>
        <div className="faceoff-portrait h-[82px] w-[68px] shrink-0 overflow-hidden rounded-[16px] border border-white/15 shadow-lg sm:h-[132px] sm:w-[112px]">
          <PlayerPortrait seed={player.seed} primary={player.team.primary} secondary={player.team.secondary} />
        </div>
        <div className={`min-w-0 pb-1 ${alignment}`}>
          <p className="truncate text-[15px] font-black text-white sm:text-[18px]">{player.name}</p>
          <p className="mt-0.5 truncate text-[10px] font-bold uppercase tracking-[.12em] text-white/65">{role}</p>
          <p className="mt-2 inline-flex items-center gap-1 rounded-lg bg-black/20 px-2 py-1 text-[10px] font-bold text-white/80"><Activity size={11} /> {player.team.short} form {player.form + 1}/5</p>
        </div>
      </div>
      <dl className="mt-3 grid gap-1.5">
        {player.stats.map((stat, index) => <div key={stat.label} className={`flex items-center justify-between gap-2 rounded-lg px-2.5 py-1.5 ${index === 0 && score > .5 ? 'bg-white/10' : 'bg-black/10'}`}>
          {align === 'left' ? <><dt className="truncate text-[10px] text-white/65">{stat.label}</dt><dd className="tnum shrink-0 text-[11px] font-extrabold text-white">{stat.value}</dd></> : <><dd className="tnum shrink-0 text-[11px] font-extrabold text-white">{stat.value}</dd><dt className="truncate text-[10px] text-white/65">{stat.label}</dt></>}
        </div>)}
      </dl>
    </article>
  )
}

export function MatchupPanel({ match, market }: { match: Match; market?: Market }) {
  const home = playerFor(match, match.home, 0)
  const away = playerFor(match, match.away, 1)
  const implied = market?.selections.map((selection) => 1 / Math.max(1.01, selection.odds)) ?? [0.5, 0.5]
  const total = implied.reduce((sum, value) => sum + value, 0) || 1
  const probabilities = implied.map((value) => value / total)
  const twoWay = probabilities.length === 2
  const homeChance = probabilities[0] ?? .5
  const drawChance = twoWay ? 0 : probabilities[1] ?? 0
  const awayChance = twoWay ? probabilities[1] ?? .5 : probabilities[probabilities.length - 1] ?? .5
  const favored = homeChance >= awayChance ? home : away

  return (
    <section aria-labelledby="matchup-title" className="faceoff-enter overflow-hidden rounded-[20px] border border-line bg-card shadow-raised">
      <header className="flex items-center justify-between gap-3 border-b border-line px-4 py-4 sm:px-5">
        <div className="flex items-center gap-2.5"><span className="grid h-9 w-9 place-items-center rounded-xl bg-brand/10 text-brand"><Sparkles size={17} /></span><div><h2 id="matchup-title" className="text-[16px] font-extrabold">Player face-off</h2><p className="text-[11px] text-muted">Head-to-head · simulated profiles</p></div></div>
        <span className="rounded-full bg-sunk px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-wider text-muted">Demo data</span>
      </header>

      <div className="relative overflow-hidden bg-[#07141D] p-4 sm:p-5">
        <div className="pointer-events-none absolute inset-0 opacity-25" style={{ background: `radial-gradient(ellipse at 0% 45%, ${home.team.primary} 0, transparent 44%), radial-gradient(ellipse at 100% 45%, ${away.team.primary} 0, transparent 44%)` }} />
        <div className="relative grid grid-cols-[1fr_auto_1fr] items-start gap-2 sm:gap-5">
          <PlayerCard player={home} score={homeChance} align="left" />
          <div className="faceoff-versus mt-10 grid h-9 w-9 place-items-center rounded-full border border-white/15 bg-white/10 text-[10px] font-black text-white/80 sm:mt-12 sm:h-11 sm:w-11">VS</div>
          <PlayerCard player={away} score={awayChance} align="right" />
        </div>
      </div>

      <div className="p-4 sm:p-5">
        <div className="flex items-center justify-between gap-2"><div><p className="text-[10px] font-extrabold uppercase tracking-[.15em] text-brand">Face-off result</p><h3 className="mt-0.5 text-[14px] font-extrabold">Demo market lean: {favored.name}</h3></div><ArrowUpRight size={17} className="text-muted" aria-hidden="true" /></div>
        <div className="mt-3 grid grid-cols-[1fr_auto_1fr] items-end gap-3">
          <div><p className="tnum text-[23px] font-black text-ink">{Math.round(homeChance * 100)}<span className="text-[13px]">%</span></p><p className="truncate text-[10px] font-bold text-muted">{home.team.name}</p></div>
          {twoWay ? <span className="pb-2 text-[10px] font-bold text-muted">VS</span> : <div className="pb-0.5 text-center"><p className="tnum text-[15px] font-extrabold text-muted">{Math.round(drawChance * 100)}%</p><p className="text-[9px] font-bold uppercase text-muted">Draw</p></div>}
          <div className="text-right"><p className="tnum text-[23px] font-black text-ink">{Math.round(awayChance * 100)}<span className="text-[13px]">%</span></p><p className="truncate text-[10px] font-bold text-muted">{away.team.name}</p></div>
        </div>
        <div className="mt-2 flex h-2 overflow-hidden rounded-full bg-sunk" aria-label={`Implied market probability: ${Math.round(homeChance * 100)} percent ${home.team.name}, ${Math.round(drawChance * 100)} percent draw, ${Math.round(awayChance * 100)} percent ${away.team.name}`}>
          <div className="faceoff-bar bg-brand" style={{ width: `${homeChance * 100}%` }} /><div className="faceoff-bar bg-muted/40" style={{ width: `${drawChance * 100}%` }} /><div className="faceoff-bar bg-accent" style={{ width: `${awayChance * 100}%` }} />
        </div>
        <p className="mt-2 text-[10px] leading-relaxed text-muted">Illustrative stats and implied probabilities are generated for this prototype; they are not official player records or predictions.</p>
      </div>
    </section>
  )
}

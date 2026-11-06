import { ArrowRight, Clock, Star, Trophy } from 'lucide-react'
import { useMemo } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { compById, competitions, sportById, sportPath, sports } from '../data/competitions'
import { teams } from '../data/teams'
import { MatchRow } from '../components/MatchRow'
import { Crest, FollowButton, LiveDot, SectionHeader } from '../components/ui'
import { WaveBanner } from '../components/WaveBanner'
import { useStore } from '../engine/store'
import { cx, kickoffLabel } from '../lib/format'
import { scoreText, statusShort } from '../lib/sport'

export function SportsNav() {
  const matches = useStore((s) => s.matches)
  return (
    <nav aria-label="Sports" className="no-scrollbar -mx-4 mb-6 flex gap-2 overflow-x-auto px-4 lg:hidden">
      {sports.map((sp) => {
        const liveN = Object.values(matches).filter((m) => m.sport === sp.id && m.status === 'live').length
        return (
          <NavLink key={sp.id} to={sportPath(sp.id)}
            className={({ isActive }) => cx('flex h-10 shrink-0 items-center gap-2 rounded-full border px-3.5 text-[13px] font-semibold transition-colors', isActive ? 'border-ink bg-ink text-white' : 'border-line bg-card text-ink')}>
            {sp.name}
            {liveN > 0 && <span className="inline-flex items-center gap-1 text-[11px] font-bold"><LiveDot /> <span className="tnum">{liveN}</span></span>}
          </NavLink>
        )
      })}
    </nav>
  )
}

function FollowedShelf() {
  const follows = useStore((s) => s.follows)
  const matches = useStore((s) => s.matches)
  const now = useStore((s) => s.now)
  const empty = follows.teams.length + follows.comps.length === 0
  if (empty) return null

  const nextFor = (teamId: string) =>
    Object.values(matches).filter((m) => m.status !== 'ft' && (m.home === teamId || m.away === teamId)).sort((a, b) => a.kickoff - b.kickoff)[0]

  return (
    <section className="mb-8" aria-labelledby="followed-h">
      <SectionHeader title={<span id="followed-h">Following</span>} icon={<Star size={17} fill="currentColor" aria-hidden="true" />} sub="Teams and competitions you follow, first." />
      <ul className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 pb-1">
        {follows.teams.map((tid) => {
          const t = teams[tid]
          const m = nextFor(tid)
          return (
            <li key={tid} className="w-[248px] shrink-0 rounded-lg border border-line bg-card p-3.5">
              <div className="flex items-center gap-2.5">
                <Crest id={tid} size={26} />
                <p className="min-w-0 flex-1 truncate font-bold">{t.name}</p>
                <FollowButton kind="teams" id={tid} label={t.name} />
              </div>
              {m ? (
                <Link to={`/match/${m.id}`} className="mt-3 block rounded-md bg-sunk px-3 py-2.5 hover:bg-line/60">
                  <p className="flex items-center justify-between text-[12px] font-semibold">
                    {m.status === 'live' ? <span className="inline-flex items-center gap-1.5 text-live"><LiveDot /> {statusShort(m)}</span> : <span className="text-muted">{kickoffLabel(m.kickoff, now)}</span>}
                    <span className="text-muted">{compById[m.compId].name}</span>
                  </p>
                  <p className="mt-1 flex items-center justify-between text-[14px] font-semibold">
                    <span className="truncate">{teams[m.home].short} v {teams[m.away].short}</span>
                    {m.status === 'live' && scoreText(m) && <span className="tnum text-[17px] font-extrabold">{scoreText(m)!.join('–')}</span>}
                  </p>
                </Link>
              ) : <p className="mt-3 text-[13px] text-muted">No fixtures in the next few days.</p>}
            </li>
          )
        })}
        {follows.comps.map((cid) => {
          const c = compById[cid]
          const n = Object.values(matches).filter((m) => m.compId === cid && m.status !== 'ft')
          const liveN = n.filter((m) => m.status === 'live').length
          return (
            <li key={cid} className="w-[248px] shrink-0 rounded-lg border border-line bg-card p-3.5">
              <div className="flex items-center gap-2.5">
                <span className="flex h-7 w-7 items-center justify-center rounded-md bg-ink text-white"><Trophy size={14} aria-hidden="true" /></span>
                <p className="min-w-0 flex-1 truncate font-bold">{c.name}</p>
                <FollowButton kind="comps" id={cid} label={c.name} />
              </div>
              <Link to={`${sportPath(c.sport)}#${cid}`} className="mt-3 flex items-center justify-between rounded-md bg-sunk px-3 py-2.5 text-[14px] font-semibold hover:bg-line/60">
                <span>{n.length} {n.length === 1 ? 'match' : 'matches'}{liveN > 0 && <span className="text-live"> · {liveN} live</span>}</span>
                <ArrowRight size={15} aria-hidden="true" />
              </Link>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

export function HomePage() {
  const matches = useStore((s) => s.matches)
  const { live, soon } = useMemo(() => {
    const all = Object.values(matches)
    return {
      live: all.filter((m) => m.status === 'live').sort((a, b) => sports.findIndex((x) => x.id === a.sport) - sports.findIndex((x) => x.id === b.sport)),
      soon: all.filter((m) => m.status === 'upcoming').sort((a, b) => a.kickoff - b.kickoff).slice(0, 6),
    }
  }, [matches])

  return (
    <div className="mx-auto max-w-[980px]">
      <h1 className="sr-only">Housebets Sportsbook Lobby</h1>
      
      {/* Housebets Wave 2 Hero Banner */}
      <WaveBanner />

      <SportsNav />
      <FollowedShelf />

      {/* Live In-Play Section (US / Probly Odds Matrix) */}
      <section className="mb-8" aria-labelledby="live-h">
        <SectionHeader
          title={<span id="live-h">Live In-Play Markets</span>}
          icon={<LiveDot />}
          right={<Link to="/live" className="inline-flex h-9 items-center gap-1 text-[13px] font-bold text-live hover:underline">All {live.length} live <ArrowRight size={14} aria-hidden="true" /></Link>}
        />
        {live.length ? (
          <div className="overflow-hidden rounded-xl border border-line bg-card shadow-xs">
            {/* US Sportsbook Column Header */}
            <div className="hidden grid-cols-[minmax(0,1fr)_288px] items-center border-b border-line bg-sunk/50 px-4 py-2 text-[11px] font-extrabold uppercase tracking-wider text-muted md:grid">
              <span>Match & Event</span>
              <div className="grid grid-cols-3 gap-2 text-center">
                <span>1 (Home)</span>
                <span>X (Draw)</span>
                <span>2 (Away)</span>
              </div>
            </div>
            <ul>
              {live.slice(0, 8).map((m) => <MatchRow key={m.id} id={m.id} showComp={compById[m.compId].short} />)}
            </ul>
          </div>
        ) : (
          <p className="rounded-xl border border-dashed border-line bg-card px-4 py-5 text-[14px] text-muted">Nothing is live right now. The next matches are below.</p>
        )}
      </section>

      {/* Starting Soon Section */}
      <section className="mb-8" aria-labelledby="soon-h">
        <SectionHeader title={<span id="soon-h">Upcoming Fixtures</span>} icon={<Clock size={17} aria-hidden="true" />}
          right={<Link to="/football" className="inline-flex h-9 items-center gap-1 text-[13px] font-semibold text-muted hover:text-ink">Football <ArrowRight size={14} aria-hidden="true" /></Link>} />
        <div className="overflow-hidden rounded-xl border border-line bg-card shadow-xs">
          <div className="hidden grid-cols-[minmax(0,1fr)_288px] items-center border-b border-line bg-sunk/50 px-4 py-2 text-[11px] font-extrabold uppercase tracking-wider text-muted md:grid">
            <span>Match & Event</span>
            <div className="grid grid-cols-3 gap-2 text-center">
              <span>1 (Home)</span>
              <span>X (Draw)</span>
              <span>2 (Away)</span>
            </div>
          </div>
          <ul>
            {soon.map((m) => <MatchRow key={m.id} id={m.id} showComp={compById[m.compId].short} />)}
          </ul>
        </div>
      </section>

      {/* Top Leagues */}
      <section aria-labelledby="comps-h">
        <SectionHeader title={<span id="comps-h">Top Competitions</span>} icon={<Trophy size={17} aria-hidden="true" />} />
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {competitions.map((c) => {
            const ms = Object.values(matches).filter((m) => m.compId === c.id && m.status !== 'ft')
            const liveN = ms.filter((m) => m.status === 'live').length
            return (
              <li key={c.id} className="flex items-center gap-2 rounded-lg border border-line bg-card p-2 pl-4 transition-colors hover:border-ink/40">
                <Link to={`${sportPath(c.sport)}#${c.id}`} className="min-w-0 flex-1 py-1.5">
                  <p className="truncate font-bold text-[14.5px]">{c.name}</p>
                  <p className="text-[12px] text-muted">{sportById[c.sport].name} · {ms.length} {ms.length === 1 ? 'match' : 'matches'}{liveN > 0 && <span className={cx('font-bold text-live')}> · {liveN} live</span>}</p>
                </Link>
                <FollowButton kind="comps" id={c.id} label={c.name} />
              </li>
            )
          })}
        </ul>
      </section>
    </div>
  )
}

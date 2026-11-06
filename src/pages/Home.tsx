import { ArrowRight, Clock, Star, Trophy } from 'lucide-react'
import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { compById, competitions, sports } from '../data/competitions'
import { teams } from '../data/teams'
import { MatchRow } from '../components/MatchRow'
import { Crest, FollowButton, LiveDot, SectionHeader } from '../components/ui'
import { useStore } from '../engine/store'
import { clockLabel, cx, kickoffLabel } from '../lib/format'

export function SportsNav() {
  return (
    <nav aria-label="Sports" className="no-scrollbar -mx-4 mb-6 flex gap-2 overflow-x-auto px-4 xl:hidden">
      {sports.map((s) =>
        s.enabled ? (
          <Link key={s.id} to="/football" className="flex h-11 shrink-0 items-center rounded-full bg-ink px-4 text-[14px] font-semibold text-white" aria-current="page">{s.name}</Link>
        ) : (
          <span key={s.id} aria-disabled="true" className="flex h-11 shrink-0 items-center gap-2 rounded-full border border-line px-4 text-[14px] text-muted">
            {s.name} <span className="text-[11px] font-semibold">Coming soon</span>
          </span>
        ),
      )}
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
            <li key={tid} className="w-[248px] shrink-0 rounded-m border border-line bg-card p-3.5">
              <div className="flex items-center gap-2.5">
                <Crest id={tid} size={26} />
                <p className="min-w-0 flex-1 truncate font-bold">{t.name}</p>
                <FollowButton kind="teams" id={tid} label={t.name} />
              </div>
              {m ? (
                <Link to={`/match/${m.id}`} className="mt-3 block rounded-s bg-sunk px-3 py-2.5 hover:bg-line/60">
                  <p className="flex items-center justify-between text-[12px] font-semibold">
                    {m.status === 'live' ? <span className="inline-flex items-center gap-1.5 text-live"><LiveDot /> Live {clockLabel(m)}</span> : <span className="text-muted">{kickoffLabel(m.kickoff, now)}</span>}
                    <span className="text-muted">{compById[m.compId].name}</span>
                  </p>
                  <p className="mt-1 flex items-center justify-between text-[14px] font-semibold">
                    <span className="truncate">{teams[m.home].short} v {teams[m.away].short}</span>
                    {m.status === 'live' && <span className="tnum text-[17px] font-extrabold">{m.score[0]}–{m.score[1]}</span>}
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
            <li key={cid} className="w-[248px] shrink-0 rounded-m border border-line bg-card p-3.5">
              <div className="flex items-center gap-2.5">
                <span className="flex h-7 w-7 items-center justify-center rounded-s bg-ink text-white"><Trophy size={14} aria-hidden="true" /></span>
                <p className="min-w-0 flex-1 truncate font-bold">{c.name}</p>
                <FollowButton kind="comps" id={cid} label={c.name} />
              </div>
              <Link to={`/football#${cid}`} className="mt-3 flex items-center justify-between rounded-s bg-sunk px-3 py-2.5 text-[14px] font-semibold hover:bg-line/60">
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
      live: all.filter((m) => m.status === 'live').sort((a, b) => b.clockSec - a.clockSec),
      soon: all.filter((m) => m.status === 'upcoming').sort((a, b) => a.kickoff - b.kickoff).slice(0, 4),
    }
  }, [matches])

  return (
    <div className="mx-auto max-w-[860px]">
      <h1 className="sr-only">Sports home</h1>
      <SportsNav />
      <FollowedShelf />

      <section className="mb-8" aria-labelledby="live-h">
        <SectionHeader
          title={<span id="live-h">Live now</span>}
          icon={<LiveDot />}
          right={<Link to="/live" className="inline-flex h-11 items-center gap-1 text-[13.5px] font-semibold lg:h-8">All live <ArrowRight size={14} aria-hidden="true" /></Link>}
        />
        {live.length ? (
          <ul className="overflow-hidden rounded-m border border-line bg-card">
            {live.map((m) => <MatchRow key={m.id} id={m.id} showComp={compById[m.compId].short} />)}
          </ul>
        ) : (
          <p className="rounded-m border border-dashed border-line bg-card px-4 py-5 text-[14px] text-muted">Nothing is live right now. The next matches are below.</p>
        )}
      </section>

      <section className="mb-8" aria-labelledby="soon-h">
        <SectionHeader title={<span id="soon-h">Starting soon</span>} icon={<Clock size={17} aria-hidden="true" />}
          right={<Link to="/football" className="inline-flex h-11 items-center gap-1 text-[13.5px] font-semibold lg:h-8">All football <ArrowRight size={14} aria-hidden="true" /></Link>} />
        <ul className="overflow-hidden rounded-m border border-line bg-card">
          {soon.map((m) => <MatchRow key={m.id} id={m.id} showComp={compById[m.compId].short} />)}
        </ul>
      </section>

      <section aria-labelledby="comps-h">
        <SectionHeader title={<span id="comps-h">Top competitions</span>} icon={<Trophy size={17} aria-hidden="true" />} />
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {competitions.map((c) => {
            const ms = Object.values(matches).filter((m) => m.compId === c.id && m.status !== 'ft')
            const liveN = ms.filter((m) => m.status === 'live').length
            return (
              <li key={c.id} className="flex items-center gap-2 rounded-m border border-line bg-card p-2 pl-4">
                <Link to={`/football#${c.id}`} className="min-w-0 flex-1 py-1.5">
                  <p className="truncate font-bold">{c.name}</p>
                  <p className="text-[12.5px] text-muted">{c.region} · {ms.length} {ms.length === 1 ? 'match' : 'matches'}{liveN > 0 && <span className={cx('font-semibold text-live')}> · {liveN} live</span>}</p>
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

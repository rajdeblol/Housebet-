import { ArrowRight, Clock, Star, Trophy } from 'lucide-react'
import { useMemo } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { compById, competitions, sportById, sportPath, sports } from '../data/competitions'
import { teams } from '../data/teams'
import { MatchRow } from '../components/MatchRow'
import { EmptyState, Freshness, LiveDot, SectionHeader } from '../components/ui'
import { useStore } from '../engine/store'
import { cx } from '../lib/format'
import { SportIcon } from '../lib/sportIcons'

/** Horizontal sport chips (phones and tablets; desktop has the left nav). */
export function SportsNav() {
  const matches = useStore((s) => s.matches)
  return (
    <nav aria-label="Sports" className="no-scrollbar relative -mx-4 mb-5 flex gap-2 overflow-x-auto px-4 lg:hidden">
      {sports.map((sp) => {
        const liveN = Object.values(matches).filter((m) => m.sport === sp.id && m.status === 'live').length
        return (
          <NavLink
            key={sp.id}
            to={sportPath(sp.id)}
            className={({ isActive }) =>
              cx(
                'flex h-11 shrink-0 items-center gap-2 rounded-full border px-3.5 text-[13px] font-semibold transition-colors',
                isActive ? 'border-ink bg-ink text-white' : 'border-line bg-card text-ink',
              )
            }
          >
            <SportIcon id={sp.id} size={15} />
            {sp.name}
            {liveN > 0 && (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-live">
                <LiveDot /> <span className="tnum">{liveN}</span><span className="sr-only"> live</span>
              </span>
            )}
          </NavLink>
        )
      })}
    </nav>
  )
}

/** Chips for the competitions and teams the player follows. */
function Following() {
  const follows = useStore((s) => s.follows)
  const matches = useStore((s) => s.matches)
  const items = [
    ...follows.comps.map((id) => compById[id] && { key: 'c' + id, label: compById[id].name, to: `${sportPath(compById[id].sport)}#${id}` }),
    ...follows.teams.map((id) => {
      const t = teams[id]
      if (!t) return null
      const next = Object.values(matches).find((m) => m.status !== 'ft' && (m.home === id || m.away === id))
      return { key: 't' + id, label: t.name, to: next ? `/match/${next.id}` : '/football' }
    }),
  ].filter(Boolean) as { key: string; label: string; to: string }[]

  return (
    <section aria-labelledby="h-following" className="mb-7">
      <h2 id="h-following" className="mb-2 flex items-center gap-1.5 text-[13px] font-bold uppercase tracking-wider text-muted">
        <Star size={13} aria-hidden="true" /> Following
      </h2>
      {items.length ? (
        <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4">
          {items.map((it) => (
            <Link key={it.key} to={it.to} className="inline-flex h-9 shrink-0 items-center rounded-full border border-line bg-card px-3.5 text-[13px] font-semibold hover:border-ink">
              {it.label}
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-[13.5px] text-muted">
          Tap the star on any team or competition to keep it here. <Link to="/football" className="font-semibold text-ink underline underline-offset-2">Browse football</Link>
        </p>
      )}
    </section>
  )
}

export function HomePage() {
  const matches = useStore((s) => s.matches)

  const { live, soon } = useMemo(() => {
    const all = Object.values(matches)
    const order = (id: string) => sports.findIndex((x) => x.id === id)
    return {
      live: all.filter((m) => m.status === 'live').sort((a, b) => order(a.sport) - order(b.sport)),
      soon: all.filter((m) => m.status === 'upcoming').sort((a, b) => a.kickoff - b.kickoff),
    }
  }, [matches])

  const topComps = useMemo(
    () =>
      ['epl', 'ucl', 'laliga', 'seriea', 'bundesliga', 'nba', 'nfl', 'atp']
        .map((id) => competitions.find((c) => c.id === id))
        .filter(Boolean)
        .map((c) => {
          const ms = Object.values(matches).filter((m) => m.compId === c!.id && m.status !== 'ft')
          return { c: c!, total: ms.length, live: ms.filter((m) => m.status === 'live').length }
        }),
    [matches],
  )

  return (
    <div className="mx-auto max-w-[940px]">
      <SportsNav />

      <div className="mb-5 flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 className="text-[28px] font-extrabold tracking-tight">Sports</h1>
          <p className="text-[13.5px] text-muted">Singles only · decimal odds · stakes in USDT · times in your local time</p>
        </div>
      </div>

      <Following />

      <section aria-labelledby="h-live" className="mb-8">
        <SectionHeader
          title={<span id="h-live">Live now</span>}
          icon={<LiveDot className="h-2.5 w-2.5" />}
          sub={<Freshness />}
          right={
            live.length > 0 && (
              <Link to="/live" className="inline-flex min-h-[36px] shrink-0 items-center gap-1 text-[13px] font-semibold hover:underline">
                All live ({live.length}) <ArrowRight size={14} aria-hidden="true" />
              </Link>
            )
          }
        />
        {live.length ? (
          <ul>{live.slice(0, 5).map((m) => <MatchRow key={m.id} id={m.id} />)}</ul>
        ) : (
          <EmptyState icon={<Clock size={18} />} title="Nothing in play right now" body="The next kick-offs are just below." />
        )}
      </section>

      <section aria-labelledby="h-soon" className="mb-8">
        <SectionHeader title={<span id="h-soon">Starting soon</span>} icon={<Clock size={17} aria-hidden="true" />} />
        {soon.length ? (
          <ul>{soon.slice(0, 5).map((m) => <MatchRow key={m.id} id={m.id} />)}</ul>
        ) : (
          <EmptyState icon={<Clock size={18} />} title="No upcoming games" body="Check back later for new fixtures." />
        )}
      </section>

      <section aria-labelledby="h-comps" className="mb-4">
        <SectionHeader title={<span id="h-comps">Top competitions</span>} icon={<Trophy size={17} aria-hidden="true" />} />
        <ul className="grid grid-cols-1 gap-2.5 xs:grid-cols-2 md:grid-cols-4">
          {topComps.map(({ c, total, live: liveN }) => (
            <li key={c.id}>
              <Link
                to={`${sportPath(c.sport)}#${c.id}`}
                className="flex h-full items-center gap-3 rounded-m border border-line bg-card p-3 shadow-raised transition-colors hover:border-ink"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-s bg-sunk text-ink" aria-hidden="true">
                  <SportIcon id={c.sport} size={17} />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-[14px] font-bold">{c.name}</span>
                  <span className="flex items-center gap-1.5 text-[12px] text-muted">
                    {sportById[c.sport].name} · {total} {total === 1 ? 'game' : 'games'}
                    {liveN > 0 && <span className="font-semibold text-live">· {liveN} live</span>}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}

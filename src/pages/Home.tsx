import { ArrowRight, Clock, Compass, Star, Trophy } from 'lucide-react'
import { useMemo } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { compById, competitions, sportById, sportPath, sports } from '../data/competitions'
import { teams } from '../data/teams'
import { MatchRow } from '../components/MatchRow'
import { EmptyState, Freshness, LiveDot, SectionHeader } from '../components/ui'
import { useStore } from '../engine/store'
import { cx } from '../lib/format'
import { SportIcon } from '../lib/sportIcons'
import { scoreText, statusShort } from '../lib/sport'

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
                isActive ? 'border-accent bg-accent text-page' : 'border-line bg-card text-ink',
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

  const featured = live[0] ?? soon[0]
  const featuredHome = featured ? teams[featured.home] : null
  const featuredAway = featured ? teams[featured.away] : null
  const featuredScore = featured ? scoreText(featured) : null
  const exploreSports = [...sports].sort((a, b) => {
    const count = (id: string) => live.filter((m) => m.sport === id).length
    return count(b.id) - count(a.id)
  })

  return (
    <div className="mx-auto max-w-[940px]">
      <SportsNav />

      {featured && featuredHome && featuredAway && (
        <section aria-labelledby="hero-title" className="relative mb-6 overflow-hidden rounded-[22px] border border-line bg-card shadow-raised">
          <div
            className="absolute inset-0"
            style={{ backgroundImage: 'radial-gradient(ellipse at 78% 45%, rgb(var(--brand) / 0.15), transparent 46%), linear-gradient(115deg, rgb(var(--card)), rgb(var(--sunk)))' }}
            aria-hidden="true"
          />
          <div className="relative grid min-h-[280px] items-center gap-2 px-5 py-6 sm:min-h-[310px] sm:grid-cols-[minmax(0,1.1fr)_minmax(230px,.9fr)] sm:px-8 sm:py-8">
            <div className="z-10 max-w-[520px]">
              <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-brand/30 bg-brand/10 px-3 py-1 text-[10px] font-extrabold uppercase tracking-[.13em] text-ink">
                <span className="h-1.5 w-1.5 rounded-full bg-brand" /> Demo mode · simulated fixtures
              </p>
              <h1 id="hero-title" className="max-w-[470px] text-[32px] font-black leading-[1.03] tracking-[-.045em] sm:text-[42px]">The game never stops.</h1>
              <p className="mt-3 max-w-[430px] text-[14px] leading-relaxed text-muted sm:text-[15px]">Follow the action, explore markets and find your next match. Every score and price here is simulated for this prototype.</p>

              <div className="mt-5 flex flex-wrap gap-2">
                <Link to="/live" className="inline-flex h-11 items-center gap-2 rounded-s bg-accent px-4 text-[13.5px] font-bold text-page transition-opacity hover:opacity-90">
                  Explore live markets <ArrowRight size={15} aria-hidden="true" />
                </Link>
                <Link to="/football" className="inline-flex h-11 items-center rounded-s border border-line bg-card/80 px-4 text-[13.5px] font-semibold transition-colors hover:border-brand/70">
                  View fixtures
                </Link>
              </div>

              <Link to={`/match/${featured.id}`} className="mt-5 flex max-w-[450px] items-center gap-3 rounded-m border border-line bg-page/80 px-3.5 py-3 transition-colors hover:border-brand/70">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-s bg-brand/10 text-brand"><SportIcon id={featured.sport} size={18} /></span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-muted">Featured {featured.status === 'live' ? 'live demo' : 'upcoming fixture'} · {compById[featured.compId]?.short ?? sportById[featured.sport].name}</span>
                  <span className="mt-0.5 flex min-w-0 items-center gap-1.5 text-[13px] font-bold">
                    <span className="truncate">{featuredHome.name}</span>
                    {featuredScore && <span className="tnum shrink-0 text-brand">{featuredScore[0]}–{featuredScore[1]}</span>}
                    <span className="shrink-0 text-muted">v</span>
                    <span className="truncate">{featuredAway.name}</span>
                  </span>
                </span>
                <span className="shrink-0 text-right">
                  <span className={cx('block text-[10px] font-extrabold uppercase tracking-wide', featured.status === 'live' ? 'text-live' : 'text-muted')}>{featured.status === 'live' ? '● Live demo' : 'Starting soon'}</span>
                  <span className="tnum block text-[11px] font-semibold text-muted">{featured.status === 'live' ? statusShort(featured) : 'View fixture'}</span>
                </span>
              </Link>
              <p className="mt-2 max-w-[450px] text-[11.5px] text-muted">Judge tip: open <span className="font-bold text-ink">Demo</span> at the bottom-left to trigger a score, odds move, suspension or offline state.</p>
            </div>

            <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-[48%] overflow-hidden sm:block" aria-hidden="true">
              <svg viewBox="0 0 440 300" className="absolute inset-0 h-full w-full" fill="none">
                <defs>
                  <linearGradient id="pitch" x1="64" y1="284" x2="406" y2="8" gradientUnits="userSpaceOnUse"><stop stopColor="rgb(var(--brand))" stopOpacity=".06" /><stop offset="1" stopColor="rgb(var(--brand))" stopOpacity=".5" /></linearGradient>
                  <linearGradient id="ball" x1="283" y1="111" x2="313" y2="145" gradientUnits="userSpaceOnUse"><stop stopColor="#fff" /><stop offset="1" stopColor="#9CB0B4" /></linearGradient>
                </defs>
                <path d="M91 287 224 18h210v269H91Z" fill="url(#pitch)" />
                <path d="M130 288 249 18M202 288 307 18M276 288 365 18M91 250h343M110 212h324M129 174h305M148 136h286M168 98h266M186 60h248" stroke="rgb(var(--brand))" strokeOpacity=".25" strokeWidth="1.2" />
                <path d="M339 288v-47h95M370 288v-30h64M266 153a44 44 0 0 1 44 44" stroke="rgb(var(--brand))" strokeOpacity=".65" strokeWidth="2" />
                <path d="m284 102 72-26M287 108l77-5" stroke="rgb(var(--brand))" strokeOpacity=".65" strokeWidth="2" />
                <circle cx="298" cy="126" r="36" fill="rgb(var(--brand))" fillOpacity=".12" />
                <circle cx="298" cy="126" r="21" fill="url(#ball)" />
                <path d="m298 114 8 6-3 10h-10l-3-10 8-6Zm-8-8 8 8m8 6 10 3m-13 10 1 13m-14-23-10 3" stroke="#34494D" strokeWidth="2" />
                <circle cx="298" cy="126" r="28" stroke="rgb(var(--brand))" strokeOpacity=".25" />
              </svg>
              <div className="absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-card to-transparent" />
            </div>
          </div>
        </section>
      )}

      {live.length > 0 && (
        <section aria-label="Live match ticker" className="mb-7">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-[13px] font-extrabold uppercase tracking-wider text-muted"><span className="h-2 w-2 rounded-full bg-live" /> In-play ticker</h2>
            <Link to="/live" className="inline-flex min-h-[32px] items-center gap-1 text-[12.5px] font-semibold text-muted hover:text-ink">All live <ArrowRight size={13} /></Link>
          </div>
          <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0">
            {live.slice(0, 6).map((m) => {
              const h = teams[m.home], a = teams[m.away], score = scoreText(m)
              return <Link key={m.id} to={`/match/${m.id}`} className="min-w-[205px] rounded-m border border-line bg-card px-3 py-2.5 transition-colors hover:border-brand/70">
                <span className="flex items-center justify-between gap-2 text-[10px] font-bold uppercase tracking-wide text-muted"><span className="truncate">{compById[m.compId]?.short ?? sportById[m.sport].name}</span><span className="tnum shrink-0 text-live">{statusShort(m)}</span></span>
                <span className="mt-1.5 flex items-center gap-2 text-[12.5px] font-bold"><span className="min-w-0 flex-1 truncate">{h.name}</span><span className="tnum rounded bg-sunk px-1.5 py-0.5 text-brand">{score ? `${score[0]}–${score[1]}` : 'In play'}</span></span>
                <span className="mt-1 flex items-center gap-2 text-[12.5px] font-bold"><span className="min-w-0 flex-1 truncate">{a.name}</span><span className="w-[34px]" /></span>
              </Link>
            })}
          </div>
        </section>
      )}

      <div className="mb-5 flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="text-[25px] font-extrabold tracking-tight">Explore the board</h2>
          <p className="text-[13.5px] text-muted">Singles only · decimal odds · demo USDT · times in your local time</p>
        </div>
      </div>

      <section aria-labelledby="h-sports" className="mb-8">
        <SectionHeader title={<span id="h-sports">Explore sports</span>} icon={<Compass size={17} aria-hidden="true" />} />
        <ul className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {exploreSports.map((sp) => {
            const inPlay = live.filter((m) => m.sport === sp.id).length
            return <li key={sp.id}><Link to={sportPath(sp.id)} className="flex min-h-[62px] items-center gap-3 rounded-m border border-line bg-card px-3 transition-colors hover:border-brand/70">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-s bg-brand/10 text-brand"><SportIcon id={sp.id} size={18} /></span>
              <span className="min-w-0 flex-1"><span className="block truncate text-[13.5px] font-bold">{sp.name}</span><span className="block text-[11.5px] text-muted">{inPlay > 0 ? `${inPlay} in demo play` : 'View fixtures'}</span></span>
              <ArrowRight size={14} className="shrink-0 text-muted" aria-hidden="true" />
            </Link></li>
          })}
        </ul>
      </section>

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
        <SectionHeader title={<span id="h-soon">Upcoming fixtures</span>} icon={<Clock size={17} aria-hidden="true" />} />
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

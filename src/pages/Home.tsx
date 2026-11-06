import { ArrowRight, Clock, Compass, Star, Trophy, Activity, Ticket, TrendingUp } from 'lucide-react'
import { useMemo } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { compById, competitions, sportById, sportPath, sports } from '../data/competitions'
import { teams } from '../data/teams'
import { MatchRow } from '../components/MatchRow'
import { Crest, EmptyState, Freshness, LiveDot, SectionHeader } from '../components/ui'
import { useStore } from '../engine/store'
import { cx, fmtUSDT } from '../lib/format'
import { SportIcon } from '../lib/sportIcons'
import { scoreText, statusShort } from '../lib/sport'

/** Horizontal sport chips (phones and tablets; desktop has the left nav). */
export function SportsNav() {
  const matches = useStore((s) => s.matches)
  return (
    <nav aria-label="Sports" className="no-scrollbar relative -mx-4 mb-5 flex gap-2 overflow-x-auto px-4 lg:mx-0 lg:px-0">
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
            <SportIcon id={sp.id} size={19} />
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
  const bets = useStore((s) => s.bets)

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
  const artFile: Record<string, string> = {
    football: 'football', basketball: 'basketball', tennis: 'tennis', americanfootball: 'nfl',
    baseball: 'mlb', icehockey: 'nhl', cricket: 'cricket', mma: 'ufc',
  }
  const settledBets = bets.filter((b) => b.status !== 'open')
  const openBets = bets.filter((b) => b.status === 'open').length
  const settledStake = settledBets.reduce((sum, b) => sum + b.stake, 0)
  const demoNet = settledBets.reduce((sum, b) => sum + (b.returned ?? 0) - b.stake, 0)
  const demoRoi = settledStake ? (demoNet / settledStake) * 100 : 0
  const exploreSports = [...sports].sort((a, b) => {
    const count = (id: string) => live.filter((m) => m.sport === id).length
    return count(b.id) - count(a.id)
  })

  return (
    <div className="mx-auto max-w-[940px]">
      <SportsNav />

      {featured && featuredHome && featuredAway && (
        <section aria-labelledby="hero-title" className="relative isolate mb-6 overflow-hidden rounded-[24px] border border-[#24515A] bg-[#061316] text-white shadow-[0_22px_60px_-32px_rgba(0,28,35,.72)]">
          <img
            src={`${import.meta.env.BASE_URL}sports-share-cards/housebets-${artFile[featured.sport] ?? 'football'}.png`}
            alt=""
            className="absolute inset-0 -z-20 h-full w-full object-cover object-right opacity-75"
            aria-hidden="true"
          />
          <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,#061316_0%,rgba(6,19,22,.96)_37%,rgba(6,19,22,.58)_68%,rgba(6,19,22,.16)_100%)]" aria-hidden="true" />
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_12%_0%,rgba(2,247,253,.16),transparent_40%)]" aria-hidden="true" />
          <div className="relative flex min-h-[390px] flex-col justify-between gap-8 px-5 py-6 sm:min-h-[350px] sm:px-8 sm:py-7">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="grid h-8 w-8 place-items-center rounded-[10px] border border-[#02F7FD]/35 bg-[#02F7FD]/10 text-[18px] font-black text-[#02F7FD]">H</span>
                <span className="text-[14px] font-black tracking-[.12em] text-white">HOUSEBETS <span className="font-medium tracking-[.18em] text-white/55">SPORTSBOOK</span></span>
              </div>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/25 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.12em] text-white/85 backdrop-blur-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-[#02F7FD] shadow-[0_0_12px_#02F7FD]" /> Demo arena
              </span>
            </div>

            <div className="max-w-[540px]">
              <p className="mb-2 text-[11px] font-extrabold uppercase tracking-[.2em] text-[#02F7FD]">The matchday starts here</p>
              <h1 id="hero-title" className="max-w-[490px] text-[38px] font-black leading-[.98] tracking-[-.055em] sm:text-[52px]">Feel every<br className="hidden sm:block" /> moment.</h1>
              <p className="mt-3 max-w-[430px] text-[13.5px] leading-relaxed text-white/70 sm:text-[15px]">Live scores, big fixtures and a front-row view of the action. Welcome to Housebets.</p>

              <div className="mt-5 flex flex-wrap gap-2.5">
                <Link to="/live" className="inline-flex h-11 items-center gap-2 rounded-[10px] bg-[#02F7FD] px-4 text-[13.5px] font-extrabold text-[#052126] shadow-[0_8px_24px_-10px_rgba(2,247,253,.75)] transition-transform hover:-translate-y-0.5">
                  Watch live action <ArrowRight size={15} aria-hidden="true" />
                </Link>
                <Link to="/football" className="inline-flex h-11 items-center gap-2 rounded-[10px] border border-white/25 bg-black/20 px-4 text-[13.5px] font-bold text-white transition-colors hover:border-white/60 hover:bg-white/10">
                  Explore fixtures
                </Link>
              </div>
            </div>

            <Link to={`/match/${featured.id}`} className="flex w-full max-w-[440px] items-center gap-3 rounded-[14px] border border-white/15 bg-[#071A1F]/90 px-3.5 py-3 shadow-lg backdrop-blur-md transition-colors hover:border-[#02F7FD]/60">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-[#02F7FD]/10 text-[#02F7FD]"><SportIcon id={featured.sport} size={18} /></span>
              <span className="min-w-0 flex-1">
                <span className="block text-[9px] font-bold uppercase tracking-[.16em] text-white/55">Featured match · {compById[featured.compId]?.short ?? sportById[featured.sport].name}</span>
                <span className="mt-1 flex min-w-0 items-center gap-2 text-[12px] font-bold sm:text-[13px]">
                  <Crest id={featured.home} size={24} />
                  <span className="truncate">{featuredHome.name}</span>
                  {featuredScore && <span className="tnum rounded-md bg-white/10 px-2 py-1 text-[#02F7FD]">{featuredScore[0]}–{featuredScore[1]}</span>}
                  {!featuredScore && <span className="rounded-md bg-white/10 px-2 py-1 text-white/70">VS</span>}
                  <span className="truncate">{featuredAway.name}</span>
                  <Crest id={featured.away} size={24} />
                </span>
              </span>
              <span className="shrink-0 text-right">
                <span className={cx('block text-[9px] font-extrabold uppercase tracking-wide', featured.status === 'live' ? 'text-[#FF7770]' : 'text-white/55')}>{featured.status === 'live' ? '● Live' : 'Soon'}</span>
                <span className="tnum block text-[10px] font-semibold text-white/55">{featured.status === 'live' ? statusShort(featured) : 'View'}</span>
              </span>
            </Link>
          </div>
        </section>
      )}

      <section aria-label="Demo dashboard summary" className="mb-7 grid grid-cols-2 gap-2.5 xl:grid-cols-4">
        <Link to="/live" className="group rounded-m border border-line bg-card p-3.5 shadow-raised transition-colors hover:border-brand/60 sm:p-4">
          <span className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-muted"><span>Live events</span><Activity size={15} className="text-live" aria-hidden="true" /></span>
          <span className="mt-2 block text-[25px] font-black leading-none tracking-tight">{live.length}</span>
          <span className="mt-1 block text-[11px] text-muted">Across {sports.length} sports</span>
        </Link>
        <Link to="/football" className="group rounded-m border border-line bg-card p-3.5 shadow-raised transition-colors hover:border-brand/60 sm:p-4">
          <span className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-muted"><span>Coming up</span><Clock size={15} className="text-brand" aria-hidden="true" /></span>
          <span className="mt-2 block text-[25px] font-black leading-none tracking-tight">{soon.length}</span>
          <span className="mt-1 block text-[11px] text-muted">Scheduled fixtures</span>
        </Link>
        <Link to="/bets" className="group rounded-m border border-line bg-card p-3.5 shadow-raised transition-colors hover:border-brand/60 sm:p-4">
          <span className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-muted"><span>Open singles</span><Ticket size={15} className="text-brand" aria-hidden="true" /></span>
          <span className="mt-2 block text-[25px] font-black leading-none tracking-tight">{openBets}</span>
          <span className="mt-1 block text-[11px] text-muted">In your demo wallet</span>
        </Link>
        <Link to="/bets" className="group rounded-m border border-line bg-card p-3.5 shadow-raised transition-colors hover:border-brand/60 sm:p-4">
          <span className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-muted"><span>Settled demo net</span><TrendingUp size={15} className={demoNet >= 0 ? 'text-upText' : 'text-down'} aria-hidden="true" /></span>
          <span className={`mt-2 block text-[25px] font-black leading-none tracking-tight tnum ${demoNet >= 0 ? 'text-upText' : 'text-down'}`}>{demoNet >= 0 ? '+' : '−'}{fmtUSDT(Math.abs(demoNet))}</span>
          <span className="mt-1 block text-[11px] text-muted">{settledBets.length} settled · {demoRoi >= 0 ? '+' : ''}{demoRoi.toFixed(1)}% demo ROI</span>
        </Link>
      </section>

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
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] border border-line bg-card shadow-sm"><SportIcon id={sp.id} size={23} /></span>
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

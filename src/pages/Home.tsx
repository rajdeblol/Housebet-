import { ArrowRight, ChevronRight, Info, Sparkles } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { compById, sportPath, sports } from '../data/competitions'
import { MatchRow } from '../components/MatchRow'
import { WaveBanner } from '../components/WaveBanner'
import { Crest, LiveDot } from '../components/ui'
import { actions, useStore } from '../engine/store'
import { cx, fmtOdds, kickoffLabel } from '../lib/format'
import { teams } from '../data/teams'
import { scoreText, statusShort } from '../lib/sport'

export function SportsNav() {
  const matches = useStore((s) => s.matches)
  return (
    <nav aria-label="Sports" className="no-scrollbar -mx-4 mb-3 flex gap-1.5 overflow-x-auto px-4 lg:hidden">
      {sports.map((sp) => {
        const liveN = Object.values(matches).filter((m) => m.sport === sp.id && m.status === 'live').length
        return (
          <NavLink
            key={sp.id}
            to={sportPath(sp.id)}
            className={({ isActive }) =>
              cx(
                'flex h-8.5 shrink-0 items-center gap-1.5 rounded-full border px-3 text-xs font-bold transition-colors',
                isActive ? 'border-ink bg-ink text-white' : 'border-line bg-card text-ink',
              )
            }
          >
            {sp.name}
            {liveN > 0 && (
              <span className="inline-flex items-center gap-0.5 text-[10.5px] font-extrabold text-live">
                <LiveDot /> <span className="tnum">{liveN}</span>
              </span>
            )}
          </NavLink>
        )
      })}
    </nav>
  )
}

function FeaturedMatchCard({ matchId }: { matchId: string }) {
  const m = useStore((s) => s.matches[matchId])
  const slipItems = useStore((s) => s.slip.items)
  const now = useStore((s) => s.now)
  const mainMarket = useStore((s) => s.markets[`${matchId}:mr`] || s.markets[`${matchId}:ml`])

  if (!m || !mainMarket) return null

  const H = teams[m.home], A = teams[m.away]
  const score = m.status === 'upcoming' ? null : scoreText(m)

  return (
    <div className="mb-4 overflow-hidden rounded-2xl border border-line bg-card p-4 shadow-xs">
      <div className="flex items-center justify-between text-xs font-bold text-muted mb-3">
        <span className="inline-flex items-center gap-1.5 text-[#E4372B] uppercase tracking-wider font-extrabold">
          <Sparkles size={13} /> Featured Match · {compById[m.compId]?.name}
        </span>
        <Link
          to={`/match/${m.id}`}
          className="inline-flex items-center gap-1 rounded-full border border-line bg-sunk/40 px-2.5 py-0.5 text-[11px] font-semibold text-ink hover:bg-sunk transition-colors"
        >
          Game View <ChevronRight size={12} />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3 items-center">
        {/* Teams and Score */}
        <Link to={`/match/${m.id}`} className="group flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Crest id={H.id} size={30} />
            <div>
              <p className="text-[15px] font-extrabold text-ink group-hover:underline">{H.name}</p>
              <p className="text-[11px] text-muted">Home</p>
            </div>
          </div>

          <div className="text-center px-2">
            {score ? (
              <div className="flex flex-col items-center">
                <span className="tnum text-xl font-black text-ink">{score[0]} - {score[1]}</span>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-live">
                  <LiveDot /> {statusShort(m)}
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <span className="text-xs font-bold text-muted">VS</span>
                <span className="text-[10px] text-muted font-medium">{kickoffLabel(m.kickoff, now)}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 flex-row-reverse text-right">
            <Crest id={A.id} size={30} />
            <div>
              <p className="text-[15px] font-extrabold text-ink group-hover:underline">{A.name}</p>
              <p className="text-[11px] text-muted">Away</p>
            </div>
          </div>
        </Link>

        {/* Quick Odds 1X2 row */}
        <div className="flex gap-1.5 sm:w-[220px]">
          {mainMarket.selections.slice(0, 3).map((sel, i) => {
            const selId = `${m.id}:${mainMarket.id.split(':')[1]}:${i}`
            const isSelected = slipItems.some((item) => item.selId === selId)
            const label = i === 0 ? '1' : i === 1 && mainMarket.selections.length === 3 ? 'X' : '2'

            return (
              <button
                key={sel.id}
                type="button"
                disabled={mainMarket.closed || sel.closed || !!mainMarket.suspendedUntil}
                onClick={() => actions.toggleSelection(selId)}
                className={cx(
                  'flex flex-1 flex-col items-center justify-center rounded-lg py-1.5 text-xs font-bold transition-all',
                  isSelected
                    ? 'bg-[#E4372B] text-white shadow-xs'
                    : 'border border-line bg-sunk/60 text-ink hover:border-ink hover:bg-sunk',
                )}
              >
                <span className="text-[10px] opacity-75">{label}</span>
                <span className="tnum font-extrabold text-[12px]">{fmtOdds(sel.odds)}x</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export function HomePage() {
  const matches = useStore((s) => s.matches)
  const [showSpreads, setShowSpreads] = useState(false)
  const [selectedComp, setSelectedComp] = useState<string>('all')

  const topComps = useMemo(() => {
    return [
      { id: 'all', name: 'All Competitions' },
      { id: 'epl', name: 'Premier League' },
      { id: 'seriea', name: 'Serie A' },
      { id: 'ucl', name: 'Champions League' },
      { id: 'nba', name: 'NBA' },
      { id: 't20', name: 'T20 Cricket' },
    ]
  }, [])

  const { live, today, upcoming, featuredId } = useMemo(() => {
    const all = Object.values(matches)
    const filtered = selectedComp === 'all' ? all : all.filter((m) => m.compId === selectedComp)

    const liveList = filtered
      .filter((m) => m.status === 'live')
      .sort((a, b) => sports.findIndex((x) => x.id === a.sport) - sports.findIndex((x) => x.id === b.sport))

    const upcomingList = filtered
      .filter((m) => m.status === 'upcoming')
      .sort((a, b) => a.kickoff - b.kickoff)

    return {
      live: liveList,
      today: upcomingList.slice(0, 5),
      upcoming: upcomingList.slice(5),
      featuredId: liveList[0]?.id || all[0]?.id || 'har-red',
    }
  }, [matches, selectedComp])

  return (
    <div className="mx-auto max-w-[940px]">
      <h1 className="sr-only">Housebets Sportsbook Feed</h1>

      {/* Hero Banner (Compact & Compliant) */}
      <WaveBanner />

      {/* Featured Match Card */}
      {featuredId && <FeaturedMatchCard matchId={featuredId} />}

      {/* Feed Controls Row: Sport Title, Local Time & Toggle */}
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <h2 className="text-[22px] font-black tracking-tight text-ink">
            Sportsbook Feed
          </h2>
          <span className="inline-flex items-center gap-1 rounded-full border border-line bg-card px-2.5 py-0.5 text-xs font-semibold text-muted">
            <Info size={12} /> Local Time
          </span>
        </div>

        {/* Show Spreads + Totals Toggle Switch */}
        <div className="flex items-center gap-2 text-xs font-semibold text-muted">
          <span>Show Spreads + Totals</span>
          <button
            type="button"
            role="switch"
            aria-checked={showSpreads}
            onClick={() => setShowSpreads((v) => !v)}
            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
              showSpreads ? 'bg-[#E4372B]' : 'bg-line'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                showSpreads ? 'translate-x-4' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Competitions Filter Bar */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-line/60 pb-3">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            className="h-7.5 rounded-full bg-[#E4372B] px-3.5 text-xs font-bold text-white shadow-xs"
          >
            Games
          </button>
        </div>

        {/* Top Competitions Filter Chips */}
        <div className="no-scrollbar flex items-center gap-1.5 overflow-x-auto text-xs">
          {topComps.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setSelectedComp(c.id)}
              className={cx(
                'h-7 rounded-lg px-2.5 font-semibold transition-all shrink-0',
                selectedComp === c.id
                  ? 'bg-ink text-white font-bold'
                  : 'border border-line bg-card text-muted hover:text-ink',
              )}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* Live In-Play Section */}
      {live.length > 0 && (
        <section className="mb-5">
          <div className="mb-2 flex items-center justify-between text-xs font-extrabold uppercase tracking-wider text-muted">
            <span className="flex items-center gap-1.5 text-live font-black">
              <span className="h-2 w-2 rounded-full bg-live animate-ping" />
              Live Now ({live.length})
            </span>
            <Link to="/live" className="text-muted hover:text-ink flex items-center gap-0.5">
              View all live <ArrowRight size={12} />
            </Link>
          </div>
          <ul className="space-y-2.5">
            {live.map((m) => (
              <MatchRow key={m.id} id={m.id} showComp={compById[m.compId]?.short} />
            ))}
          </ul>
        </section>
      )}

      {/* Starting Soon / Today Section */}
      <section className="mb-5">
        <div className="mb-2.5 flex items-center justify-between">
          <h3 className="text-sm font-black text-ink">Starting Soon & Today</h3>
          <span className="text-[11px] text-muted font-medium">{today.length} fixtures</span>
        </div>

        <ul className="space-y-2.5">
          {today.map((m) => (
            <MatchRow key={m.id} id={m.id} showComp={compById[m.compId]?.short} />
          ))}
        </ul>
      </section>

      {/* Upcoming Section */}
      {upcoming.length > 0 && (
        <section className="mb-6">
          <div className="mb-2.5 flex items-center justify-between">
            <h3 className="text-sm font-black text-ink">Upcoming Fixtures</h3>
            <span className="text-[11px] text-muted font-medium">{upcoming.length} fixtures</span>
          </div>

          <ul className="space-y-2.5">
            {upcoming.map((m) => (
              <MatchRow key={m.id} id={m.id} showComp={compById[m.compId]?.short} />
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}

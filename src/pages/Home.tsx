import { ArrowRight, Info } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { compById, sportPath, sports } from '../data/competitions'
import { MatchRow } from '../components/MatchRow'
import { WaveBanner } from '../components/WaveBanner'
import { LiveDot } from '../components/ui'
import { useStore } from '../engine/store'
import { cx } from '../lib/format'
import { NavLink } from 'react-router-dom'

export function SportsNav() {
  const matches = useStore((s) => s.matches)
  return (
    <nav aria-label="Sports" className="no-scrollbar -mx-4 mb-4 flex gap-2 overflow-x-auto px-4 lg:hidden">
      {sports.map((sp) => {
        const liveN = Object.values(matches).filter((m) => m.sport === sp.id && m.status === 'live').length
        return (
          <NavLink
            key={sp.id}
            to={sportPath(sp.id)}
            className={({ isActive }) =>
              cx(
                'flex h-9 shrink-0 items-center gap-2 rounded-full border px-3 text-xs font-bold transition-colors',
                isActive ? 'border-ink bg-ink text-white' : 'border-line bg-card text-ink',
              )
            }
          >
            {sp.name}
            {liveN > 0 && (
              <span className="inline-flex items-center gap-1 text-[10.5px] font-extrabold text-live">
                <LiveDot /> <span className="tnum">{liveN}</span>
              </span>
            )}
          </NavLink>
        )
      })}
    </nav>
  )
}

export function HomePage() {
  const matches = useStore((s) => s.matches)
  const [activeTab, setActiveTab] = useState<'games' | 'props'>('games')
  const [showSpreads, setShowSpreads] = useState(false)

  const { live, today, upcoming } = useMemo(() => {
    const all = Object.values(matches)
    return {
      live: all.filter((m) => m.status === 'live').sort((a, b) => sports.findIndex((x) => x.id === a.sport) - sports.findIndex((x) => x.id === b.sport)),
      today: all.filter((m) => m.status === 'upcoming').slice(0, 6),
      upcoming: all.filter((m) => m.status === 'upcoming').slice(6),
    }
  }, [matches])

  return (
    <div className="mx-auto max-w-[940px]">
      <h1 className="sr-only">Housebets Sportsbook Feed</h1>

      {/* Housebets Wave 2 Campaign Banner */}
      <WaveBanner />

      {/* Probly Feed Header: "Football" + "In Local Time" + Toggle */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h2 className="text-[26px] font-black tracking-tight text-ink">
            Football
          </h2>
          <span className="inline-flex items-center gap-1 rounded-full border border-line bg-card px-2.5 py-0.5 text-xs font-semibold text-muted">
            <Info size={12} /> In Local Time
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

      {/* Subtabs: [Games (active)] [Props] */}
      <div className="mb-5 flex items-center gap-2">
        <button
          type="button"
          onClick={() => setActiveTab('games')}
          className={`h-8 rounded-full px-4 text-xs font-bold transition-all ${
            activeTab === 'games'
              ? 'bg-[#E4372B] text-white shadow-xs'
              : 'border border-line bg-card text-muted hover:text-ink'
          }`}
        >
          Games
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('props')}
          className={`h-8 rounded-full px-4 text-xs font-bold transition-all ${
            activeTab === 'props'
              ? 'bg-[#E4372B] text-white shadow-xs'
              : 'border border-line bg-card text-muted hover:text-ink'
          }`}
        >
          Props
        </button>
      </div>

      {/* Live In-Play Section */}
      {live.length > 0 && (
        <section className="mb-6">
          <div className="mb-2.5 flex items-center justify-between text-xs font-extrabold uppercase tracking-wider text-muted">
            <span className="flex items-center gap-1.5 text-live font-black">
              <span className="h-2 w-2 rounded-full bg-live animate-ping" />
              Live Now ({live.length})
            </span>
            <Link to="/live" className="text-muted hover:text-ink flex items-center gap-0.5">
              View all <ArrowRight size={12} />
            </Link>
          </div>
          <ul className="space-y-3">
            {live.map((m) => (
              <MatchRow key={m.id} id={m.id} showComp={compById[m.compId]?.short} />
            ))}
          </ul>
        </section>
      )}

      {/* "Today" Section Header (Exact Probly screenshot) */}
      <section className="mb-8">
        <div className="mb-3 text-[15px] font-black text-ink">
          Today
        </div>

        <ul className="space-y-3">
          {today.map((m) => (
            <MatchRow key={m.id} id={m.id} showComp={compById[m.compId]?.short} />
          ))}
        </ul>
      </section>

      {/* "Upcoming" Section */}
      {upcoming.length > 0 && (
        <section className="mb-8">
          <div className="mb-3 text-[15px] font-black text-ink">
            Upcoming
          </div>

          <ul className="space-y-3">
            {upcoming.map((m) => (
              <MatchRow key={m.id} id={m.id} showComp={compById[m.compId]?.short} />
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}

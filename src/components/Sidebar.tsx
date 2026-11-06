import {
  Activity,
  Award,
  CircleDot,
  Flame,
  Radio,
  Shield,
  Sparkles,
  Swords,
  Target,
  Trophy,
  Zap,
} from 'lucide-react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { competitions, sportPath, sports } from '../data/competitions'
import { useStore } from '../engine/store'
import { cx } from '../lib/format'
import { LiveDot } from './ui'

export function Sidebar() {
  const matches = useStore((s) => s.matches)
  const { pathname } = useLocation()

  const liveMatches = Object.values(matches).filter((m) => m.status === 'live')
  const count = (pred: (m: { compId: string; sport: string; status: string }) => boolean) =>
    Object.values(matches).filter((m) => m.status !== 'ft' && pred(m)).length
  const liveIn = (id: string) => Object.values(matches).filter((m) => m.sport === id && m.status === 'live').length

  const sportIcons: Record<string, any> = {
    football: CircleDot,
    basketball: Flame,
    americanfootball: Shield,
    baseball: Target,
    icehockey: Zap,
    cricket: Award,
    mma: Swords,
    tennis: Activity,
  }

  return (
    <aside
      className="sticky top-[var(--hdr,65px)] hidden h-[calc(100vh-var(--hdr,65px))] w-[240px] shrink-0 overflow-y-auto border-r border-line bg-page px-3 py-4 lg:block"
      aria-label="Sportsbook navigation"
    >
      {/* Top Prominent Live In-Play Button (Probly style) */}
      <div className="mb-4">
        <NavLink
          to="/live"
          className={({ isActive }) =>
            cx(
              'group flex items-center justify-between rounded-lg px-3 py-2.5 text-[14px] font-bold transition-all',
              isActive
                ? 'bg-live text-white shadow-md'
                : 'bg-card border border-line text-ink hover:border-live/60 hover:bg-sunk',
            )
          }
        >
          <div className="flex items-center gap-2.5">
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-live/20 text-live">
              <Radio size={15} className="animate-pulse" />
            </span>
            <span>Live In-Play</span>
          </div>
          <span
            className={cx(
              'tnum inline-flex h-5 items-center justify-center rounded-full px-2 text-[11px] font-extrabold',
              pathname === '/live' ? 'bg-white text-live' : 'bg-live text-white',
            )}
          >
            {liveMatches.length}
          </span>
        </NavLink>
      </div>

      {/* ALL SPORTS Header & List */}
      <div className="mb-6">
        <h2 className="mb-2 px-2 text-[11px] font-extrabold uppercase tracking-wider text-muted">
          All Sports
        </h2>
        <ul className="space-y-1">
          {sports.map((sp) => {
            const Icon = sportIcons[sp.id] || Trophy
            const total = count((m) => m.sport === sp.id)
            const inPlay = liveIn(sp.id)

            return (
              <li key={sp.id}>
                <NavLink
                  to={sportPath(sp.id)}
                  className={({ isActive }) =>
                    cx(
                      'flex h-10 items-center justify-between rounded-lg px-2.5 text-[13.5px] font-semibold transition-colors',
                      isActive
                        ? 'bg-card text-ink shadow-sm border border-line'
                        : 'text-ink/90 hover:bg-sunk hover:text-ink',
                    )
                  }
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <span className="flex h-5 w-5 items-center justify-center text-muted">
                      <Icon size={16} />
                    </span>
                    <span className="truncate">{sp.name}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11.5px] font-semibold text-muted">
                    {inPlay > 0 && (
                      <span className="inline-flex items-center gap-1 font-bold text-live">
                        <LiveDot /> <span className="tnum">{inPlay}</span>
                      </span>
                    )}
                    <span className="tnum rounded bg-sunk px-1.5 py-0.5 text-muted">{total}</span>
                  </div>
                </NavLink>
              </li>
            )
          })}
        </ul>
      </div>

      {/* TOP COMPETITIONS */}
      <div className="mb-6">
        <h2 className="mb-2 px-2 text-[11px] font-extrabold uppercase tracking-wider text-muted">
          Top Leagues
        </h2>
        <ul className="space-y-0.5">
          {competitions.slice(0, 8).map((c) => {
            const cTotal = count((m) => m.compId === c.id)
            return (
              <li key={c.id}>
                <Link
                  to={`${sportPath(c.sport)}#${c.id}`}
                  className="flex h-8 items-center justify-between rounded-md px-2 text-[12.5px] text-muted hover:bg-sunk hover:text-ink"
                >
                  <span className="truncate font-medium">{c.name}</span>
                  <span className="tnum text-[11px] opacity-75">{cTotal}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </div>

      {/* Housebets Wave 2 Mini Promo Card */}
      <div className="mt-auto rounded-lg border border-line bg-gradient-to-br from-[#1C1514] to-[#12100C] p-3 text-white">
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#FF6B5E]">
          <Sparkles size={12} /> WAVE 2 REWARDS
        </div>
        <p className="mt-1 text-[11px] leading-tight text-white/70">
          Earn points on all singles wagers in the $15K prototype demo.
        </p>
      </div>
    </aside>
  )
}

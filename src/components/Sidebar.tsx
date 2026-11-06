import { ChevronDown, Radio } from 'lucide-react'
import { NavLink, useLocation } from 'react-router-dom'
import { sportPath, sports } from '../data/competitions'
import { useStore } from '../engine/store'
import { cx } from '../lib/format'

export function Sidebar() {
  const matches = useStore((s) => s.matches)
  const { pathname } = useLocation()

  const liveMatches = Object.values(matches).filter((m) => m.status === 'live')
  const count = (pred: (m: { compId: string; sport: string; status: string }) => boolean) =>
    Object.values(matches).filter((m) => m.status !== 'ft' && pred(m)).length

  // Authentic Probly-style sport icons with colored SVG badges
  const sportMeta: Record<string, { label: string; iconBg: string; emoji: string; hasDropdown?: boolean }> = {
    americanfootball: { label: 'NFL', iconBg: '#013369', emoji: '🏈', hasDropdown: false },
    football: { label: 'Football', iconBg: '#2E7D32', emoji: '⚽', hasDropdown: true },
    baseball: { label: 'MLB', iconBg: '#002D72', emoji: '⚾', hasDropdown: false },
    tennis: { label: 'Tennis', iconBg: '#7CB342', emoji: '🎾', hasDropdown: true },
    icehockey: { label: 'NHL', iconBg: '#111111', emoji: '🏒', hasDropdown: false },
    mma: { label: 'UFC', iconBg: '#D20A0A', emoji: '🥊', hasDropdown: false },
    basketball: { label: 'Basketball', iconBg: '#E65100', emoji: '🏀', hasDropdown: true },
    cricket: { label: 'Cricket', iconBg: '#0288D1', emoji: '🏏', hasDropdown: true },
  }

  return (
    <aside
      className="sticky top-[var(--hdr,65px)] hidden h-[calc(100vh-var(--hdr,65px))] w-[200px] shrink-0 overflow-y-auto border-r border-line bg-page px-3 py-4 text-[13.5px] lg:block"
      aria-label="Probly Sportsbook Navigation"
    >
      {/* 1. Top Live Item with Red Radio Icon */}
      <div className="mb-4">
        <NavLink
          to="/live"
          className={({ isActive }) =>
            cx(
              'flex items-center justify-between rounded-lg px-3 py-2.5 font-medium transition-colors',
              isActive
                ? 'bg-sunk font-bold text-ink'
                : 'text-ink/90 hover:bg-sunk hover:text-ink',
            )
          }
        >
          <div className="flex items-center gap-2.5">
            <Radio size={16} className="text-[#E4372B] animate-pulse" />
            <span className="font-semibold">Live</span>
          </div>
          <span className="tnum text-xs font-semibold text-muted">
            {liveMatches.length || 1}
          </span>
        </NavLink>
      </div>

      <div className="mb-3 border-t border-line/60" />

      {/* 2. ALL SPORTS Section Header */}
      <div className="px-3 pb-2 pt-1">
        <span className="text-[11px] font-bold uppercase tracking-wider text-muted">
          All Sports
        </span>
      </div>

      {/* 3. Sport List (Exact Probly screenshot format) */}
      <ul className="space-y-0.5">
        {sports.map((sp) => {
          const meta = sportMeta[sp.id] || { label: sp.name, iconBg: '#333333', emoji: '🏆' }
          const total = count((m) => m.sport === sp.id)
          const isCurrent = pathname === sportPath(sp.id) || (sp.id === 'football' && pathname === '/')

          return (
            <li key={sp.id}>
              <NavLink
                to={sportPath(sp.id)}
                className={({ isActive }) =>
                  cx(
                    'group flex h-10 items-center justify-between rounded-lg px-2.5 transition-colors',
                    isActive || isCurrent
                      ? 'bg-sunk font-bold text-ink'
                      : 'text-ink/85 hover:bg-sunk/60 hover:text-ink',
                  )
                }
              >
                <div className="flex items-center gap-2.5 truncate">
                  <span
                    style={{ backgroundColor: meta.iconBg }}
                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[13px] shadow-xs"
                    aria-hidden="true"
                  >
                    {meta.emoji}
                  </span>
                  <span className="truncate">{meta.label}</span>
                </div>

                <div className="flex items-center gap-1 text-xs text-muted">
                  <span className="tnum font-medium">{total}</span>
                  {meta.hasDropdown && (
                    <ChevronDown size={13} className="text-muted/70 group-hover:text-ink" />
                  )}
                </div>
              </NavLink>
            </li>
          )
        })}
      </ul>
    </aside>
  )
}

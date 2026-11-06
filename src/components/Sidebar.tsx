import { House, Radio, Ticket } from 'lucide-react'
import type { ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import { competitions, sportPath, sports } from '../data/competitions'
import { useStore } from '../engine/store'
import { cx } from '../lib/format'
import { SportIcon } from '../lib/sportIcons'

const item = (active: boolean) =>
  cx(
    'flex h-10 items-center gap-2.5 rounded-s border-l-2 px-2 text-[13.5px] transition-colors',
    active ? 'border-brand bg-brand/10 font-bold text-ink' : 'border-transparent font-medium text-ink/85 hover:bg-sunk/70 hover:text-ink',
  )

function Count({ n, live }: { n: number; live?: boolean }) {
  return <span className={cx('tnum ml-auto text-[12px] font-semibold', live ? 'text-live' : 'text-muted')}>{n}</span>
}

function Item({ to, end, icon, label, count }: { to: string; end?: boolean; icon: ReactNode; label: string; count?: ReactNode }) {
  return (
    <li>
      <NavLink to={to} end={end} className={({ isActive }) => item(isActive)}>
        {icon}
        <span className="truncate">{label}</span>
        {count}
      </NavLink>
    </li>
  )
}

/** Desktop left nav: Home, Live, every sport (football competitions listed), My bets. */
export function Sidebar() {
  const matches = useStore((s) => s.matches)
  const all = Object.values(matches)
  const liveN = all.filter((m) => m.status === 'live').length
  const count = (sport: string) => all.filter((m) => m.sport === sport && m.status !== 'ft').length
  const football = competitions.filter((c) => c.sport === 'football')

  return (
    <nav
      aria-label="Sports navigation"
      className="sticky top-[var(--hdr,65px)] hidden h-[calc(100vh-var(--hdr,65px))] w-[216px] shrink-0 overflow-y-auto border-r border-line bg-card px-3 py-4 lg:block"
    >
      <ul className="space-y-0.5">
        <Item to="/" end icon={<House size={16} aria-hidden="true" />} label="Home" />
        <Item to="/live" icon={<Radio size={16} className="text-live" aria-hidden="true" />} label="Live" count={<Count n={liveN} live />} />
        <Item to="/bets" icon={<Ticket size={16} aria-hidden="true" />} label="Bet slip & My bets" />
      </ul>

      <p className="mb-1.5 mt-5 px-2.5 text-[11px] font-bold uppercase tracking-wider text-muted">Sports</p>
      <ul className="space-y-0.5">
        {sports.map((sp) => (
          <li key={sp.id}>
            <NavLink to={sportPath(sp.id)} className={({ isActive }) => item(isActive)}>
              <SportIcon id={sp.id} />
              <span className="truncate">{sp.name}</span>
              <Count n={count(sp.id)} />
            </NavLink>
            {sp.id === 'football' && (
              <ul className="mb-1 ml-[22px] border-l border-line pl-2">
                {football.map((c) => (
                  <li key={c.id}>
                    <NavLink to={`/football#${c.id}`} className="flex h-8 items-center rounded-s px-2 text-[12.5px] font-medium text-muted hover:bg-sunk/70 hover:text-ink">
                      {c.name}
                    </NavLink>
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </nav>
  )
}

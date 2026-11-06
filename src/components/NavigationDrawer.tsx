import { useEffect } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { House, Radio, Sparkles, Ticket, Wallet, X } from 'lucide-react'
import { sportPath, sports } from '../data/competitions'
import { useStore } from '../engine/store'
import { cx, fmtUSDT } from '../lib/format'
import { SportIcon } from '../lib/sportIcons'
import { Logo } from './Logo'
import { ThemeToggle } from './ThemeToggle'

const row = ({ isActive }: { isActive: boolean }) =>
  cx(
    'flex h-11 items-center gap-3 rounded-s px-3 text-[14px] transition-colors',
    isActive ? 'bg-sunk font-bold text-ink' : 'font-medium text-ink hover:bg-sunk',
  )

/** Phone / tablet menu. Same items and counts as the desktop left nav. */
export function NavigationDrawer({ open, onClose, onOpenWallet }: { open: boolean; onClose: () => void; onOpenWallet: () => void }) {
  const balance = useStore((s) => s.balance)
  const matches = useStore((s) => s.matches)
  const openBets = useStore((s) => s.bets.filter((b) => b.status === 'open').length)
  const all = Object.values(matches)
  const liveN = all.filter((m) => m.status === 'live').length

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[80] flex justify-end bg-black/50" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        onClick={(e) => e.stopPropagation()}
        className="flex h-full w-full max-w-[320px] flex-col border-l border-line bg-card"
      >
        <div className="flex items-center justify-between border-b border-line px-4 py-3">
          <Link to="/" onClick={onClose}><Logo /></Link>
          <div className="flex items-center gap-1">
          <ThemeToggle />
          <button type="button" onClick={onClose} aria-label="Close menu" className="flex h-11 w-11 items-center justify-center rounded-s text-muted hover:bg-sunk hover:text-ink">
            <X size={18} />
          </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3">
          <button
            type="button"
            onClick={onOpenWallet}
            className="mb-3 flex w-full items-center justify-between rounded-m border border-line bg-sunk px-3.5 py-3 text-left"
          >
            <span className="flex items-center gap-2 text-[13px] font-semibold text-muted"><Wallet size={15} aria-hidden="true" /> Demo wallet</span>
            <span className="tnum text-[15px] font-extrabold">{fmtUSDT(balance)} <span className="text-[11px] text-muted">USDT</span></span>
          </button>

          <nav aria-label="Menu">
            <ul className="space-y-0.5">
              <li><NavLink to="/" end onClick={onClose} className={row}><House size={16} aria-hidden="true" /> Home</NavLink></li>
              <li>
                <NavLink to="/live" onClick={onClose} className={row}>
                  <Radio size={16} className="text-live" aria-hidden="true" /> Live
                  <span className="tnum ml-auto text-[12px] font-bold text-live">{liveN}</span>
                </NavLink>
              </li>
              <li>
                <NavLink to="/bets" onClick={onClose} className={row}>
                  <Ticket size={16} aria-hidden="true" /> Bet slip & My bets
                  {openBets > 0 && <span className="tnum ml-auto text-[12px] font-semibold text-muted">{openBets} open</span>}
                </NavLink>
              </li>
              <li><NavLink to="/features" onClick={onClose} className={row}><Sparkles size={16} className="text-brand" aria-hidden="true" /> Play lab</NavLink></li>
            </ul>

            <p className="mb-1 mt-4 px-3 text-[11px] font-bold uppercase tracking-wider text-muted">Sports</p>
            <ul className="space-y-0.5">
              {sports.map((sp) => (
                <li key={sp.id}>
                  <NavLink to={sportPath(sp.id)} onClick={onClose} className={row}>
                    <SportIcon id={sp.id} /> {sp.name}
                    <span className="tnum ml-auto text-[12px] font-semibold text-muted">
                      {all.filter((m) => m.sport === sp.id && m.status !== 'ft').length}
                    </span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <p className="border-t border-line px-4 py-3 text-[12px] text-muted">Real team identities, fictional player names and simulated fixtures. Demo balance only; no real-money wagers.</p>
      </div>
    </div>
  )
}

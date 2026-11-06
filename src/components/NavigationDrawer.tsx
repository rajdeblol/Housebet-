import { useEffect } from 'react'
import { Link, NavLink } from 'react-router-dom'
import {
  X,
  Wallet,
  Radio,
  Flame,
  Bookmark,
  Receipt,
  Sparkles,
  ChevronRight,
  PlusCircle,
} from 'lucide-react'
import { useStore } from '../engine/store'
import { fmtUSDT, cx } from '../lib/format'
import { Logo } from './Logo'
import { ThemeToggle } from './ThemeToggle'

interface NavigationDrawerProps {
  open: boolean
  onClose: () => void
  onOpenWallet: () => void
}

const sportsList = [
  { id: 'football', label: 'Football', path: '/football', emoji: '⚽', count: 18 },
  { id: 'basketball', label: 'Basketball', path: '/sport/basketball', emoji: '🏀', count: 9 },
  { id: 'cricket', label: 'Cricket', path: '/sport/cricket', emoji: '🏏', count: 6, featured: true },
  { id: 'tennis', label: 'Tennis', path: '/sport/tennis', emoji: '🎾', count: 12 },
  { id: 'mma', label: 'MMA / UFC', path: '/sport/mma', emoji: '🥊', count: 5 },
  { id: 'americanfootball', label: 'NFL', path: '/sport/americanfootball', emoji: '🏈', count: 7 },
  { id: 'baseball', label: 'Baseball', path: '/sport/baseball', emoji: '⚾', count: 4 },
  { id: 'icehockey', label: 'Ice Hockey', path: '/sport/icehockey', emoji: '🏒', count: 8 },
]

export function NavigationDrawer({ open, onClose, onOpenWallet }: NavigationDrawerProps) {
  const balance = useStore((s) => s.balance)
  const bets = useStore((s) => s.bets)
  const openBetsCount = bets.filter((b) => b.status === 'open').length

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[80] flex justify-end bg-black/60 backdrop-blur-xs transition-opacity"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Navigation Menu"
        onClick={(e) => e.stopPropagation()}
        className="flex h-full w-full max-w-[340px] flex-col border-l border-line bg-card shadow-2xl transition-transform"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-line px-5 py-4 bg-sunk/30">
          <Link to="/" onClick={onClose} className="shrink-0">
            <Logo />
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button
              type="button"
              onClick={onClose}
              aria-label="Close navigation menu"
              className="flex h-8 w-8 items-center justify-center rounded-full text-muted hover:bg-sunk hover:text-ink transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
          {/* Wallet Balance Card in Drawer */}
          <div className="rounded-xl border border-line bg-gradient-to-br from-[#E4372B]/10 to-transparent p-3.5">
            <div className="flex items-center justify-between text-xs text-muted font-bold">
              <span className="flex items-center gap-1.5">
                <Wallet size={14} className="text-[#E4372B]" /> My Wallet
              </span>
              <span className="text-[10px] uppercase tracking-wider text-emerald-500 font-extrabold">Instant</span>
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-black tnum text-ink">
                ${fmtUSDT(balance)} <span className="text-xs text-[#E4372B]">USDT</span>
              </span>
              <button
                type="button"
                onClick={onOpenWallet}
                className="flex items-center gap-1 rounded-full bg-[#E4372B] px-3 py-1 text-xs font-bold text-white shadow-xs hover:bg-[#CF3428] active:scale-95 transition-all"
              >
                <PlusCircle size={13} /> Deposit
              </button>
            </div>
          </div>

          {/* Quick Nav: Live & Bets */}
          <div className="space-y-1">
            <p className="px-2 text-[10px] font-black uppercase tracking-wider text-muted">
              Live & Markets
            </p>
            <NavLink
              to="/live"
              onClick={onClose}
              className={({ isActive }) =>
                cx(
                  'flex items-center justify-between rounded-xl px-3 py-2.5 text-xs font-bold transition-colors',
                  isActive ? 'bg-[#E4372B] text-white' : 'text-ink hover:bg-sunk',
                )
              }
            >
              <div className="flex items-center gap-2.5">
                <Radio size={15} className="text-[#E4372B] animate-pulse" />
                <span>Live Matches In-Play</span>
              </div>
              <span className="rounded-full bg-live/20 px-2 py-0.5 text-[10px] font-extrabold text-[#E4372B]">
                14
              </span>
            </NavLink>

            <NavLink
              to="/bets"
              onClick={onClose}
              className={({ isActive }) =>
                cx(
                  'flex items-center justify-between rounded-xl px-3 py-2.5 text-xs font-bold transition-colors',
                  isActive ? 'bg-[#E4372B] text-white' : 'text-ink hover:bg-sunk',
                )
              }
            >
              <div className="flex items-center gap-2.5">
                <Receipt size={15} className="text-muted" />
                <span>My Bets</span>
              </div>
              {openBetsCount > 0 && (
                <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-extrabold text-emerald-400">
                  {openBetsCount} Open
                </span>
              )}
            </NavLink>

            <Link
              to="/"
              onClick={onClose}
              className="flex items-center justify-between rounded-xl px-3 py-2.5 text-xs font-bold text-ink hover:bg-sunk transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <Flame size={15} className="text-amber-500" />
                <span>Trending Markets</span>
              </div>
              <ChevronRight size={14} className="text-muted" />
            </Link>

            <Link
              to="/"
              onClick={onClose}
              className="flex items-center justify-between rounded-xl px-3 py-2.5 text-xs font-bold text-ink hover:bg-sunk transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <Bookmark size={15} className="text-muted" />
                <span>Watchlist</span>
              </div>
              <ChevronRight size={14} className="text-muted" />
            </Link>
          </div>

          {/* All Sports List */}
          <div className="space-y-1 pt-2">
            <p className="px-2 text-[10px] font-black uppercase tracking-wider text-muted">
              All Sports
            </p>
            {sportsList.map((sport) => (
              <NavLink
                key={sport.id}
                to={sport.path}
                onClick={onClose}
                className={({ isActive }) =>
                  cx(
                    'flex items-center justify-between rounded-xl px-3 py-2 text-xs font-bold transition-colors',
                    isActive ? 'bg-sunk text-[#E4372B] font-black' : 'text-ink/90 hover:bg-sunk/60',
                    sport.featured && 'border border-amber-500/20 bg-amber-500/5',
                  )
                }
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-sm">{sport.emoji}</span>
                  <span>{sport.label}</span>
                  {sport.featured && (
                    <span className="rounded-full bg-amber-500/20 px-1.5 py-0.2 text-[9px] font-black text-amber-500 uppercase">
                      Popular
                    </span>
                  )}
                </div>
                <span className="text-[11px] font-semibold text-muted">{sport.count}</span>
              </NavLink>
            ))}
          </div>

          {/* Wave 2 Promo Callout */}
          <div className="rounded-xl border border-[#E4372B]/30 bg-[#E4372B]/5 p-3 text-xs">
            <div className="flex items-center gap-2 font-black text-[#E4372B]">
              <Sparkles size={14} />
              <span>Wave 2 Campaign Live</span>
            </div>
            <p className="mt-1 text-[11px] text-muted">
              $5,000,000 USDT prize pool. Place singles to earn Wave points!
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-line bg-sunk/30 px-5 py-3 text-center">
          <p className="text-[11px] font-semibold text-muted">
            Housebets Contest Labs · 18+ Play Responsibly
          </p>
        </div>
      </div>
    </div>
  )
}

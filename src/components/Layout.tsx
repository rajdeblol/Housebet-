import {
  Menu,
  Radio,
  Search as SearchIcon,
  WifiOff,
  X,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { isOffline, useStore } from '../engine/store'
import { cx, fmtUSDT } from '../lib/format'
import { BetSlip } from './slip/BetSlip'
import { MobileSlip } from './slip/MobileSlip'
import { Logo } from './Logo'
import { ThemeToggle } from './ThemeToggle'
import { Search } from './Search'
import { Toasts } from './Toasts'
import { DemoPanel } from './DemoPanel'
import { BetCardModal } from './card/BetCardModal'
import { Sidebar } from './Sidebar'
import { WalletModal } from './WalletModal'
import { NavigationDrawer } from './NavigationDrawer'

const tab = ({ isActive }: { isActive: boolean }) =>
  cx(
    'flex h-11 shrink-0 items-center gap-1.5 border-b-2 text-[13.5px] font-semibold transition-colors',
    isActive ? 'border-brand text-ink' : 'border-transparent text-muted hover:text-ink',
  )

function TopBar({ onOpenWallet, onOpenMenu }: { onOpenWallet: () => void; onOpenMenu: () => void }) {
  const balance = useStore((s) => s.balance)
  const liveN = useStore((s) => Object.values(s.matches).filter((m) => m.status === 'live').length)
  const [searchOpen, setSearchOpen] = useState(false)
  const { pathname } = useLocation()
  const ref = useRef<HTMLElement>(null)

  useEffect(() => setSearchOpen(false), [pathname])
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const ro = new ResizeObserver(() =>
      document.documentElement.style.setProperty('--hdr', `${el.offsetHeight}px`),
    )
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  return (
    <header ref={ref} className="sticky top-0 z-40 border-b border-line bg-card/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-[1520px] items-center justify-between gap-3 px-4 lg:px-6">
        <div className="flex min-w-0 items-center gap-6">
          <Link to="/" aria-label="Housebets home" className="shrink-0">
            <Logo />
          </Link>
          <div className="hidden w-[340px] lg:block">
            <Search />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-s border border-line bg-card lg:hidden"
            aria-label={searchOpen ? 'Close search' : 'Search teams, players, competitions and markets'}
            aria-expanded={searchOpen}
            onClick={() => setSearchOpen((v) => !v)}
          >
            {searchOpen ? <X size={18} /> : <SearchIcon size={18} />}
          </button>

          <div className="hidden sm:block"><ThemeToggle /></div>

          <button
            type="button"
            onClick={onOpenWallet}
            className="flex h-11 items-center gap-2 rounded-s border border-line bg-card px-3 text-[13px] font-semibold text-ink transition-colors hover:border-ink lg:h-10"
            aria-label={`Demo balance ${fmtUSDT(balance)} USDT. Open demo wallet`}
          >
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-brand sm:text-muted">Demo</span>
            <span className="tnum font-extrabold">{fmtUSDT(balance)}</span>
            <span className="hidden text-[11px] font-bold text-muted sm:inline">USDT</span>
          </button>

          <button
            type="button"
            onClick={onOpenMenu}
            className="flex h-11 w-11 items-center justify-center rounded-s border border-line bg-card text-ink transition-colors hover:border-ink lg:hidden"
            aria-label="Open menu"
          >
            <Menu size={18} />
          </button>
        </div>
      </div>

      {searchOpen && (
        <div className="border-t border-line px-4 py-2.5 lg:hidden">
          <Search autoFocus onDone={() => setSearchOpen(false)} />
        </div>
      )}

      {/* Phones and tablets: the four main pages (desktop uses the left nav) */}
      <nav aria-label="Main" className="no-scrollbar border-t border-line/70 px-4 lg:hidden">
        <div className="flex items-center gap-6 overflow-x-auto">
          <NavLink to="/" end className={tab}>Home</NavLink>
          <NavLink to="/live" className={tab}>
            <Radio size={14} className="text-live" aria-hidden="true" /> Live
            <span className="tnum rounded-full bg-live/15 px-1.5 text-[11px] font-bold text-live">{liveN}</span>
          </NavLink>
          <NavLink to="/football" className={tab}>Football</NavLink>
          <NavLink to="/bets" className={tab}>My bets</NavLink>
        </div>
      </nav>
    </header>
  )
}

function OfflineBanner() {
  const offline = useStore(isOffline)
  if (!offline) return null
  return (
    <div role="status" className="border-b border-line bg-warnBg">
      <p className="mx-auto flex max-w-[1520px] items-center gap-2 px-4 py-2 text-[13px] font-semibold text-warn lg:px-6">
        <WifiOff size={15} /> Prices paused while offline.
      </p>
    </div>
  )
}

export function Footer() {
  return (
    <footer className="mt-12 border-t border-line pt-6 pb-4 text-xs text-muted">
      <p>Demo mode · simulated fixtures, prices and wallet. No real money or wagers. · 18+, play responsibly.</p>
    </footer>
  )
}

export function Layout() {
  const { pathname, hash } = useLocation()
  const [walletOpen, setWalletOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    if (!hash) window.scrollTo(0, 0)
  }, [pathname, hash])

  return (
    <div
      className="min-h-screen bg-page text-ink antialiased"
      style={{ backgroundImage: 'radial-gradient(ellipse at 14% 0%, rgb(var(--brand) / .07), transparent 34%), radial-gradient(ellipse at 92% 8%, rgba(124, 92, 255, .055), transparent 30%)', backgroundAttachment: 'fixed' }}
    >
      <TopBar
        onOpenWallet={() => setWalletOpen(true)}
        onOpenMenu={() => setMenuOpen(true)}
      />
      <OfflineBanner />

      <div className="mx-auto flex max-w-[1520px]">
        <Sidebar />

        <main id="main" className="min-w-0 flex-1 px-4 pb-32 pt-5 sm:px-6 lg:pb-10">
          <Outlet />
          <Footer />
        </main>

        <aside
          aria-label="Bet slip"
          className="sticky top-[var(--hdr,105px)] hidden h-[calc(100vh-var(--hdr,105px))] w-[340px] shrink-0 border-l border-line xl:block"
        >
          <BetSlip />
        </aside>
      </div>

      <MobileSlip />
      <DemoPanel />
      <Toasts />
      <BetCardModal />
      <WalletModal open={walletOpen} onClose={() => setWalletOpen(false)} />
      <NavigationDrawer
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        onOpenWallet={() => {
          setMenuOpen(false)
          setWalletOpen(true)
        }}
      />
    </div>
  )
}

import {
  Bookmark,
  ChevronRight,
  Flame,
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

function TopBar({ onOpenWallet, onOpenMenu }: { onOpenWallet: () => void; onOpenMenu: () => void }) {
  const balance = useStore((s) => s.balance)
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
    <header ref={ref} className="sticky top-0 z-40 border-b border-line bg-page/95 backdrop-blur-md">
      {/* 1. Main Header Row (Logo, Search, Promo Ticker, Get Started) */}
      <div className="mx-auto flex h-14 max-w-[1520px] items-center justify-between gap-4 px-4 lg:px-6">
        <div className="flex items-center gap-4">
          <Link to="/" aria-label="Housebets home" className="shrink-0">
            <Logo />
          </Link>

          {/* Central Pill Search Bar (Probly style: "Search what you need") */}
          <div className="hidden w-[320px] lg:block">
            <Search />
          </div>
        </div>

        {/* Promo Wave Ticker in Middle */}
        <div className="hidden items-center gap-2 text-xs font-bold md:flex">
          <span className="text-[#E4372B]">WAVE 2</span>
          <span className="text-muted/60">·</span>
          <span className="text-ink/80">($5,000,000 USDT)</span>
          <span className="rounded-full bg-[#E4372B]/10 px-2 py-0.5 text-[10px] font-extrabold uppercase text-[#E4372B]">
            Singles Only
          </span>
        </div>

        {/* Right Actions: Get Started / Wallet + Hamburger */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-line bg-card lg:hidden"
            aria-label={searchOpen ? 'Close search' : 'Open search'}
            onClick={() => setSearchOpen((v) => !v)}
          >
            {searchOpen ? <X size={16} /> : <SearchIcon size={16} />}
          </button>

          <ThemeToggle />

          {/* Wallet / Balance Pill (Clickable button) */}
          <button
            type="button"
            onClick={onOpenWallet}
            className="flex h-9 items-center gap-2 rounded-full border border-line bg-card px-3 text-xs font-bold text-ink shadow-2xs hover:border-[#E4372B]/60 hover:bg-sunk/60 transition-all cursor-pointer"
            title="Open Housebets Wallet & Deposit"
          >
            <span className="text-muted">Wallet:</span>
            <span className="tnum text-[#E4372B] font-extrabold">${fmtUSDT(balance)}</span>
          </button>

          {/* Get Started Pill Button (Probly purple -> Housebets Crimson) */}
          <Link
            to="/bets"
            className="inline-flex h-9 items-center justify-center rounded-full bg-[#E4372B] px-4 text-xs font-extrabold text-white shadow-xs transition-transform hover:bg-[#CF3428] active:scale-95"
          >
            Get Started
          </Link>

          {/* 3-lines Hamburger Menu button */}
          <button
            type="button"
            onClick={onOpenMenu}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-line bg-card text-ink hover:bg-sunk hover:border-[#E4372B]/50 transition-colors cursor-pointer"
            aria-label="Open Navigation Menu"
            title="Open Menu"
          >
            <Menu size={16} />
          </button>
        </div>
      </div>

      {searchOpen && (
        <div className="border-t border-line px-4 py-2.5 lg:hidden">
          <Search autoFocus onDone={() => setSearchOpen(false)} />
        </div>
      )}

      {/* 2. Sub-Header Horizontal Category Tabs (Watchlist, Trending, Live 22, Sports, etc.) */}
      <div className="no-scrollbar border-t border-line/70 px-4 lg:px-6">
        <div className="mx-auto flex max-w-[1520px] items-center gap-6 overflow-x-auto text-[13px] font-semibold">
          <button
            type="button"
            className="flex h-10 items-center gap-1.5 text-muted hover:text-ink shrink-0"
          >
            <Bookmark size={14} />
            <span>Watchlist</span>
          </button>

          <button
            type="button"
            className="flex h-10 items-center gap-1.5 text-muted hover:text-ink shrink-0"
          >
            <Flame size={14} className="text-amber-500" />
            <span>Trending</span>
          </button>

          <NavLink
            to="/live"
            className={({ isActive }) =>
              cx(
                'flex h-10 items-center gap-1.5 shrink-0 transition-colors',
                isActive ? 'border-b-2 border-[#E4372B] font-bold text-ink' : 'text-muted hover:text-ink',
              )
            }
          >
            <Radio size={13} className="text-[#E4372B] animate-pulse" />
            <span>Live</span>
            <span className="tnum rounded-full bg-live/15 px-1.5 py-0.2 text-[10px] font-extrabold text-[#E4372B]">
              14
            </span>
          </NavLink>

          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              cx(
                'flex h-10 items-center gap-1.5 shrink-0 transition-colors',
                isActive ? 'border-b-2 border-ink font-bold text-ink' : 'text-muted hover:text-ink',
              )
            }
          >
            <span>Sports</span>
          </NavLink>

          <NavLink
            to="/football"
            className={({ isActive }) =>
              cx(
                'flex h-10 items-center gap-1.5 shrink-0 transition-colors',
                isActive ? 'border-b-2 border-ink font-bold text-ink' : 'text-muted hover:text-ink',
              )
            }
          >
            <span>Football</span>
          </NavLink>

          <Link to="/sport/basketball" className="flex h-10 items-center text-muted hover:text-ink shrink-0">
            <span>Basketball</span>
          </Link>

          <Link to="/sport/americanfootball" className="flex h-10 items-center text-muted hover:text-ink shrink-0">
            <span>NFL</span>
          </Link>

          <Link to="/sport/tennis" className="flex h-10 items-center text-muted hover:text-ink shrink-0">
            <span>Tennis</span>
          </Link>

          <Link to="/sport/mma" className="flex h-10 items-center text-muted hover:text-ink shrink-0">
            <span>MMA / UFC</span>
          </Link>

          <Link to="/sport/cricket" className="flex h-10 items-center text-muted hover:text-ink shrink-0">
            <span>Cricket</span>
          </Link>

          <Link to="/bets" className="flex h-10 items-center text-muted hover:text-ink shrink-0">
            <span>My Bets</span>
          </Link>

          <div className="ml-auto flex items-center gap-1 text-muted">
            <ChevronRight size={14} />
          </div>
        </div>
      </div>
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
      <p>Housebets Sportsbook · 5-Page Clickable Singles Prototype · 18+, play responsibly.</p>
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
    <div className="min-h-screen bg-page text-ink antialiased">
      <TopBar
        onOpenWallet={() => setWalletOpen(true)}
        onOpenMenu={() => setMenuOpen(true)}
      />
      <OfflineBanner />

      <div className="mx-auto flex max-w-[1520px]">
        {/* Left Column: Probly-style Sport Sidebar */}
        <Sidebar />

        {/* Middle Column: Feed */}
        <main id="main" className="min-w-0 flex-1 px-4 pb-32 pt-5 sm:px-6 lg:pb-10">
          <Outlet />
          <Footer />
        </main>

        {/* Right Column: Probly-style Single Betslip Widget */}
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

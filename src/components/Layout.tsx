import { Activity, CircleDot, Home, Receipt, Search as SearchIcon, Star, WifiOff, X } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
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
import { LiveDot } from './ui'
import { Sidebar } from './Sidebar'

/** The match we promote as "Top match" in the main nav. */
export function useTopMatchId() {
  const matches = useStore((s) => s.matches)
  return useMemo(() => {
    const live = Object.values(matches).filter((m) => m.status === 'live')
    if (matches['har-red']?.status === 'live') return 'har-red'
    if (live[0]) return live[0].id
    return Object.values(matches).filter((m) => m.status === 'upcoming').sort((a, b) => a.kickoff - b.kickoff)[0]?.id ?? 'har-red'
  }, [matches])
}

function MainNav({ className }: { className?: string }) {
  const liveCount = useStore((s) => Object.values(s.matches).filter((m) => m.status === 'live').length)
  const openBets = useStore((s) => s.bets.filter((b) => b.status === 'open').length)
  const top = useTopMatchId()
  const { pathname } = useLocation()
  const items = [
    { to: '/', label: 'Home', icon: Home, end: true },
    { to: '/live', label: 'Live', icon: Activity, badge: liveCount, live: true },
    { to: '/football', label: 'Football', icon: CircleDot },
    { to: `/match/${top}`, label: 'Top match', icon: Star, activeWhen: pathname.startsWith('/match/') },
    { to: '/bets', label: 'Bet slip & My bets', short: 'My bets', icon: Receipt, badge: openBets },
  ]
  return (
    <nav aria-label="Main" className={className}>
      <ul className="flex items-center gap-1">
        {items.map((it) => (
          <li key={it.label} className="shrink-0">
            <NavLink
              to={it.to}
              end={it.end}
              className={({ isActive }) => cx(
                'relative flex h-10 items-center gap-2 rounded-lg px-3 text-[13.5px] font-semibold transition-colors',
                (it.activeWhen ?? isActive) ? 'bg-ink text-white shadow-xs' : 'text-ink hover:bg-sunk',
              )}
            >
              {it.live && it.badge ? <LiveDot /> : <it.icon size={15} aria-hidden="true" />}
              <span className="hidden xl:inline">{it.label}</span>
              <span className="xl:hidden">{it.short ?? it.label}</span>
              {!!it.badge && (
                <span className={cx('tnum inline-flex h-5 min-w-5 items-center justify-center gap-1 rounded-full px-1.5 text-[11px] font-bold', it.live ? 'bg-live text-white' : 'bg-sunk text-ink')}>
                  {it.badge}
                </span>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}

function Header() {
  const balance = useStore((s) => s.balance)
  const [searchOpen, setSearchOpen] = useState(false)
  const { pathname } = useLocation()
  const ref = useRef<HTMLElement>(null)
  useEffect(() => setSearchOpen(false), [pathname])
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const ro = new ResizeObserver(() => document.documentElement.style.setProperty('--hdr', `${el.offsetHeight}px`))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  return (
    <header ref={ref} className="sticky top-0 z-40 border-b border-line bg-page/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-[1520px] items-center justify-between gap-3 px-4 sm:gap-4 lg:px-6">
        <div className="flex items-center gap-4">
          <Link to="/" aria-label="Housebets home" className="shrink-0 rounded-lg"><Logo /></Link>
          <MainNav className="hidden lg:block" />
        </div>

        {/* Central Search Bar (Probly style) */}
        <div className="hidden max-w-[360px] flex-1 lg:block">
          <Search />
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-line bg-card lg:hidden"
            aria-label={searchOpen ? 'Close search' : 'Open search'}
            aria-expanded={searchOpen}
            onClick={() => setSearchOpen((v) => !v)}
          >
            {searchOpen ? <X size={18} aria-hidden="true" /> : <SearchIcon size={18} aria-hidden="true" />}
          </button>

          <ThemeToggle />

          {/* USDT Demo Balance */}
          <div className="flex h-10 shrink-0 items-center gap-2 rounded-lg border border-line bg-card px-3 shadow-xs" aria-label={`Demo balance ${fmtUSDT(balance)} USDT`}>
            <div className="flex flex-col text-right leading-none">
              <span className="text-[9.5px] font-extrabold uppercase tracking-wider text-muted">Balance</span>
              <span className="tnum text-[13.5px] font-bold">{fmtUSDT(balance)} <span className="text-[10.5px] text-muted">USDT</span></span>
            </div>
            <span className="rounded bg-[#E4372B]/15 px-1.5 py-0.5 text-[9.5px] font-black uppercase tracking-wider text-[#E4372B]">
              DEMO
            </span>
          </div>
        </div>
      </div>
      {searchOpen && <div className="border-t border-line px-4 py-3 lg:hidden"><Search autoFocus onDone={() => setSearchOpen(false)} /></div>}
      <MainNav className="no-scrollbar overflow-x-auto border-t border-line px-2 py-1 lg:hidden" />
    </header>
  )
}

function OfflineBanner() {
  const offline = useStore(isOffline)
  if (!offline) return null
  return (
    <div role="status" className="border-b border-line bg-warnBg">
      <p className="mx-auto flex max-w-[1520px] items-center gap-2 px-4 py-2.5 text-[14px] font-medium text-warn lg:px-6">
        <WifiOff size={16} aria-hidden="true" /> You're offline. Prices are paused and bets can't be placed until you reconnect.
      </p>
    </div>
  )
}

export function Footer() {
  return (
    <footer className="mt-12 border-t border-line pt-5 pb-2 text-[12.5px] text-muted">
      <p>Housebets Sportsbook prototype · 5-Page Clickable Singles Engine · 18+, play responsibly.</p>
    </footer>
  )
}

export function Layout() {
  const { pathname, hash } = useLocation()
  useEffect(() => { if (!hash) window.scrollTo(0, 0) }, [pathname, hash])
  return (
    <div className="min-h-screen bg-page text-ink antialiased">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[100] focus:rounded-lg focus:bg-ink focus:px-3 focus:py-2 focus:text-white">Skip to content</a>
      <Header />
      <OfflineBanner />
      <div className="mx-auto flex max-w-[1520px]">
        <Sidebar />
        <main id="main" className="min-w-0 flex-1 px-4 pb-32 pt-5 lg:px-6 lg:pb-10">
          <Outlet />
          <Footer />
        </main>
        <aside aria-label="Bet slip" className="sticky top-[var(--hdr,65px)] hidden h-[calc(100vh-var(--hdr,65px))] w-[340px] shrink-0 border-l border-line xl:block">
          <BetSlip />
        </aside>
      </div>
      <MobileSlip />
      <DemoPanel />
      <Toasts />
      <BetCardModal />
    </div>
  )
}

import { ChevronDown, ChevronLeft } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { compById } from '../data/competitions'
import { teams } from '../data/teams'
import { FlipScore } from '../components/match/FlipScore'
import { MarketCard } from '../components/match/MarketCard'
import { Timeline } from '../components/match/Timeline'
import { Crest, FollowButton, LiveDot } from '../components/ui'
import { NotFound } from './NotFound'
import { groups } from '../engine/pricing'
import { useStore } from '../engine/store'
import type { GroupId, Match } from '../engine/types'
import { clockFull, clockLabel, cx, kickoffLabel } from '../lib/format'

function useCompact() {
  const [compact, setCompact] = useState(false)
  useEffect(() => {
    const on = () => {
      const y = window.scrollY
      setCompact((c) => (c ? y > 40 : y > 160)) // hysteresis prevents flicker
    }
    on()
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])
  return compact
}

function StatusLine({ m, compact }: { m: Match; compact: boolean }) {
  const now = useStore((s) => s.now)
  if (m.status === 'live')
    return (
      <span className="inline-flex items-center gap-2 font-semibold text-live">
        <LiveDot /> <span className="tnum">{compact ? clockLabel(m) : clockFull(m)}</span>
        {!compact && <span className="font-medium text-muted">{m.clockSec >= 45 * 60 ? '2nd half' : '1st half'}</span>}
      </span>
    )
  if (m.status === 'ft') return <span className="font-semibold">Full time</span>
  return <span className="font-semibold">Kick-off {kickoffLabel(m.kickoff, now)}</span>
}

function GoalTicker({ m }: { m: Match }) {
  const now = useStore((s) => s.now)
  if (!m.goal || now - m.goal.at > 9000) return null
  const team = teams[m.goal.side ? m.away : m.home]
  return (
    <div key={m.goal.at} className="slide-in flex items-center justify-center gap-2 rounded-s bg-ink px-3 py-1.5 text-[13px] font-semibold text-white" role="status">
      <span className="rounded-[4px] bg-accent px-1.5 py-0.5 text-[11px] font-extrabold uppercase tracking-wider">Goal</span>
      {team.name} · {m.goal.player} {m.goal.minute}'
    </div>
  )
}

function Scoreboard({ m, compact }: { m: Match; compact: boolean }) {
  const comp = compById[m.compId]
  const H = teams[m.home], A = teams[m.away]
  const showScore = m.status !== 'upcoming'
  if (compact)
    return (
      <div className="flex items-center gap-3 py-2">
        <div className="flex min-w-0 flex-1 items-center justify-end gap-2">
          <span className="truncate text-[14px] font-bold"><span className="hidden sm:inline">{H.name}</span><span className="sm:hidden">{H.short}</span></span>
          <Crest id={H.id} size={20} />
        </div>
        {showScore ? <FlipScore score={m.score} compact /> : <span className="px-2 text-[14px] font-bold text-muted">v</span>}
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <Crest id={A.id} size={20} />
          <span className="truncate text-[14px] font-bold"><span className="hidden sm:inline">{A.name}</span><span className="sm:hidden">{A.short}</span></span>
        </div>
        <div className="w-[64px] shrink-0 text-right text-[13px]"><StatusLine m={m} compact /></div>
      </div>
    )
  return (
    <div className="pb-3 pt-4">
      <div className="mb-3 flex items-center justify-between gap-2 text-[13px]">
        <Link to={`/football#${comp.id}`} className="inline-flex items-center gap-1 font-semibold text-muted hover:text-ink">
          <ChevronLeft size={15} aria-hidden="true" /> {comp.name}
        </Link>
        <StatusLine m={m} compact={false} />
      </div>
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 lg:gap-6">
        {[H, A].map((t, i) => (
          <div key={t.id} className={cx('flex min-w-0 flex-col items-center gap-2 text-center', i === 1 ? 'order-3' : 'order-1')}>
            <Crest id={t.id} size={44} />
            <h2 className="text-[15px] font-extrabold leading-tight tracking-tight lg:text-[20px]">{t.name}</h2>
            <FollowButton kind="teams" id={t.id} label={t.name} />
          </div>
        ))}
        <div className="order-2 flex flex-col items-center">
          {showScore ? <FlipScore score={m.score} /> : (
            <div className="rounded-m border border-line bg-sunk px-4 py-3 text-center">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">Kick-off</p>
              <p className="tnum text-[22px] font-extrabold">{new Date(m.kickoff).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</p>
            </div>
          )}
        </div>
      </div>
      <div className="mt-3 min-h-[34px]"><GoalTicker m={m} /></div>
      {m.status !== 'upcoming' && <div className="mt-1 px-1"><Timeline m={m} /></div>}
    </div>
  )
}

export function MatchPage() {
  const { id = '' } = useParams()
  const [params, setParams] = useSearchParams()
  const m = useStore((s) => s.matches[id])
  const marketIds = useStore((s) => s.marketIds[id])
  const markets = useStore((s) => s.markets)
  const compact = useCompact()
  const stickyRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState<Record<GroupId, boolean>>({ popular: true, goals: false, handicaps: false, scorers: false, corners: false })
  const [active, setActive] = useState<GroupId>('popular')
  const sectionRefs = useRef<Partial<Record<GroupId, HTMLElement | null>>>({})

  const byGroup = useMemo(() => {
    const out: Record<string, string[]> = {}
    for (const mid of marketIds ?? []) (out[markets[mid].group] ??= []).push(mid)
    return out
    // group membership never changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [marketIds])

  const jump = (g: GroupId) => {
    setOpen((o) => ({ ...o, [g]: true }))
    setActive(g)
    requestAnimationFrame(() => {
      const el = sectionRefs.current[g]
      if (!el) return
      const offset = (stickyRef.current?.getBoundingClientRect().bottom ?? 160) + 8
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      window.scrollTo({ top: window.scrollY + el.getBoundingClientRect().top - offset + (compact ? 0 : 90), behavior: reduce ? 'auto' : 'smooth' })
    })
  }

  // deep link from search, e.g. ?group=corners
  useEffect(() => {
    const g = params.get('group') as GroupId | null
    if (g && groups.some((x) => x.id === g)) {
      window.setTimeout(() => jump(g), 60)
      params.delete('group')
      setParams(params, { replace: true })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params, id])

  // active pill follows scroll
  useEffect(() => {
    const on = () => {
      const line = (stickyRef.current?.getBoundingClientRect().bottom ?? 0) + 24
      let cur: GroupId = 'popular'
      for (const g of groups) {
        const el = sectionRefs.current[g.id]
        if (el && el.getBoundingClientRect().top <= line) cur = g.id
      }
      setActive(cur)
    }
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])

  if (!m) return <NotFound />

  return (
    <div className="mx-auto max-w-[860px]">
      <div ref={stickyRef} className="sticky top-[var(--hdr,65px)] z-30 -mx-4 border-b border-line bg-page px-4 lg:-mx-6 lg:px-6">
        <Scoreboard m={m} compact={compact} />
        <nav aria-label="Market groups" className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-3 pt-1">
          {groups.map((g) => (
            <button
              key={g.id}
              type="button"
              onClick={() => jump(g.id)}
              aria-current={active === g.id ? 'true' : undefined}
              className={cx(
                'h-11 shrink-0 rounded-full border px-4 text-[14px] font-semibold lg:h-9',
                active === g.id ? 'border-ink bg-ink text-white' : 'border-line bg-card text-ink hover:border-ink',
              )}
            >
              {g.name}
            </button>
          ))}
        </nav>
      </div>

      <div className="mt-4 space-y-4">
        {m.status === 'ft' && (
          <p className="rounded-m border border-line bg-card px-4 py-3 text-[14px]">This match has finished. Markets are closed and open bets have been settled in My bets.</p>
        )}
        {groups.map((g) => {
          const ids = byGroup[g.id] ?? []
          const isOpen = open[g.id]
          return (
            <section key={g.id} ref={(el) => { sectionRefs.current[g.id] = el }} aria-labelledby={`grp-${g.id}`}>
              <h3 id={`grp-${g.id}`}>
                <button
                  type="button"
                  onClick={() => setOpen((o) => ({ ...o, [g.id]: !o[g.id] }))}
                  aria-expanded={isOpen}
                  aria-controls={`grp-body-${g.id}`}
                  className="flex h-12 w-full items-center justify-between rounded-m px-1 text-left"
                >
                  <span className="text-[16px] font-extrabold tracking-tight">{g.name} <span className="ml-1 text-[13px] font-semibold text-muted">{ids.length} markets</span></span>
                  <ChevronDown size={18} className={cx('transition-transform', isOpen && 'rotate-180')} aria-hidden="true" />
                </button>
              </h3>
              {isOpen && (
                <div id={`grp-body-${g.id}`} className="mt-1 grid gap-3">
                  {ids.map((mid) => <MarketCard key={mid} marketId={mid} />)}
                </div>
              )}
            </section>
          )
        })}
      </div>
    </div>
  )
}

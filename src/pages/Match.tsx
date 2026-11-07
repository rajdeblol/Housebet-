import { Activity, AlertTriangle, ChevronDown, ChevronLeft, FlaskConical, LockKeyhole, Play, RefreshCw, Shuffle, Sparkles, Ticket, Users } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { compById, sportById, sportPath } from '../data/competitions'
import { teams } from '../data/teams'
import { FlipScore } from '../components/match/FlipScore'
import { MatchPrediction } from '../components/match/MatchPrediction'
import { MatchTimeline } from '../components/match/MatchTimeline'
import { MatchupPanel } from '../components/match/MatchupPanel'
import { MarketCard } from '../components/match/MarketCard'
import { MarketPulse, MatchMarketInfo } from '../components/match/MatchInsights'
import { Crest, FollowButton, LiveDot } from '../components/ui'
import { NotFound } from './NotFound'
import { actions, getState, useStore } from '../engine/store'
import type { GroupId, Match } from '../engine/types'
import { cx, kickoffLabel } from '../lib/format'
import { detailLine, mainKey, scoreText, statusLong, statusShort } from '../lib/sport'

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
        <LiveDot /> <span className="tnum">{compact ? statusShort(m) : statusLong(m)}</span>
        {!compact && m.sport === 'football' && <span className="font-medium text-muted">{m.clockSec >= 45 * 60 ? '2nd half' : '1st half'}</span>}
        <span className="rounded bg-brand/10 px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wide text-brand">Demo</span>
      </span>
    )
  if (m.status === 'ft') return <span className="inline-flex items-center gap-2 font-semibold">{m.sport === 'football' ? 'Full time' : `Final · ${statusShort(m)}`}<span className="rounded bg-brand/10 px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wide text-brand">Demo</span></span>
  return <span className="inline-flex items-center gap-2 font-semibold">Kick-off {kickoffLabel(m.kickoff, now)}<span className="rounded bg-brand/10 px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wide text-brand">Demo</span></span>
}

function GoalTicker({ m }: { m: Match }) {
  const now = useStore((s) => s.now)
  if (!m.goal || now - m.goal.at > 9000) return null
  const team = teams[m.goal.side ? m.away : m.home]
  return (
    <div key={m.goal.at} className="slide-in flex items-center justify-center gap-2 rounded-s bg-ink px-3 py-1.5 text-[13px] font-semibold text-white" role="status">
      <span className="rounded-[4px] bg-accent px-1.5 py-0.5 text-[11px] font-extrabold uppercase tracking-wider text-page">{m.goal.label}</span>
      {m.goal.text || team.name}
    </div>
  )
}

/** Scoreboard detail (e.g. innings, sets, down & distance). No trackers: out of scope. */
function DetailLine({ m }: { m: Match }) {
  const detail = detailLine(m)
  if (!detail) return null
  return <p className="mt-1 text-center text-[13px] font-semibold text-muted">{detail}</p>
}

function Scoreboard({ m, compact }: { m: Match; compact: boolean }) {
  const comp = compById[m.compId]
  const H = teams[m.home], A = teams[m.away]
  const now = useStore((s) => s.now)
  const scoredSide = m.goal && now - m.goal.at < 3500 ? m.goal.side : null
  const st = m.status === 'upcoming' ? null : scoreText(m)
  if (compact)
    return (
      <div className="flex items-center gap-3 py-2">
        <div className="flex min-w-0 flex-1 items-center justify-end gap-2">
          <span className="truncate text-[14px] font-bold"><span className="hidden sm:inline">{H.name}</span><span className="sm:hidden">{H.short}</span></span>
          <Crest id={H.id} size={20} />
        </div>
        {st ? <FlipScore score={st} compact /> : <span className="px-2 text-[14px] font-bold text-muted">v</span>}
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
        <Link to={`${sportPath(m.sport)}#${comp.id}`} className="inline-flex items-center gap-1 font-semibold text-muted hover:text-ink">
          <ChevronLeft size={15} aria-hidden="true" /> {comp.name}
        </Link>
        <StatusLine m={m} compact={false} />
      </div>
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 lg:gap-6">
        {[H, A].map((t, i) => (
          <div key={t.id} className={cx('flex min-w-0 flex-col items-center gap-2 rounded-xl text-center', i === 1 ? 'order-3' : 'order-1', scoredSide === i && 'team-score-flash')}>
            <Crest id={t.id} size={44} />
            <h2 className="text-[15px] font-extrabold leading-tight tracking-tight lg:text-[20px]">{t.name}</h2>
            <FollowButton kind="teams" id={t.id} label={t.name} />
          </div>
        ))}
        <div className="order-2 flex flex-col items-center">
          {st ? <FlipScore score={st} /> : m.sport === 'mma' && m.status !== 'upcoming' ? (
            <div className="rounded-m bg-ink px-5 py-3 text-center text-page">
              <p className="text-[11px] font-semibold uppercase tracking-wider opacity-70">{m.status === 'ft' ? 'Result' : 'Round'}</p>
              <p className="tnum text-[30px] font-extrabold leading-none">{m.status === 'ft' ? (m.mma?.finish?.method ?? 'Final') : Math.min(3, Math.floor(m.clockSec / 300) + 1)}</p>
            </div>
          ) : (
            <div className="rounded-m border border-line bg-sunk px-4 py-3 text-center">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">Kick-off</p>
              <p className="tnum text-[22px] font-extrabold">{new Date(m.kickoff).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</p>
            </div>
          )}
        </div>
      </div>
      <div className="mt-3 min-h-[34px]"><GoalTicker m={m} /></div>
      {m.status !== 'upcoming' && <DetailLine m={m} />}
    </div>
  )
}

function DemoMomentButton({ match }: { match: Match }) {
  const now = useStore((s) => s.now)
  if (match.sport !== 'football' || match.status !== 'live') return null
  const coolingDown = !!match.goal && now - match.goal.at < 5500
  return (
    <button type="button" disabled={coolingDown} onClick={() => {
      actions.setTarget(match.id)
      actions.simulateGoal()
    }} className="inline-flex h-10 items-center gap-2 rounded-lg border border-brand/30 bg-brand/5 px-3 text-[12px] font-bold text-brand transition-colors hover:bg-brand/10 disabled:cursor-wait disabled:opacity-55">
      {coolingDown ? <Sparkles size={14} className="animate-pulse" aria-hidden="true" /> : <Play size={14} fill="currentColor" aria-hidden="true" />}
      {coolingDown ? 'Playing match moment…' : 'Play demo goal moment'}
    </button>
  )
}

function JudgeDemoScenarios({ match }: { match: Match }) {
  const [message, setMessage] = useState('Simulated states only · no real wagers.')

  const preparePick = () => {
    actions.setTarget(match.id)
    const state = getState()
    const candidates = [state.markets[`${match.id}:${mainKey(match)}`], ...(state.marketIds[match.id] ?? []).map((marketId) => state.markets[marketId])]
    const market = candidates.find((candidate) => candidate && !candidate.closed && candidate.selections.some((selection) => !selection.closed))
    const selection = market?.selections.find((candidate) => !candidate.closed)
    if (!market || !selection) {
      setMessage('There are no available selections for this match right now.')
      return false
    }
    if (!getState().slip.items.some((item) => item.selId === selection.id)) actions.toggleSelection(selection.id)
    actions.setStake(selection.id, '10')
    actions.openSheet(true, true)
    return true
  }

  const run = (scenario: 'normal' | 'changed' | 'suspended' | 'failed') => {
    actions.resetDemoScenario(match.id)
    if (scenario === 'normal') {
      if (!preparePick()) return
      actions.acceptOdds()
      setMessage('Normal flow ready: place the 10 USDT single, then open it in My bets.')
      return
    }
    if (!preparePick()) return
    if (scenario === 'changed') {
      actions.acceptOdds()
      actions.shiftOdds()
      setMessage('Odds changed: review the new price in the slip and accept it to continue.')
    } else if (scenario === 'suspended') {
      actions.acceptOdds()
      actions.suspendMarket(60_000)
      setMessage('Selection suspended for 60 seconds: remove it from the slip to continue.')
    } else {
      actions.acceptOdds()
      actions.setFailNext(true)
      setMessage('Failure armed: this match price is held for the demo. Place the 10 USDT single to see the failed state, then retry.')
    }
  }

  return (
    <details className="mt-4 overflow-hidden rounded-m border border-brand/25 bg-brand/[0.035]">
      <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 px-3 py-2.5 [&::-webkit-details-marker]:hidden">
        <span className="flex min-w-0 items-center gap-2 text-[13px] font-bold"><FlaskConical size={15} className="shrink-0 text-brand" aria-hidden="true" /><span>Judge demo · try bet states</span><span className="rounded-full bg-brand/10 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-brand">Simulated</span></span>
        <ChevronDown size={16} className="shrink-0 text-muted" aria-hidden="true" />
      </summary>
      <div className="border-t border-brand/15 px-3 pb-3 pt-2.5">
        <p className="mb-2.5 text-[12px] leading-relaxed text-muted">Each option adds a 10 USDT single from this match to your slip. Try one state, then use the slip action it reveals.</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <button type="button" onClick={() => run('normal')} className="flex min-h-10 items-center justify-center gap-1.5 rounded-s border border-line bg-card px-2 text-[11.5px] font-bold hover:border-ink"><RefreshCw size={13} aria-hidden="true" /> Normal bet flow</button>
          <button type="button" onClick={() => run('changed')} className="flex min-h-10 items-center justify-center gap-1.5 rounded-s border border-line bg-card px-2 text-[11.5px] font-bold hover:border-ink"><Shuffle size={13} aria-hidden="true" /> Odds changed</button>
          <button type="button" onClick={() => run('suspended')} className="flex min-h-10 items-center justify-center gap-1.5 rounded-s border border-line bg-card px-2 text-[11.5px] font-bold hover:border-ink"><LockKeyhole size={13} aria-hidden="true" /> Suspend pick</button>
          <button type="button" onClick={() => run('failed')} className="flex min-h-10 items-center justify-center gap-1.5 rounded-s border border-line bg-card px-2 text-[11.5px] font-bold hover:border-ink"><AlertTriangle size={13} aria-hidden="true" /> Fail placement</button>
        </div>
        <p role="status" aria-live="polite" className="mt-2 text-[11.5px] text-muted">{message}</p>
      </div>
    </details>
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
  const groups = sportById[m?.sport ?? 'football'].groups
  const [open, setOpen] = useState<Partial<Record<GroupId, boolean>>>({ popular: true })
  const [active, setActive] = useState<GroupId>('popular')
  const [view, setView] = useState<'bet' | 'matchup' | 'insights'>('bet')
  const [activeEventKey, setActiveEventKey] = useState<string | null>(null)
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
      for (const g of sportById[getState().matches[id]?.sport ?? 'football'].groups) {
        const el = sectionRefs.current[g.id]
        if (el && el.getBoundingClientRect().top <= line) cur = g.id
      }
      setActive(cur)
    }
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [id])

  // new match: reset groups
  useEffect(() => { setOpen({ popular: true }); setActive('popular'); setActiveEventKey(null); setView('bet') }, [id])

  if (!m) return <NotFound />

  return (
    <div className="mx-auto max-w-[860px]">
      <div className="-mx-4 border-b border-line bg-page px-4 lg:-mx-6 lg:px-6">
        <Scoreboard m={m} compact={false} />
      </div>
      <div ref={stickyRef} className="sticky top-[var(--hdr,65px)] z-30 -mx-4 border-b border-line bg-page px-4 lg:-mx-6 lg:px-6">
        {compact && <Scoreboard m={m} compact />}
        <nav aria-label="Match sections" className="grid grid-cols-3 gap-1 rounded-xl border border-line bg-sunk/70 p-1">
          {([
            { id: 'bet', label: 'Bet', Icon: Ticket },
            { id: 'matchup', label: 'Face-off', Icon: Users },
            { id: 'insights', label: 'Insights', Icon: Activity },
          ] as const).map(({ id: section, label, Icon }) => (
            <button key={section} type="button" aria-pressed={view === section} onClick={() => setView(section)}
              className={cx('flex h-10 items-center justify-center gap-1.5 rounded-lg px-2 text-[12px] font-bold transition-colors sm:text-[13px]', view === section ? 'bg-card text-ink shadow-raised' : 'text-muted hover:text-ink')}>
              <Icon size={14} aria-hidden="true" />{label}
            </button>
          ))}
        </nav>
      </div>

      {view === 'bet' && <>
        <JudgeDemoScenarios match={m} />
        <div className="mt-4">
          <MarketPulse market={markets[`${id}:${mainKey(m)}`]} match={m} activeEventKey={activeEventKey} onEventSelect={setActiveEventKey} />
        </div>
        <nav aria-label="Bet market groups" className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1 pt-3">
          {groups.map((g) => (
            <button key={g.id} type="button" onClick={() => jump(g.id)} aria-current={active === g.id ? 'true' : undefined}
              className={cx('h-10 shrink-0 rounded-full border px-4 text-[13px] font-semibold', active === g.id ? 'border-ink bg-ink text-white' : 'border-line bg-card text-ink hover:border-ink')}>
              {g.name}
            </button>
          ))}
        </nav>
      </>}

      <div className="mt-4 space-y-4" key={view}>
        {view === 'bet' && groups.map((g) => {
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
        {view === 'matchup' && <MatchupPanel match={m} market={markets[`${id}:${mainKey(m)}`]} />}
        {view === 'insights' && <>
          {m.sport === 'football' && m.status === 'live' && <div className="flex flex-wrap items-center justify-between gap-2 rounded-m border border-line bg-card px-3 py-2.5">
            <p className="text-[11.5px] text-muted">Demo controls · simulated match events</p><DemoMomentButton match={m} />
          </div>}
          <MatchPrediction match={m} market={markets[`${id}:${mainKey(m)}`]} />
          <MatchTimeline match={m} activeEventKey={activeEventKey} onEventSelect={setActiveEventKey} />
          <MarketPulse market={markets[`${id}:${mainKey(m)}`]} match={m} activeEventKey={activeEventKey} onEventSelect={setActiveEventKey} />
          {m.status === 'ft' && <p className="rounded-m border border-line bg-card px-4 py-3 text-[14px]">This match has finished. Markets are closed and open bets have been settled in My bets.</p>}
          <MatchMarketInfo match={m} />
        </>}
      </div>
    </div>
  )
}

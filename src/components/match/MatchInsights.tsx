import { Activity, Bell, BellRing, Check, CircleHelp, Clock3, ShieldCheck } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import type { Market, Match } from '../../engine/types'
import { cx, kickoffLabel } from '../../lib/format'
import { statusShort } from '../../lib/sport'
import { actions, useStore } from '../../engine/store'
import { LiveDot } from '../ui'
import { matchEventKey } from './MatchTimeline'
import { readPriceAlerts, togglePriceAlert } from '../../lib/priceAlerts'

const seriesColors = ['#00AEB7', '#8C62FF', '#E89536']

interface PricePoint { time: number; value: number }

function linePath(points: PricePoint[], min: number, max: number, start: number, end: number) {
  const width = 640, top = 18, height = 126
  const spread = max - min || 1
  return points.map(({ time, value }) => {
    const x = 12 + ((time - start) / Math.max(1, end - start)) * (width - 24)
    const y = top + ((max - value) / spread) * height
    return `${x},${y}`
  }).join(' ')
}

function chartTime(time: number) {
  return new Date(time).toLocaleString(undefined, { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })
}

/** Small price-history view powered by the actual simulated odds ticks in the store. */
export function MarketPulse({ market, match, activeEventKey, onEventSelect }: { market?: Market; match: Match; activeEventKey?: string | null; onEventSelect?: (key: string) => void }) {
  const [visible, setVisible] = useState<Record<string, boolean>>({})
  const [alertIds, setAlertIds] = useState<string[]>(() => Object.keys(readPriceAlerts()))
  const [hoverTime, setHoverTime] = useState<number | null>(null)
  const [touchPinned, setTouchPinned] = useState(false)
  const now = useStore((s) => s.now)
  const selections = market?.selections ?? []

  useEffect(() => {
    setVisible(Object.fromEntries(selections.map((selection) => [selection.id, true])))
    setHoverTime(null)
    setTouchPinned(false)
  }, [market?.id])

  useEffect(() => {
    const sync = () => setAlertIds(Object.keys(readPriceAlerts()))
    window.addEventListener('hb-price-alerts-change', sync)
    return () => window.removeEventListener('hb-price-alerts-change', sync)
  }, [])

  const bounds = useMemo(() => {
    const vals = selections.flatMap((selection) => selection.history)
    if (vals.length === 0) return { min: 1, max: 2 }
    const low = Math.min(...vals), high = Math.max(...vals)
    const pad = Math.max((high - low) * 0.18, 0.08)
    return { min: Math.max(1, low - pad), max: high + pad }
  }, [selections])

  const openCount = selections.filter((selection) => !selection.closed).length
  const suspended = !!market?.suspendedUntil && market.suspendedUntil > now
  const currentState = match.status === 'ft' ? 'Settled' : suspended ? 'Paused' : 'Open'
  const sortedEvents = [...match.events].sort((a, b) => a.minute - b.minute)
  const series = selections.map((selection) => {
    const length = Math.min(selection.history.length, selection.historyAt.length)
    return Array.from({ length }, (_, index) => ({
      time: selection.historyAt[selection.historyAt.length - length + index],
      value: selection.history[selection.history.length - length + index],
    }))
  })
  const allTimes = series.flatMap((points) => points.map((point) => point.time))
  const tickStart = allTimes.length ? Math.min(...allTimes) : match.kickoff
  const tickEnd = allTimes.length ? Math.max(...allTimes) : now
  const timeToX = (time: number) => 12 + ((time - tickStart) / Math.max(1, tickEnd - tickStart)) * 616
  const hoveredPrices = hoverTime === null ? [] : selections.map((selection, index) => {
    const point = [...series[index]].reverse().find((item) => item.time <= hoverTime) ?? series[index][0] ?? null
    return { selection, point }
  })

  const setHoverFromClientX = (clientX: number, svg: SVGSVGElement) => {
    const rect = svg.getBoundingClientRect()
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
    setHoverTime(tickStart + ratio * (tickEnd - tickStart))
  }
  const visibleEvents = sortedEvents.map((event, index) => ({ event, key: matchEventKey(event, index) }))
    .filter(({ event }) => !!event.at && event.at >= tickStart && event.at <= tickEnd)

  return (
    <section aria-labelledby="market-pulse-title" className="overflow-hidden rounded-[18px] border border-line bg-card shadow-raised">
      <header className="flex flex-wrap items-start justify-between gap-3 border-b border-line px-4 py-4 sm:px-5">
        <div>
          <p className="mb-1 flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-[.16em] text-brand"><Activity size={13} /> Market movement</p>
          <h3 id="market-pulse-title" className="text-[17px] font-extrabold tracking-tight">{market?.name ?? 'Price history'}</h3>
          <p className="mt-0.5 text-[12px] text-muted">Recent price ticks · demo simulation</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={cx('rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider', currentState === 'Open' ? 'bg-up/10 text-upText' : currentState === 'Paused' ? 'bg-warnBg text-warn' : 'bg-sunk text-muted')}>
            {currentState === 'Open' && <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-up align-middle" />}{currentState}
          </span>
          <span className="rounded-full bg-sunk px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-muted">{openCount} selections</span>
        </div>
      </header>

      {market && selections.length > 0 ? (
        <div className="p-4 sm:px-5 sm:py-4">
          <div className="mb-3 flex flex-wrap gap-2" aria-label="Chart overlays">
            {selections.map((selection, i) => (
              <div key={selection.id} className="inline-flex min-h-8 items-center overflow-hidden rounded-full border border-line bg-page">
                <button type="button" aria-pressed={visible[selection.id] !== false} onClick={() => setVisible((current) => ({ ...current, [selection.id]: current[selection.id] === false }))}
                  className={cx('inline-flex min-h-8 items-center gap-2 px-2.5 text-[11px] font-semibold transition-colors', visible[selection.id] !== false ? 'text-ink' : 'text-muted opacity-65')}>
                  <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: seriesColors[i % seriesColors.length] }} />
                  <span className="max-w-[115px] truncate">{selection.label}</span>
                  <span className="tnum font-extrabold">{selection.odds.toFixed(2)}</span>
                </button>
                <button type="button" onClick={() => {
                  const enabled = togglePriceAlert(selection.id, { matchId: match.id, selectionLabel: selection.label, baseline: selection.odds })
                  setAlertIds(Object.keys(readPriceAlerts()))
                  actions.toast(enabled ? `Watching ${selection.label} for its next demo price move.` : `Stopped watching ${selection.label}.`)
                }} aria-pressed={alertIds.includes(selection.id)} aria-label={alertIds.includes(selection.id) ? `Remove price alert for ${selection.label}` : `Watch ${selection.label} price`}
                  className="grid h-8 w-8 shrink-0 place-items-center border-l border-line text-muted hover:bg-sunk hover:text-brand">
                  {alertIds.includes(selection.id) ? <BellRing size={13} aria-hidden="true" /> : <Bell size={13} aria-hidden="true" />}
                </button>
              </div>
            ))}
          </div>

          <div className="relative rounded-[12px] border border-line bg-page/70 px-2 pt-2">
            <svg viewBox="0 0 640 176" className="h-[152px] w-full touch-pan-y sm:h-[180px]" role="group" tabIndex={0} aria-label={`${market.name} simulated odds history. Hover or use arrow keys to inspect prices by date and time.`} preserveAspectRatio="none"
              onPointerMove={(event) => setHoverFromClientX(event.clientX, event.currentTarget)}
              onPointerDown={(event) => {
                if (event.pointerType === 'touch') {
                  setHoverFromClientX(event.clientX, event.currentTarget)
                  setTouchPinned(true)
                }
              }}
              onPointerLeave={(event) => { if (event.pointerType !== 'touch' && !touchPinned) setHoverTime(null) }}
              onKeyDown={(event) => {
                if (event.key === 'Escape') { setHoverTime(null); setTouchPinned(false); return }
                if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return
                event.preventDefault()
                const times = [...new Set(allTimes)].sort((a, b) => a - b)
                const current = hoverTime === null ? (event.key === 'ArrowRight' ? -1 : times.length) : times.reduce((best, time, index) => Math.abs(time - hoverTime) < Math.abs(times[best] - hoverTime) ? index : best, 0)
                const next = Math.max(0, Math.min(times.length - 1, current + (event.key === 'ArrowRight' ? 1 : -1)))
                if (times[next] !== undefined) setHoverTime(times[next])
              }}>
              {[24, 66, 108, 150].map((y) => <line key={y} x1="10" x2="630" y1={y} y2={y} stroke="rgb(var(--line))" strokeWidth="1" strokeDasharray="3 5" />)}
              {selections.map((selection, i) => {
                if (visible[selection.id] === false) return null
                const points = series[i].length ? series[i] : [{ time: tickEnd, value: selection.odds }]
                const values = points.map((point) => Math.max(bounds.min, Math.min(bounds.max, point.value)))
                const lastPoint = points[points.length - 1]
                return (
                  <g key={selection.id}>
                    <polyline points={linePath(points.map((point, pointIndex) => ({ ...point, value: values[pointIndex] })), bounds.min, bounds.max, tickStart, tickEnd)} fill="none" stroke={seriesColors[i % seriesColors.length]} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
                    <circle cx={timeToX(lastPoint.time)} cy={18 + ((bounds.max - lastPoint.value) / (bounds.max - bounds.min || 1)) * 126} r="4" fill={seriesColors[i % seriesColors.length]} stroke="rgb(var(--card))" strokeWidth="2" vectorEffect="non-scaling-stroke" />
                  </g>
                )
              })}
              {hoverTime !== null && <line x1={timeToX(hoverTime)} x2={timeToX(hoverTime)} y1="18" y2="150" stroke="rgb(var(--ink))" strokeWidth="1.5" strokeDasharray="3 3" opacity=".8" pointerEvents="none" />}
              {hoverTime !== null && hoveredPrices.map(({ selection, point }, index) => point && visible[selection.id] !== false && (
                <circle key={`hover-${selection.id}`} cx={timeToX(point.time)} cy={18 + ((bounds.max - point.value) / (bounds.max - bounds.min || 1)) * 126} r="5" fill={seriesColors[index % seriesColors.length]} stroke="rgb(var(--card))" strokeWidth="2" pointerEvents="none" />
              ))}
              {visibleEvents.map(({ event, key }) => {
                const x = timeToX(event.at!)
                const active = activeEventKey === key
                return (
                  <g key={key} role="button" tabIndex={0} aria-label={`${event.type === 'goal' ? 'Goal' : `${event.type} card`} at ${event.minute} minutes. Select event.`} onClick={() => onEventSelect?.(key)} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onEventSelect?.(key) } }} className={cx('cursor-pointer', active && 'event-marker-active')}>
                    <line x1={x} x2={x} y1="18" y2="150" stroke={active ? 'rgb(var(--brand))' : 'rgb(var(--muted))'} strokeWidth={active ? 2 : 1} strokeDasharray="4 4" opacity={active ? 0.9 : 0.45} />
                    <circle cx={x} cy="18" r={active ? 7 : 5} fill={event.type === 'goal' ? 'rgb(var(--up))' : 'rgb(var(--warn))'} stroke="rgb(var(--card))" strokeWidth="2" />
                    <rect x={x - 10} y="10" width="20" height="145" fill="transparent" />
                  </g>
                )
              })}
              <text x="12" y="170" fill="rgb(var(--muted))" fontSize="10">Earlier</text>
              <text x="603" y="170" fill="rgb(var(--muted))" fontSize="10">Now</text>
            </svg>
            {hoverTime !== null && (
              <div className={cx('pointer-events-none absolute top-2 z-10 min-w-[145px] rounded-lg border border-line bg-card/95 px-3 py-2 shadow-raised backdrop-blur-sm', timeToX(hoverTime) / 640 > .62 ? 'right-2' : 'left-2')}>
                <div className="flex items-start justify-between gap-3">
                  <div><p className="text-[10px] font-bold uppercase tracking-wider text-muted">Simulated price history</p><p className="tnum text-[11px] font-semibold">{chartTime(hoverTime)}</p></div>
                  {touchPinned && <button type="button" onClick={() => { setTouchPinned(false); setHoverTime(null) }} className="pointer-events-auto -mr-2 -mt-1 grid h-7 w-7 shrink-0 place-items-center rounded text-muted hover:bg-sunk" aria-label="Close price details">×</button>}
                </div>
                <div className="mt-1.5 grid gap-0.5">{hoveredPrices.map(({ selection, point }, index) => point && visible[selection.id] !== false && <p key={selection.id} className="flex items-center justify-between gap-3 text-[11px]"><span className="flex min-w-0 items-center gap-1.5 truncate"><i className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: seriesColors[index % seriesColors.length] }} />{selection.label}</span><b className="tnum">{point.value.toFixed(2)}</b></p>)}</div>
              </div>
            )}
          </div>
          {activeEventKey && (() => {
            const picked = visibleEvents.find((item) => item.key === activeEventKey)
            if (!picked) return null
            const { event } = picked
            const beforeAfter = selections.map((selection) => {
              const eventAt = event.at ?? 0
              const before = selection.historyAt.reduce<number | null>((best, time, index) => time <= eventAt && (best === null || time > selection.historyAt[best]) ? index : best, null)
              const after = selection.historyAt.reduce<number | null>((best, time, index) => time >= eventAt && (best === null || time < selection.historyAt[best]) ? index : best, null)
              const fallback = selection.historyAt.reduce((best, time, index) => Math.abs(time - eventAt) < Math.abs(selection.historyAt[best] - eventAt) ? index : best, 0)
              const from = selection.history[before ?? fallback]
              const to = selection.history[after ?? fallback]
              return `${selection.label} ${from?.toFixed(2) ?? '—'} → ${to?.toFixed(2) ?? selection.odds.toFixed(2)}`
            }).join(' · ')
            return <p className="mt-2 rounded-lg border border-brand/20 bg-brand/5 px-3 py-2 text-[11.5px] text-muted" role="status">At {event.minute}&apos; · {event.type === 'goal' ? 'Goal' : `${event.type} card`} · nearest simulated prices before → after: {beforeAfter}</p>
          })()}
          <p className="mt-2 text-[11px] text-muted">Hover or focus the chart to inspect dated prices · last 60 recorded demo ticks · illustrative, not live market data.</p>
        </div>
      ) : (
        <div className="p-5 text-[13px] text-muted">No price history is available for this match yet.</div>
      )}
    </section>
  )
}

function StatusStep({ title, detail, done, current }: { title: string; detail: string; done: boolean; current?: boolean }) {
  return (
    <li className="relative flex gap-3 pb-5 last:pb-0">
      <span className={cx('relative z-10 mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border', done ? 'border-brand bg-brand text-white' : current ? 'border-brand bg-card text-brand ring-4 ring-brand/10' : 'border-line bg-card text-transparent')}>
        {done ? <Check size={12} strokeWidth={3} /> : <span className="h-1.5 w-1.5 rounded-full bg-current" />}
      </span>
      <span className="min-w-0"><span className={cx('block text-[13px] font-bold', !done && !current && 'text-muted')}>{title}</span><span className="mt-0.5 block text-[11.5px] text-muted">{detail}</span></span>
      <span className={cx('absolute bottom-0 left-[9px] top-5 w-px', done ? 'bg-brand/40' : 'bg-line')} aria-hidden="true" />
    </li>
  )
}

export function MatchMarketInfo({ match }: { match: Match }) {
  const now = useStore((s) => s.now)
  const live = match.status === 'live'
  const finished = match.status === 'ft'
  const kickoff = new Date(match.kickoff).toLocaleString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })

  return (
    <div className="mt-8 grid gap-4 lg:grid-cols-[1.05fr_.95fr]">
      <section aria-labelledby="market-rules-title" className="rounded-[18px] border border-line bg-card p-4 sm:p-5">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand/10 text-brand"><ShieldCheck size={18} /></span>
            <div><h3 id="market-rules-title" className="text-[16px] font-extrabold">Market rules</h3><p className="text-[11px] text-muted">Housebets demo · simulated event</p></div>
          </div>
          <span className="rounded-full border border-line px-2.5 py-1 text-[10px] font-bold text-muted">Prototype</span>
        </div>
        <p className="text-[12.5px] leading-relaxed text-muted">Fixtures, scores and odds are simulated. Demo selections follow the final score and match state shown in Housebets; no real-money wagers or third-party oracle resolution are involved.</p>
        <div className="mt-4 flex items-start gap-2 rounded-xl bg-page px-3 py-2.5 text-[11.5px] leading-relaxed text-muted">
          <CircleHelp size={15} className="mt-0.5 shrink-0 text-brand" />
          <span>Check the match result and selection terms before adding a demo pick. Suspended or closed markets cannot be selected.</span>
        </div>
      </section>

      <section aria-labelledby="market-status-title" className="rounded-[18px] border border-line bg-card p-4 sm:p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div><h3 id="market-status-title" className="text-[16px] font-extrabold">Market status</h3><p className="text-[11px] text-muted">Fixture timeline · local time</p></div>
          <span className={cx('inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider', live ? 'bg-live/10 text-live' : finished ? 'bg-sunk text-muted' : 'bg-brand/10 text-brand')}>
            {live ? <LiveDot /> : <Clock3 size={12} />} {live ? 'In play' : finished ? 'Final' : 'Scheduled'}
          </span>
        </div>
        <ol className="relative">
          <StatusStep title="Markets opened" detail="Demo selections available" done />
          <StatusStep
            title="Match in play"
            detail={live ? `${statusShort(match)} · scores and prices simulated` : finished ? 'Match completed' : `${kickoffLabel(match.kickoff, now)} · scheduled for ${kickoff}`}
            done={live || finished}
            current={!live && !finished}
          />
          <StatusStep
            title="Demo settlement"
            detail={finished ? 'Final score recorded in the demo match state' : 'Available after the match is marked final'}
            done={finished}
            current={finished}
          />
        </ol>
      </section>
    </div>
  )
}

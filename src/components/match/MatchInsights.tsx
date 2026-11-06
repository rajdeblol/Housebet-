import { Activity, Bell, BellRing, Check, CircleHelp, Clock3, ShieldCheck } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { Market, Match } from '../../engine/types'
import { cx, kickoffLabel } from '../../lib/format'
import { statusShort } from '../../lib/sport'
import { actions, useStore } from '../../engine/store'
import { LiveDot } from '../ui'
import { matchEventKey } from './MatchTimeline'
import { readPriceAlerts, togglePriceAlert } from '../../lib/priceAlerts'

const seriesColors = ['#FF5C64', '#518BFF', '#00B7AC']

interface PricePoint { time: number; value: number }
type ChartRange = '1H' | '6H' | '1D' | '1W' | '1M' | 'ALL'
const chartRanges: ChartRange[] = ['1H', '6H', '1D', '1W', '1M', 'ALL']
const rangeMs: Record<Exclude<ChartRange, 'ALL'>, number> = {
  '1H': 60 * 60_000, '6H': 6 * 60 * 60_000, '1D': 24 * 60 * 60_000,
  '1W': 7 * 24 * 60 * 60_000, '1M': 30 * 24 * 60 * 60_000,
}

function linePath(points: PricePoint[], start: number, end: number, floor: number, ceiling: number) {
  const left = 12, right = 610, top = 18, height = 148
  const coords = points.map(({ time, value }) => {
    const x = left + ((time - start) / Math.max(1, end - start)) * (right - left)
    const y = top + ((ceiling - value) / Math.max(1, ceiling - floor)) * height
    return { x, y }
  })
  if (coords.length < 3) return coords.map(({ x, y }, index) => `${index ? 'L' : 'M'}${x},${y}`).join(' ')
  return coords.reduce((path, point, index) => {
    if (index === 0) return `M${point.x},${point.y}`
    const previous = coords[index - 1]
    const before = coords[Math.max(0, index - 2)]
    const after = coords[Math.min(coords.length - 1, index + 1)]
    const c1x = previous.x + (point.x - before.x) / 6
    const c1y = previous.y + (point.y - before.y) / 6
    const c2x = point.x - (after.x - previous.x) / 6
    const c2y = point.y - (after.y - previous.y) / 6
    return `${path} C${c1x},${c1y} ${c2x},${c2y} ${point.x},${point.y}`
  }, '')
}

function probabilityY(value: number, floor: number, ceiling: number) { return 18 + ((ceiling - value) / Math.max(1, ceiling - floor)) * 148 }

function chartTime(time: number) {
  return new Date(time).toLocaleString(undefined, { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })
}

/** Price-history view powered by the simulated odds ticks in the store. */
export function MarketPulse({ market, match, activeEventKey, onEventSelect }: { market?: Market; match: Match; activeEventKey?: string | null; onEventSelect?: (key: string) => void }) {
  const [visible, setVisible] = useState<Record<string, boolean>>({})
  const [alertIds, setAlertIds] = useState<string[]>(() => Object.keys(readPriceAlerts()))
  const [hoverTime, setHoverTime] = useState<number | null>(null)
  const [touchPinned, setTouchPinned] = useState(false)
  const [range, setRange] = useState<ChartRange>('ALL')
  const now = useStore((s) => s.now)
  const selections = market?.selections ?? []

  useEffect(() => {
    setVisible(Object.fromEntries(selections.map((selection) => [selection.id, true])))
    setHoverTime(null)
    setTouchPinned(false)
    setRange('ALL')
  }, [market?.id])

  useEffect(() => {
    const sync = () => setAlertIds(Object.keys(readPriceAlerts()))
    window.addEventListener('hb-price-alerts-change', sync)
    return () => window.removeEventListener('hb-price-alerts-change', sync)
  }, [])

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
  const selectedStart = range === 'ALL' ? tickStart : Math.max(tickStart, tickEnd - rangeMs[range])
  const chartStart = selectedStart < tickEnd ? selectedStart : tickStart
  const timeToX = (time: number) => 12 + ((time - chartStart) / Math.max(1, tickEnd - chartStart)) * 598
  const chartTimes = [...new Set(allTimes.filter((time) => time >= chartStart && time <= tickEnd))].sort((a, b) => a - b)
  if (!chartTimes.length) chartTimes.push(tickEnd)
  const probabilitySeries = selections.map((selection, index) => ({ selection, index, points: [] as PricePoint[] }))
  for (const time of chartTimes) {
    const currentPrices = series.map((points, index) => [...points].reverse().find((point) => point.time <= time)?.value ?? points[0]?.value ?? selections[index]?.odds ?? 1)
    const implied = currentPrices.map((odds) => 1 / Math.max(1.01, odds))
    const total = implied.reduce((sum, value) => sum + value, 0) || 1
    probabilitySeries.forEach((item, index) => item.points.push({ time, value: implied[index] / total * 100 }))
  }
  const plottedValues = probabilitySeries.flatMap((item) => item.points.map((point) => point.value))
  const observedMin = plottedValues.length ? Math.min(...plottedValues) : 0
  const observedMax = plottedValues.length ? Math.max(...plottedValues) : 100
  const padding = Math.max(5, (observedMax - observedMin) * 0.18)
  let axisMin = Math.max(0, Math.floor((observedMin - padding) / 5) * 5)
  let axisMax = Math.min(100, Math.ceil((observedMax + padding) / 5) * 5)
  if (axisMax - axisMin < 24) {
    const center = (observedMin + observedMax) / 2
    axisMin = Math.max(0, Math.floor((center - 12) / 5) * 5)
    axisMax = Math.min(100, Math.ceil((center + 12) / 5) * 5)
    if (axisMax - axisMin < 24) {
      if (axisMin === 0) axisMax = Math.min(100, axisMin + 24)
      else axisMin = Math.max(0, axisMax - 24)
    }
  }
  const currentImplied = selections.map((selection) => 1 / Math.max(1.01, selection.odds))
  const currentTotal = currentImplied.reduce((sum, value) => sum + value, 0) || 1
  const currentProbabilities = currentImplied.map((value) => value / currentTotal * 100)
  const hoveredPrices = hoverTime === null ? [] : selections.map((selection, index) => {
    const point = [...probabilitySeries[index].points].reverse().find((item) => item.time <= hoverTime) ?? probabilitySeries[index].points[0] ?? null
    return { selection, point }
  })

  const setHoverFromClientX = (clientX: number, svg: SVGSVGElement) => {
    const rect = svg.getBoundingClientRect()
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
    setHoverTime(chartStart + ratio * (tickEnd - chartStart))
  }
  const visibleEvents = sortedEvents.map((event, index) => ({ event, key: matchEventKey(event, index) }))
    .filter(({ event }) => !!event.at && event.at >= chartStart && event.at <= tickEnd)

  return (
    <section aria-labelledby="market-pulse-title" className="overflow-hidden rounded-[18px] border border-line bg-card shadow-raised">
      <header className="flex flex-wrap items-start justify-between gap-3 border-b border-line px-4 py-4 sm:px-5">
        <div>
          <p className="mb-1 flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-[.16em] text-brand"><Activity size={13} /> Market movement</p>
          <h3 id="market-pulse-title" className="text-[17px] font-extrabold tracking-tight">{market?.name ?? 'Price history'}</h3>
          <p className="mt-0.5 text-[12px] text-muted">Implied probability · demo market history</p>
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
          <div className="mb-3 flex flex-wrap gap-2" aria-label="Chart outcomes">
            {selections.map((selection, i) => (
              <div key={selection.id} className="inline-flex min-h-8 items-center overflow-hidden rounded-full border border-line bg-page">
                <button type="button" aria-pressed={visible[selection.id] !== false} onClick={() => setVisible((current) => ({ ...current, [selection.id]: current[selection.id] === false }))}
                  className={cx('inline-flex min-h-8 items-center gap-2 px-2.5 text-[11px] font-semibold transition-colors', visible[selection.id] !== false ? 'text-ink' : 'text-muted opacity-65')}>
                  <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: seriesColors[i % seriesColors.length] }} />
                  <span className="max-w-[115px] truncate">{selection.label}</span>
                  <span className="tnum font-extrabold">{currentProbabilities[i]?.toFixed(0)}%</span>
                  <span className="tnum text-muted">{selection.odds.toFixed(2)}</span>
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

          <div className="mb-2 flex items-center justify-between gap-2" aria-label="Chart time range">
            <p className="text-[10px] font-semibold text-muted">Market probability</p>
            <div className="flex items-center gap-0.5 rounded-full bg-sunk p-1">
              {chartRanges.map((item) => <button key={item} type="button" aria-pressed={range === item} onClick={() => { setRange(item); setHoverTime(null); setTouchPinned(false) }} className={cx('min-w-8 rounded-full px-2 py-1 text-[10px] font-bold transition-colors', range === item ? 'bg-card text-ink shadow-sm' : 'text-muted hover:text-ink')}>{item}</button>)}
            </div>
          </div>
          <div className="relative rounded-[12px] border border-line bg-page/70 px-2 pt-2">
            <svg viewBox="0 0 640 198" className="h-[168px] w-full touch-pan-y sm:h-[190px]" role="group" tabIndex={0} aria-label={`${market.name} simulated implied probability history. Hover or use arrow keys to inspect percentages by date and time.`} preserveAspectRatio="none"
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
                const times = chartTimes
                const current = hoverTime === null ? (event.key === 'ArrowRight' ? -1 : times.length) : times.reduce((best, time, index) => Math.abs(time - hoverTime) < Math.abs(times[best] - hoverTime) ? index : best, 0)
                const next = Math.max(0, Math.min(times.length - 1, current + (event.key === 'ArrowRight' ? 1 : -1)))
                if (times[next] !== undefined) setHoverTime(times[next])
              }}>
              {[18, 55, 92, 129, 166].map((y, index) => <g key={y}><line x1="10" x2="610" y1={y} y2={y} stroke="rgb(var(--line))" strokeWidth="1" strokeDasharray="3 5" /><text x="634" y={y + 3} textAnchor="end" fill="rgb(var(--muted))" fontSize="9">{Math.round(axisMax - (axisMax - axisMin) * index / 4)}%</text></g>)}
              {probabilitySeries.map(({ selection, index: i, points }) => {
                if (visible[selection.id] === false) return null
                const lastPoint = points[points.length - 1]
                return (
                  <g key={selection.id}>
                    <path d={linePath(points, chartStart, tickEnd, axisMin, axisMax)} fill="none" stroke={seriesColors[i % seriesColors.length]} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
                    <circle cx={timeToX(lastPoint.time)} cy={probabilityY(lastPoint.value, axisMin, axisMax)} r="4" fill={seriesColors[i % seriesColors.length]} stroke="rgb(var(--card))" strokeWidth="2" vectorEffect="non-scaling-stroke" />
                  </g>
                )
              })}
              {hoverTime !== null && <line x1={timeToX(hoverTime)} x2={timeToX(hoverTime)} y1="18" y2="166" stroke="rgb(var(--ink))" strokeWidth="1.5" strokeDasharray="3 3" opacity=".8" pointerEvents="none" />}
              {hoverTime !== null && hoveredPrices.map(({ selection, point }, index) => point && visible[selection.id] !== false && (
                <circle key={`hover-${selection.id}`} cx={timeToX(point.time)} cy={probabilityY(point.value, axisMin, axisMax)} r="5" fill={seriesColors[index % seriesColors.length]} stroke="rgb(var(--card))" strokeWidth="2" pointerEvents="none" />
              ))}
              {visibleEvents.map(({ event, key }) => {
                const x = timeToX(event.at!)
                const active = activeEventKey === key
                return (
                  <g key={key} role="button" tabIndex={0} aria-label={`${event.type === 'goal' ? 'Goal' : `${event.type} card`} at ${event.minute} minutes. Select event.`} onClick={() => onEventSelect?.(key)} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onEventSelect?.(key) } }} className={cx('cursor-pointer', active && 'event-marker-active')}>
                    <line x1={x} x2={x} y1="18" y2="166" stroke={active ? 'rgb(var(--brand))' : 'rgb(var(--muted))'} strokeWidth={active ? 2 : 1} strokeDasharray="4 4" opacity={active ? 0.9 : 0.45} />
                    <circle cx={x} cy="18" r={active ? 7 : 5} fill={event.type === 'goal' ? 'rgb(var(--up))' : 'rgb(var(--warn))'} stroke="rgb(var(--card))" strokeWidth="2" />
                    <rect x={x - 10} y="10" width="20" height="165" fill="transparent" />
                  </g>
                )
              })}
              <text x="12" y="191" fill="rgb(var(--muted))" fontSize="9">{chartTime(chartStart)}</text>
              <text x="310" y="191" textAnchor="middle" fill="rgb(var(--muted))" fontSize="9">{chartTime(chartStart + (tickEnd - chartStart) / 2)}</text>
              <text x="610" y="191" textAnchor="end" fill="rgb(var(--muted))" fontSize="9">{chartTime(tickEnd)}</text>
            </svg>
            {hoverTime !== null && (
              <div className={cx('pointer-events-none absolute top-2 z-10 min-w-[145px] rounded-lg border border-line bg-card/95 px-3 py-2 shadow-raised backdrop-blur-sm', timeToX(hoverTime) / 640 > .62 ? 'right-2' : 'left-2')}>
                <div className="flex items-start justify-between gap-3">
                  <div><p className="text-[10px] font-bold uppercase tracking-wider text-muted">Implied probability</p><p className="tnum text-[11px] font-semibold">{chartTime(hoverTime)}</p></div>
                  {touchPinned && <button type="button" onClick={() => { setTouchPinned(false); setHoverTime(null) }} className="pointer-events-auto -mr-2 -mt-1 grid h-7 w-7 shrink-0 place-items-center rounded text-muted hover:bg-sunk" aria-label="Close price details">×</button>}
                </div>
                <div className="mt-1.5 grid gap-0.5">{hoveredPrices.map(({ selection, point }, index) => point && visible[selection.id] !== false && <p key={selection.id} className="flex items-center justify-between gap-3 text-[11px]"><span className="flex min-w-0 items-center gap-1.5 truncate"><i className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: seriesColors[index % seriesColors.length] }} />{selection.label}</span><b className="tnum">{point.value.toFixed(1)}%</b></p>)}</div>
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
          <p className="mt-2 text-[11px] text-muted">Hover or focus the chart to inspect dated probabilities · based on available simulated odds history, not live market data.</p>
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

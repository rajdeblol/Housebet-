import { Activity, Check, CircleHelp, Clock3, ShieldCheck } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import type { Market, Match } from '../../engine/types'
import { cx, kickoffLabel } from '../../lib/format'
import { statusShort } from '../../lib/sport'
import { useStore } from '../../engine/store'
import { LiveDot } from '../ui'

const seriesColors = ['#00AEB7', '#8C62FF', '#E89536']

function linePath(values: number[], min: number, max: number) {
  const width = 640, top = 18, height = 126
  const spread = max - min || 1
  const points = values.map((value, i) => {
    const x = 12 + (i * (width - 24)) / Math.max(1, values.length - 1)
    const y = top + ((max - value) / spread) * height
    return `${x},${y}`
  })
  return points.join(' ')
}

/** Small price-history view powered by the actual simulated odds ticks in the store. */
export function MarketPulse({ market, match }: { market?: Market; match: Match }) {
  const [visible, setVisible] = useState<Record<string, boolean>>({})
  const now = useStore((s) => s.now)
  const selections = market?.selections ?? []

  useEffect(() => {
    setVisible(Object.fromEntries(selections.map((selection) => [selection.id, true])))
  }, [market?.id])

  const bounds = useMemo(() => {
    const vals = selections.flatMap((selection) => selection.history.slice(-5))
    if (vals.length === 0) return { min: 1, max: 2 }
    const low = Math.min(...vals), high = Math.max(...vals)
    const pad = Math.max((high - low) * 0.18, 0.08)
    return { min: Math.max(1, low - pad), max: high + pad }
  }, [selections])

  const openCount = selections.filter((selection) => !selection.closed).length
  const suspended = !!market?.suspendedUntil && market.suspendedUntil > now
  const currentState = match.status === 'ft' ? 'Settled' : suspended ? 'Paused' : 'Open'

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
              <button
                key={selection.id}
                type="button"
                aria-pressed={visible[selection.id] !== false}
                onClick={() => setVisible((current) => ({ ...current, [selection.id]: current[selection.id] === false }))}
                className={cx('inline-flex min-h-8 items-center gap-2 rounded-full border px-2.5 text-[11px] font-semibold transition-colors', visible[selection.id] !== false ? 'border-line bg-page text-ink' : 'border-line bg-card text-muted opacity-65')}
              >
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: seriesColors[i % seriesColors.length] }} />
                <span className="max-w-[130px] truncate">{selection.label}</span>
                <span className="tnum font-extrabold">{selection.odds.toFixed(2)}</span>
              </button>
            ))}
          </div>

          <div className="rounded-[12px] border border-line bg-page/70 px-2 pt-2">
            <svg viewBox="0 0 640 176" className="h-[152px] w-full sm:h-[180px]" role="img" aria-label={`${market.name} simulated odds movement over recent price ticks`} preserveAspectRatio="none">
              {[24, 66, 108, 150].map((y) => <line key={y} x1="10" x2="630" y1={y} y2={y} stroke="rgb(var(--line))" strokeWidth="1" strokeDasharray="3 5" />)}
              {selections.map((selection, i) => {
                if (visible[selection.id] === false) return null
                const values = (selection.history.length ? selection.history.slice(-5) : [selection.odds]).map((value) => Math.max(bounds.min, Math.min(bounds.max, value)))
                return (
                  <g key={selection.id}>
                    <polyline points={linePath(values, bounds.min, bounds.max)} fill="none" stroke={seriesColors[i % seriesColors.length]} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
                    <circle cx="628" cy={18 + ((bounds.max - values[values.length - 1]) / (bounds.max - bounds.min || 1)) * 126} r="4" fill={seriesColors[i % seriesColors.length]} stroke="rgb(var(--card))" strokeWidth="2" vectorEffect="non-scaling-stroke" />
                  </g>
                )
              })}
              <text x="12" y="170" fill="rgb(var(--muted))" fontSize="10">Earlier</text>
              <text x="603" y="170" fill="rgb(var(--muted))" fontSize="10">Now</text>
            </svg>
          </div>
          <p className="mt-2 text-[11px] text-muted">Values reflect the prototype’s last five simulated updates. This chart is illustrative, not live market data.</p>
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

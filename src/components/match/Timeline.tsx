import { teams } from '../../data/teams'
import type { Match } from '../../engine/types'
import { cx } from '../../lib/format'

const pct = (min: number) => `${Math.min(100, (min / 90) * 100)}%`

/** Match timeline strip: goals and cards placed on a 0–90 bar, progress tied to the clock. */
export function Timeline({ m }: { m: Match }) {
  const progress = m.status === 'ft' ? 100 : Math.min(100, (m.clockSec / 5400) * 100)
  const sides = [teams[m.home], teams[m.away]]
  return (
    <div className="w-full">
      <div className="relative h-14" aria-hidden="true">
        {/* track */}
        <div className="absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-sunk" />
        <div className="absolute left-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-ink transition-[width] duration-1000 ease-linear" style={{ width: `${progress}%` }} />
        <div className="absolute top-1/2 h-4 w-px -translate-y-1/2 bg-muted" style={{ left: '50%' }} />
        <span className="absolute left-1/2 top-full -translate-x-1/2 -translate-y-[2px] text-[10px] font-semibold text-muted">HT</span>
        <span className="absolute left-0 top-full -translate-y-[2px] text-[10px] font-semibold text-muted">0'</span>
        <span className="absolute right-0 top-full -translate-y-[2px] text-[10px] font-semibold text-muted">90'</span>
        {m.events.map((e, i) => (
          <span
            key={i}
            className={cx('absolute -translate-x-1/2', e.side === 0 ? 'top-0.5' : 'bottom-0.5')}
            style={{ left: pct(e.minute) }}
            title={`${e.minute}' ${e.type === 'goal' ? 'Goal' : e.type === 'yellow' ? 'Yellow card' : 'Red card'} · ${e.player} (${sides[e.side].name})`}
          >
            {e.type === 'goal' ? (
              <svg width="16" height="16" viewBox="0 0 16 16" className="drop-shadow-sm">
                <circle cx="8" cy="8" r="7" fill="#fff" stroke="#16140F" strokeWidth="1.4" />
                <path d="M8 4.6 11 6.8 9.9 10.3H6.1L5 6.8z" fill="#16140F" />
              </svg>
            ) : (
              <span className={cx('block h-[13px] w-[9px] rounded-[2px] border border-ink/30', e.type === 'yellow' ? 'bg-[#E9B949]' : 'bg-down')} />
            )}
          </span>
        ))}
      </div>
      <ol className="sr-only">
        {m.events.map((e, i) => (
          <li key={i}>{`${e.minute} minutes: ${e.type === 'goal' ? 'goal' : e.type === 'yellow' ? 'yellow card' : 'red card'}, ${e.player}, ${sides[e.side].name}`}</li>
        ))}
      </ol>
    </div>
  )
}

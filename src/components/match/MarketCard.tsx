import { Lock } from 'lucide-react'
import { teams } from '../../data/teams'
import { useStore } from '../../engine/store'
import { cx } from '../../lib/format'
import { OddsButton } from '../OddsButton'
import { Sparkline } from '../ui'

export function MarketCard({ marketId }: { marketId: string }) {
  const mk = useStore((s) => s.markets[marketId])
  const m = useStore((s) => s.matches[mk.matchId])
  const suspended = !!mk.suspendedUntil
  const closed = mk.closed
  const n = mk.selections.length
  const first = mk.selections[0]

  return (
    <section aria-label={mk.name} className="rounded-m border border-line bg-card">
      <header className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
        <h4 className="text-[14.5px] font-bold">{mk.name}</h4>
        <div className="flex items-center gap-2 text-[12px] text-muted">
          {suspended ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-ink px-2 py-0.5 font-semibold text-white"><Lock size={11} aria-hidden="true" /> Paused</span>
          ) : closed ? (
            <span className="rounded-full border border-line px-2 py-0.5 font-semibold">Closed</span>
          ) : (
            <>
              <span className="hidden sm:inline">{first.label.length > 18 ? 'Trend' : first.label}</span>
              <Sparkline values={first.history} label={`${first.label} price trend`} />
            </>
          )}
        </div>
      </header>

      <div className="relative p-3">
        {mk.key === 'ags' ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {[0, 1].map((side) => (
              <div key={side}>
                <p className="mb-2 px-1 text-[12px] font-semibold text-muted">{teams[side ? m.away : m.home].name}</p>
                <div className="grid gap-2">
                  {mk.selections.slice(side * 3, side * 3 + 3).map((s) => <OddsButton key={s.id} selId={s.id} label={s.label} />)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={cx('grid gap-2', n === 3 ? 'grid-cols-3' : 'grid-cols-2')}>
            {mk.selections.map((s) => <OddsButton key={s.id} selId={s.id} label={s.label} />)}
          </div>
        )}

        {suspended && (
          <div key={mk.suspendedUntil} className="shutter absolute inset-0 flex items-center justify-center gap-2 rounded-b-m bg-card/[0.94] text-[14px] font-semibold" role="status">
            <Lock size={16} aria-hidden="true" /> Back soon
            <span className="sr-only">. {mk.name} is paused for a moment.</span>
          </div>
        )}
        {closed && !suspended && mk.closedReason && (
          <p className="mt-2 px-1 text-[12.5px] text-muted">{mk.closedReason}.</p>
        )}
      </div>
    </section>
  )
}

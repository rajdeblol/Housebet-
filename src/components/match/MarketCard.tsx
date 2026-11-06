import { Lock } from 'lucide-react'
import { teams } from '../../data/teams'
import { useStore } from '../../engine/store'
import { cx } from '../../lib/format'
import { OddsButton } from '../OddsButton'

function settlementCopy(key: string, name: string) {
  if (key === 'mr') return 'Match result follows the final score: home win, draw or away win.'
  if (key === 'ml') return 'The winner is determined by the final match state. This market has no draw outcome.'
  if (key === 'btts') return 'Yes wins if both teams score at least once; No wins otherwise.'
  if (key.startsWith('ou') || key === 'total' || key === 'alttotal') return `${name} is decided by the combined score and the displayed line.`
  if (key.startsWith('hcp') || key === 'spread' || key === 'altspread') return `${name} is decided by applying the displayed handicap to the final score.`
  if (key === 'ags') return 'The named player must score during the match for that selection to win.'
  if (key.includes('cor') || key.includes('crd') || key === 'wkts' || key === 'inn1') return `${name} is decided by the final match statistics shown in this demo.`
  return `${name} is decided by the final match state shown in this demo.`
}

export function MarketCard({ marketId }: { marketId: string }) {
  const mk = useStore((s) => s.markets[marketId])
  const m = useStore((s) => s.matches[mk.matchId])
  const suspended = !!mk.suspendedUntil
  const closed = mk.closed
  const n = mk.selections.length

  return (
    <section aria-label={mk.name} className="rounded-m border border-line bg-card">
      <header className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
        <h4 className="text-[14.5px] font-bold">{mk.name}</h4>
        <div className="flex items-center gap-2 text-[12px] text-muted">
          {suspended ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-ink px-2 py-0.5 font-semibold text-white"><Lock size={11} aria-hidden="true" /> Suspended</span>
          ) : closed ? (
            <span className="rounded-full border border-line px-2 py-0.5 font-semibold">Closed</span>
          ) : (
            <span className="inline-flex items-center gap-1 font-semibold text-upText">Open</span>
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
            <Lock size={16} aria-hidden="true" /> Suspended · back soon
            <span className="sr-only">. {mk.name} is suspended for a moment.</span>
          </div>
        )}
        {closed && !suspended && mk.closedReason && (
          <p className="mt-2 px-1 text-[12.5px] text-muted">{mk.closedReason}.</p>
        )}

        <details className="mt-3 border-t border-line px-1 pt-2.5">
          <summary className="min-h-9 cursor-pointer text-[12px] font-semibold text-muted marker:text-brand hover:text-ink">How this market resolves</summary>
          <p className="pb-1 text-[11.5px] leading-relaxed text-muted">{settlementCopy(mk.key, mk.name)} Resolution source: Housebets simulated match state. This is a demo explanation; no real-world data or wagers are used.</p>
        </details>
      </div>
    </section>
  )
}

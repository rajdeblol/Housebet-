import { ArrowDown, ArrowUp, Lock } from 'lucide-react'
import { useRef } from 'react'
import { actions, useStore } from '../engine/store'
import { cx, fmtOdds } from '../lib/format'

interface Props {
  selId: string
  /** short tag shown before the price (e.g. 1 / X / 2) */
  tag?: string
  /** full label shown above the price in market grids */
  label?: string
  className?: string
}

export function OddsButton({ selId, tag, label, className }: Props) {
  const [matchId, key, idx] = selId.split(':')
  const mk = useStore((s) => s.markets[`${matchId}:${key}`])
  const now = useStore((s) => s.now)
  const selected = useStore((s) => s.slip.items.some((i) => i.selId === selId))
  const mountedAt = useRef(Date.now())
  const sel = mk.selections[Number(idx)]
  const m = useStore((s) => s.matches[matchId])

  const suspended = !!mk.suspendedUntil
  const closed = mk.closed || sel.closed || m.status === 'ft'
  const fresh = sel.move && sel.movedAt > mountedAt.current && now - sel.movedAt < 1200
  const showArrow = sel.move && now - sel.movedAt < 6000 && !suspended && !closed
  const disabled = (suspended || closed) && !selected

  const name = label ?? sel.label
  const aria = closed
    ? `${name}: ${sel.note ?? 'closed'}`
    : suspended
      ? `${name}: market paused`
      : `${name} at ${fmtOdds(sel.odds)}${selected ? ', in bet slip' : ''}${showArrow ? (sel.move === 'up' ? ', price up' : ', price down') : ''}`

  return (
    <button
      type="button"
      onClick={() => actions.toggleSelection(selId)}
      disabled={disabled}
      aria-pressed={selected}
      aria-label={aria}
      className={cx(
        'group relative flex min-h-[44px] min-w-0 items-center overflow-hidden rounded-s border text-left transition-colors',
        label ? 'flex-col items-stretch justify-center gap-0.5 px-3 py-2 lg:min-h-[56px]' : 'justify-between gap-1 px-2.5 lg:min-h-[44px]',
        selected
          ? 'border-accent bg-accent text-white'
          : disabled
            ? 'cursor-not-allowed border-line bg-sunk/60 text-muted'
            : 'border-line bg-sunk text-ink hover:border-ink',
        className,
      )}
    >
      {fresh && !selected && <span key={sel.movedAt} className={cx('pointer-events-none absolute inset-0', sel.move === 'up' ? 'tick-up' : 'tick-down')} aria-hidden="true" />}
      {label && <span className={cx('relative truncate text-[12.5px] leading-tight', selected ? 'text-white/90' : 'text-muted')}>{label}</span>}
      {tag && <span className={cx('relative text-[12px] font-semibold', selected ? 'text-white/85' : 'text-muted')}>{tag}</span>}
      <span className="relative flex items-center justify-end gap-1">
        {suspended && !closed ? (
          <Lock size={15} aria-hidden="true" />
        ) : closed ? (
          <span className="text-[13px] font-semibold">{sel.note ?? '—'}</span>
        ) : (
          <>
            <span className="inline-flex w-3 justify-center" aria-hidden="true">
              {showArrow && (sel.move === 'up'
                ? <ArrowUp size={12} strokeWidth={3} className={selected ? 'text-white' : 'text-up'} />
                : <ArrowDown size={12} strokeWidth={3} className={selected ? 'text-white' : 'text-down'} />)}
            </span>
            <span className="tnum text-[17px] font-bold leading-none tracking-tight">{fmtOdds(sel.odds)}</span>
          </>
        )}
      </span>
    </button>
  )
}

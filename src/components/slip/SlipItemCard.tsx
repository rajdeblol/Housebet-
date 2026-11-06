import { AlertTriangle, ArrowDown, ArrowUp, Ban, Lock, X } from 'lucide-react'
import { forwardRef } from 'react'
import { Link } from 'react-router-dom'
import { teams } from '../../data/teams'
import { actions, getState, itemView, MAX_STAKE, useStore } from '../../engine/store'
import type { SlipItem } from '../../engine/types'
import { cx, fmtOdds, fmtUSDT } from '../../lib/format'

const CHIPS = [5, 10, 25, 50]

export const SlipItemCard = forwardRef<HTMLInputElement, { item: SlipItem }>(function SlipItemCard({ item }, ref) {
  useStore((s) => s.markets[item.marketId])
  useStore((s) => s.matches[item.matchId])
  const balance = useStore((s) => s.balance)
  const placing = useStore((s) => s.slip.status === 'placing')
  const v = itemView(item, getState())
  const { m, mk, sel, kind, reason, stakeError } = v
  const stake = parseFloat(item.stake)
  const ret = !isNaN(stake) && stake > 0 ? stake * (kind === 'changed' ? sel.odds : item.accepted) : 0
  const blocked = kind === 'closed' || kind === 'suspended'
  const inputId = `stake-${item.selId}`

  return (
    <li className={cx('slide-in rounded-m border bg-card', kind === 'ok' ? 'border-line' : kind === 'changed' ? 'border-ink' : 'border-line')}>
      <div className="flex items-start gap-3 px-3.5 pt-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-[15px] font-bold leading-snug">{sel.label}</p>
          <p className="truncate text-[12.5px] text-muted">{mk.name}</p>
          <Link to={`/match/${m.id}`} className="mt-0.5 block truncate text-[12.5px] text-muted underline-offset-2 hover:text-ink hover:underline">
            {teams[m.home].name} v {teams[m.away].name}{m.status === 'live' && ` · ${m.score[0]}–${m.score[1]}`}
          </Link>
        </div>
        <div className="text-right">
          {kind === 'changed' ? (
            <div className="flex flex-col items-end">
              <span className="tnum text-[12.5px] text-muted line-through" aria-label={`Old price ${fmtOdds(item.accepted)}`}>{fmtOdds(item.accepted)}</span>
              <span className={cx('tnum inline-flex items-center gap-0.5 text-[19px] font-extrabold leading-none', sel.odds > item.accepted ? 'text-upText' : 'text-down')} aria-label={`New price ${fmtOdds(sel.odds)}`}>
                {sel.odds > item.accepted ? <ArrowUp size={14} strokeWidth={3} aria-hidden="true" /> : <ArrowDown size={14} strokeWidth={3} aria-hidden="true" />}
                {fmtOdds(sel.odds)}
              </span>
            </div>
          ) : (
            <span className={cx('tnum text-[19px] font-extrabold leading-none', blocked && 'text-muted')}>{fmtOdds(item.accepted)}</span>
          )}
        </div>
        <button
          type="button"
          onClick={() => actions.removeItem(item.selId)}
          aria-label={`Remove ${sel.label} from bet slip`}
          className="-mr-2 -mt-1.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-s text-muted hover:bg-sunk hover:text-ink lg:h-9 lg:w-9"
        >
          <X size={17} aria-hidden="true" />
        </button>
      </div>

      {kind !== 'ok' && (
        <p
          role="status"
          className={cx(
            'mx-3.5 mt-2.5 flex items-start gap-2 rounded-s px-2.5 py-2 text-[13px] font-medium',
            kind === 'changed' ? 'bg-sunk text-ink' : 'bg-warnBg text-warn',
          )}
        >
          {kind === 'suspended' ? <Lock size={14} className="mt-0.5 shrink-0" aria-hidden="true" /> : kind === 'closed' ? <Ban size={14} className="mt-0.5 shrink-0" aria-hidden="true" /> : <AlertTriangle size={14} className="mt-0.5 shrink-0" aria-hidden="true" />}
          {kind === 'changed' ? `Odds changed. ${reason}` : reason}
        </p>
      )}

      <div className="px-3.5 pb-3.5 pt-3">
        <div className="flex items-stretch gap-2">
          <label htmlFor={inputId} className="sr-only">Stake for {sel.label} in USDT</label>
          <div className={cx('flex h-11 flex-1 items-center rounded-s border bg-sunk px-3 focus-within:border-ink', stakeError ? 'border-down' : 'border-line')}>
            <input
              ref={ref}
              id={inputId}
              inputMode="decimal"
              autoComplete="off"
              placeholder="Stake"
              value={item.stake}
              disabled={placing}
              onChange={(e) => actions.setStake(item.selId, e.target.value)}
              aria-invalid={!!stakeError}
              aria-describedby={stakeError ? `${inputId}-err` : undefined}
              className="tnum h-full w-full min-w-0 bg-transparent text-[16px] font-bold outline-none placeholder:font-medium placeholder:text-muted"
            />
            <span className="text-[12px] font-semibold text-muted">USDT</span>
          </div>
          <div className="flex min-w-[96px] flex-col justify-center text-right">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted">Return</span>
            <span className="tnum text-[15px] font-bold">{fmtUSDT(ret)}</span>
          </div>
        </div>
        {stakeError && <p id={`${inputId}-err`} className="mt-1.5 text-[12.5px] font-medium text-down">{stakeError}</p>}
        <div className="mt-2 grid grid-cols-5 gap-1.5" role="group" aria-label={`Quick stakes for ${sel.label}`}>
          {CHIPS.map((c) => (
            <button key={c} type="button" disabled={placing} onClick={() => actions.setStake(item.selId, String(c))}
              className={cx('tnum h-11 rounded-s border text-[13px] font-semibold lg:h-8', parseFloat(item.stake) === c ? 'border-ink bg-ink text-white' : 'border-line bg-card hover:border-ink')}>
              {c}
            </button>
          ))}
          <button type="button" disabled={placing}
            onClick={() => actions.setStake(item.selId, String(Math.floor(Math.min(MAX_STAKE, balance) * 100) / 100))}
            aria-label={`Max stake, ${fmtUSDT(Math.min(MAX_STAKE, balance))} USDT`}
            className="h-11 rounded-s border border-line bg-card text-[13px] font-semibold hover:border-ink lg:h-8">
            Max
          </button>
        </div>
      </div>
    </li>
  )
})

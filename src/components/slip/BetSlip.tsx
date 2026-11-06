import { AlertTriangle, Check, RotateCw, Ticket, WifiOff } from 'lucide-react'
import { useEffect, useMemo, useRef } from 'react'
import { Link } from 'react-router-dom'
import { actions, getState, isOffline, itemView, useStore } from '../../engine/store'
import { cx, fmtOdds, fmtUSDT, timeOfDay } from '../../lib/format'
import { Spinner } from '../ui'
import { SlipItemCard } from './SlipItemCard'

function PlacedView() {
  const placed = useStore((s) => s.slip.placed)
  const placedAt = useStore((s) => s.slip.placedAt)
  const bets = useStore((s) => s.bets)
  const sheetOpen = useStore((s) => s.sheetOpen)
  const list = useMemo(() => placed.map((id) => bets.find((b) => b.id === id)!).filter(Boolean), [placed, bets])
  const total = list.reduce((a, b) => a + b.stake, 0)
  const done = () => { actions.dismissPlaced(); if (sheetOpen) actions.openSheet(false) }

  return (
    <div className="p-4" role="status">
      <div className="rounded-m border border-line bg-card p-4 shadow-raised">
        <div className="flex items-center gap-3">
          <span className="pop flex h-10 w-10 items-center justify-center rounded-full bg-up text-white">
            <Check size={20} strokeWidth={3} aria-hidden="true" />
          </span>
          <div>
            <p className="text-[16px] font-extrabold">{list.length === 1 ? 'Bet placed' : `${list.length} bets placed`}</p>
            <p className="text-[12.5px] text-muted">
              <span className="tnum">{fmtUSDT(total)}</span> USDT staked at <span className="tnum">{placedAt ? timeOfDay(placedAt) : ''}</span>
            </p>
          </div>
        </div>

        <ul className="mt-4 divide-y divide-line border-t border-line text-[13px]">
          {list.map((b) => (
            <li key={b.id} className="flex items-center justify-between gap-2 py-2.5">
              <span className="min-w-0 truncate">
                <span className="font-bold">{b.pick}</span> <span className="tnum text-muted">@ {fmtOdds(b.odds)}</span>
              </span>
              {list.length > 1 && <span className="tnum shrink-0 text-[11px] text-muted">{b.id}</span>}
            </li>
          ))}
        </ul>

        <div className="mt-3 grid grid-cols-2 gap-2">
          <Link to="/bets#my-bets" onClick={done} className="flex h-11 items-center justify-center rounded-s bg-ink text-[13.5px] font-bold text-white hover:opacity-90">
            View in My bets
          </Link>
          <button type="button" onClick={done} className="h-11 rounded-s border border-line bg-card text-[13.5px] font-semibold hover:border-ink">
            Done
          </button>
        </div>
      </div>
    </div>
  )
}

/** Singles-only bet slip: one card per pick, each with its own stake and return. */
export function BetSlip({ inSheet = false }: { inSheet?: boolean }) {
  const items = useStore((s) => s.slip.items)
  const status = useStore((s) => s.slip.status)
  const offline = useStore(isOffline)
  const balance = useStore((s) => s.balance)
  const focusAt = useStore((s) => s.focusStakeAt)
  useStore((s) => s.markets)
  useStore((s) => s.matches)
  const firstInput = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (focusAt && inSheet) window.setTimeout(() => firstInput.current?.focus(), 280)
  }, [focusAt, inSheet])

  if (status === 'placed') return <div className="h-full overflow-y-auto"><PlacedView /></div>

  const views = items.map((i) => itemView(i, getState()))
  const placing = status === 'placing'
  const changed = views.some((v) => v.kind === 'changed')
  const blocked = views.some((v) => v.kind === 'suspended' || v.kind === 'closed')
  const missingStake = views.some((v) => v.stakeNum <= 0)
  const stakeError = views.some((v) => v.stakeError)
  const totalStake = views.reduce((a, v) => a + v.stakeNum, 0)
  const potential = views.reduce((a, v, i) => a + v.stakeNum * items[i].accepted, 0)
  const overBalance = totalStake > balance

  let cta = items.length === 1 ? 'Place bet' : `Place ${items.length} bets`
  let disabled = placing
  let hint = ''
  if (offline) { disabled = true; cta = 'Offline'; hint = 'Prices are paused. You can place bets again when you are back online.' }
  else if (blocked) { disabled = true; hint = 'Remove suspended or closed selections to continue.' }
  else if (missingStake) { disabled = true; hint = items.length === 1 ? 'Enter a stake to continue.' : 'Enter a stake for every selection.' }
  else if (stakeError) { disabled = true; hint = 'Fix the stake shown in red.' }
  else if (overBalance) { disabled = true; hint = `Total stake is more than your demo balance (${fmtUSDT(balance)} USDT).` }

  return (
    <div className={cx('flex h-full flex-col bg-card', inSheet && 'pb-[max(16px,env(safe-area-inset-bottom))]')}>
      <div className="flex items-center justify-between border-b border-line px-4 py-3">
        <h2 className="flex items-center gap-2 text-[16px] font-extrabold">
          Bet slip
          {items.length > 0 && <span className="tnum rounded-full bg-accent px-2 text-[12px] font-bold text-page">{items.length}</span>}
        </h2>
        <span className="text-[12px] font-semibold text-muted">Singles only</span>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center p-6 text-center">
          <span className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-sunk" aria-hidden="true"><Ticket size={19} /></span>
          <p className="text-[15px] font-bold">Your bet slip is empty</p>
          <p className="mt-1 max-w-[240px] text-[13px] text-muted">Tap any price to add it. Each pick is a single bet with its own stake.</p>
          <Link to="/live" className="mt-4 inline-flex h-10 items-center rounded-s border border-line px-4 text-[13px] font-semibold hover:border-ink">
            Browse live games
          </Link>
        </div>
      ) : (
        <>
          <div className="min-h-0 flex-1 overflow-y-auto p-3">
            {status === 'failed' && (
              <div role="alert" className="mb-3 rounded-m border border-down/40 bg-card p-3">
                <p className="flex items-start gap-2 text-[13.5px] font-semibold text-down">
                  <AlertTriangle size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
                  Your bet was not placed. Nothing was taken from your balance.
                </p>
                <button
                  type="button"
                  onClick={actions.placeBets}
                  disabled={offline}
                  className="mt-2 inline-flex h-10 items-center gap-1.5 rounded-s border border-line bg-card px-3 text-[13px] font-bold hover:border-ink disabled:opacity-50"
                >
                  <RotateCw size={14} aria-hidden="true" /> Try again
                </button>
              </div>
            )}
            {offline && (
              <p role="status" className="mb-3 flex items-center gap-2 rounded-m bg-warnBg px-3 py-2.5 text-[13px] font-semibold text-warn">
                <WifiOff size={15} aria-hidden="true" /> You are offline. Prices are frozen.
              </p>
            )}
            <ul className="space-y-2.5">
              {items.map((it, i) => <SlipItemCard key={it.selId} item={it} ref={i === 0 ? firstInput : undefined} />)}
            </ul>
            <button type="button" onClick={actions.clearSlip} disabled={placing} className="mt-2 inline-flex min-h-[40px] items-center px-1 text-[13px] font-semibold text-muted hover:text-ink">
              Clear all
            </button>
          </div>

          <div className="border-t border-line bg-card p-4">
            <dl className="mb-3 grid grid-cols-2 gap-y-1 text-[13px]">
              <dt className="text-muted">Total stake</dt>
              <dd className="tnum text-right font-semibold">{fmtUSDT(totalStake)} USDT</dd>
              <dt className="text-muted">Potential return</dt>
              <dd key={potential} className="tnum slip-value-change text-right text-[16px] font-extrabold">{fmtUSDT(potential)} USDT</dd>
            </dl>
            <p className="mb-2 text-[11.5px] text-muted">Return includes your stake.</p>

            {changed && !offline ? (
              <>
                <p role="status" className="mb-2 text-[13px] font-semibold">Odds have changed. Accept the new prices to continue.</p>
                <button type="button" onClick={actions.acceptOdds} className="h-12 w-full rounded-s bg-ink text-[15px] font-bold text-white hover:opacity-90">
                  Accept new odds
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={actions.placeBets}
                disabled={disabled}
                aria-describedby={hint ? 'slip-hint' : undefined}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-s bg-accent text-[15px] font-bold text-page transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-45"
              >
                {placing ? <><Spinner /> Placing…</> : cta}
              </button>
            )}
            {hint && !changed && <p id="slip-hint" className="mt-2 text-[12.5px] text-muted">{hint}</p>}
          </div>
        </>
      )}
    </div>
  )
}

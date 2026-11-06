import { Check, MousePointerClick, RotateCcw, Trash2, WifiOff, XCircle } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { actions, getState, isOffline, itemView, useStore } from '../../engine/store'
import { cx, fmtUSDT, timeOfDay } from '../../lib/format'
import { BetCardPanel } from '../card/BetCardPanel'
import { Spinner } from '../ui'
import { SlipItemCard } from './SlipItemCard'

function PlacedView() {
  const placed = useStore((s) => s.slip.placed)
  const placedAt = useStore((s) => s.slip.placedAt)
  const bets = useStore((s) => s.bets)
  const list = useMemo(() => placed.map((id) => bets.find((b) => b.id === id)!).filter(Boolean), [placed, bets])
  const [cardIdx, setCardIdx] = useState(0)
  const bet = list[cardIdx] ?? list[0]
  const sheetOpen = useStore((s) => s.sheetOpen)
  const total = list.reduce((a, b) => a + b.stake, 0)

  return (
    <div className="p-4" role="status">
      <div className="rounded-m border border-line bg-card p-4">
        <div className="flex items-center gap-3">
          <span className="pop flex h-10 w-10 items-center justify-center rounded-full bg-up text-white"><Check size={20} strokeWidth={3} aria-hidden="true" /></span>
          <div>
            <p className="text-[16px] font-extrabold">{list.length === 1 ? 'Bet placed' : `${list.length} bets placed`}</p>
            <p className="text-[13px] text-muted">{fmtUSDT(total)} USDT staked at <span className="tnum">{placedAt ? timeOfDay(placedAt) : ''}</span>. Your slip is clear.</p>
          </div>
        </div>
        <ul className="mt-3 divide-y divide-line border-t border-line text-[13px]">
          {list.map((b, i) => (
            <li key={b.id} className="flex items-center justify-between gap-2 py-2">
              <span className="min-w-0 truncate"><span className="font-semibold">{b.pick}</span> <span className="text-muted">@ {b.odds.toFixed(2)}</span></span>
              <button type="button" onClick={() => setCardIdx(i)} aria-pressed={i === cardIdx} aria-label={`Show bet card for ${b.id}`}
                className={cx('tnum h-8 shrink-0 rounded-s px-2 font-bold', i === cardIdx ? 'bg-ink text-white' : 'hover:bg-sunk')}>{b.id}</button>
            </li>
          ))}
        </ul>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <Link to="/bets" onClick={() => { actions.dismissPlaced(); if (sheetOpen) actions.openSheet(false) }} className="flex h-11 items-center justify-center rounded-s bg-ink text-[14px] font-semibold text-white">View in My bets</Link>
          <button type="button" onClick={() => { actions.dismissPlaced(); if (sheetOpen) actions.openSheet(false) }} className="h-11 rounded-s border border-line bg-card text-[14px] font-semibold hover:border-ink">Done</button>
        </div>
      </div>
      {bet && <div className="mt-4" key={bet.id}><BetCardPanel bet={bet} reveal /></div>}
    </div>
  )
}

export function BetSlip({ inSheet = false }: { inSheet?: boolean }) {
  const items = useStore((s) => s.slip.items)
  const status = useStore((s) => s.slip.status)
  const offline = useStore(isOffline)
  const balance = useStore((s) => s.balance)
  const focusAt = useStore((s) => s.focusStakeAt)
  const openBets = useStore((s) => s.bets.filter((b) => b.status === 'open').length)
  useStore((s) => s.markets)
  useStore((s) => s.matches)
  const refs = useRef<Record<string, HTMLInputElement | null>>({})

  // mobile: opening the sheet focuses the first empty stake
  useEffect(() => {
    if (!inSheet || !focusAt) return
    const t = window.setTimeout(() => {
      const target = items.find((i) => !i.stake) ?? items[items.length - 1]
      if (target) refs.current[target.selId]?.focus()
    }, 280)
    return () => window.clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusAt, inSheet])

  const views = items.map((i) => ({ item: i, ...itemView(i, getState()) }))
  const total = views.reduce((a, v) => a + (v.stakeNum > 0 ? v.stakeNum : 0), 0)
  const potential = views.reduce((a, v) => a + (v.stakeNum > 0 ? v.stakeNum * (v.kind === 'changed' ? v.sel.odds : v.item.accepted) : 0), 0)
  const blocked = views.some((v) => v.kind === 'closed' || v.kind === 'suspended')
  const changed = views.some((v) => v.kind === 'changed')
  const missing = views.some((v) => !(v.stakeNum > 0))
  const stakeErr = views.some((v) => v.stakeError)
  const over = total > balance
  const placing = status === 'placing'

  let note = ''
  if (offline) note = "You're offline. Reconnect to place bets."
  else if (blocked) note = 'Remove paused or closed selections to continue.'
  else if (changed) note = 'Prices moved. Accept the new odds to continue.'
  else if (stakeErr) note = 'Fix the stake shown in red to continue.'
  else if (over) note = `Total stake is more than your balance of ${fmtUSDT(balance)} USDT.`
  else if (missing) note = items.length > 1 ? 'Enter a stake for each selection.' : 'Enter a stake to place your bet.'

  if (status === 'placed') return <div className="h-full overflow-y-auto"><PlacedView /></div>

  return (
    <div className="flex h-full flex-col">
      <div className={cx('flex items-center justify-between gap-2 border-b border-line px-4 py-3', inSheet && 'pr-14')}>
        <div className="flex items-baseline gap-2">
          <h2 className="text-[17px] font-extrabold">Bet slip</h2>
          {items.length > 0 && <span className="tnum rounded-full bg-ink px-2 py-0.5 text-[12px] font-bold text-white">{items.length}</span>}
          <span className="text-[12.5px] text-muted">Singles</span>
        </div>
        {items.length > 1 && !placing && (
          <button type="button" onClick={actions.clearSlip} className="inline-flex h-9 items-center gap-1.5 rounded-s px-2 text-[13px] font-semibold text-muted hover:bg-sunk hover:text-ink">
            <Trash2 size={14} aria-hidden="true" /> Clear all
          </button>
        )}
      </div>

      {offline && (
        <p role="status" className="flex items-center gap-2 border-b border-line bg-warnBg px-4 py-2.5 text-[13px] font-medium text-warn">
          <WifiOff size={14} aria-hidden="true" /> You're offline. Prices are paused until you reconnect.
        </p>
      )}

      <div className="flex-1 overflow-y-auto px-3 py-3">
        {items.length === 0 ? (
          <div className="px-3 py-10 text-center">
            <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-sunk"><MousePointerClick size={18} aria-hidden="true" /></div>
            <p className="font-semibold">Your bet slip is empty</p>
            <p className="mx-auto mt-1 max-w-[240px] text-[13.5px] text-muted">Tap any price to add it. Each selection is its own single bet.</p>
            {openBets > 0 && (
              <Link to="/bets" onClick={() => inSheet && actions.openSheet(false)} className="mt-4 inline-flex h-10 items-center rounded-s border border-line bg-card px-3 text-[13px] font-semibold hover:border-ink">
                {openBets} open {openBets === 1 ? 'bet' : 'bets'} in My bets
              </Link>
            )}
          </div>
        ) : (
          <ul className="space-y-2.5" aria-label="Selections">
            {items.map((i) => <SlipItemCard key={i.selId} item={i} ref={(el) => { refs.current[i.selId] = el }} />)}
          </ul>
        )}
      </div>

      {items.length > 0 && (
        <div className="border-t border-line bg-card px-4 pb-4 pt-3" style={{ paddingBottom: inSheet ? 'max(16px, env(safe-area-inset-bottom))' : undefined }}>
          {status === 'failed' && (
            <div role="alert" className="mb-3 flex items-start gap-2 rounded-s bg-warnBg px-3 py-2.5 text-[13.5px] font-medium text-warn">
              <XCircle size={16} className="mt-0.5 shrink-0" aria-hidden="true" /> Bet didn't go through. Your stake wasn't taken. Try again.
            </div>
          )}
          <dl className="space-y-1 text-[14px]">
            <div className="flex justify-between"><dt className="text-muted">Total stake</dt><dd className="tnum font-semibold">{fmtUSDT(total)} USDT</dd></div>
            <div className="flex justify-between"><dt className="text-muted">Potential return</dt><dd className="tnum text-[17px] font-extrabold">{fmtUSDT(potential)} USDT</dd></div>
          </dl>
          {note && !placing && <p className="mt-2 text-[12.5px] font-medium text-muted" aria-live="polite">{note}</p>}

          {changed && !blocked && !offline && !placing ? (
            <button type="button" onClick={actions.acceptOdds} className="mt-3 flex h-12 w-full items-center justify-center rounded-m bg-accent text-[15.5px] font-bold text-white">
              Accept new odds
            </button>
          ) : status === 'failed' && !blocked && !offline ? (
            <button type="button" onClick={actions.placeBets} disabled={missing || stakeErr || over} className="mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-m bg-accent text-[15.5px] font-bold text-white disabled:opacity-40">
              <RotateCcw size={16} aria-hidden="true" /> Retry
            </button>
          ) : (
            <button
              type="button"
              onClick={actions.placeBets}
              disabled={placing || offline || blocked || missing || stakeErr || over}
              aria-busy={placing}
              className="mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-m bg-accent text-[15.5px] font-bold text-white disabled:cursor-not-allowed disabled:bg-line disabled:text-muted aria-busy:!bg-accent aria-busy:!text-white"
            >
              {placing ? <><Spinner /> Placing {items.length > 1 ? 'bets' : 'bet'}…</> : <>Place {items.length > 1 ? `${items.length} bets` : 'bet'}{total > 0 && <span className="tnum font-semibold opacity-90">· {fmtUSDT(total)} USDT</span>}</>}
            </button>
          )}
        </div>
      )}
    </div>
  )
}

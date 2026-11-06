import { Check, ChevronDown, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { teams } from '../../data/teams'
import { actions, getState, isOffline, itemView, MAX_STAKE, useStore } from '../../engine/store'
import { cx, fmtOdds, fmtUSDT, timeOfDay } from '../../lib/format'
import { BetCardPanel } from '../card/BetCardPanel'
import { Crest, Spinner } from '../ui'

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
      <div className="rounded-2xl border border-line bg-card p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500 text-white shadow-xs">
            <Check size={20} strokeWidth={3} aria-hidden="true" />
          </span>
          <div>
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="rounded-md bg-emerald-500/10 px-2 py-0.5 text-[10px] font-black uppercase text-emerald-600 tracking-wider">
                DEMO RECEIPT
              </span>
              <span className="text-[10px] text-muted font-bold">Simulated Single Wager</span>
            </div>
            <p className="text-[16px] font-extrabold text-ink">Simulated Bet Placed</p>
            <p className="text-[12px] text-muted">
              {fmtUSDT(total)} Demo USDT staked at <span className="tnum">{placedAt ? timeOfDay(placedAt) : ''}</span>
            </p>
          </div>
        </div>

        <ul className="mt-4 divide-y divide-line border-t border-line text-[13px]">
          {list.map((b, i) => (
            <li key={b.id} className="flex items-center justify-between gap-2 py-2.5">
              <span className="min-w-0 truncate">
                <span className="font-bold text-ink">{b.pick}</span>{' '}
                <span className="text-muted">@ {b.odds.toFixed(2)}x</span>
              </span>
              <button
                type="button"
                onClick={() => setCardIdx(i)}
                className={cx('tnum h-7 rounded-md px-2 text-xs font-bold transition-colors', i === cardIdx ? 'bg-ink text-white' : 'bg-sunk text-muted')}
              >
                {b.id}
              </button>
            </li>
          ))}
        </ul>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <Link
            to="/bets"
            onClick={() => { actions.dismissPlaced(); if (sheetOpen) actions.openSheet(false) }}
            className="flex h-10 items-center justify-center rounded-xl bg-ink text-[13px] font-bold text-white transition-opacity hover:opacity-90"
          >
            My Bets
          </Link>
          <button
            type="button"
            onClick={() => { actions.dismissPlaced(); if (sheetOpen) actions.openSheet(false) }}
            className="h-10 rounded-xl border border-line bg-card text-[13px] font-semibold text-ink hover:bg-sunk"
          >
            Done
          </button>
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
  useStore((s) => s.markets)
  const matches = useStore((s) => s.matches)

  // In the singles-only Probly paradigm, focus on the active selection
  const activeItem = items[0]
  const v = activeItem ? itemView(activeItem, getState()) : null
  const placing = status === 'placing'

  const stakeNum = activeItem ? parseFloat(activeItem.stake) || 0 : 0
  const oddsVal = v ? (v.kind === 'changed' ? v.sel.odds : activeItem.accepted) : 1
  const payout = stakeNum > 0 ? stakeNum * oddsVal : 0

  const matchObj = activeItem ? matches[activeItem.matchId] : null
  const homeTeam = matchObj ? teams[matchObj.home] : null
  const awayTeam = matchObj ? teams[matchObj.away] : null

  const CHIPS = [1, 5, 10, 50]

  if (status === 'placed') return <div className="h-full overflow-y-auto"><PlacedView /></div>

  return (
    <div className={cx('flex h-full flex-col bg-page p-4 text-ink', inSheet && 'pb-8')}>
      {/* 1. Header (Al Fateh vs Al Riyadh title) */}
      {activeItem && v && matchObj ? (
        <div className="rounded-2xl border border-line bg-card p-4 shadow-xs">
          <div className="mb-3 flex items-center justify-between border-b border-line/60 pb-3">
            <div className="flex items-center gap-2 truncate">
              {homeTeam && <Crest id={homeTeam.id} size={22} />}
              <span className="truncate text-xs font-semibold text-muted">
                {homeTeam?.name} vs {awayTeam?.name}
              </span>
            </div>
            <button
              type="button"
              onClick={actions.clearSlip}
              aria-label="Remove pick"
              className="text-muted transition-colors hover:text-ink"
            >
              <Trash2 size={14} />
            </button>
          </div>

          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-[17px] font-black leading-tight text-ink">{v.sel.label}</p>
              <p className="text-[11.5px] text-muted">{v.mk.name}</p>
            </div>
            <ChevronDown size={16} className="text-muted" />
          </div>

          {/* 2. Binary Outcome Toggle ([Yes 111.1x] [No --]) */}
          <div className="mb-4 grid grid-cols-2 gap-2">
            <button
              type="button"
              className="flex h-10 items-center justify-center gap-1.5 rounded-full bg-emerald-600 px-3 text-xs font-black text-white shadow-xs"
            >
              <span>Yes</span>
              <span className="tnum font-extrabold">{fmtOdds(oddsVal)}x</span>
            </button>
            <button
              type="button"
              disabled
              className="flex h-10 items-center justify-center gap-1.5 rounded-full border border-line bg-sunk/60 px-3 text-xs font-semibold text-muted"
            >
              <span>No</span>
              <span>--</span>
            </button>
          </div>

          {/* 3. Staking Box (Buy in $0 -> Payout $0.00) */}
          <div className="mb-3 rounded-xl border border-line bg-sunk/40 p-3.5">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted">Buy in</span>
                <div className="mt-0.5 flex items-center gap-1">
                  <span className="text-sm font-bold text-muted">$</span>
                  <input
                    type="number"
                    inputMode="decimal"
                    placeholder="0"
                    value={activeItem.stake}
                    disabled={placing}
                    onChange={(e) => actions.setStake(activeItem.selId, e.target.value)}
                    className="tnum w-24 bg-transparent text-[20px] font-black text-ink outline-none"
                  />
                </div>
              </div>

              <div className="text-muted/60 text-lg font-light">→</div>

              <div className="flex flex-col text-right">
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted">Payout</span>
                <span className="tnum mt-0.5 text-[20px] font-black text-emerald-600">
                  ${fmtUSDT(payout)}
                </span>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between border-t border-line/60 pt-2 text-[11.5px] font-semibold text-muted">
              <span>Demo Balance:</span>
              <span className="tnum text-ink font-bold">${fmtUSDT(balance)} USDT (Demo)</span>
            </div>
          </div>

          {/* 4. Quick Stake Presets (+1, +5, +10, Max) */}
          <div className="mb-4 grid grid-cols-4 gap-1.5">
            {CHIPS.map((chip) => (
              <button
                key={chip}
                type="button"
                disabled={placing}
                onClick={() => actions.setStake(activeItem.selId, String(chip))}
                className={cx(
                  'h-8.5 rounded-full border text-xs font-bold transition-all',
                  parseFloat(activeItem.stake) === chip
                    ? 'border-ink bg-ink text-white'
                    : 'border-line bg-card text-ink hover:border-ink hover:bg-sunk',
                )}
              >
                +${chip}
              </button>
            ))}
            <button
              type="button"
              disabled={placing}
              onClick={() => actions.setStake(activeItem.selId, String(Math.floor(Math.min(MAX_STAKE, balance))))}
              className="h-8.5 rounded-full border border-line bg-card text-xs font-bold text-ink hover:border-ink hover:bg-sunk"
            >
              Max
            </button>
          </div>

          {/* 5. Big Action Button (Place Simulated Single Bet) */}
          <button
            type="button"
            disabled={placing || stakeNum <= 0 || stakeNum > balance || offline}
            onClick={actions.placeBets}
            className="flex h-11 w-full items-center justify-center rounded-xl bg-[#E4372B] text-[14px] font-black text-white shadow-md transition-all hover:bg-[#CF3428] active:scale-98 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {placing ? <Spinner /> : offline ? 'You are Offline' : stakeNum > balance ? 'Insufficient Demo Balance' : stakeNum <= 0 ? 'Enter Stake Amount' : 'Place Simulated Single Bet'}
          </button>

          <p className="mt-2.5 text-center text-[10.5px] text-muted">
            Simulated demo wagering only · <Link to="/bets" className="underline hover:text-ink">Prototype Rules</Link>
          </p>
        </div>
      ) : (
        /* Empty State */
        <div className="flex flex-1 flex-col items-center justify-center rounded-2xl border border-dashed border-line bg-card/60 p-6 text-center text-muted">
          <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-sunk text-ink">
            🎯
          </div>
          <p className="text-sm font-bold text-ink">Quick Single Betslip</p>
          <p className="mt-1 text-xs text-muted max-w-[200px]">
            Click any odd on the left to build your single wager instantly.
          </p>
        </div>
      )}
    </div>
  )
}

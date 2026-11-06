import { Image as ImageIcon, Lock, Receipt } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { teams } from '../data/teams'
import { EmptyState, LiveDot } from '../components/ui'
import { BetSlip } from '../components/slip/BetSlip'
import { actions, cashOutValue, useStore } from '../engine/store'
import type { Bet } from '../engine/types'
import { cx, dateTime, fmtOdds, fmtUSDT, kickoffLabel } from '../lib/format'
import { scoreText, statusShort } from '../lib/sport'

function CashOut({ bet }: { bet: Bet }) {
  const value = useStore((s) => cashOutValue(bet, s).value)
  const paused = useStore((s) => cashOutValue(bet, s).paused)
  const [confirming, setConfirming] = useState<number | null>(null)
  const confirmRef = useRef<HTMLButtonElement>(null)
  useEffect(() => { if (confirming !== null) confirmRef.current?.focus() }, [confirming])

  if (paused || value === null)
    return (
      <p className="flex h-11 items-center gap-2 rounded-s bg-sunk px-3 text-[13px] font-medium text-muted">
        <Lock size={14} aria-hidden="true" /> Cash out is paused while this market updates.
      </p>
    )

  if (confirming !== null) {
    const moved = value !== confirming
    return (
      <div className="rounded-s border border-ink p-3" role="group" aria-label="Confirm cash out">
        <p className="text-[13.5px]">
          {moved
            ? <>The value changed from <span className="tnum line-through">{fmtUSDT(confirming)}</span> to <span className="tnum font-bold">{fmtUSDT(value)}</span> USDT. Confirm the new amount?</>
            : <>Cash out now for <span className="tnum font-bold">{fmtUSDT(value)} USDT</span>? This settles the bet.</>}
        </p>
        <div className="mt-2.5 grid grid-cols-2 gap-2">
          <button type="button" onClick={() => setConfirming(null)} className="h-11 rounded-s border border-line bg-card text-[14px] font-semibold hover:border-ink">Cancel</button>
          <button ref={confirmRef} type="button" onClick={() => (moved ? setConfirming(value) : actions.cashOut(bet.id, value))}
            className="tnum h-11 rounded-s bg-accent text-[14px] font-bold text-white">
            {moved ? 'Review new amount' : `Confirm ${fmtUSDT(value)}`}
          </button>
        </div>
      </div>
    )
  }

  return (
    <button type="button" onClick={() => setConfirming(value)} className="flex h-11 w-full items-center justify-between rounded-s border border-ink bg-card px-3 text-[14px] font-semibold hover:bg-sunk">
      <span>Cash out</span>
      <span className="tnum font-extrabold">{fmtUSDT(value)} USDT</span>
    </button>
  )
}

function BetRow({ bet }: { bet: Bet }) {
  const m = useStore((s) => (bet.matchId ? s.matches[bet.matchId] : undefined))
  const now = useStore((s) => s.now)
  const badge = {
    open: { t: 'Open', c: 'bg-sunk text-ink' },
    won: { t: 'Won', c: 'bg-up text-white' },
    lost: { t: 'Lost', c: 'bg-sunk text-down' },
    cashed: { t: 'Cashed out', c: 'bg-ink text-white' },
  }[bet.status]
  const ret = bet.status === 'open' ? bet.stake * bet.odds : bet.returned ?? 0

  return (
    <li className="rounded-m border border-line bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[12px] font-semibold text-muted">{bet.compName}</p>
          {m ? (
            <Link to={`/match/${m.id}`} className="mt-0.5 block truncate text-[14px] font-semibold hover:underline">
              {teams[m.home].name} v {teams[m.away].name}
            </Link>
          ) : (
            <p className="mt-0.5 truncate text-[14px] font-semibold">{bet.home} v {bet.away}</p>
          )}
          <p className="mt-0.5 text-[12.5px] text-muted">
            {m?.status === 'live' ? (
              <span className="inline-flex items-center gap-1.5 font-semibold text-live"><LiveDot /> {statusShort(m)}{scoreText(m) && <> · <span className="tnum">{scoreText(m)!.join('–')}</span></>}</span>
            ) : m?.status === 'upcoming' ? `Kick-off ${kickoffLabel(m.kickoff, now)}`
              : bet.finalScore ? <span className="tnum">Final score {bet.finalScore[0]}–{bet.finalScore[1]}</span> : null}
          </p>
        </div>
        <span className={cx('shrink-0 rounded-full px-2.5 py-1 text-[11.5px] font-bold uppercase tracking-wider', badge.c)}>{badge.t}</span>
      </div>

      <div className="mt-3 flex items-end justify-between gap-3 border-t border-line pt-3">
        <div className="min-w-0">
          <p className="text-[12px] text-muted">{bet.marketName}</p>
          <p className="truncate text-[16px] font-extrabold">{bet.pick}</p>
        </div>
        <p className="tnum text-[20px] font-extrabold">{fmtOdds(bet.odds)}</p>
      </div>

      <dl className="mt-2 grid grid-cols-2 gap-2 text-[13px]">
        <div><dt className="text-muted">Stake</dt><dd className="tnum font-semibold">{fmtUSDT(bet.stake)} USDT</dd></div>
        <div className="text-right">
          <dt className="text-muted">{bet.status === 'open' ? 'Potential return' : bet.status === 'cashed' ? 'Cashed out for' : 'Returned'}</dt>
          <dd className={cx('tnum font-bold', bet.status === 'won' && 'text-upText')}>{fmtUSDT(ret)} USDT</dd>
        </div>
      </dl>

      {bet.status !== 'open' && (
        <div className={`mt-2.5 flex items-center justify-between rounded-lg px-3 py-1.5 text-xs font-bold ${
          (bet.returned ?? 0) > bet.stake
            ? 'bg-emerald-500/10 border border-emerald-500/25 text-emerald-400'
            : 'bg-sunk text-muted'
        }`}>
          <span>{bet.status === 'won' ? '🏆 Won Profit' : bet.status === 'cashed' ? '⚡ Cashed Out' : 'Settled'}</span>
          <span className="tnum font-black">
            {(bet.returned ?? 0) > bet.stake
              ? `+${fmtUSDT((bet.returned ?? 0) - bet.stake)} USDT Profit`
              : `${fmtUSDT((bet.returned ?? 0) - bet.stake)} USDT`}
          </span>
        </div>
      )}

      {bet.status === 'open' && <div className="mt-3"><CashOut bet={bet} /></div>}

      <div className="mt-3 flex items-center justify-between gap-2 text-[12px] text-muted">
        <span><span className="tnum font-semibold text-ink">{bet.id}</span> · {dateTime(bet.placedAt)}</span>
        <button type="button" onClick={() => actions.openCard(bet.id)} className="inline-flex h-11 items-center gap-1.5 rounded-s px-2 font-semibold text-ink hover:bg-sunk lg:h-8">
          <ImageIcon size={14} aria-hidden="true" /> Bet card
        </button>
      </div>
    </li>
  )
}

export function MyBetsPage() {
  const bets = useStore((s) => s.bets)
  const [tab, setTab] = useState<'open' | 'settled'>('open')
  const open = bets.filter((b) => b.status === 'open')
  const settled = bets.filter((b) => b.status !== 'open').sort((a, b) => (b.settledAt ?? 0) - (a.settledAt ?? 0))
  const list = tab === 'open' ? open : settled

  return (
    <div className="mx-auto max-w-[720px]">
      <h1 className="text-[26px] font-extrabold tracking-tight">Bet slip & My bets</h1>
      <p className="mb-5 text-[14px] text-muted">Your selections and every bet you've placed, in one place.</p>

      <section aria-label="Bet slip" className="mb-8 overflow-hidden rounded-m border border-line bg-page lg:hidden">
        <BetSlip />
      </section>
      <h2 className="mb-3 text-[18px] font-extrabold tracking-tight">My bets</h2>

      <div role="tablist" aria-label="My bets" className="mb-4 inline-flex rounded-m border border-line bg-sunk p-1">
        {(['open', 'settled'] as const).map((t) => (
          <button key={t} role="tab" type="button" aria-selected={tab === t} aria-controls="bets-panel" onClick={() => setTab(t)}
            className={cx('h-11 rounded-s px-4 text-[14px] font-semibold lg:h-9', tab === t ? 'bg-card shadow-raised' : 'text-muted hover:text-ink')}>
            {t === 'open' ? 'Open' : 'Settled'} <span className="tnum ml-1 text-muted">{t === 'open' ? open.length : settled.length}</span>
          </button>
        ))}
      </div>

      <div id="bets-panel" role="tabpanel">
        {list.length === 0 ? (
          <EmptyState
            icon={<Receipt size={18} aria-hidden="true" />}
            title={tab === 'open' ? 'No open bets' : 'No settled bets yet'}
            body={tab === 'open' ? 'Bets you place show up here until they settle.' : 'Won, lost and cashed-out bets show up here.'}
          >
            {tab === 'open' && <Link to="/live" className="inline-flex h-11 items-center rounded-s bg-ink px-4 text-[14px] font-semibold text-white">See live matches</Link>}
          </EmptyState>
        ) : (
          <ul className="space-y-3">{list.map((b) => <BetRow key={b.id} bet={b} />)}</ul>
        )}
      </div>
    </div>
  )
}

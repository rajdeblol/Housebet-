import { useEffect, useState } from 'react'
import { Plus, RotateCcw, Wallet, X } from 'lucide-react'
import { actions, useStore } from '../engine/store'
import { fmtUSDT } from '../lib/format'

const START = 1250

/** Demo wallet: play balance only. No real money, no deposits. */
export function WalletModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const balance = useStore((s) => s.balance)
  const [amount, setAmount] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  const add = (n: number) => {
    if (!Number.isFinite(n) || n <= 0) return setError('Enter an amount above 0.')
    if (n > 10000) return setError('Add up to 10,000 demo USDT at a time.')
    setError('')
    actions.deposit(n)
    setAmount('')
  }

  return (
    <div className="fixed inset-0 z-[75] flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="wallet-title"
        onClick={(e) => e.stopPropagation()}
        className="sheet-up w-full max-w-[400px] overflow-hidden rounded-t-l border border-line bg-card shadow-raised sm:rounded-l"
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-s bg-sunk" aria-hidden="true"><Wallet size={17} /></span>
            <div>
              <h2 id="wallet-title" className="text-[15px] font-extrabold">Demo wallet</h2>
              <p className="text-[12px] text-muted">Play balance for this prototype. Not real money.</p>
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label="Close demo wallet" className="flex h-11 w-11 items-center justify-center rounded-s text-muted hover:bg-sunk hover:text-ink">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-5 p-5">
          <div className="rounded-m border border-line bg-sunk px-4 py-3.5">
            <p className="text-[12px] font-semibold text-muted">Balance</p>
            <p className="tnum text-[28px] font-extrabold leading-tight">
              {fmtUSDT(balance)} <span className="text-[13px] font-bold text-muted">USDT</span>
            </p>
          </div>

          <div>
            <p className="mb-2 text-[13px] font-semibold">Top up demo balance</p>
            <div className="grid grid-cols-4 gap-2">
              {[50, 100, 250, 500].map((n) => (
                <button key={n} type="button" onClick={() => add(n)} className="tnum h-11 rounded-s border border-line bg-card text-[13.5px] font-bold hover:border-ink">
                  +{n}
                </button>
              ))}
            </div>
            <form className="mt-2.5 flex gap-2" onSubmit={(e) => { e.preventDefault(); add(parseFloat(amount)) }}>
              <label htmlFor="wallet-amount" className="sr-only">Custom amount in USDT</label>
              <input
                id="wallet-amount"
                type="number"
                inputMode="decimal"
                min={1}
                value={amount}
                onChange={(e) => { setAmount(e.target.value); setError('') }}
                placeholder="Custom amount"
                aria-invalid={!!error}
                aria-describedby={error ? 'wallet-error' : undefined}
                className="tnum h-11 min-w-0 flex-1 rounded-s border border-line bg-page px-3 text-[15px] font-semibold outline-none focus:border-ink"
              />
              <button type="submit" className="inline-flex h-11 items-center gap-1.5 rounded-s bg-accent px-4 text-[13.5px] font-bold text-white hover:opacity-90">
                <Plus size={15} aria-hidden="true" /> Add
              </button>
            </form>
            {error && <p id="wallet-error" className="mt-1.5 text-[12.5px] font-semibold text-down">{error}</p>}
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-line px-5 py-3">
          <button type="button" onClick={() => actions.resetBalance(START)} className="inline-flex min-h-[44px] items-center gap-1.5 text-[13px] font-semibold text-muted hover:text-ink">
            <RotateCcw size={14} aria-hidden="true" /> Reset to {fmtUSDT(START)}
          </button>
          <button type="button" onClick={onClose} className="h-10 rounded-s border border-line px-4 text-[13px] font-bold hover:border-ink">
            Done
          </button>
        </div>
      </div>
    </div>
  )
}

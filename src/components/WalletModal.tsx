import { useState, useEffect, useRef } from 'react'
import { X, Wallet, Plus, RotateCcw, ShieldCheck, Sparkles } from 'lucide-react'
import { actions, useStore } from '../engine/store'
import { fmtUSDT } from '../lib/format'

interface WalletModalProps {
  open: boolean
  onClose: () => void
}

export function WalletModal({ open, onClose }: WalletModalProps) {
  const balance = useStore((s) => s.balance)
  const [customAmount, setCustomAmount] = useState('')
  const [error, setError] = useState('')
  const modalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  const handleDeposit = (amount: number) => {
    if (isNaN(amount) || amount <= 0) {
      setError('Please enter a valid deposit amount')
      return
    }
    setError('')
    actions.deposit(amount)
    setCustomAmount('')
  }

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const val = parseFloat(customAmount)
    handleDeposit(val)
  }

  return (
    <div
      className="fixed inset-0 z-[75] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
      onClick={onClose}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-label="Housebets Wallet Deposit"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md overflow-hidden rounded-2xl border border-line bg-card shadow-2xl transition-all"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-line px-5 py-4 bg-sunk/30">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#E4372B]/10 text-[#E4372B]">
              <Wallet size={18} />
            </div>
            <div>
              <h2 className="text-base font-black text-ink">Housebets Wallet</h2>
              <p className="text-[11px] font-semibold text-muted">Demo Funds · Wave 2 Live</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close wallet modal"
            className="flex h-8 w-8 items-center justify-center rounded-full text-muted hover:bg-sunk hover:text-ink transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Current Balance Display Card */}
          <div className="relative overflow-hidden rounded-xl border border-[#E4372B]/30 bg-gradient-to-br from-[#E4372B]/10 via-card to-card p-4">
            <div className="flex items-center justify-between text-xs font-bold text-muted">
              <span>AVAILABLE BALANCE</span>
              <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] text-emerald-500">
                <ShieldCheck size={11} /> Verified Instant
              </span>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-black tnum text-ink tracking-tight">
                ${fmtUSDT(balance)}
              </span>
              <span className="text-xs font-bold text-[#E4372B]">USDT</span>
            </div>
            <p className="mt-1 text-[11px] text-muted">
              Ready to stake on any live or pre-match single bets.
            </p>
          </div>

          {/* Quick Deposit Presets */}
          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-muted">
              Quick Top-up Presets
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[100, 250, 500, 1000].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => handleDeposit(amt)}
                  className="group flex flex-col items-center justify-center rounded-xl border border-line bg-sunk/50 py-2.5 transition-all hover:border-[#E4372B] hover:bg-[#E4372B]/10 active:scale-95"
                >
                  <span className="text-xs font-extrabold text-ink group-hover:text-[#E4372B]">
                    +${amt}
                  </span>
                  <span className="text-[10px] text-muted font-medium">USDT</span>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Deposit Input */}
          <form onSubmit={handleCustomSubmit} className="space-y-2">
            <label
              htmlFor="custom-deposit-input"
              className="block text-xs font-bold uppercase tracking-wider text-muted"
            >
              Custom Amount (USDT)
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-muted text-sm">
                  $
                </span>
                <input
                  id="custom-deposit-input"
                  type="number"
                  min="1"
                  step="any"
                  placeholder="e.g. 50"
                  value={customAmount}
                  onChange={(e) => {
                    setCustomAmount(e.target.value)
                    setError('')
                  }}
                  className="w-full rounded-xl border border-line bg-page py-2.5 pl-8 pr-3 text-sm font-bold text-ink placeholder:text-muted/50 focus:border-[#E4372B] focus:outline-hidden"
                />
              </div>
              <button
                type="submit"
                className="flex items-center gap-1.5 rounded-xl bg-[#E4372B] px-4 py-2.5 text-xs font-extrabold text-white shadow-xs transition-transform hover:bg-[#CF3428] active:scale-95"
              >
                <Plus size={14} /> Deposit
              </button>
            </div>
            {error && <p className="text-[11px] font-semibold text-[#E4372B]">{error}</p>}
          </form>

          {/* Wave 2 Contest Promo Callout */}
          <div className="flex items-center gap-3 rounded-xl border border-line bg-sunk/40 p-3 text-xs">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500">
              <Sparkles size={16} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-bold text-ink">Housebets Contest Labs</p>
              <p className="text-[11px] text-muted truncate">
                $15,000 USD prize pool · Wave 2 bonus multiplier active
              </p>
            </div>
          </div>
        </div>

        {/* Footer with Reset button */}
        <div className="flex items-center justify-between border-t border-line bg-sunk/30 px-5 py-3">
          <button
            type="button"
            onClick={() => actions.resetBalance(1250)}
            className="flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-ink transition-colors"
          >
            <RotateCcw size={13} />
            <span>Reset Demo ($1,250)</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-line bg-card px-3 py-1.5 text-xs font-bold text-ink hover:bg-sunk"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  )
}

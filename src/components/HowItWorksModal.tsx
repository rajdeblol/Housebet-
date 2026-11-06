import { useEffect } from 'react'
import { X, CheckCircle, ShieldCheck, Sparkles, Trophy, BookOpen, Layers } from 'lucide-react'

interface HowItWorksModalProps {
  open: boolean
  onClose: () => void
}

export function HowItWorksModal({ open, onClose }: HowItWorksModalProps) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[75] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="How it works"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg overflow-hidden rounded-2xl border border-line bg-card shadow-2xl transition-all"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-line px-5 py-4 bg-sunk/30">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#E4372B]/10 text-[#E4372B]">
              <BookOpen size={18} />
            </div>
            <div>
              <h2 className="text-base font-black text-ink">How This Sportsbook Demo Works</h2>
              <p className="text-[11px] font-semibold text-muted">Housebets Contest Prototype · 5-Page Singles Experience</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="flex h-8 w-8 items-center justify-center rounded-full text-muted hover:bg-sunk hover:text-ink transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto no-scrollbar">
          {/* Compliance Disclaimer Banner */}
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-xs text-ink">
            <div className="flex items-center gap-2 font-bold text-emerald-600">
              <ShieldCheck size={16} />
              <span>Frontend-Only Simulated Prototype</span>
            </div>
            <p className="mt-1 text-[11.5px] text-muted leading-relaxed">
              This interactive prototype is built strictly using fictional sample fixtures, clubs, scores, and demo USDT balance. It contains zero real-money wagering, real payment processing, or live cryptocurrency transactions.
            </p>
          </div>

          {/* 5 Core Feature Pillars */}
          <div className="space-y-3">
            <div className="flex items-start gap-3 rounded-xl border border-line bg-sunk/30 p-3">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#E4372B]/10 text-[#E4372B] mt-0.5">
                <CheckCircle size={15} />
              </div>
              <div className="text-xs">
                <p className="font-extrabold text-ink">1. Strict Singles-Only Wagering</p>
                <p className="text-muted mt-0.5">
                  Adheres to the official Housebets contest rules: no complex accumulators, parlays, or multis. Click any odds button on the left to immediately load a single selection into the bet slip.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-xl border border-line bg-sunk/30 p-3">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500 mt-0.5">
                <Layers size={15} />
              </div>
              <div className="text-xs">
                <p className="font-extrabold text-ink">2. Complete 5 Scored Prototype Pages</p>
                <p className="text-muted mt-0.5">
                  Full navigation across all scored rubric sections: <strong>Sports Home</strong>, <strong>Live In-Play</strong>, <strong>Football Fixtures</strong>, <strong>Match Details & Statistics</strong>, and <strong>My Bets & Slip</strong>.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-xl border border-line bg-sunk/30 p-3">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-sky-500/10 text-sky-500 mt-0.5">
                <Sparkles size={15} />
              </div>
              <div className="text-xs">
                <p className="font-extrabold text-ink">3. Simulated Demo Balance</p>
                <p className="text-muted mt-0.5">
                  Your session includes a demo balance of simulated USDT. Top up play funds anytime via the Demo Balance pill to test stake inputs, return calculations, and simulated demo placements.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-xl border border-line bg-sunk/30 p-3">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-purple-500/10 text-purple-500 mt-0.5">
                <Trophy size={15} />
              </div>
              <div className="text-xs">
                <p className="font-extrabold text-ink">4. Shareable Bet Card & Net Profit</p>
                <p className="text-muted mt-0.5">
                  Placed and cashed-out bets generate an exportable high-res card featuring sport-specific player poses (cricket batsman, striker, dunking basketballer, tennis smash) and clear profit breakdown.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-line bg-sunk/30 px-5 py-3">
          <span className="text-[11px] font-semibold text-muted">
            Housebets Contest Labs · 18+ Play Responsibly
          </span>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-[#E4372B] px-4 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-[#CF3428] active:scale-95 transition-all"
          >
            Explore Prototype
          </button>
        </div>
      </div>
    </div>
  )
}

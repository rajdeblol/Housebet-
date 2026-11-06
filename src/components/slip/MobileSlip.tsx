import { Check, ChevronUp, X } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { actions, getState, itemView, useStore } from '../../engine/store'
import { fmtUSDT } from '../../lib/format'
import { BetSlip } from './BetSlip'

/** Mobile: bottom bar (count + potential return) that opens into a sheet. */
export function MobileSlip() {
  const items = useStore((s) => s.slip.items)
  const status = useStore((s) => s.slip.status)
  const open = useStore((s) => s.sheetOpen)
  useStore((s) => s.markets)
  const sheetRef = useRef<HTMLDivElement>(null)

  const views = items.map((i) => itemView(i, getState()))
  const potential = views.reduce((a, v, idx) => a + (v.stakeNum > 0 ? v.stakeNum * items[idx].accepted : 0), 0)
  const attention = views.some((v) => v.kind !== 'ok')
  const show = items.length > 0 || status === 'placed' || status === 'placing'

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') actions.openSheet(false) }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = '' }
  }, [open])

  // close the sheet if it is resized to desktop
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)')
    const on = () => { if (mq.matches) actions.openSheet(false) }
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])

  return (
    <div className="lg:hidden">
      {show && !open && (
        <div className="fixed inset-x-0 bottom-0 z-40 px-3" style={{ paddingBottom: 'max(10px, env(safe-area-inset-bottom))' }}>
          <button
            type="button"
            onClick={() => actions.openSheet(true, true)}
            className="slide-in flex h-14 w-full items-center gap-3 rounded-m bg-ink px-4 text-left text-white shadow-raised"
            aria-label={status === 'placed' ? 'Bet placed. Open bet slip.' : `Open bet slip, ${items.length} ${items.length === 1 ? 'selection' : 'selections'}, potential return ${fmtUSDT(potential)} USDT`}
          >
            {status === 'placed' ? (
              <><span className="flex h-7 w-7 items-center justify-center rounded-full bg-up"><Check size={16} strokeWidth={3} aria-hidden="true" /></span><span className="font-bold">Bet placed</span><span className="text-[13px] text-white/75">View card</span></>
            ) : (
              <>
                <span className="tnum relative flex h-8 min-w-8 items-center justify-center rounded-full bg-accent px-2 text-[14px] font-extrabold">
                  {items.length}
                  {attention && <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-ink bg-[#E9B949]" aria-hidden="true" />}
                </span>
                <span className="font-bold">Bet slip</span>
                <span className="ml-auto text-right leading-tight">
                  <span className="block text-[10.5px] font-semibold uppercase tracking-wider text-white/70">Potential return</span>
                  <span className="tnum block text-[15px] font-extrabold">{fmtUSDT(potential)} USDT</span>
                </span>
              </>
            )}
            <ChevronUp size={18} className={status === 'placed' ? 'ml-auto' : ''} aria-hidden="true" />
          </button>
        </div>
      )}

      {open && (
        <div className="fixed inset-0 z-[60]">
          <div className="absolute inset-0 bg-ink/40" onClick={() => actions.openSheet(false)} aria-hidden="true" />
          <div ref={sheetRef} role="dialog" aria-modal="true" aria-label="Bet slip" className="sheet-up absolute inset-x-0 bottom-0 flex max-h-[90vh] min-h-[50vh] flex-col overflow-hidden rounded-t-l bg-page">
            <div className="relative flex h-6 items-center justify-center">
              <span className="h-1 w-10 rounded-full bg-line" aria-hidden="true" />
            </div>
            <button type="button" onClick={() => actions.openSheet(false)} aria-label="Close bet slip" className="absolute right-2 top-2 z-10 flex h-11 w-11 items-center justify-center rounded-s hover:bg-sunk">
              <X size={18} aria-hidden="true" />
            </button>
            <div className="min-h-0 flex-1"><BetSlip inSheet /></div>
          </div>
        </div>
      )}
    </div>
  )
}

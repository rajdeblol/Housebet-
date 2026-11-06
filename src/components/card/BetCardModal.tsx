import { X } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { actions, useStore } from '../../engine/store'
import { BetCardPanel } from './BetCardPanel'

export function BetCardModal() {
  const id = useStore((s) => s.cardBetId)
  const bet = useStore((s) => s.bets.find((b) => b.id === id))
  const [params, setParams] = useSearchParams()
  const closeRef = useRef<HTMLButtonElement>(null)

  // shared link: /bets?card=HB-XXXXXX
  useEffect(() => {
    const c = params.get('card')
    if (c) {
      actions.openCard(c)
      params.delete('card')
      setParams(params, { replace: true })
    }
  }, [params, setParams])

  useEffect(() => {
    if (!id) return
    const prev = document.activeElement as HTMLElement | null
    closeRef.current?.focus()
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') actions.openCard(null) }
    document.addEventListener('keydown', onKey)
    return () => { document.removeEventListener('keydown', onKey); prev?.focus?.() }
  }, [id])

  if (!id) return null
  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/60 backdrop-blur-xs p-2 sm:items-center sm:p-4" onClick={() => actions.openCard(null)}>
      <div role="dialog" aria-modal="true" aria-label="Bet card" className="sheet-up max-h-[92vh] w-full max-w-[620px] overflow-y-auto rounded-t-2xl border border-line bg-page p-4 sm:p-5 sm:rounded-2xl shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-3.5 flex items-center justify-between gap-4 border-b border-line/60 pb-3">
          <div>
            <h2 className="text-[17px] font-black text-ink">Housebets Sports Card</h2>
            <p className="text-[11px] font-semibold text-muted">Official Contest Collectible · Export & Share</p>
          </div>
          <button ref={closeRef} type="button" onClick={() => actions.openCard(null)} aria-label="Close bet card" className="flex h-9 w-9 items-center justify-center rounded-full text-muted hover:bg-sunk hover:text-ink transition-colors">
            <X size={18} aria-hidden="true" />
          </button>
        </div>
        {bet ? <BetCardPanel bet={bet} /> : (
          <p className="max-w-xs text-[14px] text-muted">This bet card isn't on this device. Bet cards in this prototype are stored locally in the browser that placed the bet.</p>
        )}
      </div>
    </div>
  )
}

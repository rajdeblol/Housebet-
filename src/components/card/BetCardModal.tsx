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
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-ink/40 sm:items-center" onClick={() => actions.openCard(null)}>
      <div role="dialog" aria-modal="true" aria-label="Bet card" className="sheet-up max-h-[92vh] w-full overflow-y-auto rounded-t-l border border-line bg-page p-5 sm:w-auto sm:rounded-l" onClick={(e) => e.stopPropagation()}>
        <div className="mb-3 flex items-center justify-between gap-6">
          <h2 className="text-[17px] font-extrabold">Bet card</h2>
          <button ref={closeRef} type="button" onClick={() => actions.openCard(null)} aria-label="Close bet card" className="flex h-11 w-11 items-center justify-center rounded-s hover:bg-sunk">
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

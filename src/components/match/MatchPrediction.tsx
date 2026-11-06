import { Check, Lock, Sparkles } from 'lucide-react'
import { useState } from 'react'
import type { Market, Match } from '../../engine/types'
import { fmtOdds } from '../../lib/format'

interface SavedPick { selectionId: string; label: string; odds: number; createdAt: number }
const storageKey = 'hb.match-picks.v1'

function readPicks(): Record<string, SavedPick> {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(storageKey) ?? '{}')
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed as Record<string, SavedPick> : {}
  } catch { return {} }
}

export function MatchPrediction({ match, market }: { match: Match; market?: Market }) {
  const [picks, setPicks] = useState<Record<string, SavedPick>>(readPicks)
  const [selectedId, setSelectedId] = useState('')
  const [locking, setLocking] = useState(false)
  if (!market || !['mr', 'ml'].includes(market.key)) return null
  const saved = picks[match.id]
  const selected = market.selections.find((selection) => selection.id === selectedId)

  const save = () => {
    if (!selected) return
    const next = { ...picks, [match.id]: { selectionId: selected.id, label: selected.label, odds: selected.odds, createdAt: Date.now() } }
    setLocking(true)
    window.setTimeout(() => setLocking(false), 700)
    setPicks(next)
    try { localStorage.setItem(storageKey, JSON.stringify(next)) } catch { /* local demo can continue without persistence */ }
  }
  const clear = () => {
    const next = { ...picks }
    delete next[match.id]
    setPicks(next)
    setSelectedId('')
    try { localStorage.setItem(storageKey, JSON.stringify(next)) } catch { /* ignore */ }
  }

  const winnerIndex = match.score[0] === match.score[1] ? 1 : match.score[0] > match.score[1] ? 0 : market.selections.length - 1
  const isCorrect = market.selections[winnerIndex]?.id === saved?.selectionId

  return (
    <section aria-labelledby="your-pick-title" className="overflow-hidden rounded-[18px] border border-brand/25 bg-card shadow-raised">
      <header className="flex items-center justify-between gap-3 border-b border-line px-4 py-3.5 sm:px-5">
        <div className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand/10 text-brand"><Sparkles size={16} aria-hidden="true" /></span>
          <div><h3 id="your-pick-title" className="text-[15px] font-extrabold">Your pick vs. market</h3><p className="text-[11px] text-muted">Save a demo prediction before kick-off</p></div>
        </div>
        {match.status !== 'upcoming' && <span className="inline-flex items-center gap-1 rounded-full bg-sunk px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-muted"><Lock size={11} /> Locked</span>}
      </header>

      {saved ? (
        <div className={`flex flex-wrap items-center gap-3 p-4 sm:px-5 ${match.status === 'ft' ? 'pick-result-reveal' : 'pick-swipe-in'} ${locking ? 'pick-lock-seal' : ''}`}>
          <div className="min-w-0 flex-1" aria-live="polite">
            <p className="truncate text-[14px] font-extrabold">You picked {saved.label} <span className="tnum text-muted">@ {fmtOdds(saved.odds)}</span></p>
            <p className="mt-0.5 text-[11.5px] text-muted">Saved price implies {((1 / saved.odds) * 100).toFixed(1)}% · simple inverse, not normalized</p>
            {match.status === 'ft' ? (
              <p className={`mt-2 inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[12px] font-bold ${isCorrect ? 'bg-up/10 text-upText' : 'bg-down/10 text-down'}`}><Check size={14} /> {isCorrect ? 'Correct demo pick' : 'Not this time'} · final {match.score[0]}–{match.score[1]}</p>
            ) : match.status === 'live' ? <p className="mt-2 text-[12px] font-semibold text-live">In play · {match.score[0]}–{match.score[1]} · result will be shown at full time</p> : null}
          </div>
          {match.status === 'upcoming' && <><span className={`inline-flex items-center gap-1 rounded-full bg-brand/10 px-2.5 py-1.5 text-[10px] font-bold text-brand ${locking ? 'pick-lock-seal' : ''}`}><Lock size={11} /> Pick locked</span><button type="button" onClick={clear} className="h-10 rounded-lg border border-line px-3 text-[12px] font-semibold text-muted hover:border-ink hover:text-ink">Change pick</button></>}
        </div>
      ) : match.status === 'upcoming' ? (
        <div className="p-4 sm:px-5">
          <div className={`grid gap-2 ${market.selections.length === 3 ? 'grid-cols-3' : 'grid-cols-2'}`}>
            {market.selections.map((selection) => <button key={selection.id} type="button" aria-pressed={selectedId === selection.id} onClick={() => setSelectedId(selection.id)} className={`min-h-12 rounded-lg border px-2 text-center transition-colors ${selectedId === selection.id ? 'pick-card-spring border-brand bg-brand/10 ring-1 ring-brand text-ink' : 'border-line bg-page text-ink hover:border-brand/50'}`}>
              <span className="block truncate text-[11px] text-muted">{selection.label}</span><span className="tnum text-[14px] font-extrabold">{fmtOdds(selection.odds)}</span>
            </button>)}
          </div>
          <button type="button" onClick={save} disabled={!selected} className="mt-3 h-11 w-full rounded-lg bg-ink text-[13px] font-bold text-white transition-transform hover:scale-[1.01] disabled:opacity-45">Lock in demo pick</button>
          <p className="mt-2 text-[10.5px] text-muted">Demo only · saved on this device · compares with the simulated final score</p>
        </div>
      ) : (
        <p className="p-4 text-[12.5px] text-muted sm:px-5">Kick-off has passed. Picks lock before the match starts; no demo pick was saved.</p>
      )}
    </section>
  )
}

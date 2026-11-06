import { useEffect, useMemo } from 'react'
import { useLocation, useParams } from 'react-router-dom'
import { competitions, sportById } from '../data/competitions'
import { MatchRow } from '../components/MatchRow'
import { FollowButton, LiveDot } from '../components/ui'
import { useStore } from '../engine/store'
import type { SportId } from '../engine/types'
import { NotFound } from './NotFound'
import { SportsNav } from './Home'

const intro: Partial<Record<SportId, string>> = {
  football: 'Match result prices for every fixture. Tap a match for all markets.',
  mma: 'Fight winner prices for every bout on the card. Tap a fight for method and rounds.',
  tennis: 'Match winner prices. Tap a match for set and games markets.',
  cricket: 'Match winner prices. Tap a match for innings runs and wickets.',
}

export function SportPage({ sport: fixed }: { sport?: SportId }) {
  const params = useParams()
  const sportId = (fixed ?? params.sportId) as SportId
  const def = sportById[sportId]
  const matches = useStore((s) => s.matches)
  const { hash } = useLocation()
  const comps = competitions.filter((c) => c.sport === sportId)
  const byComp = useMemo(() => {
    const out: Record<string, string[]> = {}
    const order = { live: 0, upcoming: 1, ft: 2 }
    for (const m of Object.values(matches).sort((a, b) => order[a.status] - order[b.status] || a.kickoff - b.kickoff)) (out[m.compId] ??= []).push(m.id)
    return out
  }, [matches])

  useEffect(() => {
    if (!hash) return
    const el = document.getElementById(hash.slice(1))
    if (el) {
      const hdr = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--hdr')) || 65
      window.scrollTo({ top: window.scrollY + el.getBoundingClientRect().top - hdr - 12 })
      el.querySelector<HTMLElement>('h2')?.focus()
    }
  }, [hash, sportId])

  if (!def) return <NotFound />
  const threeWay = sportId === 'football'

  return (
    <div className="mx-auto max-w-[860px]">
      <SportsNav />
      <h1 className="mb-1 text-[26px] font-extrabold tracking-tight">{def.name}</h1>
      <p className="mb-6 text-[14px] text-muted">{intro[sportId] ?? 'Moneyline prices for every game. Tap a game for spreads and totals.'}</p>
      <div className="space-y-7">
        {comps.map((c) => {
          const ids = byComp[c.id] ?? []
          const liveN = ids.filter((id) => matches[id].status === 'live').length
          return (
            <section key={c.id} id={c.id} aria-labelledby={`h-${c.id}`}>
              <div className="mb-2.5 flex items-center justify-between gap-3">
                <div>
                  <h2 id={`h-${c.id}`} tabIndex={-1} className="text-[18px] font-extrabold tracking-tight outline-none">{c.name}</h2>
                  <p className="flex items-center gap-1.5 text-[12.5px] text-muted">
                    {c.region} · {ids.length} {ids.length === 1 ? 'event' : 'events'}
                    {liveN > 0 && <span className="inline-flex items-center gap-1 font-semibold text-live"><LiveDot /> {liveN} live</span>}
                  </p>
                </div>
                <FollowButton kind="comps" id={c.id} label={c.name} size="md" />
              </div>
              <div className="overflow-hidden rounded-m border border-line bg-card">
                <div className="hidden grid-cols-[minmax(0,1fr)_288px] gap-4 border-b border-line bg-sunk/50 px-4 py-1.5 text-[11px] font-bold uppercase tracking-wider text-muted md:grid">
                  <span>{sportId === 'mma' || sportId === 'tennis' ? 'Event · follow with the star' : 'Match · follow teams with the star'}</span>
                  {threeWay
                    ? <span className="grid grid-cols-3 gap-2 text-center"><span>1 Home</span><span>X Draw</span><span>2 Away</span></span>
                    : <span className="grid grid-cols-2 gap-2 text-center"><span>1</span><span>2</span></span>}
                </div>
                <ul>{ids.map((id) => <MatchRow key={id} id={id} followable />)}</ul>
              </div>
            </section>
          )
        })}
      </div>
    </div>
  )
}

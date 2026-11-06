import { useEffect, useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import { competitions } from '../data/competitions'
import { MatchRow } from '../components/MatchRow'
import { FollowButton, LiveDot } from '../components/ui'
import { useStore } from '../engine/store'
import { SportsNav } from './Home'

export function FootballPage() {
  const matches = useStore((s) => s.matches)
  const { hash } = useLocation()
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
  }, [hash])

  return (
    <div className="mx-auto max-w-[860px]">
      <SportsNav />
      <h1 className="mb-1 text-[26px] font-extrabold tracking-tight">Football</h1>
      <p className="mb-6 text-[14px] text-muted">Match result prices for every fixture. Tap a match for all markets.</p>
      <div className="space-y-7">
        {competitions.map((c) => {
          const ids = byComp[c.id] ?? []
          const liveN = ids.filter((id) => matches[id].status === 'live').length
          return (
            <section key={c.id} id={c.id} aria-labelledby={`h-${c.id}`}>
              <div className="mb-2.5 flex items-center justify-between gap-3">
                <div>
                  <h2 id={`h-${c.id}`} tabIndex={-1} className="text-[18px] font-extrabold tracking-tight outline-none">{c.name}</h2>
                  <p className="flex items-center gap-1.5 text-[12.5px] text-muted">
                    {c.region} · {ids.length} {ids.length === 1 ? 'match' : 'matches'}
                    {liveN > 0 && <span className="inline-flex items-center gap-1 font-semibold text-live"><LiveDot /> {liveN} live</span>}
                  </p>
                </div>
                <FollowButton kind="comps" id={c.id} label={c.name} size="md" />
              </div>
              <div className="overflow-hidden rounded-m border border-line bg-card">
                <div className="hidden grid-cols-[minmax(0,1fr)_288px] gap-4 border-b border-line bg-sunk/50 px-4 py-1.5 text-[11px] font-bold uppercase tracking-wider text-muted md:grid">
                  <span>Match · follow teams with the star</span>
                  <span className="grid grid-cols-3 gap-2 text-center"><span>1 Home</span><span>X Draw</span><span>2 Away</span></span>
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

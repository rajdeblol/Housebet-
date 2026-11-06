import { useEffect, useMemo, useState } from 'react'
import { useLocation, useParams } from 'react-router-dom'
import { competitions, sportById } from '../data/competitions'
import { MatchRow } from '../components/MatchRow'
import { FollowButton, LiveDot } from '../components/ui'
import { useStore } from '../engine/store'
import type { SportId } from '../engine/types'
import { NotFound } from './NotFound'
import { SportsNav } from './Home'
import { cx } from '../lib/format'

const intro: Partial<Record<SportId, string>> = {
  football: 'Match result prices for every fixture. Grouped by competition and date. Tap a match for all markets.',
  mma: 'Fight winner prices for every bout on the card. Tap a fight for method and rounds.',
  tennis: 'Match winner prices. Tap a match for set and games markets.',
  cricket: 'Match winner prices. Tap a match for innings runs and wickets.',
  basketball: 'Moneyline and spread prices. Tap a game for totals and quarters.',
}

export function SportPage({ sport: fixed }: { sport?: SportId }) {
  const params = useParams()
  const sportId = (fixed ?? params.sportId) as SportId
  const def = sportById[sportId]
  const matches = useStore((s) => s.matches)
  const { hash } = useLocation()
  const [viewMode, setViewMode] = useState<'games' | 'markets'>('games')

  const comps = competitions.filter((c) => c.sport === sportId)
  const byComp = useMemo(() => {
    const out: Record<string, string[]> = {}
    const order = { live: 0, upcoming: 1, ft: 2 }
    for (const m of Object.values(matches).sort((a, b) => order[a.status] - order[b.status] || a.kickoff - b.kickoff)) {
      (out[m.compId] ??= []).push(m.id)
    }
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

  return (
    <div className="mx-auto max-w-[860px]">
      <SportsNav />

      {/* Header and View Mode Toggle */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-line/60 pb-3">
        <div>
          <h1 className="text-[24px] font-black tracking-tight text-ink">{def.name}</h1>
          <p className="text-xs text-muted mt-0.5">
            {intro[sportId] ?? 'Moneyline prices for every fixture. Tap a match for full market depth.'}
          </p>
        </div>

        {/* View Mode Switcher [Games] [Markets] */}
        <div className="inline-flex rounded-full border border-line bg-card p-0.5 text-xs font-bold">
          <button
            type="button"
            onClick={() => setViewMode('games')}
            className={cx(
              'rounded-full px-3 py-1 transition-all',
              viewMode === 'games' ? 'bg-[#E4372B] text-white shadow-xs' : 'text-muted hover:text-ink',
            )}
          >
            Games
          </button>
          <button
            type="button"
            onClick={() => setViewMode('markets')}
            className={cx(
              'rounded-full px-3 py-1 transition-all',
              viewMode === 'markets' ? 'bg-[#E4372B] text-white shadow-xs' : 'text-muted hover:text-ink',
            )}
          >
            Markets
          </button>
        </div>
      </div>

      {/* Fixtures Grouped by Competition & Date */}
      <div className="space-y-6">
        {comps.map((c) => {
          const ids = byComp[c.id] ?? []
          if (ids.length === 0) return null
          const liveN = ids.filter((id) => matches[id].status === 'live').length

          return (
            <section key={c.id} id={c.id} aria-labelledby={`h-${c.id}`}>
              <div className="mb-2.5 flex items-center justify-between gap-3">
                <div>
                  <h2 id={`h-${c.id}`} tabIndex={-1} className="text-[17px] font-black tracking-tight outline-none">
                    {c.name}
                  </h2>
                  <p className="flex items-center gap-1.5 text-xs text-muted">
                    {c.region} · {ids.length} {ids.length === 1 ? 'fixture' : 'fixtures'}
                    {liveN > 0 && (
                      <span className="inline-flex items-center gap-1 font-extrabold text-live">
                        <LiveDot /> {liveN} live
                      </span>
                    )}
                  </p>
                </div>
                <FollowButton kind="comps" id={c.id} label={c.name} size="md" />
              </div>

              <div className="space-y-2.5">
                {ids.map((id) => (
                  <MatchRow key={id} id={id} followable />
                ))}
              </div>
            </section>
          )
        })}
      </div>
    </div>
  )
}

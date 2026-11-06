import { Clock, Radio, RefreshCw } from 'lucide-react'
import { useMemo, useState } from 'react'
import { compById, competitions, sportById, sports } from '../data/competitions'
import { MatchRow } from '../components/MatchRow'
import { EmptyState, LiveDot, SectionHeader } from '../components/ui'
import { useStore } from '../engine/store'
import { cx } from '../lib/format'

export function LivePage() {
  const matches = useStore((s) => s.matches)
  const [sport, setSport] = useState<string>('all')
  const [comp, setComp] = useState<string>('all')

  const all = useMemo(() => Object.values(matches), [matches])
  const live = all.filter((m) => m.status === 'live')
  const inSport = (m: { sport: string }) => sport === 'all' || m.sport === sport
  const shown = live
    .filter((m) => inSport(m) && (comp === 'all' || m.compId === comp))
    .sort((a, b) => sports.findIndex((x) => x.id === a.sport) - sports.findIndex((x) => x.id === b.sport))

  const soon = all
    .filter((m) => m.status === 'upcoming' && inSport(m) && (comp === 'all' || m.compId === comp))
    .sort((a, b) => a.kickoff - b.kickoff)
    .slice(0, 4)

  const compList = competitions.filter((c) => sport === 'all' || c.sport === sport)
  const label = comp !== 'all' ? compById[comp]?.name : sport !== 'all' ? sportById[sport as keyof typeof sportById]?.name : ''

  const chip = (active: boolean) =>
    cx(
      'flex h-9 shrink-0 items-center gap-1.5 rounded-full border px-3 text-xs font-bold transition-all',
      active ? 'border-ink bg-ink text-white' : 'border-line bg-card text-ink hover:border-ink',
    )

  return (
    <div className="mx-auto max-w-[860px]">
      {/* Header Row with Simulated Live Timestamp */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-line/60 pb-3">
        <div className="flex items-center gap-2.5">
          <h1 className="flex items-center gap-2 text-[24px] font-black tracking-tight text-ink">
            <LiveDot className="h-3 w-3" /> Live In-Play
          </h1>
          <span className="tnum rounded-full bg-[#E4372B]/10 px-2.5 py-0.5 text-xs font-extrabold text-[#E4372B]">
            {live.length} active
          </span>
        </div>

        {/* Simulated Update Timestamp */}
        <div className="flex items-center gap-2 text-xs font-semibold text-muted">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-card px-2.5 py-1">
            <RefreshCw size={11} className="animate-spin text-emerald-500" style={{ animationDuration: '4s' }} />
            <span>Simulated live feed · Updated just now</span>
          </span>
        </div>
      </div>

      {/* Sport Filter Chips */}
      <div className="mb-3">
        <p className="mb-1.5 text-[10.5px] font-bold uppercase tracking-wider text-muted">Sport</p>
        <div className="no-scrollbar -mx-4 flex gap-1.5 overflow-x-auto px-4" role="group" aria-label="Filter by sport">
          <button
            type="button"
            aria-pressed={sport === 'all'}
            onClick={() => { setSport('all'); setComp('all') }}
            className={chip(sport === 'all')}
          >
            All sports <span className="tnum opacity-75">({live.length})</span>
          </button>
          {sports.map((sp) => {
            const n = live.filter((m) => m.sport === sp.id).length
            return (
              <button
                key={sp.id}
                type="button"
                aria-pressed={sport === sp.id}
                onClick={() => { setSport(sp.id); setComp('all') }}
                className={chip(sport === sp.id)}
              >
                {sp.name} <span className="tnum opacity-75">({n})</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Competition Filter Chips */}
      <div className="mb-5">
        <p className="mb-1.5 text-[10.5px] font-bold uppercase tracking-wider text-muted">Competition</p>
        <div className="no-scrollbar -mx-4 flex gap-1.5 overflow-x-auto px-4" role="group" aria-label="Filter by competition">
          <button
            type="button"
            aria-pressed={comp === 'all'}
            onClick={() => setComp('all')}
            className={chip(comp === 'all')}
          >
            All <span className="tnum opacity-75">({live.filter(inSport).length})</span>
          </button>
          {compList.map((c) => {
            const n = live.filter((m) => m.compId === c.id).length
            return (
              <button
                key={c.id}
                type="button"
                aria-pressed={comp === c.id}
                onClick={() => setComp(c.id)}
                className={chip(comp === c.id)}
              >
                {c.name} <span className="tnum opacity-75">({n})</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Fixtures List or Polished Empty State */}
      {shown.length > 0 ? (
        <ul className="space-y-2.5" aria-label="Live matches">
          {shown.map((m) => (
            <MatchRow key={m.id} id={m.id} showComp={compById[m.compId]?.short} />
          ))}
        </ul>
      ) : (
        <div className="space-y-6">
          <EmptyState
            icon={<Radio size={20} className="text-[#E4372B]" aria-hidden="true" />}
            title={label ? `No live matches in ${label} right now` : 'No live fixtures in play right now'}
            body="Simulated matches appear here the moment they kick off. Check the upcoming schedule below to prepare your single selections."
          />

          {soon.length > 0 && (
            <section aria-labelledby="soon-live-h">
              <SectionHeader
                title={<span id="soon-live-h" className="font-extrabold text-sm">Starting next in schedule</span>}
                icon={<Clock size={15} aria-hidden="true" />}
              />
              <ul className="space-y-2.5 mt-2">
                {soon.map((m) => (
                  <MatchRow key={m.id} id={m.id} showComp={compById[m.compId]?.short} />
                ))}
              </ul>
            </section>
          )}
        </div>
      )}
    </div>
  )
}

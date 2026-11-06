import { Clock, Radio } from 'lucide-react'
import { useMemo, useState } from 'react'
import { compById, competitions, sports } from '../data/competitions'
import { MatchRow } from '../components/MatchRow'
import { EmptyState, LiveDot, SectionHeader } from '../components/ui'
import { useStore } from '../engine/store'
import { cx } from '../lib/format'

export function LivePage() {
  const matches = useStore((s) => s.matches)
  const [comp, setComp] = useState<string>('all')
  const all = useMemo(() => Object.values(matches), [matches])
  const live = all.filter((m) => m.status === 'live')
  const shown = live.filter((m) => comp === 'all' || m.compId === comp).sort((a, b) => b.clockSec - a.clockSec)
  const soon = all.filter((m) => m.status === 'upcoming' && (comp === 'all' || m.compId === comp)).sort((a, b) => a.kickoff - b.kickoff).slice(0, 4)

  const chip = (active: boolean) => cx('flex h-11 shrink-0 items-center gap-2 rounded-full border px-4 text-[14px] font-semibold lg:h-9', active ? 'border-ink bg-ink text-white' : 'border-line bg-card hover:border-ink')

  return (
    <div className="mx-auto max-w-[860px]">
      <div className="mb-5 flex items-center gap-3">
        <h1 className="flex items-center gap-2.5 text-[26px] font-extrabold tracking-tight"><LiveDot className="h-2.5 w-2.5" /> Live</h1>
        <span className="tnum rounded-full bg-sunk px-2.5 py-0.5 text-[13px] font-bold">{live.length} in play</span>
      </div>

      <div className="mb-3">
        <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-muted">Sport</p>
        <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4" role="group" aria-label="Filter by sport">
          {sports.map((s) => s.enabled ? (
            <button key={s.id} type="button" aria-pressed="true" className={chip(true)}>{s.name} <span className="tnum text-white/75">{live.length}</span></button>
          ) : (
            <button key={s.id} type="button" disabled aria-label={`${s.name}, coming soon`} className="flex h-11 shrink-0 cursor-not-allowed items-center gap-2 rounded-full border border-line px-4 text-[14px] text-muted lg:h-9">{s.name} <span className="text-[11px] font-semibold">Coming soon</span></button>
          ))}
        </div>
      </div>
      <div className="mb-6">
        <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-muted">Competition</p>
        <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4" role="group" aria-label="Filter by competition">
          <button type="button" aria-pressed={comp === 'all'} onClick={() => setComp('all')} className={chip(comp === 'all')}>All <span className="tnum opacity-70">{live.length}</span></button>
          {competitions.map((c) => {
            const n = live.filter((m) => m.compId === c.id).length
            return (
              <button key={c.id} type="button" aria-pressed={comp === c.id} onClick={() => setComp(c.id)} className={chip(comp === c.id)}>
                {c.name} <span className="tnum opacity-70">{n}</span>
              </button>
            )
          })}
        </div>
      </div>

      {shown.length ? (
        <ul className="overflow-hidden rounded-m border border-line bg-card" aria-label="Live matches">
          {shown.map((m) => <MatchRow key={m.id} id={m.id} showComp={compById[m.compId].short} />)}
        </ul>
      ) : (
        <>
          <EmptyState
            icon={<Radio size={18} aria-hidden="true" />}
            title={comp === 'all' ? 'Nothing is live right now' : `Nothing live in ${compById[comp].name} right now`}
            body="Live matches appear here the moment they kick off. Here's what starts next."
          />
          {soon.length > 0 && (
            <section className="mt-6" aria-labelledby="soon-live-h">
              <SectionHeader title={<span id="soon-live-h">Starting soon</span>} icon={<Clock size={17} aria-hidden="true" />} />
              <ul className="overflow-hidden rounded-m border border-line bg-card">
                {soon.map((m) => <MatchRow key={m.id} id={m.id} showComp={compById[m.compId].short} />)}
              </ul>
            </section>
          )}
        </>
      )}
    </div>
  )
}

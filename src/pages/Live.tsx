import { Clock, Radio } from 'lucide-react'
import { useMemo, useState } from 'react'
import { compById, competitions, sportById, sports } from '../data/competitions'
import { MatchRow } from '../components/MatchRow'
import { EmptyState, Freshness, LiveDot, SectionHeader } from '../components/ui'
import { useStore } from '../engine/store'
import { cx } from '../lib/format'

export function LivePage() {
  const matches = useStore((s) => s.matches)
  const [sport, setSport] = useState<string>('all')
  const [comp, setComp] = useState<string>('all')
  const all = useMemo(() => Object.values(matches), [matches])
  const live = all.filter((m) => m.status === 'live')
  const inSport = (m: { sport: string }) => sport === 'all' || m.sport === sport
  const shown = live.filter((m) => inSport(m) && (comp === 'all' || m.compId === comp))
    .sort((a, b) => sports.findIndex((x) => x.id === a.sport) - sports.findIndex((x) => x.id === b.sport))
  const soon = all.filter((m) => m.status === 'upcoming' && inSport(m) && (comp === 'all' || m.compId === comp)).sort((a, b) => a.kickoff - b.kickoff).slice(0, 4)
  const compList = competitions.filter((c) => sport === 'all' || c.sport === sport)
  const label = comp !== 'all' ? compById[comp].name : sport !== 'all' ? sportById[sport as keyof typeof sportById].name : ''

  const chip = (active: boolean) => cx('flex h-11 shrink-0 items-center gap-2 rounded-full border px-4 text-[14px] font-semibold lg:h-9', active ? 'border-accent bg-accent text-page' : 'border-line bg-card hover:border-ink')

  return (
    <div className="mx-auto max-w-[860px]">
      <div className="mb-5 flex items-center gap-3">
        <h1 className="flex items-center gap-2.5 text-[26px] font-extrabold tracking-tight"><LiveDot className="h-2.5 w-2.5" /> Live</h1>
        <span className="tnum rounded-full bg-sunk px-2.5 py-0.5 text-[13px] font-bold">{live.length} in play</span>
      </div>
      <p className="mb-4"><Freshness /></p>

      <div className="mb-3">
        <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-muted">Sport</p>
        <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4" role="group" aria-label="Filter by sport">
          <button type="button" aria-pressed={sport === 'all'} onClick={() => { setSport('all'); setComp('all') }} className={chip(sport === 'all')}>All sports <span className="tnum opacity-70">{live.length}</span></button>
          {sports.map((sp) => {
            const n = live.filter((m) => m.sport === sp.id).length
            return (
              <button key={sp.id} type="button" aria-pressed={sport === sp.id} onClick={() => { setSport(sp.id); setComp('all') }} className={chip(sport === sp.id)}>
                {sp.name} <span className="tnum opacity-70">{n}</span>
              </button>
            )
          })}
        </div>
      </div>
      <div className="mb-6">
        <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-muted">Competition</p>
        <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4" role="group" aria-label="Filter by competition">
          <button type="button" aria-pressed={comp === 'all'} onClick={() => setComp('all')} className={chip(comp === 'all')}>All <span className="tnum opacity-70">{live.filter(inSport).length}</span></button>
          {compList.map((c) => {
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
            title={label ? `Nothing live in ${label} right now` : 'Nothing is live right now'}
            body="Live matches appear here the moment they kick off. Here's what starts next."
          />
          <section className="mt-6" aria-labelledby="soon-live-h">
            <SectionHeader title={<span id="soon-live-h">Starting soon</span>} icon={<Clock size={17} aria-hidden="true" />} />
            {soon.length > 0 ? (
              <ul className="overflow-hidden rounded-m border border-line bg-card">
                {soon.map((m) => <MatchRow key={m.id} id={m.id} showComp={compById[m.compId].short} />)}
              </ul>
            ) : (
              <EmptyState
                icon={<Clock size={18} aria-hidden="true" />}
                title="No upcoming matches for these filters"
                body="Try another sport or competition to see what starts next."
              />
            )}
          </section>
        </>
      )}
    </div>
  )
}

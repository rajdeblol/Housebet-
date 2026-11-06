import { ArrowRight, Bot, Flame, Gift, Search, Sparkles, Trophy } from 'lucide-react'
import { useMemo, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { compById, sportById } from '../data/competitions'
import { teams } from '../data/teams'
import { useStore } from '../engine/store'
import type { Match, Market } from '../engine/types'
import { cx } from '../lib/format'
import { Crest } from '../components/ui'

type FeatureTab = 'multi' | 'builder' | 'specials' | 'assist'
type DemoPick = { id: string; matchId?: string; marketId?: string; group?: string; label: string; market: string; comp: string; odds: number; special?: boolean }

const futures: DemoPick[] = [
  { id: 'future-ucl-arsenal', label: 'Arsenal', market: 'Champions League winner', comp: 'Outright', odds: 5.5, special: true },
  { id: 'future-ucl-madrid', label: 'Real Madrid', market: 'Champions League winner', comp: 'Outright', odds: 6.2, special: true },
  { id: 'future-ucl-city', label: 'Manchester City', market: 'Champions League winner', comp: 'Outright', odds: 7.0, special: true },
  { id: 'special-harred', label: 'Both teams to score · Yes', market: 'Arsenal v Chelsea special', comp: 'Special', odds: 1.72, matchId: 'har-red', special: true },
]

function tile(active: boolean) {
  return cx('inline-flex h-10 shrink-0 items-center gap-2 rounded-full border px-4 text-[13px] font-bold transition-colors', active ? 'border-accent bg-accent text-page' : 'border-line bg-card text-ink hover:border-ink')
}

function outcomesFor(matches: Record<string, Match>, marketIds: Record<string, string[]>, markets: Record<string, Market>): DemoPick[] {
  const rows: DemoPick[] = []
  for (const match of Object.values(matches).filter((item) => item.status !== 'ft')) {
    for (const marketId of marketIds[match.id] ?? []) {
      const market = markets[marketId]
      if (!market || market.closed || market.suspendedUntil) continue
      for (const selection of market.selections) {
        if (selection.closed) continue
        rows.push({
          id: selection.id, matchId: match.id, marketId: market.id, group: market.group,
          label: selection.label, market: market.name,
          comp: compById[match.compId]?.short ?? sportById[match.sport].name,
          odds: selection.odds,
        })
      }
    }
  }
  return rows
}

function FeatureTile({ pick, selected, onToggle, teamsByMatch }: { pick: DemoPick; selected: boolean; onToggle: () => void; teamsByMatch?: Match }) {
  const home = teamsByMatch ? teams[teamsByMatch.home] : undefined
  const away = teamsByMatch ? teams[teamsByMatch.away] : undefined
  return (
    <button type="button" aria-pressed={selected} onClick={onToggle} className={cx('min-w-0 w-full rounded-xl border p-3 text-left transition-all hover:-translate-y-0.5', selected ? 'border-accent bg-accent/10 ring-1 ring-accent/30' : 'border-line bg-card hover:border-ink')}>
      <span className="flex min-w-0 items-center justify-between gap-2 text-[10px] font-extrabold uppercase tracking-wider text-muted"><span className="min-w-0 truncate">{pick.comp} · {pick.market}</span><span className="tnum shrink-0 text-brand">{pick.odds.toFixed(2)}</span></span>
      {teamsByMatch ? <span className="mt-2 flex min-w-0 items-center gap-2 text-[12.5px] font-bold"><Crest id={teamsByMatch.home} size={21} /><span className="min-w-0 truncate">{home?.name}</span><span className="shrink-0 text-muted">v</span><span className="min-w-0 truncate">{away?.name}</span><Crest id={teamsByMatch.away} size={21} /><span className="ml-auto min-w-0 truncate text-brand">{pick.label}</span></span> : <span className="mt-2 block truncate text-[14px] font-extrabold">{pick.label}</span>}
    </button>
  )
}

export function AdvancedPage() {
  const matches = useStore((s) => s.matches)
  const markets = useStore((s) => s.markets)
  const marketIds = useStore((s) => s.marketIds)
  const [tab, setTab] = useState<FeatureTab>('multi')
  const [selected, setSelected] = useState<string[]>([])
  const [stake, setStake] = useState('10')
  const [boost, setBoost] = useState(true)
  const [freeBet, setFreeBet] = useState(false)
  const [query, setQuery] = useState('')
  const [confirmed, setConfirmed] = useState(false)

  const available = useMemo(() => outcomesFor(matches, marketIds, markets), [matches, marketIds, markets])
  const chosen = selected.map((id) => [...available, ...futures].find((pick) => pick.id === id)).filter(Boolean) as DemoPick[]
  const queryWords = query.toLowerCase().split(/\s+/).filter((word) => word.length > 1 && !['show', 'find', 'me', 'please', 'to', 'for', 'on', 'what', 'who', 'is', 'the', 'a'].includes(word))
  const searchResults = available.filter((pick) => {
    const match = pick.matchId ? matches[pick.matchId] : undefined
    const searchable = `${pick.label} ${pick.market} ${pick.comp} ${compById[match?.compId ?? '']?.name ?? ''} ${match ? `${sportById[match.sport].name} ${teams[match.home].name} ${teams[match.away].name} ${match.status}` : ''} win winner`.toLowerCase()
    return queryWords.length === 0 || queryWords.every((word) => searchable.includes(word))
  }).slice(0, 8)
  const multiOdds = chosen.reduce((total, pick) => total * pick.odds, 1)
  const stakeValue = Math.max(0, Number(stake) || 0)
  const boostFactor = boost && chosen.length >= 2 ? 1.1 : 1
  const potential = freeBet ? stakeValue * Math.max(0, multiOdds * boostFactor - 1) : stakeValue * multiOdds * boostFactor
  const sameEvent = chosen.length > 1 && chosen.every((pick) => pick.matchId && pick.matchId === chosen[0].matchId) && new Set(chosen.map((pick) => pick.marketId)).size === chosen.length
  const toggle = (pick: DemoPick) => {
    setConfirmed(false)
    setSelected((current) => {
      if (current.includes(pick.id)) return current.filter((id) => id !== pick.id)
      if (tab === 'multi' && pick.matchId) {
        const withoutSameEvent = current.filter((id) => {
          const existing = [...available, ...futures].find((item) => item.id === id)
          return existing?.matchId !== pick.matchId
        })
        return [...withoutSameEvent, pick.id]
      }
      return [...current, pick.id]
    })
  }

  const tabs: { id: FeatureTab; label: string; icon: ReactNode }[] = [
    { id: 'multi', label: 'Accumulators', icon: <Flame size={15} /> },
    { id: 'builder', label: 'Bet builder', icon: <Sparkles size={15} /> },
    { id: 'specials', label: 'Outrights & specials', icon: <Trophy size={15} /> },
    { id: 'assist', label: 'AI search', icon: <Bot size={15} /> },
  ]

  const focusPicks = tab === 'builder'
    ? available.filter((pick) => pick.matchId === (chosen.find((p) => p.matchId)?.matchId ?? available[0]?.matchId))
    : available.filter((pick) => pick.group === 'popular').slice(0, 18)

  return (
    <div className="mx-auto min-w-0 max-w-[940px]">
      <div className="mb-5 rounded-[22px] border border-[#24434E] bg-[radial-gradient(ellipse_at_85%_0%,rgba(0,214,218,.16),transparent_42%),linear-gradient(135deg,#0C1825,#10152B_65%,#122332)] p-5 text-white sm:p-7">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#02F7FD]/25 bg-[#02F7FD]/10 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[.15em] text-[#02F7FD]"><Sparkles size={13} /> Housebets play lab</div>
        <h1 className="text-[30px] font-black tracking-tight sm:text-[38px]">More ways to read the game.</h1>
        <p className="mt-2 max-w-[650px] text-[13.5px] leading-relaxed text-white/65">Try accumulators, same-game builders, futures and smart search with simulated demo prices. No real money is used.</p>
      </div>

      <nav aria-label="Advanced features" className="no-scrollbar mb-5 flex gap-2 overflow-x-auto">
        {tabs.map((item) => <button key={item.id} type="button" onClick={() => { setTab(item.id); setSelected([]); setConfirmed(false) }} aria-pressed={tab === item.id} className={tile(tab === item.id)}>{item.icon}{item.label}</button>)}
      </nav>

      {tab === 'assist' ? (
        <section className="rounded-2xl border border-line bg-card p-4 sm:p-6" aria-labelledby="ai-title">
          <div className="mb-4 flex items-start gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#A78BFA]/15 text-[#A78BFA]"><Bot size={20} /></span><div><h2 id="ai-title" className="text-[19px] font-extrabold">AI match finder</h2><p className="text-[12.5px] text-muted">Describe a match or market in plain language. Search runs against this prototype’s demo fixture list.</p></div></div>
          <label htmlFor="ai-query" className="sr-only">Describe a fixture, team, competition, or market</label>
          <div className="flex h-12 items-center gap-2 rounded-xl border border-line bg-page px-3 focus-within:border-accent"><Search size={17} className="text-muted" /><input id="ai-query" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Try ‘live Premier League’ or ‘Arsenal to win’" className="h-full min-w-0 flex-1 bg-transparent text-[14px] outline-none placeholder:text-muted" /></div>
          <p className="my-3 flex items-center gap-1.5 text-[10.5px] text-muted"><Sparkles size={13} className="text-[#A78BFA]" /> Smart demo search · results use local fixture data</p>
          <ul className="space-y-2">{searchResults.map((pick) => {
            const match = pick.matchId ? matches[pick.matchId] : undefined
            return <li key={pick.id}><Link to={match ? `/match/${match.id}` : '/live'} className="block rounded-xl border border-line bg-card p-3 transition-colors hover:border-accent"><span className="flex items-center justify-between gap-2 text-[10px] font-extrabold uppercase tracking-wider text-muted"><span>{pick.comp} · {pick.market}</span><span className="tnum text-brand">{pick.odds.toFixed(2)}</span></span><span className="mt-2 flex items-center gap-2 text-[12.5px] font-bold">{match && <><Crest id={match.home} size={21} /><span className="truncate">{teams[match.home].name}</span><span className="text-muted">v</span><span className="truncate">{teams[match.away].name}</span><Crest id={match.away} size={21} /></>}<span className="ml-auto truncate text-brand">{pick.label}</span></span></Link></li>
          })}</ul>
          {query && searchResults.length === 0 && <p className="rounded-xl bg-sunk p-4 text-[13px] text-muted">No matching demo markets. Try a team, sport, competition or market type.</p>}
        </section>
      ) : tab === 'specials' ? (
        <section className="grid gap-4 lg:grid-cols-[1.2fr_.8fr]">
          <div className="rounded-2xl border border-line bg-card p-4 sm:p-5"><div className="mb-4 flex items-center gap-2"><Trophy size={17} className="text-[#F5B950]" /><h2 className="text-[17px] font-extrabold">Season outrights</h2></div><p className="mb-3 text-[12px] text-muted">Demo long-range markets · simulated prices</p><ul className="space-y-2">{futures.filter((pick) => pick.comp === 'Outright').map((pick) => <li key={pick.id}><FeatureTile pick={pick} selected={selected.includes(pick.id)} onToggle={() => toggle(pick)} /></li>)}</ul></div>
          <div className="space-y-4">
            <div className="rounded-2xl border border-line bg-card p-4 sm:p-5"><div className="mb-4 flex items-center gap-2"><Gift size={17} className="text-[#F472B6]" /><h2 className="text-[17px] font-extrabold">Match specials</h2></div><p className="mb-3 text-[12px] text-muted">Popular prop-style demo picks</p><FeatureTile pick={futures[3]} selected={selected.includes(futures[3].id)} onToggle={() => toggle(futures[3])} teamsByMatch={matches['har-red']} /><div className="mt-3 rounded-xl bg-sunk p-3 text-[11.5px] leading-relaxed text-muted">Housebets specials are fixed sample scenarios for the prototype. They don’t update from external sports data.</div></div>
            <div className="rounded-2xl border border-line bg-card p-4">
              <h2 className="mb-3 text-[16px] font-extrabold">Demo special ticket</h2>
              {chosen.map((pick) => <p key={pick.id} className="mb-2 flex items-center justify-between gap-2 text-[12px]"><span className="truncate font-semibold">{pick.market} · {pick.label}</span><span className="tnum font-extrabold text-brand">{pick.odds.toFixed(2)}</span></p>)}
              {!chosen.length && <p className="mb-3 text-[12px] text-muted">Choose an outright or special to see its return.</p>}
              <label className="mb-3 block text-[11px] font-bold uppercase tracking-wide text-muted">Stake <span className="text-ink">USDT</span><input type="number" min="1" max="500" step="0.01" value={stake} onChange={(event) => setStake(event.target.value)} className="mt-1 h-11 w-full rounded-lg border border-line bg-page px-3 text-[15px] font-bold text-ink" /></label>
              <div className="mb-3 flex justify-between text-[13px]"><span className="text-muted">Potential return</span><span className="tnum font-extrabold text-upText">{potential.toFixed(2)} USDT</span></div>
              {confirmed && <p role="status" className="mb-3 rounded-lg bg-up/10 p-3 text-[12px] font-semibold text-upText">Demo special ticket ready · no real money used.</p>}
              <button type="button" disabled={!chosen.length || stakeValue < 1} onClick={() => setConfirmed(true)} className="h-11 w-full rounded-lg bg-accent text-[13px] font-extrabold text-page disabled:cursor-not-allowed disabled:opacity-40">Review demo special</button>
            </div>
          </div>
        </section>
      ) : (
        <div className="grid min-w-0 grid-cols-1 items-start gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
          <section className="min-w-0 rounded-2xl border border-line bg-card p-4 sm:p-5" aria-labelledby="picks-title">
            <div className="mb-1 flex items-center justify-between gap-2"><h2 id="picks-title" className="text-[18px] font-extrabold">{tab === 'builder' ? 'Build a same-game multi' : 'Choose your legs'}</h2><span className="rounded-full bg-sunk px-2.5 py-1 text-[10px] font-bold uppercase text-muted">{tab === 'builder' ? 'One match' : 'Multiple matches'}</span></div>
            <p className="mb-4 text-[12.5px] text-muted">{tab === 'builder' ? 'Combine different markets from one event. Select a match outcome and another market for that same match.' : 'Pick outcomes from different events to build one accumulator.'}</p>
            <ul className="space-y-2">{focusPicks.map((pick) => <li key={pick.id}><FeatureTile pick={pick} selected={selected.includes(pick.id)} onToggle={() => toggle(pick)} teamsByMatch={matches[pick.matchId!]} /></li>)}</ul>
            {tab === 'builder' && focusPicks.length === 0 && <p className="rounded-xl bg-sunk p-4 text-[13px] text-muted">No compatible markets are available for this match.</p>}
          </section>

          <aside className="space-y-3 lg:sticky lg:top-24">
            <section className="rounded-2xl border border-line bg-card p-4" aria-label="Demo promo options">
              <h2 className="mb-3 flex items-center gap-2 text-[16px] font-extrabold"><Gift size={17} className="text-[#F472B6]" /> Demo offers</h2>
              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-line bg-page p-3"><input type="checkbox" checked={boost} onChange={(event) => setBoost(event.target.checked)} className="mt-1 accent-cyan-400" /><span><span className="block text-[13px] font-bold">10% multi boost</span><span className="block text-[11px] text-muted">Demo promo · applies to 2+ legs</span></span><span className="ml-auto text-[12px] font-extrabold text-upText">+10%</span></label>
              <label className="mt-2 flex cursor-pointer items-start gap-3 rounded-xl border border-line bg-page p-3"><input type="checkbox" checked={freeBet} onChange={(event) => setFreeBet(event.target.checked)} className="mt-1 accent-cyan-400" /><span><span className="block text-[13px] font-bold">Free demo pick</span><span className="block text-[11px] text-muted">Potential return excludes the stake</span></span><Gift size={16} className="ml-auto text-[#F472B6]" /></label>
            </section>
            <section className="rounded-2xl border border-line bg-card p-4">
              <h2 className="mb-3 text-[16px] font-extrabold">Demo ticket</h2>
              {chosen.length ? <ul className="mb-3 space-y-2">{chosen.map((pick) => <li key={pick.id} className="flex items-start justify-between gap-2 border-b border-line pb-2 text-[12px]"><span className="min-w-0"><span className="block truncate font-bold">{pick.label}</span><span className="block truncate text-muted">{pick.comp} · {pick.market}</span></span><span className="tnum font-extrabold text-brand">{pick.odds.toFixed(2)}</span></li>)}</ul> : <p className="mb-3 rounded-xl bg-sunk p-3 text-[12px] text-muted">Select at least one outcome to start.</p>}
              <label className="mb-3 block text-[11px] font-bold uppercase tracking-wide text-muted">Stake <span className="text-ink">USDT</span><input type="number" min="1" max="500" step="0.01" value={stake} onChange={(event) => setStake(event.target.value)} className="mt-1 h-11 w-full rounded-lg border border-line bg-page px-3 text-[15px] font-bold text-ink" /></label>
              <div className="mb-3 flex justify-between border-t border-line pt-3 text-[13px]"><span className="text-muted">{chosen.length > 1 ? 'Combined odds' : 'Price'}</span><span className="tnum font-extrabold">{chosen.length ? `${multiOdds.toFixed(2)}${boostFactor > 1 ? ' × 1.10' : ''}` : '—'}</span></div>
              <div className="mb-3 flex justify-between text-[13px]"><span className="text-muted">Potential return</span><span className="tnum font-extrabold text-upText">{potential.toFixed(2)} USDT</span></div>
              {tab === 'builder' && chosen.length > 0 && !sameEvent && <p className="mb-3 rounded-lg bg-warnBg p-2.5 text-[11px] text-warn">Choose at least two different markets from the same match.</p>}
              {confirmed ? <p role="status" className="mb-3 rounded-lg bg-up/10 p-3 text-[12px] font-semibold text-upText">Demo ticket ready · no real money used.</p> : null}
              <button type="button" disabled={chosen.length === 0 || (tab === 'builder' && !sameEvent) || stakeValue < 1} onClick={() => setConfirmed(true)} className="h-11 w-full rounded-lg bg-accent text-[13px] font-extrabold text-page disabled:cursor-not-allowed disabled:opacity-40">Review demo {tab === 'builder' ? 'builder' : 'accumulator'}</button>
              <Link to="/bets" className="mt-3 flex items-center justify-center gap-1 text-[12px] font-semibold text-muted hover:text-ink">Open regular bet slip <ArrowRight size={13} /></Link>
            </section>
          </aside>
        </div>
      )}

      <p className="mt-5 text-center text-[11px] text-muted">Everything in this lab is a front-end demo. Prices, offers, futures, search suggestions and ticket outcomes are simulated.</p>
    </div>
  )
}

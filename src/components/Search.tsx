import { Search as SearchIcon, Shield, Trophy, ListFilter, User, X } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { competitions, sportById, sportPath } from '../data/competitions'
import { teams } from '../data/teams'
import { getState, useStore } from '../engine/store'
import type { GroupId, SportId } from '../engine/types'
import { cx } from '../lib/format'
import { Crest } from './ui'

const marketWords: { words: string[]; name: string; group: GroupId; sport: SportId }[] = [
  { words: ['corner', 'corners'], name: 'Total corners', group: 'corners', sport: 'football' },
  { words: ['card', 'cards', 'booking', 'bookings'], name: 'Total cards', group: 'corners', sport: 'football' },
  { words: ['goalscorer', 'scorer', 'anytime'], name: 'Anytime goalscorer', group: 'scorers', sport: 'football' },
  { words: ['handicap'], name: 'Handicaps', group: 'handicaps', sport: 'football' },
  { words: ['both teams', 'btts'], name: 'Both teams to score', group: 'popular', sport: 'football' },
  { words: ['total goals', 'over', 'under', 'goals'], name: 'Total goals', group: 'goals', sport: 'football' },
  { words: ['half', '1st half', 'first half', 'halves'], name: '1st half markets', group: 'halves', sport: 'football' },
  { words: ['result', '1x2'], name: 'Match result', group: 'popular', sport: 'football' },
  { words: ['moneyline', 'spread', 'points'], name: 'Moneyline & point spread', group: 'popular', sport: 'basketball' },
  { words: ['touchdown', 'nfl'], name: 'NFL point spread & totals', group: 'popular', sport: 'americanfootball' },
  { words: ['run line', 'runs', 'innings'], name: 'Run line & total runs', group: 'popular', sport: 'baseball' },
  { words: ['puck line'], name: 'Puck line', group: 'popular', sport: 'icehockey' },
  { words: ['wicket', 'wickets', 'sixes'], name: 'Runs & wickets', group: 'lines', sport: 'cricket' },
  { words: ['method', 'ko', 'submission', 'rounds'], name: 'Method of victory', group: 'props', sport: 'mma' },
  { words: ['set', 'sets', 'games'], name: 'Set & games', group: 'lines', sport: 'tennis' },
]

interface Result { key: string; kind: 'team' | 'player' | 'comp' | 'market'; title: string; sub: string; to: string; icon: JSX.Element }

/** Prefer a live match, else the next to start. */
function bestMatchFor(filter: (home: string, away: string) => boolean, sport?: SportId) {
  const ms = Object.values(getState().matches).filter((m) => m.status !== 'ft' && (!sport || m.sport === sport) && filter(m.home, m.away))
  ms.sort((a, b) => (a.status === 'live' ? 0 : 1) - (b.status === 'live' ? 0 : 1) || a.kickoff - b.kickoff)
  return ms[0]
}

export function Search({ autoFocus, onDone }: { autoFocus?: boolean; onDone?: () => void }) {
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const nav = useNavigate()
  const inputRef = useRef<HTMLInputElement>(null)
  const boxRef = useRef<HTMLDivElement>(null)
  useStore((s) => s.matches) // refresh live labels

  useEffect(() => { if (autoFocus) inputRef.current?.focus() }, [autoFocus])
  useEffect(() => {
    const onDoc = (e: MouseEvent) => { if (!boxRef.current?.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [])

  const results = useMemo<Result[]>(() => {
    const term = q.trim().toLowerCase()
    if (term.length < 2) return []
    const out: Result[] = []
    for (const t of Object.values(teams)) {
      if (!t.name.toLowerCase().includes(term) && t.short.toLowerCase() !== term) continue
      const m = bestMatchFor((h, a) => h === t.id || a === t.id)
      if (!m) continue
      const opp = teams[m.home === t.id ? m.away : m.home].name
      out.push({ key: 't' + t.id, kind: m.sport === 'mma' || m.sport === 'tennis' ? 'player' : 'team', title: t.name, sub: `${sportById[m.sport].name} · ${m.status === 'live' ? 'Live now' : 'Next'} vs ${opp}`, to: `/match/${m.id}`, icon: <Crest id={t.id} size={18} /> })
    }
    for (const t of Object.values(teams)) {
      for (const p of t.players) {
        if (!p.toLowerCase().includes(term) || out.length > 10) continue
        const m = bestMatchFor((h, a) => h === t.id || a === t.id)
        if (!m) continue
        const football = m.sport === 'football'
        out.push({ key: 'p' + p, kind: 'player', title: p, sub: `${t.name}${football ? ' · Anytime goalscorer' : ''}`, to: `/match/${m.id}${football ? '?group=scorers' : ''}`, icon: <User size={16} aria-hidden="true" /> })
      }
    }
    for (const c of competitions) {
      if (!c.name.toLowerCase().includes(term)) continue
      out.push({ key: 'c' + c.id, kind: 'comp', title: c.name, sub: `${sportById[c.sport].name} · ${c.region}`, to: `${sportPath(c.sport)}#${c.id}`, icon: <Trophy size={16} aria-hidden="true" /> })
    }
    for (const mw of marketWords) {
      if (!mw.words.some((w) => w.startsWith(term) || term.startsWith(w) || term.includes(w))) continue
      const m = bestMatchFor(() => true, mw.sport)
      if (!m) continue
      out.push({ key: 'm' + mw.name, kind: 'market', title: mw.name, sub: `Open in ${teams[m.home].name} v ${teams[m.away].name}`, to: `/match/${m.id}?group=${mw.group}`, icon: <ListFilter size={16} aria-hidden="true" /> })
      if (out.filter((r) => r.kind === 'market').length >= 3) break
    }
    return out.slice(0, 8)
  }, [q])

  const go = (r: Result) => {
    nav(r.to)
    setQ(''); setOpen(false); onDone?.()
  }

  return (
    <div ref={boxRef} className="relative w-full">
      <label htmlFor="global-search" className="sr-only">Search teams, players, competitions and markets</label>
      <div className="flex h-11 items-center gap-2 rounded-m border border-line bg-card px-3 focus-within:border-ink lg:h-10">
        <SearchIcon size={16} className="text-muted" aria-hidden="true" />
        <input
          ref={inputRef}
          id="global-search"
          type="search"
          autoComplete="off"
          placeholder="Search teams, players, markets"
          value={q}
          onChange={(e) => { setQ(e.target.value); setOpen(true); setActive(0) }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => Math.min(results.length - 1, a + 1)) }
            if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => Math.max(0, a - 1)) }
            if (e.key === 'Enter' && results[active]) go(results[active])
            if (e.key === 'Escape') { setOpen(false); onDone?.() }
          }}
          role="combobox"
          aria-expanded={open && results.length > 0}
          aria-controls="search-results"
          aria-activedescendant={results[active] ? `sr-${results[active].key}` : undefined}
          className="h-full min-w-0 flex-1 bg-transparent text-[15px] outline-none placeholder:text-muted"
        />
        {q && (
          <button type="button" onClick={() => setQ('')} aria-label="Clear search" className="-mr-1 flex h-8 w-8 items-center justify-center rounded-s text-muted hover:text-ink">
            <X size={16} aria-hidden="true" />
          </button>
        )}
      </div>
      {open && q.trim().length >= 2 && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-m border border-line bg-card shadow-raised">
          {results.length === 0 ? (
            <p className="px-4 py-4 text-[14px] text-muted">No matches for “{q}”. Try a team, a player, a competition, or a market like corners or cards.</p>
          ) : (
            <ul id="search-results" role="listbox" aria-label="Search results">
              {results.map((r, i) => (
                <li key={r.key} id={`sr-${r.key}`} role="option" aria-selected={i === active}>
                  <button
                    type="button"
                    onMouseEnter={() => setActive(i)}
                    onClick={() => go(r)}
                    className={cx('flex min-h-[48px] w-full items-center gap-3 px-4 py-2 text-left', i === active && 'bg-sunk')}
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-s border border-line bg-card text-ink">{r.icon}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[14px] font-semibold">{r.title}</span>
                      <span className="block truncate text-[12.5px] text-muted">{r.sub}</span>
                    </span>
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-muted">
                      {r.kind === 'team' ? 'Team' : r.kind === 'player' ? 'Player' : r.kind === 'comp' ? 'Competition' : 'Market'}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
          <p className="flex items-center gap-1.5 border-t border-line px-4 py-2 text-[12px] text-muted"><Shield size={12} aria-hidden="true" /> Real team identities · fictional player names · demo fixtures and odds.</p>
        </div>
      )}
    </div>
  )
}

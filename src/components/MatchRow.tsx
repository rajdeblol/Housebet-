import { ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { teams } from '../data/teams'
import { actions, useStore } from '../engine/store'
import { cx, fmtOdds, kickoffLabel } from '../lib/format'
import { mainKey, scoreText, statusShort } from '../lib/sport'
import { Crest, LiveDot } from './ui'

/** One Probly-styled fixture card with stacked odds and probability progress bar. */
export function MatchRow({ id, showComp }: { id: string; followable?: boolean; showComp?: string }) {
  const m = useStore((s) => s.matches[id])
  const now = useStore((s) => s.now)
  const main = useStore((s) => s.markets[`${id}:${mainKey(m)}`])
  const slipItems = useStore((s) => s.slip.items)

  if (!m || !main) return null

  const live = m.status === 'live'
  const H = teams[m.home], A = teams[m.away]
  const score = m.status === 'upcoming' ? null : scoreText(m)
  const tags = main.selections.length === 3 ? [H.short || '1', 'DRAW', A.short || '2'] : [H.short || '1', A.short || '2']

  // Implied probability calculation for bottom progress bar
  const oddsVals = main.selections.map((s) => s.odds || 2.0)
  const invs = oddsVals.map((o) => 1 / o)
  const sumInv = invs.reduce((a, b) => a + b, 0)
  const probs = invs.map((inv) => (inv / sumInv) * 100)

  // Fictional record generator for unstarted matches
  const hash = m.id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  const recH = `${(hash % 9) + 1}-${(hash % 5)}-${((hash * 2) % 6)}`
  const recA = `${((hash + 3) % 8) + 1}-${((hash + 2) % 4)}-${((hash * 3) % 7)}`

  return (
    <li className="mb-3.5 list-none">
      <div className="rounded-2xl border border-line bg-card p-4 shadow-xs transition-all hover:border-line/80 hover:shadow-sm">
        {/* Top Header Row (Time, Volume, Title, Game View) */}
        <div className="mb-3 flex items-center justify-between gap-3 text-xs">
          <div className="flex min-w-0 items-center gap-2 truncate">
            {live ? (
              <span className="inline-flex shrink-0 items-center gap-1.5 rounded-md bg-live/10 px-2 py-0.5 font-bold text-live">
                <LiveDot /> <span className="tnum">{statusShort(m)}</span>
              </span>
            ) : (
              <span className="rounded-md bg-sunk px-2 py-0.5 font-semibold text-muted">
                {kickoffLabel(m.kickoff, now)}
              </span>
            )}
            <span className="truncate text-muted">
              $12.5K Vol. · {H.name} vs. {A.name} {showComp ? `(${showComp})` : ''}
            </span>
          </div>

          <Link
            to={`/match/${m.id}`}
            className="inline-flex shrink-0 items-center gap-1 rounded-full border border-line bg-card px-3 py-1 font-semibold text-ink transition-colors hover:bg-sunk hover:border-ink/40"
          >
            <span>Game View</span>
            <ChevronRight size={13} aria-hidden="true" />
          </Link>
        </div>

        {/* Middle Content Row: Teams on Left, Stacked Odds Buttons on Right */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-[minmax(0,1fr)_170px] sm:items-center">
          {/* Left Column: Teams, Crests, Records/Scores */}
          <Link to={`/match/${m.id}`} className="group flex flex-col justify-center gap-2.5">
            {/* Team 1 (Home) */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 truncate">
                <Crest id={H.id} size={24} />
                <span className="truncate text-[15px] font-bold group-hover:underline">
                  {H.name}
                </span>
                <span className="text-xs font-medium text-muted">
                  {score ? '' : recH}
                </span>
              </div>
              {score && (
                <span className="tnum text-right text-[16px] font-black">{score[0]}</span>
              )}
            </div>

            {/* Team 2 (Away) */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 truncate">
                <Crest id={A.id} size={24} />
                <span className="truncate text-[15px] font-bold group-hover:underline">
                  {A.name}
                </span>
                <span className="text-xs font-medium text-muted">
                  {score ? '' : recA}
                </span>
              </div>
              {score && (
                <span className="tnum text-right text-[16px] font-black">{score[1]}</span>
              )}
            </div>
          </Link>

          {/* Right Column: Stacked Probly-style Odds Buttons */}
          <div className="flex flex-col gap-1.5">
            {tags.map((tag, i) => {
              const selId = `${m.id}:${mainKey(m)}:${i}`
              const isSelected = slipItems.some((item) => item.selId === selId)
              const selObj = main.selections[i]
              const suspended = !!main.suspendedUntil
              const closed = main.closed || selObj?.closed

              return (
                <button
                  key={tag}
                  type="button"
                  disabled={suspended || closed}
                  onClick={() => actions.toggleSelection(selId)}
                  className={cx(
                    'flex h-8.5 w-full items-center justify-between rounded-lg px-3 text-xs font-bold transition-all',
                    isSelected
                      ? 'bg-[#E4372B] text-white shadow-xs'
                      : 'border border-line bg-sunk/60 text-ink hover:border-ink hover:bg-sunk',
                    (suspended || closed) && 'cursor-not-allowed opacity-50',
                  )}
                  aria-pressed={isSelected}
                >
                  <span className={cx('truncate', isSelected ? 'text-white' : 'text-ink/80')}>
                    {tag}
                  </span>
                  <span className="tnum font-extrabold tracking-tight">
                    {closed ? '—' : suspended ? 'LOCK' : `${fmtOdds(selObj?.odds || 1.95)}x`}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Bottom Implied Probability Bar (Probly signature visual bar) */}
        <div className="mt-3.5 flex h-1 w-full overflow-hidden rounded-full bg-sunk/60">
          <div
            style={{ width: `${probs[0]}%`, backgroundColor: H.primary || '#1E40AF' }}
            className="h-full transition-all duration-300"
            title={`${H.name}: ${Math.round(probs[0])}%`}
          />
          {tags.length === 3 && (
            <div
              style={{ width: `${probs[1]}%`, backgroundColor: '#9CA3AF' }}
              className="h-full transition-all duration-300"
              title={`Draw: ${Math.round(probs[1])}%`}
            />
          )}
          <div
            style={{
              width: `${probs[tags.length === 3 ? 2 : 1]}%`,
              backgroundColor: A.primary || '#DC2626',
            }}
            className="h-full transition-all duration-300"
            title={`${A.name}: ${Math.round(probs[tags.length === 3 ? 2 : 1])}%`}
          />
        </div>
      </div>
    </li>
  )
}

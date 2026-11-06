import { ChevronRight, Lock } from 'lucide-react'
import { Link } from 'react-router-dom'
import { compById } from '../data/competitions'
import { teams } from '../data/teams'
import { useStore } from '../engine/store'
import { cx, kickoffLabel } from '../lib/format'
import { mainKey, scoreText, statusShort } from '../lib/sport'
import type { Match } from '../engine/types'
import { OddsButton } from './OddsButton'
import { Crest, FollowButton, LiveDot } from './ui'

function Status({ m, now }: { m: Match; now: number }) {
  if (m.status === 'live')
    return (
      <span className="inline-flex shrink-0 items-center gap-1.5 rounded-s bg-live/10 px-2 py-0.5 font-bold text-live">
        <LiveDot /> <span className="sr-only">Live,</span><span className="tnum">{statusShort(m)}</span>
      </span>
    )
  return (
    <span className="shrink-0 rounded-s bg-sunk px-2 py-0.5 font-semibold text-muted">
      {m.status === 'ft' ? 'Full time' : kickoffLabel(m.kickoff, now)}
    </span>
  )
}

/**
 * One fixture with its match-result prices.
 * - default: a card (Home, Live)
 * - followable: a compact table row with follow stars (sport / Football pages)
 * Every price uses the shared OddsButton so selected, moving, suspended and
 * closed states look the same everywhere.
 */
export function MatchRow({ id, showComp, followable }: { id: string; followable?: boolean; showComp?: string }) {
  const m = useStore((s) => s.matches[id])
  const now = useStore((s) => s.now)
  const main = useStore((s) => (m ? s.markets[`${id}:${mainKey(m)}`] : undefined))

  if (!m || !main) return null

  const H = teams[m.home], A = teams[m.away]
  const score = m.status === 'upcoming' ? null : scoreText(m)
  const threeWay = main.selections.length === 3
  const tags = threeWay ? ['1', 'X', '2'] : [H.short || '1', A.short || '2']
  const comp = showComp ?? compById[m.compId]?.short
  const suspended = !!main.suspendedUntil && !main.closed

  const odds = (
    <div className={cx('grid gap-1.5', threeWay ? 'grid-cols-3' : 'grid-cols-2')} role="group" aria-label={`Match result, ${H.name} v ${A.name}`}>
      {tags.map((tag, i) => (
        <OddsButton key={i} selId={`${m.id}:${mainKey(m)}:${i}`} tag={tag} />
      ))}
    </div>
  )

  const suspendedNote = suspended && (
    <p role="status" className="mt-2 flex items-center gap-1.5 text-[12.5px] font-semibold text-warn">
      <Lock size={13} aria-hidden="true" /> Suspended. Prices return in a few seconds.
    </p>
  )

  if (followable) {
    return (
      <li className="list-none border-b border-line px-3.5 py-3 last:border-b-0 sm:px-4">
        <div className="grid grid-cols-1 gap-2.5 md:grid-cols-[minmax(0,1fr)_288px] md:items-center md:gap-4">
          <div className="min-w-0">
            <div className="mb-1.5 flex items-center gap-2 text-[12.5px]">
              <Status m={m} now={now} />
              <Link to={`/match/${m.id}`} className="ml-auto inline-flex min-h-[28px] items-center gap-0.5 rounded-s px-1.5 font-semibold text-ink hover:bg-sunk md:ml-0">
                All markets <ChevronRight size={14} aria-hidden="true" />
              </Link>
            </div>
            {[H, A].map((t, i) => (
              <div key={t.id} className="flex items-center gap-2 py-0.5">
                <FollowButton kind="teams" id={t.id} label={t.name} />
                <Crest id={t.id} size={20} />
                <Link to={`/match/${m.id}`} className="min-w-0 flex-1 truncate text-[14.5px] font-semibold hover:underline">{t.name}</Link>
                {score && <span className="tnum text-[15px] font-extrabold">{score[i]}</span>}
              </div>
            ))}
          </div>
          <div>
            {odds}
            {suspendedNote}
          </div>
        </div>
      </li>
    )
  }

  return (
    <li className="mb-3 list-none">
      <article aria-label={`${H.name} v ${A.name}`} className="rounded-m border border-line bg-card p-3.5 shadow-raised sm:p-4">
        <div className="mb-3 flex items-center justify-between gap-3 text-[12.5px]">
          <div className="flex min-w-0 items-center gap-2">
            <Status m={m} now={now} />
            {comp && <span className="truncate font-semibold text-muted">{comp}</span>}
          </div>
          <Link
            to={`/match/${m.id}`}
            className="inline-flex min-h-[32px] shrink-0 items-center gap-0.5 rounded-s px-2 font-semibold text-ink hover:bg-sunk"
            aria-label={`All markets for ${H.name} v ${A.name}`}
          >
            All markets <ChevronRight size={14} aria-hidden="true" />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_300px] sm:items-center">
          <Link to={`/match/${m.id}`} className="group flex min-w-0 flex-col gap-2">
            {[H, A].map((t, i) => (
              <div key={t.id} className="flex items-center justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2.5">
                  <Crest id={t.id} size={24} />
                  <span className="truncate text-[15px] font-bold group-hover:underline">{t.name}</span>
                </div>
                {score && <span className="tnum text-[16px] font-extrabold">{score[i]}</span>}
              </div>
            ))}
          </Link>
          <div>
            {odds}
            {suspendedNote}
          </div>
        </div>
      </article>
    </li>
  )
}

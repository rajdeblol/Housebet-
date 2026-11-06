import { ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { teams } from '../data/teams'
import { useStore } from '../engine/store'
import { clockLabel, cx, kickoffLabel } from '../lib/format'
import { OddsButton } from './OddsButton'
import { Crest, FollowButton, LiveDot } from './ui'

/** One fixture: status, teams (+ live score), 1 / X / 2 prices. */
export function MatchRow({ id, followable = false, showComp }: { id: string; followable?: boolean; showComp?: string }) {
  const m = useStore((s) => s.matches[id])
  const now = useStore((s) => s.now)
  const count = useStore((s) => s.marketIds[id].length)
  const live = m.status === 'live'
  const H = teams[m.home], A = teams[m.away]

  return (
    <li className="border-b border-line last:border-b-0">
      <div className="grid grid-cols-1 gap-3 px-4 py-3 md:grid-cols-[minmax(0,1fr)_288px] md:items-center md:gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="w-[62px] shrink-0 text-[12.5px] leading-tight">
            {live ? (
              <span className="inline-flex items-center gap-1.5 font-bold text-live"><LiveDot /> <span className="tnum">{clockLabel(m)}</span></span>
            ) : m.status === 'ft' ? (
              <span className="font-semibold text-muted">FT</span>
            ) : (
              <span className="font-semibold">{kickoffLabel(m.kickoff, now)}</span>
            )}
            {showComp && <span className="mt-0.5 block truncate text-[11.5px] text-muted">{showComp}</span>}
          </div>
          <Link to={`/match/${m.id}`} className="group min-w-0 flex-1 rounded-s" aria-label={m.status === 'upcoming' ? `${H.name} v ${A.name}, open match` : `${H.name} ${m.score[0]}, ${A.name} ${m.score[1]}, open match`}>
            {[H, A].map((t, i) => (
              <span key={t.id} className={cx('flex items-center gap-2', followable ? 'h-11 lg:h-8' : 'h-7')}>
                <Crest id={t.id} size={16} />
                <span className="min-w-0 flex-1 truncate text-[15px] font-semibold group-hover:underline">{t.name}</span>
                {m.status !== 'upcoming' && <span className="tnum w-5 text-right text-[17px] font-extrabold">{m.score[i]}</span>}
              </span>
            ))}
          </Link>
          {followable && (
            <div className="flex flex-col">
              <FollowButton kind="teams" id={H.id} label={H.name} />
              <FollowButton kind="teams" id={A.id} label={A.name} />
            </div>
          )}
          <Link to={`/match/${m.id}`} className="hidden h-11 shrink-0 items-center gap-0.5 rounded-s px-1.5 text-[12.5px] font-semibold text-muted hover:text-ink sm:flex" aria-label={`All ${count} markets for ${H.name} v ${A.name}`}>
            <span className="tnum">+{count}</span><ChevronRight size={14} aria-hidden="true" />
          </Link>
        </div>
        <div className={cx('grid grid-cols-3 gap-2')}>
          {['1', 'X', '2'].map((tag, i) => (
            <OddsButton key={tag} selId={`${m.id}:mr:${i}`} tag={tag} className="w-full" />
          ))}
        </div>
      </div>
    </li>
  )
}

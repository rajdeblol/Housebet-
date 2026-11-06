import { CircleDot, Flag, Square } from 'lucide-react'
import type { Match } from '../../engine/types'
import { teams } from '../../data/teams'

const eventMeta = {
  goal: { Icon: CircleDot, label: 'Goal', style: 'bg-up/10 text-upText' },
  yellow: { Icon: Square, label: 'Yellow card', style: 'bg-warnBg text-warn' },
  red: { Icon: Square, label: 'Red card', style: 'bg-down/10 text-down' },
} as const

/** Compact, simulated football moments sourced from the match state. */
export function MatchTimeline({ match }: { match: Match }) {
  if (match.sport !== 'football') return null

  const events = [...match.events].sort((a, b) => a.minute - b.minute)
  const currentMinute = Math.min(90, Math.floor(match.clockSec / 60) + 1)

  return (
    <section aria-labelledby="match-timeline-title" className="overflow-hidden rounded-[18px] border border-line bg-card shadow-raised">
      <header className="flex items-center justify-between gap-3 border-b border-line px-4 py-3.5 sm:px-5">
        <div>
          <h3 id="match-timeline-title" className="text-[16px] font-extrabold tracking-tight">Match timeline</h3>
          <p className="mt-0.5 text-[11.5px] text-muted">Key moments · simulated</p>
        </div>
        {match.status === 'live' && <span className="inline-flex items-center gap-1.5 rounded-full bg-live/10 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-live"><span className="live-dot h-1.5 w-1.5 rounded-full bg-live" /> {currentMinute}&apos;</span>}
      </header>

      {events.length ? (
        <ol className="divide-y divide-line">
          {events.map((event, index) => {
            const meta = eventMeta[event.type]
            const { Icon } = meta
            const team = teams[event.side ? match.away : match.home]
            return (
              <li key={`${event.minute}-${event.type}-${event.player}-${index}`} className="flex min-h-12 items-center gap-3 px-4 py-2.5 sm:px-5">
                <time className="tnum w-10 shrink-0 text-[12px] font-extrabold text-muted">{event.minute}&apos;</time>
                <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full ${meta.style}`}>
                  <Icon size={15} fill={event.type === 'goal' ? 'currentColor' : 'none'} aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] font-bold">{meta.label}{event.type !== 'goal' ? ` · ${event.player}` : ''}</span>
                  <span className="block truncate text-[11.5px] text-muted">{team.name}{event.type === 'goal' ? ` · ${event.player}` : ''}</span>
                </span>
                {event.type === 'goal' && <Flag size={14} className="shrink-0 text-brand" aria-label="Goal" />}
              </li>
            )
          })}
        </ol>
      ) : (
        <p className="px-4 py-5 text-[13px] text-muted sm:px-5">{match.status === 'upcoming' ? 'The timeline starts when the match kicks off.' : 'No key moments yet.'}</p>
      )}
    </section>
  )
}

import type { CSSProperties } from 'react'
import type { Match } from '../../engine/types'
import { teams } from '../../data/teams'
import { Crest, LiveDot } from '../ui'

const ballStages = [
  { x: 10, y: 52, label: 'Building from the back' },
  { x: 28, y: 37, label: 'Moving through midfield' },
  { x: 51, y: 64, label: 'Switching the play' },
  { x: 74, y: 42, label: 'Driving forward' },
  { x: 88, y: 53, label: 'Entering the final third' },
]

/** Ambient, explicitly simulated visualisation of live football momentum. */
export function MiniMatchCast({ match }: { match: Match }) {
  if (match.sport !== 'football' || match.status !== 'live') return null

  const stage = ballStages[Math.floor((match.clockSec % 20) / 4)]
  const homeAttack = Math.floor(match.clockSec / 20) % 2 === 0
  const x = homeAttack ? stage.x : 100 - stage.x
  const y = stage.y
  const home = teams[match.home]
  const away = teams[match.away]
  const recentGoal = match.goal && Date.now() - match.goal.at < 5500 ? match.goal.side : null
  const goalName = recentGoal === null ? '' : teams[recentGoal === 0 ? match.home : match.away]?.short ?? ''
  const style = { '--cast-x': `${x}%`, '--cast-y': `${y}%` } as CSSProperties

  return (
    <section aria-labelledby="match-cast-title" className="overflow-hidden rounded-[18px] border border-line bg-card shadow-raised">
      <header className="flex items-center justify-between gap-3 border-b border-line px-4 py-3 sm:px-5">
        <div>
          <h3 id="match-cast-title" className="text-[15px] font-extrabold tracking-tight">Mini Match Cast</h3>
          <p className="mt-0.5 text-[11px] text-muted">Illustrative movement · simulated</p>
        </div>
        {recentGoal !== null ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/10 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-accent"><span className="cast-goal-dot h-1.5 w-1.5 rounded-full bg-accent" /> Goal · {goalName}</span>
        ) : (
          <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-live"><LiveDot className="h-1.5 w-1.5" /> {homeAttack ? home.short : away.short} building</span>
        )}
      </header>

      <div className="p-3 sm:p-4">
        <div className={`mini-cast-pitch relative aspect-[2.5/1] overflow-hidden rounded-xl border border-white/15 ${recentGoal !== null ? 'mini-cast-goal' : ''}`}>
          <div className="pointer-events-none absolute inset-y-0 left-1/2 border-l border-dashed border-white/25" />
          <div className="pointer-events-none absolute left-1/2 top-1/2 h-[36%] aspect-square -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/25" />
          <div className="pointer-events-none absolute left-[3%] top-[10%] h-[80%] w-[10%] border border-white/25" />
          <div className="pointer-events-none absolute right-[3%] top-[10%] h-[80%] w-[10%] border border-white/25" />
          <div className={`cast-goalbox pointer-events-none absolute inset-y-[35%] left-0 w-[3px] ${recentGoal === 1 ? 'cast-goalbox-active' : ''}`} />
          <div className={`cast-goalbox pointer-events-none absolute inset-y-[35%] right-0 w-[3px] ${recentGoal === 0 ? 'cast-goalbox-active' : ''}`} />
          <div className="cast-ball absolute left-0 top-0 z-10 grid h-5 w-5 place-items-center rounded-full bg-white shadow-[0_0_16px_rgba(255,255,255,.7)]" style={style} aria-hidden="true">
            <span className="h-2 w-2 rounded-full bg-ink" />
          </div>
          <span className="absolute bottom-1.5 left-2 text-[8px] font-black uppercase tracking-widest text-white/75">{home.short}</span>
          <span className="absolute bottom-1.5 right-2 text-[8px] font-black uppercase tracking-widest text-white/75">{away.short}</span>
          {recentGoal !== null && <div className="cast-goal-wash pointer-events-none absolute inset-0" aria-hidden="true" />}
        </div>
        <div className="mt-2 flex items-center justify-between gap-3">
          <p className="min-w-0 truncate text-[11px] font-semibold text-muted">{recentGoal !== null ? `${goalName} scores · ${match.score[0]}–${match.score[1]}` : stage.label}</p>
          <div className="flex shrink-0 items-center gap-2 text-[10px] font-bold text-muted"><span className="flex items-center gap-1"><Crest id={match.home} size={15} /> {home.short}</span><span>v</span><span className="flex items-center gap-1">{away.short} <Crest id={match.away} size={15} /></span></div>
        </div>
      </div>
    </section>
  )
}

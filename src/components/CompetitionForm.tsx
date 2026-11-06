import { Crest } from './ui'
import type { Match } from '../engine/types'
import { teams } from '../data/teams'

function outcome(match: Match, teamId: string): 'W' | 'D' | 'L' {
  if (match.score[0] === match.score[1]) return 'D'
  const teamWon = match.home === teamId ? match.score[0] > match.score[1] : match.score[1] > match.score[0]
  return teamWon ? 'W' : 'L'
}

export function CompetitionForm({ competitionId, matches }: { competitionId: string; matches: Record<string, Match> }) {
  const fixtures = Object.values(matches).filter((match) => match.compId === competitionId)
  if (!fixtures.length) return null
  const teamIds = Array.from(new Set(fixtures.flatMap((match) => [match.home, match.away])))
  const rows = teamIds.map((teamId) => {
    const played = fixtures.filter((match) => match.status !== 'upcoming' && (match.home === teamId || match.away === teamId)).sort((a, b) => a.kickoff - b.kickoff)
    const w = played.filter((match) => outcome(match, teamId) === 'W').length
    const d = played.filter((match) => outcome(match, teamId) === 'D').length
    const l = played.filter((match) => outcome(match, teamId) === 'L').length
    const goalsFor = played.reduce((sum, match) => sum + match.score[match.home === teamId ? 0 : 1], 0)
    const goalsAgainst = played.reduce((sum, match) => sum + match.score[match.home === teamId ? 1 : 0], 0)
    return { teamId, played, w, d, l, goalsFor, goalsAgainst, points: 3 * w + d }
  }).sort((a, b) => b.points - a.points || (b.goalsFor - b.goalsAgainst) - (a.goalsFor - a.goalsAgainst) || a.teamId.localeCompare(b.teamId))

  return (
    <details className="mt-2 overflow-hidden rounded-m border border-line bg-card">
      <summary className="flex min-h-11 cursor-pointer items-center justify-between gap-3 px-3 text-[12.5px] font-bold hover:bg-sunk/50">
        <span>Form snapshot <span className="ml-1 font-medium text-muted">{rows.length} sample teams</span></span>
        <span className="text-[10.5px] font-semibold text-muted">Demo fixtures only</span>
      </summary>
      <div className="border-t border-line">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[440px] text-left text-[11.5px]">
            <thead className="bg-sunk/50 text-[10px] uppercase tracking-wider text-muted"><tr><th className="px-3 py-2">Team</th><th className="px-2 py-2">Form</th><th className="px-2 py-2 text-center">P</th><th className="px-2 py-2 text-center">W-D-L</th><th className="px-2 py-2 text-center">GD</th><th className="px-3 py-2 text-right">Pts</th></tr></thead>
            <tbody className="divide-y divide-line">
              {rows.map((row) => <tr key={row.teamId}>
                <th scope="row" className="px-3 py-2 font-semibold"><span className="flex items-center gap-2"><Crest id={row.teamId} size={20} /><span className="truncate">{teams[row.teamId]?.short ?? teams[row.teamId]?.name ?? row.teamId}</span></span></th>
                <td className="px-2 py-2"><span className="flex gap-1">{row.played.slice(-5).map((match, i) => { const result = outcome(match, row.teamId); return <span key={`${match.id}-${i}`} title={`${result} · ${match.score.join('–')}`} className={`grid h-5 w-5 place-items-center rounded-full text-[9px] font-black ${result === 'W' ? 'bg-up/15 text-upText' : result === 'D' ? 'bg-sunk text-muted' : 'bg-down/10 text-down'}`}>{result}</span> })}{!row.played.length && <span className="text-muted">—</span>}</span></td>
                <td className="px-2 py-2 text-center tabular-nums">{row.played.length}</td><td className="px-2 py-2 text-center tabular-nums">{row.w}-{row.d}-{row.l}</td>
                <td className="px-2 py-2 text-center tabular-nums">{row.goalsFor - row.goalsAgainst > 0 ? '+' : ''}{row.goalsFor - row.goalsAgainst}</td><td className="px-3 py-2 text-right font-extrabold tabular-nums">{row.points}</td>
              </tr>)}
            </tbody>
          </table>
        </div>
        <p className="px-3 py-2 text-[10.5px] text-muted">Scores are simulated and this table uses only fixtures shown in the prototype; it is not an official league table.</p>
      </div>
    </details>
  )
}

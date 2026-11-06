import { Activity } from 'lucide-react'
import type { Match } from '../../engine/types'
import { teams } from '../../data/teams'

interface MatchStatsProps {
  m: Match
}

export function MatchStatsPanel({ m }: MatchStatsProps) {
  const H = teams[m.home], A = teams[m.away]

  // Fictional deterministic statistics generated from match ID
  const hash = m.id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  const isLive = m.status === 'live'

  const possH = 45 + (hash % 16)
  const possA = 100 - possH

  const shotsOnH = 2 + (hash % 6)
  const shotsOnA = 1 + ((hash * 3) % 5)

  const shotsTotalH = shotsOnH + 3 + (hash % 6)
  const shotsTotalA = shotsOnA + 2 + ((hash * 2) % 6)

  const cornersH = 3 + (hash % 5)
  const cornersA = 2 + ((hash + 1) % 5)

  const foulsH = 8 + (hash % 7)
  const foulsA = 9 + ((hash + 4) % 7)

  const yellowH = (hash % 3)
  const yellowA = ((hash + 2) % 3)

  const stats = [
    { label: 'Ball Possession', valH: `${possH}%`, valA: `${possA}%`, pctH: possH },
    { label: 'Shots on Target', valH: shotsOnH, valA: shotsOnA, pctH: (shotsOnH / (shotsOnH + shotsOnA)) * 100 },
    { label: 'Total Shots', valH: shotsTotalH, valA: shotsTotalA, pctH: (shotsTotalH / (shotsTotalH + shotsTotalA)) * 100 },
    { label: 'Corner Kicks', valH: cornersH, valA: cornersA, pctH: (cornersH / (cornersH + cornersA)) * 100 },
    { label: 'Fouls', valH: foulsH, valA: foulsA, pctH: (foulsH / (foulsH + foulsA)) * 100 },
    { label: 'Yellow Cards', valH: yellowH, valA: yellowA, pctH: (yellowH / Math.max(1, yellowH + yellowA)) * 100 },
  ]

  return (
    <div className="rounded-2xl border border-line bg-card p-4 shadow-xs">
      <div className="flex items-center justify-between border-b border-line pb-2.5 mb-3">
        <div className="flex items-center gap-2 text-xs font-bold text-ink">
          <Activity size={15} className="text-[#E4372B]" />
          <span>Match Statistics · Simulated Live Data</span>
        </div>
        <span className="text-[10.5px] font-semibold text-muted uppercase tracking-wider">
          {isLive ? 'In-Play Feed' : 'Overview'}
        </span>
      </div>

      {/* Team Headers */}
      <div className="flex items-center justify-between text-xs font-black text-ink mb-2">
        <span className="truncate max-w-[120px]">{H.name}</span>
        <span className="text-muted text-[10px] uppercase tracking-wider">Stat Comparison</span>
        <span className="truncate max-w-[120px] text-right">{A.name}</span>
      </div>

      {/* Comparison Bars */}
      <div className="space-y-3">
        {stats.map((s) => (
          <div key={s.label} className="text-xs">
            <div className="flex justify-between font-bold text-[11.5px] mb-1">
              <span className="tnum font-black">{s.valH}</span>
              <span className="text-muted text-[10.5px] font-semibold">{s.label}</span>
              <span className="tnum font-black">{s.valA}</span>
            </div>
            <div className="flex h-1.5 w-full overflow-hidden rounded-full bg-sunk">
              <div
                style={{ width: `${s.pctH}%`, backgroundColor: H.primary || '#E4372B' }}
                className="h-full transition-all duration-300"
              />
              <div
                style={{ width: `${100 - s.pctH}%`, backgroundColor: A.primary || '#16140F' }}
                className="h-full transition-all duration-300"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

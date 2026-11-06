import { CircleDot, Diamond, Goal, HandFist, HockeyStick, RugbyBall, Swords, Volleyball, type LucideIcon } from 'lucide-react'
import type { SportId } from '../engine/types'

/** One icon family (Lucide, same stroke) for every sport, everywhere. */
const icons: Record<SportId, LucideIcon> = {
  football: Goal,
  basketball: Volleyball,
  americanfootball: RugbyBall,
  baseball: Diamond,
  icehockey: HockeyStick,
  cricket: Swords,
  mma: HandFist,
  tennis: CircleDot,
}

export function SportIcon({ id, size = 16, className }: { id: SportId; size?: number; className?: string }) {
  const Icon = icons[id] ?? CircleDot
  return <Icon size={size} strokeWidth={2} className={className} aria-hidden="true" />
}

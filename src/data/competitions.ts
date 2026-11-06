// Competition names only. All teams inside them are fictional.
export interface Competition {
  id: string
  name: string
  region: string
  short: string
}

export const competitions: Competition[] = [
  { id: 'epl', name: 'Premier League', region: 'England', short: 'PL' },
  { id: 'ucl', name: 'Champions League', region: 'Europe', short: 'UCL' },
  { id: 'laliga', name: 'LaLiga', region: 'Spain', short: 'LL' },
  { id: 'seriea', name: 'Serie A', region: 'Italy', short: 'SA' },
  { id: 'bundesliga', name: 'Bundesliga', region: 'Germany', short: 'BL' },
]

export const compById = Object.fromEntries(competitions.map((c) => [c.id, c])) as Record<string, Competition>

export const sports = [
  { id: 'football', name: 'Football', enabled: true },
  { id: 'basketball', name: 'Basketball', enabled: false },
  { id: 'tennis', name: 'Tennis', enabled: false },
  { id: 'icehockey', name: 'Ice hockey', enabled: false },
  { id: 'esports', name: 'Esports', enabled: false },
] as const

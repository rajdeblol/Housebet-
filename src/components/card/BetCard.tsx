import { forwardRef } from 'react'
import { teams } from '../../data/teams'
import type { Bet } from '../../engine/types'
import { brand, colors } from '../../theme'
import { dateTime, fmtOdds, fmtUSDT } from '../../lib/format'
import { Crest } from '../ui'

export type CardSport = 'football' | 'basketball' | 'tennis'

const sportTheme: Record<CardSport, { bg: string; line: string; label: string }> = {
  football: { bg: '#1F5C3F', line: 'rgba(246,242,233,.55)', label: 'Football' },
  basketball: { bg: '#B8622A', line: 'rgba(246,242,233,.6)', label: 'Basketball' },
  tennis: { bg: '#2F5D8A', line: 'rgba(246,242,233,.7)', label: 'Tennis' },
}

/** Pitch / court markings for the header band. */
function Markings({ sport }: { sport: CardSport }) {
  const c = sportTheme[sport].line
  if (sport === 'football')
    return (
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 360 200" preserveAspectRatio="none" aria-hidden="true">
        <g fill="none" stroke={c} strokeWidth="2">
          <rect x="14" y="14" width="332" height="230" />
          <line x1="180" y1="14" x2="180" y2="244" />
          <circle cx="180" cy="120" r="42" />
          <rect x="14" y="66" width="52" height="108" />
          <rect x="294" y="66" width="52" height="108" />
        </g>
        {[0, 1, 2, 3, 4, 5].map((i) => <rect key={i} x={i * 60} y="0" width="30" height="200" fill="rgba(255,255,255,.035)" />)}
      </svg>
    )
  if (sport === 'basketball')
    return (
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 360 200" preserveAspectRatio="none" aria-hidden="true">
        {[...Array(12)].map((_, i) => <line key={i} x1="0" y1={i * 18} x2="360" y2={i * 18} stroke="rgba(0,0,0,.06)" strokeWidth="1" />)}
        <g fill="none" stroke={c} strokeWidth="2">
          <path d="M40 200 A140 140 0 0 1 320 200" />
          <rect x="130" y="110" width="100" height="90" />
          <circle cx="180" cy="110" r="34" />
          <line x1="0" y1="14" x2="360" y2="14" />
        </g>
      </svg>
    )
  return (
    <svg className="absolute inset-0 h-full w-full" viewBox="0 0 360 200" preserveAspectRatio="none" aria-hidden="true">
      <g fill="none" stroke={c} strokeWidth="2">
        <rect x="24" y="20" width="312" height="220" />
        <line x1="60" y1="20" x2="60" y2="240" />
        <line x1="300" y1="20" x2="300" y2="240" />
        <line x1="60" y1="120" x2="300" y2="120" />
        <line x1="180" y1="120" x2="180" y2="240" />
      </g>
    </svg>
  )
}

/** Original stylised striker — geometric, fictional, not based on any real person. */
function StrikerPose({ shirt, shorts }: { shirt: string; shorts: string }) {
  const skin = '#F6F2E9'
  return (
    <svg viewBox="0 0 170 160" className="h-full w-auto" aria-hidden="true">
      <g stroke={skin} strokeLinecap="round" strokeLinejoin="round" fill="none" opacity=".5" strokeWidth="3">
        <line x1="14" y1="70" x2="40" y2="70" /><line x1="8" y1="84" x2="44" y2="84" /><line x1="18" y1="98" x2="46" y2="98" />
      </g>
      <g stroke={skin} strokeLinecap="round" strokeLinejoin="round" fill="none" strokeWidth="9">
        <polyline points="80,50 62,66 50,60" />
        <polyline points="102,48 122,58 136,48" />
        <polyline points="96,88 88,116 94,146" />
        <polyline points="86,88 106,108 132,114" />
      </g>
      <polygon points="76,42 106,40 110,80 80,84" fill={shirt} stroke={colors.ink} strokeWidth="2" strokeLinejoin="round" />
      <polygon points="79,80 111,78 113,96 83,98" fill={shorts} stroke={colors.ink} strokeWidth="2" strokeLinejoin="round" />
      <circle cx="93" cy="27" r="11" fill={skin} />
      <path d="M86 146h14" stroke={colors.ink} strokeWidth="6" strokeLinecap="round" />
      <path d="M128 112l8 5" stroke={colors.ink} strokeWidth="6" strokeLinecap="round" />
      <circle cx="150" cy="118" r="10" fill="#fff" stroke={colors.ink} strokeWidth="2" />
      <path d="M150 112l5 3.6-1.9 5.8h-6.2l-1.9-5.8z" fill={colors.ink} />
    </svg>
  )
}

function jerseyNumber(id: string) {
  let h = 0
  for (const ch of id) h = (h * 31 + ch.charCodeAt(0)) % 99
  return Math.max(2, h)
}

export const BetCard = forwardRef<HTMLDivElement, { bet: Bet; sport?: CardSport }>(function BetCard({ bet, sport = 'football' }, ref) {
  const theme = sportTheme[sport]
  const home = bet.homeId ? teams[bet.homeId] : undefined
  const away = bet.awayId ? teams[bet.awayId] : undefined
  const pickTeam = [home, away].find((t) => t && bet.pick.startsWith(t.name)) ?? home
  const ret = bet.status === 'won' || bet.status === 'cashed' ? bet.returned ?? 0 : bet.stake * bet.odds
  const retLabel = bet.status === 'won' ? 'Returned' : bet.status === 'cashed' ? 'Cashed out' : bet.status === 'lost' ? 'Potential return' : 'Potential return'
  const statusLabel = bet.status === 'open' ? 'Open' : bet.status === 'won' ? 'Won' : bet.status === 'lost' ? 'Lost' : 'Cashed out'
  const score = bet.finalScore ?? [2, 1]

  return (
    <div ref={ref} className="w-[340px] overflow-hidden rounded-l border border-line bg-card text-ink" style={{ fontFamily: brand.fontFamily }}>
      {/* header band */}
      <div className="relative h-[200px] overflow-hidden" style={{ background: theme.bg }}>
        <Markings sport={sport} />
        <div className="relative flex h-full">
          <div className="flex flex-1 flex-col justify-between p-5 text-page">
            <div className="flex items-center gap-2">
              {pickTeam && <span className="rounded-s bg-page p-1.5"><Crest id={pickTeam.id} size={34} /></span>}
              <div className="leading-tight">
                <p className="text-[11px] font-semibold uppercase tracking-[.14em] opacity-80">{theme.label}</p>
                <p className="text-[13px] font-bold">{bet.compName}</p>
              </div>
            </div>
            <span className="self-start rounded-full bg-page px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-ink">{statusLabel}</span>
          </div>
          <div className="flex w-[170px] items-end justify-center">
            {sport === 'football' && <div className="h-[170px] pb-2"><StrikerPose shirt={pickTeam?.primary ?? '#E4372B'} shorts={pickTeam?.secondary ?? '#fff'} /></div>}
            {sport === 'basketball' && (
              <svg viewBox="0 0 120 130" className="mb-3 h-[160px]" aria-hidden="true">
                <path d="M30 8h18c2 8 22 8 24 0h18l22 22-14 14-8-6v84H30V38l-8 6L8 30z" fill={pickTeam?.primary ?? '#16140F'} stroke="#F6F2E9" strokeWidth="3" strokeLinejoin="round" />
                <text x="60" y="98" textAnchor="middle" fontSize="54" fontWeight="800" fill={pickTeam?.secondary ?? '#fff'} fontFamily={brand.fontFamily}>{jerseyNumber(bet.id)}</text>
              </svg>
            )}
            {sport === 'tennis' && (
              <div className="mb-5 mr-4 rounded-m bg-page px-4 py-2 text-center">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted">Score</p>
                <p className="tnum text-[54px] font-extrabold leading-none">{score[0]}–{score[1]}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* body */}
      <div className="p-5">
        <p className="text-[12.5px] font-semibold text-muted">{bet.home} v {bet.away}</p>
        <div className="mt-2 flex items-end justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">{bet.marketName}</p>
            <p className="truncate text-[22px] font-extrabold leading-tight tracking-tight">{bet.pick}</p>
          </div>
          <p className="tnum rounded-s bg-ink px-2.5 py-1 text-[26px] font-extrabold leading-none text-page">{fmtOdds(bet.odds)}</p>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-px overflow-hidden rounded-m border border-line bg-line">
          <div className="bg-card px-3 py-2.5">
            <p className="text-[10.5px] font-semibold uppercase tracking-wider text-muted">Stake</p>
            <p className="tnum text-[17px] font-bold">{fmtUSDT(bet.stake)} <span className="text-[11px] text-muted">USDT</span></p>
          </div>
          <div className="bg-card px-3 py-2.5">
            <p className="text-[10.5px] font-semibold uppercase tracking-wider text-muted">{retLabel}</p>
            <p className="tnum text-[17px] font-bold">{fmtUSDT(ret)} <span className="text-[11px] text-muted">USDT</span></p>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between border-t border-dashed border-line pt-3 text-[11.5px]">
          <span className="tnum font-bold tracking-wide">{bet.id}</span>
          <span className="text-muted">{dateTime(bet.placedAt)}</span>
        </div>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-[14px] font-extrabold tracking-[-0.03em]">{brand.wordmark}</span>
          <span className="text-[10.5px] text-muted">Sample data · Single bet · 18+</span>
        </div>
      </div>
    </div>
  )
})

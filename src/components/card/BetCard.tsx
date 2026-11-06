import { forwardRef } from 'react'
import { TrendingUp, CheckCircle2, Zap, Trophy } from 'lucide-react'
import { teams } from '../../data/teams'
import type { Bet, SportId } from '../../engine/types'
import { brand } from '../../theme'
import { dateTime, fmtOdds, fmtUSDT } from '../../lib/format'
import { Crest } from '../ui'
import { useStore } from '../../engine/store'

import cricketCard from '../../assets/cards/housebets-cricket.png'
import footballCard from '../../assets/cards/housebets-football.png'
import basketballCard from '../../assets/cards/housebets-basketball.png'
import tennisCard from '../../assets/cards/housebets-tennis.png'
import ufcCard from '../../assets/cards/housebets-ufc.png'
import nflCard from '../../assets/cards/housebets-nfl.png'
import mlbCard from '../../assets/cards/housebets-mlb.png'
import nhlCard from '../../assets/cards/housebets-nhl.png'
import esportsCard from '../../assets/cards/housebets-esports.png'

export type CardSport = SportId

const cardImages: Record<string, string> = {
  cricket: cricketCard,
  football: footballCard,
  basketball: basketballCard,
  tennis: tennisCard,
  mma: ufcCard,
  americanfootball: nflCard,
  baseball: mlbCard,
  icehockey: nhlCard,
  esports: esportsCard,
}

export const BetCard = forwardRef<HTMLDivElement, { bet: Bet; sport?: CardSport }>(function BetCard(
  { bet, sport = 'football' },
  ref,
) {
  const home = bet.homeId ? teams[bet.homeId] : undefined
  const away = bet.awayId ? teams[bet.awayId] : undefined
  const pickTeam = [home, away].find((t) => t && bet.pick.startsWith(t.name)) ?? home

  const ret = bet.status === 'won' || bet.status === 'cashed' ? bet.returned ?? 0 : bet.stake * bet.odds
  const statusLabel = bet.status === 'open' ? 'Open' : bet.status === 'won' ? 'Won' : bet.status === 'lost' ? 'Lost' : 'Cashed out'
  const liveScore = useStore((s) => (bet.matchId ? s.matches[bet.matchId]?.score : undefined))
  const score = bet.finalScore ?? liveScore

  // Net Profit calculation
  const isSettled = bet.status === 'won' || bet.status === 'cashed'
  const profit = isSettled
    ? (bet.returned ?? 0) - bet.stake
    : bet.stake * bet.odds - bet.stake
  const isProfitPositive = profit > 0

  const bgImage = cardImages[sport] || cardImages[bet.sport] || footballCard

  return (
    <div
      ref={ref}
      className="relative w-full max-w-[550px] aspect-[546/309] overflow-hidden rounded-2xl shadow-2xl border border-white/20 bg-[#0d0c0b] text-white select-none transition-all"
      style={{ fontFamily: brand.fontFamily }}
    >
      {/* Background Official Housebets Sports Card PNG */}
      <img
        src={bgImage}
        alt="Housebets Card"
        className="absolute inset-0 h-full w-full object-cover pointer-events-none"
        crossOrigin="anonymous"
      />

      {/* Subtle overlay vignette on left to ensure maximum text readability */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent pointer-events-none" />

      {/* Interactive Overlaid Bet Content */}
      <div className="relative z-10 flex h-full flex-col justify-between p-3.5 sm:p-5">
        {/* Top Header Row: Status & Competition on Top Right */}
        <div className="flex items-start justify-end gap-2">
          {/* Competition Pill */}
          <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 px-2.5 py-0.5 text-[11px] font-semibold text-white/90">
            {bet.compName}
          </span>

          {/* Status Badge */}
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] sm:text-[11px] font-black uppercase tracking-wider shadow-md ${
              bet.status === 'cashed'
                ? 'bg-amber-400 text-black border border-amber-300'
                : bet.status === 'won'
                ? 'bg-emerald-400 text-black border border-emerald-300'
                : bet.status === 'lost'
                ? 'bg-rose-500 text-white border border-rose-400'
                : 'bg-white/90 text-black border border-white'
            }`}
          >
            {bet.status === 'cashed' && <Zap size={12} />}
            {bet.status === 'won' && <CheckCircle2 size={12} />}
            {statusLabel}
          </span>
        </div>

        {/* Middle Area: Matchup, Market & Pick */}
        <div className="max-w-[62%] sm:max-w-[64%] space-y-1.5 my-auto">
          {/* Match Teams & Crest */}
          <div className="flex items-center gap-2 text-white/80">
            {pickTeam && <Crest id={pickTeam.id} size={20} />}
            <p className="truncate text-xs sm:text-[13px] font-bold tracking-tight">
              {bet.home} vs {bet.away}
            </p>
            {score && (
              <span className="tnum font-extrabold text-[12px] text-white bg-black/50 px-1.5 py-0.2 rounded-md">
                {score[0]}–{score[1]}
              </span>
            )}
          </div>

          {/* Market & Pick */}
          <div>
            <p className="text-[9.5px] sm:text-[10.5px] font-extrabold uppercase tracking-widest text-white/60">
              {bet.marketName}
            </p>
            <div className="flex items-baseline gap-2 mt-0.5">
              <h3 className="truncate text-[18px] sm:text-[23px] font-black leading-tight text-white drop-shadow-md">
                {bet.pick}
              </h3>
              <span className="tnum shrink-0 rounded-lg bg-white/20 backdrop-blur-md border border-white/30 px-2 py-0.5 text-xs sm:text-sm font-black text-white shadow-xs">
                {fmtOdds(bet.odds)}x
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Area: Profit Card & Metadata */}
        <div className="max-w-[64%] sm:max-w-[66%] space-y-2">
          {/* Profit Banner */}
          {isSettled ? (
            <div
              className={`flex items-center justify-between rounded-xl px-2.5 py-1.5 sm:px-3 sm:py-2 backdrop-blur-md border shadow-lg ${
                isProfitPositive
                  ? 'bg-emerald-950/80 border-emerald-500/60 text-emerald-300'
                  : 'bg-black/70 border-white/20 text-white/80'
              }`}
            >
              <div className="flex items-center gap-2">
                <div
                  className={`flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-lg ${
                    isProfitPositive ? 'bg-emerald-500/30 text-emerald-300' : 'bg-white/10 text-white'
                  }`}
                >
                  {isProfitPositive ? <TrendingUp size={15} /> : <Trophy size={15} />}
                </div>
                <div>
                  <p className="text-[8.5px] sm:text-[9.5px] font-extrabold uppercase tracking-wider text-emerald-400">
                    {bet.status === 'cashed' ? '⚡ Cashed Out Profit' : '🏆 Net Profit'}
                  </p>
                  <p className="text-[14px] sm:text-[17px] font-black tnum leading-tight text-white">
                    +{fmtUSDT(profit)} <span className="text-[10px] text-emerald-400">USDT</span>
                  </p>
                </div>
              </div>

              {isProfitPositive && (
                <span className="rounded-full bg-emerald-500/30 border border-emerald-400/40 px-2 py-0.5 text-[9.5px] sm:text-[10.5px] font-black text-emerald-300">
                  +{((profit / bet.stake) * 100).toFixed(0)}% ROI
                </span>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-between rounded-xl bg-black/60 backdrop-blur-md border border-white/20 px-2.5 py-1.5 sm:px-3 sm:py-2">
              <div>
                <p className="text-[8.5px] sm:text-[9.5px] font-bold uppercase tracking-wider text-white/60">
                  Potential Payout
                </p>
                <p className="text-[13px] sm:text-[15px] font-black tnum text-emerald-400 leading-tight">
                  ${fmtUSDT(ret)} <span className="text-[10px] text-white/60">USDT</span>
                </p>
              </div>
              <span className="rounded-md bg-white/10 px-2 py-0.5 text-[9px] font-bold text-white/80 uppercase">
                Single Bet
              </span>
            </div>
          )}

          {/* Bottom Footnote: Stake, ID & Timestamp */}
          <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-white/70 pt-0.5 font-medium">
            <span>
              Stake: <strong className="text-white font-bold">{fmtUSDT(bet.stake)} USDT</strong>
            </span>
            <span className="tnum font-semibold text-white/80">{bet.id}</span>
            <span className="hidden sm:inline text-white/50">{dateTime(bet.placedAt)}</span>
          </div>
        </div>
      </div>
    </div>
  )
})

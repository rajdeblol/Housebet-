import { Flame, ShieldCheck, Sparkles, TrendingUp, Zap } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useStore } from '../engine/store'

export function WaveBanner() {
  const matches = useStore((s) => s.matches)
  const liveCount = Object.values(matches).filter((m) => m.status === 'live').length

  return (
    <div className="relative mb-6 overflow-hidden rounded-xl border border-line bg-gradient-to-br from-[#1C1514] via-[#16140F] to-[#0D0B08] p-5 text-white shadow-lg sm:p-6">
      {/* Decorative Wave lines in background */}
      <svg
        className="pointer-events-none absolute -right-8 -top-12 h-64 w-80 opacity-20 sm:opacity-25"
        viewBox="0 0 200 200"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          fill="#E4372B"
          d="M44.7,-76.4C58.8,-69.2,71.8,-59.1,79.6,-45.8C87.4,-32.6,90,-16.3,88.5,-0.9C87,14.6,81.4,29.1,72.7,41.2C64,53.2,52.3,62.8,39.3,69.5C26.3,76.2,12.1,80,-2.3,83.9C-16.7,87.9,-33.4,92.1,-46.8,86.2C-60.2,80.3,-70.3,64.4,-77.3,48.5C-84.3,32.6,-88.2,16.3,-87.3,0.5C-86.4,-15.3,-80.7,-30.5,-71.7,-43.3C-62.7,-56.1,-50.3,-66.4,-36.8,-73.9C-23.3,-81.4,-8.7,-86.1,3.7,-92.5C16.1,-98.9,30.6,-83.6,44.7,-76.4Z"
          transform="translate(100 100)"
        />
      </svg>

      <div className="relative z-10 flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
        <div className="max-w-xl">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E4372B]/20 border border-[#E4372B]/40 px-2.5 py-0.5 text-[11px] font-extrabold uppercase tracking-wider text-[#FF6B5E]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#E4372B] animate-pulse" />
              Housebets Wave 2 Live
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-white/60">
              <Sparkles size={12} className="text-amber-400" /> $5M Platform Reward Pool
            </span>
          </div>

          <h2 className="text-[22px] font-black tracking-tight text-white sm:text-[26px]">
            Decentralized In-Play Sportsbook
          </h2>
          <p className="mt-1 text-[13.5px] leading-relaxed text-white/70">
            Clickable singles-only prototype. Sub-second odds updates, live split-flap scoreboards, and instant USDT settlements.
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-4 text-[12px] font-semibold text-white/80">
            <span className="inline-flex items-center gap-1.5">
              <Zap size={14} className="text-[#FF6B5E]" /> 1-Click Wagers
            </span>
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-emerald-400" /> Singles Only
            </span>
            <span className="inline-flex items-center gap-1.5">
              <TrendingUp size={14} className="text-sky-400" /> Real-time Cashout
            </span>
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-3">
          <Link
            to="/live"
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#E4372B] px-4 text-[13.5px] font-bold text-white shadow-md transition-all hover:bg-[#CF3428] hover:shadow-lg active:scale-95"
          >
            <Flame size={16} /> Live Markets ({liveCount})
          </Link>
          <Link
            to="/bets"
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-white/20 bg-white/5 px-4 text-[13.5px] font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/10 active:scale-95"
          >
            Open Bet Slip
          </Link>
        </div>
      </div>
    </div>
  )
}

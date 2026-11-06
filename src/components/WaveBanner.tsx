import { Radio, ReceiptText, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import { actions, useStore } from '../engine/store'

export function WaveBanner() {
  const matches = useStore((s) => s.matches)
  const liveCount = Object.values(matches).filter((m) => m.status === 'live').length

  return (
    <div className="relative mb-5 overflow-hidden rounded-2xl border border-line bg-gradient-to-br from-[#1C1514] via-[#16140F] to-[#0D0B08] p-4 text-white shadow-md sm:p-5">
      {/* Decorative Wave lines in background */}
      <svg
        className="pointer-events-none absolute -right-6 -top-10 h-52 w-64 opacity-15 sm:opacity-20"
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

      <div className="relative z-10 flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <div className="max-w-xl">
          {/* Badge: Housebets Wave 2 Prototype */}
          <div className="mb-1.5 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E4372B]/20 border border-[#E4372B]/40 px-2 py-0.5 text-[10.5px] font-extrabold uppercase tracking-wider text-[#FF6B5E]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#E4372B] animate-pulse" />
              Housebets Prototype
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-white/60">
              <Sparkles size={11} className="text-amber-400" /> Contest Design Demo
            </span>
          </div>

          {/* Exact Prescribed Headline */}
          <h2 className="text-[20px] font-black tracking-tight text-white sm:text-[23px]">
            Your Sports. Your Markets. Your Game.
          </h2>

          {/* Exact Prescribed Subheading */}
          <p className="mt-1 text-[13px] leading-snug text-white/70">
            Explore matchups, compare sample odds and build your single-selection bet slip in a clean, responsive sportsbook demo.
          </p>

          {/* Exact Prescribed Feature Labels */}
          <div className="mt-2.5 flex flex-wrap items-center gap-3 text-[11.5px] font-semibold text-white/80">
            <span className="inline-flex items-center gap-1">
              <span className="text-[#FF6B5E]">•</span> Single selections
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="text-emerald-400">•</span> Demo balance
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="text-sky-400">•</span> Simulated match updates
            </span>
          </div>
        </div>

        {/* Prescribed Action Buttons */}
        <div className="flex shrink-0 flex-wrap items-center gap-2.5">
          <Link
            to="/live"
            className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#E4372B] px-3.5 text-[13px] font-bold text-white shadow-xs transition-all hover:bg-[#CF3428] active:scale-95"
          >
            <Radio size={14} className="animate-pulse" /> View live matches ({liveCount})
          </Link>
          <button
            type="button"
            onClick={() => actions.openSheet(true, true)}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-white/20 bg-white/5 px-3.5 text-[13px] font-semibold text-white backdrop-blur-xs transition-all hover:bg-white/10 active:scale-95"
          >
            <ReceiptText size={14} /> Open demo bet slip
          </button>
        </div>
      </div>
    </div>
  )
}

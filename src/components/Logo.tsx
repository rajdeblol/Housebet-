import { brand } from '../theme'

/** Housebets wordmark with Wave 2 contest badge. */
export function Logo({ className }: { className?: string }) {
  return (
    <span className={'inline-flex items-center gap-2.5 ' + (className ?? '')}>
      <svg width="28" height="28" viewBox="0 0 32 32" aria-hidden="true" className="shrink-0">
        <rect width="32" height="32" rx="8" fill="rgb(var(--ink))" />
        <path d="M16 6 26 14v12H6V14z" fill={brand.logoColor} />
        <rect x="13" y="18" width="6" height="8" fill="rgb(var(--ink))" />
      </svg>
      <div className="flex items-center gap-2">
        <span className="text-[19px] font-extrabold tracking-[-0.03em]">{brand.wordmark}</span>
        <span className="inline-flex items-center gap-1 rounded-full border border-[#E4372B]/30 bg-[#E4372B]/15 px-2 py-0.5 text-[9.5px] font-extrabold uppercase tracking-widest text-[#E4372B]">
          <span className="h-1 w-1 rounded-full bg-[#E4372B]" />
          WAVE 2
        </span>
      </div>
    </span>
  )
}

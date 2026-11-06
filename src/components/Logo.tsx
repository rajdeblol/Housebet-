import { brand } from '../theme'

/** Housebets wordmark. Colours come from theme.ts so light and dark both work. */
export function Logo({ className }: { className?: string }) {
  return (
    <span className={'inline-flex items-center gap-2 ' + (className ?? '')}>
      <svg width="28" height="28" viewBox="0 0 32 32" aria-hidden="true" className="shrink-0">
        <rect width="32" height="32" rx="8" fill="rgb(var(--ink))" />
        <path d="M16 6 26 14v12H6V14z" fill="rgb(var(--brand))" />
        <rect x="13" y="18" width="6" height="8" fill="rgb(var(--ink))" />
      </svg>
      <span className="text-[19px] font-extrabold tracking-[-0.03em]">{brand.wordmark}</span>
    </span>
  )
}

import { brand, colors } from '../theme'

/** Placeholder Housebets wordmark. Swap the SVG mark for the brand-pack logo. */
export function Logo({ className }: { className?: string }) {
  return (
    <span className={'inline-flex items-center gap-2 ' + (className ?? '')}>
      <svg width="28" height="28" viewBox="0 0 32 32" aria-hidden="true">
        <rect width="32" height="32" rx="8" fill={colors.ink} />
        <path d="M16 6 26 14v12H6V14z" fill={brand.logoColor} />
        <rect x="13" y="18" width="6" height="8" fill={colors.ink} />
      </svg>
      <span className="text-[19px] font-extrabold tracking-[-0.03em]">{brand.wordmark}</span>
    </span>
  )
}

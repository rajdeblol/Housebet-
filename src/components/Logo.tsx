/** Housebets wordmark. Colours come from theme.ts so light and dark both work. */
export function Logo({ className }: { className?: string }) {
  return (
    <span className={'inline-flex items-center ' + (className ?? '')}>
      <img src={`${import.meta.env.BASE_URL}housebets-logo-light.svg`} alt="Housebets" className="h-[18px] w-auto dark:hidden sm:h-[22px]" />
      <img src={`${import.meta.env.BASE_URL}housebets-logo.svg`} alt="Housebets" className="hidden h-[18px] w-auto dark:block sm:h-[22px]" />
    </span>
  )
}

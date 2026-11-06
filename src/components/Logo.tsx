/** Visible Housebets wordmark in both themes; the text keeps the brand legible at small sizes. */
export function Logo({ className }: { className?: string }) {
  return (
    <span className={'inline-flex items-center gap-2 ' + (className ?? '')}>
      <span aria-hidden="true" className="grid h-7 w-7 place-items-center rounded-[9px] bg-brand text-[17px] font-black leading-none text-page sm:h-8 sm:w-8 sm:text-[19px]">H</span>
      <span className="text-[16px] font-black tracking-[-.045em] text-ink sm:text-[18px]">Housebets</span>
    </span>
  )
}

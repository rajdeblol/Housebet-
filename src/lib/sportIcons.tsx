import type { SportId } from '../engine/types'

/** Consistent lightweight sport marks used in navigation, filters, and competition cards. */
export function SportIcon({ id, size = 16, className }: { id: SportId; size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      {id === 'football' && <>
        <circle cx="12" cy="12" r="9" />
        <path d="m12 7 3.2 2.3-1.2 3.8h-4l-1.2-3.8L12 7Z" />
        <path d="m8.8 9.3-3.1-.7M8.8 13.1l-2.4 2.7m7.6-2.7 2.4 2.7m.8-6.5 3.1-.7m-5.9-1.6L15 4.1m-6 2.2L9 4.1" />
      </>}
      {id === 'basketball' && <>
        <circle cx="12" cy="12" r="9" />
        <path d="M3.4 9h17.2M3.4 15h17.2M12 3v18M5.6 5.6c4.8 3.1 8 9.7 8.3 15.5m4.5-17.1c-4.8 3.1-8 9.7-8.3 15.5" />
      </>}
      {id === 'americanfootball' && <>
        <path d="M4.2 16.5c-1.7-1.8-.6-5.8 2.7-9.1s7.3-4.4 9.1-2.7l3.8 3.8c1.7 1.8.6 5.8-2.7 9.1s-7.3 4.4-9.1 2.7l-3.8-3.8Z" />
        <path d="m8.1 15.9 7.8-7.8m-5.9 6 4 4m-2.1-6 4 4m-6-8 4 4" />
      </>}
      {id === 'baseball' && <>
        <circle cx="12" cy="12" r="9" />
        <path d="M7 4.5c3.2 2.2 4.4 5.1 4.4 7.5S10.2 17.3 7 19.5M17 4.5c-3.2 2.2-4.4 5.1-4.4 7.5s1.2 5.3 4.4 7.5" />
        <path d="m7.2 7 .9.7m-.7 2 1 .6m-1 2 1 .4m-.9 2.1.9.4m6.8-8.2.9-.7m-.8 2.7 1-.6m-1 2.6 1-.4m-1 2.5.9-.4" />
      </>}
      {id === 'icehockey' && <>
        <path d="m5 3 8 14m-3-1-4 3m8-5 5 2m-2-13-8 14m3-1 4 3m-8-5-5 2" />
        <path d="M4 21h16" />
      </>}
      {id === 'cricket' && <>
        <path d="m7 4 3 1-4 13-3-1L7 4Zm-3 14-1 3m8-15 2 1M15 7v12m4-12v12m-5 0h6m-5-13h4m-4 2h4" />
        <circle cx="18.5" cy="5" r="1.5" />
      </>}
      {id === 'mma' && <>
        <path d="M7 11V6.5a1.5 1.5 0 0 1 3 0V10m0-1V5.5a1.5 1.5 0 0 1 3 0V9m0 .5V7a1.5 1.5 0 0 1 3 0v4l1-1a1.5 1.5 0 0 1 2.4 1.8l-3 4.7a5 5 0 0 1-4.2 2.3h-1.7A5.5 5.5 0 0 1 5 13v-1a2 2 0 0 1 2-2Z" />
      </>}
      {id === 'tennis' && <>
        <circle cx="12" cy="12" r="9" />
        <path d="M5.6 5.6c4.5 2.3 4.5 10.5 0 12.8m12.8-12.8c-4.5 2.3-4.5 10.5 0 12.8" />
      </>}
    </svg>
  )
}

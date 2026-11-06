import type { SportId } from '../engine/types'

/** Compact full-colour sport marks inspired by clean sportsbook league navigation. */
export function SportIcon({ id, size = 22, className }: { id: SportId; size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" className={className} aria-hidden="true" focusable="false">
      {id === 'football' && <g stroke="#111827" strokeWidth="1.25" strokeLinejoin="round">
        <circle cx="16" cy="16" r="13" fill="#F8FAFC" />
        <path d="m16 9 4.2 3-1.6 4.9h-5.2L11.8 12 16 9Z" fill="#111827" />
        <path d="m11.8 12-3.2-.8m1.6 5.7-3.7 2.4m10.1-2.4 3.7 2.4m1.6-8.1 3.2.8m-8.1-3 1.1-3.6m-6.1 3.6-1.1-3.6" fill="none" />
      </g>}

      {id === 'basketball' && <g stroke="#161616" strokeWidth="1.3" strokeLinecap="round">
        <circle cx="16" cy="16" r="13" fill="#F79A16" />
        <path d="M3.5 16h25M16 3.5v25M7 7c7 4 11 14 11.5 21M25 7c-7 4-11 14-11.5 21" fill="none" />
      </g>}

      {id === 'americanfootball' && <g>
        <rect x="5.2" y="4.6" width="23" height="23" rx="5" fill="#B6C2CE" transform="rotate(5 5.2 4.6)" />
        <rect x="3.3" y="3" width="23" height="23" rx="5" fill="#102D4D" stroke="#10202E" strokeWidth="1.2" />
        <path d="M8 9.1 20.9 7.5l3.3 3.4-1.8 9.7-12.9 1.7-3.2-3.5L8 9.1Z" fill="#F7FAFC" />
        <path d="m10 18.5 9.3-8.3m-6.2 5.5 2.6 2.9m.1-5.4 2.6 2.9" fill="none" stroke="#102D4D" strokeWidth="1.7" strokeLinecap="round" />
        <path d="m10.6 10.2 1.2 1.4m1.6-1.7 1.2 1.4m1.6-1.7 1.2 1.4" stroke="#D84736" strokeWidth="1" />
      </g>}

      {id === 'baseball' && <g>
        <rect x="5.2" y="4.6" width="23" height="23" rx="5" fill="#B6C2CE" transform="rotate(5 5.2 4.6)" />
        <rect x="3.3" y="3" width="23" height="23" rx="5" fill="#132D4D" stroke="#10202E" strokeWidth="1.2" />
        <path d="M7 9h15v11H7z" fill="#F8FAFC" />
        <circle cx="13.7" cy="14.5" r="3.1" fill="#F8FAFC" stroke="#1D3E60" strokeWidth=".8" />
        <path d="M11.8 12.3c1.2.9 1.3 3.4.1 4.4m3.8-4.4c-1.2.9-1.3 3.4-.1 4.4" fill="none" stroke="#D54145" strokeWidth=".65" />
        <path d="M17.5 13.1h2.3m-2.3 2.2h2.3" stroke="#1D3E60" strokeWidth="1" strokeLinecap="round" />
      </g>}

      {id === 'icehockey' && <g>
        <rect x="5.2" y="4.6" width="23" height="23" rx="5" fill="#B6C2CE" transform="rotate(5 5.2 4.6)" />
        <rect x="3.3" y="3" width="23" height="23" rx="5" fill="#161B22" stroke="#0D1117" strokeWidth="1.2" />
        <path d="m9 8 9.5 14m-.6-3.1 4.6 1.1M22 8l-9.5 14m.6-3.1-4.6 1.1" fill="none" stroke="#E7EDF2" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M9.3 24h13.4" stroke="#9CB6C1" strokeWidth="1.6" strokeLinecap="round" />
        <ellipse cx="16" cy="26" rx="4" ry="1.4" fill="#242E37" />
      </g>}

      {id === 'cricket' && <g>
        <circle cx="16" cy="16" r="13" fill="#E9F5E9" stroke="#1B513B" strokeWidth="1.2" />
        <path d="M10.2 24.2 20.8 7.8" stroke="#C9363C" strokeWidth="5.2" strokeLinecap="round" />
        <path d="M9.2 23.2c3.3-1.2 6.1.5 7.8 3.2m-4.4-8.4 2.1 1.3m.3-4.1 2.1 1.3m.4-4.1 2.1 1.3" fill="none" stroke="#F8F1E9" strokeWidth="1.1" strokeLinecap="round" />
      </g>}

      {id === 'mma' && <g>
        <rect x="5.2" y="4.6" width="23" height="23" rx="5" fill="#B6C2CE" transform="rotate(5 5.2 4.6)" />
        <rect x="3.3" y="3" width="23" height="23" rx="5" fill="#E83A32" stroke="#B82120" strokeWidth="1.2" />
        <text x="14.8" y="20" fill="#fff" fontFamily="Arial, sans-serif" fontSize="9" fontStyle="italic" fontWeight="900" textAnchor="middle">UFC</text>
      </g>}

      {id === 'tennis' && <g>
        <circle cx="16" cy="16" r="13" fill="#D5ED23" stroke="#172018" strokeWidth="1.2" />
        <path d="M7.2 6.7c6.5 3.3 6.5 15.3 0 18.6m17.6-18.6c-6.5 3.3-6.5 15.3 0 18.6" fill="none" stroke="#fff" strokeWidth="1.8" />
      </g>}
    </svg>
  )
}

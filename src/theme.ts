/**
 * Housebets theme — the ONE file to swap brand values (light + dark palettes).
 *
 * Replace `brand` with the values from the Housebets starter brand pack
 * (logo colour, main colour hex, font names). Everything in the UI reads from here:
 * Tailwind colours are CSS variables written by applyTheme() at startup.
 */

export const brand = {
  name: 'Housebets',
  /** Lowercase wordmark used on exported bet cards. */
  wordmark: 'housebets',
  /** Cyan used by the official Housebets wordmark. */
  logoColor: '#02F7FD',
  /** Font family. Inter is bundled locally (no network font calls). */
  fontFamily: "'Inter Variable', Inter, ui-sans-serif, system-ui, sans-serif",
}

/** Cool, high-contrast light palette for the Housebets sports identity. */
export const colors = {
  page: '#F3F7F8',
  card: '#FFFFFF',
  sunk: '#E8F0F2',
  ink: '#10242B',
  muted: '#536970',
  line: '#D0DEE1',
  accent: '#006F77',
  brand: '#007F87',
  up: '#1E8E68',
  upText: '#14704F',
  down: '#D94F49',
  live: '#D94F49',
  warn: '#715713',
  warnBg: '#F8F0DA',
}

/** Dark navy-teal palette from the Housebets upgrade brief. */
export const darkColors: typeof colors = {
  page: '#080D1D',
  card: '#10172B',
  sunk: '#171F37',
  ink: '#F5F7FF',
  muted: '#A4B0C8',
  line: '#293553',
  accent: '#00D5D5',
  brand: brand.logoColor,
  up: '#32C48D',
  upText: '#32C48D',
  down: '#FF7068',
  live: '#FF625C',
  warn: '#F2D278',
  warnBg: '#2C291A',
}

export const radius = { s: 8, m: 12, l: 20 }

export type ThemeMode = 'light' | 'dark'
const THEME_KEY = 'hb.theme'

export function initialMode(): ThemeMode {
  try {
    const saved = localStorage.getItem(THEME_KEY)
    if (saved === 'light' || saved === 'dark') return saved
  } catch { /* storage unavailable */ }
  return 'dark'
}

export function saveMode(mode: ThemeMode) {
  try { localStorage.setItem(THEME_KEY, mode) } catch { /* ignore */ }
}

const hexToChannels = (hex: string) => {
  const h = hex.replace('#', '')
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)).join(' ')
}

export function applyTheme(mode: ThemeMode = 'light') {
  const root = document.documentElement
  const c = mode === 'dark' ? darkColors : colors
  root.classList.toggle('dark', mode === 'dark')
  root.style.colorScheme = mode
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', c.page)
  const map: Record<string, string> = {
    onink: mode === 'dark' ? c.page : '#FFFFFF',
    page: c.page, card: c.card, sunk: c.sunk, ink: c.ink, muted: c.muted,
    line: c.line, accent: c.accent, brand: c.brand, up: c.up, 'up-text': c.upText,
    down: c.down, live: c.live, warn: c.warn, 'warn-bg': c.warnBg,
  }
  for (const [k, v] of Object.entries(map)) root.style.setProperty(`--${k}`, hexToChannels(v))
  root.style.setProperty('--font-sans', brand.fontFamily)
}

/**
 * Housebets theme — the ONE file to swap brand values (light + dark palettes).
 *
 * Replace `brand` with the values from the Housebets starter brand pack
 * (logo colour, main colour hex, font names). Everything in the UI reads from here:
 * Tailwind colours are CSS variables written by applyTheme() at startup.
 */

export const brand = {
  name: 'Housebets',
  /** Wordmark text (lowercase per placeholder logo). */
  wordmark: 'housebets',
  /** Brand red used for the logo mark. Placeholder until the brand pack is pasted in. */
  logoColor: '#E4372B',
  /** Font family. Inter is bundled locally (no network font calls). */
  fontFamily: "'Inter Variable', Inter, ui-sans-serif, system-ui, sans-serif",
}

/** "Paper scoreboard" palette. All text pairs checked for WCAG AA (4.5:1) on page and card. */
export const colors = {
  page: '#F6F2E9', // warm off-white page
  card: '#FFFFFF', // raised cards
  sunk: '#EFE9DC', // inset wells (odds buttons at rest, inputs)
  ink: '#16140F', // primary text, score tiles
  muted: '#6B6457', // secondary text (5.2:1 on page)
  line: '#DDD6C6', // 1px borders
  /** Single sharp accent: selected odds + primary button. #E4372B deepened 1 step so white text passes AA (5.0:1). */
  accent: '#CF3428',
  brand: brand.logoColor,
  up: '#1E8E5A', // odds-up flash + arrows (non-text, 3.7:1)
  upText: '#19774C', // odds-up text (5.0:1 on page)
  down: '#C62F25', // odds-down flash, arrows and text (4.9:1 on page)
  live: '#CF3428',
  warn: '#8A5A00',
  warnBg: '#FBF0D9',
}

/** Dark mode: same structure, warm charcoal paper. Text pairs checked for AA on page and card. */
export const darkColors: typeof colors = {
  page: '#141311',
  card: '#1D1B18',
  sunk: '#272420',
  ink: '#F2EEE4',
  muted: '#A39B8C',
  line: '#38342D',
  accent: '#CF3428',
  brand: brand.logoColor,
  up: '#3DAE78',
  upText: '#4CC38A',
  down: '#FF6B5E',
  live: '#FF6B5E',
  warn: '#F2C46B',
  warnBg: '#2E2614',
}

export const radius = { s: 8, m: 12, l: 20 }

export type ThemeMode = 'light' | 'dark'
const THEME_KEY = 'hb.theme'

export function initialMode(): ThemeMode {
  try {
    const saved = localStorage.getItem(THEME_KEY)
    if (saved === 'light' || saved === 'dark') return saved
  } catch { /* storage unavailable */ }
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
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

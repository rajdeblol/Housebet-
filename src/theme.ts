/**
 * Housebets theme — the ONE file to swap brand values.
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

export const radius = { s: 8, m: 12, l: 20 }

const hexToChannels = (hex: string) => {
  const h = hex.replace('#', '')
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)).join(' ')
}

export function applyTheme() {
  const root = document.documentElement
  const map: Record<string, string> = {
    page: colors.page, card: colors.card, sunk: colors.sunk, ink: colors.ink, muted: colors.muted,
    line: colors.line, accent: colors.accent, brand: colors.brand, up: colors.up, 'up-text': colors.upText,
    down: colors.down, live: colors.live, warn: colors.warn, 'warn-bg': colors.warnBg,
  }
  for (const [k, v] of Object.entries(map)) root.style.setProperty(`--${k}`, hexToChannels(v))
  root.style.setProperty('--font-sans', brand.fontFamily)
}

/** Decimal odds ladder */
export function ladder(o: number) {
  if (o < 1.01) return 1.01
  if (o < 3) return Math.round(o * 100) / 100
  if (o < 5) return Math.round(o * 20) / 20
  if (o < 10) return Math.round(o * 10) / 10
  if (o < 20) return Math.round(o * 2) / 2
  return Math.min(51, Math.round(o))
}

export const toOdds = (p: number, margin: number) => ladder(1 / Math.min(0.995, Math.max(0.0195, p * margin)))

/** Standard normal CDF */
export function phi(x: number) {
  const t = 1 / (1 + 0.3275911 * Math.abs(x) / Math.SQRT2)
  const y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-(x * x) / 2)
  return x >= 0 ? 0.5 * (1 + y) : 0.5 * (1 - y)
}

export const sigmoid = (x: number) => 1 / (1 + Math.exp(-x))
export const logit = (p: number) => Math.log(p / (1 - p))

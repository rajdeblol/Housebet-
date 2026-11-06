import { useEffect, useRef } from 'react'
import { actions, useStore } from '../engine/store'

const KEY = 'hb.price-alerts.v1'

export interface PriceAlert { matchId: string; selectionLabel: string; baseline: number }
export type PriceAlerts = Record<string, PriceAlert>

export function readPriceAlerts(): PriceAlerts {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(KEY) ?? '{}')
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed as PriceAlerts : {}
  } catch { return {} }
}

function writePriceAlerts(alerts: PriceAlerts) {
  try {
    localStorage.setItem(KEY, JSON.stringify(alerts))
    window.dispatchEvent(new Event('hb-price-alerts-change'))
  } catch { /* storage unavailable */ }
}

export function togglePriceAlert(id: string, alert: PriceAlert) {
  const alerts = readPriceAlerts()
  const enabled = !alerts[id]
  if (enabled) alerts[id] = alert
  else delete alerts[id]
  writePriceAlerts(alerts)
  return enabled
}

/** One-shot local demo alerts fire on the next simulated odds movement. */
export function PriceAlertWatcher() {
  const markets = useStore((s) => s.markets)
  const previous = useRef<Record<string, number> | null>(null)

  useEffect(() => {
    const current: Record<string, number> = {}
    for (const market of Object.values(markets)) for (const selection of market.selections) current[selection.id] = selection.odds
    const before = previous.current
    previous.current = current
    if (!before) return

    const alerts = readPriceAlerts()
    let changed = false
    for (const [id, alert] of Object.entries(alerts)) {
      const oldPrice = before[id], newPrice = current[id]
      if (oldPrice === undefined || newPrice === undefined || newPrice === alert.baseline || oldPrice === newPrice) continue
      actions.toast(`${alert.selectionLabel} moved ${alert.baseline.toFixed(2)} → ${newPrice.toFixed(2)}. Demo price alert.`)
      delete alerts[id]
      changed = true
    }
    if (changed) writePriceAlerts(alerts)
  }, [markets])

  return null
}

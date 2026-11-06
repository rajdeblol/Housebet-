import { Download, Share2 } from 'lucide-react'
import { useRef, useState } from 'react'
import { toPng } from 'html-to-image'
import { actions } from '../../engine/store'
import type { Bet } from '../../engine/types'
import { cx, fmtOdds } from '../../lib/format'
import { BetCard, type CardSport } from './BetCard'

const labels: Record<CardSport, string> = {
  football: 'Football', basketball: 'Basketball', tennis: 'Tennis', americanfootball: 'NFL', baseball: 'Baseball', icehockey: 'Hockey', cricket: 'Cricket', mma: 'MMA',
}

export function BetCardPanel({ bet, reveal = false }: { bet: Bet; reveal?: boolean }) {
  const ref = useRef<HTMLDivElement>(null)
  const [sport, setSport] = useState<CardSport>(bet.sport)
  const styles = Array.from(new Set<CardSport>([bet.sport, 'football', 'basketball', 'tennis'])).map((id) => ({ id, label: labels[id] }))
  const [saving, setSaving] = useState(false)

  const save = async () => {
    if (!ref.current) return
    setSaving(true)
    try {
      const url = await toPng(ref.current, { pixelRatio: 3, cacheBust: true, backgroundColor: `rgb(${getComputedStyle(document.documentElement).getPropertyValue('--page').trim()})` })
      const a = document.createElement('a')
      a.href = url
      a.download = `housebets-${bet.id}.png`
      a.click()
      actions.toast('Bet card saved as an image.')
    } catch {
      actions.toast("Couldn't create the image. Try again.")
    } finally {
      setSaving(false)
    }
  }

  const share = async () => {
    const url = `${window.location.origin}${import.meta.env.BASE_URL}bets?card=${bet.id}`
    const text = `${bet.pick} @ ${fmtOdds(bet.odds)} · ${bet.home} v ${bet.away}`
    if (navigator.share) {
      try { await navigator.share({ title: 'My Housebets single', text, url }); return } catch (e) {
        if ((e as Error).name === 'AbortError') return
      }
    }
    try {
      await navigator.clipboard.writeText(url)
      actions.toast('Link to this bet card copied.')
    } catch {
      actions.toast(`Copy this link: ${url}`)
    }
  }

  return (
    <div className={cx('flex flex-col items-center', reveal && 'reveal-down')}>
      <div role="radiogroup" aria-label="Card style" className="mb-3 inline-flex rounded-s border border-line bg-sunk p-0.5">
        {styles.map((s) => (
          <button key={s.id} type="button" role="radio" aria-checked={sport === s.id} onClick={() => setSport(s.id)}
            className={cx('h-9 rounded-[6px] px-3 text-[12.5px] font-semibold', sport === s.id ? 'bg-card shadow-raised' : 'text-muted hover:text-ink')}>
            {s.label}
          </button>
        ))}
      </div>
      <div className="max-w-full overflow-x-auto"><BetCard ref={ref} bet={bet} sport={sport} /></div>
      <div className="mt-3 grid w-full max-w-[340px] grid-cols-2 gap-2">
        <button type="button" onClick={save} disabled={saving} className="flex h-11 items-center justify-center gap-2 rounded-s border border-ink bg-card text-[14px] font-semibold hover:bg-sunk">
          {saving ? <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-ink/30 border-t-ink" aria-hidden="true" /> : <Download size={16} aria-hidden="true" />} Save image
        </button>
        <button type="button" onClick={share} className="flex h-11 items-center justify-center gap-2 rounded-s bg-ink text-[14px] font-semibold text-white">
          <Share2 size={16} aria-hidden="true" /> Share
        </button>
      </div>
    </div>
  )
}

import { Download, Share2 } from 'lucide-react'
import { useRef, useState } from 'react'
import { toPng } from 'html-to-image'
import { actions } from '../../engine/store'
import type { Bet } from '../../engine/types'
import { cx, fmtOdds } from '../../lib/format'
import { BetCard, type CardSport } from './BetCard'

const labels: Record<CardSport, string> = {
  football: 'Football',
  cricket: 'Cricket',
  basketball: 'Basketball',
  tennis: 'Tennis',
  mma: 'UFC',
  americanfootball: 'NFL',
  baseball: 'MLB',
  icehockey: 'NHL',
}

export function BetCardPanel({ bet, reveal = false }: { bet: Bet; reveal?: boolean }) {
  const ref = useRef<HTMLDivElement>(null)
  const [sport, setSport] = useState<CardSport>(bet.sport)
  const styles = Array.from(
    new Set<CardSport>([bet.sport, 'cricket', 'football', 'basketball', 'tennis', 'mma', 'americanfootball', 'baseball', 'icehockey']),
  ).map((id) => ({ id, label: labels[id] || id }))

  const [saving, setSaving] = useState(false)

  const save = async () => {
    if (!ref.current) return
    setSaving(true)
    try {
      const url = await toPng(ref.current, {
        pixelRatio: 2,
        cacheBust: true,
      })
      const a = document.createElement('a')
      a.href = url
      a.download = `housebets-${sport}-${bet.id}.png`
      a.click()
      actions.toast('Housebets sports card saved as PNG.')
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
      try {
        await navigator.share({ title: 'My Housebets single', text, url })
        return
      } catch (e) {
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
    <div className={cx('flex flex-col items-center w-full max-w-[560px]', reveal && 'reveal-down')}>
      {/* Sport Card Theme Selector Tabs */}
      <div className="mb-3.5 no-scrollbar flex max-w-full items-center gap-1 overflow-x-auto rounded-xl border border-line bg-sunk/60 p-1">
        {styles.map((s) => (
          <button
            key={s.id}
            type="button"
            role="radio"
            aria-checked={sport === s.id}
            onClick={() => setSport(s.id)}
            className={cx(
              'h-8 shrink-0 rounded-lg px-2.5 text-xs font-bold transition-all',
              sport === s.id
                ? 'bg-card text-[#E4372B] shadow-xs'
                : 'text-muted hover:text-ink',
            )}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Rendered 16:9 Official Housebets Card with PNG Background */}
      <div className="w-full flex justify-center">
        <BetCard ref={ref} bet={bet} sport={sport} />
      </div>

      {/* Export & Share Controls */}
      <div className="mt-3.5 grid w-full grid-cols-2 gap-2">
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="flex h-11 items-center justify-center gap-2 rounded-xl border border-line bg-card text-[13px] font-bold text-ink hover:bg-sunk active:scale-98 transition-all"
        >
          {saving ? (
            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-ink/30 border-t-ink" aria-hidden="true" />
          ) : (
            <Download size={16} aria-hidden="true" />
          )}
          Download PNG
        </button>

        <button
          type="button"
          onClick={share}
          className="flex h-11 items-center justify-center gap-2 rounded-xl bg-[#E4372B] text-[13px] font-bold text-white shadow-xs hover:bg-[#CF3428] active:scale-98 transition-all"
        >
          <Share2 size={16} aria-hidden="true" /> Share Card
        </button>
      </div>
    </div>
  )
}

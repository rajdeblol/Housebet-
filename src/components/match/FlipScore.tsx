import { useEffect, useRef, useState } from 'react'
import { cx } from '../../lib/format'

/** Split-flap scoreboard digit: ink tile, paper numerals. */
function FlipDigit({ value, compact }: { value: string; compact: boolean }) {
  const [shown, setShown] = useState(value)
  const [prev, setPrev] = useState(value)
  const [anim, setAnim] = useState(0)
  const first = useRef(true)

  useEffect(() => {
    if (first.current) { first.current = false; return }
    if (value === shown) return
    setPrev(shown)
    setShown(value)
    setAnim(Date.now())
    const t = window.setTimeout(() => setAnim(0), 620)
    return () => window.clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  const len = value.length
  const size = compact
    ? cx('h-9', len > 1 ? 'px-1.5 text-[20px]' : 'w-7 text-[22px]')
    : cx('h-[64px] lg:h-[84px]',
      len === 1 ? 'w-[50px] text-[44px] lg:w-[62px] lg:text-[54px]'
        : len <= 3 ? 'px-2 text-[38px] lg:px-3 lg:text-[50px]'
          : 'px-1.5 text-[22px] lg:px-3 lg:text-[38px]')
  const half = (v: string, pos: 'top' | 'bottom', inFlap = false) => (
    <div className={cx('absolute inset-x-0 overflow-hidden bg-ink', inFlap ? 'inset-y-0' : 'h-1/2', pos === 'top' ? 'top-0 rounded-t-[6px]' : 'bottom-0 rounded-b-[6px]')}>
      <div className={cx('flex h-[200%] items-center justify-center', pos === 'bottom' && '-translate-y-1/2')}>{v}</div>
    </div>
  )
  return (
    <div className={cx('tnum relative font-extrabold leading-none text-page [perspective:300px]', size, anim > 0 && 'score-updated')}>
      <span className="invisible block h-full px-0.5 leading-[inherit]" aria-hidden="true" style={{ lineHeight: 'inherit' }}>{shown.length > 1 ? shown : ''}</span>
      {half(shown, 'top')}
      {half(anim ? prev : shown, 'bottom')}
      {anim ? (
        <>
          <div key={'t' + anim} className="flap flap-top absolute inset-x-0 top-0 h-1/2">{half(prev, 'top', true)}</div>
          <div key={'b' + anim} className="flap flap-bottom absolute inset-x-0 bottom-0 h-1/2">{half(shown, 'bottom', true)}</div>
        </>
      ) : null}
      {/* hinge line */}
      <div className="absolute inset-x-0 top-1/2 h-px -translate-y-px bg-page/25" aria-hidden="true" />
    </div>
  )
}

export function FlipScore({ score, compact = false }: { score: [string, string] | [number, number]; compact?: boolean }) {
  return (
    <div className="flex items-center gap-2" aria-live="polite" aria-label={`Score ${score[0]} to ${score[1]}`}>
      <FlipDigit value={String(score[0])} compact={compact} />
      <span className={cx('font-extrabold text-muted', compact ? 'text-lg' : 'text-3xl')} aria-hidden="true">:</span>
      <FlipDigit value={String(score[1])} compact={compact} />
    </div>
  )
}

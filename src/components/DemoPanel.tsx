import { FlaskConical, Goal, Lock, Shuffle, WifiOff, X, XCircle } from 'lucide-react'
import { useState } from 'react'
import { teams } from '../data/teams'
import { sportById } from '../data/competitions'
import { actions, demoTarget, useStore } from '../engine/store'
import { cx } from '../lib/format'

/** Small panel so judges can trigger every state instantly. */
export function DemoPanel() {
  const [open, setOpen] = useState(false)
  const matches = useStore((s) => s.matches)
  const demo = useStore((s) => s.demo)
  const target = useStore((s) => demoTarget(s))
  const barVisible = useStore((s) => s.slip.items.length > 0 || s.slip.status === 'placed' || s.slip.status === 'placing')
  const live = Object.values(matches).filter((m) => m.status === 'live')
  const tm = target ? matches[target] : null

  const btn = 'flex h-11 w-full items-center gap-2.5 rounded-s border border-line bg-card px-3 text-left text-[14px] font-semibold hover:border-ink disabled:opacity-40'
  const toggle = (on: boolean) => on ? 'flex h-11 w-full items-center gap-2.5 rounded-s border border-ink bg-ink px-3 text-left text-[14px] font-semibold text-white' : btn

  return (
    <div className={cx('fixed right-3 z-50 xl:bottom-4 xl:left-4 xl:right-auto', barVisible ? 'bottom-[84px]' : 'bottom-4')}>
      {open ? (
        <div role="dialog" aria-label="Demo controls" className="slide-in w-[288px] rounded-m border border-line bg-page p-3 shadow-raised">
          <div className="mb-2 flex items-center justify-between">
            <p className="flex items-center gap-2 text-[14px] font-extrabold"><FlaskConical size={16} aria-hidden="true" /> Demo controls</p>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close demo controls" className="flex h-11 w-11 items-center justify-center rounded-s hover:bg-sunk lg:h-8 lg:w-8"><X size={16} aria-hidden="true" /></button>
          </div>
          <label htmlFor="demo-target" className="text-[11px] font-bold uppercase tracking-wider text-muted">Live match</label>
          <select id="demo-target" value={demo.target} onChange={(e) => actions.setTarget(e.target.value)}
            className="mb-3 mt-1 h-11 w-full rounded-s border border-line bg-card px-2 text-[14px] font-semibold lg:h-9">
            <option value="">Auto (match in your slip){tm ? ` · ${teams[tm.home].short} v ${teams[tm.away].short}` : ''}</option>
            {live.map((m) => <option key={m.id} value={m.id}>{sportById[m.sport].name}: {teams[m.home].name} v {teams[m.away].name}</option>)}
          </select>
          <div className="space-y-1.5">
            <button type="button" className="flex h-11 w-full items-center gap-2.5 rounded-s bg-accent px-3 text-left text-[14px] font-bold text-page disabled:opacity-40" disabled={!tm} onClick={() => actions.simulateGoal()}>
              <Goal size={16} aria-hidden="true" /> {!tm || tm.sport === 'football' ? 'Simulate goal' : `Simulate ${sportById[tm.sport].scoreWord.toLowerCase()}`}
            </button>
            {tm && (
              <div className="grid grid-cols-2 gap-1.5">
                <button type="button" className={cx(btn, 'h-9 text-[12.5px]')} onClick={() => actions.simulateGoal(0)}>{teams[tm.home].short}</button>
                <button type="button" className={cx(btn, 'h-9 text-[12.5px]')} onClick={() => actions.simulateGoal(1)}>{teams[tm.away].short}</button>
              </div>
            )}
            <button type="button" className={btn} onClick={actions.shiftOdds}><Shuffle size={16} aria-hidden="true" /> Shift odds</button>
            <button type="button" className={btn} onClick={actions.suspendMarket}><Lock size={16} aria-hidden="true" /> Suspend market</button>
            <button type="button" aria-pressed={demo.failNext} className={toggle(demo.failNext)} onClick={() => actions.setFailNext(!demo.failNext)}>
              <XCircle size={16} aria-hidden="true" /> {demo.failNext ? 'Next bet will fail' : 'Fail next bet'}
            </button>
            <button type="button" aria-pressed={demo.offline} className={toggle(demo.offline)} onClick={() => actions.setOffline(!demo.offline)}>
              <WifiOff size={16} aria-hidden="true" /> {demo.offline ? 'Offline (tap to reconnect)' : 'Go offline'}
            </button>
          </div>
          <p className="mt-2.5 text-[11.5px] leading-snug text-muted">Shift and Suspend act on your slip selections and the match above.</p>
        </div>
      ) : (
        <button type="button" onClick={() => setOpen(true)} aria-label="Open demo controls"
          className="flex h-11 w-11 items-center justify-center gap-2 rounded-full border border-line bg-card lg:w-auto lg:px-4 text-[13px] font-bold shadow-raised hover:border-ink">
          <FlaskConical size={15} aria-hidden="true" /> <span className="hidden lg:inline">Demo</span>
        </button>
      )}
    </div>
  )
}

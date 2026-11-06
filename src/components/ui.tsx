import { Star } from 'lucide-react'
import type { ReactNode } from 'react'
import { teams } from '../data/teams'
import { actions, useStore } from '../engine/store'
import { cx } from '../lib/format'

/** Ultra-clean, modern circular sports crest with team gradients and bold monogram. */
export function Crest({ id, size = 28, className }: { id: string; size?: number; className?: string }) {
  const t = teams[id]
  if (!t) {
    return (
      <div
        style={{ width: size, height: size }}
        className={cx('flex shrink-0 items-center justify-center rounded-full bg-sunk text-[10px] font-bold text-muted', className)}
      >
        —
      </div>
    )
  }

  if (t.logo) {
    return (
      <span
        style={{ width: size, height: size }}
        className={cx('grid shrink-0 place-items-center overflow-hidden rounded-full border border-line bg-white p-0.5', className)}
        role="img"
        aria-label={`${t.name} crest`}
        title={t.name}
      >
        <img src={`${import.meta.env.BASE_URL}${t.logo}`} alt="" width={size} height={size} loading="lazy" decoding="async" className={cx('h-full w-full object-contain', t.id === 'rheinau' && 'brightness-0')} />
      </span>
    )
  }

  const initials = t.short || t.name.slice(0, 3).toUpperCase()
  const fontSize = Math.max(9, Math.round(size * 0.36))

  return (
    <div
      style={{
        width: size,
        height: size,
        background: `linear-gradient(135deg, ${t.primary} 0%, ${t.secondary} 100%)`,
      }}
      className={cx(
        'relative flex shrink-0 items-center justify-center rounded-full border border-black/15 text-white select-none overflow-hidden',
        className
      )}
      title={t.name}
      aria-label={`${t.name} crest`}
    >
      {/* Glossy lighting reflection */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/30 via-transparent to-black/25" />
      
      {/* Team monogram letters */}
      <span
        style={{ fontSize }}
        className="relative z-10 font-black tracking-tighter drop-shadow-md"
      >
        {initials}
      </span>
    </div>
  )
}

export function LiveDot({ className }: { className?: string }) {
  return <span className={cx('inline-block h-2 w-2 rounded-full bg-live live-dot', className)} aria-hidden="true" />
}

export function FollowButton({ kind, id, label, size = 'sm' }: { kind: 'teams' | 'comps'; id: string; label: string; size?: 'sm' | 'md' }) {
  const on = useStore((s) => s.follows[kind].includes(id))
  return (
    <button
      type="button"
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); actions.toggleFollow(kind, id) }}
      aria-pressed={on}
      aria-label={on ? `Unfollow ${label}` : `Follow ${label}`}
      title={on ? `Following ${label}` : `Follow ${label}`}
      className={cx(
        'inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg border text-[13px] font-semibold transition-colors',
        size === 'md' ? 'h-9 px-3' : 'h-8 w-8',
        on ? 'border-ink bg-ink text-white' : 'border-line bg-card text-ink hover:border-ink',
      )}
    >
      <Star size={13} strokeWidth={2.4} fill={on ? 'currentColor' : 'none'} aria-hidden="true" />
      {size === 'md' && <span>{on ? 'Following' : 'Follow'}</span>}
    </button>
  )
}

export function SectionHeader({ title, icon, right, sub }: { title: ReactNode; icon?: ReactNode; right?: ReactNode; sub?: ReactNode }) {
  return (
    <div className="mb-3.5 flex items-end justify-between gap-3">
      <div className="min-w-0">
        <h2 className="flex items-center gap-2 text-[18px] font-extrabold tracking-tight">{icon}{title}</h2>
        {sub && <p className="mt-0.5 text-[13px] text-muted">{sub}</p>}
      </div>
      {right}
    </div>
  )
}

export function EmptyState({ icon, title, body, children }: { icon: ReactNode; title: string; body: string; children?: ReactNode }) {
  return (
    <div className="rounded-xl border border-dashed border-line bg-card px-5 py-8 text-center">
      <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-sunk text-ink">{icon}</div>
      <p className="font-bold">{title}</p>
      <p className="mx-auto mt-1 max-w-sm text-[13.5px] text-muted">{body}</p>
      {children && <div className="mt-4">{children}</div>}
    </div>
  )
}

export function Sparkline({ values, label }: { values: number[]; label: string }) {
  const w = 44, h = 16, p = 2
  const v = values.slice(-5)
  const min = Math.min(...v), max = Math.max(...v)
  const span = max - min || 1
  const pts = v.map((y, i) => [p + (i * (w - 2 * p)) / Math.max(1, v.length - 1), h - p - ((y - min) / span) * (h - 2 * p)])
  const last = v[v.length - 1], prev = v[v.length - 2] ?? last
  const c = last > prev ? 'rgb(var(--up))' : last < prev ? 'rgb(var(--down))' : 'rgb(var(--muted))'
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} role="img" aria-label={`${label}: last ${v.length} prices ${v.map((x) => x.toFixed(2)).join(', ')}`} className="shrink-0">
      <polyline points={pts.map((q) => q.join(',')).join(' ')} fill="none" stroke="rgb(var(--muted))" strokeWidth="1.25" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={pts[pts.length - 1][0]} cy={pts[pts.length - 1][1]} r="2.2" fill={c} />
    </svg>
  )
}

export function Spinner() {
  return <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white motion-reduce:animate-none" aria-hidden="true" />
}

/** "Updated 3s ago" for live prices; says plainly when prices are frozen offline. */
export function Freshness({ className }: { className?: string }) {
  const now = useStore((s) => s.now)
  const at = useStore((s) => s.pricesAt)
  const offline = useStore((s) => s.demo.offline || s.netOffline)
  const secs = Math.max(0, Math.round((now - at) / 1000))
  const ago = secs <= 1 ? 'just now' : secs < 60 ? `${secs}s ago` : `${Math.floor(secs / 60)}m ago`
  return (
    <span className={cx('tnum text-[12px] font-medium', offline ? 'text-warn' : 'text-muted', className)}>
      {offline ? `Demo prices paused · last update ${ago}` : `Demo · simulated prices · updated ${ago}`}
    </span>
  )
}

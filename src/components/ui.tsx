import { Star } from 'lucide-react'
import type { ReactNode } from 'react'
import { teams } from '../data/teams'
import { actions, useStore } from '../engine/store'
import { cx } from '../lib/format'

/** Original geometric crest for a fictional club. */
export function Crest({ id, size = 24, className }: { id: string; size?: number; className?: string }) {
  const t = teams[id]
  const clip = `crest-${id}`
  const shield = 'M12 1.2 22 4.2v8.6c0 6.6-4.3 11.2-10 13.9C6.3 24 2 19.4 2 12.8V4.2z'
  return (
    <svg width={size} height={(size * 28) / 24} viewBox="0 0 24 28" className={cx('shrink-0', className)} aria-hidden="true">
      <defs><clipPath id={clip}><path d={shield} /></clipPath></defs>
      <g clipPath={`url(#${clip})`}>
        <rect width="24" height="28" fill={t.primary} />
        {t.pattern === 'stripes' && [5, 11, 17].map((x) => <rect key={x} x={x} y="0" width="3" height="28" fill={t.secondary} />)}
        {t.pattern === 'halves' && <rect x="12" y="0" width="12" height="28" fill={t.secondary} />}
        {t.pattern === 'sash' && <path d="M-2 6 6 -2 28 20 20 28z" fill={t.secondary} />}
        {t.pattern === 'hoop' && <rect x="0" y="10" width="24" height="6" fill={t.secondary} />}
        {t.pattern === 'chevron' && <path d="M0 8 12 17 24 8v6L12 23 0 14z" fill={t.secondary} />}
        {t.pattern === 'plain' && <circle cx="12" cy="13" r="4" fill={t.secondary} />}
      </g>
      <path d={shield} fill="none" stroke="rgb(var(--ink))" strokeOpacity=".85" strokeWidth="1.2" />
    </svg>
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
        'inline-flex shrink-0 items-center justify-center gap-1.5 rounded-s border text-[13px] font-semibold',
        size === 'md' ? 'h-11 px-3 lg:h-9' : 'h-11 w-11 lg:h-8 lg:w-8',
        on ? 'border-ink bg-ink text-white' : 'border-line bg-card text-ink hover:border-ink',
      )}
    >
      <Star size={14} strokeWidth={2.4} fill={on ? 'currentColor' : 'none'} aria-hidden="true" />
      {size === 'md' && <span>{on ? 'Following' : 'Follow'}</span>}
    </button>
  )
}

export function SectionHeader({ title, icon, right, sub }: { title: ReactNode; icon?: ReactNode; right?: ReactNode; sub?: ReactNode }) {
  return (
    <div className="mb-3 flex items-end justify-between gap-3">
      <div className="min-w-0">
        <h2 className="flex items-center gap-2 text-[17px] font-bold tracking-tight">{icon}{title}</h2>
        {sub && <p className="mt-0.5 text-[13px] text-muted">{sub}</p>}
      </div>
      {right}
    </div>
  )
}

export function EmptyState({ icon, title, body, children }: { icon: ReactNode; title: string; body: string; children?: ReactNode }) {
  return (
    <div className="rounded-m border border-dashed border-line bg-card px-5 py-8 text-center">
      <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-sunk text-ink">{icon}</div>
      <p className="font-semibold">{title}</p>
      <p className="mx-auto mt-1 max-w-sm text-[14px] text-muted">{body}</p>
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

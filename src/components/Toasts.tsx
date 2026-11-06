import { Undo2, X } from 'lucide-react'
import { actions, useStore } from '../engine/store'
import { cx } from '../lib/format'

export function Toasts() {
  const toast = useStore((s) => s.toast)
  const barVisible = useStore((s) => s.slip.items.length > 0 || s.slip.status === 'placed' || s.slip.status === 'placing')
  if (!toast) return null
  return (
    <div className={cx('pointer-events-none fixed inset-x-0 z-[80] flex justify-center px-3 mobile-toast lg:bottom-6', barVisible ? 'mobile-toast-above-slip' : '')}>
      <div key={toast.id} role="status" className="slide-in pointer-events-auto relative flex min-h-[48px] w-full max-w-[420px] items-center gap-3 overflow-hidden rounded-m bg-ink py-2 pl-4 pr-2 text-[14px] text-white shadow-raised">
        <span className="min-w-0 flex-1">{toast.text}</span>
        {toast.kind === 'undo' ? (
          <button type="button" onClick={actions.undoRemove} className="inline-flex h-11 items-center gap-1.5 rounded-s px-3 font-bold text-white hover:bg-white/10 lg:h-9">
            <Undo2 size={15} aria-hidden="true" /> Undo
          </button>
        ) : (
          <button type="button" onClick={actions.dismissToast} aria-label="Dismiss message" className="flex h-11 w-11 items-center justify-center rounded-s hover:bg-white/10 lg:h-9 lg:w-9">
            <X size={16} aria-hidden="true" />
          </button>
        )}
        {toast.kind === 'undo' && <span className="countdown absolute bottom-0 left-0 h-[3px] w-full bg-accent" aria-hidden="true" />}
      </div>
    </div>
  )
}

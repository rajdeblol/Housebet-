import { Moon, Sun } from 'lucide-react'
import { useState } from 'react'
import { applyTheme, initialMode, saveMode, type ThemeMode } from '../theme'

export function ThemeToggle() {
  const [mode, setMode] = useState<ThemeMode>(() => (document.documentElement.classList.contains('dark') ? 'dark' : initialMode()))
  const next = mode === 'dark' ? 'light' : 'dark'
  return (
    <button
      type="button"
      onClick={() => { applyTheme(next); saveMode(next); setMode(next) }}
      aria-label={`Switch to ${next} mode`}
      title={`Switch to ${next} mode`}
      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-s border border-line bg-card hover:border-ink lg:h-10 lg:w-10"
    >
      {mode === 'dark' ? <Sun size={18} aria-hidden="true" /> : <Moon size={18} aria-hidden="true" />}
    </button>
  )
}

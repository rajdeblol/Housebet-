import { Compass } from 'lucide-react'
import { Link } from 'react-router-dom'
import { EmptyState } from '../components/ui'

export function NotFound() {
  return (
    <EmptyState icon={<Compass size={18} aria-hidden="true" />} title="We couldn't find that page" body="The link may be old, or the match may have finished.">
      <Link to="/" className="inline-flex h-11 items-center rounded-s bg-ink px-4 text-[14px] font-semibold text-white">Back to Sports home</Link>
    </EmptyState>
  )
}

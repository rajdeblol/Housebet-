import { forwardRef } from 'react'
import { TrendingUp, ArrowUpRight, CheckCircle2, Zap } from 'lucide-react'
import { teams } from '../../data/teams'
import type { Bet, SportId } from '../../engine/types'
import { brand, colors } from '../../theme'
import { dateTime, fmtOdds, fmtUSDT } from '../../lib/format'
import { Crest } from '../ui'
import { useStore } from '../../engine/store'

export type CardSport = SportId

const sportTheme: Record<CardSport, { bg: string; line: string; label: string }> = {
  football: { bg: '#103B40', line: 'rgba(2,247,253,.55)', label: 'Football' },
  basketball: { bg: '#153B48', line: 'rgba(2,247,253,.6)', label: 'Basketball' },
  tennis: { bg: '#134553', line: 'rgba(2,247,253,.7)', label: 'Tennis' },
  americanfootball: { bg: '#0E333C', line: 'rgba(2,247,253,.6)', label: 'American football' },
  baseball: { bg: '#163847', line: 'rgba(2,247,253,.65)', label: 'Baseball' },
  icehockey: { bg: '#153944', line: 'rgba(2,247,253,.7)', label: 'Ice hockey' },
  cricket: { bg: '#10413C', line: 'rgba(2,247,253,.6)', label: 'Cricket' },
  mma: { bg: '#183640', line: 'rgba(2,247,253,.5)', label: 'MMA / UFC' },
}

/** Pitch / court markings for the header band. */
function Markings({ sport }: { sport: CardSport }) {
  const c = sportTheme[sport].line
  if (sport === 'football')
    return (
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 360 200" preserveAspectRatio="none" aria-hidden="true">
        <g fill="none" stroke={c} strokeWidth="2">
          <rect x="14" y="14" width="332" height="230" />
          <line x1="180" y1="14" x2="180" y2="244" />
          <circle cx="180" cy="120" r="42" />
          <rect x="14" y="66" width="52" height="108" />
          <rect x="294" y="66" width="52" height="108" />
        </g>
        {[0, 1, 2, 3, 4, 5].map((i) => <rect key={i} x={i * 60} y="0" width="30" height="200" fill="rgba(255,255,255,.035)" />)}
      </svg>
    )
  if (sport === 'basketball')
    return (
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 360 200" preserveAspectRatio="none" aria-hidden="true">
        {[...Array(12)].map((_, i) => <line key={i} x1="0" y1={i * 18} x2="360" y2={i * 18} stroke="rgba(0,0,0,.06)" strokeWidth="1" />)}
        <g fill="none" stroke={c} strokeWidth="2">
          <path d="M40 200 A140 140 0 0 1 320 200" />
          <rect x="130" y="110" width="100" height="90" />
          <circle cx="180" cy="110" r="34" />
          <line x1="0" y1="14" x2="360" y2="14" />
        </g>
      </svg>
    )
  if (sport === 'americanfootball')
    return (
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 360 200" preserveAspectRatio="none" aria-hidden="true">
        <g stroke={c} strokeWidth="2">
          {[...Array(11)].map((_, i) => <line key={i} x1={20 + i * 32} y1="0" x2={20 + i * 32} y2="200" />)}
          {[...Array(11)].map((_, i) => <line key={'h' + i} x1={20 + i * 32 - 5} y1="70" x2={20 + i * 32 + 5} y2="70" />)}
        </g>
      </svg>
    )
  if (sport === 'baseball')
    return (
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 360 200" preserveAspectRatio="none" aria-hidden="true">
        <g fill="none" stroke={c} strokeWidth="2">
          <path d="M180 190 L270 100 L180 10 L90 100 Z" />
          <path d="M20 200 A240 240 0 0 1 340 200" />
          <circle cx="180" cy="100" r="10" />
        </g>
      </svg>
    )
  if (sport === 'icehockey')
    return (
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 360 200" preserveAspectRatio="none" aria-hidden="true">
        <g fill="none" stroke={c} strokeWidth="2">
          <rect x="10" y="10" width="340" height="180" rx="60" />
          <line x1="180" y1="10" x2="180" y2="190" stroke="rgba(228,55,43,.7)" />
          <line x1="110" y1="10" x2="110" y2="190" />
          <line x1="250" y1="10" x2="250" y2="190" />
          <circle cx="180" cy="100" r="30" />
        </g>
      </svg>
    )
  if (sport === 'cricket')
    return (
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 360 200" preserveAspectRatio="none" aria-hidden="true">
        <g fill="none" stroke={c} strokeWidth="2">
          <ellipse cx="180" cy="100" rx="200" ry="150" />
          <rect x="150" y="25" width="60" height="150" fill="rgba(245,247,247,.12)" stroke={c} strokeWidth="1.5" />
          <line x1="145" y1="50" x2="215" y2="50" />
          <line x1="145" y1="150" x2="215" y2="150" />
          {/* Bowling crease stumps */}
          <line x1="174" y1="48" x2="186" y2="48" stroke="#ffffff" strokeWidth="2.5" />
          <line x1="174" y1="152" x2="186" y2="152" stroke="#ffffff" strokeWidth="2.5" />
        </g>
      </svg>
    )
  if (sport === 'mma')
    return (
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 360 200" preserveAspectRatio="none" aria-hidden="true">
        <g fill="none" stroke={c} strokeWidth="2">
          <path d="M120 10 H240 L320 70 V130 L240 190 H120 L40 130 V70 Z" />
          <path d="M140 40 H220 L270 80 V120 L220 160 H140 L90 120 V80 Z" />
        </g>
      </svg>
    )
  return (
    <svg className="absolute inset-0 h-full w-full" viewBox="0 0 360 200" preserveAspectRatio="none" aria-hidden="true">
      <g fill="none" stroke={c} strokeWidth="2">
        <rect x="24" y="20" width="312" height="220" />
        <line x1="60" y1="20" x2="60" y2="240" />
        <line x1="300" y1="20" x2="300" y2="240" />
        <line x1="60" y1="120" x2="300" y2="120" />
        <line x1="180" y1="120" x2="180" y2="240" />
      </g>
    </svg>
  )
}

/** Football: Dynamic Striker striking a volley */
function FootballPose({ shirt, shorts }: { shirt: string; shorts: string }) {
  const skin = '#F5F7F7'
  return (
    <svg viewBox="0 0 170 160" className="h-full w-auto" aria-hidden="true">
      <g stroke={skin} strokeLinecap="round" strokeLinejoin="round" fill="none" opacity=".5" strokeWidth="3">
        <line x1="14" y1="70" x2="40" y2="70" />
        <line x1="8" y1="84" x2="44" y2="84" />
        <line x1="18" y1="98" x2="46" y2="98" />
      </g>
      <g stroke={skin} strokeLinecap="round" strokeLinejoin="round" fill="none" strokeWidth="9">
        <polyline points="80,50 62,66 50,60" />
        <polyline points="102,48 122,58 136,48" />
        <polyline points="96,88 88,116 94,146" />
        <polyline points="86,88 106,108 132,114" />
      </g>
      <polygon points="76,42 106,40 110,80 80,84" fill={shirt} stroke={colors.ink} strokeWidth="2" strokeLinejoin="round" />
      <polygon points="79,80 111,78 113,96 83,98" fill={shorts} stroke={colors.ink} strokeWidth="2" strokeLinejoin="round" />
      <circle cx="93" cy="27" r="11" fill={skin} />
      <path d="M86 146h14" stroke={colors.ink} strokeWidth="6" strokeLinecap="round" />
      <path d="M128 112l8 5" stroke={colors.ink} strokeWidth="6" strokeLinecap="round" />
      <circle cx="150" cy="118" r="10" fill="#fff" stroke={colors.ink} strokeWidth="2" />
      <path d="M150 112l5 3.6-1.9 5.8h-6.2l-1.9-5.8z" fill={colors.ink} />
    </svg>
  )
}

/** Cricket: Dynamic Batsman playing a power stroke with bat, pads, and helmet */
function CricketPose({ shirt, trousers = '#ffffff' }: { shirt: string; trousers?: string }) {
  const skin = '#F5F7F7'
  return (
    <svg viewBox="0 0 170 160" className="h-full w-auto" aria-hidden="true">
      {/* Motion swoosh trails */}
      <g stroke="#ffffff" strokeLinecap="round" opacity=".4" strokeWidth="2">
        <path d="M 35 35 Q 85 15 135 40" fill="none" />
        <path d="M 25 50 Q 80 30 130 55" fill="none" />
      </g>

      {/* Cricket ball flying off the bat */}
      <circle cx="148" cy="38" r="7.5" fill="#02F7FD" stroke="#ffffff" strokeWidth="1.5" />
      <path d="M 143 36 Q 148 38 153 40" stroke="#ffffff" strokeWidth="1.2" strokeDasharray="2,2" fill="none" />

      {/* Cricket Bat in follow-through (raised high, 45 degree angle) */}
      <g transform="rotate(32 105 45)">
        {/* Rubber grip handle */}
        <rect x="102" y="5" width="7" height="26" rx="2" fill="#EAE5D9" stroke="#0B2028" strokeWidth="1.5" />
        <line x1="102" y1="12" x2="109" y2="12" stroke="#0B2028" strokeWidth="1.5" />
        <line x1="102" y1="19" x2="109" y2="19" stroke="#0B2028" strokeWidth="1.5" />
        {/* Willow Wood blade */}
        <polygon points="98,31 113,31 115,85 96,85" fill="#E5B26E" stroke="#0B2028" strokeWidth="2" strokeLinejoin="round" />
        {/* Sweet spot sticker stripe */}
        <line x1="101" y1="52" x2="110" y2="52" stroke="#02F7FD" strokeWidth="3" />
      </g>

      {/* Batsman Back leg */}
      <line x1="68" y1="95" x2="52" y2="132" stroke={trousers} strokeWidth="8" strokeLinecap="round" />
      {/* Batsman Front lunging leg */}
      <line x1="86" y1="95" x2="110" y2="132" stroke={trousers} strokeWidth="8" strokeLinecap="round" />

      {/* White Batting Leg Pads (Knee rolls & straps) */}
      <rect x="42" y="102" width="18" height="38" rx="4" fill="#F8F6F0" stroke="#0B2028" strokeWidth="2" />
      <line x1="43" y1="114" x2="59" y2="114" stroke="#999" strokeWidth="1.5" />
      <line x1="43" y1="125" x2="59" y2="125" stroke="#999" strokeWidth="1.5" />

      <rect x="102" y="102" width="20" height="38" rx="4" fill="#F8F6F0" stroke="#0B2028" strokeWidth="2" />
      <line x1="103" y1="114" x2="121" y2="114" stroke="#999" strokeWidth="1.5" />
      <line x1="103" y1="125" x2="121" y2="125" stroke="#999" strokeWidth="1.5" />

      {/* Spiked Cricket Boots */}
      <polygon points="38,140 58,140 56,148 34,148" fill="#fff" stroke="#0B2028" strokeWidth="1.5" />
      <polygon points="100,140 126,140 124,148 98,148" fill="#fff" stroke="#0B2028" strokeWidth="1.5" />

      {/* Torso with Team Jersey */}
      <polygon points="60,52 94,48 90,98 58,98" fill={shirt} stroke="#0B2028" strokeWidth="2" strokeLinejoin="round" />

      {/* Arms & Batting Gloves */}
      <polyline points="64,58 80,44 100,38" fill="none" stroke={skin} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
      <polyline points="88,58 102,46 106,40" fill="none" stroke={skin} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="100" cy="38" r="6" fill="#F8F6F0" stroke="#0B2028" strokeWidth="1.5" />
      <circle cx="106" cy="40" r="6" fill="#F8F6F0" stroke="#0B2028" strokeWidth="1.5" />

      {/* Head with Protective Helmet & Visor */}
      <circle cx="76" cy="34" r="12" fill={shirt} stroke="#0B2028" strokeWidth="2" />
      <path d="M 80 32 L 92 36 L 84 42 Z" fill="#222" opacity="0.9" />
      <line x1="82" y1="37" x2="91" y2="37" stroke="#fff" strokeWidth="1.5" />
      <line x1="81" y1="40" x2="88" y2="40" stroke="#fff" strokeWidth="1.5" />
    </svg>
  )
}

/** Basketball: Soaring player dunking a basketball into the hoop */
function BasketballPose({ jersey, shorts }: { jersey: string; shorts: string }) {
  const skin = '#F5F7F7'
  return (
    <svg viewBox="0 0 170 160" className="h-full w-auto" aria-hidden="true">
      {/* Mini Hoop and net on right */}
      <g stroke="#ffffff" opacity=".4" strokeWidth="2" fill="none">
        <line x1="145" y1="15" x2="145" y2="65" />
        <rect x="142" y="18" width="22" height="18" rx="2" />
        <line x1="128" y1="34" x2="142" y2="34" stroke="#02F7FD" strokeWidth="3" />
        <path d="M 128 34 L 131 52 L 137 52 L 140 34" stroke="#fff" strokeWidth="1.5" strokeDasharray="3,2" />
      </g>

      {/* Basketball in soaring hand */}
      <g transform="translate(116, 18)">
        <circle cx="10" cy="10" r="11" fill="#EA580C" stroke="#0B2028" strokeWidth="1.5" />
        <path d="M 0 10 H 20" stroke="#0B2028" strokeWidth="1.2" />
        <path d="M 10 0 V 20" stroke="#0B2028" strokeWidth="1.2" />
        <path d="M 3 4 Q 10 10 3 16" stroke="#0B2028" strokeWidth="1.2" fill="none" />
        <path d="M 17 4 Q 10 10 17 16" stroke="#0B2028" strokeWidth="1.2" fill="none" />
      </g>

      {/* Soaring Arm to dunk */}
      <polyline points="82,58 102,38 120,28" fill="none" stroke={skin} strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="121" cy="26" r="5" fill={skin} />

      {/* Stabilizing Left arm */}
      <polyline points="58,64 42,74 36,68" fill="none" stroke={skin} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />

      {/* Sleeveless Jersey */}
      <polygon points="56,50 84,48 86,92 54,92" fill={jersey} stroke="#0B2028" strokeWidth="2" strokeLinejoin="round" />
      <path d="M 66 50 Q 70 58 74 50" stroke="#fff" strokeWidth="2" fill="none" />

      {/* Shorts */}
      <polygon points="52,90 88,90 92,114 76,114 70,102 64,114 48,114" fill={shorts} stroke="#0B2028" strokeWidth="2" strokeLinejoin="round" />

      {/* Leaping Legs */}
      <polyline points="56,114 40,132 32,138" fill="none" stroke={skin} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
      <polygon points="26,136 38,136 36,144 22,142" fill="#fff" stroke="#0B2028" strokeWidth="1.5" />

      <polyline points="84,114 96,130 114,136" fill="none" stroke={skin} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
      <polygon points="110,132 124,136 122,144 108,140" fill="#02F7FD" stroke="#0B2028" strokeWidth="1.5" />

      {/* Head with Headband */}
      <circle cx="70" cy="34" r="11" fill={skin} />
      <rect x="60" y="28" width="20" height="4" rx="1.5" fill="#02F7FD" />
    </svg>
  )
}

/** Tennis: Player serving an ace / overhead smash */
function TennisPose({ shirt, shorts }: { shirt: string; shorts: string }) {
  const skin = '#F5F7F7'
  return (
    <svg viewBox="0 0 170 160" className="h-full w-auto" aria-hidden="true">
      {/* Tennis ball */}
      <g transform="translate(124, 14)">
        <circle cx="8" cy="8" r="8" fill="#CCFF00" stroke="#0B2028" strokeWidth="1.5" />
        <path d="M 3 8 Q 8 4 13 8" stroke="#ffffff" strokeWidth="1.5" fill="none" />
        <path d="M 3 8 Q 8 12 13 8" stroke="#ffffff" strokeWidth="1.5" fill="none" />
      </g>

      {/* Racket Smash */}
      <g transform="rotate(-25 106 36)">
        <rect x="104" y="44" width="5" height="28" rx="1.5" fill="#ffffff" stroke="#0B2028" strokeWidth="1.5" />
        <ellipse cx="106.5" cy="26" rx="14" ry="18" fill="none" stroke="#02F7FD" strokeWidth="3" />
        <line x1="99" y1="16" x2="99" y2="36" stroke="#ddd" strokeWidth="1" />
        <line x1="106.5" y1="10" x2="106.5" y2="42" stroke="#ddd" strokeWidth="1" />
        <line x1="114" y1="16" x2="114" y2="36" stroke="#ddd" strokeWidth="1" />
        <line x1="95" y1="22" x2="118" y2="22" stroke="#ddd" strokeWidth="1" />
        <line x1="95" y1="30" x2="118" y2="30" stroke="#ddd" strokeWidth="1" />
      </g>

      <polyline points="78,56 98,41 104,26" fill="none" stroke={skin} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
      <polyline points="60,60 72,36 80,20" fill="none" stroke={skin} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />

      {/* Polo Shirt */}
      <polygon points="54,54 82,50 80,92 52,92" fill={shirt} stroke="#0B2028" strokeWidth="2" strokeLinejoin="round" />
      <polygon points="64,52 72,52 68,64" fill="#ffffff" />

      {/* Shorts */}
      <polygon points="50,90 82,90 84,110 72,110 68,100 62,110 48,110" fill={shorts} stroke="#0B2028" strokeWidth="2" strokeLinejoin="round" />

      {/* Legs */}
      <polyline points="54,110 46,130 40,140" fill="none" stroke={skin} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
      <polygon points="34,138 46,138 44,144 32,144" fill="#fff" stroke="#0B2028" strokeWidth="1.5" />

      <polyline points="78,110 88,128 96,142" fill="none" stroke={skin} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
      <polygon points="92,140 104,140 102,146 90,146" fill="#fff" stroke="#0B2028" strokeWidth="1.5" />

      {/* Head */}
      <circle cx="66" cy="36" r="11" fill={skin} />
      <path d="M 58 32 Q 66 28 74 32" stroke="#02F7FD" strokeWidth="4" fill="none" />
    </svg>
  )
}

/** MMA / UFC: Dynamic High Kick & Fighting Stance */
function MMAPose({ shorts }: { shorts: string }) {
  const skin = '#F5F7F7'
  return (
    <svg viewBox="0 0 170 160" className="h-full w-auto" aria-hidden="true">
      {/* Octagon grid lines in background */}
      <g stroke="#ffffff" opacity=".2" strokeWidth="1.5" fill="none">
        <line x1="20" y1="35" x2="150" y2="35" />
        <line x1="20" y1="65" x2="150" y2="65" />
        <line x1="20" y1="95" x2="150" y2="95" />
        <line x1="55" y1="15" x2="55" y2="115" />
        <line x1="115" y1="15" x2="115" y2="115" />
      </g>

      {/* Standing support leg */}
      <polyline points="62,92 52,120 48,146" fill="none" stroke={skin} strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
      <polygon points="40,144 54,144 52,150 38,150" fill={skin} stroke="#0B2028" strokeWidth="1.5" />

      {/* High Head Kick soaring horizontally */}
      <polyline points="72,86 102,70 138,45" fill="none" stroke={skin} strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
      <polygon points="136,41 146,37 144,49 134,47" fill={skin} stroke="#0B2028" strokeWidth="1.5" />
      <circle cx="146" cy="37" r="6" fill="#02F7FD" opacity=".7" />

      {/* Muscular Torso */}
      <polygon points="48,44 80,42 76,88 50,88" fill={skin} stroke="#0B2028" strokeWidth="2" strokeLinejoin="round" />
      <line x1="58" y1="54" x2="70" y2="54" stroke="#D3CDBE" strokeWidth="2" />
      <line x1="64" y1="54" x2="64" y2="78" stroke="#D3CDBE" strokeWidth="2" />

      {/* Fight Shorts */}
      <polygon points="46,84 80,82 84,106 68,106 63,94 58,106 44,106" fill={shorts} stroke="#0B2028" strokeWidth="2" strokeLinejoin="round" />
      <rect x="46" y="82" width="34" height="4" fill="#0B2028" />

      {/* Guard Arms with 4oz MMA gloves */}
      <polyline points="52,50 42,38 54,30" fill="none" stroke={skin} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="54" cy="30" r="6" fill="#02F7FD" stroke="#0B2028" strokeWidth="1.5" />

      <polyline points="78,48 96,54 112,60" fill="none" stroke={skin} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="112" cy="60" r="6" fill="#02F7FD" stroke="#0B2028" strokeWidth="1.5" />

      {/* Head */}
      <circle cx="64" cy="28" r="10" fill={skin} stroke="#0B2028" strokeWidth="1.5" />
    </svg>
  )
}

/** American Football: Quarterback launching a spiral pass */
function NFLPose({ jersey, pants }: { jersey: string; pants: string }) {
  const skin = '#F5F7F7'
  return (
    <svg viewBox="0 0 170 160" className="h-full w-auto" aria-hidden="true">
      {/* Football in flight */}
      <g transform="translate(122, 22) rotate(-35)">
        <ellipse cx="10" cy="6" rx="10" ry="6" fill="#8A4513" stroke="#0B2028" strokeWidth="1.2" />
        <line x1="4" y1="6" x2="16" y2="6" stroke="#fff" strokeWidth="1.2" />
        <line x1="8" y1="4" x2="8" y2="8" stroke="#fff" strokeWidth="1" />
        <line x1="12" y1="4" x2="12" y2="8" stroke="#fff" strokeWidth="1" />
      </g>
      {/* Throwing arm */}
      <polyline points="76,52 98,34 116,28" fill="none" stroke={skin} strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
      {/* Padded Jersey */}
      <polygon points="50,44 86,40 82,90 48,90" fill={jersey} stroke="#0B2028" strokeWidth="2" strokeLinejoin="round" />
      {/* Helmet with Face mask */}
      <circle cx="68" cy="28" r="12" fill={jersey} stroke="#0B2028" strokeWidth="2" />
      <rect x="74" y="26" width="10" height="8" rx="2" fill="none" stroke="#fff" strokeWidth="1.5" />
      {/* Pants & Cleats */}
      <polygon points="46,88 84,88 86,122 72,122 66,104 60,122 44,122" fill={pants} stroke="#0B2028" strokeWidth="2" strokeLinejoin="round" />
      <polyline points="48,122 42,144" fill="none" stroke={skin} strokeWidth="6" />
      <polygon points="36,142 48,142 46,148 34,148" fill="#0B2028" />
      <polyline points="80,122 88,144" fill="none" stroke={skin} strokeWidth="6" />
      <polygon points="82,142 94,142 92,148 80,148" fill="#0B2028" />
    </svg>
  )
}

/** Baseball: Batter swinging for a home run */
function BaseballPose({ jersey, pants }: { jersey: string; pants: string }) {
  const skin = '#F5F7F7'
  return (
    <svg viewBox="0 0 170 160" className="h-full w-auto" aria-hidden="true">
      {/* Baseball */}
      <circle cx="140" cy="30" r="6" fill="#fff" stroke="#0B2028" strokeWidth="1.2" />
      <path d="M 136 28 Q 140 30 144 28" stroke="#02F7FD" strokeWidth="1" fill="none" />
      {/* Baseball Bat */}
      <g transform="rotate(-40 100 45)">
        <rect x="96" y="10" width="8" height="60" rx="3" fill="#E5B26E" stroke="#0B2028" strokeWidth="1.5" />
        <rect x="98" y="55" width="4" height="20" rx="1" fill="#fff" stroke="#0B2028" strokeWidth="1.5" />
      </g>
      {/* Torso & Helmet */}
      <polygon points="56,48 84,46 80,92 54,92" fill={jersey} stroke="#0B2028" strokeWidth="2" strokeLinejoin="round" />
      <polyline points="66,54 84,48 98,42" fill="none" stroke={skin} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="70" cy="32" r="11" fill={jersey} stroke="#0B2028" strokeWidth="2" />
      <path d="M 74 30 L 86 34 L 78 36 Z" fill={jersey} stroke="#0B2028" strokeWidth="1" />
      {/* Pants & Legs */}
      <polygon points="52,90 82,90 86,124 72,124 68,106 62,124 48,124" fill={pants} stroke="#0B2028" strokeWidth="2" strokeLinejoin="round" />
      <polygon points="42,140 54,140 52,146 40,146" fill="#0B2028" />
      <polygon points="80,140 92,140 90,146 78,146" fill="#0B2028" />
    </svg>
  )
}

/** Ice Hockey: Player with stick on skates */
function HockeyPose({ jersey }: { jersey: string }) {
  const skin = '#F5F7F7'
  return (
    <svg viewBox="0 0 170 160" className="h-full w-auto" aria-hidden="true">
      {/* Puck */}
      <ellipse cx="140" cy="144" rx="8" ry="4" fill="#0B2028" />
      {/* Hockey Stick */}
      <polyline points="94,54 120,118 144,142 152,142" fill="none" stroke="#E5B26E" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      {/* Player body */}
      <polygon points="52,46 86,42 80,92 50,92" fill={jersey} stroke="#0B2028" strokeWidth="2" strokeLinejoin="round" />
      <circle cx="68" cy="28" r="12" fill={jersey} stroke="#0B2028" strokeWidth="2" />
      <rect x="74" y="26" width="8" height="6" fill="#222" />
      {/* Skates */}
      <polyline points="48,122 36,140" fill="none" stroke={skin} strokeWidth="6" />
      <line x1="30" y1="146" x2="48" y2="146" stroke="#999" strokeWidth="2" />
      <polyline points="78,122 92,138" fill="none" stroke={skin} strokeWidth="6" />
      <line x1="86" y1="144" x2="104" y2="144" stroke="#999" strokeWidth="2" />
    </svg>
  )
}

export const BetCard = forwardRef<HTMLDivElement, { bet: Bet; sport?: CardSport }>(function BetCard({ bet, sport = 'football' }, ref) {
  const theme = sportTheme[sport]
  const home = bet.homeId ? teams[bet.homeId] : undefined
  const away = bet.awayId ? teams[bet.awayId] : undefined
  const pickTeam = [home, away].find((t) => t && bet.pick.startsWith(t.name)) ?? home
  const primaryColor = pickTeam?.primary ?? '#888888'
  const secondaryColor = pickTeam?.secondary ?? '#ffffff'

  const ret = bet.status === 'won' || bet.status === 'cashed' ? bet.returned ?? 0 : bet.stake * bet.odds
  const retLabel = bet.status === 'won' ? 'Returned' : bet.status === 'cashed' ? 'Cashed out' : 'Potential return'
  const statusLabel = bet.status === 'open' ? 'Open' : bet.status === 'won' ? 'Won' : bet.status === 'lost' ? 'Lost' : 'Cashed out'
  const liveScore = useStore((s) => (bet.matchId ? s.matches[bet.matchId]?.score : undefined))
  const score = bet.finalScore ?? liveScore ?? [0, 0]

  // Net Profit calculation
  const isSettled = bet.status === 'won' || bet.status === 'cashed'
  const profit = isSettled
    ? (bet.returned ?? 0) - bet.stake
    : bet.stake * bet.odds - bet.stake
  const isProfitPositive = profit > 0

  return (
    <div ref={ref} className="w-[340px] overflow-hidden rounded-2xl border border-line bg-card text-ink shadow-xl" style={{ fontFamily: brand.fontFamily }}>
      {/* Header Band with Pitch/Court Markings & Sport Player Pose */}
      <div className="relative h-[200px] overflow-hidden" style={{ background: theme.bg }}>
        <Markings sport={sport} />
        <div className="relative flex h-full">
          <div className="flex flex-1 flex-col justify-between p-4 text-page z-10">
            <div className="flex items-center gap-2">
              {pickTeam && <span className="rounded-xl bg-page/95 p-1.5 shadow-xs"><Crest id={pickTeam.id} size={32} /></span>}
              <div className="leading-tight">
                <p className="text-[10px] font-black uppercase tracking-[.16em] opacity-85">{theme.label}</p>
                <p className="text-[13px] font-extrabold truncate max-w-[120px]">{bet.compName}</p>
              </div>
            </div>

            <div className="space-y-1.5">
              <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider ${
                bet.status === 'cashed' ? 'bg-warn text-page' :
                bet.status === 'won' ? 'bg-up text-white' :
                bet.status === 'lost' ? 'bg-down text-white' :
                'bg-page text-ink'
              }`}>
                {bet.status === 'cashed' && <Zap size={11} />}
                {bet.status === 'won' && <CheckCircle2 size={11} />}
                {statusLabel}
              </span>

              {isSettled && isProfitPositive && (
                <div className="rounded-lg bg-black/40 backdrop-blur-xs px-2 py-1 text-upText border border-up/40">
                  <p className="text-[9px] font-extrabold uppercase tracking-wider text-upText">Net Profit</p>
                  <p className="text-[15px] font-black tnum leading-none">+{fmtUSDT(profit)} USDT</p>
                </div>
              )}
            </div>
          </div>

          {/* Dynamic Sports Player Pose Graphic */}
          <div className="flex w-[170px] items-end justify-center pb-1">
            {sport === 'cricket' && <CricketPose shirt={primaryColor} trousers={secondaryColor} />}
            {sport === 'football' && <FootballPose shirt={primaryColor} shorts={secondaryColor} />}
            {sport === 'basketball' && <BasketballPose jersey={primaryColor} shorts={secondaryColor} />}
            {sport === 'tennis' && <TennisPose shirt={primaryColor} shorts={secondaryColor} />}
            {sport === 'mma' && <MMAPose shorts={primaryColor} />}
            {sport === 'americanfootball' && <NFLPose jersey={primaryColor} pants={secondaryColor} />}
            {sport === 'baseball' && <BaseballPose jersey={primaryColor} pants={secondaryColor} />}
            {sport === 'icehockey' && <HockeyPose jersey={primaryColor} />}
          </div>
        </div>
      </div>

      {/* Body: Pick details, Profit Section, Stake & Return */}
      <div className="p-4 space-y-3.5">
        <div className="flex items-center justify-between text-xs text-muted font-semibold">
          <span className="truncate max-w-[220px]">{bet.home} v {bet.away}</span>
          {score && <span className="tnum font-extrabold text-ink">{score[0]} - {score[1]}</span>}
        </div>

        <div className="flex items-end justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted">{bet.marketName}</p>
            <p className="truncate text-[20px] font-black leading-tight tracking-tight">{bet.pick}</p>
          </div>
          <p className="tnum rounded-lg bg-ink px-2.5 py-1 text-[22px] font-black leading-none text-page">
            {fmtOdds(bet.odds)}
          </p>
        </div>

        {/* High-visibility Profit Section */}
        {isSettled ? (
          <div className={`flex items-center justify-between rounded-xl p-3 border ${
            isProfitPositive
              ? 'bg-up/15 border-up/40 text-upText'
              : 'bg-down/10 border-down/30 text-down'
          }`}>
            <div className="flex items-center gap-2">
              <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                isProfitPositive ? 'bg-up/15 text-upText' : 'bg-down/15 text-down'
              }`}>
                {isProfitPositive ? <TrendingUp size={18} /> : <ArrowUpRight size={18} className="rotate-90" />}
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-wider opacity-80">
                  {bet.status === 'cashed' ? 'Cashed Out Profit' : isProfitPositive ? 'Winning Net Profit' : 'Settled Net'}
                </p>
                <p className="text-[18px] font-black tnum leading-tight">
                  {isProfitPositive ? `+${fmtUSDT(profit)}` : `-${fmtUSDT(Math.abs(profit))}`} USDT
                </p>
              </div>
            </div>
            {isProfitPositive && (
              <span className="rounded-full bg-up/15 px-2 py-0.5 text-[10px] font-black">
                +{((profit / bet.stake) * 100).toFixed(0)}% ROI
              </span>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-between rounded-xl bg-sunk/60 border border-line p-2.5 text-xs">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted">Potential Profit</p>
              <p className="text-[15px] font-black tnum text-upText">
                +{fmtUSDT(profit)} <span className="text-[10px] text-muted">USDT</span>
              </p>
            </div>
            <span className="rounded-md bg-card border border-line px-2 py-0.5 text-[10px] font-bold text-muted">
              Live Single
            </span>
          </div>
        )}

        {/* Stake & Return grid */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="rounded-xl border border-line bg-sunk/40 px-3 py-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted">Stake</p>
            <p className="tnum text-[15px] font-extrabold">{fmtUSDT(bet.stake)} <span className="text-[10px] text-muted">USDT</span></p>
          </div>
          <div className="rounded-xl border border-line bg-sunk/40 px-3 py-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted">{retLabel}</p>
            <p className="tnum text-[15px] font-extrabold text-accent">{fmtUSDT(ret)} <span className="text-[10px] text-muted">USDT</span></p>
          </div>
        </div>

        {/* Bet ID and Timestamp */}
        <div className="flex items-center justify-between border-t border-dashed border-line pt-2.5 text-[11px]">
          <span className="tnum font-bold text-muted">{bet.id}</span>
          <span className="text-muted">{dateTime(bet.placedAt)}</span>
        </div>

        {/* Housebets wordmark & singles badge */}
        <div className="flex items-center justify-between pt-1">
          <img src={`${import.meta.env.BASE_URL}housebets-logo.svg`} alt="Housebets" className="h-[16px] w-auto" />
          <span className="text-[10px] font-medium text-muted">Single Bet · 18+ Play Responsibly</span>
        </div>
      </div>
    </div>
  )
})

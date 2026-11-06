# Housebets Sportsbook — "Paper scoreboard" prototype

A frontend-only sportsbook prototype for the Housebets Sportsbook Design Contest.
Singles only, decimal odds, stakes in USDT. All teams, players and data are fictional sample data. No backend, no login, no real money.

**Sports:** Football (Premier League, Champions League, LaLiga, Serie A, Bundesliga), Basketball (NBA), American football (NFL), Baseball (MLB), Ice hockey (NHL), Cricket (T20), MMA (UFC Fight Night) and Tennis (ATP Tour). Competition names only; every club, player and fighter is invented.

**Light and dark mode:** the toggle is in the header. The choice is remembered, and the system setting is used on first visit.

## Run it

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # static site in dist/
npm run preview   # serve the production build
```

## Deploy

- **Netlify:** connect the repo or drag `dist/` in. `netlify.toml` and `public/_redirects` are included so routes like `/match/har-red` work on refresh.
- **Vercel:** import the repo (framework: Vite). `vercel.json` rewrites all routes to `index.html`.

## Pages

| Page | Route |
| --- | --- |
| Sports home | `/` |
| Live | `/live` |
| Football | `/football` (anchors: `#epl`, `#ucl`, `#laliga`, `#seriea`, `#bundesliga`) |
| Other sports | `/sport/basketball`, `/sport/americanfootball`, `/sport/baseball`, `/sport/icehockey`, `/sport/cricket`, `/sport/mma`, `/sport/tennis` |
| Match page | `/match/:id`, for example `/match/har-red`, `/match/cbc-ivf` (NBA), `/match/scc-mnr` (cricket), `/match/mor-okh` (UFC). Add `?group=corners` to open a group. |
| Bet slip + My bets | `/bets` holds the slip and My bets on one page. The slip is also a right rail on desktop and a bottom bar that opens into a sheet on mobile. |

Football market groups: Popular, Goals, Halves, Handicaps, Goalscorers, Corners & cards.
Other sports: Popular plus Spreads & totals, Runs & wickets, Method of victory or Games.

## Demo controls (bottom-left "Demo" button)

- **Simulate goal:** the score flips, related markets lock for 5 seconds, then reopen at new prices. Slip selections on that match then show "Odds changed". On other sports the same button becomes Simulate touchdown, basket, run, six, knockdown or break.
- **Shift odds:** moves prices on your slip selections and the chosen match.
- **Suspend market:** pauses your slip markets and the match result for 8 seconds.
- **Fail next bet:** the next placement fails with Retry. Your stake is not taken.
- **Go offline:** shows the offline banner, freezes prices and blocks placing.
- **Market closed after kick-off:** add a pre-match price from Atlético Varena v CD Montalbo, which kicks off about 4 minutes after load.

## Structure

```
src/
  theme.ts            ONE file for brand name, logo colour, palette, font
  data/               fictional teams, competitions, fixtures
  engine/
    pricing.ts        football: Poisson goals model -> every market; dispatches other sports
    multisport.ts     NBA/NFL/MLB/NHL margin model, T20 chase model, UFC finish hazard, tennis set/match maths + live sims
    store.ts          clock, odds drift, suspensions, goals, settlement, slip + bet actions
    types.ts
  components/         layout, odds button, match row, search, demo panel, toasts
    match/            flip score, timeline, market card
    slip/             bet slip, slip item, mobile bar + sheet
    card/             shareable bet card (PNG export + share)
  pages/              Home, Live, Football, Match, MyBets
```

## Brand swap

The Housebets brand pack wasn't available when this was built (the contest page blocks automated access), so `src/theme.ts` uses the brief's fallbacks: logo red `#E4372B` and Inter. Replace `brand` and `colors` there, and the SVG mark in `src/components/Logo.tsx`. Two shades are deepened for WCAG AA text contrast:

- The accent fill is `#CF3428`, so white text on it is 5.0:1.
- Odds-up text is `#19774C`.

`#1E8E5A` is still used for up-flashes and arrows.

## Accessibility and motion

- Visible focus rings, aria-labels on icon buttons, and 44px tap targets on mobile.
- Tabular numbers everywhere, so odds changes don't shift the layout.
- `prefers-reduced-motion` turns off the flips, shutters, slides and pulse.

## Tools used

Built with Vite, React, TypeScript, Tailwind CSS, lucide-react, html-to-image and Inter (via @fontsource). Designed and coded with the help of Claude (Anthropic).

## Big idea (submission paragraph)

Housebets in "paper scoreboard" style: a calm, readable sportsbook on warm paper, where prices and scores are the heroes and every state explains itself in one plain sentence. Paused, closed, odds changed, failed, offline or placed — you always know what happened and what to do next. Then one goal makes the whole screen react: the score flips like a stadium board, related markets shutter for five seconds, prices tick back in green and red, and your slip asks you to accept the new odds before anything is placed. Every bet ends as a shareable card.

<div align="center">

<img src="./public/banner.svg" alt="Housebets Sportsbook Banner" width="100%" />

<br/>

[![Contest](https://img.shields.io/badge/CONTEST%20LABS-SPORTSBOOK%20DESIGN-00D5D5?style=for-the-badge&logo=target)](https://www.housebets.com/contests/sportsbook-design)
[![Prize Pool](https://img.shields.io/badge/PRIZE%20POOL-%2415%2C000%20USD-FFD700?style=for-the-badge&logo=cashapp&logoColor=000000)](https://www.housebets.com/contests/sportsbook-design)
[![Prototype](https://img.shields.io/badge/PROTOTYPE-CLICKABLE%20LIVE-00D26A?style=for-the-badge&logo=statuspage&logoColor=white)](https://housebet-steel.vercel.app/)
[![Format](https://img.shields.io/badge/FORMAT-SINGLES%20ONLY-61DAFB?style=for-the-badge&logo=react&logoColor=000000)](https://housebet-steel.vercel.app/)
[![License](https://img.shields.io/badge/LICENSE-MIT-38B2AC?style=for-the-badge)](./LICENSE)

<br/>

### 🎮 **[👉 Click Here to Launch Live Interactive Prototype](https://housebet-steel.vercel.app/)**

*Official submission for the [Housebets Contest Labs: Sportsbook Design Contest](https://www.housebets.com/contests/sportsbook-design).*

[Live Demo](https://housebet-steel.vercel.app/) • [The Big Idea](#-the-big-idea) • [5-Page Breakdown](#-pages--routes) • [Sports Coverage](#-multi-sport-coverage) • [Demo Controls](#-interactive-judge-controls) • [Technical Specs](#-technical-specifications)

</div>

---

## 💡 The Big Idea: "Every state explains itself"

> A calm, readable sportsbook where prices and scores are the heroes and every state explains itself in one plain sentence: suspended, odds changed, closed, failed, offline or placed. You always know what happened and what to do next.
>
> One goal makes the whole screen react: the score flips like a stadium board, related markets are suspended for a few seconds, prices tick back in green and red, and your slip asks you to accept the new odds before anything is placed. Every bet ends as a shareable card.

* **Singles only**: each pick is its own bet with its own stake, decimal odds and stakes in USDT.
* **Two original looks**: cool scoreboard light mode and a dark navy-teal mode, switchable in the header.
* **Sample data only**: football clubs and IPL teams use real names and crests; fixtures, scores, player names, other seeded teams, the demo wallet and prices are simulated in the browser. No real money.
* **Football crest assets**: bundled locally under `public/team-logos/` from the API-Sports team-logo CDN, whose documented URL format is `https://media.api-sports.io/football/teams/{team_id}.png`.
* **IPL crest assets**: bundled locally under `public/cricket-team-logos/` from the official IPL team-logo CDN. Team names are listed on [iplt20.com/teams](https://www.iplt20.com/teams).

---

## 🗺 Pages & Routes

| Page | Route | Description |
| :--- | :--- | :--- |
| **Sports Home** | `/` | Hero live in-play ticker, top competitions, starting soon |
| **Live In-Play** | `/live` | Real-time match filter, mechanical split-flap scoreboards, live clock |
| **Football Hub** | `/football` | Anchors: `#epl`, `#ucl`, `#laliga`, `#seriea`, `#bundesliga` |
| **Other Sports** | `/sport/:sport` | Dedicated hubs for Basketball, NFL, Baseball, NHL, Cricket, MMA, Tennis |
| **Match Centre** | `/match/:id` | Deep markets (e.g. `/match/har-red`), timeline events, odds trend sparklines |
| **Slip & My Bets** | `/bets` | Consolidated slip + ledger, USDT stakes, cashout engine, PNG bet card export |

---

## 🏆 Multi-Sport Coverage

Comprehensive multi-sport mathematical engines and custom markets:

* ⚽ **Football**: Premier League, Champions League, LaLiga, Serie A, Bundesliga (1X2, Over/Under Goals, Corners, Cards, Halves).
* 🏀 **Basketball (NBA)**: Spreads, totals, moneyline, live quarter trackers.
* 🏈 **American Football (NFL)**: Touchdown simulators, spreads, game clocks.
* ⚾ **Baseball (MLB)**: Runlines, totals, innings tracker.
* 🏒 **Ice Hockey (NHL)**: Puck line, 3-period countdown.
* 🏏 **Cricket (T20)**: Run chase projections, over-by-over live scoreboards.
* 🥊 **MMA (UFC Fight Night)**: Method of victory, round betting, finish hazards.
* 🎾 **Tennis (ATP Tour)**: Set/game math, break point momentum indicators.

---

## 🎮 Interactive Judge Controls

Open the built-in **Demo panel** (bottom-left "Demo" button) to simulate live events on demand:

* ⚽ **Simulate Goal / Event**: The score flips on stadium split-flap boards, related markets lock for 5 seconds, and reopened prices update with green/red ticks. *(Context-aware: becomes Simulate Touchdown, Basket, Run, Six, Knockdown, or Break on other sports!)*
* 📈 **Shift Odds**: Dynamically drifts active prices on your slip and chosen match to test slip re-confirmation.
* ⏸ **Suspend Market**: Pauses markets with an animated shutter (`Back soon`) for 8 seconds.
* ⚠️ **Fail Next Bet**: Simulates transient placement network error with a 1-click Retry (stake safely preserved).
* 📴 **Go Offline**: Shows offline banner, freezes tickers, and disables ticket submission.
* ⏱ **Market Closed After Kick-Off**: Test pre-match market expiration dynamically.

---

## 🚀 Quick Start (Local Development)

```bash
# Clone the repository
git clone https://github.com/rajdeblol/Housebet-.git
cd Housebet-

# Install dependencies
npm install

# Run Vite development server
npm run dev       # http://localhost:5173

# Build static production bundle
npm run build     # Outputs to dist/

# Preview production build
npm run preview   # http://localhost:4173
```

---

## 📦 Technical Specifications

<details>
<summary><b>🔍 View Engine Architecture & Directory Structure</b></summary>
<br/>

```text
src/
├── theme.ts            # Central brand configuration: logo, colors, font tokens
├── data/               # Teams, competitions, and fixture schedules
│   ├── competitions.ts
│   ├── matches.ts
│   ├── otherMatches.ts
│   └── teams.ts
├── engine/             # Sports simulation & financial math
│   ├── pricing.ts      # Football Poisson model -> market generation & dispatch
│   ├── multisport.ts   # NBA/NFL/MLB/NHL margin models, T20 chase math, UFC hazard rates
│   ├── store.ts        # Global reactive store: clocks, odds drift, slip, settlement
│   ├── odds.ts         # Decimal odds calculations & formatting
│   └── types.ts        # Comprehensive TypeScript definitions
├── components/         # Modular UI component system
│   ├── match/          # Flip scoreboards, match timeline, market cards
│   ├── slip/           # Bet slip, slip item cards, mobile sheet
│   ├── card/           # Shareable bet card (HTML-to-Image PNG export + Web Share)
│   ├── MatchRow.tsx    # Responsive fixture row with 1-click odds buttons
│   ├── DemoPanel.tsx   # Floating interactive judge simulation suite
│   ├── Layout.tsx      # Responsive header, sports navigation, theme toggle
│   └── ThemeToggle.tsx # Light/dark mode controller
└── pages/              # Route views (Home, Live, Football, Sport, Match, Bets)
```

</details>

<details>
<summary><b>🎨 Brand Palette & Accessibility</b></summary>
<br/>

- **Palette**: Housebets cyan `#02F7FD` on navy-teal surfaces (`#061316`, `#0B2028`, `#102831`); selected odds and primary actions use turquoise.
- **Odds Indicators**: `#32C48D` (up) and `#FF7068` (down), with text labels alongside price movement.
- **Accessible Interactions**: 44px minimum tap targets on mobile, visible focus rings, and aria-labels on icon controls.
- **Tabular Numerics**: `tnum` typography throughout so changing odds never cause jitter or layout reflow.
- **Reduced Motion**: Full support for `prefers-reduced-motion` to smoothly disable flips and shutters.

</details>

<details>
<summary><b>🌐 Production Deployment & GitHub Actions</b></summary>
<br/>

This repository includes continuous deployment:
- **GitHub Pages Workflow** (`.github/workflows/pages.yml`): Automatically compiles TypeScript and publishes to GitHub Pages on every push to `main`.
- **Netlify**: `netlify.toml` and `public/_redirects` included for single-page routing rewrites.
- **Vercel**: `vercel.json` pre-configured with client rewrites to `index.html`.

</details>

---

## ⚖️ Contest Submission & License

* **Contest**: [Housebets Contest Labs — Sportsbook Design ($15,000 USD)](https://www.housebets.com/contests/sportsbook-design)
* **Submitted By**: [@rajdeblol](https://github.com/rajdeblol)
* **License**: [MIT](./LICENSE)

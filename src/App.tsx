import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { HomePage } from './pages/Home'
import { LivePage } from './pages/Live'
import { FootballPage } from './pages/Football'
import { MatchPage } from './pages/Match'
import { SportPage } from './pages/Sport'
import { MyBetsPage } from './pages/MyBets'
import { NotFound } from './pages/NotFound'

export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, '')}>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="live" element={<LivePage />} />
          <Route path="football" element={<FootballPage />} />
          <Route path="sport/:sportId" element={<SportPage />} />
          <Route path="match/:id" element={<MatchPage />} />
          <Route path="bets" element={<MyBetsPage />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

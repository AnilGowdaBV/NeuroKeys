import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { LandingPage } from './pages/LandingPage'
import { ModeSelection } from './pages/ModeSelection'
import { TypingPage } from './pages/TypingPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/modes" element={<ModeSelection />} />
        <Route path="/type" element={<TypingPage />} />
      </Routes>
    </BrowserRouter>
  )
}

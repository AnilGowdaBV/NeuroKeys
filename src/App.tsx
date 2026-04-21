import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom'
import { LandingPage } from './pages/LandingPage'
import { ModeSelection } from './pages/ModeSelection'
import { TypingPage } from './pages/TypingPage'
import { Chatbot } from './components/Chatbot/Chatbot'

function AppContent() {
  const location = useLocation()
  const isLandingPage = location.pathname === '/'

  return (
    <>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/modes" element={<ModeSelection />} />
        <Route path="/type" element={<TypingPage />} />
      </Routes>
      {!isLandingPage && <Chatbot />}
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  )
}

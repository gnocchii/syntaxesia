import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import ExhibitionPage from './pages/ExhibitionPage'
import ArtworkDetail from './pages/ArtworkDetail'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/exhibition" element={<ExhibitionPage />} />
        <Route path="/artwork/:id" element={<ArtworkDetail />} />
      </Routes>
    </Router>
  )
}

export default App

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ArtProvider } from './lib/ArtContext'
import LandingPage from './pages/LandingPage'
import ExhibitionPage from './pages/ExhibitionPage'
import ArtworkDetail from './pages/ArtworkDetail'

function App() {
  return (
    <Router>
      <ArtProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/exhibition" element={<ExhibitionPage />} />
          <Route path="/artwork/:id" element={<ArtworkDetail />} />
        </Routes>
      </ArtProvider>
    </Router>
  )
}

export default App

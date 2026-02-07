import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import ExhibitionPage from './pages/ExhibitionPage'
import ArtworkDetail from './pages/ArtworkDetail'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<ExhibitionPage />} />
        <Route path="/artwork/:id" element={<ArtworkDetail />} />
      </Routes>
    </Router>
  )
}

export default App

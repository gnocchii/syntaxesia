import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react'
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui'
import { SolflareWalletAdapter } from '@solana/wallet-adapter-solflare'
import { clusterApiUrl } from '@solana/web3.js'
import { useMemo } from 'react'
import '@solana/wallet-adapter-react-ui/styles.css'
import { ArtProvider } from './lib/ArtContext'
import LandingPage from './pages/LandingPage'
import ExhibitionPage from './pages/ExhibitionPage'
import ArtworkDetail from './pages/ArtworkDetail'

function App() {
  const endpoint = useMemo(() => clusterApiUrl('devnet'), [])
  const wallets = useMemo(() => [new SolflareWalletAdapter()], [])

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets}>
        <WalletModalProvider>
          <Router>
            <ArtProvider>
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/exhibition" element={<ExhibitionPage />} />
                <Route path="/artwork/:id" element={<ArtworkDetail />} />
              </Routes>
            </ArtProvider>
          </Router>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  )
}

export default App

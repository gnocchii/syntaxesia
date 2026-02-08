import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import {
  PublicKey,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
} from '@solana/web3.js'

// Your Solana wallet address (parsed lazily to avoid crashing on load)
const TREASURY_ADDRESS = 'CtkVDjqHTc6hqzXtsNjFjMHeMT1KruG836M6GC291WEf'

const PRESET_AMOUNTS = [0.01, 0.05, 0.1]

// Hardcoded donation stats — replace with live data later
const TOTAL_DONATIONS = 12
const TOTAL_SOL = 0.42
const DONATION_GOAL = 2 // SOL

export default function TipModal({ isOpen, onClose }) {
  const { connection } = useConnection()
  const { publicKey, sendTransaction, connected, select, wallets, wallet, connect } = useWallet()

  // Once a wallet is selected (via handleConnect), trigger the actual connection
  useEffect(() => {
    if (wallet && !connected) {
      console.log('[TipModal] Wallet selected, attempting connect:', wallet.adapter.name)
      connect().catch((err) => console.error('[TipModal] Connect failed:', err))
    }
  }, [wallet, connected, connect])

  const [amount, setAmount] = useState('')
  const [selectedPreset, setSelectedPreset] = useState(null)
  const [status, setStatus] = useState('idle') // idle | processing | success | error
  const [errorMsg, setErrorMsg] = useState('')
  const [showWalletPicker, setShowWalletPicker] = useState(false)

  const effectiveAmount = selectedPreset ?? (parseFloat(amount) || 0)

  const resetState = useCallback(() => {
    setAmount('')
    setSelectedPreset(null)
    setStatus('idle')
    setErrorMsg('')
    setShowWalletPicker(false)
  }, [])

  const handleClose = useCallback(() => {
    resetState()
    onClose()
  }, [onClose, resetState])

  const handlePresetClick = (val) => {
    setSelectedPreset(val)
    setAmount('')
  }

  const handleCustomAmountChange = (e) => {
    setSelectedPreset(null)
    setAmount(e.target.value)
  }

  const WALLET_OPTIONS = [
    { name: 'Phantom', installUrl: 'https://phantom.app/download' },
    { name: 'Solflare', installUrl: 'https://solflare.com/download' },
  ]

  const handleWalletClick = useCallback(async (walletName, installUrl) => {
    // Find the wallet adapter by name (case-insensitive)
    const found = wallets.find(w =>
      w.adapter.name.toLowerCase() === walletName.toLowerCase() &&
      (w.readyState === 'Installed' || w.readyState === 'Loadable')
    )

    console.log('[TipModal] Wallet click:', walletName, 'Found:', !!found, 'All wallets:', wallets.map(w => `${w.adapter.name}(${w.readyState})`))

    if (found) {
      try {
        select(found.adapter.name)
        // Give select a moment to propagate, then connect directly
        await new Promise(r => setTimeout(r, 200))
        await connect()
      } catch (err) {
        console.error('[TipModal] Connect error:', err)
      }
    } else {
      // Extension not installed — open download page in new tab
      window.open(installUrl, '_blank', 'noopener,noreferrer')
    }
  }, [wallets, select, connect])

  // Check if a wallet extension is installed
  const isWalletInstalled = useCallback((walletName) => {
    return wallets.some(w =>
      w.adapter.name.toLowerCase() === walletName.toLowerCase() &&
      (w.readyState === 'Installed' || w.readyState === 'Loadable')
    )
  }, [wallets])

  const handleSendTip = useCallback(async () => {
    if (!publicKey || effectiveAmount <= 0) return

    setStatus('processing')
    setErrorMsg('')

    try {
      // Convert SOL to lamports (1 SOL = 1,000,000,000 lamports)
      const lamports = Math.round(effectiveAmount * LAMPORTS_PER_SOL)

      // Build a simple SOL transfer transaction
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: new PublicKey(TREASURY_ADDRESS),
          lamports,
        })
      )

      // Send and wait for confirmation
      const signature = await sendTransaction(transaction, connection)
      await connection.confirmTransaction(signature, 'confirmed')

      setStatus('success')
    } catch (err) {
      console.error('[TipModal] Transaction failed:', err)

      if (err.message?.includes('User rejected')) {
        setErrorMsg('Transaction cancelled.')
      } else if (err.message?.includes('insufficient')) {
        setErrorMsg('Insufficient funds in your wallet.')
      } else {
        setErrorMsg('Transaction failed. Please try again.')
      }
      setStatus('error')
    }
  }, [publicKey, effectiveAmount, connection, sendTransaction])

  const progressPercent = Math.min((TOTAL_SOL / DONATION_GOAL) * 100, 100)

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            className="relative w-[90%] max-w-md bg-[#1a1a1a] rounded-2xl p-8 text-white shadow-2xl"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors text-xl leading-none"
            >
              &times;
            </button>

            {status === 'success' ? (
              /* ---- Success state ---- */
              <motion.div
                className="flex flex-col items-center py-6"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <motion.div
                  className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mb-4"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 12 }}
                >
                  <svg className="w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </motion.div>
                <h2 className="text-xl font-light tracking-wide mb-2">Thank You</h2>
                <p className="text-white/50 text-sm text-center">
                  Your tip of {effectiveAmount} SOL has been received.<br />
                  The museum appreciates your generosity.
                </p>
                <button
                  onClick={handleClose}
                  className="mt-6 px-6 py-2 rounded-full bg-white/10 hover:bg-white/20 text-sm transition-colors"
                >
                  Close
                </button>
              </motion.div>
            ) : (
              /* ---- Main tipping interface ---- */
              <>
                <h2 className="text-xl font-light tracking-wide mb-1">
                  Support Syntaxesia
                </h2>
                <p className="text-white/40 text-sm mb-6">
                  Help sustain this digital art museum with a tip.
                </p>

                {/* Wallet connection */}
                {!connected ? (
                  <div className="flex flex-col items-center py-6 gap-4">
                    {!showWalletPicker ? (
                      <>
                        <p className="text-white/50 text-sm">
                          Connect your Solana wallet to leave a tip.
                        </p>
                        <button
                          onClick={() => setShowWalletPicker(true)}
                          className="px-6 py-2.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium transition-colors"
                        >
                          Connect Wallet
                        </button>
                      </>
                    ) : (
                      <>
                        <p className="text-white/50 text-sm">
                          Choose a wallet to connect.
                        </p>
                        <div className="w-full flex flex-col gap-3">
                          {WALLET_OPTIONS.map(({ name, installUrl }) => {
                            const installed = isWalletInstalled(name)
                            return (
                              <button
                                key={name}
                                onClick={() => handleWalletClick(name, installUrl)}
                                className="w-full flex items-center justify-between px-5 py-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-200"
                              >
                                <span className="text-white text-sm font-medium">{name}</span>
                                <span className={`text-xs px-2 py-0.5 rounded-full ${
                                  installed
                                    ? 'bg-green-500/15 text-green-400'
                                    : 'bg-white/10 text-white/40'
                                }`}>
                                  {installed ? 'Connect' : 'Install'}
                                </span>
                              </button>
                            )
                          })}
                        </div>
                      </>
                    )}
                    {status === 'error' && (
                      <p className="text-red-400 text-xs text-center">{errorMsg}</p>
                    )}
                  </div>
                ) : (
                  <>
                    {/* Preset amounts */}
                    <div className="flex gap-3 mb-4">
                      {PRESET_AMOUNTS.map((val) => (
                        <button
                          key={val}
                          onClick={() => handlePresetClick(val)}
                          className={`flex-1 py-2.5 rounded-lg text-sm transition-all duration-200 ${
                            selectedPreset === val
                              ? 'bg-purple-600 text-white shadow-[0_0_12px_rgba(147,51,234,0.3)]'
                              : 'bg-white/10 text-white/70 hover:bg-white/15'
                          }`}
                        >
                          {val} SOL
                        </button>
                      ))}
                    </div>

                    {/* Custom amount */}
                    <div className="relative mb-5">
                      <input
                        type="number"
                        min="0"
                        step="0.001"
                        placeholder="Custom amount"
                        value={amount}
                        onChange={handleCustomAmountChange}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-purple-500/50 transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 text-sm">
                        SOL
                      </span>
                    </div>

                    {/* Error message */}
                    {status === 'error' && (
                      <p className="text-red-400 text-sm mb-3">{errorMsg}</p>
                    )}

                    {/* Send button */}
                    <button
                      onClick={handleSendTip}
                      disabled={effectiveAmount <= 0 || status === 'processing'}
                      className={`w-full py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                        effectiveAmount > 0 && status !== 'processing'
                          ? 'bg-purple-600 hover:bg-purple-500 text-white cursor-pointer'
                          : 'bg-white/10 text-white/30 cursor-not-allowed'
                      }`}
                    >
                      {status === 'processing'
                        ? 'Processing...'
                        : effectiveAmount > 0
                          ? `Send ${effectiveAmount} SOL`
                          : 'Send Tip'}
                    </button>

                    {/* Transaction fee notice */}
                    <p className="text-center text-white/25 text-xs mt-3">
                      ~$0.00025 network transaction fee
                    </p>
                  </>
                )}

                {/* Donation progress bar */}
                <div className="mt-6 pt-5 border-t border-white/10">
                  <div className="flex justify-between text-xs text-white/40 mb-2">
                    <span>{TOTAL_DONATIONS} donations</span>
                    <span>{TOTAL_SOL} / {DONATION_GOAL} SOL</span>
                  </div>
                  <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-purple-500 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${progressPercent}%` }}
                      transition={{ duration: 1, delay: 0.3, ease: 'easeOut' }}
                    />
                  </div>
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

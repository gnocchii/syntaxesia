import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGeneratedArt } from '@/lib/ArtContext'

export default function LandingPage() {
  const [githubUrl, setGithubUrlLocal] = useState('')
  const [status, setStatus] = useState('')
  const navigate = useNavigate()
  const { setGithubUrl } = useGeneratedArt()

  return (
    <main
      className="relative min-h-screen overflow-hidden px-6 py-10 sm:px-10 flex"
      style={{
        background:
          'radial-gradient(circle at 50% 0%, rgba(250,246,238,0.98), rgba(208,190,165,0.98) 52%, rgba(168,145,120,0.98) 100%)',
      }}
    >
      {/* Ambient glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(60% 50% at 50% 25%, rgba(255,255,255,0.45), rgba(255,255,255,0.0) 60%)',
        }}
      />
      {/* Arch */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 mx-auto h-[70vh] max-w-5xl"
        style={{
          borderRadius: '200px 200px 80px 80px',
          boxShadow:
            'inset 0 0 0 2px rgba(255,255,255,0.35), inset 0 -30px 80px rgba(110,85,60,0.25)',
          background:
            'linear-gradient(180deg, rgba(255,255,255,0.5), rgba(210,190,165,0.5) 45%, rgba(160,135,110,0.55) 100%)',
          opacity: 0.7,
          zIndex: 1,
        }}
      />
      {/* Left wall */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-0 w-[18vw] max-w-[220px]"
        style={{
          background:
            'linear-gradient(180deg, rgba(255,255,255,0.85), rgba(175,150,125,0.9))',
          boxShadow:
            'inset -10px 0 25px rgba(0,0,0,0.18), 0 20px 60px rgba(0,0,0,0.18)',
          borderTopRightRadius: '40px',
          zIndex: 2,
        }}
      />
      {/* Right wall */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-0 w-[18vw] max-w-[220px]"
        style={{
          background:
            'linear-gradient(180deg, rgba(255,255,255,0.85), rgba(175,150,125,0.9))',
          boxShadow:
            'inset 10px 0 25px rgba(0,0,0,0.18), 0 20px 60px rgba(0,0,0,0.18)',
          borderTopLeftRadius: '40px',
          zIndex: 2,
        }}
      />
      {/* Bottom gradient */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 left-0 right-0 h-52"
        style={{
          background:
            'linear-gradient(180deg, rgba(0,0,0,0), rgba(90,70,55,0.25) 60%, rgba(70,55,45,0.38) 100%)',
        }}
      />

      <div
        className="relative mx-auto flex w-full max-w-xl flex-1 flex-col items-center gap-6 text-center"
        style={{ zIndex: 3, minHeight: '100%' }}
      >
        <header className="mt-20 space-y-3">
          <h1
            className="font-semibold tracking-[0.34em] text-[#1a1a1a]"
            style={{
              fontSize: 'clamp(2.25rem, 7vw, 5rem)',
              fontFamily: 'Cormorant Garamond, serif',
            }}
          >
            SYNTAXESIA
          </h1>
          <p className="mx-auto max-w-xl text-sm text-[#1a1a1a]/65 sm:text-base">
            Enter a GitHub repository URL and we&apos;ll turn its code into a gallery of abstract art.
          </p>
        </header>

        <section className="flex w-full flex-col gap-3">
          <label
            htmlFor="github-url-input"
            className="text-xs uppercase tracking-[0.3em] text-[#1a1a1a]/60"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            GitHub Repository URL
          </label>
          <input
            id="github-url-input"
            type="url"
            placeholder="https://github.com/owner/repository"
            value={githubUrl}
            onChange={(e) => setGithubUrlLocal(e.target.value)}
            className="mx-auto w-full max-w-[750px] border border-[#1a1a1a]/20 bg-white/90 px-6 py-4 text-sm text-[#1a1a1a] shadow-[0_16px_40px_rgba(28,28,28,0.08)] outline-none transition focus:border-[#1a1a1a]/50"
            style={{
              borderRadius: '28px',
              fontFamily: 'Inter, sans-serif',
              fontSize: '14px',
            }}
          />
          <button
            className="mx-auto inline-flex items-center justify-center rounded-full bg-[#1a1a1a] px-6 py-3 text-sm font-medium text-[#faf6ee] transition hover:-translate-y-0.5 hover:shadow-[0_18px_45px_rgba(28,28,28,0.25)]"
            style={{ fontFamily: 'Inter, sans-serif' }}
            onClick={() => {
              const trimmed = githubUrl.trim()
              if (!trimmed) {
                setStatus('Please enter a GitHub URL.')
                return
              }
              if (!trimmed.startsWith('https://github.com/')) {
                setStatus('Please enter a valid GitHub URL (https://github.com/owner/repo).')
                return
              }
              // Trigger extraction and placard generation in ArtContext
              setGithubUrl(trimmed)
              navigate('/exhibition')
            }}
          >
            Generate Art
          </button>
          {status && (
            <p className="text-center text-xs text-[#1a1a1a]/65">{status}</p>
          )}
        </section>
      </div>
    </main>
  )
}

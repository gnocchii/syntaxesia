import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useGeneratedArt } from '@/lib/ArtContext'
import DecryptedText from '../components/DecryptedText'
import FuzzyText from '../components/FuzzyText'
import Loading from '../components/Loading'
import GlassSearchBar from '../components/GlassSearchBar'

export default function LandingPage() {
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()
  const { setGithubUrl } = useGeneratedArt()

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 3000)
    return () => clearTimeout(timer)
  }, [])

  const handleSearch = (query) => {
    if (!query) return
    setGithubUrl(query)
    navigate('/exhibition')
  }

  if (isLoading) {
    return <Loading />
  }

  return (
    <main className="relative h-screen w-screen overflow-hidden bg-black">
      
      {/* 1. The Mockup Image (Background Frame) */}
      <div className="absolute inset-0 z-0">
        <img 
          src="/landing%20mock%20final.jpg" 
          alt="Vintage Computer Terminal"
          className="h-full w-full object-cover pointer-events-none select-none"
        />
      </div>

      {/* 2. The Screen Content Area (Center) */}
      <div 
        className="absolute z-10 overflow-hidden bg-black"
        style={{
          top: '50%',
          left: '50%',
          width: '47%',
          height: '53%',
          transform: 'translate(-50%, -50%) perspective(1000px) rotateX(0deg) rotateY(0deg)'
        }}
      >
        {/* Background: Video Layer */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <video
            src="/vid%201%20final.mp4"
            autoPlay
            loop
            muted
            playsInline
            className="h-full w-full object-cover opacity-80"
          />
        </div>

        {/* Foreground: UI Layer */}
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 px-4 text-center">
          <motion.div
            className="flex flex-col items-center gap-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="mb-2">
              <FuzzyText 
                baseIntensity={0.2} 
                hoverIntensity={0.5} 
                fontFamily="Alte Haas Grotesk"
                fontWeight="bold"
                fontSize="clamp(2rem, 4vw, 4rem)"
                color="#fff"
              >
                Syntaxesia.
              </FuzzyText>
            </div>
            <DecryptedText
              text="breathe life into your codebase"
              animateOn="view"
              revealDirection="center"
              speed={100}
              maxIterations={40}
              characters="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+"
              parentClassName="inline-block text-white/70 font-['Geist_Mono',monospace] text-[clamp(0.7rem,1.2vw,1rem)] tracking-[0.2em]"
            />
          </motion.div>
          
          <motion.div
            className="w-full max-w-lg mt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
          >
            <GlassSearchBar onSubmit={handleSearch} />
          </motion.div>

          <motion.p
            className="text-white/50 text-[clamp(0.55rem,0.9vw,0.8rem)] tracking-wide mt-3 font-['Geist_Mono',monospace]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.4 }}
          >
            Read our{' '}
            <a
              href="https://github.com/gnocchii/syntaxesia"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 text-white/70 hover:text-white transition-colors"
            >
              GitHub
            </a>
            {' '}or{' '}
            <a
              href="https://devpost.com/software/syntaxesia?ref_content=user-portfolio&ref_feature=in_progress"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 text-white/70 hover:text-white transition-colors"
            >
              Devpost
            </a>
          </motion.p>
        </div>
      </div>

      {/* 3. Left Wall Overlay (Mirrored) */}
      <div 
        className="absolute z-10 overflow-hidden bg-black"
        style={{
          top: '23.7%',
          left: '0%',
          width: '28.5%',
          height: '52.7%',
          transformOrigin: 'right center',
          transform: 'perspective(520px) rotateY(30.7deg) skewY(3.9deg)'
        }}
      >
        <video
          src="/vid%202%20final.mov"
          autoPlay
          loop
          muted
          playsInline
          className="h-full w-full object-cover opacity-80"
        />
      </div>

      {/* 4. Right Wall Overlay */}
      <div 
        className="absolute z-10 overflow-hidden bg-black"
        style={{
          top: '23.7%',
          right: '0%',
          width: '28.5%',
          height: '52.7%',
          transformOrigin: 'left center',
          transform: 'perspective(520px) rotateY(-30.7deg) skewY(-3.9deg)'
        }}
      >
        <video
          src="/vid%203%20final.MP4"
          autoPlay
          loop
          muted
          playsInline
          className="h-full w-full object-cover opacity-80"
        />
      </div>
    </main>
  )
}


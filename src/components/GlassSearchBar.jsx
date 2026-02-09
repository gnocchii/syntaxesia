import React, { useState, useEffect, useRef } from 'react';
import './GlassSearchBar.css';
import DecryptedText from './DecryptedText';

const GITHUB_REPO_REGEX = /^https?:\/\/(www\.)?github\.com\/[\w.-]+\/[\w.-]+/;

const GlassSearchBar = ({ onSubmit }) => {
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState('');
  const inputRef = useRef(null);
  const glassRef = useRef(null);

  const handleClear = () => {
    setInputValue('');
    setError('');
    inputRef.current?.focus();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const val = inputValue.trim();
    if (!val) return;

    if (!GITHUB_REPO_REGEX.test(val)) {
      setError('Please enter a valid GitHub repo link');
      return;
    }

    setError('');
    if (onSubmit) {
      onSubmit(val);
    }
    setInputValue('');
  };

  useEffect(() => {
    const currentRef = glassRef.current;
    const handleMouseMove = (e) => {
      if (!currentRef) return;
      const rect = currentRef.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const specular = currentRef.querySelector('.glass-specular');
      if (specular) {
        specular.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.04) 30%, rgba(255,255,255,0) 60%)`;
      }
    };
    const handleMouseLeave = () => {
      if (!currentRef) return;
      const specular = currentRef.querySelector('.glass-specular');
      if (specular) {
        specular.style.background = 'none';
      }
    };
    currentRef?.addEventListener('mousemove', handleMouseMove);
    currentRef?.addEventListener('mouseleave', handleMouseLeave);
    return () => {
      currentRef?.removeEventListener('mousemove', handleMouseMove);
      currentRef?.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <div className="glass-search-container">
      <form onSubmit={handleSubmit} className="glass-form">
        <div className="glass-input-wrapper" ref={glassRef}>
          {/* SVG Filter for glass distortion */}
          <svg style={{ position: 'absolute', width: 0, height: 0 }}>
            <filter id="glass-distortion">
              <feTurbulence type="fractalNoise" baseFrequency="0.6" numOctaves="1" result="noise" />
              <feDisplacementMap in="SourceGraphic" in2="noise" scale="6" />
            </filter>
          </svg>

          <div className="glass-filter" />
          <div className="glass-overlay" />
          <div className="glass-specular" />

          <div className="glass-content">
            <button type="submit" className="search-button">
              {/* GitHub icon */}
              <svg className="search-icon w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
            </button>
            <input
              ref={inputRef}
              type="text"
              placeholder=""
              className="search-input"
              value={inputValue}
              onChange={(e) => { setInputValue(e.target.value); setError(''); }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSubmit(e);
              }}
            />
            {!inputValue && (
              <div className="placeholder">
                <DecryptedText text="paste your repo here..." animateOn="view" sequential={true} speed={50} />
              </div>
            )}
            {inputValue && (
              <button type="button" className="search-clear" aria-label="Clear search" onClick={handleClear}>
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {error && (
          <p className="glass-error">{error}</p>
        )}
      </form>
    </div>
  );
};

export default GlassSearchBar;

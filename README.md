# Syntaxesia

> Where code becomes art

A post-modern art museum where GitHub repositories are transformed into curated art exhibitions. Built with React, Vite, Tailwind CSS, and Framer Motion.

## 🎨 Aesthetic

Ancient Roman/neoclassical architecture meets modern museum. Think the Great Hall at the Metropolitan Museum of Art — grand stone columns, arched ceilings, marble textures, but housing post-modern abstract art.

**Color Palette:**
- Warm stone/cream: `#f5f0e8`
- Deep charcoal: `#1a1a1a`
- Aged gold: `#b8963e`
- Marble white: `#faf9f6`
- Terracotta accent: `#c4745a`

**Animation Style:**
Inspired by Animal Crossing — smooth, gentle, slightly bouncy transitions. Clean but alive. Nothing harsh or aggressive.

## 🏛️ Pages

### 1. Landing Page (`/`)
- Grand title with cycling gothic fonts (UnifrakturMaguntia, MedievalSharp, Cinzel Decorative, etc.)
- Flanking gallery walls with parallax frames
- Repository URL input with shimmer effect
- "Connect Wallet" button (Solana integration ready)

### 2. Curating Page (`/curating`)
- Animated loading sequence with rotating steps:
  - "Studying the source material..."
  - "Selecting the color palette..."
  - "Commissioning the artists..."
  - etc.
- Automatically redirects to exhibition after 5 seconds

### 3. Exhibition Page (`/exhibition/[id]`)
- Horizontal draggable carousel of artworks
- Click any piece to view detail with museum placard
- Donation box with Solana integration (ready for wallet connection)
- NFT ticket stub claim button

## 🧩 Components

- `<FontCarousel />` — Cycles through gothic fonts every 2.5 seconds
- `<ArtworkFrame />` — Gilded frame with parallax support
- `<Placard />` — Museum-style description card with metrics
- `<GalleryCarousel />` — Draggable horizontal gallery with Framer Motion
- `<RepoInput />` — GitHub URL input with routing
- `<WalletButton />` — Solana wallet connect (ready for integration)
- `<LoadingCurator />` — Animated loading sequence
- `<DonationBox />` — Donation interface with SOL input
- `<TicketStub />` — NFT claim button (ready for minting)

## 🚀 Getting Started

### Install dependencies
```bash
npm install
```

### Run development server
```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for production
```bash
npm run build
npm run preview
```

## 📁 Project Structure

```
syntaxesia/
├── src/
│   ├── pages/
│   │   ├── LandingPage.jsx      # Landing page
│   │   ├── CuratingPage.jsx     # Loading/curating page
│   │   └── ExhibitionPage.jsx   # Exhibition gallery page
│   ├── components/
│   │   ├── FontCarousel.jsx
│   │   ├── ArtworkFrame.jsx
│   │   ├── Placard.jsx
│   │   ├── GalleryCarousel.jsx
│   │   ├── RepoInput.jsx
│   │   ├── WalletButton.jsx
│   │   ├── LoadingCurator.jsx
│   │   └── DonationBox.jsx
│   ├── lib/
│   │   └── mockData.js          # Placeholder exhibition data
│   ├── App.jsx                  # React Router setup
│   ├── main.jsx                 # Entry point
│   └── index.css                # Global styles + Google Fonts
├── public/
│   └── images/
├── index.html
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── package.json
```

## 🔮 Future Integrations

Ready to connect:

1. **GitHub API** — Fetch real repository data
2. **Google Gemini API** — Generate artwork descriptions and exhibition titles
3. **DALL-E API** — Generate actual artwork images from code
4. **Solana Wallet** — Phantom/Solflare wallet connection
5. **Solana Programs** — Donation handling and NFT minting

All components accept data as props, making it easy to swap mock data with real API responses.

## 🎭 Typography

**Gothic/Ornate (rotating title):**
- UnifrakturMaguntia
- MedievalSharp
- Cinzel Decorative
- Playfair Display SC
- IM Fell English SC

**Body text:**
- Cormorant Garamond (serif)
- EB Garamond (serif)

**Code/Metrics:**
- JetBrains Mono (monospace)
- IBM Plex Mono (monospace)

## 📱 Responsive Design

Optimized for desktop experience, but mobile-friendly. The parallax effects are subtle enough to work on touch devices.

## 🛠️ Tech Stack

- **React 18**
- **Vite 5** (build tool & dev server)
- **React Router 6** (client-side routing)
- **Tailwind CSS**
- **Framer Motion** (animations)
- **Google Fonts** (typography)

---

Built with reverence for both code and art.

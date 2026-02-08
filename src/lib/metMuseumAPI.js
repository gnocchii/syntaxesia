/**
 * The Met Museum API integration
 * Curated list of 70+ women artists with keyword matching
 */

const MET_API_BASE = 'https://collectionapi.metmuseum.org/public/collection/v1'

// Curated list of ~70 prominent women artists with their associated keywords/styles
export const WOMEN_ARTISTS = [
  // Abstract Expressionist
  { name: 'Helen Frankenthaler', keywords: ['abstract', 'colorful', 'gestural', 'expressive', 'fluid'] },
  { name: 'Joan Mitchell', keywords: ['abstract', 'expressive', 'colorful', 'gestural', 'bold'] },
  { name: 'Lee Krasner', keywords: ['abstract', 'expressive', 'bold', 'dynamic'] },
  { name: 'Grace Hartigan', keywords: ['abstract', 'expressive', 'colorful', 'bold'] },
  { name: 'Elaine de Kooning', keywords: ['abstract', 'expressive', 'gestural'] },

  // Geometric & Hard-Edge
  { name: 'Carmen Herrera', keywords: ['geometric', 'minimal', 'clean', 'structured', 'bold'] },
  { name: 'Bridget Riley', keywords: ['geometric', 'optical', 'pattern', 'repetitive', 'bold'] },
  { name: 'Sonia Delaunay', keywords: ['geometric', 'colorful', 'circular', 'pattern', 'bold'] },
  { name: 'Agnes Martin', keywords: ['minimal', 'geometric', 'grid', 'subtle', 'quiet'] },
  { name: 'Alma Thomas', keywords: ['geometric', 'colorful', 'mosaic', 'pattern', 'vibrant'] },

  // Minimalist
  { name: 'Anne Truitt', keywords: ['minimal', 'sculptural', 'simple', 'clean', 'structured'] },
  { name: 'Jo Baer', keywords: ['minimal', 'geometric', 'structured', 'clean'] },
  { name: 'Dorothea Rockburne', keywords: ['minimal', 'geometric', 'mathematical', 'structured'] },

  // Color Field
  { name: 'Helen Lundeberg', keywords: ['surreal', 'geometric', 'mysterious', 'structured'] },

  // Modern Pioneers
  { name: 'Hilma af Klint', keywords: ['abstract', 'spiritual', 'geometric', 'colorful', 'mystical'] },
  { name: 'Georgia O\'Keeffe', keywords: ['organic', 'nature', 'abstract', 'bold', 'colorful'] },
  { name: 'Sonia Delaunay-Terk', keywords: ['geometric', 'colorful', 'pattern', 'bold'] },

  // Impressionist & Post-Impressionist
  { name: 'Mary Cassatt', keywords: ['impressionist', 'figurative', 'soft', 'domestic', 'gentle'] },
  { name: 'Berthe Morisot', keywords: ['impressionist', 'soft', 'delicate', 'gentle', 'light'] },
  { name: 'Marie Laurencin', keywords: ['soft', 'pastel', 'figurative', 'delicate', 'gentle'] },

  // Surrealist
  { name: 'Leonora Carrington', keywords: ['surreal', 'mystical', 'fantasy', 'mysterious', 'dreamlike'] },
  { name: 'Remedios Varo', keywords: ['surreal', 'mystical', 'detailed', 'mysterious', 'fantasy'] },
  { name: 'Dorothea Tanning', keywords: ['surreal', 'dreamlike', 'mysterious', 'expressive'] },
  { name: 'Kay Sage', keywords: ['surreal', 'architectural', 'mysterious', 'structured'] },

  // Contemporary & Conceptual
  { name: 'Jenny Holzer', keywords: ['text', 'conceptual', 'political', 'bold', 'message'] },
  { name: 'Barbara Kruger', keywords: ['text', 'bold', 'graphic', 'political', 'message'] },
  { name: 'Cindy Sherman', keywords: ['photography', 'conceptual', 'identity', 'performance'] },
  { name: 'Kara Walker', keywords: ['silhouette', 'narrative', 'historical', 'bold', 'political'] },

  // Textile & Pattern
  { name: 'Anni Albers', keywords: ['textile', 'geometric', 'woven', 'pattern', 'structured'] },
  { name: 'Sheila Hicks', keywords: ['textile', 'fiber', 'colorful', 'sculptural', 'woven'] },
  { name: 'Faith Ringgold', keywords: ['textile', 'narrative', 'colorful', 'quilted', 'bold'] },

  // Sculptural & Installation
  { name: 'Louise Bourgeois', keywords: ['sculptural', 'emotional', 'psychological', 'powerful'] },
  { name: 'Eva Hesse', keywords: ['sculptural', 'organic', 'minimal', 'experimental'] },
  { name: 'Ruth Asawa', keywords: ['sculptural', 'woven', 'organic', 'delicate', 'linear'] },

  // Expressionist & Figurative
  { name: 'Frida Kahlo', keywords: ['expressive', 'figurative', 'surreal', 'personal', 'bold'] },
  { name: 'Paula Modersohn-Becker', keywords: ['expressive', 'figurative', 'bold', 'emotional'] },
  { name: 'Gabriele Münter', keywords: ['expressive', 'colorful', 'bold', 'simplified'] },

  // Photography
  { name: 'Diane Arbus', keywords: ['photography', 'portrait', 'documentary', 'bold'] },
  { name: 'Imogen Cunningham', keywords: ['photography', 'botanical', 'abstract', 'detailed'] },
  { name: 'Berenice Abbott', keywords: ['photography', 'architectural', 'documentary', 'urban'] },

  // Pop & Contemporary
  { name: 'Yayoi Kusama', keywords: ['dots', 'pattern', 'repetitive', 'colorful', 'infinite', 'obsessive'] },
  { name: 'Niki de Saint Phalle', keywords: ['sculptural', 'colorful', 'bold', 'playful'] },
  { name: 'Marisol Escobar', keywords: ['sculptural', 'pop', 'assemblage', 'bold'] },

  // Additional Modern/Contemporary
  { name: 'Lynda Benglis', keywords: ['sculptural', 'organic', 'colorful', 'fluid'] },
  { name: 'Elizabeth Murray', keywords: ['abstract', 'colorful', 'shaped', 'playful', 'bold'] },
  { name: 'Jennifer Bartlett', keywords: ['geometric', 'pattern', 'systematic', 'colorful'] },
  { name: 'Judy Chicago', keywords: ['feminist', 'colorful', 'geometric', 'symbolic'] },
  { name: 'Miriam Schapiro', keywords: ['colorful', 'pattern', 'decorative', 'bold'] },
  { name: 'Joyce Kozloff', keywords: ['pattern', 'decorative', 'colorful', 'geometric'] },

  // Latin American
  { name: 'Tarsila do Amaral', keywords: ['modernist', 'colorful', 'tropical', 'bold', 'geometric'] },
  { name: 'Lygia Clark', keywords: ['geometric', 'minimal', 'interactive', 'structural'] },
  { name: 'Lygia Pape', keywords: ['geometric', 'minimal', 'experimental', 'bold'] },

  // Asian Artists
  { name: 'Lee Bontecou', keywords: ['sculptural', 'assemblage', 'organic', 'bold'] },
  { name: 'Hung Liu', keywords: ['figurative', 'historical', 'layered', 'expressive'] },

  // More Contemporary
  { name: 'Julie Mehretu', keywords: ['abstract', 'layered', 'architectural', 'complex', 'linear'] },
  { name: 'Cecily Brown', keywords: ['abstract', 'expressive', 'gestural', 'colorful', 'bold'] },
  { name: 'Amy Sillman', keywords: ['abstract', 'colorful', 'playful', 'gestural'] },
  { name: 'Charline von Heyl', keywords: ['abstract', 'colorful', 'geometric', 'bold'] },
  { name: 'Laura Owens', keywords: ['abstract', 'colorful', 'playful', 'varied'] },

  // European Modern
  { name: 'Sophie Taeuber-Arp', keywords: ['geometric', 'abstract', 'textile', 'structured'] },
  { name: 'Marlow Moss', keywords: ['geometric', 'abstract', 'minimal', 'structural'] },
  { name: 'Natalia Goncharova', keywords: ['modernist', 'colorful', 'expressive', 'bold'] },

  // British Artists
  { name: 'Barbara Hepworth', keywords: ['sculptural', 'organic', 'minimal', 'abstract'] },
  { name: 'Gwen John', keywords: ['figurative', 'quiet', 'intimate', 'subtle'] },
  { name: 'Vanessa Bell', keywords: ['colorful', 'domestic', 'post-impressionist', 'gentle'] },

  // Additional Abstract
  { name: 'Perle Fine', keywords: ['abstract', 'expressive', 'gestural', 'bold'] },
  { name: 'Hedda Sterne', keywords: ['abstract', 'varied', 'experimental', 'expressive'] },
  { name: 'Deborah Remington', keywords: ['abstract', 'geometric', 'hard-edge', 'structured'] },
  { name: 'Mary Heilmann', keywords: ['abstract', 'colorful', 'geometric', 'playful'] },
]

/**
 * Match keywords to relevant artists (fuzzy matching)
 */
export function matchArtistsToKeywords(searchKeywords) {
  console.log('[Met API] Matching keywords:', searchKeywords)

  const keywords = searchKeywords.toLowerCase().split(/\s+/)
  console.log('[Met API] Parsed keywords:', keywords)

  const artistScores = WOMEN_ARTISTS.map(artist => {
    let score = 0
    for (const keyword of keywords) {
      for (const artistKeyword of artist.keywords) {
        // Exact match = 3 points
        if (artistKeyword === keyword) {
          score += 3
        }
        // Partial match = 1 point
        else if (artistKeyword.includes(keyword) || keyword.includes(artistKeyword)) {
          score += 1
        }
      }
    }
    return { artist, score }
  })

  // Sort by score and return top matches
  const matches = artistScores
    .filter(a => a.score > 0)
    .sort((a, b) => b.score - a.score)

  console.log('[Met API] Top 15 scored artists:')
  matches.slice(0, 15).forEach((m, i) => {
    console.log(`  ${i + 1}. ${m.artist.name} (score: ${m.score})`)
  })

  const matchedNames = matches.map(a => a.artist.name)
  console.log('[Met API] Returning', matchedNames.length, 'matched artists')

  // If no exact matches, return random selection for variety
  if (matches.length === 0) {
    console.log('[Met API] No keyword matches, using random artists')
    const shuffled = [...WOMEN_ARTISTS].sort(() => Math.random() - 0.5)
    return shuffled.slice(0, 15).map(a => a.name)
  }

  // Return top 15 matches for variety
  return matches.slice(0, 15)
}

/**
 * Search The Met Museum API for artworks by specific artists
 */
export async function searchMetMuseum(keywords) {
  console.log('[Met API] Starting search for keywords:', keywords)

  // Match keywords to artists
  const artistNames = matchArtistsToKeywords(keywords)

  if (artistNames.length === 0) {
    console.warn('[Met API] No artists matched')
    return []
  }

  const allArtworks = []

  // Search for artworks by each matched artist
  for (const artistName of artistNames) {
    if (allArtworks.length >= 20) break // Stop when we have enough

    try {
      console.log('[Met API] Searching for artist:', artistName)

      // Search API
      const searchUrl = `${MET_API_BASE}/search?artistOrCulture=true&q=${encodeURIComponent(artistName)}`
      console.log('[Met API] Search URL:', searchUrl)

      const searchResponse = await fetch(searchUrl)
      const searchData = await searchResponse.json()

      if (!searchData.objectIDs || searchData.objectIDs.length === 0) {
        console.log('[Met API] No objects found for', artistName)
        continue
      }

      console.log('[Met API] Found', searchData.objectIDs.length, 'objects for', artistName)

      // Fetch more objects per artist to ensure we get 8 total
      const objectIDs = searchData.objectIDs.slice(0, 5) // Max 5 per artist

      for (const objectID of objectIDs) {
        try {
          const objectUrl = `${MET_API_BASE}/objects/${objectID}`
          const objectResponse = await fetch(objectUrl)
          const objectData = await objectResponse.json()

          // Only include if it has an image AND artist matches our list
          if (objectData.primaryImage || objectData.primaryImageSmall) {
            const displayArtist = objectData.artistDisplayName || artistName

            // FLEXIBLE matching: Check if artist name matches (handles "Last, First" vs "First Last")
            const normalizeArtistName = (name) => {
              return name.toLowerCase()
                .replace(/[,\-]/g, ' ') // Remove commas and hyphens
                .split(/\s+/) // Split into words
                .filter(w => w.length > 2) // Keep words longer than 2 chars
            }

            const displayWords = normalizeArtistName(displayArtist)
            const isWomanArtist = WOMEN_ARTISTS.some(a => {
              const curatedWords = normalizeArtistName(a.name)
              // Match if at least 2 words overlap (first + last name)
              const matches = curatedWords.filter(word =>
                displayWords.some(dw => dw.includes(word) || word.includes(dw))
              )
              return matches.length >= 2
            })

            if (isWomanArtist) {
              allArtworks.push({
                url: objectData.primaryImage || objectData.primaryImageSmall,
                title: objectData.title || 'Untitled',
                artist: displayArtist,
                date: objectData.objectDate || '',
                medium: objectData.medium || '',
                description: objectData.creditLine || objectData.department || '',
                pageUrl: objectData.objectURL || '',
                metID: objectData.objectID
              })

              console.log('[Met API] ✓ Added artwork by', displayArtist, ':', objectData.title)
            } else {
              console.log('[Met API] ✗ Skipping - artist not in curated list:', displayArtist)
            }
          }
        } catch (err) {
          console.warn('[Met API] Error fetching object', objectID, err)
        }
      }

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 50))

    } catch (err) {
      console.warn('[Met API] Error searching for', artistName, err)
    }
  }

  console.log('[Met API] Total artworks collected:', allArtworks.length)

  // Shuffle to ensure variety (minimize repeating same artist)
  const shuffled = allArtworks.sort(() => Math.random() - 0.5)

  // Return 8 artworks, trying to minimize repeats
  const selected = []
  const usedArtists = new Set()

  for (const artwork of shuffled) {
    if (selected.length >= 8) break

    // Prefer artworks from artists we haven't used yet
    if (!usedArtists.has(artwork.artist)) {
      selected.push(artwork)
      usedArtists.add(artwork.artist)
    }
  }

  // Fill remaining slots if needed
  if (selected.length < 8) {
    for (const artwork of shuffled) {
      if (selected.length >= 8) break
      if (!selected.includes(artwork)) {
        selected.push(artwork)
      }
    }
  }

  console.log('[Met API] Returning', selected.length, 'artworks')
  return selected
}

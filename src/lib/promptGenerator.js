import { analyzeCode } from './codeAnalyze.js'

// ============================================
// Element-mapped color wheel
// ============================================

const ELEMENT_COLORS = [
  { key: 'loopCount',            hue: 0,   name: 'scarlet red',          hex: '#ff1744' },
  { key: 'conditionalCount',     hue: 30,  name: 'burnt orange',         hex: '#ff6d00' },
  { key: 'recursionCount',       hue: 55,  name: 'cadmium yellow',       hex: '#ffd600' },
  { key: 'functions',            hue: 90,  name: 'acid green',           hex: '#76ff03' },
  { key: 'classCount',           hue: 140, name: 'emerald green',        hex: '#00e676' },
  { key: 'asyncCount',           hue: 175, name: 'cyan',                 hex: '#00e5ff' },
  { key: 'importCount',          hue: 210, name: 'cobalt blue',          hex: '#2979ff' },
  { key: 'tryCatchCount',        hue: 250, name: 'deep violet',          hex: '#651fff' },
  { key: 'magicNumbers',         hue: 285, name: 'electric magenta',     hex: '#d500f9' },
  { key: 'duplicateBlocks',      hue: 320, name: 'hot pink',             hex: '#ff1867' },
  { key: 'maxNestingDepth',      hue: 345, name: 'crimson',              hex: '#d50000' },
]

const WILD_ACCENTS = [
  'fluorescent chartreuse (#ccff00)', 'neon coral (#ff6e7f)', 'electric teal (#00ffc8)',
  'radioactive orange (#ff6100)', 'ultraviolet (#7c00ff)', 'shocking pink (#fc0fc0)',
  'cerulean (#007ba7)', 'vermillion (#e34234)', 'chrome yellow (#ffa700)',
  'phthalo green (#123524)', 'quinacridone rose (#e8467c)', 'mars black (#1b1b1b)',
  'titanium white (#fafafa)', 'raw umber (#826644)', 'cadmium orange (#ed872d)',
  'prussian blue (#003153)', 'viridian (#40826d)', 'alizarin crimson (#e32636)',
]

function getElementColorPalette(metrics) {
  const active = []

  for (const ec of ELEMENT_COLORS) {
    const val = metrics[ec.key]
    if (val > 0) {
      active.push({ name: ec.name, hex: ec.hex, weight: Math.min(val, 10) })
    }
  }

  if (active.length < 2) {
    active.push(
      { name: 'ivory black', hex: '#1b1b1b', weight: 5 },
      { name: 'titanium white', hex: '#fafafa', weight: 3 },
      { name: 'cadmium red', hex: '#e21a1a', weight: 2 },
    )
  }

  const shuffled = [...WILD_ACCENTS].sort(() => Math.random() - 0.5)
  const numAccents = active.length > 5 ? 2 : 1

  active.sort((a, b) => b.weight - a.weight)

  const primary = active.slice(0, 3).map(c => `${c.name} (${c.hex}) — DOMINANT`).join(', ')
  const secondary = active.slice(3).map(c => `${c.name} (${c.hex})`).join(', ')
  const accents = shuffled.slice(0, numAccents).join(', ')

  return `PRIMARY: ${primary}.
${secondary ? `SECONDARY: ${secondary}.` : ''}
WILD ACCENT${numAccents > 1 ? 'S' : ''}: ${accents}.
Use colors at FULL SATURATION. Distribute across the entire piece — no single color should dominate more than 40% of the surface.
Colors should clash, vibrate, and create optical tension.`
}

// ============================================
// Density and extremity directives
// ============================================

const getDensityDirective = (lines) => {
  if (lines > 500) return `
    MAXIMUM SATURATION: There should be ZERO visible background.
    Every single pixel is covered with marks, dots, strokes, or
    texture. The surface is so packed it becomes almost illegible
    — a wall of visual information that overwhelms the viewer.
    Layer marks ON TOP of other marks. Nothing is clean.
    The canvas is groaning under the weight.`

  if (lines > 200) return `
    HIGH DENSITY: 80-90% of the canvas is covered. Marks crowd
    each other, overlap, compete for space. Small pockets of
    background peek through but they feel accidental, like gaps
    in a crowd. The composition is aggressive and demanding.`

  if (lines > 100) return `
    MODERATE DENSITY: 50-60% coverage. Clear rhythm between
    active zones and breathing room. The composition has
    structure — dense clusters separated by intentional voids.`

  if (lines > 50) return `
    SPARSE: Only 20-30% of the canvas has marks. The empty
    space IS the composition. Each mark exists in isolation,
    surrounded by vast negative space. The viewer's eye has
    to travel across emptiness to reach the next element.`

  return `
    ULTRA-MINIMAL: 5-10% coverage maximum. Almost nothing on
    the canvas. Maybe 3-5 marks total on the entire surface.
    The piece is 90% blank paper/canvas with a tiny cluster
    of precise marks. The emptiness should feel intentional
    and powerful, not lazy. Think Agnes Martin at her most
    restrained — barely there.`
}

const getExtremityDirective = (metrics) => {
  const chaos = metrics.cyclomaticComplexity +
    metrics.maxNestingDepth * 3 +
    metrics.loopCount

  if (chaos > 40) return `
    VISUAL EXTREMITY: MAXIMUM.
    This piece should be visually VIOLENT. Marks collide and
    destroy each other. Colors scream against each other at
    full saturation. Stripes and dots at war. The surface looks
    like it was attacked. Splatter, scratch, gouge, tear.
    Multiple conflicting systems overlaid until chaos emerges.
    The viewer should feel uncomfortable and overwhelmed.
    Think Cy Twombly at his most frantic crossed with
    Julie Mehretu at her most dense.`

  if (chaos > 25) return `
    VISUAL EXTREMITY: HIGH.
    Strong contrasts, bold marks, visible tension between
    order and disorder. Some systems are intact, others are
    breaking down. Colors are saturated and confrontational.
    The composition demands attention aggressively.`

  if (chaos > 12) return `
    VISUAL EXTREMITY: MODERATE.
    Confident mark-making with controlled energy. Colors are
    clear and purposeful. Systems are visible and mostly
    intact. There is tension but it is productive, not
    destructive.`

  if (chaos > 5) return `
    VISUAL EXTREMITY: LOW.
    Quiet, measured, contemplative. Colors are muted or
    used sparingly. Marks are gentle and precise. The piece
    invites slow viewing. Nothing shouts.`

  return `
    VISUAL EXTREMITY: NEAR ZERO.
    Almost silent. The faintest possible marks on the surface.
    Colors so muted they barely register. The piece exists at
    the threshold of visibility. The viewer has to lean in and
    squint. Think Vija Celmins pencil oceans or Robert Ryman
    white paintings.`
}

// ============================================
// Physical medium prompt (gallery style)
// ============================================

const getArtMedium = (metrics) => {
  if (metrics.recursionCount > 3) return `
    MEDIUM: Layered cut paper collage with visible depth.
    Thick cardboard and foam shapes stacked 3-5 layers deep,
    casting real shadows. Each layer is a different scale of
    the same recursive form. Shot from above so you see the
    dimensional stacking. Colors are bold construction paper:
    saturated, flat, unapologetic. Think Elizabeth Murray
    shaped canvases or Keith Haring foam reliefs.
    The piece should look PHYSICAL — you can see the cut
    edges, the thickness of the material, the shadows
    between layers.`

  if (metrics.loopCount > 8) return `
    MEDIUM: Obsessive hand-stitched textile or woven piece.
    Thousands of identical small elements (beads, knots,
    loops of thread, tiny fabric squares) arranged in a
    dense grid that warps and distorts. The repetition is
    manic and handmade — slightly irregular, human, obsessive.
    Think Sheila Hicks fiber art or El Anatsui bottle cap
    tapestries. The surface should feel TACTILE — you want
    to touch it. Shot close-up with dramatic side lighting
    that catches the texture, filling the entire frame.`

  if (metrics.conditionalCount > 10) return `
    MEDIUM: Architectural drawing on translucent vellum.
    Precise ink lines on semi-transparent paper, layered
    over ghostly background imagery. Thin blue, red, and
    graphite lines creating branching network diagrams.
    Small red and yellow dots at intersection nodes.
    Multiple sheets of tracing paper layered creating
    depth through transparency. Think Julie Mehretu
    architectural abstractions or Mark Lombardi conspiracy
    network drawings. Should feel like classified documents
    or urban planning maps from a fictional city.`

  if (metrics.classCount > 3) return `
    MEDIUM: Welded steel and found metal assemblage.
    Heavy industrial metal pieces — I-beams, steel plates,
    rusted gears, pipe fittings — welded together into a
    wall-mounted sculpture. Each class is a distinct
    structural component bolted to the others. The whole
    piece has architectural integrity despite looking
    brutal. Think Anthony Caro or John Chamberlain
    crushed car sculptures. Shot close-up filling the
    entire frame, dramatic lighting casting shadows.`

  if (metrics.asyncCount > 5) return `
    MEDIUM: Hanging installation of disparate objects
    suspended from ceiling by thin wires at different
    heights. Random clustered objects: colored resin
    blobs, crumpled fabric, foam spheres, tangled wire,
    small found objects — each one different, all floating
    in space with no visible connection between them.
    Some cluster together, others drift alone. Think
    Sarah Sze installations or Mike Kelley hanging
    pieces. Shot close-up so the objects fill the
    entire frame edge to edge, no gallery walls or
    floor visible.`

  if (metrics.cyclomaticComplexity < 5 && metrics.functions < 5) return `
    MEDIUM: Large-scale color field painting.
    2-3 massive soft-edged rectangles of luminous color
    floating on the canvas. Edges bleed and breathe — not
    hard lines but halos where one color dissolves into
    another. The paint is thin and translucent in places,
    thick and opaque in others. Think Mark Rothko or
    Helen Frankenthaler stain paintings. The simplicity
    should feel POWERFUL not empty. Photographed straight-on,
    filling the frame, no gallery context visible.`

  if (metrics.importCount > 15) return `
    MEDIUM: Massive pin-and-string conspiracy board.
    A white surface covered in photographs, documents,
    sticky notes, and printed diagrams all connected by
    colored string, push pins, and tape. Red string for
    critical connections, blue for secondary, yellow for
    tentative. Some areas are dense tangled knots of
    string, others have single clean connections.
    Handwritten annotations in marker (but NOT readable
    as real text — abstract scribbles only). Think
    detective investigation board as abstract art.`

  if (metrics.linesOfCode > 300 && metrics.functions < 4) return `
    MEDIUM: Draped industrial material — black trash bags,
    plastic sheeting, tarpaulin stretched and pinned to a
    wall like a canvas. Glimpses of vivid color (red,
    electric blue) peek through tears and folds in the
    dark material. The surface is wrinkled, folded,
    draped — aggressively physical and confrontational.
    Think David Hammons or Oscar Murillo. Shot close-up
    filling the entire frame, harsh overhead lighting
    creating reflections on the plastic surface.`

  return `
    MEDIUM: Mixed-media collage combining at least 4
    different materials visible in the same piece:
    torn paper, paint strokes, fabric scraps, printed
    imagery fragments, tape, staples, string. Nothing
    matches. Materials collide and overlap without
    hierarchy. Some areas are thick with layered material,
    others are bare canvas showing through. Think Robert
    Rauschenberg combines or Kurt Schwitters Merzbau.
    The piece should look like it was assembled from
    whatever was lying around the studio, but the
    composition is secretly masterful.`
}

const getTextureOverlays = (metrics) => {
  const overlays = []

  if (metrics.cyclomaticComplexity > 15) overlays.push(
    'TEXTURE: Visible crack lines and stress fractures across the surface, as if the piece is physically breaking apart under its own complexity.'
  )
  if (metrics.maxNestingDepth > 5) overlays.push(
    'TEXTURE: Areas where material is compressed, folded, or crushed — physically showing the pressure of deep nesting.'
  )
  if (metrics.tryCatchCount > 3) overlays.push(
    'TEXTURE: Gold metallic repair lines visible where the piece was broken and mended. Kintsugi philosophy — the repairs are celebrated not hidden.'
  )
  if (metrics.unusedCodeLines > 20) overlays.push(
    'TEXTURE: Ghostly areas where material has been sanded away, erased, painted over — but the original still bleeds through faintly like a palimpsest.'
  )
  if (metrics.duplicateBlocks > 2) overlays.push(
    `TEXTURE: ${metrics.duplicateBlocks} regions that are near-identical copies of each other — same forms, same materials, uncanny repetition.`
  )
  if (metrics.magicNumbers > 5) overlays.push(
    'TEXTURE: Small random objects or shapes that dont belong to any system — arbitrarily placed, unexplained, alien to the rest of the composition.'
  )
  if (metrics.commentRatio > 0.3) overlays.push(
    'TEXTURE: Handwritten-looking scribble marks hovering near elements, like annotations or marginalia. NOT readable as text — abstract gestural scribbles only.'
  )

  return overlays.length > 0 ? overlays.join('\n') : 'Surface is clean and assured. No distress.'
}

export const generateGalleryPrompt = (metrics) => {
  return `
A close-up, frame-filling photograph of a post-modern art piece.
The artwork fills 100% of the image from edge to edge. No gallery
walls, no floor, no frame, no border, no surrounding space visible.
The image IS the artwork surface itself, shot straight-on and
cropped tightly so the art bleeds off all four edges.

${getArtMedium(metrics)}

COLOR PALETTE:
${getElementColorPalette(metrics)}

${getTextureOverlays(metrics)}

DENSITY:
${metrics.linesOfCode > 500
    ? 'Surface is COMPLETELY saturated — no breathing room, every inch is covered, the piece is almost suffocating in its density'
    : metrics.linesOfCode > 200
      ? 'Most of the surface is active, marks and materials crowd each other with small gaps'
      : metrics.linesOfCode > 100
        ? 'Balanced density — active areas and intentional voids in conversation'
        : metrics.linesOfCode > 50
          ? 'Sparse — more empty space than content, each element is isolated and precious'
          : 'Almost nothing — 90% empty surface with tiny precise interventions'}

CRITICAL REQUIREMENTS:
- The artwork covers the ENTIRE image edge to edge — no margins,
  no borders, no frames, no gallery walls, no floor, no
  surrounding objects of any kind
- Visible materiality — you can see thickness, texture,
  weight of the materials
- The piece should look like it costs $50,000 and belongs
  in MoMA or the Tate Modern
- NO recognizable faces, figures, or objects (unless the
  medium directive above specifically calls for found objects,
  in which case they should be abstracted and unrecognizable)
- NO text, letters, numbers, punctuation, glyphs, symbols, logos
- Square format, high resolution, shot straight-on
- Strictly abstract

FRAMING: The artwork must fill the ENTIRE square image. No borders. No margins. No background visible. Edge to edge coverage only.
`.trim()
}

// ============================================
// DALL-E style prompt
// ============================================

export const generateDallePrompt = (metrics) => {
  // STEP 1: Dominant art movement
  const dominantMovement = (() => {
    if (metrics.recursionCount > 3) return {
      style: 'FRACTAL SELF-SIMILARITY',
      desc: 'Self-similar nested structures at multiple scales, like Sierpinski triangles or Mandelbrot edges. Shapes contain smaller versions of themselves. Recursive depth visible as layers within layers within layers.',
      artist: 'M.C. Escher, Bridget Riley nested forms'
    }
    if (metrics.loopCount > 8) return {
      style: 'OP-ART REPETITION',
      desc: 'Obsessive repetitive tiling patterns — dense grids of dots or lines that create optical vibration and moiré effects. The repetition is relentless and hypnotic, like Yayoi Kusama infinity nets or Bridget Riley stripe paintings.',
      artist: 'Bridget Riley, Yayoi Kusama, Victor Vasarely'
    }
    if (metrics.conditionalCount > 10) return {
      style: 'BRANCHING PATHWAYS',
      desc: 'Compositions built from forking paths — lines that split into two, then split again. Tree-like or root-like structures spreading across the canvas. Decision points visible as nodes where paths diverge.',
      artist: 'Julie Mehretu architectural drawings, Piet Mondrian tree studies'
    }
    if (metrics.classCount > 3) return {
      style: 'CUBIST FRAGMENTATION',
      desc: 'Multiple simultaneous viewpoints of the same subject fragmented and reassembled. Overlapping planes, angular shards, the same form shown from different angles simultaneously. Dense, intellectual, analytical.',
      artist: 'Pablo Picasso analytical cubism, Georges Braque'
    }
    if (metrics.asyncCount > 5) return {
      style: 'SCATTERED CONSTELLATION',
      desc: 'Disconnected elements floating in space with invisible connections between them. Dotted lines, dashed paths, elements that almost touch but dont. Tension between isolation and relationship. Things happening in parallel.',
      artist: 'Wassily Kandinsky Composition VIII, Joan Miró constellations'
    }
    if (metrics.cyclomaticComplexity < 5 && metrics.functions < 5) return {
      style: 'HARD-EDGE MINIMALISM',
      desc: 'Clean, confident, deliberate. Large flat color planes with precise edges meeting. Very few elements but each one is intentional and powerful. Generous negative space. Quiet authority.',
      artist: 'Ellsworth Kelly, Agnes Martin grids, Frank Stella'
    }
    if (metrics.importCount > 15) return {
      style: 'NETWORK TOPOLOGY',
      desc: 'Dense web of interconnected nodes and lines — a complex network graph rendered as art. Clusters of activity connected by thin threads. Some nodes are massive hubs, others are tiny endpoints.',
      artist: 'Mark Lombardi network drawings, Tomás Saraceno web installations'
    }
    if (metrics.linesOfCode > 300 && metrics.functions < 4) return {
      style: 'ABSTRACT EXPRESSIONIST GESTURE',
      desc: 'Massive sweeping gestures dominating the canvas. Few moves but each one is enormous and bold. Drips, splatters, aggressive marks that cover huge areas. Raw energy over precision.',
      artist: 'Franz Kline, Robert Motherwell, Pierre Soulages'
    }
    return {
      style: 'POST-MODERN COLLAGE',
      desc: 'Multiple art styles colliding in a single composition. Geometric precision next to organic chaos. Clean lines interrupted by messy textures. Historical references layered over contemporary marks.',
      artist: 'Robert Rauschenberg, Ibrahim El-Salahi, Jasper Johns'
    }
  })()

  // STEP 2: Texture overlays
  const textureOverlay = (() => {
    const textures = []

    if (metrics.cyclomaticComplexity > 15) {
      textures.push('Dense pointillist dot fields filling at least 40% of the canvas — dots compressed so tightly they almost merge, creating optical vibration and visual anxiety. Reference: Seurat but aggressive.')
    }
    if (metrics.maxNestingDepth > 5) {
      textures.push(`Overlapping stripe panels at ${metrics.maxNestingDepth} different angles creating moiré interference where they cross. Each nesting level adds another stripe direction. The deeper the nesting, the more chaotic the interference. Reference: Jesus Rafael Soto kinetic stripe works.`)
    }
    if (metrics.tryCatchCount > 3) {
      textures.push('Visible crack lines running through the composition — thin fractures filled with gold or warm metallic tone. The piece looks like it was broken and repaired. Reference: Japanese kintsugi pottery repair philosophy.')
    }
    if (metrics.unusedCodeLines > 20) {
      textures.push('Ghostly faded regions where forms almost disappear — sanded-back zones, erased-and-redrawn areas, palimpsest layers where old marks show through new ones. Some areas look like they were painted over but the original bleeds through.')
    }
    if (metrics.commentRatio > 0.3) {
      textures.push('Soft luminous halos or aureoles around certain elements — warm glowing edges that suggest annotation or illumination. Like marginalia in a medieval manuscript rendered as light.')
    }
    if (metrics.duplicateBlocks > 2) {
      textures.push(`${metrics.duplicateBlocks} distinct regions of the composition that are near-identical echoes of each other — same forms, same marks, slightly shifted or rotated. The repetition should feel uncanny, like seeing double.`)
    }
    if (metrics.magicNumbers > 5) {
      textures.push('Small geometric shapes (circles, squares, triangles) floating disconnected from the main composition — unanchored, unexplained, arbitrary. They dont belong to any system.')
    }

    if (textures.length === 0) {
      textures.push('Clean, confident mark-making with no distress or interference. The surface is assured and unblemished.')
    }

    return textures.join('\n\n')
  })()

  // STEP 3: Scale of marks
  const scale = (() => {
    const avgFunctionLength = metrics.linesOfCode / Math.max(metrics.functions, 1)
    if (avgFunctionLength > 80) return 'LARGE SCALE MARKS: Big, bold, sweeping gestures. Each mark covers significant canvas area. Few but massive elements.'
    if (avgFunctionLength > 30) return 'MIXED SCALE: A range from large commanding forms to small detailed textures. Hierarchy is clear — major and minor elements.'
    return 'SMALL SCALE MARKS: Fine, intricate, detailed mark-making. Many tiny elements building up to a larger whole. Requires close viewing to appreciate.'
  })()

  const chaos = metrics.cyclomaticComplexity +
    metrics.maxNestingDepth * 3 +
    metrics.loopCount

  return `
Full-bleed abstract artwork filling the entire square image edge to edge. No borders, no frames, no empty space.

DOMINANT MOVEMENT: ${dominantMovement.style}
${dominantMovement.desc}
Artist references: ${dominantMovement.artist}

COLOR PALETTE (USE THESE EXACT COLORS AT FULL SATURATION):
${getElementColorPalette(metrics)}

${getDensityDirective(metrics.linesOfCode)}

${getExtremityDirective(metrics)}

TEXTURE AND SURFACE OVERLAYS:
${textureOverlay}

SCALE OF MARKS:
${scale}

COMPOSITION:
All-over composition filling the ENTIRE canvas edge to edge.
The artwork bleeds off all four edges — no margins, no borders,
no frames, no surrounding objects, no empty space around the piece.
The image IS the artwork surface, nothing else.
No centered focal point.
No fading to edges.
Background is ACTIVE, not passive.

MARK-MAKING:
${chaos > 25
    ? 'Aggressive: slashing strokes, violent scratches, splattered ink, torn edges, marks that feel ANGRY and URGENT'
    : chaos > 12
      ? 'Confident: deliberate strokes, varied pressure, mix of precise and gestural, energetic but controlled'
      : 'Delicate: hairline marks, whispered touches, barely-there traces, the lightest possible pressure'}

SURFACE:
Matte paper grain, scan noise.
No glossy render. No 3D shading. No clean vector look.

CRITICAL — AVOID THESE DEFAULTS:
- NO beige/cream default background
- NO centered symmetrical composition
- NO soft watercolor washes
- NO gradient fades
- NO decorative borders, frames, margins, or empty edges
- NO surrounding objects, gallery walls, floors, or context
- NO digital/clean/vector aesthetic
- The artwork fills 100% of the image from edge to edge
- The piece should look like a PHYSICAL artwork, not digital art

HARD CONSTRAINTS:
No text, letters, numbers, punctuation, glyphs, symbols, logos.
No recognizable objects, faces, figures.
Strictly abstract.

FRAMING: The artwork must fill the ENTIRE square image. No borders. No margins. No background visible. Edge to edge coverage only.
`.trim()
}

// ============================================
// Code metrics computation
// ============================================

export function computeExtendedMetrics(code, language, signals) {
  const lines = code.split('\n')

  const importCount = lines.filter(l => /^\s*(import\s|const\s+\w+\s*=\s*require\(|from\s+['"])/.test(l)).length
  const asyncCount = (code.match(/\basync\b|\bawait\b|\bPromise\b|\.then\s*\(/g) || []).length
  const magicNumbers = (code.match(/(?<![.\w\[])(?:[2-9]|\d{2,})(?!\w)/g) || []).length

  let maxIndent = 0
  for (const line of lines) {
    if (line.trim().length === 0) continue
    const spaces = line.match(/^(\s*)/)?.[1].length ?? 0
    const indent = Math.floor(spaces / 2)
    if (indent > maxIndent) maxIndent = indent
  }

  const blockMap = new Map()
  for (let i = 0; i < lines.length - 2; i++) {
    const block = lines.slice(i, i + 3).map(l => l.trim()).join('\n')
    if (block.length > 10) {
      blockMap.set(block, (blockMap.get(block) ?? 0) + 1)
    }
  }
  const duplicateBlocks = [...blockMap.values()].filter(c => c > 1).length

  const unusedCodeLines = lines.filter(l => /^\s*\/\/\s*(const|let|var|function|if|for|return|import)/.test(l)).length

  return {
    language,
    recursionCount: signals.recursionHints,
    loopCount: signals.loopCount,
    conditionalCount: signals.branchCount,
    classCount: Math.floor(signals.oopHints / 3),
    asyncCount,
    functions: signals.functionalHints,
    cyclomaticComplexity: signals.branchCount + signals.loopCount + 1,
    importCount,
    linesOfCode: lines.length,
    maxNestingDepth: maxIndent,
    tryCatchCount: signals.tryCatchCount,
    unusedCodeLines,
    commentRatio: signals.commentDensity,
    duplicateBlocks,
    magicNumbers,
  }
}

// ============================================
// Language detection
// ============================================

export function detectLanguage(code) {
  const indicators = {
    python: [/\bdef\s+\w+\s*\(/, /\bimport\s+\w+/, /\bprint\s*\(/, /:\s*\n\s+/, /\bself\b/, /\belif\b/, /\b__\w+__\b/],
    rust: [/\bfn\s+\w+/, /\blet\s+mut\b/, /\bmatch\b/, /\bimpl\b/, /->/, /::/, /\bpub\s+(fn|struct|enum)/, /\bOption</, /\bResult</],
    java: [/\bpublic\s+(static\s+)?void\b/, /\bSystem\.out/, /\bextends\b/, /\bimplements\b/, /\bpackage\s+/, /\b@Override\b/],
    typescript: [/:\s*(string|number|boolean|void)\b/, /\binterface\s+\w+/, /\b(type|enum)\s+\w+/, /<[A-Z]\w*>/, /\bas\s+\w+/],
    go: [/\bfunc\s+\w+/, /\bpackage\s+main\b/, /\bfmt\./, /\b:=\b/, /\bgo\s+func/, /\bchan\b/],
    c: [/#include\s*</, /\bprintf\s*\(/, /\bmalloc\s*\(/, /\bvoid\s+\w+\s*\(/, /\bsizeof\s*\(/, /\bNULL\b/],
    cpp: [/#include\s*</, /\bstd::/, /\bcout\s*<</, /\btemplate\s*</, /\bnamespace\b/, /\bnew\s+\w+/],
    ruby: [/\bdo\s*\|/, /\bend\b/, /\bputs\b/, /\brequire\b/, /\battr_(reader|writer|accessor)\b/, /\bdef\s+\w+.*\n.*\bend\b/],
    swift: [/\bvar\s+\w+\s*:/, /\bguard\s+let\b/, /\bfunc\s+\w+.*->/, /\bprotocol\b/, /\bstruct\s+\w+/],
    php: [/<\?php/, /\$\w+/, /\becho\b/, /->/, /\bfunction\s+\w+/],
    html: [/<\w+[^>]*>/, /<\/\w+>/, /<!DOCTYPE/i, /<html/i, /<div/i],
    css: [/\{[^}]*;\s*\}/, /@media/, /:\s*(flex|grid|block|none)\b/, /\.\w+\s*\{/, /#\w+\s*\{/],
  }

  let best = 'javascript'
  let bestScore = 0

  for (const [lang, patterns] of Object.entries(indicators)) {
    let score = 0
    for (const p of patterns) {
      if (p.test(code)) score++
    }
    if (score > bestScore) {
      bestScore = score
      best = lang
    }
  }

  if (bestScore < 2) {
    if (/\b(const|let|var)\b/.test(code) || /=>\s*[{(]/.test(code) || /\bfunction\b/.test(code)) {
      return 'javascript'
    }
  }

  return best
}

// ============================================
// Main entry point
// ============================================

export function generateArtPrompt(code) {
  const codeSnippet = String(code ?? "").slice(0, 1800)
  const lang = detectLanguage(codeSnippet)
  const signals = analyzeCode(codeSnippet)
  const metrics = computeExtendedMetrics(codeSnippet, lang, signals)

  // Randomly pick between flat/scanned style and gallery/physical style
  const prompt = Math.random() < 0.5
    ? generateDallePrompt(metrics)
    : generateGalleryPrompt(metrics)

  return { prompt, metrics, language: lang }
}

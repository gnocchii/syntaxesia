// Each artwork's placard data is structured for Gemini API output.
// Every field is optional so the UI gracefully handles whatever Gemini returns.
export const artworks = [
  {
    id: 1,
    image: '/frame.png',
    placard: {
      title: 'The Lecture Hall',
      filename: 'lecture_hall.js',
      artist: 'Unknown Folk Artist',
      medium: 'Carved & painted wood diorama',
      year: '1932',
      description: 'A meticulous assembly of hand-carved figures arranged in a classroom tableau. The central figure — back turned to the viewer — commands attention through absence, forcing the audience to project authority onto an anonymous silhouette.',
      details: [
        { label: 'Origin', value: 'São Paulo, Brazil' },
        { label: 'Dimensions', value: '45 × 60 × 30 cm' },
        { label: 'Collection', value: 'Private' },
      ],
    },
  },
  {
    id: 2,
    image: '/frame.png',
    placard: {
      title: 'Assembly of Gazes',
      filename: 'assembly_of_gazes.py',
      artist: 'Unknown Folk Artist',
      medium: 'Carved & painted wood diorama',
      year: '1934',
      description: 'Thirty-two pairs of eyes stare outward from their miniature world. Each face is unique yet collectively anonymous — a meditation on the crowd as both individual and organism.',
      details: [
        { label: 'Origin', value: 'São Paulo, Brazil' },
        { label: 'Dimensions', value: '45 × 60 × 30 cm' },
      ],
    },
  },
  {
    id: 3,
    image: '/frame.png',
    placard: {
      title: 'The Weight of Attention',
      filename: 'weight_of_attention.tsx',
      artist: 'Unknown Folk Artist',
      medium: 'Carved & painted wood diorama',
      year: '1935',
      description: 'The overhead lamp — crude yet deliberate — serves as the only vertical element in a horizontally dominated composition. Light itself becomes a character, dividing the space between speaker and spoken-to.',
      details: [
        { label: 'Origin', value: 'São Paulo, Brazil' },
        { label: 'Condition', value: 'Minor restoration' },
      ],
    },
  },
  {
    id: 4,
    image: '/frame.png',
    placard: {
      title: 'Furniture as Architecture',
      filename: 'furniture_architecture.rb',
      artist: 'Unknown Folk Artist',
      medium: 'Carved & painted wood diorama',
      year: '1933',
      description: 'The chairs and desks form a geometry of containment. Each seat is both sanctuary and cage — the viewer is invited to consider where comfort ends and confinement begins.',
      details: [
        { label: 'Origin', value: 'São Paulo, Brazil' },
        { label: 'Acquired', value: '1978' },
      ],
    },
  },
  {
    id: 5,
    image: '/frame.png',
    placard: {
      title: 'Study in Ochre',
      filename: 'study_in_ochre.go',
      artist: 'Unknown Folk Artist',
      medium: 'Carved & painted wood diorama',
      year: '1936',
      description: 'The warm ochre palette unifies disparate forms into a single atmosphere. Skin, wood, and earth share the same tonal family — suggesting that in this world, people and their surroundings are made of the same material.',
      details: [
        { label: 'Origin', value: 'São Paulo, Brazil' },
        { label: 'Exhibition History', value: 'São Paulo Biennale, 1981' },
      ],
    },
  },
  {
    id: 6,
    image: '/frame.png',
    placard: {
      title: 'The Democratic Stage',
      filename: 'democratic_stage.java',
      artist: 'Unknown Folk Artist',
      medium: 'Carved & painted wood diorama',
      year: '1937',
      description: 'No figure is elevated above the platform they all share. The "stage" is merely a wooden plank — raw, functional, honest. Democracy here is not aspirational but structural.',
      details: [
        { label: 'Origin', value: 'São Paulo, Brazil' },
        { label: 'Provenance', value: 'Estate of Maria de Souza' },
      ],
    },
  },
]

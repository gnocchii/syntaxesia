import type { CodeSignals } from "./analyze";

function clamp01(x: number) {
  return Math.max(0, Math.min(1, x));
}

export function buildHumanParts(s: CodeSignals, chaos: number) {
  const complexity = s.branchCount + s.loopCount + s.tryCatchCount * 2;
  const complexity01 = clamp01(complexity / 60);

  const recursion01 = clamp01(s.recursionHints / 6);
  const loops01 = clamp01(s.loopCount / 25);
  const branches01 = clamp01(s.branchCount / 30);
  const jitter01 = clamp01(s.indentJitter);
  const notes01 = clamp01((s.commentDensity * 2) + (s.todoCount > 0 ? 0.2 : 0));

  // Archetype (keep it subtle)
  const archetype =
    s.functionalHints > s.oopHints && s.functionalHints > s.mutationHints
      ? "fluid"
      : s.oopHints > s.functionalHints && s.oopHints > s.mutationHints
      ? "modular"
      : "procedural";

  const rhythmLine =
    archetype === "fluid"
      ? "Rhythm feels continuous and flowing: repeated gestures that transform gently, like one idea being refined over many passes."
      : archetype === "modular"
      ? "Rhythm feels modular: clusters of decisions, compartments, regions built separately then forced to coexist."
      : "Rhythm feels stepwise: discrete phases, abrupt pivots, visible build steps and resets.";

  // Map code signals -> studio process (not geometry)
  const revisionPasses = Math.round(2 + complexity01 * 5 + (chaos / 10) * 2); // 2..9-ish
  const layerLine = `Make it look like ${revisionPasses} uneven passes: overprint ghosts, corrections, partial repainting, some layers misregistered.`;

  const recursionLine =
    recursion01 > 0
      ? "Echo / self-reference shows as recurring motifs that reappear imperfectly (like the artist returning to the same shape idea, but never identically)."
      : "Avoid obvious recurring motifs; keep repetition subtle.";

  const loopLine =
    loops01 > 0
      ? "Looping shows as obsessive reworking: dense pockets where marks accumulate, then thin out abruptly—no smooth fades."
      : "Avoid obsessive accumulation; keep mark density moderate.";

  const branchLine =
    branches01 > 0
      ? "Branching shows as indecision: split directions, conflicting mark families, areas that ‘argue’ visually."
      : "Keep directionality coherent; fewer conflicting mark families.";

  const jitterLine =
    jitter01 < 0.25
      ? "Hand is steady: shapes feel intentional, edges mostly confident (still human, not geometric)."
      : jitter01 < 0.6
      ? "Hand wavers sometimes: slight wobble, drifting alignment, imperfect repeats."
      : "Hand is restless: noticeable drift, skew, misregistration, scratches, and interrupts.";

  const annotationLine =
    notes01 > 0.25
      ? "Evidence of thinking: rubbed-out areas, masked patches, tape-lift scars, faint erased ghosts (but never text-like)."
      : "Cleaner surface: fewer erasures, less ‘editing residue’.";

  const densityLine =
    complexity01 < 0.25
      ? "Overall density is light: more breathing space, fewer collisions."
      : complexity01 < 0.6
      ? "Overall density is medium: layered but not crowded, several active regions."
      : "Overall density is heavy: crowded, overworked zones, lots of collisions and corrections.";

  const chaosLine =
    chaos <= 3
      ? "Energy restrained: calmer contrasts, fewer violent collisions."
      : chaos <= 7
      ? "Energy active: visible tension, frequent overlaps, imperfect alignment."
      : "Energy aggressive: raw collisions, scratches, smears, near-overworked surface.";

  return {
    archetype,
    rhythmLine,
    layerLine,
    recursionLine,
    loopLine,
    branchLine,
    jitterLine,
    annotationLine,
    densityLine,
    chaosLine,
  };
}

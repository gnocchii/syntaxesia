function clamp01(x) {
  return Math.max(0, Math.min(1, x));
}

export function analyzeCode(code) {
  const lines = code.split(/\r?\n/);
  const nonEmpty = lines.filter((l) => l.trim().length > 0);

  const lengths = nonEmpty.map((l) => l.length);
  const maxLineLen = lengths.length ? Math.max(...lengths) : 0;

  // indentation jitter = variance of leading whitespace widths (rough proxy)
  const indents = nonEmpty.map(
    (l) => (l.match(/^\s+/)?.[0].replace(/\t/g, "  ").length ?? 0)
  );
  const mean = indents.length ? indents.reduce((a, b) => a + b, 0) / indents.length : 0;
  const variance = indents.length
    ? indents.reduce((a, x) => a + (x - mean) * (x - mean), 0) / indents.length
    : 0;
  const indentJitter = clamp01(Math.sqrt(variance) / 12);

  const commentLines = nonEmpty.filter((l) => /^\s*(\/\/|#|\/\*|\* )/.test(l)).length;
  const commentDensity = nonEmpty.length ? commentLines / nonEmpty.length : 0;

  const todoCount = (code.match(/\b(TODO|FIXME|HACK)\b/gi) ?? []).length;

  const branchCount = (code.match(/\b(if|else if|else|switch|case|match)\b/g) ?? []).length;
  const loopCount = (code.match(/\b(for|while|do)\b/g) ?? []).length;
  const tryCatchCount = (code.match(/\b(try|catch|except|finally)\b/g) ?? []).length;

  const functionalHints =
    (code.match(/\b(map|filter|reduce|fold|compose|pipe)\b/g) ?? []).length +
    (code.match(/=>/g) ?? []).length;

  const oopHints =
    (code.match(/\b(class|this|new|extends|public|private|protected)\b/g) ?? []).length;

  const mutationHints =
    (code.match(/\b(let|var|mutable|mut)\b/g) ?? []).length +
    (code.match(/(\+\+|--|\+=|-=|\*=|\/=)/g) ?? []).length;

  // very rough recursion check: function name appears at least twice (definition + call)
  const fnNames = Array.from(code.matchAll(/\bfunction\s+([A-Za-z_]\w*)\b/g)).map((m) => m[1]);
  let recursionHints = 0;
  for (const name of fnNames.slice(0, 12)) {
    const re = new RegExp(`\\b${name}\\s*\\(`, "g");
    const hits = (code.match(re) ?? []).length;
    if (hits >= 2) recursionHints += 1;
  }

  return {
    branchCount,
    loopCount,
    tryCatchCount,
    commentDensity,
    todoCount,
    indentJitter,
    maxLineLen,
    functionalHints,
    oopHints,
    mutationHints,
    recursionHints,
  };
}

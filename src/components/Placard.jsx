export default function Placard({
  filename,
  language,
  year,
  description,
  metrics,
}) {
  return (
    <div>
      {/* Title */}
      <h3 className="text-3xl italic mb-1 font-serif text-charcoal">
        {filename}
      </h3>

      {/* Metadata */}
      <p className="text-sm text-charcoal/50 mb-1 font-serif">
        {language}
      </p>
      <p className="text-sm text-charcoal/40 mb-8 font-serif">
        {year}
      </p>

      {/* Divider */}
      <div className="w-8 h-px bg-charcoal/20 mb-8" />

      {/* Description */}
      <p className="text-base leading-relaxed mb-8 text-charcoal/70 font-serif">
        {description}
      </p>

      {/* Metrics */}
      {metrics && (
        <div className="border-t border-charcoal/10 pt-6 space-y-2 font-mono text-xs text-charcoal/50">
          <p>Lines: {metrics.lines}</p>
          <p>Functions: {metrics.functions}</p>
          <p>Complexity: {metrics.complexity}</p>
        </div>
      )}
    </div>
  )
}

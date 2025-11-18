/**
 * Visual indicator for equipment with dual power sources
 * Shows diagonal split with each half colored by its power source
 *
 * Used for: ATS, STS, Dual-corded Servers, Redundant PDUs
 */
export default function DualPowerIndicator({ sources, className = '' }) {
  if (!sources || sources.length !== 2) return null;

  return (
    <svg
      className={`absolute inset-0 w-full h-full pointer-events-none rounded-xl ${className}`}
      preserveAspectRatio="none"
      style={{ zIndex: -1 }}
    >
      <defs>
        {/* Gradient for smooth transition (optional) */}
        <linearGradient id={`dual-gradient-${sources[0].id}-${sources[1].id}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={sources[0].color} stopOpacity="0.3" />
          <stop offset="50%" stopColor={sources[0].color} stopOpacity="0.15" />
          <stop offset="50%" stopColor={sources[1].color} stopOpacity="0.15" />
          <stop offset="100%" stopColor={sources[1].color} stopOpacity="0.3" />
        </linearGradient>
      </defs>

      {/* Left/Top half - Source A */}
      <polygon
        points="0,0 100%,0 0,100%"
        fill={sources[0].color}
        opacity="0.25"
      />

      {/* Right/Bottom half - Source B */}
      <polygon
        points="100%,0 100%,100% 0,100%"
        fill={sources[1].color}
        opacity="0.25"
      />

      {/* Diagonal dividing line with glow */}
      <line
        x1="0"
        y1="0"
        x2="100%"
        y2="100%"
        stroke="#888"
        strokeWidth="1.5"
        strokeDasharray="4,3"
        opacity="0.6"
      />

      {/* Source labels (optional, small indicators) */}
      <text x="15%" y="25%" fontSize="10" fill={sources[0].color} opacity="0.8" fontWeight="bold">
        A
      </text>
      <text x="80%" y="85%" fontSize="10" fill={sources[1].color} opacity="0.8" fontWeight="bold">
        B
      </text>
    </svg>
  );
}

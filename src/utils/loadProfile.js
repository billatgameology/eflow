const DEFAULT_POINTS = [
  { hour: 0, percentage: 50 },
  { hour: 23, percentage: 50 },
];

const sanitizePoint = (point = {}) => ({
  hour: typeof point.hour === 'number' ? point.hour : 0,
  percentage: typeof point.percentage === 'number' ? point.percentage : 50,
});

export const createDefaultLoadProfile = () => ({
  enabled: true,
  points: DEFAULT_POINTS.map((point) => ({ ...point })),
});

export const cloneLoadProfile = (profile) => {
  if (!profile) return createDefaultLoadProfile();

  const points = Array.isArray(profile.points) && profile.points.length > 0
    ? profile.points
    : DEFAULT_POINTS;

  return {
    enabled: profile.enabled ?? true,
    points: points.map((point) => ({ ...sanitizePoint(point) })),
  };
};

export const interpolateValueAtHour = (points = [], hour = 0) => {
  if (!points.length) return 0.5; // Default 50%
  const sorted = [...points].sort((a, b) => a.hour - b.hour);
  for (let i = 0; i < sorted.length - 1; i += 1) {
    const current = sorted[i];
    const next = sorted[i + 1];
    if (hour === current.hour) return current.percentage;
    if (hour > current.hour && hour < next.hour) {
      const ratio = (hour - current.hour) / (next.hour - current.hour || 1);
      return current.percentage + ratio * (next.percentage - current.percentage);
    }
  }
  return sorted[sorted.length - 1]?.percentage ?? 0.5;
};

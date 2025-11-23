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

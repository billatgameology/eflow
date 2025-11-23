const clampHour = (hour) => Math.min(Math.max(hour, 0), 23);
const clampPercent = (value) => Math.min(Math.max(Math.round(value), 0), 100);

const withEndpoints = (points) => {
  const normalized = points
    .map((point) => ({
      hour: clampHour(point.hour),
      percentage: clampPercent(point.percentage),
    }))
    .sort((a, b) => a.hour - b.hour);

  const hasStart = normalized.some((point) => point.hour === 0);
  const hasEnd = normalized.some((point) => point.hour === 23);

  if (!hasStart) {
    normalized.unshift({ hour: 0, percentage: normalized[0]?.percentage ?? 50 });
  }

  if (!hasEnd) {
    normalized.push({ hour: 23, percentage: normalized[normalized.length - 1]?.percentage ?? 50 });
  }

  return normalized;
};

const createAiGpuTemplatePoints = () => {
  const base = 50;
  const lowFloor = 35;

  const makeSpike = (startHour, duration) => ([
    { hour: startHour - 0.4, percentage: base },
    { hour: startHour, percentage: 100 },
    { hour: startHour + duration, percentage: 100 },
    { hour: startHour + duration + 0.3, percentage: base },
  ]);

  const spikeWindows = [
    { start: Math.floor(Math.random() * 3) + 1, duration: Math.random() * 1.5 + 0.8 },
    { start: Math.floor(Math.random() * 4) + 7, duration: Math.random() * 2 + 1 },
    { start: Math.floor(Math.random() * 4) + 12, duration: Math.random() * 2 + 1 },
    { start: Math.floor(Math.random() * 4) + 17, duration: Math.random() * 1.5 + 0.6 },
  ];

  const extendedLowWindows = [
    { start: 4, end: 5.5 },
    { start: 15.5, end: 16.5 },
    { start: 21, end: 22.5 },
  ];

  const points = [
    { hour: 0, percentage: base },
    ...extendedLowWindows.flatMap(({ start, end }) => ([
      { hour: start, percentage: lowFloor },
      { hour: end, percentage: lowFloor },
      { hour: end + 0.2, percentage: base },
    ])),
    ...spikeWindows.flatMap(({ start, duration }) => makeSpike(start, duration)),
    { hour: 23, percentage: base },
  ];

  return withEndpoints(points);
};

export const loadProfileTemplates = [
  {
    id: 'steady-50',
    name: 'Steady 50%',
    description: 'Flat utilization across the full day.',
    getPoints: () =>
      withEndpoints([
        { hour: 0, percentage: 50 },
        { hour: 23, percentage: 50 },
      ]),
  },
  {
    id: 'human-activity',
    name: 'Business Day',
    description: 'Low overnight, peaks mid-afternoon.',
    getPoints: () =>
      withEndpoints([
        { hour: 0, percentage: 30 },
        { hour: 6, percentage: 40 },
        { hour: 9, percentage: 65 },
        { hour: 12, percentage: 80 },
        { hour: 14, percentage: 92 },
        { hour: 17, percentage: 70 },
        { hour: 20, percentage: 55 },
        { hour: 22, percentage: 40 },
      ]),
  },
  {
    id: 'ai-gpu',
    name: 'AI / GPU',
    description: 'Base 50% with unpredictable training spikes.',
    getPoints: () => createAiGpuTemplatePoints(),
  },
];

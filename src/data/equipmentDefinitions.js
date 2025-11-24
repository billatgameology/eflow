import { createDefaultLoadProfile } from '../utils/loadProfile';

export const EQUIPMENT_CATEGORIES = {
  GENERATION: 'generation',
  DISTRIBUTION: 'distribution',
  PROTECTION: 'protection',
  END_EQUIPMENT: 'end-equipment',
  MONITORING: 'monitoring',
};

export const equipmentDefinitions = {
  // GENERATION
  utility: {
    type: 'utility',
    label: 'Utility Connection',
    category: EQUIPMENT_CATEGORIES.GENERATION,
    color: '#00D9FF',
    defaultParameters: {
      voltage: 13800,
      phases: 3,
      isPowerSource: true,
    },
    ports: {
      input: 0,
      output: 1,
    },
  },

  generator: {
    type: 'generator',
    label: 'Generator',
    category: EQUIPMENT_CATEGORIES.GENERATION,
    color: '#FFD700',
    defaultParameters: {
      voltage: 480,
      phases: 3,
      kwRating: 2000,
      fuelType: 'diesel',
      isPowerSource: true,
    },
    ports: {
      input: 0,
      output: 1,
    },
  },

  ups: {
    type: 'ups',
    label: 'UPS',
    category: EQUIPMENT_CATEGORIES.PROTECTION,
    color: '#00FF9F',
    defaultParameters: {
      voltage: 480,
      kvaRating: 500,
      batteryRuntime: 15,
    },
    ports: {
      input: 1,
      output: 1,
    },
  },

  // DISTRIBUTION
  transformer: {
    type: 'transformer',
    label: 'Transformer',
    category: EQUIPMENT_CATEGORIES.DISTRIBUTION,
    color: '#E5E7EB',
    defaultParameters: {
      primaryVoltage: 13800,
      secondaryVoltage: 480,
      kvaRating: 2500,
      phases: 3,
    },
    ports: {
      input: 1,
      output: 1,
    },
  },

  switchgear: {
    type: 'switchgear',
    label: 'Switchgear',
    category: EQUIPMENT_CATEGORIES.DISTRIBUTION,
    color: '#E5E7EB',
    defaultParameters: {
      voltage: 480,
      ampRating: 4000,
      type: 'main',
    },
    ports: {
      input: 1,
      output: 4,
    },
  },

  ats: {
    type: 'ats',
    label: 'ATS',
    category: EQUIPMENT_CATEGORIES.PROTECTION,
    color: '#E5E7EB',
    defaultParameters: {
      voltage: 480,
      ampRating: 400,
      transferTime: 100,
    },
    ports: {
      input: 2,
      output: 1,
    },
  },

  circuitBreaker: {
    type: 'circuitBreaker',
    label: 'Circuit Breaker',
    category: EQUIPMENT_CATEGORIES.PROTECTION,
    color: '#E5E7EB',
    defaultParameters: {
      voltage: 480,
      ampRating: 100,
      breakerType: 'MCCB',
    },
    ports: {
      input: 1,
      output: 1,
    },
  },

  pdu: {
    type: 'pdu',
    label: 'PDU',
    category: EQUIPMENT_CATEGORIES.DISTRIBUTION,
    color: '#E5E7EB',
    defaultParameters: {
      voltage: 208,
      ampRating: 30,
      outlets: 24,
    },
    ports: {
      input: 1,
      output: 4,
    },
  },

  // END EQUIPMENT
  server: {
    type: 'server',
    label: 'Server Rack',
    category: EQUIPMENT_CATEGORIES.END_EQUIPMENT,
    color: '#9CA3AF',
    defaultParameters: {
      kwRating: 10, // Max Load per rack
      voltage: 208,
      current: 20,
      racksInRow: 1,
    },
    loadProfile: createDefaultLoadProfile(),
    ports: {
      input: 2,
      output: 0,
    },
  },

  // MONITORING
  powerMeter: {
    type: 'powerMeter',
    label: 'Power Meter',
    category: EQUIPMENT_CATEGORIES.MONITORING,
    color: '#00FF9F',
    icon: '📊',
    defaultParameters: {
      monitoredEdgeId: null,
    },
    ports: {
      input: 0,
      output: 0,
    },
  },
};

export const getEquipmentByCategory = (category) => {
  return Object.values(equipmentDefinitions).filter(
    (eq) => eq.category === category
  );
};

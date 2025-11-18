# eFlow - Detailed Implementation Plan

## Project Initialization

### Step 1: Project Setup
```bash
# Create Vite + React project
npm create vite@latest eflow -- --template react

# Install core dependencies
npm install reactflow zustand

# Install Tailwind CSS
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# Install utilities
npm install uuid
npm install clsx # for conditional className management
```

### Step 2: Configure Tailwind
Update `tailwind.config.js` for neon theme:
```js
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        neon: {
          green: '#00FF9F',
          cyan: '#00D9FF',
          magenta: '#FF00FF',
          red: '#FF0055',
          yellow: '#FFFF00',
          gold: '#FFD700',
        },
      },
      boxShadow: {
        'neon-green': '0 0 10px #00FF9F, 0 0 20px #00FF9F',
        'neon-cyan': '0 0 10px #00D9FF, 0 0 20px #00D9FF',
        'neon-red': '0 0 10px #FF0055, 0 0 20px #FF0055',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite',
      },
      keyframes: {
        glow: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.5 },
        },
      },
    },
  },
  plugins: [],
}
```

### Step 3: Update Global Styles
`src/index.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply bg-black text-gray-200;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  }
}

@layer components {
  .neon-border {
    @apply border-2 border-gray-400;
  }

  .neon-border-active {
    @apply border-2 border-neon-green shadow-neon-green;
  }

  .neon-text {
    text-shadow: 0 0 10px currentColor;
  }
}
```

---

## Implementation Phases

## PHASE 1: Project Foundation & Layout (Days 1-3)

### Task 1.1: Create Base Layout Structure
**Files to create:**
- `src/components/Layout/Header.jsx`
- `src/components/Layout/Toolbar.jsx`
- `src/components/Layout/MainLayout.jsx`

**Header Component:**
```jsx
// Features:
// - App title with neon styling
// - Save button
// - Load button
// - Export button
// - Import button (file input)
```

**Toolbar Component:**
```jsx
// Features:
// - Zoom controls (+/-)
// - Fit view button
// - Grid toggle
// - Simulation start/stop button
```

**MainLayout Component:**
```jsx
// Three-column layout:
// - Left: Equipment Panel (250px fixed)
// - Center: Canvas (flex-grow)
// - Right: Properties Panel (300px fixed, collapsible)
```

### Task 1.2: Setup Zustand Stores
**Files to create:**
- `src/stores/useDiagramStore.js`
- `src/stores/useSimulationStore.js`
- `src/stores/useUIStore.js`

**useDiagramStore.js:**
```js
import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';

export const useDiagramStore = create((set, get) => ({
  // State
  diagramId: uuidv4(),
  diagramName: 'Untitled Diagram',
  nodes: [],
  edges: [],
  metadata: {
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },

  // Actions
  addNode: (node) => set((state) => ({
    nodes: [...state.nodes, { ...node, id: node.id || uuidv4() }],
  })),

  updateNode: (id, updates) => set((state) => ({
    nodes: state.nodes.map((node) =>
      node.id === id ? { ...node, ...updates } : node
    ),
  })),

  removeNode: (id) => set((state) => ({
    nodes: state.nodes.filter((node) => node.id !== id),
    edges: state.edges.filter((edge) =>
      edge.source !== id && edge.target !== id
    ),
  })),

  addEdge: (edge) => set((state) => ({
    edges: [...state.edges, { ...edge, id: edge.id || uuidv4() }],
  })),

  removeEdge: (id) => set((state) => ({
    edges: state.edges.filter((edge) => edge.id !== id),
  })),

  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),

  reset: () => set({
    diagramId: uuidv4(),
    diagramName: 'Untitled Diagram',
    nodes: [],
    edges: [],
    metadata: {
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  }),
}));
```

**useSimulationStore.js:**
```js
import { create } from 'zustand';

export const useSimulationStore = create((set, get) => ({
  // State
  isSimulating: false,
  powerSources: [],
  faultedNodes: new Set(),
  faultedEdges: new Set(),
  powerFlowMap: new Map(),

  // Actions
  startSimulation: () => set({ isSimulating: true }),
  stopSimulation: () => set({ isSimulating: false }),

  toggleNodeFault: (nodeId) => set((state) => {
    const newFaulted = new Set(state.faultedNodes);
    if (newFaulted.has(nodeId)) {
      newFaulted.delete(nodeId);
    } else {
      newFaulted.add(nodeId);
    }
    return { faultedNodes: newFaulted };
  }),

  toggleEdgeFault: (edgeId) => set((state) => {
    const newFaulted = new Set(state.faultedEdges);
    if (newFaulted.has(edgeId)) {
      newFaulted.delete(edgeId);
    } else {
      newFaulted.add(edgeId);
    }
    return { faultedEdges: newFaulted };
  }),

  setPowerFlowMap: (map) => set({ powerFlowMap: map }),

  addPowerSource: (source) => set((state) => ({
    powerSources: [...state.powerSources, source],
  })),

  removePowerSource: (sourceId) => set((state) => ({
    powerSources: state.powerSources.filter((s) => s.id !== sourceId),
  })),
}));
```

**useUIStore.js:**
```js
import { create } from 'zustand';

export const useUIStore = create((set) => ({
  // State
  selectedNodeId: null,
  selectedEdgeId: null,
  isPropertiesPanelOpen: true,
  activeTab: 'equipment',

  // Actions
  selectNode: (id) => set({
    selectedNodeId: id,
    selectedEdgeId: null,
    isPropertiesPanelOpen: true,
  }),

  selectEdge: (id) => set({
    selectedEdgeId: id,
    selectedNodeId: null,
    isPropertiesPanelOpen: true,
  }),

  clearSelection: () => set({
    selectedNodeId: null,
    selectedEdgeId: null
  }),

  togglePropertiesPanel: () => set((state) => ({
    isPropertiesPanelOpen: !state.isPropertiesPanelOpen
  })),

  setActiveTab: (tab) => set({ activeTab: tab }),
}));
```

### Task 1.3: Setup React Flow Canvas
**File to create:**
- `src/components/Canvas/Canvas.jsx`

```jsx
import { useCallback } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useDiagramStore } from '../../stores/useDiagramStore';
import { useUIStore } from '../../stores/useUIStore';

export default function Canvas() {
  const { nodes, edges, setNodes, setEdges, addEdge: addEdgeToStore } = useDiagramStore();
  const { selectNode, clearSelection } = useUIStore();

  const onConnect = useCallback(
    (params) => addEdgeToStore(params),
    [addEdgeToStore]
  );

  const onNodeClick = useCallback(
    (event, node) => selectNode(node.id),
    [selectNode]
  );

  const onPaneClick = useCallback(
    () => clearSelection(),
    [clearSelection]
  );

  return (
    <div className="w-full h-full bg-black">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={(changes) => {
          // Handle node changes
        }}
        onEdgesChange={(changes) => {
          // Handle edge changes
        }}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        fitView
      >
        <Background color="#1a1a1a" gap={16} />
        <Controls className="bg-gray-900 border border-gray-700" />
        <MiniMap
          className="bg-gray-900 border border-gray-700"
          nodeColor="#4a5568"
        />
      </ReactFlow>
    </div>
  );
}
```

---

## PHASE 2: Equipment Library & Definitions (Days 4-5)

### Task 2.1: Define Equipment Types
**File to create:**
- `src/data/equipmentDefinitions.js`

```js
export const EQUIPMENT_CATEGORIES = {
  GENERATION: 'generation',
  DISTRIBUTION: 'distribution',
  PROTECTION: 'protection',
  END_EQUIPMENT: 'end-equipment',
};

export const equipmentDefinitions = {
  // GENERATION
  utility: {
    type: 'utility',
    label: 'Utility Connection',
    category: EQUIPMENT_CATEGORIES.GENERATION,
    icon: '⚡',
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
    icon: '🔋',
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
    category: EQUIPMENT_CATEGORIES.GENERATION,
    icon: '🔌',
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
    icon: '⚙️',
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
    icon: '⬜',
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
    icon: '↔️',
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
    icon: '🔲',
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
    icon: '📦',
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
    icon: '🖥️',
    color: '#9CA3AF',
    defaultParameters: {
      voltage: 208,
      powerDraw: 5,
      redundancy: 'dual',
    },
    ports: {
      input: 2,
      output: 0,
    },
  },
};

export const getEquipmentByCategory = (category) => {
  return Object.values(equipmentDefinitions).filter(
    (eq) => eq.category === category
  );
};
```

### Task 2.2: Create Equipment Panel
**File to create:**
- `src/components/EquipmentPanel/EquipmentPanel.jsx`
- `src/components/EquipmentPanel/EquipmentItem.jsx`

**EquipmentPanel.jsx:**
```jsx
import { equipmentDefinitions, EQUIPMENT_CATEGORIES, getEquipmentByCategory } from '../../data/equipmentDefinitions';
import EquipmentItem from './EquipmentItem';

export default function EquipmentPanel() {
  const categories = [
    { id: EQUIPMENT_CATEGORIES.GENERATION, label: 'Power Generation' },
    { id: EQUIPMENT_CATEGORIES.DISTRIBUTION, label: 'Distribution' },
    { id: EQUIPMENT_CATEGORIES.PROTECTION, label: 'Protection' },
    { id: EQUIPMENT_CATEGORIES.END_EQUIPMENT, label: 'End Equipment' },
  ];

  return (
    <div className="w-64 bg-gray-900 border-r border-gray-700 overflow-y-auto">
      <div className="p-4">
        <h2 className="text-lg font-bold text-neon-green neon-text mb-4">
          Equipment Library
        </h2>

        {categories.map((category) => (
          <div key={category.id} className="mb-6">
            <h3 className="text-sm font-semibold text-gray-400 mb-2 uppercase tracking-wide">
              {category.label}
            </h3>
            <div className="space-y-2">
              {getEquipmentByCategory(category.id).map((equipment) => (
                <EquipmentItem key={equipment.type} equipment={equipment} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

**EquipmentItem.jsx:**
```jsx
import { useDiagramStore } from '../../stores/useDiagramStore';

export default function EquipmentItem({ equipment }) {
  const { addNode } = useDiagramStore();

  const onDragStart = (event) => {
    event.dataTransfer.setData('application/reactflow', JSON.stringify(equipment));
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div
      draggable
      onDragStart={onDragStart}
      className="flex items-center gap-3 p-3 bg-gray-800 border border-gray-700 rounded cursor-move hover:border-neon-green hover:shadow-neon-green transition-all"
    >
      <span className="text-2xl">{equipment.icon}</span>
      <span className="text-sm text-gray-200">{equipment.label}</span>
    </div>
  );
}
```

---

## PHASE 3: Custom Node Components (Days 6-8)

### Task 3.1: Create Base Node Component
**File to create:**
- `src/components/nodes/BaseNode.jsx`

```jsx
import { Handle, Position } from 'reactflow';
import { useSimulationStore } from '../../stores/useSimulationStore';
import { useUIStore } from '../../stores/useUIStore';
import DualPowerIndicator from './DualPowerIndicator';

export default function BaseNode({ id, data, selected }) {
  const { faultedNodes, toggleNodeFault, powerFlowMap } = useSimulationStore();
  const isFaulted = faultedNodes.has(id);
  const powerInfo = powerFlowMap.get(id);

  const handleContextMenu = (e) => {
    e.preventDefault();
    toggleNodeFault(id);
  };

  const borderColor = isFaulted
    ? 'border-neon-red shadow-neon-red'
    : selected
    ? 'border-neon-green shadow-neon-green'
    : 'border-gray-400';

  const glowAnimation = selected ? 'animate-pulse-slow' : '';

  return (
    <div
      onContextMenu={handleContextMenu}
      className={`
        relative px-4 py-3 bg-black border-2 rounded-lg min-w-[120px]
        ${borderColor} ${glowAnimation}
        transition-all duration-200
        hover:border-neon-cyan hover:shadow-neon-cyan
      `}
    >
      {/* Input Handles */}
      {data.equipment.ports.input > 0 && (
        Array.from({ length: data.equipment.ports.input }).map((_, i) => (
          <Handle
            key={`input-${i}`}
            type="target"
            position={Position.Top}
            id={`input-${i}`}
            style={{
              left: `${((i + 1) / (data.equipment.ports.input + 1)) * 100}%`,
              background: '#00D9FF',
            }}
          />
        ))
      )}

      {/* Content */}
      <div className="flex flex-col items-center gap-1">
        <span className="text-2xl">{data.equipment.icon}</span>
        <span className="text-xs text-gray-300 font-semibold">
          {data.label || data.equipment.label}
        </span>
        <span className="text-xs text-gray-500">
          {data.parameters?.voltage}V
        </span>
      </div>

      {/* Dual Power Source Indicator - for equipment with 2 inputs receiving power from 2 sources */}
      {data.equipment.ports.input === 2 && powerInfo?.sources?.length === 2 && (
        <DualPowerIndicator sources={powerInfo.sources} />
      )}

      {/* Fault Indicator */}
      {isFaulted && (
        <div className="absolute -top-2 -right-2 w-4 h-4 bg-neon-red rounded-full animate-pulse" />
      )}

      {/* Output Handles */}
      {data.equipment.ports.output > 0 && (
        Array.from({ length: data.equipment.ports.output }).map((_, i) => (
          <Handle
            key={`output-${i}`}
            type="source"
            position={Position.Bottom}
            id={`output-${i}`}
            style={{
              left: `${((i + 1) / (data.equipment.ports.output + 1)) * 100}%`,
              background: '#00FF9F',
            }}
          />
        ))
      )}
    </div>
  );
}
```

### Task 3.2: Create Dual Power Source Indicator Component
**File to create:**
- `src/components/nodes/DualPowerIndicator.jsx`

**Visual Example:**
```
Equipment with dual power sources shows a diagonal split:

┌─────────────────┐
│ A (cyan)  /     │  ← Source A (Utility - Cyan)
│          /      │
│         /       │
│        /        │
│       /  B      │  ← Source B (Generator - Yellow)
│      /  (yellow)│
└─────────────────┘

Used for: ATS, STS, Dual-corded Servers, Redundant PDUs
```

```jsx
/**
 * Visual indicator for equipment with dual power sources
 * Shows diagonal split with each half colored by its power source
 */
export default function DualPowerIndicator({ sources, className = '' }) {
  if (!sources || sources.length !== 2) return null;

  return (
    <svg
      className={`absolute inset-0 w-full h-full pointer-events-none rounded-lg ${className}`}
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
```

### Task 3.3: Register Custom Node Types
**File to create:**
- `src/components/nodes/nodeTypes.js`

```js
import BaseNode from './BaseNode';

// For now, all equipment uses BaseNode
// Later, we can create specialized nodes for specific equipment
export const nodeTypes = {
  utility: BaseNode,
  generator: BaseNode,
  ups: BaseNode,
  transformer: BaseNode,
  switchgear: BaseNode,
  ats: BaseNode,
  circuitBreaker: BaseNode,
  pdu: BaseNode,
  server: BaseNode,
};
```

### Task 3.3: Update Canvas to Support Drop
Update `Canvas.jsx`:
```jsx
const onDrop = useCallback(
  (event) => {
    event.preventDefault();

    const equipmentData = JSON.parse(
      event.dataTransfer.getData('application/reactflow')
    );

    const position = reactFlowInstance.screenToFlowPosition({
      x: event.clientX,
      y: event.clientY,
    });

    const newNode = {
      id: uuidv4(),
      type: equipmentData.type,
      position,
      data: {
        label: equipmentData.label,
        equipment: equipmentData,
        parameters: { ...equipmentData.defaultParameters },
      },
    };

    addNode(newNode);
  },
  [reactFlowInstance, addNode]
);

const onDragOver = useCallback((event) => {
  event.preventDefault();
  event.dataTransfer.dropEffect = 'move';
}, []);

// Add to ReactFlow component
<ReactFlow
  onDrop={onDrop}
  onDragOver={onDragOver}
  // ... other props
>
```

---

## PHASE 4: Properties Panel (Days 9-10)

### Task 4.1: Create Properties Panel
**File to create:**
- `src/components/PropertiesPanel/PropertiesPanel.jsx`
- `src/components/PropertiesPanel/NodeProperties.jsx`

**PropertiesPanel.jsx:**
```jsx
import { useUIStore } from '../../stores/useUIStore';
import { useDiagramStore } from '../../stores/useDiagramStore';
import NodeProperties from './NodeProperties';

export default function PropertiesPanel() {
  const { selectedNodeId, isPropertiesPanelOpen, togglePropertiesPanel } = useUIStore();
  const { nodes } = useDiagramStore();

  const selectedNode = nodes.find((n) => n.id === selectedNodeId);

  if (!isPropertiesPanelOpen) {
    return (
      <button
        onClick={togglePropertiesPanel}
        className="fixed right-0 top-1/2 bg-gray-900 border border-gray-700 p-2 rounded-l"
      >
        ←
      </button>
    );
  }

  return (
    <div className="w-80 bg-gray-900 border-l border-gray-700 overflow-y-auto">
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-neon-green">Properties</h2>
          <button
            onClick={togglePropertiesPanel}
            className="text-gray-400 hover:text-white"
          >
            →
          </button>
        </div>

        {selectedNode ? (
          <NodeProperties node={selectedNode} />
        ) : (
          <p className="text-gray-500 text-sm">Select an element to edit properties</p>
        )}
      </div>
    </div>
  );
}
```

**NodeProperties.jsx:**
```jsx
import { useDiagramStore } from '../../stores/useDiagramStore';

export default function NodeProperties({ node }) {
  const { updateNode } = useDiagramStore();

  const handleLabelChange = (e) => {
    updateNode(node.id, {
      data: { ...node.data, label: e.target.value },
    });
  };

  const handleParameterChange = (key, value) => {
    updateNode(node.id, {
      data: {
        ...node.data,
        parameters: {
          ...node.data.parameters,
          [key]: value,
        },
      },
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-400 mb-1">
          Label
        </label>
        <input
          type="text"
          value={node.data.label}
          onChange={handleLabelChange}
          className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:border-neon-green focus:outline-none"
        />
      </div>

      <div className="border-t border-gray-700 pt-4">
        <h3 className="text-sm font-semibold text-gray-400 mb-2">Parameters</h3>

        {Object.entries(node.data.parameters).map(([key, value]) => (
          <div key={key} className="mb-3">
            <label className="block text-xs text-gray-500 mb-1 capitalize">
              {key.replace(/([A-Z])/g, ' $1').trim()}
            </label>
            <input
              type={typeof value === 'number' ? 'number' : 'text'}
              value={value}
              onChange={(e) => handleParameterChange(key,
                typeof value === 'number' ? Number(e.target.value) : e.target.value
              )}
              className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm text-white focus:border-neon-cyan focus:outline-none"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## PHASE 5: Power Flow Simulation (Days 11-14)

### Task 5.1: Create Power Flow Calculator
**File to create:**
- `src/utils/powerFlowCalculator.js`

```js
/**
 * Calculate power flow through the diagram
 * Returns a Map of nodeId -> { sources: [], color: string, isPowered: boolean }
 */
export function calculatePowerFlow(nodes, edges, powerSources, faultedNodes, faultedEdges) {
  const powerFlowMap = new Map();

  // Initialize all nodes as unpowered
  nodes.forEach((node) => {
    powerFlowMap.set(node.id, {
      sources: [],
      color: null,
      isPowered: false,
    });
  });

  // For each power source, traverse the graph
  powerSources.forEach((source) => {
    const visited = new Set();
    const queue = [source.nodeId];

    while (queue.length > 0) {
      const currentNodeId = queue.shift();

      // Skip if already visited
      if (visited.has(currentNodeId)) continue;
      visited.add(currentNodeId);

      // Skip if node is faulted
      if (faultedNodes.has(currentNodeId)) continue;

      // Get current node
      const currentNode = nodes.find((n) => n.id === currentNodeId);
      if (!currentNode) continue;

      // Mark as powered from this source
      const powerInfo = powerFlowMap.get(currentNodeId);
      powerInfo.sources.push(source);
      powerInfo.isPowered = true;

      // Set color (if multiple sources, use gradient or primary source color)
      if (powerInfo.sources.length === 1) {
        powerInfo.color = source.color;
      } else {
        // Multiple sources - use a blend or special color
        powerInfo.color = '#FFFFFF'; // White for redundant power
      }

      // Find outgoing edges from this node
      const outgoingEdges = edges.filter((edge) => edge.source === currentNodeId);

      outgoingEdges.forEach((edge) => {
        // Skip faulted edges
        if (faultedEdges.has(edge.id)) return;

        // Add target to queue
        if (!visited.has(edge.target)) {
          queue.push(edge.target);
        }
      });
    }
  });

  return powerFlowMap;
}

/**
 * Get power sources from nodes
 */
export function extractPowerSources(nodes) {
  return nodes
    .filter((node) => node.data.parameters?.isPowerSource)
    .map((node) => ({
      id: node.id,
      nodeId: node.id,
      color: node.data.equipment?.color || '#00D9FF',
      label: node.data.label,
    }));
}
```

### Task 5.2: Create Simulation Hook
**File to create:**
- `src/hooks/useSimulation.js`

```js
import { useEffect } from 'react';
import { useDiagramStore } from '../stores/useDiagramStore';
import { useSimulationStore } from '../stores/useSimulationStore';
import { calculatePowerFlow, extractPowerSources } from '../utils/powerFlowCalculator';

export function useSimulation() {
  const { nodes, edges } = useDiagramStore();
  const {
    isSimulating,
    faultedNodes,
    faultedEdges,
    powerSources,
    setPowerFlowMap
  } = useSimulationStore();

  useEffect(() => {
    if (!isSimulating) return;

    // Recalculate power flow
    const flowMap = calculatePowerFlow(
      nodes,
      edges,
      powerSources,
      faultedNodes,
      faultedEdges
    );

    setPowerFlowMap(flowMap);
  }, [nodes, edges, powerSources, faultedNodes, faultedEdges, isSimulating, setPowerFlowMap]);

  // Auto-update power sources when nodes change
  useEffect(() => {
    const sources = extractPowerSources(nodes);
    // Update sources in store (you'll need to add this action)
    // For now, this is a placeholder
  }, [nodes]);
}
```

### Task 5.3: Create Custom Edge with Animation
**File to create:**
- `src/components/edges/PowerEdge.jsx`

```jsx
import { getBezierPath, EdgeLabelRenderer } from 'reactflow';
import { useSimulationStore } from '../../stores/useSimulationStore';

export default function PowerEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
}) {
  const { faultedEdges, isSimulating } = useSimulationStore();
  const isFaulted = faultedEdges.has(id);

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const edgeColor = isFaulted ? '#FF0055' : isSimulating ? '#00FF9F' : '#4A5568';
  const strokeWidth = isFaulted ? 3 : isSimulating ? 2 : 1.5;

  return (
    <>
      <path
        id={id}
        className={isSimulating && !isFaulted ? 'animate-pulse-slow' : ''}
        style={{
          ...style,
          stroke: edgeColor,
          strokeWidth,
          filter: isSimulating && !isFaulted
            ? 'drop-shadow(0 0 4px #00FF9F)'
            : isFaulted
            ? 'drop-shadow(0 0 4px #FF0055)'
            : 'none',
        }}
        d={edgePath}
        markerEnd={markerEnd}
      />

      {/* Animated flow particles */}
      {isSimulating && !isFaulted && (
        <circle r="3" fill={edgeColor} className="animate-flow">
          <animateMotion dur="2s" repeatCount="indefinite" path={edgePath} />
        </circle>
      )}
    </>
  );
}
```

**Add to nodeTypes.js:**
```js
import PowerEdge from '../edges/PowerEdge';

export const edgeTypes = {
  power: PowerEdge,
};
```

### Task 5.4: Update Nodes to Show Power Status
Update `BaseNode.jsx` to visualize power flow:
```jsx
const { powerFlowMap } = useSimulationStore();
const powerInfo = powerFlowMap.get(id);

// Update border color based on power status
const borderColor = isFaulted
  ? 'border-neon-red shadow-neon-red'
  : powerInfo?.isPowered
  ? `border-[${powerInfo.color}]`
  : selected
  ? 'border-neon-green shadow-neon-green'
  : 'border-gray-400';
```

---

## PHASE 6: Data Persistence (Days 15-16)

### Task 6.1: Create Persistence Utilities
**File to create:**
- `src/utils/persistence.js`

```js
const STORAGE_KEY = 'eflow_diagrams';
const AUTOSAVE_KEY = 'eflow_autosave';

export function saveDiagramToLocalStorage(diagram) {
  try {
    const diagrams = getAllDiagrams();
    const index = diagrams.findIndex((d) => d.id === diagram.id);

    if (index >= 0) {
      diagrams[index] = diagram;
    } else {
      diagrams.push(diagram);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(diagrams));
    return true;
  } catch (error) {
    console.error('Failed to save diagram:', error);
    return false;
  }
}

export function getAllDiagrams() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Failed to load diagrams:', error);
    return [];
  }
}

export function getDiagramById(id) {
  const diagrams = getAllDiagrams();
  return diagrams.find((d) => d.id === id);
}

export function deleteDiagram(id) {
  const diagrams = getAllDiagrams();
  const filtered = diagrams.filter((d) => d.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
}

export function exportDiagramToFile(diagram) {
  const dataStr = JSON.stringify(diagram, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `${diagram.name.replace(/\s/g, '_')}_${diagram.id}.json`;
  link.click();

  URL.revokeObjectURL(url);
}

export function importDiagramFromFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const diagram = JSON.parse(e.target.result);
        resolve(diagram);
      } catch (error) {
        reject(new Error('Invalid diagram file'));
      }
    };

    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}

// Auto-save functionality
export function autoSave(diagram) {
  try {
    localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(diagram));
  } catch (error) {
    console.error('Auto-save failed:', error);
  }
}

export function loadAutoSave() {
  try {
    const data = localStorage.getItem(AUTOSAVE_KEY);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    return null;
  }
}
```

### Task 6.2: Add Persistence Actions to Store
Update `useDiagramStore.js`:
```js
import { saveDiagramToLocalStorage, exportDiagramToFile } from '../utils/persistence';

// Add to store
saveDiagram: () => {
  const state = get();
  const diagram = {
    id: state.diagramId,
    name: state.diagramName,
    nodes: state.nodes,
    edges: state.edges,
    metadata: {
      ...state.metadata,
      updatedAt: new Date().toISOString(),
    },
  };
  saveDiagramToLocalStorage(diagram);
},

loadDiagram: (diagram) => {
  set({
    diagramId: diagram.id,
    diagramName: diagram.name,
    nodes: diagram.nodes,
    edges: diagram.edges,
    metadata: diagram.metadata,
  });
},

exportDiagram: () => {
  const state = get();
  const diagram = {
    id: state.diagramId,
    name: state.diagramName,
    nodes: state.nodes,
    edges: state.edges,
    metadata: state.metadata,
  };
  exportDiagramToFile(diagram);
},
```

### Task 6.3: Create Save/Load UI
**File to create:**
- `src/components/Dialogs/SaveLoadDialog.jsx`

```jsx
import { useState } from 'react';
import { getAllDiagrams, importDiagramFromFile } from '../../utils/persistence';
import { useDiagramStore } from '../../stores/useDiagramStore';

export default function SaveLoadDialog({ isOpen, onClose, mode }) {
  const { saveDiagram, loadDiagram, exportDiagram, diagramName, setDiagramName } = useDiagramStore();
  const [diagrams, setDiagrams] = useState(getAllDiagrams());

  const handleSave = () => {
    saveDiagram();
    onClose();
  };

  const handleLoad = (diagram) => {
    loadDiagram(diagram);
    onClose();
  };

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const diagram = await importDiagramFromFile(file);
        loadDiagram(diagram);
        onClose();
      } catch (error) {
        alert('Failed to import diagram');
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 max-w-md w-full">
        <h2 className="text-xl font-bold text-neon-green mb-4">
          {mode === 'save' ? 'Save Diagram' : 'Load Diagram'}
        </h2>

        {mode === 'save' ? (
          <div>
            <input
              type="text"
              value={diagramName}
              onChange={(e) => setDiagramName(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 mb-4"
              placeholder="Diagram name"
            />
            <div className="flex gap-2">
              <button onClick={handleSave} className="btn-primary">Save</button>
              <button onClick={onClose} className="btn-secondary">Cancel</button>
            </div>
          </div>
        ) : (
          <div>
            <div className="mb-4">
              <label className="btn-secondary cursor-pointer">
                Import from file
                <input type="file" accept=".json" onChange={handleImport} className="hidden" />
              </label>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto">
              {diagrams.map((diagram) => (
                <div
                  key={diagram.id}
                  onClick={() => handleLoad(diagram)}
                  className="p-3 bg-gray-800 border border-gray-700 rounded cursor-pointer hover:border-neon-cyan"
                >
                  <div className="font-semibold">{diagram.name}</div>
                  <div className="text-xs text-gray-500">
                    {new Date(diagram.metadata.updatedAt).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>

            <button onClick={onClose} className="btn-secondary mt-4">Cancel</button>
          </div>
        )}
      </div>
    </div>
  );
}
```

---

## PHASE 7: Polish & Enhancements (Days 17-20)

### Task 7.1: Add Toolbar Controls
Implement zoom, fit view, grid toggle, simulation controls

### Task 7.2: Add Keyboard Shortcuts
- Delete: Remove selected node/edge
- Ctrl+S: Save
- Ctrl+Z: Undo (future enhancement)
- Escape: Clear selection

### Task 7.3: Add Context Menus
Right-click menus for:
- Nodes: Inject fault, duplicate, delete
- Edges: Inject fault, delete
- Canvas: Fit view, clear selection

### Task 7.4: Animation Refinements
- Smooth power flow animations
- Pulse effects on powered equipment
- Particle effects along edges

### Task 7.5: Responsive Design
- Mobile-friendly layout
- Collapsible panels
- Touch gestures support

---

## Testing Checklist

### Functional Testing
- [ ] Drag and drop equipment from panel
- [ ] Create connections between nodes
- [ ] Edit equipment parameters
- [ ] Delete nodes and edges
- [ ] Save diagram to localStorage
- [ ] Load diagram from localStorage
- [ ] Export diagram as JSON
- [ ] Import diagram from JSON file
- [ ] Start/stop simulation
- [ ] Inject faults on nodes
- [ ] Inject faults on edges
- [ ] Power flow calculation accuracy
- [ ] Multiple power sources handling
- [ ] Redundant power visualization

### Visual Testing
- [ ] Neon glow effects
- [ ] Hover states
- [ ] Selection highlighting
- [ ] Fault indicators
- [ ] Power flow animations
- [ ] Color coding for power sources
- [ ] Dark theme consistency

### Performance Testing
- [ ] 100+ nodes performance
- [ ] Real-time simulation updates
- [ ] Canvas zoom/pan smoothness
- [ ] Auto-save performance

### Edge Cases
- [ ] Empty diagram
- [ ] Disconnected equipment
- [ ] Circular power flow
- [ ] All nodes faulted
- [ ] Invalid connections

---

## Deployment

### Build for Production
```bash
npm run build
```

### Deploy Options
1. **Static hosting** (Vercel, Netlify, GitHub Pages)
2. **Self-hosted** (Docker, Apache, Nginx)

### Environment Variables
Create `.env.production`:
```
VITE_APP_TITLE=eFlow
VITE_VERSION=1.0.0
```

---

## Future Roadmap

### v1.1 - Enhanced Functionality
- Undo/Redo system
- Copy/Paste nodes
- Equipment templates
- Diagram layers

### v1.2 - Advanced Features
- Electrical calculations (voltage drop, load flow)
- Equipment library expansion
- Custom equipment creator
- Multi-page diagrams

### v1.3 - Collaboration
- Cloud storage (Firebase, Supabase)
- Real-time collaboration
- Sharing and permissions
- Comments and annotations

### v2.0 - Professional Features
- PDF export with annotations
- Automated diagram generation
- Integration with DCIM systems
- Compliance checking

---

**Document Version**: 1.0
**Last Updated**: 2025-01-17

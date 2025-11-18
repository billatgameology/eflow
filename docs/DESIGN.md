# eFlow - Electrical Single Line Diagram Designer

## Project Overview

eFlow is a modern, interactive web application for creating electrical single line diagrams commonly used in data centers. The application provides a visual, drag-and-drop interface for designing electrical distribution systems from substations down to IT servers, with real-time power flow simulation and fault analysis capabilities.

## Tech Stack

- **Framework**: React 18+ with Vite
- **Diagram Library**: React Flow
- **State Management**: Zustand
- **Styling**: Tailwind CSS
- **Data Persistence**: LocalStorage with JSON export/import
- **Language**: JavaScript/TypeScript (recommended TypeScript)

## Core Features

### 1. Equipment Library Panel
A sidebar panel containing draggable electrical equipment components:
- **Power Generation**
  - Utility Connection/Substation
  - Generators
  - UPS Systems

- **Distribution Equipment**
  - Transformers (step-down/step-up)
  - Switchgear
  - Circuit Breakers
  - Automatic Transfer Switches (ATS)
  - Static Transfer Switches (STS)

- **Power Distribution**
  - Main Distribution Panels
  - PDUs (Power Distribution Units)
  - Remote Power Panels (RPP)
  - Busbars

- **End Equipment**
  - Server Racks
  - IT Equipment
  - HVAC Systems

### 2. Drawing Canvas
- **Black background** with neon-style equipment outlines
- Infinite canvas with pan and zoom capabilities
- Grid/snap-to-grid option for precise alignment
- Equipment nodes with customizable parameters
- Connectors/edges representing electrical connections

### 3. Equipment Configuration
Each equipment type has specific parameters:
- **Common Properties**
  - Name/Label
  - Voltage Rating
  - Current Rating
  - Status (On/Off, Faulted)
  - Position on canvas

- **Specific Properties**
  - Transformers: Primary/Secondary voltage, kVA rating
  - Circuit Breakers: Trip rating, type (ACB, MCCB, MCB)
  - UPS: Capacity, battery runtime
  - Generators: kW capacity, fuel type
  - PDUs: Input/output count, redundancy

### 4. Power Flow Simulation
- **Visual Power Tracing**
  - Color-coded power sources (different colors for different sources)
  - Animated flow indicators showing electricity direction
  - Equipment status indicators (powered/unpowered)

- **Redundancy Visualization**
  - Multiple power sources shown with blended/alternating colors
  - A/B power path differentiation
  - Automatic failover path highlighting

- **Fault Simulation**
  - Click to toggle equipment/connection faults
  - Real-time update of downstream affected equipment
  - Visual indication of power loss propagation

### 5. Data Persistence
- **Auto-save** to localStorage
- **Manual Save**: Named diagram saves
- **Export**: Download diagram as JSON file
- **Import**: Load diagram from JSON file
- **Version tracking** for diagram iterations

## Visual Design System

### Color Palette
```
Background: #000000 (Pure Black)
Equipment Outlines: #E5E7EB (Light Gray - Default)
Active/Selected: #00FF9F (Neon Green)
Fault/Error: #FF0055 (Neon Red)
Warning: #FFD700 (Neon Gold)

Power Source Colors:
- Source A: #00D9FF (Cyan)
- Source B: #FF00FF (Magenta)
- Source C: #FFFF00 (Yellow)
- Redundant: Gradient/Pulse between sources
```

### Visual Effects
- **Neon Glow**: CSS drop-shadow and box-shadow for glow effects
- **Hover States**: Subtle brightness increase + glow intensification
- **Selection**: Strong neon outline with pulsing animation
- **Power Flow**: Animated dashed lines or particle effects along connections
- **Fault State**: Pulsing red glow
- **Dual Power Source Indicator**: Equipment with 2 inputs shows a diagonal split with each half colored by its respective power source
  - Square/rectangle divided by diagonal line
  - Left/top half: Source A color
  - Right/bottom half: Source B color
  - Used for ATS, STS, dual-corded servers, and redundant equipment

### Typography
- **Headers**: Monospace, futuristic font (e.g., JetBrains Mono, Fira Code)
- **Labels**: Sans-serif, clean and readable
- **Equipment Text**: White/Light gray, high contrast on black

## Data Structure

### Diagram Schema
```json
{
  "id": "diagram-uuid",
  "name": "Main Data Center SLD",
  "version": "1.0.0",
  "createdAt": "2025-01-17T00:00:00Z",
  "updatedAt": "2025-01-17T00:00:00Z",
  "metadata": {
    "author": "User Name",
    "facility": "DC1",
    "description": "Main electrical distribution"
  },
  "nodes": [
    {
      "id": "node-1",
      "type": "transformer",
      "position": { "x": 100, "y": 100 },
      "data": {
        "label": "TX-01",
        "equipmentType": "transformer",
        "parameters": {
          "primaryVoltage": 13800,
          "secondaryVoltage": 480,
          "kvaRating": 2500,
          "phases": 3
        },
        "status": "active",
        "isFaulted": false
      }
    }
  ],
  "edges": [
    {
      "id": "edge-1",
      "source": "node-1",
      "target": "node-2",
      "type": "power",
      "data": {
        "voltage": 480,
        "isActive": true,
        "isFaulted": false,
        "powerSource": "sourceA"
      }
    }
  ],
  "simulation": {
    "powerSources": [
      {
        "id": "sourceA",
        "nodeId": "utility-1",
        "color": "#00D9FF",
        "label": "Utility A"
      }
    ]
  }
}
```

### Equipment Type Definitions
```typescript
interface EquipmentDefinition {
  type: string;
  category: 'generation' | 'distribution' | 'protection' | 'end-equipment';
  icon: string; // SVG path or component
  defaultParameters: Record<string, any>;
  inputPorts: number;
  outputPorts: number;
  configSchema: ConfigField[];
}
```

## State Management Architecture

### Zustand Stores

#### 1. Diagram Store
```typescript
interface DiagramStore {
  // Diagram metadata
  diagramId: string;
  diagramName: string;
  metadata: DiagramMetadata;

  // React Flow state
  nodes: Node[];
  edges: Edge[];

  // Actions
  addNode: (node: Node) => void;
  updateNode: (id: string, updates: Partial<Node>) => void;
  removeNode: (id: string) => void;
  addEdge: (edge: Edge) => void;
  removeEdge: (id: string) => void;

  // Persistence
  saveDiagram: () => void;
  loadDiagram: (id: string) => void;
  exportDiagram: () => void;
  importDiagram: (data: DiagramData) => void;
}
```

#### 2. Simulation Store
```typescript
interface SimulationStore {
  // Simulation state
  isSimulating: boolean;
  powerSources: PowerSource[];
  powerFlowMap: Map<string, PowerFlow>;

  // Actions
  startSimulation: () => void;
  stopSimulation: () => void;
  toggleFault: (nodeId: string) => void;
  calculatePowerFlow: () => void;
  tracePowerPath: (nodeId: string) => string[];
}
```

#### 3. UI Store
```typescript
interface UIStore {
  // UI state
  selectedNodeId: string | null;
  selectedEdgeId: string | null;
  isPanelOpen: boolean;
  activeTab: 'equipment' | 'properties' | 'simulation';

  // Actions
  selectNode: (id: string) => void;
  selectEdge: (id: string) => void;
  togglePanel: () => void;
  setActiveTab: (tab: string) => void;
}
```

## Component Architecture

### Layout Components
```
App
├── Header (App title, save/load controls)
├── Toolbar (Zoom, grid, simulation controls)
├── EquipmentPanel (Draggable equipment library)
├── Canvas (React Flow diagram area)
├── PropertiesPanel (Selected equipment configuration)
└── SimulationPanel (Power flow controls, fault injection)
```

### Custom Node Components
Each equipment type gets a custom React Flow node:
- `TransformerNode`
- `CircuitBreakerNode`
- `SwitchgearNode`
- `UPSNode`
- `GeneratorNode`
- `PDUNode`
- `ServerNode`
- etc.

### Custom Edge Components
- `PowerEdge` - Animated power flow line
- `FaultedEdge` - Red, disconnected state

## Power Flow Algorithm

### Basic Logic
1. **Identify Power Sources**: Find all nodes marked as power sources (utility, generators)
2. **Traverse Graph**: BFS/DFS from each source through edges
3. **Mark Powered Nodes**: Track which nodes receive power and from which source
4. **Handle Faults**: Skip faulted nodes/edges during traversal
5. **Color Assignment**: Apply source color to all powered nodes
6. **Redundancy Detection**: Nodes with multiple sources get special styling

### Pseudocode
```
function calculatePowerFlow(diagram):
  powerMap = new Map()

  for each powerSource in diagram.powerSources:
    visited = new Set()
    queue = [powerSource.nodeId]

    while queue not empty:
      currentNode = queue.shift()

      if currentNode is faulted:
        continue

      powerMap.set(currentNode, {
        sources: [...existing, powerSource],
        color: powerSource.color
      })

      for each edge from currentNode:
        if edge not faulted and target not visited:
          queue.push(edge.target)
          visited.add(edge.target)

  return powerMap
```

## User Interactions

### Drag and Drop Workflow
1. User clicks equipment from panel
2. Drag onto canvas
3. On drop, create new node at cursor position
4. Open properties panel for configuration

### Connection Creation
1. Click source node output port
2. Drag to target node input port
3. Create edge with default properties
4. Validate connection (e.g., voltage compatibility)

### Equipment Configuration
1. Click node to select
2. Properties panel opens on right
3. Edit parameters in form
4. Changes auto-save and trigger simulation update

### Fault Simulation
1. Right-click node or edge
2. Context menu: "Inject Fault" / "Clear Fault"
3. Visual update: Red glow, power flow recalculation
4. Downstream equipment shows unpowered state

## File Structure
```
eflow/
├── public/
├── src/
│   ├── components/
│   │   ├── Canvas/
│   │   │   ├── Canvas.jsx
│   │   │   └── Canvas.module.css
│   │   ├── EquipmentPanel/
│   │   │   ├── EquipmentPanel.jsx
│   │   │   ├── EquipmentItem.jsx
│   │   │   └── equipmentDefinitions.js
│   │   ├── Header/
│   │   ├── Toolbar/
│   │   ├── PropertiesPanel/
│   │   ├── SimulationPanel/
│   │   └── nodes/
│   │       ├── TransformerNode.jsx
│   │       ├── CircuitBreakerNode.jsx
│   │       ├── PDUNode.jsx
│   │       └── ...
│   ├── stores/
│   │   ├── useDiagramStore.js
│   │   ├── useSimulationStore.js
│   │   └── useUIStore.js
│   ├── utils/
│   │   ├── powerFlowCalculator.js
│   │   ├── diagramValidator.js
│   │   ├── exportImport.js
│   │   └── localStorage.js
│   ├── types/
│   │   └── index.ts (if using TypeScript)
│   ├── styles/
│   │   └── globals.css
│   ├── App.jsx
│   └── main.jsx
├── package.json
├── vite.config.js
├── tailwind.config.js
└── README.md
```

## Performance Considerations

1. **Canvas Optimization**
   - Use React Flow's built-in virtualization
   - Limit max nodes (warn at 500+)
   - Debounce auto-save operations

2. **Power Flow Calculation**
   - Only recalculate on topology changes or fault events
   - Cache results for repeated queries
   - Use memoization for complex derivations

3. **Rendering**
   - SVG for simple equipment shapes
   - Canvas for complex animations (if needed)
   - CSS transforms for smooth interactions

## Future Enhancements (Post-MVP)

- [ ] Multi-page diagrams (linked diagrams)
- [ ] Equipment templates and libraries
- [ ] Collaborative editing (real-time with WebSocket)
- [ ] Advanced calculations (load flow, voltage drop)
- [ ] PDF/PNG export with annotations
- [ ] Equipment search and filtering
- [ ] Undo/Redo with history
- [ ] Keyboard shortcuts
- [ ] Custom equipment creation
- [ ] Cloud storage integration

## Development Phases

### Phase 1: Foundation (Week 1-2)
- Project setup with Vite + React
- Install dependencies (React Flow, Zustand, Tailwind)
- Basic layout and component structure
- Initial Zustand stores

### Phase 2: Core Diagram Features (Week 3-4)
- Equipment panel with 5-6 basic equipment types
- Drag and drop functionality
- Node and edge creation/deletion
- Properties panel for basic configuration

### Phase 3: Visual Design (Week 5)
- Implement neon/futuristic styling
- Custom node designs for each equipment type
- Hover, selection, and glow effects
- Responsive layout

### Phase 4: Power Flow Simulation (Week 6-7)
- Power flow calculation algorithm
- Color-coded power source visualization
- Animated power flow on edges
- Fault injection and propagation

### Phase 5: Persistence (Week 8)
- LocalStorage auto-save
- JSON export/import
- Diagram management (save, load, delete)

### Phase 6: Polish & Testing (Week 9-10)
- Bug fixes and edge cases
- Performance optimization
- User testing and feedback
- Documentation

## Success Metrics

- **Usability**: User can create a basic SLD in < 5 minutes
- **Performance**: Smooth 60fps interaction with 100+ nodes
- **Reliability**: No data loss with auto-save
- **Visual Appeal**: Distinct futuristic neon aesthetic
- **Functionality**: Accurate power flow simulation for common scenarios

---

**Document Version**: 1.0
**Last Updated**: 2025-01-17
**Author**: eFlow Team

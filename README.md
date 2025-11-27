# eFlow

**Interactive Electrical Single-Line Diagram Designer for Datacenter Power Distribution Systems**

eFlow is a web-based visual tool for designing, simulating, and analyzing electrical power distribution systems in datacenters. Create single-line diagrams, simulate power flow, monitor load distribution, and verify system integrity through interactive visual modeling.

## Features

### Core Functionality

- **Visual Diagram Editor**: Drag-and-drop interface built on ReactFlow for creating electrical single-line diagrams
- **Real-Time Power Flow Simulation**: Simulates actual electrical behavior with accurate power flow calculations
- **Load Profile Management**: Define and visualize time-varying load patterns for servers and equipment
- **Overload Protection**: Automatic fault detection when equipment exceeds rated capacity (105% threshold)
- **Interactive Simulation**: 24-hour simulation with adjustable time controls
- **Auto-Save**: Automatic diagram persistence every 30 seconds

### Electrical Equipment Library

**Power Generation**
- Utility Connections (13.8kV, 3-phase)
- Generators (configurable voltage and capacity)

**Distribution Equipment**
- Switchgear (with amperage ratings and phase configuration)
- Transformers (voltage conversion with IEEE-standard symbols)
- UPS Systems (battery backup protection)
- Automatic Transfer Switches (ATS) - dual power source switching
- Power Distribution Units (PDUs)
- Circuit Breakers (with current ratings)

**End Equipment**
- Server Racks (configurable load profiles and rack counts)
- Power Meters (real-time monitoring)

**Visualization**
- Load Profile Nodes (graphical display of utilization curves)
- Dual Power Indicators (redundancy visualization)

### Design Features

- **Voltage Compatibility Checking**: Prevents invalid connections between incompatible voltages
- **Color-Coded Measurements**:
  - Voltage (V) - Grey (#9CA3AF)
  - Current (A) - Green (#00FF9F)
  - Power (kW) - Cyan (#00D9FF)
- **Animated Power Flow**: Visual electricity flow along connections with normalized speeds
- **Fault Indication**: Clear visual feedback when equipment fails or overloads
- **Manual Reset**: Realistic circuit breaker behavior requiring manual intervention

### User Experience

- **Keyboard Shortcuts**:
  - `Ctrl/Cmd + S` - Save diagram
  - `Ctrl/Cmd + C/V` - Copy/paste equipment
  - `Ctrl/Cmd + Z/Y` - Undo/redo
  - `Delete/Backspace` - Remove selected items
- **Properties Panel**: Edit equipment parameters in real-time
- **Context Menus**: Right-click access to common operations
- **Grid Snapping**: Precise alignment tools
- **Import/Export**: Save diagrams as JSON files for sharing
- **Multiple Diagrams**: Manage multiple designs with localStorage persistence

## Technology Stack

- **React 19** - Modern UI framework
- **ReactFlow** - Interactive node-based diagrams
- **Zustand** - Lightweight state management
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first styling
- **LocalStorage** - Client-side persistence

## Installation

### Prerequisites

- Node.js 18+ and npm

### Setup

1. Clone the repository:
```bash
git clone https://github.com/billatgameology/eflow.git
cd eflow
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser to `http://localhost:5173`

### Build for Production

```bash
npm run build
npm run preview  # Preview production build locally
```

The production build will be in the `dist/` directory.

## Usage

### Getting Started

1. **Add Equipment**: Drag components from the equipment panel onto the canvas
2. **Connect Components**: Click and drag from output ports to input ports
3. **Configure Parameters**: Select equipment and edit properties in the right panel
4. **Start Simulation**: Click the play button to begin power flow simulation
5. **Monitor System**: Watch real-time power, current, and voltage readings
6. **Manage Faults**: Click fault indicators to reset tripped breakers

### Creating a Basic Power Distribution System

1. Add a **Utility Connection** as your power source
2. Connect to **Switchgear** for distribution
3. Add a **Transformer** if voltage conversion is needed
4. Connect **Circuit Breakers** for protection
5. Add **PDUs** for final distribution
6. Connect **Server Racks** as loads
7. Configure load profiles for realistic utilization patterns
8. Run simulation to verify system capacity

### Load Profiles

Load profiles define how equipment utilization varies over 24 hours:

1. Select a server node
2. Open the Load Profile Editor in the properties panel
3. Choose a template (Constant, Peak Hours, Night Batch, etc.) or create custom
4. Define data points (hour, utilization percentage)
5. Attach a Load Profile visualization node for graphical display

### Fault Management

When equipment overloads (>105% of rated capacity):
- Equipment automatically faults and displays a fault indicator
- Downstream power flow stops
- All downstream loads show 0kW
- Click the fault button to manually reset after addressing the overload

## Project Structure

```
eflow/
├── src/
│   ├── components/
│   │   ├── Canvas/           # Main ReactFlow canvas
│   │   ├── ContextMenu/      # Right-click menus
│   │   ├── Dialogs/          # Save/Load dialogs
│   │   ├── EquipmentPanel/   # Draggable equipment library
│   │   ├── Layout/           # App shell, header, toolbar
│   │   ├── PropertiesPanel/  # Equipment configuration UI
│   │   ├── edges/            # Custom edge components
│   │   └── nodes/            # Custom node components
│   ├── data/
│   │   └── equipmentDefinitions.js  # Equipment specifications
│   ├── hooks/
│   │   ├── useKeyboardShortcuts.js  # Keyboard event handling
│   │   └── useSimulation.js         # Simulation loop
│   ├── stores/
│   │   ├── useDiagramStore.js       # Diagram state (nodes, edges)
│   │   ├── useSimulationStore.js    # Simulation state (power flow)
│   │   └── useUIStore.js            # UI state (selection, clipboard)
│   ├── utils/
│   │   ├── loadProfile.js           # Load profile utilities
│   │   ├── persistence.js           # LocalStorage operations
│   │   └── powerFlowCalculator.js   # Electrical calculations
│   ├── App.jsx              # Root component
│   ├── main.jsx            # Application entry point
│   └── index.css           # Global styles
├── docs/
│   └── DESIGN.md           # Architecture and design decisions
├── dist/                   # Production build output
├── index.html              # HTML template
├── package.json            # Dependencies and scripts
├── vite.config.js          # Vite configuration
├── tailwind.config.js      # Tailwind CSS configuration
└── LICENSE                 # MIT License
```

## Architecture

### Power Flow Calculation

**Top-Down Power Flow**:
- Breadth-first search (BFS) from power sources
- Marks each node's `isPowered` status
- Stops at faulted equipment

**Bottom-Up Load Calculation**:
- Recursive calculation from servers upward
- Aggregates loads at distribution points
- Uses iterative convergence for complex topologies

### State Management

- **useDiagramStore**: Manages nodes, edges, and CRUD operations
- **useSimulationStore**: Handles simulation state, power flow results, and faults
- **useUIStore**: Controls UI state like selections and clipboard

### Simulation Logic

1. Extract power sources (utility, generators)
2. Calculate which nodes receive power (topology-based)
3. Calculate instantaneous loads from servers (utilization-based)
4. Check for overloads at distribution equipment
5. Trigger faults when capacity exceeded
6. Update visual indicators and animations

## Development

### Code Style

- React functional components with hooks
- Zustand for global state management
- Tailwind CSS for styling
- ES6+ JavaScript features

### Key Design Principles

1. **Realism First**: Simulate actual electrical behavior accurately
2. **Visual Clarity**: Use color coding and animations to communicate state
3. **User Safety**: Prevent invalid configurations through validation
4. **Predictable Behavior**: Equipment behaves like real-world counterparts

For detailed architecture decisions, see [DESIGN.md](docs/DESIGN.md).

### Adding New Equipment

1. Define equipment in `src/data/equipmentDefinitions.js`
2. Create a node component in `src/components/nodes/`
3. Register in `src/components/nodes/nodeTypes.js`
4. Add icon/visual representation
5. Update power flow calculator if needed

## Known Limitations

- No voltage drop calculations
- No thermal modeling for transformers/cables
- Assumes unity power factor (kW = kVA)
- No harmonic analysis
- No short circuit analysis
- Simplified protection (overload only, no inverse time curves)

These simplifications keep the tool accessible while maintaining educational and planning value.

## Contributing

Contributions are welcome! Please feel free to submit issues, feature requests, or pull requests.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with [ReactFlow](https://reactflow.dev/) for node-based diagrams
- Electrical symbols follow IEEE standards where applicable
- Inspired by real datacenter electrical design practices

## Links

- **Repository**: [https://github.com/billatgameology/eflow](https://github.com/billatgameology/eflow)
- **Issues**: [https://github.com/billatgameology/eflow/issues](https://github.com/billatgameology/eflow/issues)

---

**Version**: 1.0.0
**Last Updated**: November 2025

# eFlow - Design Decisions & Architecture

## Project Overview

eFlow is an interactive electrical single-line diagram designer for datacenter power distribution systems. This document captures the key design decisions and architectural choices made during development.

---

## Design Philosophy

### Core Principles

1. **Realism First**: Simulate actual electrical behavior accurately
2. **Visual Clarity**: Use color coding and animations to communicate system state
3. **User Safety**: Prevent invalid configurations through validation
4. **Predictable Behavior**: Equipment should behave like real-world counterparts

---

## Power Flow Architecture

### Design Decision: Top-Down Power, Bottom-Up Load

**Rationale:**
- **Power Flow (Top-Down)**: Electricity flows from sources (utility/generator) downstream through distribution equipment to loads
- **Load Calculation (Bottom-Up)**: Loads are calculated from servers upward, aggregating at each distribution point

**Implementation:**
- `calculatePowerFlow()`: BFS traversal from power sources, marking `isPowered` flag
- `calculateInstantaneousLoad()`: Recursive calculation starting from servers, propagating upstream

**Why Two Separate Calculations?**
- Power presence is binary (on/off) and depends on topology
- Load is continuous (0-100%) and depends on utilization profiles
- Separating them allows independent optimization and clearer logic

### Design Decision: Power-Aware Load Calculation

**Problem:** Servers were calculating load even when unpowered, causing unrealistic displays

**Solution:** Pass `powerFlowMap` to `calculateInstantaneousLoad()` and check `isPowered` before calculating server loads

**Impact:**
- When upstream equipment faults, all downstream loads immediately show 0kW
- Matches real-world behavior where unpowered equipment draws no load
- Prevents confusion about "phantom loads"

---

## Overload Protection System

### Design Decision: Protection at Distribution Level Only

**Equipment Protected:**
- ✅ Circuit Breakers
- ✅ Switchgear
- ❌ Servers (loads don't trip themselves)
- ❌ Transformers (simplified - would require thermal modeling)

**Rationale:**
- Mirrors real datacenter design where protection is at distribution points
- Servers don't have built-in circuit protection that trips the electrical path
- Keeps simulation simple while maintaining accuracy

### Design Decision: 5% Tolerance Buffer

**Implementation:** Equipment faults at **105% of rated capacity**, not 100%

**Rationale:**
- Prevents edge-case false positives at exactly rated capacity
- Matches real-world breakers which have slight trip margins
- Gives users breathing room when managing loads
- Prevents immediate re-fault when clearing a fault

### Design Decision: Manual Reset Only

**Alternative Considered:** Auto-recovery when load drops below threshold

**Choice:** Manual reset via fault button

**Rationale:**
- Real circuit breakers require manual reset for safety
- Forces users to identify and fix the root cause
- Prevents automatic reclosure into fault conditions
- More educational for understanding datacenter operations

---

## Load Profile Integration

### Design Decision: Internal Storage vs External Nodes

**Implementation:** Load profile data stored in `server.data.loadProfile`, not in separate visualization nodes

**Rationale:**
- Load profile is a property of the server, not a separate entity
- Simplifies copy/paste operations (no orphaned profile nodes)
- Clearer data ownership and lifecycle management

**Compromise:** External `LoadProfileNode` remains for **visualization only**, reading from internal data

### Design Decision: Shared Interpolation Function

**Problem:** Load profile interpolation was duplicated in multiple files

**Solution:** Created `interpolateValueAtHour()` in `loadProfile.js`

**Benefits:**
- Single source of truth for interpolation logic
- Consistent behavior across simulation and visualization
- Easier to debug and maintain

---

## Visual Design System

### Design Decision: Standardized Color Scheme

**Electrical Measurements:**
- **Voltage (V)**: Grey (#9CA3AF)
- **Current (A)**: Green (#00FF9F)
- **Power (kW)**: Cyan (#00D9FF)

**Rationale:**
- Consistent color = faster user comprehension
- Industry convention: Green often represents "good/normal" (current)
- Cyan stands out for the most critical metric (power)

### Design Decision: Icon Redesign for Clarity

**Approach:** Converted icons from generic shapes to electrical schematic symbols

**Examples:**
- **Switchgear**: Main busbar with multiple breaker outputs (shows distribution function)
- **Transformer**: Overlapping circles (standard IEEE symbol)
- **PDU**: Cabinet with rows of breakers (shows physical form)
- **Utility**: Transmission tower (instantly recognizable)

**Rationale:**
- Users familiar with electrical drawings can quickly identify equipment
- Reduces cognitive load compared to abstract shapes
- More professional appearance

### Design Decision: White vs Green for Powered Equipment

**Rule:**
- **Utility**: Remains source color (cyan) - it's the power source
- **Distribution Equipment**: White when powered - they're just conduits
- **Loads**: Show actual load in cyan - they're consuming power

**Rationale:**
- Reduces visual noise (not everything glowing green)
- Focuses attention on actual power consumption (loads)
- Utility color helps trace power source

---

## Animation & Feedback

### Design Decision: Normalized Edge Animation Speed

**Problem:** Fixed 2-second animation made short edges look slow, long edges look fast

**Solution:** Calculate duration based on edge length: `duration = length / 100px/s`

**Rationale:**
- Constant visual velocity is less jarring
- Users can "see" electricity flowing at consistent speed
- Feels more realistic

**Trade-off:** Very long edges may have slow animations, but this is acceptable for visual continuity

---

## User Interaction Patterns

### Design Decision: No "(Copy)" Suffix on Paste

**Rationale:**
- Each node has a unique internal ID already
- Custom labels are user-entered data, should preserve exactly
- Users can manually rename if they want differentiation
- Reduces friction in rapid prototyping

### Design Decision: Voltage Mismatch Prevention

**Implementation:** Block connections between nodes with different voltages

**Rationale:**
- Prevents unrealistic configurations
- Educates users about electrical compatibility
- Reduces user errors in complex diagrams

**Exception:** Transformers explicitly handle voltage changes

---

## Data Architecture

### Design Decision: Server `kwRating` Represents Per-Rack Maximum

**Implementation:**
- `kwRating`: Maximum load per individual rack (e.g., 10kW)
- `racksInRow`: Number of racks in the row (e.g., 5)
- **Total capacity**: `kwRating × racksInRow` (e.g., 50kW)

**Rationale:**
- Matches how datacenters specify server equipment
- Allows easy scaling by adjusting rack count
- Overload check correctly multiplies rating by rack count

### Design Decision: Faulted Nodes Block Load Propagation

**Implementation:**
- Skip faulted nodes when calculating upstream loads
- Skip edges from faulted source nodes
- Skip faulted consumer nodes

**Impact:**
- When switchgear faults, it shows 0kW (can't measure through open circuit)
- All upstream equipment also show 0kW (no load is being pulled)
- Matches real-world behavior of open circuits

---

## Simulation Logic

### Design Decision: Dual Parameter Names for Amperage

**Problem:** Circuit breakers use `current`, switchgear uses `ampRating`

**Solution:** Check for both: `node.data?.parameters?.current || node.data?.parameters?.ampRating`

**Rationale:**
- Legacy equipment definitions had inconsistent naming
- Both are semantically valid
- Checking both prevents breaking existing diagrams
- Migration to consistent naming can happen later

### Design Decision: Default Voltage Fallback to 120V

**Used When:** Calculating amperage from watts if voltage is missing

**Rationale:**
- 120V is common for North American single-phase
- Better to have approximate calculation than crash
- Encourages users to set proper voltage (inaccurate results signal missing data)

---

## Performance Optimizations

### Design Decision: Skip Already-Faulted Nodes in Overload Check

**Implementation:**
```javascript
if (faultedNodes.has(node.id)) return;
```

**Rationale:**
- Node is already faulted, no need to re-fault it
- Reduces unnecessary state updates
- Prevents potential infinite loops

### Design Decision: Iterative Convergence for Load Calculation

**Why Iterative?**
- Electrical graphs can have complex topologies including loops
- Bottom-up recursion risks infinite loops in cyclic graphs
- 10 iterations is sufficient for typical datacenter depth (5-7 levels)

**Trade-off:** 
- Slightly less efficient than pure topological sort
- Much simpler to implement and debug
- Performance is acceptable for diagrams <500 nodes

---

## File Organization

### Stores (Zustand)

**`useSimulationStore.js`**
- Simulation state: `isSimulating`, `simulationHour`, `faultedNodes`, `faultedEdges`
- Power flow results: `powerFlowMap`, `instantaneousLoadMap`
- Actions: `startSimulation()`, `toggleNodeFault()`, **`addNodeFault()`**

**`useDiagramStore.js`**
- Diagram data: `nodes`, `edges`
- CRUD operations: `addNode()`, `updateNode()`, `removeNode()`, etc.
- Persistence: `saveDiagram()`, `loadDiagram()`

**`useUIStore.js`**
- UI state: `selectedNodeId`, `selectedEdgeId`, `clipboard`
- View settings: `gridType`, `snapToGrid`, `showLoadProfileOverlays`

### Utils

**`powerFlowCalculator.js`**
- `calculatePowerFlow()`: Determines which nodes are powered (BFS traversal)
- `calculateInstantaneousLoad()`: Calculates kW loads (bottom-up recursion)
- `extractPowerSources()`: Finds all power source nodes

**`loadProfile.js`**
- `createDefaultLoadProfile()`: Factory for new profiles
- **`interpolateValueAtHour()`**: Shared interpolation logic (linear between points)
- `cloneLoadProfile()`: Deep copy for modifications

---

## Testing & Validation

### Verified Behaviors

✅ **Overload protection triggers at 105% capacity**
- Tested with switchgear rated 4000A @ 480V
- Faults correctly when downstream load exceeds threshold

✅ **Faulted equipment blocks all downstream power**
- Power flow stops (animations halt)
- Load propagation stops (0kW shown)
- Servers show 0kW when unpowered

✅ **Load profiles correctly interpolate**
- Yellow indicator tracks load profile graph
- Server kW matches expected: `kwRating × utilization × racksInRow`

✅ **Copy/paste works during simulation**
- No crashes when pasting servers
- Profile nodes properly cleared

✅ **Voltage mismatch prevention**
- Toast notification on attempted invalid connection
- No crashes from type errors

---

## Known Limitations & Future Work

### Current Simplifications

1. **No Voltage Drop Calculation**: All equipment at same voltage level treated as equal voltage
2. **No Thermal Models**: Transformers/cables don't have thermal limits, only amperage
3. **Simplified Power Factor**: Assumes unity power factor (kW = kVA)
4. **No Harmonic Analysis**: Doesn't model non-linear loads
5. **No Short Circuit Analysis**: Only overload protection, not fault current calculations

### Potential Enhancements

- [ ] Add transformer thermal overload protection
- [ ] Implement power factor correction modeling
- [ ] Add cable ampacity checking based on length/type
- [ ] Support more sophisticated trip curves (inverse time, instantaneous)
- [ ] Add historical load tracking/graphing
- [ ] Multi-tier load profiles (seasonal, weekly, daily)

---

## Design Principles Summary

1. **Accuracy Over Complexity**: Model real behavior, but only what users need
2. **Visual Feedback First**: Users should see state changes immediately
3. **Fail Safe**: Block invalid operations rather than allow bad state
4. **Consistency**: Same behavior across all similar equipment types
5. **Predictability**: Equipment behaves as users expect from real-world experience

---

**Document Version**: 2.0  
**Last Updated**: 2025-11-23  
**Primary Contributors**: Development Team

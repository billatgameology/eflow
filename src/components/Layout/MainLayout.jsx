import { useState } from 'react';
import Header from './Header';
import Toolbar from './Toolbar';
import EquipmentPanel from '../EquipmentPanel/EquipmentPanel';
import Canvas from '../Canvas/Canvas';
import PropertiesPanel from '../PropertiesPanel/PropertiesPanel';

export default function MainLayout() {
  const [reactFlowInstance, setReactFlowInstance] = useState(null);

  return (
    <div className="h-screen flex flex-col">
      <Header />
      <Toolbar reactFlowInstance={reactFlowInstance} />

      <div className="flex-1 flex overflow-hidden">
        {/* Left: Equipment Panel */}
        <EquipmentPanel />

        {/* Center: Canvas */}
        <div className="flex-1">
          <Canvas onInit={setReactFlowInstance} />
        </div>

        {/* Right: Properties Panel */}
        <PropertiesPanel />
      </div>
    </div>
  );
}

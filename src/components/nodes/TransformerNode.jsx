import BaseNodeWrapper from './BaseNodeWrapper';

import { useSimulationStore } from '../../stores/useSimulationStore';

export default function TransformerNode(props) {
  const { powerFlowMap } = useSimulationStore();
  const powerInfo = powerFlowMap.get(props.id);
  const isPowered = powerInfo?.isPowered;

  return (
    <BaseNodeWrapper {...props}>
      <div className="flex flex-col items-center justify-center">
        {/* Transformer Icon: Overlapping Circles (Standard Electrical Symbol) */}
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={isPowered ? "text-white" : "text-gray-400"}>
          {/* Primary Winding */}
          <circle cx="12" cy="8" r="5" />
          {/* Secondary Winding (Overlapping) */}
          <circle cx="12" cy="16" r="5" />

          {/* Core Lines (Optional, but adds detail) */}
          {/* <line x1="16" y1="8" x2="16" y2="16" strokeWidth="1" strokeDasharray="2 2" /> */}

          {/* Connection Points */}
          <path d="M12 3v-3" /> {/* Top input */}
          <path d="M12 21v3" /> {/* Bottom output */}
        </svg>
      </div>
    </BaseNodeWrapper>
  );
}

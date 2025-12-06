import BaseNode from './BaseNode';
import UtilityNode from './UtilityNode';
import GeneratorNode from './GeneratorNode';
import TransformerNode from './TransformerNode';
import CircuitBreakerNode from './CircuitBreakerNode';
import ATSNode from './ATSNode';
import MTSNode from './MTSNode';
import UPSNode from './UPSNode';
import ServerNode from './ServerNode';
import PDUNode from './PDUNode';
import PowerMeterNode from './PowerMeterNode';
import LoadProfileNode from './LoadProfileNode';
import SwitchgearNode from './SwitchgearNode';

export const nodeTypes = {
  // Keep BaseNode for fallback or generic items
  default: BaseNode,

  // Custom Equipment Nodes
  utility: UtilityNode,
  generator: GeneratorNode,
  transformer: TransformerNode,
  circuitBreaker: CircuitBreakerNode,
  ats: ATSNode,
  mts: MTSNode,
  ups: UPSNode,
  server: ServerNode,
  pdu: PDUNode,
  powerMeter: PowerMeterNode,
  loadProfile: LoadProfileNode,

  // Map other types to closest match or BaseNode for now
  switchgear: SwitchgearNode,
};

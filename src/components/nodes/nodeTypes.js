import BaseNode from './BaseNode';

// For now, all equipment types use the BaseNode component
// Later, we can create specialized nodes for specific equipment if needed
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

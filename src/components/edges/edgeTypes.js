import PowerEdge from './PowerEdge';
import RelationshipEdge from './RelationshipEdge';

export const edgeTypes = {
  power: PowerEdge,
  default: PowerEdge, // Use PowerEdge as default
  relationship: RelationshipEdge,
};

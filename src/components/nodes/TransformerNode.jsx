import BaseNodeWrapper from './BaseNodeWrapper';

export default function TransformerNode(props) {
  return (
    <BaseNodeWrapper {...props}>
      <div className="text-gray-200 flex flex-col items-center justify-center">
        {/* Transformer Icon: Figure 8 / Double Loop */}
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M12 3a4 4 0 1 0 0 8 4 4 0 1 0 0-8z" />
          <path d="M12 13a4 4 0 1 0 0 8 4 4 0 1 0 0-8z" />
        </svg>
      </div>
    </BaseNodeWrapper>
  );
}

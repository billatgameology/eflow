import BaseNodeWrapper from './BaseNodeWrapper';

export default function GeneratorNode(props) {
    return (
        <BaseNodeWrapper {...props}>
            <div className="text-neon-magenta flex flex-col items-center justify-center">
                {/* Generator Icon: Circle with G */}
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <circle cx="12" cy="12" r="9" />
                    <path d="M12 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" />
                    <path d="M12 16v-2" />
                    <path d="M14 14h-2" />
                </svg>
                <span className="text-[10px] font-bold mt-1 tracking-wider">GEN</span>
            </div>
        </BaseNodeWrapper>
    );
}

export default function WaveDivider({ flip = false, className = '' }) {
  return (
    <div className={`relative w-full overflow-hidden leading-[0] ${flip ? 'rotate-180' : ''} ${className}`}>
      <div className="flex w-[200%] animate-ripple">
        <svg viewBox="0 0 1200 80" className="w-1/2 h-16 md:h-20" preserveAspectRatio="none">
          <path
            d="M0,40 C150,80 300,0 450,40 C600,80 750,0 900,40 C1050,80 1150,20 1200,40 L1200,80 L0,80 Z"
            fill="currentColor"
          />
        </svg>
        <svg viewBox="0 0 1200 80" className="w-1/2 h-16 md:h-20" preserveAspectRatio="none">
          <path
            d="M0,40 C150,80 300,0 450,40 C600,80 750,0 900,40 C1050,80 1150,20 1200,40 L1200,80 L0,80 Z"
            fill="currentColor"
          />
        </svg>
      </div>
    </div>
  );
}
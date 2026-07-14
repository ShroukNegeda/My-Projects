import { FaSpinner } from 'react-icons/fa';

export default function Loading() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Loading"
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#fff',
        fontFamily: 'Poppins, sans-serif',
      }}
    >
      <FaSpinner
        size={40}
        color="#f97316"
        style={{ animation: 'eh-route-loading-spin 1s linear infinite' }}
        aria-hidden
      />
      <style>{`
        @keyframes eh-route-loading-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

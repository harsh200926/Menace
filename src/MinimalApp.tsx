import React from 'react';

interface MinimalAppProps {
  errorMessage?: string;
}

const MinimalApp: React.FC<MinimalAppProps> = ({ errorMessage }) => {
  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      textAlign: 'center',
      padding: '0 20px'
    }}>
      <h1 style={{ marginBottom: '16px', fontSize: '24px' }}>We're experiencing technical difficulties</h1>
      <p style={{ marginBottom: '24px', color: '#666', maxWidth: '500px', lineHeight: 1.6 }}>
        {errorMessage || "There was a problem loading the application. This might be due to a temporary network issue or browser extension conflict."}
      </p>
      {errorMessage && (
        <div style={{ 
          marginBottom: '20px', 
          padding: '12px', 
          background: 'rgba(220, 53, 69, 0.1)', 
          border: '1px solid rgba(220, 53, 69, 0.3)',
          borderRadius: '4px',
          color: '#dc3545',
          maxWidth: '500px',
          fontSize: '14px',
          whiteSpace: 'pre-wrap',
          overflowWrap: 'break-word',
          textAlign: 'left'
        }}>
          <strong>Error details:</strong> {errorMessage}
        </div>
      )}
      <div style={{ marginBottom: '20px' }}>
        <button
          onClick={handleRetry}
          style={{
            background: '#3b82f6',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          Retry
        </button>
      </div>
      <div style={{ fontSize: '14px', color: '#666' }}>
        <p>If the problem persists, try these solutions:</p>
        <ul style={{ textAlign: 'left', maxWidth: '500px', margin: '10px auto', lineHeight: 1.6 }}>
          <li>Temporarily disable ad blockers or privacy extensions</li>
          <li>Clear your browser cache and cookies</li>
          <li>Try a different web browser</li>
          <li>Check your internet connection</li>
        </ul>
      </div>
    </div>
  );
};

export default MinimalApp; 
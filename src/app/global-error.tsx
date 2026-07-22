'use client';

// global-error.tsx catches errors thrown by the root layout.tsx itself —
// the error.tsx file cannot catch those because it's rendered inside the layout.
// This is the last-resort safety net. It must include its own <html>/<body>
// since the normal root layout won't be available.

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  return (
    <html lang="en">
      <body style={{ fontFamily: 'system-ui, sans-serif', margin: 0 }}>
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            textAlign: 'center',
            background: '#09090b',
            color: '#fafafa',
          }}
        >
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>
            Application error
          </h2>
          <p style={{ color: '#a1a1aa', maxWidth: '320px', marginBottom: '1.5rem' }}>
            A critical error occurred. Please refresh the page. If the problem
            persists, try clearing your browser cache.
          </p>
          {error.digest && (
            <p style={{ fontSize: '0.75rem', color: '#52525b', fontFamily: 'monospace', marginBottom: '1.5rem' }}>
              Error ID: {error.digest}
            </p>
          )}
          <button
            onClick={reset}
            style={{
              background: '#3b82f6',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              padding: '0.5rem 1.25rem',
              fontSize: '0.875rem',
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}

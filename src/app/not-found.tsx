import Link from 'next/link'

export default function NotFound() {
  return (
    <main style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg)',
      fontFamily: 'var(--fb)',
      padding: '2rem',
    }}>
      <div style={{ textAlign: 'center', maxWidth: 420 }}>
        <div style={{
          fontFamily: 'var(--fh)',
          fontSize: 'clamp(5rem,15vw,8rem)',
          fontWeight: 800,
          color: 'var(--acc)',
          lineHeight: 1,
          letterSpacing: '-0.04em',
          marginBottom: '1rem',
          opacity: 0.15,
        }}>
          404
        </div>
        <h1 style={{
          fontFamily: 'var(--fh)',
          fontSize: 'clamp(1.2rem,3vw,1.6rem)',
          fontWeight: 800,
          color: 'var(--tx)',
          marginBottom: '0.75rem',
          letterSpacing: '-0.02em',
        }}>
          Page not found
        </h1>
        <p style={{
          color: 'var(--tx2)',
          fontSize: '0.9rem',
          lineHeight: 1.7,
          marginBottom: '2rem',
        }}>
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link href="/" style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          background: 'var(--acc)',
          color: '#fff',
          padding: '0.62rem 1.4rem',
          borderRadius: 'var(--r2)',
          fontWeight: 600,
          fontSize: '0.85rem',
          textDecoration: 'none',
        }}>
          ← Back home
        </Link>
      </div>
    </main>
  )
}

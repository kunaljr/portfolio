import Link from 'next/link'
import { posts } from '@/lib/blog'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Writing — Kunal Shelke',
  description: 'Technical articles on full stack engineering, system design, and lessons from shipping production SaaS.',
}

export default function BlogPage() {
  return (
    <main style={{ background: 'var(--bg)', minHeight: '100vh', fontFamily: 'var(--fb)' }}>
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '2.5rem 1.5rem' }}>
        <Link href="/" style={{
          display: 'inline-flex', alignItems: 'center', gap: 5,
          fontSize: '0.8rem', color: 'var(--tx3)', textDecoration: 'none', marginBottom: '2rem',
        }}>
          ← Home
        </Link>

        <div style={{ marginBottom: '2.5rem' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--acc)', marginBottom: '0.4rem' }}>
            Writing
          </div>
          <h1 style={{
            fontFamily: 'var(--fh)', fontSize: 'clamp(1.6rem,4vw,2.2rem)',
            fontWeight: 800, color: 'var(--tx)', letterSpacing: '-0.03em',
          }}>
            Things I&apos;ve learned shipping software.
          </h1>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {posts.map(post => (
            <Link key={post.slug} href={`/blog/${post.slug}`} style={{ textDecoration: 'none' }}>
              <div className="blog-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--tx3)' }}>
                    {new Date(post.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                  <span style={{ color: 'var(--bdr2)', fontSize: '0.7rem' }}>·</span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--tx3)' }}>{post.readTime}</span>
                </div>
                <div style={{ fontFamily: 'var(--fh)', fontSize: '1rem', fontWeight: 800, color: 'var(--tx)', marginBottom: '0.4rem', lineHeight: 1.3 }}>
                  {post.title}
                </div>
                <p style={{ fontSize: '0.84rem', color: 'var(--tx2)', lineHeight: 1.7, margin: '0 0 0.75rem', fontWeight: 300 }}>
                  {post.summary}
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                  {post.tags.map(t => (
                    <span key={t} style={{
                      background: 'var(--acc-t)', color: 'var(--acc)',
                      padding: '0.15rem 0.5rem', borderRadius: 'var(--r2)',
                      fontSize: '0.68rem', fontWeight: 600,
                    }}>{t}</span>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  )
}

import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getPost, posts } from '@/lib/blog'
import type { Metadata } from 'next'

export function generateStaticParams() {
  return posts.map(p => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const post = getPost(slug)
  if (!post) return {}
  return {
    title: `${post.title} | Kunal Shelke`,
    description: post.summary,
  }
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = getPost(slug)
  if (!post) notFound()

  return (
    <main style={{ background: 'var(--bg)', minHeight: '100vh', fontFamily: 'var(--fb)' }}>
      <div style={{ maxWidth: 680, margin: '0 auto', padding: '2.5rem 1.5rem' }}>

        <Link href="/blog" style={{
          display: 'inline-flex', alignItems: 'center', gap: 5,
          fontSize: '0.8rem', color: 'var(--tx3)', textDecoration: 'none', marginBottom: '2rem',
        }}>
          ← Writing
        </Link>

        {/* Header */}
        <div style={{ marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--tx3)' }}>
              {new Date(post.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
            <span style={{ color: 'var(--bdr2)' }}>·</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--tx3)' }}>{post.readTime}</span>
          </div>
          <h1 style={{
            fontFamily: 'var(--fh)', fontSize: 'clamp(1.5rem,3.5vw,2rem)',
            fontWeight: 800, color: 'var(--tx)', letterSpacing: '-0.03em',
            lineHeight: 1.15, marginBottom: '1rem',
          }}>
            {post.title}
          </h1>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
            {post.tags.map(t => (
              <span key={t} style={{
                background: 'var(--acc-t)', color: 'var(--acc)',
                padding: '0.17rem 0.55rem', borderRadius: 'var(--r2)',
                fontSize: '0.69rem', fontWeight: 600,
              }}>{t}</span>
            ))}
          </div>
        </div>

        <div className="sep" style={{ marginBottom: '2rem' }} />

        {/* Content */}
        <article className="prose">
          {post.sections.map((s, i) => (
            <div key={i} style={{ marginBottom: '1.75rem' }}>
              {s.heading && (
                <h2>{s.heading}</h2>
              )}
              <p>{s.body}</p>
            </div>
          ))}
        </article>

        <div className="sep" style={{ margin: '2.5rem 0 1.5rem' }} />

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link href="/blog" style={{ fontSize: '0.82rem', color: 'var(--tx3)', textDecoration: 'none' }}>
            ← All posts
          </Link>
          <Link href="/#contact" style={{ fontSize: '0.82rem', color: 'var(--acc)', textDecoration: 'none', fontWeight: 500 }}>
            Get in touch →
          </Link>
        </div>
      </div>
    </main>
  )
}

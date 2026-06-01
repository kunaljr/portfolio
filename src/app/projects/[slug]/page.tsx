import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getProject, projects } from '@/lib/projects'
import type { Metadata } from 'next'

export function generateStaticParams() {
  return projects.map(p => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const project = getProject(slug)
  if (!project) return {}
  return {
    title: `${project.name} — Case Study | Kunal Shelke`,
    description: project.overview,
  }
}

export default async function CaseStudyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const project = getProject(slug)
  if (!project) notFound()

  return (
    <main style={{ background: 'var(--bg)', minHeight: '100vh', fontFamily: 'var(--fb)' }}>
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '2.5rem 1.5rem' }}>

        {/* Back */}
        <Link href="/#proj" style={{
          display: 'inline-flex', alignItems: 'center', gap: 5,
          fontSize: '0.8rem', color: 'var(--tx3)', textDecoration: 'none',
          marginBottom: '2rem', transition: 'color 0.2s',
        }}>
          ← Projects
        </Link>

        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--acc)', marginBottom: '0.4rem' }}>
            Case Study
          </div>
          <h1 style={{
            fontFamily: 'var(--fh)', fontSize: 'clamp(1.6rem,4vw,2.4rem)',
            fontWeight: 800, color: 'var(--tx)', letterSpacing: '-0.03em',
            lineHeight: 1.1, marginBottom: '0.6rem',
          }}>
            {project.name}
          </h1>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--tx2)', fontWeight: 500 }}>{project.client}</span>
            <span style={{ color: 'var(--bdr2)' }}>·</span>
            <span style={{ fontSize: '0.82rem', color: 'var(--tx3)' }}>{project.domain}</span>
            <span style={{ color: 'var(--bdr2)' }}>·</span>
            <span style={{ fontSize: '0.82rem', color: 'var(--tx3)' }}>{project.period}</span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
            {project.tags.map(t => (
              <span key={t} style={{
                background: 'var(--acc-t)', color: 'var(--acc)',
                padding: '0.17rem 0.55rem', borderRadius: 'var(--r2)',
                fontSize: '0.69rem', fontWeight: 600,
              }}>{t}</span>
            ))}
          </div>
        </div>

        {/* Outcomes */}
        <div style={{
          display: 'grid', gridTemplateColumns: `repeat(${project.outcomes.length}, 1fr)`,
          border: '0.5px solid var(--bdr)', borderRadius: 'var(--r)',
          background: 'var(--surf)', overflow: 'hidden', marginBottom: '2.5rem',
        }}>
          {project.outcomes.map((o, i) => (
            <div key={i} style={{
              padding: '1rem 1.25rem',
              borderRight: i < project.outcomes.length - 1 ? '0.5px solid var(--bdr)' : 'none',
            }}>
              <div style={{ fontFamily: 'var(--fh)', fontSize: '1.6rem', fontWeight: 800, color: 'var(--acc)', lineHeight: 1 }}>
                {o.metric}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--tx2)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '0.25rem' }}>
                {o.label}
              </div>
            </div>
          ))}
        </div>

        {/* Overview */}
        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontFamily: 'var(--fh)', fontSize: '1rem', fontWeight: 800, color: 'var(--tx)', marginBottom: '0.75rem', letterSpacing: '-0.01em' }}>
            Overview
          </h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--tx2)', lineHeight: 1.85, fontWeight: 300 }}>
            {project.overview}
          </p>
        </section>

        <div className="sep" style={{ marginBottom: '2rem' }} />

        {/* Problem */}
        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontFamily: 'var(--fh)', fontSize: '1rem', fontWeight: 800, color: 'var(--tx)', marginBottom: '0.75rem', letterSpacing: '-0.01em' }}>
            The Problem
          </h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--tx2)', lineHeight: 1.85, fontWeight: 300 }}>
            {project.problem}
          </p>
        </section>

        <div className="sep" style={{ marginBottom: '2rem' }} />

        {/* Approach */}
        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontFamily: 'var(--fh)', fontSize: '1rem', fontWeight: 800, color: 'var(--tx)', marginBottom: '1.25rem', letterSpacing: '-0.01em' }}>
            Approach
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {project.approach.map((a, i) => (
              <div key={i} style={{
                borderLeft: '2px solid var(--acc)',
                paddingLeft: '1.1rem',
              }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--tx)', marginBottom: '0.4rem' }}>
                  {a.title}
                </div>
                <p style={{ fontSize: '0.87rem', color: 'var(--tx2)', lineHeight: 1.8, fontWeight: 300, margin: 0 }}>
                  {a.body}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Footer nav */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1.5rem', borderTop: '0.5px solid var(--bdr)' }}>
          <Link href="/#proj" style={{ fontSize: '0.82rem', color: 'var(--tx3)', textDecoration: 'none' }}>
            ← All projects
          </Link>
          <Link href="/#contact" style={{ fontSize: '0.82rem', color: 'var(--acc)', textDecoration: 'none', fontWeight: 500 }}>
            Get in touch →
          </Link>
        </div>
      </div>
    </main>
  )
}

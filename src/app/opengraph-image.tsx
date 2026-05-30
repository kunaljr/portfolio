import { ImageResponse } from 'next/og'
import fs from 'fs'
import path from 'path'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
  const imgBuffer = fs.readFileSync(
    path.join(process.cwd(), 'public/profesional-picture.JPEG')
  )
  const imgBase64 = `data:image/jpeg;base64,${imgBuffer.toString('base64')}`

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          background: '#0d1117',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Accent gradient blob */}
        <div
          style={{
            position: 'absolute',
            top: -80,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 900,
            height: 420,
            borderRadius: '50%',
            background: 'radial-gradient(ellipse, rgba(59,91,219,0.35) 0%, transparent 70%)',
            display: 'flex',
          }}
        />

        {/* Left: text */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '0 70px',
            gap: 0,
          }}
        >
          {/* Badge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: 'rgba(59,91,219,0.15)',
              border: '1px solid rgba(59,91,219,0.35)',
              color: '#7B96FF',
              padding: '6px 18px',
              borderRadius: 100,
              fontSize: 18,
              fontWeight: 600,
              marginBottom: 28,
              width: 'auto',
            }}
          >
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: '#3fb950',
                display: 'flex',
              }}
            />
            Open to Senior Roles
          </div>

          {/* Name */}
          <div
            style={{
              fontSize: 68,
              fontWeight: 800,
              color: '#e6edf3',
              lineHeight: 1.05,
              letterSpacing: '-0.03em',
              marginBottom: 16,
              display: 'flex',
            }}
          >
            Kunal Shelke
          </div>

          {/* Title */}
          <div
            style={{
              fontSize: 32,
              fontWeight: 500,
              color: '#7B96FF',
              marginBottom: 24,
              display: 'flex',
            }}
          >
            Senior Full Stack Engineer
          </div>

          {/* Description */}
          <div
            style={{
              fontSize: 22,
              color: '#8d96a0',
              lineHeight: 1.6,
              maxWidth: 520,
              display: 'flex',
            }}
          >
            5 years shipping production SaaS — React, Node.js, and Cloud.
          </div>

          {/* Tech pills */}
          <div
            style={{
              display: 'flex',
              gap: 10,
              marginTop: 32,
              flexWrap: 'wrap',
            }}
          >
            {['React', 'Node.js', 'TypeScript', 'GCP', 'AWS'].map(tag => (
              <div
                key={tag}
                style={{
                  background: '#161b22',
                  border: '1px solid #30363d',
                  color: '#8d96a0',
                  padding: '6px 16px',
                  borderRadius: 8,
                  fontSize: 18,
                  display: 'flex',
                }}
              >
                {tag}
              </div>
            ))}
          </div>

          {/* CTA */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              marginTop: 36,
            }}
          >
            <div
              style={{
                background: '#3B5BDB',
                color: '#fff',
                padding: '10px 28px',
                borderRadius: 8,
                fontSize: 20,
                fontWeight: 700,
                display: 'flex',
              }}
            >
              View Portfolio →
            </div>
            <div style={{ color: '#6e7681', fontSize: 18, display: 'flex' }}>
              kunalshelke.dev
            </div>
          </div>
        </div>

        {/* Right: photo */}
        <div
          style={{
            width: 300,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 60,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imgBase64}
            width={260}
            height={260}
            style={{
              objectFit: 'cover',
              objectPosition: 'center 10%',
              borderRadius: '50%',
              border: '3px solid rgba(59,91,219,0.5)',
            }}
            alt="Kunal Shelke"
          />
        </div>
      </div>
    ),
    { ...size }
  )
}

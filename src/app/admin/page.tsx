import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'
import { isValidSession } from './session'
import { login, logout } from './actions'

interface Submission {
  id: string
  name: string
  email: string
  message: string
  created_at: string
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const [cookieStore, params] = await Promise.all([cookies(), searchParams])
  const sessionCookie = cookieStore.get('admin_session')?.value

  if (!isValidSession(sessionCookie)) {
    return (
      <main style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg)',
        fontFamily: 'var(--fb)',
      }}>
        <div style={{
          width: '100%',
          maxWidth: 360,
          padding: '2rem',
          background: 'var(--surf)',
          border: '0.5px solid var(--bdr)',
          borderRadius: 'var(--r)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
        }}>
          <h1 style={{
            fontFamily: 'var(--fh)',
            fontSize: '1.2rem',
            fontWeight: 800,
            color: 'var(--tx)',
            margin: 0,
          }}>
            Admin
          </h1>
          {params.error && (
            <p style={{ color: '#e53e3e', fontSize: '0.85rem', margin: 0 }}>
              Incorrect password.
            </p>
          )}
          <form action={login} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <input
              type="password"
              name="password"
              placeholder="Password"
              required
              autoFocus
              style={{
                padding: '0.6rem 0.75rem',
                border: '0.5px solid var(--bdr)',
                borderRadius: 'var(--r2)',
                background: 'var(--bg)',
                color: 'var(--tx)',
                fontFamily: 'var(--fb)',
                fontSize: '0.9rem',
                outline: 'none',
                width: '100%',
                boxSizing: 'border-box',
              }}
            />
            <button
              type="submit"
              style={{
                padding: '0.6rem',
                background: 'var(--acc)',
                color: '#fff',
                border: 'none',
                borderRadius: 'var(--r2)',
                fontFamily: 'var(--fb)',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Sign in
            </button>
          </form>
        </div>
      </main>
    )
  }

  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !supabaseKey) {
    return <p style={{ padding: '2rem', color: 'var(--tx2)', fontFamily: 'var(--fb)' }}>Server configuration error.</p>
  }

  const supabase = createClient(supabaseUrl, supabaseKey)

  const { data: submissions, error: dbError } = await supabase
    .from('contact_submissions')
    .select('*')
    .order('created_at', { ascending: false })

  if (dbError) {
    return <p style={{ padding: '2rem', color: 'var(--tx2)', fontFamily: 'var(--fb)' }}>Failed to load messages. Please try again.</p>
  }

  return (
    <main style={{
      minHeight: '100vh',
      background: 'var(--bg)',
      fontFamily: 'var(--fb)',
      padding: '2rem 1.5rem',
    }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '2rem',
        }}>
          <h1 style={{
            fontFamily: 'var(--fh)',
            fontSize: '1.5rem',
            fontWeight: 800,
            color: 'var(--tx)',
            margin: 0,
          }}>
            Messages
          </h1>
          <form action={logout}>
            <button
              type="submit"
              style={{
                background: 'none',
                border: '0.5px solid var(--bdr)',
                borderRadius: 'var(--r2)',
                color: 'var(--tx2)',
                fontFamily: 'var(--fb)',
                fontSize: '0.78rem',
                padding: '0.35rem 0.75rem',
                cursor: 'pointer',
              }}
            >
              Sign out
            </button>
          </form>
        </div>

        {!submissions?.length ? (
          <p style={{ color: 'var(--tx3)', fontSize: '0.9rem' }}>No messages yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {(submissions as Submission[]).map(s => (
              <div
                key={s.id}
                style={{
                  background: 'var(--surf)',
                  border: '0.5px solid var(--bdr)',
                  borderRadius: 'var(--r)',
                  padding: '1.25rem',
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: '0.75rem',
                  marginBottom: '0.6rem',
                  flexWrap: 'wrap',
                }}>
                  <span style={{ fontWeight: 600, color: 'var(--tx)', fontSize: '0.9rem' }}>
                    {s.name}
                  </span>
                  <a
                    href={`mailto:${s.email}`}
                    style={{ color: 'var(--acc)', fontSize: '0.82rem', textDecoration: 'none' }}
                  >
                    {s.email}
                  </a>
                  <span style={{ marginLeft: 'auto', color: 'var(--tx3)', fontSize: '0.78rem' }}>
                    {new Date(s.created_at).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                </div>
                <p style={{
                  color: 'var(--tx2)',
                  fontSize: '0.88rem',
                  lineHeight: 1.6,
                  margin: 0,
                  whiteSpace: 'pre-wrap',
                }}>
                  {s.message}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}

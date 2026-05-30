import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'
import { isValidSession } from './session'
import { login, logout, markAsRead, deleteSubmission } from './actions'
import { AdminPageTitle } from './AdminPageTitle'
import { SearchBar } from './SearchBar'
import { parsePage, buildPaginationPages } from './paginationUtils'

const PAGE_SIZE = 10

interface Submission {
  id: string
  name: string
  email: string
  message: string
  created_at: string
  is_read?: boolean
  browser?: string
  os?: string
  device?: string
  country?: string
  city?: string
  lang?: string
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

  const q = typeof params.q === 'string' ? params.q.trim().replace(/[,()]/g, '') : ''
  const page = parsePage(params.page)
  const from = (page - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  const supabase = createClient(supabaseUrl, supabaseKey)

  const { count: unreadCount } = await supabase
    .from('contact_submissions')
    .select('*', { count: 'exact', head: true })
    .eq('is_read', false)

  const baseQuery = supabase
    .from('contact_submissions')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to)

  const { data: submissions, count, error: dbError } = await (
    q
      ? baseQuery.or(`name.ilike.%${q}%,email.ilike.%${q}%,message.ilike.%${q}%`)
      : baseQuery
  )

  if (dbError) {
    return <p style={{ padding: '2rem', color: 'var(--tx2)', fontFamily: 'var(--fb)' }}>Failed to load messages. Please try again.</p>
  }

  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE)
  const pageNumbers = buildPaginationPages(page, totalPages)

  function pageHref(p: number): string {
    const ps = new URLSearchParams()
    if (q) ps.set('q', q)
    if (p > 1) ps.set('page', String(p))
    const s = ps.toString()
    return s ? `/admin?${s}` : '/admin'
  }

  return (
    <main style={{
      minHeight: '100vh',
      background: 'var(--bg)',
      fontFamily: 'var(--fb)',
      padding: '2rem 1.5rem',
    }}>
      <AdminPageTitle unread={unreadCount ?? 0} />
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.5rem',
        }}>
          <h1 style={{
            fontFamily: 'var(--fh)',
            fontSize: '1.5rem',
            fontWeight: 800,
            color: 'var(--tx)',
            margin: 0,
          }}>
            Messages
            {(unreadCount ?? 0) > 0 && (
              <span style={{
                marginLeft: '0.6rem',
                background: 'var(--acc)',
                color: '#fff',
                fontSize: '0.7rem',
                fontWeight: 700,
                padding: '0.15rem 0.5rem',
                borderRadius: '100px',
                verticalAlign: 'middle',
              }}>
                {unreadCount}
              </span>
            )}
          </h1>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <a
              href="/"
              style={{
                background: 'none',
                border: '0.5px solid var(--bdr)',
                borderRadius: 'var(--r2)',
                color: 'var(--tx2)',
                fontFamily: 'var(--fb)',
                fontSize: '0.78rem',
                padding: '0.35rem 0.75rem',
                cursor: 'pointer',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
              }}
            >
              ← Site
            </a>
            <a
              href="/api/admin/export"
              download="messages.csv"
              style={{
                background: 'none',
                border: '0.5px solid var(--bdr)',
                borderRadius: 'var(--r2)',
                color: 'var(--tx2)',
                fontFamily: 'var(--fb)',
                fontSize: '0.78rem',
                padding: '0.35rem 0.75rem',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
              }}
            >
              Export CSV
            </a>
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
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <SearchBar initialValue={q} />
        </div>

        {!submissions?.length ? (
          <p style={{ color: 'var(--tx3)', fontSize: '0.9rem' }}>
            {q ? `No messages matching "${q}".` : 'No messages yet.'}
          </p>
        ) : (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {(submissions as Submission[]).map(s => (
                <div
                  key={s.id}
                  style={{
                    background: 'var(--surf)',
                    border: `0.5px solid ${s.is_read ? 'var(--bdr)' : 'var(--acc-b)'}`,
                    borderRadius: 'var(--r)',
                    padding: '1.25rem',
                    opacity: s.is_read ? 0.75 : 1,
                  }}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    marginBottom: '0.6rem',
                    flexWrap: 'wrap',
                  }}>
                    {!s.is_read && (
                      <span style={{
                        width: 8, height: 8, borderRadius: '50%',
                        background: 'var(--acc)', flexShrink: 0, display: 'inline-block',
                      }} />
                    )}
                    <span style={{ fontWeight: 600, color: 'var(--tx)', fontSize: '0.9rem' }}>
                      {s.name}
                    </span>
                    <a
                      href={`mailto:${s.email}`}
                      style={{ color: 'var(--acc)', fontSize: '0.82rem', textDecoration: 'none' }}
                    >
                      {s.email}
                    </a>
                    <span style={{ marginLeft: 'auto', color: 'var(--tx3)', fontSize: '0.78rem', flexShrink: 0 }}>
                      {new Date(s.created_at).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                    <div style={{ display: 'flex', gap: '0.4rem', flexShrink: 0 }}>
                      <a
                        href={`mailto:${s.email}?subject=Re: Your message on kunalshelke.dev`}
                        style={{
                          background: 'none',
                          border: '0.5px solid var(--bdr)',
                          borderRadius: 'var(--r2)',
                          color: 'var(--acc)',
                          padding: '0.22rem 0.5rem',
                          fontSize: '0.72rem',
                          fontFamily: 'var(--fb)',
                          textDecoration: 'none',
                          display: 'inline-flex',
                          alignItems: 'center',
                        }}
                      >
                        Reply
                      </a>
                      {!s.is_read && (
                        <form action={markAsRead}>
                          <input type="hidden" name="id" value={s.id} />
                          <button
                            type="submit"
                            title="Mark as read"
                            style={{
                              background: 'none',
                              border: '0.5px solid var(--bdr)',
                              borderRadius: 'var(--r2)',
                              color: 'var(--tx3)',
                              cursor: 'pointer',
                              padding: '0.22rem 0.5rem',
                              fontSize: '0.72rem',
                              fontFamily: 'var(--fb)',
                              transition: 'border-color 0.2s, color 0.2s',
                            }}
                          >
                            Mark read
                          </button>
                        </form>
                      )}
                      <form action={deleteSubmission}>
                        <input type="hidden" name="id" value={s.id} />
                        <button
                          type="submit"
                          title="Delete"
                          style={{
                            background: 'none',
                            border: '0.5px solid var(--bdr)',
                            borderRadius: 'var(--r2)',
                            color: 'var(--tx3)',
                            cursor: 'pointer',
                            padding: '0.22rem 0.5rem',
                            fontSize: '0.72rem',
                            fontFamily: 'var(--fb)',
                            transition: 'border-color 0.2s, color 0.2s',
                          }}
                        >
                          Delete
                        </button>
                      </form>
                    </div>
                  </div>
                  <p style={{
                    color: 'var(--tx2)',
                    fontSize: '0.88rem',
                    lineHeight: 1.6,
                    margin: '0 0 0.75rem',
                    whiteSpace: 'pre-wrap',
                  }}>
                    {s.message}
                  </p>
                  {(s.browser || s.country) && (
                    <div style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '0.4rem',
                      paddingTop: '0.65rem',
                      borderTop: '0.5px solid var(--bdr)',
                    }}>
                      {[
                        s.device,
                        s.browser,
                        s.os,
                        s.city && s.country ? `${s.city}, ${s.country}` : s.country,
                        s.lang,
                      ].filter(Boolean).map(v => (
                        <span key={v} style={{
                          fontSize: '0.7rem',
                          color: 'var(--tx3)',
                          background: 'var(--bg)',
                          border: '0.5px solid var(--bdr)',
                          borderRadius: 'var(--r2)',
                          padding: '0.15rem 0.5rem',
                        }}>
                          {v}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
                marginTop: '1.5rem',
                flexWrap: 'wrap',
              }}>
                <a
                  href={page > 1 ? pageHref(page - 1) : undefined}
                  aria-disabled={page <= 1}
                  style={{
                    padding: '0.35rem 0.6rem',
                    border: '0.5px solid var(--bdr)',
                    borderRadius: 'var(--r2)',
                    color: page > 1 ? 'var(--tx2)' : 'var(--tx3)',
                    fontFamily: 'var(--fb)',
                    fontSize: '0.82rem',
                    textDecoration: 'none',
                    pointerEvents: page > 1 ? 'auto' : 'none',
                  }}
                >
                  ←
                </a>
                {pageNumbers.map((p, i) =>
                  p === '...' ? (
                    <span
                      key={`gap-${i}`}
                      style={{ color: 'var(--tx3)', fontSize: '0.82rem', padding: '0 0.25rem' }}
                    >
                      …
                    </span>
                  ) : (
                    <a
                      key={p}
                      href={pageHref(p)}
                      style={{
                        padding: '0.35rem 0.6rem',
                        border: '0.5px solid var(--bdr)',
                        borderRadius: 'var(--r2)',
                        background: p === page ? 'var(--acc)' : 'transparent',
                        color: p === page ? '#fff' : 'var(--tx2)',
                        fontFamily: 'var(--fb)',
                        fontSize: '0.82rem',
                        textDecoration: 'none',
                        fontWeight: p === page ? 600 : 400,
                      }}
                    >
                      {p}
                    </a>
                  )
                )}
                <a
                  href={page < totalPages ? pageHref(page + 1) : undefined}
                  aria-disabled={page >= totalPages}
                  style={{
                    padding: '0.35rem 0.6rem',
                    border: '0.5px solid var(--bdr)',
                    borderRadius: 'var(--r2)',
                    color: page < totalPages ? 'var(--tx2)' : 'var(--tx3)',
                    fontFamily: 'var(--fb)',
                    fontSize: '0.82rem',
                    textDecoration: 'none',
                    pointerEvents: page < totalPages ? 'auto' : 'none',
                  }}
                >
                  →
                </a>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  )
}

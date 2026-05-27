# Admin Search & Pagination Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add debounced search (name, email, message) and URL-based pagination (20 per page) to the `/admin` messages page.

**Architecture:** A new `paginationUtils.ts` provides pure helpers (`parsePage`, `buildPaginationPages`) that are unit-tested. A new `SearchBar` Client Component handles debounced input and calls `router.push` to update the URL. The existing Server Component (`page.tsx`) reads `q` and `page` from `searchParams`, queries Supabase with `.or(ilike)` + `.range()` + `{ count: 'exact' }`, and renders the search bar, filtered list, and pagination links.

**Tech Stack:** Next.js 16 App Router, `@supabase/supabase-js` v2, vitest, React `useRouter` / `useState` / `useRef`.

---

## File Map

| Action | Path | Responsibility |
|---|---|---|
| Create | `src/app/admin/paginationUtils.ts` | Pure helpers: `parsePage`, `buildPaginationPages` |
| Create | `src/app/admin/paginationUtils.test.ts` | Unit tests for pagination helpers |
| Create | `src/app/admin/SearchBar.tsx` | Client Component: debounced input → `router.push` |
| Modify | `src/app/admin/page.tsx` | Add `q`/`page` params, Supabase search + count + range, render SearchBar + pagination |

---

## Task 1: Pagination utility helpers (TDD)

**Files:**
- Create: `src/app/admin/paginationUtils.ts`
- Create: `src/app/admin/paginationUtils.test.ts`

- [ ] **Step 1: Write failing tests**

Create `src/app/admin/paginationUtils.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { parsePage, buildPaginationPages } from './paginationUtils'

describe('parsePage', () => {
  it('returns 1 for undefined', () => expect(parsePage(undefined)).toBe(1))
  it('returns 1 for empty string', () => expect(parsePage('')).toBe(1))
  it('returns 1 for non-numeric string', () => expect(parsePage('abc')).toBe(1))
  it('returns 1 for negative numbers', () => expect(parsePage('-3')).toBe(1))
  it('returns 1 for zero', () => expect(parsePage('0')).toBe(1))
  it('returns parsed number for valid string', () => expect(parsePage('5')).toBe(5))
  it('uses first element when value is an array', () => expect(parsePage(['3', '9'])).toBe(3))
})

describe('buildPaginationPages', () => {
  it('returns all pages when total <= 7', () => {
    expect(buildPaginationPages(1, 5)).toEqual([1, 2, 3, 4, 5])
    expect(buildPaginationPages(3, 7)).toEqual([1, 2, 3, 4, 5, 6, 7])
  })

  it('returns empty array for 0 total pages', () => {
    expect(buildPaginationPages(1, 0)).toEqual([])
  })

  it('truncates end when on page 1 of many', () => {
    expect(buildPaginationPages(1, 10)).toEqual([1, 2, '...', 10])
  })

  it('truncates both sides when in middle', () => {
    expect(buildPaginationPages(5, 10)).toEqual([1, '...', 4, 5, 6, '...', 10])
  })

  it('truncates start when on last page', () => {
    expect(buildPaginationPages(10, 10)).toEqual([1, '...', 9, 10])
  })

  it('no start gap when current is adjacent to first', () => {
    expect(buildPaginationPages(2, 10)).toEqual([1, 2, 3, '...', 10])
  })

  it('no end gap when current is adjacent to last', () => {
    expect(buildPaginationPages(9, 10)).toEqual([1, '...', 8, 9, 10])
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npm test
```

Expected: FAIL — `Cannot find module './paginationUtils'`

- [ ] **Step 3: Implement paginationUtils.ts**

Create `src/app/admin/paginationUtils.ts`:

```ts
export function parsePage(value: string | string[] | undefined): number {
  const str = Array.isArray(value) ? value[0] : value
  const n = parseInt(str ?? '', 10)
  return isNaN(n) || n < 1 ? 1 : n
}

export function buildPaginationPages(
  current: number,
  total: number,
): Array<number | '...'> {
  if (total <= 0) return []
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)

  const pages: Array<number | '...'> = []

  pages.push(1)

  if (current - 1 > 2) pages.push('...')

  const start = Math.max(2, current - 1)
  const end = Math.min(total - 1, current + 1)
  for (let i = start; i <= end; i++) pages.push(i)

  if (current + 1 < total - 1) pages.push('...')

  pages.push(total)

  return pages
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npm test
```

Expected: all tests pass (18 existing + 14 new = 32 total).

- [ ] **Step 5: Do NOT commit** — user commits manually.

---

## Task 2: SearchBar Client Component

**Files:**
- Create: `src/app/admin/SearchBar.tsx`

No unit tests — this component uses browser hooks (`useRouter`) that require the Next.js runtime. Manual verification in Task 3 covers correctness.

- [ ] **Step 1: Create SearchBar.tsx**

Create `src/app/admin/SearchBar.tsx`:

```tsx
'use client'

import { useRouter } from 'next/navigation'
import { useRef, useState } from 'react'

interface SearchBarProps {
  initialValue: string
}

export function SearchBar({ initialValue }: SearchBarProps) {
  const router = useRouter()
  const [value, setValue] = useState(initialValue)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const next = e.target.value
    setValue(next)
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      const params = new URLSearchParams()
      if (next.trim()) params.set('q', next.trim())
      const search = params.toString()
      router.push(search ? `/admin?${search}` : '/admin')
    }, 300)
  }

  return (
    <input
      type="search"
      value={value}
      onChange={handleChange}
      placeholder="Search messages…"
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
        boxSizing: 'border-box' as const,
      }}
    />
  )
}
```

- [ ] **Step 2: Run TypeScript check**

```bash
npx tsc --noEmit 2>&1 | head -30
```

Expected: no errors in `SearchBar.tsx`.

- [ ] **Step 3: Do NOT commit** — user commits manually.

---

## Task 3: Update page.tsx with search and pagination

**Files:**
- Modify: `src/app/admin/page.tsx`

- [ ] **Step 1: Replace the full contents of page.tsx**

Write the following to `src/app/admin/page.tsx`:

```tsx
import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'
import { isValidSession } from './session'
import { login, logout } from './actions'
import { SearchBar } from './SearchBar'
import { parsePage, buildPaginationPages } from './paginationUtils'

const PAGE_SIZE = 20

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

  const q = typeof params.q === 'string' ? params.q.trim() : ''
  const page = parsePage(params.page)
  const from = (page - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  const supabase = createClient(supabaseUrl, supabaseKey)

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
```

- [ ] **Step 2: Run TypeScript check**

```bash
npx tsc --noEmit 2>&1 | head -30
```

Expected: no errors.

- [ ] **Step 3: Run all tests**

```bash
npm test
```

Expected: all 32 tests pass.

- [ ] **Step 4: Manual verification**

Start the dev server:

```bash
npm run dev
```

Open `http://localhost:3000/admin` and sign in, then verify:

1. Search input appears above the message list
2. Type a sender name → after 300ms the URL changes to `/admin?q=<name>` and results filter to matching messages
3. Clear the input → URL returns to `/admin` and all messages appear
4. Navigate directly to `/admin?q=foo` → search term pre-fills in the input and results are filtered (shareable URL works)
5. If >20 messages exist: pagination controls appear; clicking a page number navigates and preserves `q` in the URL
6. On page 1 the ← arrow is muted; on the last page the → arrow is muted
7. Clicking a page number while a search is active keeps the search term in the URL (e.g. `/admin?q=foo&page=2`)

- [ ] **Step 5: Do NOT commit** — user commits manually.

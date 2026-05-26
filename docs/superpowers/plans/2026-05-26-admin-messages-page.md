# Admin Messages Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a password-protected `/admin` page that lists all contact form submissions from Supabase, newest first.

**Architecture:** A Next.js Server Component reads an `admin_session` cookie and either shows a login form or fetches and renders submissions. Login/logout are Server Actions. Session validity is checked via `sha256(ADMIN_PASSWORD)` — no separate session store needed.

**Tech Stack:** Next.js 16 App Router, Server Actions, `next/headers` cookies API, `@supabase/supabase-js`, Node.js `crypto`, vitest.

---

## File Map

| Action | Path | Responsibility |
|---|---|---|
| Create | `src/app/admin/session.ts` | Pure helpers: `getSessionToken()`, `isValidSession()` |
| Create | `src/app/admin/session.test.ts` | Unit tests for session helpers |
| Create | `src/app/admin/actions.ts` | Server Actions: `login`, `logout` |
| Create | `src/app/admin/page.tsx` | Server Component: login form or message list |

---

## Task 1: Session helpers

**Files:**
- Create: `src/app/admin/session.ts`
- Create: `src/app/admin/session.test.ts`

- [ ] **Step 1: Write failing tests**

Create `src/app/admin/session.test.ts`:

```ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { createHash } from 'crypto'
import { getSessionToken, isValidSession } from './session'

describe('session helpers', () => {
  beforeEach(() => {
    process.env.ADMIN_PASSWORD = 'test-password-123'
  })
  afterEach(() => {
    delete process.env.ADMIN_PASSWORD
  })

  it('getSessionToken returns sha256 of ADMIN_PASSWORD', () => {
    const expected = createHash('sha256').update('test-password-123').digest('hex')
    expect(getSessionToken()).toBe(expected)
  })

  it('isValidSession returns true for the correct token', () => {
    expect(isValidSession(getSessionToken())).toBe(true)
  })

  it('isValidSession returns false for a wrong token', () => {
    expect(isValidSession('not-the-right-token')).toBe(false)
  })

  it('isValidSession returns false for undefined', () => {
    expect(isValidSession(undefined)).toBe(false)
  })

  it('isValidSession returns false for empty string', () => {
    expect(isValidSession('')).toBe(false)
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npm test
```

Expected: FAIL — `Cannot find module './session'`

- [ ] **Step 3: Implement session.ts**

Create `src/app/admin/session.ts`:

```ts
import { createHash } from 'crypto'

export function getSessionToken(): string {
  return createHash('sha256').update(process.env.ADMIN_PASSWORD ?? '').digest('hex')
}

export function isValidSession(cookieValue: string | undefined): boolean {
  if (!cookieValue) return false
  return cookieValue === getSessionToken()
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npm test
```

Expected: all 16 tests pass (11 existing + 5 new).

- [ ] **Step 5: Do NOT commit** — user commits manually.

---

## Task 2: Server Actions

**Files:**
- Create: `src/app/admin/actions.ts`

No unit tests — Server Actions depend on Next.js internals (`cookies`, `redirect`) that can't be meaningfully unit tested without the framework. Manual verification in Task 3 covers this.

- [ ] **Step 1: Add ADMIN_PASSWORD to .env.local**

Open `/Users/kunal.s/Documents/projects/portfolio/.env.local` and append:

```
ADMIN_PASSWORD=choose-a-strong-password-here
```

Replace `choose-a-strong-password-here` with any password you want to use to log in.

- [ ] **Step 2: Create actions.ts**

Create `src/app/admin/actions.ts`:

```ts
'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { getSessionToken } from './session'

export async function login(formData: FormData) {
  const password = formData.get('password') as string

  if (!password || password !== process.env.ADMIN_PASSWORD) {
    redirect('/admin?error=1')
  }

  const cookieStore = await cookies()
  cookieStore.set('admin_session', getSessionToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  })

  redirect('/admin')
}

export async function logout() {
  const cookieStore = await cookies()
  cookieStore.delete('admin_session')
  redirect('/admin')
}
```

- [ ] **Step 3: Run TypeScript check**

```bash
npm run build 2>&1 | head -30
```

Expected: no TypeScript errors in `actions.ts`. Build may fail on `page.tsx` (not yet created) — that's fine at this stage.

- [ ] **Step 4: Do NOT commit** — user commits manually.

---

## Task 3: Admin page

**Files:**
- Create: `src/app/admin/page.tsx`

- [ ] **Step 1: Create page.tsx**

Create `src/app/admin/page.tsx`:

```tsx
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

  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: submissions } = await supabase
    .from('contact_submissions')
    .select('*')
    .order('created_at', { ascending: false })

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
```

- [ ] **Step 2: Run build to verify TypeScript compiles**

```bash
npm run build 2>&1 | tail -20
```

Expected: build succeeds with no TypeScript errors.

- [ ] **Step 3: Run all tests**

```bash
npm test
```

Expected: all 16 tests pass.

- [ ] **Step 4: Manual verification — login flow**

Start the dev server:
```bash
npm run dev
```

Open `http://localhost:3000/admin`:
- Should show a centered login form with a password input and "Sign in" button

Enter a wrong password → click Sign in:
- Should redirect back to `/admin?error=1` with "Incorrect password." shown in red

Enter the correct password (the `ADMIN_PASSWORD` value from `.env.local`) → click Sign in:
- Should redirect to `/admin` and show the messages list (or "No messages yet." if no submissions exist)

Click "Sign out":
- Should redirect to `/admin` and show the login form again

- [ ] **Step 5: Do NOT commit** — user commits manually.

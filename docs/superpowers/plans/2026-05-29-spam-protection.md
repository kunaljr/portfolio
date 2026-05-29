# Spam Protection Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Protect the contact form from bots and repeat human spammers using a honeypot field and Supabase-backed IP rate limiting.

**Architecture:** A hidden `website` input in the form catches bots that auto-fill all fields; the server rejects any submission where it's non-empty. Server-side IP rate limiting queries the existing `contact_submissions` table to block IPs that have submitted 5 or more times in the last 24 hours. No external services or new infrastructure needed.

**Tech Stack:** Next.js API route, Supabase JS client, Vitest

---

## File Map

| File | Change |
|---|---|
| Supabase dashboard | Add `ip text` column to `contact_submissions` |
| `src/app/api/contact/route.ts` | Add honeypot check, IP extraction, rate limit query, IP in insert |
| `src/app/api/contact/route.test.ts` | Extend mock, add honeypot + rate limit tests, update 200 test |
| `src/components/Contact.tsx` | Add hidden honeypot input, include `website` in POST body |

---

## Task 1: Add `ip` column to Supabase

**Files:**
- Manual: Supabase dashboard SQL editor

- [ ] **Step 1: Run the migration in the Supabase dashboard**

Open your Supabase project → SQL Editor → run:

```sql
ALTER TABLE contact_submissions ADD COLUMN ip text;
```

Expected: "Success. No rows returned."

- [ ] **Step 2: Verify the column exists**

In the Supabase dashboard → Table Editor → `contact_submissions`. Confirm `ip` column is present with type `text`, nullable.

---

## Task 2: Honeypot check in the API route

**Files:**
- Modify: `src/app/api/contact/route.test.ts`
- Modify: `src/app/api/contact/route.ts`

- [ ] **Step 1: Write the failing test**

Add this test inside the `describe('POST /api/contact', ...)` block in `src/app/api/contact/route.test.ts`:

```typescript
it('returns 400 when honeypot field is filled', async () => {
  const res = await POST(makeRequest({
    name: 'Jane',
    email: 'jane@example.com',
    message: 'Hello, I have a project for you',
    website: 'http://spam.com',
  }))
  const json = await res.json()

  expect(res.status).toBe(400)
  expect(json.error).toBeTruthy()
  expect(mockFrom).not.toHaveBeenCalled()
})
```

- [ ] **Step 2: Run the test to verify it fails**

```bash
npm test -- src/app/api/contact/route.test.ts
```

Expected: FAIL — `returns 400 when honeypot field is filled` — status received 200, not 400.

- [ ] **Step 3: Implement the honeypot check in route.ts**

Replace the full contents of `src/app/api/contact/route.ts` with:

```typescript
import { createClient } from '@supabase/supabase-js'
import { validateContact } from './validate'

export async function POST(request: Request) {
  let body: { name?: unknown; email?: unknown; message?: unknown; website?: unknown }
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  if (typeof body.website === 'string' && body.website.length > 0) {
    return Response.json({ error: 'Invalid request.' }, { status: 400 })
  }

  const { name, email, message } = body

  const validationError = validateContact(
    typeof name === 'string' ? name : '',
    typeof email === 'string' ? email : '',
    typeof message === 'string' ? message : ''
  )
  if (validationError) {
    return Response.json({ error: validationError }, { status: 400 })
  }

  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !supabaseKey) {
    return Response.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }

  const supabase = createClient(supabaseUrl, supabaseKey)

  const { error: dbError } = await supabase
    .from('contact_submissions')
    .insert({
      name: (name as string).trim(),
      email: (email as string).trim(),
      message: (message as string).trim(),
    })

  if (dbError) {
    return Response.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }

  return Response.json({ ok: true })
}
```

- [ ] **Step 4: Run all tests to verify they pass**

```bash
npm test -- src/app/api/contact/route.test.ts
```

Expected: All tests PASS including the new honeypot test.

- [ ] **Step 5: Commit**

```bash
git add src/app/api/contact/route.ts src/app/api/contact/route.test.ts
git commit -m "feat: add honeypot check to contact API route"
```

---

## Task 3: IP rate limiting in the API route

**Files:**
- Modify: `src/app/api/contact/route.test.ts`
- Modify: `src/app/api/contact/route.ts`

- [ ] **Step 1: Update the mock setup and add new tests**

Replace the full contents of `src/app/api/contact/route.test.ts` with:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(),
}))

import { createClient } from '@supabase/supabase-js'
import { POST } from './route'

const mockInsert = vi.fn()
const mockGte = vi.fn()
const mockEq = vi.fn(() => ({ gte: mockGte }))
const mockSelect = vi.fn(() => ({ eq: mockEq }))
const mockFrom = vi.fn(() => ({ insert: mockInsert, select: mockSelect }))

beforeEach(() => {
  vi.clearAllMocks()
  ;(createClient as ReturnType<typeof vi.fn>).mockReturnValue({ from: mockFrom })
  process.env.SUPABASE_URL = 'https://example.supabase.co'
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-key'
  mockGte.mockResolvedValue({ data: [], error: null })
  mockInsert.mockResolvedValue({ error: null })
})

function makeRequest(body: unknown, headers: Record<string, string> = {}) {
  return new Request('http://localhost/api/contact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(body),
  })
}

describe('POST /api/contact', () => {
  it('returns 200 and inserts row with ip for valid input', async () => {
    const res = await POST(makeRequest(
      { name: 'Jane', email: 'jane@example.com', message: 'Hello, I have a project for you' },
      { 'x-forwarded-for': '1.2.3.4' }
    ))
    const json = await res.json()

    expect(res.status).toBe(200)
    expect(json).toEqual({ ok: true })
    expect(mockFrom).toHaveBeenCalledWith('contact_submissions')
    expect(mockInsert).toHaveBeenCalledWith({
      name: 'Jane',
      email: 'jane@example.com',
      message: 'Hello, I have a project for you',
      ip: '1.2.3.4',
    })
  })

  it('returns 400 for invalid input', async () => {
    const res = await POST(makeRequest({ name: 'J', email: 'jane@example.com', message: 'Hello' }))
    const json = await res.json()

    expect(res.status).toBe(400)
    expect(json.error).toBeTruthy()
    expect(mockInsert).not.toHaveBeenCalled()
  })

  it('returns 500 when Supabase insert fails', async () => {
    mockInsert.mockResolvedValue({ error: { message: 'db error' } })

    const res = await POST(makeRequest(
      { name: 'Jane', email: 'jane@example.com', message: 'Hello, I have a project for you' },
      { 'x-forwarded-for': '1.2.3.4' }
    ))
    const json = await res.json()

    expect(res.status).toBe(500)
    expect(json.error).toBeTruthy()
  })

  it('returns 400 for malformed JSON body', async () => {
    const res = await POST(new Request('http://localhost/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'not-valid-json',
    }))
    const json = await res.json()

    expect(res.status).toBe(400)
    expect(json.error).toBeTruthy()
    expect(mockInsert).not.toHaveBeenCalled()
  })

  it('returns 400 when honeypot field is filled', async () => {
    const res = await POST(makeRequest({
      name: 'Jane',
      email: 'jane@example.com',
      message: 'Hello, I have a project for you',
      website: 'http://spam.com',
    }))
    const json = await res.json()

    expect(res.status).toBe(400)
    expect(json.error).toBeTruthy()
    expect(mockInsert).not.toHaveBeenCalled()
  })

  it('returns 429 when IP has 5 or more submissions in the last 24 hours', async () => {
    mockGte.mockResolvedValue({ data: Array(5).fill({ id: 'x' }), error: null })

    const res = await POST(makeRequest(
      { name: 'Jane', email: 'jane@example.com', message: 'Hello, I have a project for you' },
      { 'x-forwarded-for': '1.2.3.4' }
    ))
    const json = await res.json()

    expect(res.status).toBe(429)
    expect(json.error).toBe('Too many messages. Please try again tomorrow.')
    expect(mockInsert).not.toHaveBeenCalled()
  })

  it('stores ip as unknown and skips rate check when x-forwarded-for header is absent', async () => {
    const res = await POST(makeRequest(
      { name: 'Jane', email: 'jane@example.com', message: 'Hello, I have a project for you' }
    ))
    const json = await res.json()

    expect(res.status).toBe(200)
    expect(mockGte).not.toHaveBeenCalled()
    expect(mockInsert).toHaveBeenCalledWith(expect.objectContaining({ ip: 'unknown' }))
  })
})
```

- [ ] **Step 2: Run the tests to verify new ones fail**

```bash
npm test -- src/app/api/contact/route.test.ts
```

Expected: The two new tests FAIL — `returns 429 when IP has 5 or more submissions` and `stores ip as unknown`.

- [ ] **Step 3: Implement IP extraction, rate limit query, and IP in insert**

Replace the full contents of `src/app/api/contact/route.ts` with:

```typescript
import { createClient } from '@supabase/supabase-js'
import { validateContact } from './validate'

export async function POST(request: Request) {
  let body: { name?: unknown; email?: unknown; message?: unknown; website?: unknown }
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  if (typeof body.website === 'string' && body.website.length > 0) {
    return Response.json({ error: 'Invalid request.' }, { status: 400 })
  }

  const { name, email, message } = body

  const validationError = validateContact(
    typeof name === 'string' ? name : '',
    typeof email === 'string' ? email : '',
    typeof message === 'string' ? message : ''
  )
  if (validationError) {
    return Response.json({ error: validationError }, { status: 400 })
  }

  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !supabaseKey) {
    return Response.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }

  const supabase = createClient(supabaseUrl, supabaseKey)

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown'

  if (ip !== 'unknown') {
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    const { data } = await supabase
      .from('contact_submissions')
      .select('id')
      .eq('ip', ip)
      .gte('created_at', cutoff)

    if ((data?.length ?? 0) >= 5) {
      return Response.json(
        { error: 'Too many messages. Please try again tomorrow.' },
        { status: 429 }
      )
    }
  }

  const { error: dbError } = await supabase
    .from('contact_submissions')
    .insert({
      name: (name as string).trim(),
      email: (email as string).trim(),
      message: (message as string).trim(),
      ip,
    })

  if (dbError) {
    return Response.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }

  return Response.json({ ok: true })
}
```

- [ ] **Step 4: Run all tests to verify they all pass**

```bash
npm test -- src/app/api/contact/route.test.ts
```

Expected: All 7 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/app/api/contact/route.ts src/app/api/contact/route.test.ts
git commit -m "feat: add IP rate limiting to contact API route"
```

---

## Task 4: Add honeypot field to Contact.tsx

**Files:**
- Modify: `src/components/Contact.tsx`

- [ ] **Step 1: Add a `websiteRef` at the top of the component**

In `src/components/Contact.tsx`, add `useRef` to the React import and declare the ref inside the `Contact` function, immediately after the existing state declarations:

```typescript
import { useState, useEffect, useRef } from 'react'
```

```typescript
// Inside Contact(), after the existing useState declarations:
const websiteRef = useRef<HTMLInputElement>(null)
```

- [ ] **Step 2: Add the hidden honeypot input to the form**

In `src/components/Contact.tsx`, add the hidden input as the first child inside `<div className="cform">`, before the first `<div className="fg">`:

```tsx
<div className="cform">
  <input
    ref={websiteRef}
    type="text"
    name="website"
    style={{ position: 'absolute', left: '-9999px' }}
    tabIndex={-1}
    autoComplete="off"
    aria-hidden="true"
  />
  <div className="fg">
    {/* existing name field */}
```

- [ ] **Step 3: Include `website` in the POST body**

In `src/components/Contact.tsx`, update the `fetch` call inside `handleSubmit` to include the honeypot value:

```typescript
body: JSON.stringify({ name, email, message, website: websiteRef.current?.value ?? '' }),
```

- [ ] **Step 4: Run all tests to verify nothing broke**

```bash
npm test
```

Expected: All tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/Contact.tsx
git commit -m "feat: add hidden honeypot field to contact form"
```

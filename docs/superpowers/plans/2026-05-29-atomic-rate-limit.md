# Atomic Rate Limiting Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix a race condition where parallel requests from the same IP all pass the rate limit check before any insert lands, by replacing the non-atomic select+insert with a single advisory-locked PostgreSQL RPC call.

**Architecture:** A new Supabase function `submit_contact` acquires `pg_advisory_xact_lock(hashtext(p_ip))` before checking the count and inserting, serializing concurrent requests from the same IP. The API route replaces its two-step select→insert with a single `supabase.rpc('submit_contact', {...})` call and reads the function's `{ ok }` response.

**Tech Stack:** Next.js API route, Supabase JS client (`supabase.rpc`), PostgreSQL advisory locks, Vitest

---

## File Map

| File | Change |
|---|---|
| Supabase dashboard | Create `submit_contact` PostgreSQL function |
| `src/app/api/contact/route.ts` | Replace select+insert block with single `supabase.rpc(...)` call |
| `src/app/api/contact/route.test.ts` | Replace select-chain mock with `mockRpc`, rewrite all affected tests |

---

## Task 1: Create `submit_contact` Supabase function

**Files:**
- Manual: Supabase dashboard SQL editor

- [ ] **Step 1: Run the function definition in the Supabase SQL Editor**

Open your Supabase project → SQL Editor → run:

```sql
CREATE OR REPLACE FUNCTION submit_contact(
  p_name text,
  p_email text,
  p_message text,
  p_ip text
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_count int;
BEGIN
  IF p_ip != 'unknown' THEN
    PERFORM pg_advisory_xact_lock(hashtext(p_ip));

    SELECT COUNT(*) INTO v_count
    FROM contact_submissions
    WHERE ip = p_ip AND created_at > NOW() - INTERVAL '24 hours';

    IF v_count >= 5 THEN
      RETURN json_build_object('ok', false, 'error', 'rate_limited');
    END IF;
  END IF;

  INSERT INTO contact_submissions (name, email, message, ip)
  VALUES (p_name, p_email, p_message, p_ip);

  RETURN json_build_object('ok', true);
END;
$$;
```

Expected: "Success. No rows returned."

- [ ] **Step 2: Verify the function exists**

In Supabase dashboard → Database → Functions. Confirm `submit_contact` is listed with return type `json`.

---

## Task 2: Replace select+insert with RPC in route.ts and update tests

**Files:**
- Modify: `src/app/api/contact/route.test.ts`
- Modify: `src/app/api/contact/route.ts`

- [ ] **Step 1: Replace the full contents of `src/app/api/contact/route.test.ts`**

This rewrites the mock from a select chain to a single `mockRpc`, and updates all tests accordingly:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(),
}))

import { createClient } from '@supabase/supabase-js'
import { POST } from './route'

const mockRpc = vi.fn()

beforeEach(() => {
  vi.clearAllMocks()
  ;(createClient as ReturnType<typeof vi.fn>).mockReturnValue({ rpc: mockRpc })
  process.env.SUPABASE_URL = 'https://example.supabase.co'
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-key'
  mockRpc.mockResolvedValue({ data: { ok: true }, error: null })
})

function makeRequest(body: unknown, headers: Record<string, string> = {}) {
  return new Request('http://localhost/api/contact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(body),
  })
}

describe('POST /api/contact', () => {
  it('returns 200 and calls RPC with correct params for valid input', async () => {
    const res = await POST(makeRequest(
      { name: 'Jane', email: 'jane@example.com', message: 'Hello, I have a project for you' },
      { 'x-vercel-forwarded-for': '1.2.3.4' }
    ))
    const json = await res.json()

    expect(res.status).toBe(200)
    expect(json).toEqual({ ok: true })
    expect(mockRpc).toHaveBeenCalledWith('submit_contact', {
      p_name: 'Jane',
      p_email: 'jane@example.com',
      p_message: 'Hello, I have a project for you',
      p_ip: '1.2.3.4',
    })
  })

  it('returns 400 for invalid input', async () => {
    const res = await POST(makeRequest({ name: 'J', email: 'jane@example.com', message: 'Hello' }))
    const json = await res.json()

    expect(res.status).toBe(400)
    expect(json.error).toBeTruthy()
    expect(mockRpc).not.toHaveBeenCalled()
  })

  it('returns 500 when RPC call fails', async () => {
    mockRpc.mockResolvedValue({ data: null, error: { message: 'db error' } })

    const res = await POST(makeRequest(
      { name: 'Jane', email: 'jane@example.com', message: 'Hello, I have a project for you' },
      { 'x-vercel-forwarded-for': '1.2.3.4' }
    ))
    const json = await res.json()

    expect(res.status).toBe(500)
    expect(json.error).toBeTruthy()
  })

  it('returns 429 when RPC returns rate limited', async () => {
    mockRpc.mockResolvedValue({ data: { ok: false }, error: null })

    const res = await POST(makeRequest(
      { name: 'Jane', email: 'jane@example.com', message: 'Hello, I have a project for you' },
      { 'x-vercel-forwarded-for': '1.2.3.4' }
    ))
    const json = await res.json()

    expect(res.status).toBe(429)
    expect(json.error).toBe('Too many messages. Please try again tomorrow.')
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
    expect(mockRpc).not.toHaveBeenCalled()
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
    expect(mockRpc).not.toHaveBeenCalled()
  })

  it('accepts submission when honeypot field is empty string', async () => {
    const res = await POST(makeRequest(
      { name: 'Jane', email: 'jane@example.com', message: 'Hello, I have a project for you', website: '' },
      { 'x-vercel-forwarded-for': '1.2.3.4' }
    ))
    expect(res.status).toBe(200)
    expect(mockRpc).toHaveBeenCalled()
  })

  it('passes ip as unknown when no IP header is present', async () => {
    const res = await POST(makeRequest(
      { name: 'Jane', email: 'jane@example.com', message: 'Hello, I have a project for you' }
    ))
    const json = await res.json()

    expect(res.status).toBe(200)
    expect(mockRpc).toHaveBeenCalledWith('submit_contact', expect.objectContaining({ p_ip: 'unknown' }))
  })

  it('uses x-vercel-forwarded-for header when present', async () => {
    const res = await POST(makeRequest(
      { name: 'Jane', email: 'jane@example.com', message: 'Hello, I have a project for you' },
      { 'x-vercel-forwarded-for': '9.9.9.9' }
    ))

    expect(res.status).toBe(200)
    expect(mockRpc).toHaveBeenCalledWith('submit_contact', expect.objectContaining({ p_ip: '9.9.9.9' }))
  })

  it('uses the last x-forwarded-for entry when multiple IPs are present', async () => {
    const res = await POST(makeRequest(
      { name: 'Jane', email: 'jane@example.com', message: 'Hello, I have a project for you' },
      { 'x-forwarded-for': 'spoofed, 5.6.7.8' }
    ))

    expect(res.status).toBe(200)
    expect(mockRpc).toHaveBeenCalledWith('submit_contact', expect.objectContaining({ p_ip: '5.6.7.8' }))
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
cd /Users/kunal.s/Documents/projects/portfolio && npm test -- src/app/api/contact/route.test.ts
```

Expected: Multiple FAIL — the mock returns `{ rpc: mockRpc }` but the route still calls `supabase.from(...)`, so calls land on `undefined`.

- [ ] **Step 3: Replace the full contents of `src/app/api/contact/route.ts`**

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

  const ip =
    request.headers.get('x-vercel-forwarded-for') ??
    request.headers.get('x-forwarded-for')?.split(',').at(-1)?.trim() ??
    'unknown'

  const { data: rpcData, error: rpcError } = await supabase.rpc('submit_contact', {
    p_name: (name as string).trim(),
    p_email: (email as string).trim(),
    p_message: (message as string).trim(),
    p_ip: ip,
  })

  if (rpcError) {
    return Response.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }

  if (!rpcData?.ok) {
    return Response.json({ error: 'Too many messages. Please try again tomorrow.' }, { status: 429 })
  }

  return Response.json({ ok: true })
}
```

- [ ] **Step 4: Run all tests to verify they pass**

```bash
cd /Users/kunal.s/Documents/projects/portfolio && npm test -- src/app/api/contact/route.test.ts
```

Expected: All 10 tests PASS.

- [ ] **Step 5: Run the full test suite to confirm no regressions**

```bash
cd /Users/kunal.s/Documents/projects/portfolio && npm test
```

Expected: All tests across all 4 test files PASS.

- [ ] **Step 6: Commit**

```bash
cd /Users/kunal.s/Documents/projects/portfolio && git add src/app/api/contact/route.ts src/app/api/contact/route.test.ts && git commit -m "fix: replace select+insert with atomic RPC to prevent race condition"
```

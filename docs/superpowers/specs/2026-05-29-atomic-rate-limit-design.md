# Contact Form — Atomic Rate Limiting

**Date:** 2026-05-29  
**Status:** Approved

## Problem

The existing IP rate limit check (select count → compare → insert) is non-atomic. A script firing parallel requests sees a count of 0 on every request before any insert lands, allowing all requests through. In practice: 10 identical messages from the same IP arrived within 494ms because all 10 passed the count check before any of them inserted a row.

## Goal

Make the rate limit check and insert atomic so concurrent requests from the same IP are serialized and the limit is enforced correctly.

## Architecture

A PostgreSQL function `submit_contact` replaces the current two-step select→insert in the API route. The route makes a single `supabase.rpc('submit_contact', {...})` call. The function:

1. If IP is not `'unknown'`: acquires `pg_advisory_xact_lock(hashtext(p_ip))` — concurrent requests from the same IP block here and execute one at a time
2. Counts submissions from that IP in the last 24h
3. If count ≥ 5: returns `{ ok: false, error: 'rate_limited' }`
4. Inserts the row
5. Returns `{ ok: true }`

The advisory lock is transaction-scoped and releases automatically when the function returns. Requests with `ip = 'unknown'` skip the lock and count check (same behaviour as the current implementation).

## Supabase Function

Run in Supabase SQL Editor:

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

## File Changes

### `src/app/api/contact/route.ts`

Remove:
- `select('id').eq('ip', ip).gte('created_at', cutoff)` rate limit query
- `rateError` check
- `data?.length >= 5` check
- Separate `supabase.from(...).insert(...)` call

Add:
```typescript
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
```

### `src/app/api/contact/route.test.ts`

Remove: `mockInsert`, `mockGte`, `mockEq`, `mockSelect` mocks and the chained `mockFrom` setup.

Add: `mockRpc` mock on the Supabase client:

```typescript
const mockRpc = vi.fn()
// in beforeEach:
;(createClient as ReturnType<typeof vi.fn>).mockReturnValue({ rpc: mockRpc })
mockRpc.mockResolvedValue({ data: { ok: true }, error: null })
```

Updated test cases:
- Valid input → `mockRpc` returns `{ data: { ok: true }, error: null }` → 200
- Rate limited → `mockRpc` returns `{ data: { ok: false }, error: null }` → 429
- RPC error → `mockRpc` returns `{ data: null, error: { message: 'db error' } }` → 500
- Honeypot filled → `mockRpc` not called → 400
- Unknown IP (no header) → `mockRpc` called with `p_ip: 'unknown'` → 200

## Data Flow

```
POST /api/contact { name, email, message, website }
  → honeypot check (website non-empty → 400)
  → field validation
  → extract IP (x-vercel-forwarded-for → x-forwarded-for last → 'unknown')
  → supabase.rpc('submit_contact', { p_name, p_email, p_message, p_ip })
      → [DB] advisory lock on hashtext(ip)  ← serializes concurrent requests
      → [DB] count recent submissions
      → [DB] if ≥ 5: return { ok: false }   ← 429
      → [DB] insert row
      → [DB] return { ok: true }            ← 200
  → if rpcError → 500
  → if !data.ok → 429
  → 200 { ok: true }
```

## Error Handling

| Scenario | Response |
|---|---|
| Honeypot filled | `400 { error: 'Invalid request.' }` |
| Rate limit exceeded (atomic) | `429 { error: 'Too many messages. Please try again tomorrow.' }` |
| RPC call fails | `500 { error: 'Something went wrong. Please try again.' }` |
| IP header absent | Submission proceeds with `ip: 'unknown'`, no rate check |

## Out of Scope

- Per-email rate limiting
- Retrying on advisory lock timeout
- Exposing the `submit_contact` function to any role other than the service role

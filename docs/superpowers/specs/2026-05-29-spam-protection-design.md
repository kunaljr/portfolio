# Contact Form — Spam Protection

**Date:** 2026-05-29  
**Status:** Approved

## Problem

The contact form API route has no rate limiting or bot protection. Both automated bots and real humans can submit unlimited messages, polluting the `contact_submissions` table.

## Goal

Block bot submissions and limit real users to 3 submissions per IP per 24 hours, using no external services or dependencies.

## Architecture

Two complementary server-enforced layers:

1. **Honeypot field** — catches bots that auto-fill every input
2. **IP-based rate limiter** — catches both bots and humans submitting repeatedly

### Honeypot Field

A visually hidden `website` input is added to the contact form, positioned off-screen (`position: absolute; left: -9999px`). Real users never see or interact with it. Bots that auto-fill all fields will populate it.

The server rejects any submission where `website` is non-empty with a silent `400` — no hint to the bot that it was caught.

### IP Rate Limiter

Before inserting a submission, the API:

1. Extracts the client IP from the `x-forwarded-for` header (Vercel sets this; first entry is the real client)
2. Falls back to `'unknown'` if the header is absent — these submissions still go through but don't count toward any IP's limit
3. Queries `contact_submissions` for rows matching that IP in the last 24 hours
4. Returns `429` if count ≥ 5

**Limit:** 5 submissions per IP per 24 hours.

## Data Changes

### Supabase Schema

Add `ip` column to `contact_submissions`:

| Column | Type | Notes |
|---|---|---|
| `ip` | `text` | Nullable — existing rows unaffected, missing header never blocks |

Added via Supabase dashboard (no migration file needed).

### Rate Limit Query

```sql
SELECT COUNT(*) FROM contact_submissions
WHERE ip = '<client-ip>' AND created_at > NOW() - INTERVAL '24 hours'
```

## File Changes

### `src/components/Contact.tsx`

Add a visually hidden honeypot field inside the form:

```tsx
<input
  type="text"
  name="website"
  style={{ position: 'absolute', left: '-9999px' }}
  tabIndex={-1}
  autoComplete="off"
/>
```

Include `website` value in the POST body alongside `name`, `email`, `message`.

### `src/app/api/contact/route.ts`

Four additions in order:

1. Read `website` from body — if non-empty, return `400 { error: 'Invalid request.' }`
2. Extract IP: `request.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown'`
3. If IP is not `'unknown'`, query submission count for last 24h — if ≥ 5, return `429 { error: 'Too many messages. Please try again tomorrow.' }`
4. Include `ip` in the Supabase insert payload

### `src/app/api/contact/validate.ts`

No changes.

### `src/app/api/contact/route.test.ts`

New test cases:
- Honeypot field filled → `400`
- Rate limit exceeded (mock 5 prior submissions from same IP) → `429`
- Normal submission stores `ip` field in Supabase insert

## Data Flow

```
User submits form
  → POST /api/contact { name, email, message, website }
    → if website non-empty → 400 (honeypot triggered)
    → server-side field validation (existing)
    → extract IP from x-forwarded-for
    → if IP known: query count of submissions from IP in last 24h
      → if count >= 5 → 429
    → insert row (name, email, message, ip)
    → 200 { ok: true }
```

## Error Handling

| Scenario | Response |
|---|---|
| Honeypot filled | `400 { error: 'Invalid request.' }` |
| Rate limit exceeded | `429 { error: 'Too many messages. Please try again tomorrow.' }` |
| IP header absent | Submission proceeds, `ip` stored as `'unknown'` |
| Existing validation/DB errors | Unchanged from current behaviour |

## Out of Scope

- CAPTCHA or external bot-detection services
- Per-email rate limiting
- Admin UI to manage blocked IPs
- Allowlisting specific IPs

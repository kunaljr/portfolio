# Contact Form — Supabase Storage

**Date:** 2026-05-26  
**Status:** Approved

## Problem

The contact form validates input client-side but does nothing with the data on submit — it shows a toast pointing the user to a direct email. Submissions are lost.

## Goal

Store every valid contact form submission in a Supabase database table so they can be browsed later via the Supabase dashboard. No email notification needed.

## Architecture

### Supabase Table

Table: `contact_submissions`

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` | Primary key, default `gen_random_uuid()` |
| `name` | `text` | Not null |
| `email` | `text` | Not null |
| `message` | `text` | Not null |
| `created_at` | `timestamptz` | Default `now()` |

RLS: disabled (inserts handled server-side via service role key, table is not publicly readable).

### API Route

`src/app/api/contact/route.ts` — POST handler only.

- Parses JSON body (`name`, `email`, `message`)
- Re-validates server-side (same rules as client: name ≥ 2 chars, valid email, message ≥ 10 chars)
- Inserts row using the Supabase service role key (server-only, never sent to browser)
- Returns `200 { ok: true }` on success, `400 { error: string }` on validation failure, `500 { error: string }` on Supabase error

### Contact.tsx Changes

- `handleSubmit` becomes `async`
- After client-side validation passes, POSTs to `/api/contact`
- On `200`: shows updated success toast ("Message sent — I'll get back to you soon.")
- On non-200 or network error: sets a form-level error string displayed below the submit button
- Submit button shows a loading state while the request is in flight (disabled + spinner or "Sending…" label)

### Environment Variables

Added to `.env.local` (not committed):

```
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
```

Both are server-only — used only inside the API route, never referenced from client code. No `NEXT_PUBLIC_` prefix needed since neither variable is accessed in the browser.

### New Dependency

`@supabase/supabase-js` — official Supabase JS client.

## Data Flow

```
User fills form
  → client-side validate()
  → POST /api/contact { name, email, message }
    → server-side validate
    → supabase.from('contact_submissions').insert(...)
    → return 200
  → show success toast
```

## Error Handling

| Scenario | Behaviour |
|---|---|
| Client validation fails | Inline field errors (existing behaviour) |
| Network error | Form-level error: "Something went wrong. Please try again." |
| Supabase insert fails | Form-level error: "Something went wrong. Please try again." |
| Server validation fails | Form-level error (should not happen if client validation is correct) |

## Out of Scope

- Email notifications
- Admin UI or read API for submissions
- Rate limiting
- Spam protection (honeypot, CAPTCHA)

# Admin Messages Page — Design

**Date:** 2026-05-26  
**Status:** Approved

## Problem

Contact form submissions are stored in Supabase but there's no way to view them without logging into the Supabase dashboard.

## Goal

A simple password-protected page at `/admin` that displays all contact form submissions, newest first. Only accessible with the correct password.

## Architecture

### Route

`src/app/admin/page.tsx` — Next.js Server Component.

On every request:
1. Reads the `admin_session` cookie from the incoming request
2. If cookie is missing or invalid: renders the password form
3. If cookie is valid: fetches all rows from `contact_submissions` ordered by `created_at DESC` and renders the message list

### Server Action

`src/app/admin/actions.ts` — two exported Server Actions:

**`login(formData: FormData)`**
- Reads `password` from form data
- Compares against `process.env.ADMIN_PASSWORD`
- On match: sets a `HttpOnly`, `Secure`, `SameSite=Strict` cookie named `admin_session` with a 7-day max-age, then redirects to `/admin`
- On mismatch: returns `{ error: 'Incorrect password' }`

**`logout()`**
- Clears the `admin_session` cookie
- Redirects to `/admin`

### Supabase Read

Uses the same `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` env vars already in `.env.local`. Fetches directly in the Server Component (no new API route needed).

### Environment Variable

`ADMIN_PASSWORD` — added to `.env.local`. Server-only (no `NEXT_PUBLIC_` prefix). Never sent to the browser.

## UI

### Password Form (unauthenticated)

- Centered on page, minimal
- Single password input + submit button
- Error message shown inline if password is wrong
- Matches existing site font/color variables

### Message List (authenticated)

- Each submission shown as a card or row: **name**, **email**, **message**, **date**
- Sorted newest first
- A logout link/button at the top
- No pagination

## Data Flow

```
GET /admin
  → read admin_session cookie
  → valid? → supabase.from('contact_submissions').select('*').order('created_at', { ascending: false })
           → render message list
  → invalid? → render password form

POST /admin (Server Action: login)
  → compare password to ADMIN_PASSWORD
  → match? → set admin_session cookie → redirect /admin
  → mismatch? → return { error: 'Incorrect password' }
```

## Security Notes

- Password is stored only in `ADMIN_PASSWORD` env var — never in source code or client bundle
- Cookie is `HttpOnly` (no JS access), `Secure` (HTTPS only), `SameSite=Strict`
- Cookie value is `sha256(ADMIN_PASSWORD)` — set on login, compared on every request. Changing `ADMIN_PASSWORD` automatically invalidates all existing sessions. No separate session storage needed.
- Service role key used for reads — same as contact form inserts

## Out of Scope

- Deleting or archiving messages
- Marking messages as read/unread
- Pagination
- Multiple admin users
- Login attempt rate limiting

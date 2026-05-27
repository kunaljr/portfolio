# Admin Search & Pagination — Design

**Date:** 2026-05-27  
**Status:** Approved

## Problem

The admin messages page loads all submissions at once with no way to filter or navigate across many messages.

## Goal

Add a debounced search input and URL-based pagination to `/admin`. Search covers name, email, and message body. Page size is 20.

## Architecture

### URL Shape

```
/admin?q=<search-term>&page=<number>
```

- `q` — optional search query (empty = no filter)
- `page` — 1-indexed page number (default: 1)
- Both params reset to clean state on each search (searching always goes back to page 1)

### Components

**`src/app/admin/SearchBar.tsx`** — Client Component

- Reads initial value from `useSearchParams()` so the input stays in sync on page load
- Controlled input — `value` state mirrors typed text immediately
- 300ms debounce via `useRef<ReturnType<typeof setTimeout>>`
- On debounce fire: builds new URL from `window.location.href`, sets/deletes `q`, deletes `page`, calls `router.push()`
- Styled to match existing admin input style (`var(--bg)`, `var(--bdr)`, `var(--tx)`, `var(--r2)`, `var(--fb)`)

**`src/app/admin/page.tsx`** — Server Component (updated)

- Reads `q` and `page` from awaited `searchParams`
- Sanitises: `q = (params.q as string)?.trim() || ''`, `page = Math.max(1, parseInt(params.page) || 1)`
- Builds Supabase query:
  - `.select('*', { count: 'exact' })`
  - `.order('created_at', { ascending: false })`
  - `.range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1)`
  - If `q` non-empty: `.or('name.ilike.%q%,email.ilike.%q%,message.ilike.%q%')`
- Renders `<SearchBar />` above the message list
- Renders pagination controls below the list

### Pagination Controls

Inline in `page.tsx`. Renders as plain `<a>` links (no JS needed):

- Previous page link (disabled/muted when on page 1)
- Page number buttons — show all if ≤ 7 pages; otherwise show first, last, current ± 1, with `…` gaps
- Next page link (disabled/muted on last page)
- Links preserve the current `q` param: `/admin?q=foo&page=2`

### `PAGE_SIZE` Constant

`const PAGE_SIZE = 20` defined at the top of `page.tsx`.

## Data Flow

```
GET /admin?q=foo&page=2
  → Server Component reads searchParams
  → Supabase: .or(ilike x3).range(20, 39).count
  → renders SearchBar (initialValue="foo") + 20 results + pagination
  
User types in SearchBar
  → 300ms debounce
  → router.push('/admin?q=bar&page=1')  ← always resets to page 1
  → Server re-renders with new filter
```

## Security

- `q` is passed to Supabase via parameterised `.ilike()` — not interpolated into raw SQL. No injection risk.
- `page` is parsed with `parseInt` and clamped to `Math.max(1, ...)`. Out-of-range pages return empty results naturally.
- No new auth surface — session check is unchanged.

## Testing

Unit tests cover the pure extraction/sanitisation logic only (if any is extracted to a helper). The `SearchBar` component and pagination links are verified via manual testing in dev.

**Manual test checklist:**
- Empty search shows all messages, page 1
- Typing a name filters results after 300ms
- Typing clears back to empty restores all results
- Paginating preserves the current search query in the URL
- Navigating directly to `/admin?q=foo&page=2` loads correctly (shareable URLs work)
- Page 1 prev link is visually disabled (no broken navigation)
- Last page next link is visually disabled

## Out of Scope

- Server-side search (API route / React Query)
- Sorting controls
- Per-page size selector
- Infinite scroll

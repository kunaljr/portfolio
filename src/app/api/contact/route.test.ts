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

  it('accepts submission when honeypot field is empty string', async () => {
    const res = await POST(makeRequest(
      { name: 'Jane', email: 'jane@example.com', message: 'Hello, I have a project for you', website: '' },
      { 'x-forwarded-for': '1.2.3.4' }
    ))
    expect(res.status).toBe(200)
    expect(mockFrom).toHaveBeenCalled()
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

  it('allows submission when IP has exactly 4 submissions in the last 24 hours', async () => {
    mockGte.mockResolvedValue({ data: Array(4).fill({ id: 'x' }), error: null })

    const res = await POST(makeRequest(
      { name: 'Jane', email: 'jane@example.com', message: 'Hello, I have a project for you' },
      { 'x-forwarded-for': '1.2.3.4' }
    ))
    const json = await res.json()

    expect(res.status).toBe(200)
    expect(mockInsert).toHaveBeenCalled()
  })

  it('returns 500 when rate limit query fails', async () => {
    mockGte.mockResolvedValue({ data: null, error: { message: 'db error' } })

    const res = await POST(makeRequest(
      { name: 'Jane', email: 'jane@example.com', message: 'Hello, I have a project for you' },
      { 'x-forwarded-for': '1.2.3.4' }
    ))
    const json = await res.json()

    expect(res.status).toBe(500)
    expect(json.error).toBeTruthy()
    expect(mockInsert).not.toHaveBeenCalled()
  })

  it('uses the last x-forwarded-for entry when multiple IPs are present', async () => {
    mockGte.mockResolvedValue({ data: Array(5).fill({ id: 'x' }), error: null })

    // 'spoofed' is first (client-controlled), '5.6.7.8' is last (proxy-appended real IP)
    const res = await POST(makeRequest(
      { name: 'Jane', email: 'jane@example.com', message: 'Hello, I have a project for you' },
      { 'x-forwarded-for': 'spoofed, 5.6.7.8' }
    ))

    expect(res.status).toBe(429)
    // Verify it queried by the last IP, not the first
    expect(mockEq).toHaveBeenCalledWith('ip', '5.6.7.8')
  })

  it('uses x-real-ip header when present', async () => {
    const res = await POST(makeRequest(
      { name: 'Jane', email: 'jane@example.com', message: 'Hello, I have a project for you' },
      { 'x-real-ip': '9.9.9.9' }
    ))
    const json = await res.json()

    expect(res.status).toBe(200)
    expect(mockInsert).toHaveBeenCalledWith(expect.objectContaining({ ip: '9.9.9.9' }))
  })
})

import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(),
}))

import { createClient } from '@supabase/supabase-js'
import { POST } from './route'

const mockInsert = vi.fn()
const mockFrom = vi.fn(() => ({ insert: mockInsert }))

beforeEach(() => {
  vi.clearAllMocks()
  ;(createClient as ReturnType<typeof vi.fn>).mockReturnValue({ from: mockFrom })
  process.env.SUPABASE_URL = 'https://example.supabase.co'
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-key'
})

function makeRequest(body: unknown) {
  return new Request('http://localhost/api/contact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

describe('POST /api/contact', () => {
  it('returns 200 and inserts row for valid input', async () => {
    mockInsert.mockResolvedValue({ error: null })

    const res = await POST(makeRequest({ name: 'Jane', email: 'jane@example.com', message: 'Hello, I have a project for you' }))
    const json = await res.json()

    expect(res.status).toBe(200)
    expect(json).toEqual({ ok: true })
    expect(mockFrom).toHaveBeenCalledWith('contact_submissions')
    expect(mockInsert).toHaveBeenCalledWith({
      name: 'Jane',
      email: 'jane@example.com',
      message: 'Hello, I have a project for you',
    })
  })

  it('returns 400 for invalid input', async () => {
    const res = await POST(makeRequest({ name: 'J', email: 'jane@example.com', message: 'Hello' }))
    const json = await res.json()

    expect(res.status).toBe(400)
    expect(json.error).toBeTruthy()
    expect(mockFrom).not.toHaveBeenCalled()
  })

  it('returns 500 when Supabase insert fails', async () => {
    mockInsert.mockResolvedValue({ error: { message: 'db error' } })

    const res = await POST(makeRequest({ name: 'Jane', email: 'jane@example.com', message: 'Hello, I have a project for you' }))
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
    expect(mockFrom).not.toHaveBeenCalled()
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
    expect(mockFrom).not.toHaveBeenCalled()
  })

  it('accepts submission when honeypot field is empty string', async () => {
    mockInsert.mockResolvedValue({ error: null })
    const res = await POST(makeRequest({
      name: 'Jane',
      email: 'jane@example.com',
      message: 'Hello, I have a project for you',
      website: '',
    }))
    expect(res.status).toBe(200)
    expect(mockFrom).toHaveBeenCalled()
  })
})

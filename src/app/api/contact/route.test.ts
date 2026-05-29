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

  it('returns 500 when RPC returns null data with no error', async () => {
    mockRpc.mockResolvedValue({ data: null, error: null })

    const res = await POST(makeRequest(
      { name: 'Jane', email: 'jane@example.com', message: 'Hello, I have a project for you' },
      { 'x-vercel-forwarded-for': '1.2.3.4' }
    ))
    const json = await res.json()

    expect(res.status).toBe(500)
    expect(json.error).toBeTruthy()
  })
})

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { createHash } from 'crypto'
import { getSessionToken, isValidSession } from './session'

describe('session helpers', () => {
  beforeEach(() => {
    process.env.ADMIN_PASSWORD = 'test-password-123'
  })
  afterEach(() => {
    delete process.env.ADMIN_PASSWORD
  })

  it('getSessionToken returns sha256 of ADMIN_PASSWORD', () => {
    const expected = createHash('sha256').update('test-password-123').digest('hex')
    expect(getSessionToken()).toBe(expected)
  })

  it('getSessionToken throws if ADMIN_PASSWORD is not set', () => {
    delete process.env.ADMIN_PASSWORD
    expect(() => getSessionToken()).toThrow('ADMIN_PASSWORD environment variable is not set')
  })

  it('isValidSession returns true for the correct token', () => {
    expect(isValidSession(getSessionToken())).toBe(true)
  })

  it('isValidSession returns false for a wrong token', () => {
    expect(isValidSession('not-the-right-token')).toBe(false)
  })

  it('isValidSession returns false for undefined', () => {
    expect(isValidSession(undefined)).toBe(false)
  })

  it('isValidSession returns false for empty string', () => {
    expect(isValidSession('')).toBe(false)
  })

  it('isValidSession returns false when ADMIN_PASSWORD is not set', () => {
    delete process.env.ADMIN_PASSWORD
    expect(isValidSession('any-token')).toBe(false)
  })
})

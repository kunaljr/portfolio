import { describe, it, expect } from 'vitest'
import { validateContact } from './validate'

describe('validateContact', () => {
  it('returns null for valid input', () => {
    expect(validateContact('Jane Smith', 'jane@example.com', 'Hello there, I have a project for you')).toBeNull()
  })

  it('rejects name shorter than 2 chars', () => {
    expect(validateContact('J', 'jane@example.com', 'Hello there, I have a project')).toBe('Name is required')
  })

  it('rejects empty name', () => {
    expect(validateContact('', 'jane@example.com', 'Hello there, I have a project')).toBe('Name is required')
  })

  it('rejects invalid email — no @', () => {
    expect(validateContact('Jane', 'notanemail', 'Hello there, I have a project')).toBe('A valid email address is required')
  })

  it('rejects invalid email — no domain', () => {
    expect(validateContact('Jane', 'jane@', 'Hello there, I have a project')).toBe('A valid email address is required')
  })

  it('rejects message shorter than 10 chars', () => {
    expect(validateContact('Jane', 'jane@example.com', 'Hi')).toBe('Message must be at least 10 characters')
  })

  it('trims whitespace before validating', () => {
    expect(validateContact('  J  ', 'jane@example.com', 'Hello there, I have a project')).toBe('Name is required')
  })
})

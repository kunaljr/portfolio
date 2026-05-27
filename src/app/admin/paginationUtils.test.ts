import { describe, it, expect } from 'vitest'
import { parsePage, buildPaginationPages } from './paginationUtils'

describe('parsePage', () => {
  it('returns 1 for undefined', () => expect(parsePage(undefined)).toBe(1))
  it('returns 1 for empty string', () => expect(parsePage('')).toBe(1))
  it('returns 1 for non-numeric string', () => expect(parsePage('abc')).toBe(1))
  it('returns 1 for negative numbers', () => expect(parsePage('-3')).toBe(1))
  it('returns 1 for zero', () => expect(parsePage('0')).toBe(1))
  it('returns parsed number for valid string', () => expect(parsePage('5')).toBe(5))
  it('uses first element when value is an array', () => expect(parsePage(['3', '9'])).toBe(3))
})

describe('buildPaginationPages', () => {
  it('returns all pages when total <= 7', () => {
    expect(buildPaginationPages(1, 5)).toEqual([1, 2, 3, 4, 5])
    expect(buildPaginationPages(3, 7)).toEqual([1, 2, 3, 4, 5, 6, 7])
  })

  it('returns empty array for 0 total pages', () => {
    expect(buildPaginationPages(1, 0)).toEqual([])
  })

  it('truncates end when on page 1 of many', () => {
    expect(buildPaginationPages(1, 10)).toEqual([1, 2, '...', 10])
  })

  it('truncates both sides when in middle', () => {
    expect(buildPaginationPages(5, 10)).toEqual([1, '...', 4, 5, 6, '...', 10])
  })

  it('truncates start when on last page', () => {
    expect(buildPaginationPages(10, 10)).toEqual([1, '...', 9, 10])
  })

  it('no start gap when current is adjacent to first', () => {
    expect(buildPaginationPages(2, 10)).toEqual([1, 2, 3, '...', 10])
  })

  it('no end gap when current is adjacent to last', () => {
    expect(buildPaginationPages(9, 10)).toEqual([1, '...', 8, 9, 10])
  })

  it('clamps out-of-range current to last page', () => {
    expect(buildPaginationPages(15, 10)).toEqual([1, '...', 9, 10])
  })
})

export function parsePage(value: string | string[] | undefined): number {
  const str = Array.isArray(value) ? value[0] : value
  const n = parseInt(str ?? '', 10)
  return isNaN(n) || n < 1 ? 1 : n
}

export function buildPaginationPages(
  current: number,
  total: number,
): Array<number | '...'> {
  if (total <= 0) return []
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)

  current = Math.min(Math.max(1, current), total)

  const pages: Array<number | '...'> = []

  pages.push(1)

  if (current - 1 > 2) pages.push('...')

  const start = Math.max(2, current - 1)
  const end = Math.min(total - 1, current + 1)
  for (let i = start; i <= end; i++) pages.push(i)

  if (current + 1 < total - 1) pages.push('...')

  pages.push(total)

  return pages
}

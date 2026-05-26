import { createHash, timingSafeEqual } from 'crypto'

export function getSessionToken(): string {
  const password = process.env.ADMIN_PASSWORD
  if (!password) throw new Error('ADMIN_PASSWORD environment variable is not set')
  return createHash('sha256').update(password).digest('hex')
}

export function isValidSession(cookieValue: string | undefined): boolean {
  if (!cookieValue) return false
  try {
    const token = getSessionToken()
    return timingSafeEqual(Buffer.from(cookieValue), Buffer.from(token))
  } catch {
    return false
  }
}

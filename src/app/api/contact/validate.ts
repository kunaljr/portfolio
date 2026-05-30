export function validateContact(name: string, email: string, message: string): string | null {
  if (name.trim().length < 2) return 'Name is required'
  if (name.trim().length > 100) return 'Name is too long'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return 'A valid email address is required'
  if (email.trim().length > 254) return 'Email is too long'
  if (message.trim().length < 10) return 'Message must be at least 10 characters'
  if (message.trim().length > 5000) return 'Message must be under 5000 characters'
  return null
}

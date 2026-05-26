export function validateContact(name: string, email: string, message: string): string | null {
  if (name.trim().length < 2) return 'Name is required'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return 'A valid email address is required'
  if (message.trim().length < 10) return 'Message must be at least 10 characters'
  return null
}

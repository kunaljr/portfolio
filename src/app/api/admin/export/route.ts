import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'
import { isValidSession } from '@/app/admin/session'

export async function GET() {
  const cookieStore = await cookies()
  if (!isValidSession(cookieStore.get('admin_session')?.value)) {
    return new Response('Unauthorized', { status: 401 })
  }

  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !supabaseKey) {
    return new Response('Server error', { status: 500 })
  }

  const supabase = createClient(supabaseUrl, supabaseKey)
  const { data, error } = await supabase
    .from('contact_submissions')
    .select('id, name, email, message, created_at, is_read')
    .order('created_at', { ascending: false })

  if (error || !data) {
    return new Response('Failed to fetch data', { status: 500 })
  }

  function csvCell(v: unknown): string {
    let s = String(v ?? '')
    if (/^[=+\-@\t\r]/.test(s)) s = "'" + s
    return '"' + s.replace(/"/g, '""') + '"'
  }

  const header = 'id,name,email,message,created_at,is_read\n'
  const rows = data.map(r => [
    csvCell(r.id),
    csvCell(r.name),
    csvCell(r.email),
    csvCell(r.message),
    csvCell(r.created_at),
    csvCell(r.is_read ?? false),
  ].join(',')).join('\n')

  return new Response(header + rows, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename="messages.csv"',
    },
  })
}

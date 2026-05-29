import { createClient } from '@supabase/supabase-js'
import { validateContact } from './validate'

export async function POST(request: Request) {
  let body: { name?: unknown; email?: unknown; message?: unknown; website?: unknown }
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  if (typeof body.website === 'string' && body.website.length > 0) {
    return Response.json({ error: 'Invalid request.' }, { status: 400 })
  }

  const { name, email, message } = body

  const validationError = validateContact(
    typeof name === 'string' ? name : '',
    typeof email === 'string' ? email : '',
    typeof message === 'string' ? message : ''
  )
  if (validationError) {
    return Response.json({ error: validationError }, { status: 400 })
  }

  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !supabaseKey) {
    return Response.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }

  const supabase = createClient(supabaseUrl, supabaseKey)

  const ip =
    request.headers.get('x-vercel-forwarded-for') ??
    request.headers.get('x-forwarded-for')?.split(',').at(-1)?.trim() ??
    'unknown'

  const { data: rpcData, error: rpcError } = await supabase.rpc('submit_contact', {
    p_name: (name as string).trim(),
    p_email: (email as string).trim(),
    p_message: (message as string).trim(),
    p_ip: ip,
  })

  if (rpcError) {
    return Response.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }

  if (!rpcData || typeof rpcData.ok !== 'boolean') {
    return Response.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }

  if (!rpcData.ok) {
    return Response.json({ error: 'Too many messages. Please try again tomorrow.' }, { status: 429 })
  }

  return Response.json({ ok: true })
}

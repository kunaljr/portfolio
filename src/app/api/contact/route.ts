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

  if (ip !== 'unknown') {
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    const { data, error: rateError } = await supabase
      .from('contact_submissions')
      .select('id')
      .eq('ip', ip)
      .gte('created_at', cutoff)

    if (rateError) {
      return Response.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
    }

    if ((data?.length ?? 0) >= 5) {
      return Response.json(
        { error: 'Too many messages. Please try again tomorrow.' },
        { status: 429 }
      )
    }
  }

  const { error: dbError } = await supabase
    .from('contact_submissions')
    .insert({
      name: (name as string).trim(),
      email: (email as string).trim(),
      message: (message as string).trim(),
      ip,
    })

  if (dbError) {
    return Response.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }

  return Response.json({ ok: true })
}

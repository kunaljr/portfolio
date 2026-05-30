import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { validateContact } from './validate'

function parseUA(ua: string) {
  const os =
    /Windows/i.test(ua) ? 'Windows' :
    /Mac OS X/i.test(ua) ? 'macOS' :
    /Android/i.test(ua) ? 'Android' :
    /iPhone|iPad/i.test(ua) ? 'iOS' :
    /Linux/i.test(ua) ? 'Linux' : 'Unknown'

  const browser =
    /Edg\//i.test(ua) ? 'Edge' :
    /Chrome/i.test(ua) ? 'Chrome' :
    /Firefox/i.test(ua) ? 'Firefox' :
    /Safari/i.test(ua) ? 'Safari' : 'Unknown'

  const device = /Mobile|Android|iPhone|iPad/i.test(ua) ? 'Mobile' : 'Desktop'

  return { os, browser, device }
}

async function getGeo(ip: string): Promise<{ country?: string; city?: string }> {
  if (!ip || ip === 'unknown' || ip === '127.0.0.1' || ip.startsWith('::')) return {}
  try {
    const controller = new AbortController()
    const t = setTimeout(() => controller.abort(), 3000)
    const res = await fetch(`https://ipinfo.io/${ip}/json`, { signal: controller.signal })
    clearTimeout(t)
    if (!res.ok) return {}
    const data = await res.json()
    return { country: data.country, city: data.city }
  } catch {
    return {}
  }
}

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
    request.headers.get('x-vercel-forwarded-for')?.split(',').at(0)?.trim() ??
    request.headers.get('x-forwarded-for')?.split(',').at(-1)?.trim() ??
    'unknown'

  const ua = request.headers.get('user-agent') ?? ''
  const lang = request.headers.get('accept-language')?.split(',')[0] ?? null
  const { os, browser, device } = parseUA(ua)
  const { country, city } = await getGeo(ip)

  const { data: rpcData, error: rpcError } = await supabase.rpc('submit_contact', {
    p_name: (name as string).trim(),
    p_email: (email as string).trim(),
    p_message: (message as string).trim(),
    p_ip: ip,
    p_browser: browser,
    p_os: os,
    p_device: device,
    p_country: country ?? null,
    p_city: city ?? null,
    p_lang: lang,
  })

  if (rpcError) {
    return Response.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }

  if (!rpcData || typeof rpcData.ok !== 'boolean') {
    return Response.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }

  if (!rpcData.ok) {
    return Response.json(
      { error: 'Too many messages. Please try again tomorrow.' },
      { status: 429, headers: { 'Retry-After': '86400' } }
    )
  }

  const resendKey = process.env.RESEND_API_KEY
  if (resendKey) {
    const { count: todayCount } = await supabase
      .from('contact_submissions')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', new Date(new Date().setHours(0, 0, 0, 0)).toISOString())

    if ((todayCount ?? 0) <= 50) {
      const resend = new Resend(resendKey)
      const n = (name as string).trim().replace(/[\r\n]/g, ' ')
      const e = (email as string).trim()
      const m = (message as string).trim()
      await resend.emails.send({
        from: 'kunalshelke.dev <onboarding@resend.dev>',
        to: 'kunalshelke123@gmail.com',
        subject: `New message from ${n}`,
        text: `Name: ${n}\nEmail: ${e}\n\nMessage:\n${m}\n\n---\n${device} · ${browser} · ${os}${city ? ` · ${city}` : ''}${country ? `, ${country}` : ''}${lang ? ` · ${lang}` : ''}`,
      })
    }
  }

  return Response.json({ ok: true })
}

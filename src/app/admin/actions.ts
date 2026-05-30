'use server'

import { timingSafeEqual } from 'crypto'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@supabase/supabase-js'
import { getSessionToken, isValidSession } from './session'

export async function login(formData: FormData) {
  const password = formData.get('password') as string
  const adminPassword = process.env.ADMIN_PASSWORD ?? ''

  const passwordBuffer = Buffer.from(password ?? '')
  const adminBuffer = Buffer.from(adminPassword)
  const match = passwordBuffer.length === adminBuffer.length &&
    timingSafeEqual(passwordBuffer, adminBuffer)

  if (!match) {
    redirect('/admin?error=1')
  }

  const cookieStore = await cookies()
  cookieStore.set('admin_session', getSessionToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 10,
    path: '/',
  })

  redirect('/admin')
}

export async function logout() {
  const cookieStore = await cookies()
  cookieStore.delete('admin_session')
  redirect('/admin')
}

async function getAuthenticatedSupabase() {
  const cookieStore = await cookies()
  if (!isValidSession(cookieStore.get('admin_session')?.value)) {
    redirect('/admin')
  }
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Missing Supabase env vars')
  return createClient(url, key)
}

export async function markAsRead(formData: FormData) {
  const supabase = await getAuthenticatedSupabase()
  const id = formData.get('id') as string
  await supabase.from('contact_submissions').update({ is_read: true }).eq('id', id)
  revalidatePath('/admin')
}

export async function deleteSubmission(formData: FormData) {
  const supabase = await getAuthenticatedSupabase()
  const id = formData.get('id') as string
  await supabase.from('contact_submissions').delete().eq('id', id)
  revalidatePath('/admin')
}

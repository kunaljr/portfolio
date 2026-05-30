'use server'

import { timingSafeEqual } from 'crypto'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { getSessionToken } from './session'

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

'use client'
import { useEffect } from 'react'

export function AdminPageTitle({ unread }: { unread: number }) {
  useEffect(() => {
    document.title = unread > 0 ? `(${unread}) Messages | Admin` : 'Messages | Admin'
    return () => {
      document.title = 'Kunal Shelke — Senior Full Stack Engineer · React & Node.js'
    }
  }, [unread])
  return null
}

'use client'
import { ReactNode } from 'react'

export function PageTransition({ children }: { children: ReactNode }) {
  return <div style={{ display: 'contents' }}>{children}</div>
}

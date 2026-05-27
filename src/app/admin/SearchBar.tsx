'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

interface SearchBarProps {
  initialValue: string
}

export function SearchBar({ initialValue }: SearchBarProps) {
  const router = useRouter()
  const [value, setValue] = useState(initialValue)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const next = e.target.value
    setValue(next)
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      const params = new URLSearchParams()
      if (next.trim()) params.set('q', next.trim())
      const search = params.toString()
      router.push(search ? `/admin?${search}` : '/admin')
    }, 300)
  }

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  return (
    <input
      type="search"
      value={value}
      onChange={handleChange}
      placeholder="Search messages…"
      style={{
        padding: '0.6rem 0.75rem',
        border: '0.5px solid var(--bdr)',
        borderRadius: 'var(--r2)',
        background: 'var(--bg)',
        color: 'var(--tx)',
        fontFamily: 'var(--fb)',
        fontSize: '0.9rem',
        outline: 'none',
        width: '100%',
        boxSizing: 'border-box' as const,
      }}
    />
  )
}

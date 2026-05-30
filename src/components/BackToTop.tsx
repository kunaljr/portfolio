'use client'
import { useState, useEffect } from 'react'
import { IconArrowUp } from '@tabler/icons-react'

export function BackToTop() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    function onScroll() {
      setVisible(window.scrollY > 400)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  if (!visible) return null

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="back-top"
      aria-label="Back to top"
    >
      <IconArrowUp size={16} aria-hidden />
    </button>
  )
}

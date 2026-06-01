'use client'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'

interface Props {
  target: number
  suffix?: string
  prefix?: string
  duration?: number
}

export function StatCounter({ target, suffix = '', prefix = '', duration = 1400 }: Props) {
  const ref = useRef<HTMLSpanElement>(null)
  const [inView, setInView] = useState(false)
  const [count, setCount] = useState(0)
  const inViewRef = useRef(false)
  inViewRef.current = inView

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const { top, height } = el.getBoundingClientRect()
    if (height > 0 && top < window.innerHeight) setInView(true)
  }, [])

  useEffect(() => {
    if (inView) return
    const el = ref.current
    if (!el) return

    const { top, height } = el.getBoundingClientRect()
    if (height > 0 && top < window.innerHeight) {
      setInView(true)
      return
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setInView(true)
        observer.disconnect()
      }
    }, { threshold: 0.08 })
    observer.observe(el)
    return () => observer.disconnect()
  }, [inView])

  // bfcache restore: re-trigger detection when browser restores page from cache.
  useEffect(() => {
    let bfObserver: IntersectionObserver | null = null

    function onPageShow(e: PageTransitionEvent) {
      if (!e.persisted) return
      const el = ref.current
      if (!el) return
      const { top, height } = el.getBoundingClientRect()
      if (height > 0 && top < window.innerHeight) {
        setInView(true)
        return
      }
      if (!inViewRef.current) {
        bfObserver = new IntersectionObserver(([entry]) => {
          if (entry.isIntersecting) {
            setInView(true)
            bfObserver?.disconnect()
            bfObserver = null
          }
        }, { threshold: 0.08 })
        bfObserver.observe(el)
      }
    }

    window.addEventListener('pageshow', onPageShow)
    return () => {
      window.removeEventListener('pageshow', onPageShow)
      bfObserver?.disconnect()
    }
  }, [])

  useEffect(() => {
    if (!inView) return
    let startTime: number | null = null
    let rafId: number

    function step(timestamp: number) {
      if (startTime === null) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.round(eased * target))
      if (progress < 1) rafId = requestAnimationFrame(step)
    }

    rafId = requestAnimationFrame(step)
    return () => cancelAnimationFrame(rafId)
  }, [inView, target, duration])

  return <span ref={ref}>{prefix}{count}{suffix}</span>
}

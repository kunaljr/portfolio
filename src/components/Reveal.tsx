'use client'
import { motion, Variants } from 'framer-motion'
import { useRef, useState, useEffect, useLayoutEffect, ReactNode, CSSProperties } from 'react'

const item: Variants = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
}

const group: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
}

interface Props {
  children: ReactNode
  className?: string
  style?: CSSProperties
}

function isAboveFold(el: Element) {
  const { top, height } = el.getBoundingClientRect()
  // `top < innerHeight` handles: in-viewport AND above-viewport (scrolled past on back-nav).
  return height > 0 && top < window.innerHeight
}

function useRevealInView(ref: React.RefObject<HTMLDivElement | null>) {
  const [inView, setInView] = useState(false)
  // Ref tracks current inView so effects with deps=[] can read it without stale closure.
  const inViewRef = useRef(false)
  inViewRef.current = inView

  // Synchronous check before first paint — prevents blank-frame flash for above-fold elements.
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    if (isAboveFold(el)) setInView(true)
  }, [])

  // Post-paint fallback. `[]` re-runs on React Activity re-activation (Next.js 16).
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const el = ref.current
    if (!el) return

    if (isAboveFold(el)) {
      setInView(true)
      return
    }

    // Use inViewRef (not stale closure) to skip IO setup when already revealed.
    if (inViewRef.current) return

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setInView(true)
        observer.disconnect()
      }
    }, { threshold: 0.08 })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  // bfcache restore: React effects do NOT re-run after bfcache restore, so we
  // need this listener to recover both above-fold and below-fold elements.
  useEffect(() => {
    let bfObserver: IntersectionObserver | null = null

    function onPageShow(e: PageTransitionEvent) {
      if (!e.persisted) return
      const el = ref.current
      if (!el) return

      if (isAboveFold(el)) {
        setInView(true)
        return
      }

      // Re-attach IO for below-fold elements that were frozen before entering view.
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

  return inView
}

export default function Reveal({ children, className = '', style }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useRevealInView(ref)
  return (
    // `initial={false}` prevents framer-motion from re-applying hidden styles when
    // React Activity re-activates this component after back navigation.
    <motion.div ref={ref} className={className} style={style}
      variants={item} initial={false} animate={inView ? 'visible' : 'hidden'}
    >
      {children}
    </motion.div>
  )
}

export function RevealGroup({ children, className = '', style }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useRevealInView(ref)
  return (
    <motion.div ref={ref} className={className} style={style}
      variants={group} initial={false} animate={inView ? 'visible' : 'hidden'}
    >
      {children}
    </motion.div>
  )
}

export function RevealItem({ children, className = '', style }: Props) {
  return (
    <motion.div className={className} style={style} variants={item}>
      {children}
    </motion.div>
  )
}

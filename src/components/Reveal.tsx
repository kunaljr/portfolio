'use client'
import { motion, useInView, Variants } from 'framer-motion'
import { useRef, ReactNode, CSSProperties } from 'react'

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

// Standalone — own useInView trigger, for headings / hero / one-off elements
export default function Reveal({ children, className = '', style }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.08 })
  return (
    <motion.div
      ref={ref}
      className={className}
      style={style}
      variants={item}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
    >
      {children}
    </motion.div>
  )
}

// Stagger container — triggers and orchestrates children at 0.08s intervals
export function RevealGroup({ children, className = '', style }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.08 })
  return (
    <motion.div
      ref={ref}
      className={className}
      style={style}
      variants={group}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
    >
      {children}
    </motion.div>
  )
}

// Stagger child — no own trigger; animated by the nearest RevealGroup parent
export function RevealItem({ children, className = '', style }: Props) {
  return (
    <motion.div className={className} style={style} variants={item}>
      {children}
    </motion.div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  IconMail,
  IconBrandLinkedin,
  IconBrandGithub,
  IconMapPin,
  IconArrowRight,
  IconSend,
} from '@tabler/icons-react'
import Reveal, { RevealGroup, RevealItem } from './Reveal'

interface FormErrors {
  name?: string
  email?: string
  message?: string
}

function Toast({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 4000)
    return () => clearTimeout(t)
  }, [onDone])

  return (
    <motion.div
      className="toast"
      initial={{ x: 60, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 60, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 320, damping: 28 }}
    >
      <IconMail size={16} style={{ color: 'var(--acc)', flexShrink: 0, marginTop: 1 }} aria-hidden />
      <span className="toast-msg">Message sent — I&apos;ll get back to you soon.</span>
    </motion.div>
  )
}

function validate(name: string, email: string, message: string): FormErrors {
  const errors: FormErrors = {}
  if (name.trim().length < 2) errors.name = 'Name is required'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) errors.email = 'A valid email address is required'
  if (message.trim().length < 10) errors.message = 'Message must be at least 10 characters'
  return errors
}

export default function Contact() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [showToast, setShowToast] = useState(false)

  async function handleSubmit() {
    const errs = validate(name, email, message)
    setErrors(errs)
    if (Object.keys(errs).length > 0) return

    setSubmitting(true)
    setFormError(null)

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message }),
      })

      if (res.ok) {
        setName('')
        setEmail('')
        setMessage('')
        setShowToast(true)
      } else {
        setFormError('Something went wrong. Please try again.')
      }
    } catch {
      setFormError('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="w">
      <div className="sec" id="contact">
        <Reveal>
          <div className="stag">Contact</div>
          <h2>Let&apos;s work together.</h2>
        </Reveal>
        <RevealGroup className="cgrid">
          <RevealItem>
            <p className="c-intro">
              I&apos;m currently open to Senior Engineer roles in Mumbai, Pune, or
              Bangalore. If you&apos;re building something ambitious and need a
              full-stack engineer who ships with precision — let&apos;s talk.
            </p>
            <div className="clinks">
              <a href="mailto:Kunalshelke123@gmail.com" className="clink">
                <div className="clink-ico"><IconMail size={14} aria-hidden /></div>
                <div className="clink-body">
                  <span className="clink-lbl">Email</span>
                  <span className="clink-val">Kunalshelke123@gmail.com</span>
                </div>
                <IconArrowRight
                  size={14}
                  aria-hidden
                  style={{ color: 'var(--tx3)', marginLeft: 'auto', flexShrink: 0 }}
                />
              </a>
              <a
                href="https://www.linkedin.com/in/kunal-shelke-47a5841a2/"
                target="_blank"
                rel="noopener noreferrer"
                className="clink"
              >
                <div className="clink-ico"><IconBrandLinkedin size={14} aria-hidden /></div>
                <div className="clink-body">
                  <span className="clink-lbl">LinkedIn</span>
                  <span className="clink-val">kunal-shelke-47a5841a2</span>
                </div>
                <IconArrowRight
                  size={14}
                  aria-hidden
                  style={{ color: 'var(--tx3)', marginLeft: 'auto', flexShrink: 0 }}
                />
              </a>
              <a
                href="https://github.com/kunaljr"
                target="_blank"
                rel="noopener noreferrer"
                className="clink"
              >
                <div className="clink-ico"><IconBrandGithub size={14} aria-hidden /></div>
                <div className="clink-body">
                  <span className="clink-lbl">GitHub</span>
                  <span className="clink-val">github.com/kunaljr</span>
                </div>
                <IconArrowRight
                  size={14}
                  aria-hidden
                  style={{ color: 'var(--tx3)', marginLeft: 'auto', flexShrink: 0 }}
                />
              </a>
              <div className="clink" style={{ cursor: 'default' }}>
                <div className="clink-ico"><IconMapPin size={14} aria-hidden /></div>
                <div className="clink-body">
                  <span className="clink-lbl">Location</span>
                  <span className="clink-val">Mumbai · Pune · Bangalore</span>
                </div>
              </div>
            </div>
          </RevealItem>

          <RevealItem>
            <div className="cform-wrap">
              <div className="cform-accent" />
              <div className="cform">
                <div className="fg">
                  <label htmlFor="f-name">Your name</label>
                  <input
                    id="f-name"
                    type="text"
                    placeholder="Jane Smith"
                    autoComplete="name"
                    value={name}
                    onChange={e => { setName(e.target.value); setErrors(p => ({ ...p, name: undefined })) }}
                    className={errors.name ? 'err' : ''}
                  />
                  {errors.name && <span className="ferr">{errors.name}</span>}
                </div>
                <div className="fg">
                  <label htmlFor="f-email">Email address</label>
                  <input
                    id="f-email"
                    type="email"
                    placeholder="jane@company.com"
                    autoComplete="email"
                    value={email}
                    onChange={e => { setEmail(e.target.value); setErrors(p => ({ ...p, email: undefined })) }}
                    className={errors.email ? 'err' : ''}
                  />
                  {errors.email && <span className="ferr">{errors.email}</span>}
                </div>
                <div className="fg">
                  <label htmlFor="f-msg">Message</label>
                  <textarea
                    id="f-msg"
                    placeholder="Tell me about the role or project…"
                    value={message}
                    onChange={e => { setMessage(e.target.value); setErrors(p => ({ ...p, message: undefined })) }}
                    className={errors.message ? 'err' : ''}
                  />
                  {errors.message && <span className="ferr">{errors.message}</span>}
                </div>
                {formError && <span className="ferr">{formError}</span>}
                <button type="button" className="fsub" onClick={handleSubmit} disabled={submitting}>
                  <IconSend size={15} aria-hidden />
                  {submitting ? 'Sending…' : 'Send Message'}
                </button>
              </div>
            </div>
          </RevealItem>
        </RevealGroup>
      </div>

      <AnimatePresence>
        {showToast && <Toast onDone={() => setShowToast(false)} />}
      </AnimatePresence>
    </div>
  )
}

'use client'
import { useState, useEffect } from 'react'
import { IconMail, IconMenu2, IconX } from '@tabler/icons-react'
import { ThemeToggle } from './ThemeToggle'

const SECTIONS = ['about', 'exp', 'proj', 'skills', 'testimonials', 'contact']

export default function Nav() {
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState('')

  const close = () => setOpen(false)

  useEffect(() => {
    function onScroll() {
      const navH = 70
      let current = ''
      for (const id of SECTIONS) {
        const el = document.getElementById(id)
        if (el && el.getBoundingClientRect().top <= navH) {
          current = id
        }
      }
      setActive(current)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className="nav-wrap">
      <nav>
        <a href="#" className="logo">
          KS<span>.</span>
        </a>
        <div className="nav-r">
          <ul className="nav-links">
            <li><a href="#about" className={active === 'about' ? 'active' : ''}>About</a></li>
            <li><a href="#exp" className={active === 'exp' ? 'active' : ''}>Experience</a></li>
            <li><a href="#proj" className={active === 'proj' ? 'active' : ''}>Projects</a></li>
            <li><a href="#skills" className={active === 'skills' ? 'active' : ''}>Skills</a></li>
            <li><a href="#contact" className={active === 'contact' ? 'active' : ''}>Contact</a></li>
          </ul>
          <ThemeToggle />
          <a href="mailto:Kunalshelke123@gmail.com" className="nav-btn">
            <IconMail size={14} aria-hidden />
            Hire me
          </a>
          <button
            className="hbtn"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            onClick={() => setOpen(o => !o)}
          >
            {open ? <IconX size={18} /> : <IconMenu2 size={18} />}
          </button>
        </div>
      </nav>

      <div
        className={`mob-menu${open ? ' open' : ''}`}
        role="navigation"
        aria-label="Mobile navigation"
      >
        <a href="#about" onClick={close}>About</a>
        <a href="#exp" onClick={close}>Experience</a>
        <a href="#proj" onClick={close}>Projects</a>
        <a href="#skills" onClick={close}>Skills</a>
        <a href="#contact" onClick={close}>Contact</a>
        <a href="mailto:Kunalshelke123@gmail.com" onClick={close}>Hire me</a>
      </div>
    </div>
  )
}

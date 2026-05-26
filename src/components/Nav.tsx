'use client'
import { useState } from 'react'
import { IconMail, IconMenu2, IconX } from '@tabler/icons-react'

export default function Nav() {
  const [open, setOpen] = useState(false)

  const close = () => setOpen(false)

  return (
    <>
      <nav>
        <a href="#" className="logo">
          KS<span>.</span>
        </a>
        <div className="nav-r">
          <ul className="nav-links">
            <li><a href="#about">About</a></li>
            <li><a href="#exp">Experience</a></li>
            <li><a href="#proj">Projects</a></li>
            <li><a href="#skills">Skills</a></li>
            <li><a href="#contact">Contact</a></li>
          </ul>
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
    </>
  )
}

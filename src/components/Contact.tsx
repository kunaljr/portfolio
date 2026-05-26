import {
  IconMail,
  IconBrandLinkedin,
  IconBrandGithub,
  IconMapPin,
  IconArrowRight,
  IconSend,
} from '@tabler/icons-react'
import Reveal, { RevealGroup, RevealItem } from './Reveal'

export default function Contact() {
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
                  />
                </div>
                <div className="fg">
                  <label htmlFor="f-email">Email address</label>
                  <input
                    id="f-email"
                    type="email"
                    placeholder="jane@company.com"
                    autoComplete="email"
                  />
                </div>
                <div className="fg">
                  <label htmlFor="f-msg">Message</label>
                  <textarea
                    id="f-msg"
                    placeholder="Tell me about the role or project…"
                  />
                </div>
                <button type="button" className="fsub">
                  <IconSend size={15} aria-hidden />
                  Send Message
                </button>
              </div>
            </div>
          </RevealItem>
        </RevealGroup>
      </div>
    </div>
  )
}

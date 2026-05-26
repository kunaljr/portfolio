import {
  IconMapPin,
  IconMail,
  IconSchool,
  IconLanguage,
  IconBrandGithub,
  IconBrandLinkedin,
} from '@tabler/icons-react'
import Reveal, { RevealGroup, RevealItem } from './Reveal'

export default function About() {
  return (
    <div className="w">
      <div className="sec" id="about">
        <Reveal>
          <div className="stag">About me</div>
          <h2>
            Engineer by craft,<br />
            problem solver by nature.
          </h2>
        </Reveal>
        <RevealGroup className="about-g">
          <RevealItem>
            <p className="ap">
              I&apos;m a <strong>Senior Full Stack Engineer</strong> with 5 years
              building production-grade SaaS. I specialise in React, Node.js
              (NestJS / Express), and cloud platforms including GCP and AWS.
            </p>
            <p className="ap">
              My work spans{' '}
              <strong>fintech, smart pool management (IoT), and OTT platforms</strong>
              {' '}— each demanding a different approach to architecture and
              performance. I deliver measurable outcomes: 40%+ performance
              improvements and zero-miss sprint delivery.
            </p>
            <p className="ap">
              Beyond engineering, I enjoy <strong>mentoring developers</strong>,
              leading technical client conversations, and contributing to system
              design decisions that define the product long-term.
            </p>
            <div className="chips">
              <span className="chip">Microservices</span>
              <span className="chip">GraphQL</span>
              <span className="chip">System Design</span>
              <span className="chip">Agile / Scrum</span>
              <span className="chip">Technical Leadership</span>
              <span className="chip">Client-Facing</span>
            </div>
          </RevealItem>

          <RevealItem className="acard">
            <div className="acard-top">
              <div className="av">KS</div>
              <div>
                <div className="aname">Kunal Shelke</div>
                <div className="arole">Senior Full Stack Engineer</div>
              </div>
            </div>
            <div className="acard-body">
              <div className="arow">
                <span className="arow-icon"><IconMapPin size={14} aria-hidden /></span>
                <span>Mumbai · Pune · Bangalore</span>
              </div>
              <div className="arow">
                <span className="arow-icon"><IconMail size={14} aria-hidden /></span>
                <span>Kunalshelke123@gmail.com</span>
              </div>
              <div className="arow">
                <span className="arow-icon"><IconSchool size={14} aria-hidden /></span>
                <span>B.Sc. CS — Mumbai Univ. 2021 · GPA 8.4</span>
              </div>
              <div className="arow">
                <span className="arow-icon"><IconLanguage size={14} aria-hidden /></span>
                <span>English · Hindi · Marathi · Spanish</span>
              </div>
            </div>
            <div className="acard-links">
              <a
                href="https://github.com/kunaljr"
                target="_blank"
                rel="noopener noreferrer"
                className="alink"
              >
                <IconBrandGithub size={14} aria-hidden />
                GitHub
              </a>
              <a
                href="https://www.linkedin.com/in/kunal-shelke-47a5841a2/"
                target="_blank"
                rel="noopener noreferrer"
                className="alink"
              >
                <IconBrandLinkedin size={14} aria-hidden />
                LinkedIn
              </a>
            </div>
          </RevealItem>
        </RevealGroup>
      </div>
    </div>
  )
}

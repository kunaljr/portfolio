import { IconLayoutGrid, IconMail, IconDownload } from '@tabler/icons-react'
import Reveal from './Reveal'

export default function Hero() {
  return (
    <Reveal className="hero">
      <div className="badge">
        <span className="bdot" />
        Open to Senior Roles · Mumbai / Pune / Bangalore
      </div>
      <h1>
        Hi, I&apos;m Kunal Shelke.<br />
        <em>Full Stack Engineer</em><br />
        who ships at scale.
      </h1>
      <p className="hero-sub">
        5 years building production-grade SaaS with React, Node.js, and cloud
        platforms — across fintech, IoT, and OTT domains.
      </p>
      <div className="btns">
        <a href="#proj" className="btn-p">
          <IconLayoutGrid size={15} aria-hidden />
          View Projects
        </a>
        <a href="#contact" className="btn-o">
          <IconMail size={15} aria-hidden />
          Get in touch
        </a>
        <a href="/Kunal-shelke-software-engineer.docx" download className="btn-o">
          <IconDownload size={15} aria-hidden />
          Resume
        </a>
      </div>
      <div className="stats">
        <div className="stat">
          <div className="snum">5+</div>
          <div className="slbl">Years exp</div>
        </div>
        <div className="stat">
          <div className="snum">40%</div>
          <div className="slbl">Perf. gains</div>
        </div>
        <div className="stat">
          <div className="snum">100%</div>
          <div className="slbl">On-time delivery</div>
        </div>
        <div className="stat">
          <div className="snum">3</div>
          <div className="slbl">Domains shipped</div>
        </div>
      </div>
    </Reveal>
  )
}

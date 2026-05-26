import Reveal, { RevealGroup, RevealItem } from './Reveal'

const entries = [
  {
    role: 'Senior Software Engineer',
    date: 'May 2026 – Present',
    company: 'Eccentric, Mumbai',
    project: 'EchoAI - For automotive',
    tags: ['React.js', 'NodeJS (NestJS, AdonisJS, ExpressJS)', 'PostgreSQL', 'Reddis', 'EventStream', 'GCP', 'BullMQ', 'ComfyAI'],
    bullets: [
      { text: 'Built high-performance frontend architectures with React (Redux)' },
      { text: 'Owned Image Generation Feature - ', hl: 'reduced delivery turnaround by 20%.' },
    ],
  },
  {
    role: 'Senior Software Engineer',
    date: 'Aug 2025 – Feb 2026',
    company: 'Sia-Partners, Mumbai',
    project: 'Stratumn – Enterprise Workflow Management Application',
    tags: ['React.js', 'Vue.js', 'NestJS', 'GraphQL', 'PostgreSQL', 'AWS', 'RabbitMQ'],
    bullets: [
      { text: 'Built high-performance frontend architectures with React (Redux) and Vue 3 (Pinia).' },
      { text: 'Owned Mastercom Extended API integration end-to-end — ', hl: 'reduced delivery turnaround by 20%.' },
      { text: 'Delivered 3 client feature enhancements across sprint cycles — ', hl: '100% on-time delivery record.' },
      { text: 'Mentored 2 junior developers on NestJS patterns — ', hl: 'reduced PR review cycles by 30%.' },
    ],
  },
  {
    role: 'Senior Software Engineer',
    date: 'Sep 2022 – Jun 2025',
    company: 'Pegasus Infocorp, Mumbai',
    project: 'Liqua – Cloud-Native SaaS for Smart Pool Management',
    tags: ['Vue 3', 'React.js', 'NestJS', 'tRPC', 'GCP', 'Firestore', 'TypeScript'],
    bullets: [
      { text: 'Engineered reusable UI components — ', hl: '40% improvement in front-end performance.' },
      { text: 'Orchestrated RESTful microservices with Firestore for IoT telemetry and financial data.' },
      { text: 'Integrated Xero, MYOB, LIGHTSPEED, SendGrid, and Twilio — reducing reconciliation effort.' },
      { text: 'Led migration of legacy SQL datasets to Firestore via Google Cloud Run functions.' },
    ],
  },
  {
    role: 'Full Stack Developer',
    date: 'Apr 2021 – Aug 2022',
    company: 'Playbulous, Mumbai',
    project: 'Enterprise OTT SaaS Platform for EdTech & Entertainment',
    tags: ['React.js', 'Node.js', 'MongoDB', 'PostgreSQL', 'AWS S3/EC2', 'Elasticsearch', 'Kafka'],
    bullets: [
      { text: 'Architected a multi-tenant OTT SaaS with adaptive video streaming and subscription billing.' },
      { text: 'Designed secure billing infrastructure integrated with payment gateways, backed by MongoDB.' },
      { text: 'Deployed AWS S3 for media storage, EC2 for backend, Elasticsearch for content discovery.' },
    ],
  },
]

export default function Experience() {
  return (
    <div className="alt-bg" id="exp">
      <div className="w">
        <div className="sec">
          <Reveal>
            <div className="stag">Work Experience</div>
            <h2>Where I&apos;ve built things.</h2>
          </Reveal>
          <RevealGroup className="tl">
            {entries.map((e, i) => (
              <RevealItem key={i} className="tl-item">
                <div className="td" />
                <div className="tc">
                  <div className="tc-head">
                    <div className="tc-role">{e.role}</div>
                    <div className="tc-date">{e.date}</div>
                  </div>
                  <div className="tc-co">{e.company}</div>
                  <div className="tc-proj">{e.project}</div>
                  <div className="tags">
                    {e.tags.map(t => <span key={t} className="tag">{t}</span>)}
                  </div>
                  <ul className="bul">
                    {e.bullets.map((b, j) => (
                      <li key={j}>
                        {b.text}
                        {b.hl && <b>{b.hl}</b>}
                      </li>
                    ))}
                  </ul>
                </div>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </div>
    </div>
  )
}

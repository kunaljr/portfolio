import { IconBolt, IconDroplet, IconDeviceTv, IconCar, IconArrowRight } from '@tabler/icons-react'
import Reveal, { RevealGroup, RevealItem } from './Reveal'
import Link from 'next/link'
import { ReactNode } from 'react'
import { projects as caseStudies } from '@/lib/projects'

// CaseSlug is derived from lib/projects.ts — TypeScript will error here if a slug drifts.
type CaseSlug = (typeof caseStudies)[number]['slug']

const projects: { slug: CaseSlug; icon: ReactNode; name: string; client: string; desc: string; tags: string[] }[] = [
  {
    slug: 'echoai',
    icon: <IconCar size={17} aria-hidden />,
    name: 'EchoAI',
    client: 'Eccentric · Automotive',
    desc: 'Specialized Generative AI tool designed for automotive marketers to create accurate, on-brand vehicle visuals for any background, color, or market in seconds',
    tags: ['GenAI', 'AI', 'React.js', 'NestJS', 'GCP'],
  },
  {
    slug: 'stratumn',
    icon: <IconBolt size={17} aria-hidden />,
    name: 'Stratumn',
    client: 'Sia-Partners · Workflow SaaS',
    desc: 'Enterprise workflow management for a global consulting firm. Microservices, GraphQL APIs, and secure client-facing integrations.',
    tags: ['React.js', 'NestJS', 'GraphQL', 'AWS'],
  },
  {
    slug: 'liqua',
    icon: <IconDroplet size={17} aria-hidden />,
    name: 'Liqua',
    client: 'Pegasus · IoT / Fintech',
    desc: 'Cloud-native SaaS managing IoT telemetry, memberships, and financial workflows. Integrated Xero, MYOB, LIGHTSPEED, and Twilio.',
    tags: ['Vue 3', 'tRPC', 'GCP', 'Firestore'],
  },
  {
    slug: 'ott',
    icon: <IconDeviceTv size={17} aria-hidden />,
    name: 'OTT Platform',
    client: 'Playbulous · EdTech / OTT',
    desc: 'Multi-tenant OTT platform with adaptive streaming, subscription billing, and cross-platform delivery for EdTech and entertainment.',
    tags: ['React.js', 'Kafka', 'AWS', 'Elasticsearch'],
  },
]

export default function Projects() {
  return (
    <div className="w">
      <div className="sec" id="proj">
        <Reveal>
          <div className="stag">Projects</div>
          <h2>Things I&apos;ve shipped.</h2>
        </Reveal>
        <RevealGroup className="pgrid">
          {projects.map(p => (
            <RevealItem key={p.name} className="pc">
              <div className="pc-icon">{p.icon}</div>
              <div className="pc-name">{p.name}</div>
              <div className="pc-client">{p.client}</div>
              <p className="pc-desc">{p.desc}</p>
              <div className="tags">
                {p.tags.map(t => <span key={t} className="tag">{t}</span>)}
              </div>
              <Link href={`/projects/${p.slug}`} className="pc-link">
                Case study <IconArrowRight size={12} aria-hidden />
              </Link>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </div>
  )
}

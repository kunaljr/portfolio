import { IconBolt, IconDroplet, IconDeviceTv } from '@tabler/icons-react'
import Reveal, { RevealGroup, RevealItem } from './Reveal'
import { ReactNode } from 'react'

const projects: { icon: ReactNode; name: string; client: string; desc: string; tags: string[] }[] = [
  {
    icon: <IconBolt size={17} aria-hidden />,
    name: 'Stratumn',
    client: 'Sia-Partners · Workflow SaaS',
    desc: 'Enterprise workflow management for a global consulting firm. Microservices, GraphQL APIs, and secure client-facing integrations.',
    tags: ['React.js', 'NestJS', 'GraphQL', 'AWS'],
  },
  {
    icon: <IconDroplet size={17} aria-hidden />,
    name: 'Liqua',
    client: 'Pegasus · IoT / Fintech',
    desc: 'Cloud-native SaaS managing IoT telemetry, memberships, and financial workflows. Integrated Xero, MYOB, LIGHTSPEED, and Twilio.',
    tags: ['Vue 3', 'tRPC', 'GCP', 'Firestore'],
  },
  {
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
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </div>
  )
}

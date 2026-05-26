import {
  IconLayout,
  IconServer,
  IconDatabase,
  IconCloud,
  IconAffiliate,
  IconBulb,
} from '@tabler/icons-react'
import Reveal, { RevealGroup, RevealItem } from './Reveal'
import { ReactNode } from 'react'

const groups: { icon: ReactNode; label: string; pills: string[] }[] = [
  {
    icon: <IconLayout size={14} aria-hidden />,
    label: 'Frontend',
    pills: ['React.js', 'Vue 3', 'Redux', 'Pinia', 'TypeScript', 'JavaScript', 'HTML5', 'CSS3'],
  },
  {
    icon: <IconServer size={14} aria-hidden />,
    label: 'Backend',
    pills: ['Node.js', 'NestJS', 'Express.js', 'GraphQL', 'tRPC', 'gRPC', 'REST APIs'],
  },
  {
    icon: <IconDatabase size={14} aria-hidden />,
    label: 'Databases',
    pills: ['PostgreSQL', 'MongoDB', 'Firebase Firestore'],
  },
  {
    icon: <IconCloud size={14} aria-hidden />,
    label: 'Cloud & DevOps',
    pills: ['AWS S3', 'AWS EC2', 'GCP Cloud Run', 'Docker', 'CI/CD', 'GitLab'],
  },
  {
    icon: <IconAffiliate size={14} aria-hidden />,
    label: 'Messaging & Testing',
    pills: ['RabbitMQ', 'Kafka', 'Jest', 'Supertest', 'RTL'],
  },
  {
    icon: <IconBulb size={14} aria-hidden />,
    label: 'Concepts & Tools',
    pills: ['Microservices', 'System Design', 'DSA', 'Agile', 'JIRA', 'Linear'],
  },
]

export default function Skills() {
  return (
    <div className="alt-bg" id="skills">
      <div className="w">
        <div className="sec">
          <Reveal>
            <div className="stag">Skills</div>
            <h2>The full stack of it.</h2>
          </Reveal>
          <RevealGroup className="sgrid">
            {groups.map(g => (
              <RevealItem key={g.label} className="sc">
                <div className="sc-label">
                  {g.icon}
                  {g.label}
                </div>
                <div className="pills">
                  {g.pills.map(p => <span key={p} className="pill">{p}</span>)}
                </div>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </div>
    </div>
  )
}

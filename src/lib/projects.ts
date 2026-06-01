export interface Outcome { metric: string; label: string }
export interface ApproachItem { title: string; body: string }

export interface ProjectCase {
  slug: string
  name: string
  client: string
  domain: string
  period: string
  tags: string[]
  overview: string
  problem: string
  approach: ApproachItem[]
  outcomes: Outcome[]
}

export const projects: ProjectCase[] = [
  {
    slug: 'echoai',
    name: 'EchoAI',
    client: 'Eccentric Engine',
    domain: 'Automotive · GenAI',
    period: 'May 2026 – Present',
    tags: ['React.js', 'NestJS', 'GCP', 'BullMQ', 'ComfyUI', 'Redis', 'EventStream'],
    overview:
      'EchoAI is a Generative AI platform for automotive marketers, enabling them to produce accurate, on-brand vehicle visuals for any background, colour, or market — in seconds, not days.',
    problem:
      'Traditional automotive photography is expensive, slow, and geographically limited. Shooting a vehicle in 40 different market contexts requires weeks of coordination and six-figure budgets. The business needed a way to generate production-quality visuals programmatically, at scale, without sacrificing brand accuracy.',
    approach: [
      {
        title: 'Frontend architecture with real-time feedback',
        body: 'Built a React + Redux frontend with a streaming job-progress UI using EventStream. Users see generation progress in real time rather than waiting on a black screen, which significantly reduced perceived latency and support tickets about "stuck" jobs.',
      },
      {
        title: 'Async job pipeline with BullMQ',
        body: 'Designed a NestJS + BullMQ queue system on GCP that handles concurrent image generation requests without overloading the ComfyUI inference nodes. Jobs are prioritised, retried on failure, and dead-lettered for inspection — giving operations full visibility into pipeline health.',
      },
      {
        title: 'ComfyUI integration & prompt engineering',
        body: 'Integrated ComfyUI as the inference backend, building a structured prompt schema that encodes vehicle make, model, colour, trim, and scene parameters into reproducible ComfyUI workflows. This eliminated prompt drift and ensured brand consistency across markets.',
      },
    ],
    outcomes: [
      { metric: '20%', label: 'Delivery turnaround reduction' },
      { metric: '∞→1', label: 'Photo shoots to one platform' },
      { metric: '40+', label: 'Market contexts supported' },
    ],
  },
  {
    slug: 'stratumn',
    name: 'Stratumn',
    client: 'Sia-Partners',
    domain: 'Enterprise · Workflow SaaS',
    period: 'Aug 2025 – Feb 2026',
    tags: ['React.js', 'Vue.js', 'NestJS', 'GraphQL', 'PostgreSQL', 'AWS', 'RabbitMQ'],
    overview:
      'Stratumn is an enterprise workflow management platform used by Sia-Partners, a global consulting firm, to orchestrate complex client-facing financial processes with full audit trails and integrations.',
    problem:
      'The existing platform had grown organically across multiple frontend codebases and had no consistent state management strategy. Client integrations — including the Mastercom Extended API for financial data — were built ad hoc, leading to fragile pipelines and slow delivery cycles. The engineering team was spending more time debugging integration failures than shipping features.',
    approach: [
      {
        title: 'Unified frontend across React and Vue',
        body: 'Introduced Redux Toolkit for the React codebase and Pinia for the Vue 3 module, establishing a consistent state management pattern across both surfaces. Shared design tokens and component conventions reduced context-switching for developers working across both stacks.',
      },
      {
        title: 'End-to-end Mastercom API integration',
        body: 'Owned the Mastercom Extended API integration from contract review through to production. Built a NestJS service layer with RabbitMQ-backed event handling to decouple the integration from the core application, making retries and error handling explicit rather than implicit.',
      },
      {
        title: 'Junior developer mentoring',
        body: 'Introduced structured PR templates, architectural decision records (ADRs), and weekly code review sessions for two junior developers. This created a feedback loop that improved code quality measurably over the six-month engagement.',
      },
    ],
    outcomes: [
      { metric: '20%', label: 'Integration delivery turnaround' },
      { metric: '100%', label: 'On-time sprint delivery' },
      { metric: '30%', label: 'Reduction in PR review cycles' },
    ],
  },
  {
    slug: 'liqua',
    name: 'Liqua',
    client: 'Pegasus Infocorp',
    domain: 'IoT · Fintech · SaaS',
    period: 'Sep 2022 – Jun 2025',
    tags: ['Vue 3', 'React.js', 'NestJS', 'tRPC', 'GCP', 'Firestore', 'TypeScript'],
    overview:
      'Liqua is a cloud-native SaaS platform for smart pool management, handling IoT telemetry from pool hardware, membership billing, and financial reconciliation for hospitality and leisure operators.',
    problem:
      'The legacy codebase had no component reuse strategy — every page duplicated UI logic, leading to inconsistencies and slow feature delivery. Financial workflows relied on manual exports to reconcile with Xero and MYOB. IoT data from pool sensors was stored in a SQL database that couldn\'t handle time-series write volumes at scale.',
    approach: [
      {
        title: 'Component library with Vue 3 + Pinia',
        body: 'Redesigned the frontend from class-based Vue 2 components to a composables-first Vue 3 architecture. Built 40+ reusable components covering forms, data tables, charts, and sensor status indicators. Pinia stores replaced Vuex with typed, composable state slices that colocated data and logic.',
      },
      {
        title: 'IoT telemetry migration to Firestore',
        body: 'Led the migration of three years of IoT sensor data from PostgreSQL to Firestore via GCP Cloud Run functions. Designed a collection structure optimised for time-series queries with subcollection-per-device sharding, eliminating the write bottleneck that had been causing data loss during peak hours.',
      },
      {
        title: 'Financial integrations: Xero, MYOB, LIGHTSPEED',
        body: 'Built a tRPC-based integration layer connecting Liqua\'s billing engine to Xero (accounting), MYOB (payroll), LIGHTSPEED (POS), and Twilio (SMS notifications). Webhooks replaced polling, reducing reconciliation lag from 24 hours to near real-time.',
      },
    ],
    outcomes: [
      { metric: '40%', label: 'Frontend performance improvement' },
      { metric: '24h→5m', label: 'Reconciliation lag reduced' },
      { metric: '3yrs', label: 'Legacy data migrated without loss' },
    ],
  },
  {
    slug: 'ott',
    name: 'OTT Platform',
    client: 'Playbulous',
    domain: 'EdTech · OTT · Streaming',
    period: 'Apr 2021 – Aug 2022',
    tags: ['React.js', 'Node.js', 'MongoDB', 'PostgreSQL', 'AWS', 'Elasticsearch', 'Kafka'],
    overview:
      'A multi-tenant OTT SaaS platform serving EdTech providers and entertainment operators, supporting adaptive video streaming, subscription billing, and content discovery across web and mobile.',
    problem:
      'Building a streaming platform from scratch for multiple tenants, each with different content catalogues, subscription models, and branding requirements. The core challenge was designing a multi-tenant architecture that could isolate tenant data, scale media delivery independently of the application tier, and support flexible billing without per-tenant customisation work.',
    approach: [
      {
        title: 'Multi-tenant architecture with tenant context',
        body: 'Designed a shared-database multi-tenancy model with tenant context injected at the middleware layer. Every query is scoped by tenant ID, with row-level policies enforced in PostgreSQL. Tenant-specific branding and feature flags are loaded from a configuration service at request time.',
      },
      {
        title: 'Adaptive streaming with AWS S3 + CloudFront',
        body: 'Built a media pipeline that transcodes uploaded video into HLS format at multiple bitrates using AWS MediaConvert, stores segments in S3, and delivers them via CloudFront with signed URLs. The player client adapts quality in real time based on the viewer\'s bandwidth.',
      },
      {
        title: 'Content discovery with Elasticsearch',
        body: 'Indexed the content catalogue in Elasticsearch with full-text search, faceted filtering by genre and age rating, and personalised ranking based on viewing history. Kafka events from the viewing service kept the index updated in near real-time without blocking the main application.',
      },
    ],
    outcomes: [
      { metric: 'Multi', label: 'Tenant isolation achieved' },
      { metric: 'HLS', label: 'Adaptive streaming delivered' },
      { metric: 'RT', label: 'Content discovery via Elasticsearch' },
    ],
  },
]

export function getProject(slug: string): ProjectCase | undefined {
  return projects.find(p => p.slug === slug)
}

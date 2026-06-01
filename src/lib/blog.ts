export interface BlogPost {
  slug: string
  title: string
  date: string
  readTime: string
  summary: string
  tags: string[]
  sections: { heading?: string; body: string }[]
}

export const posts: BlogPost[] = [
  {
    slug: 'building-echoai-genai-image-pipeline',
    title: 'Building a GenAI Image Pipeline: Lessons from EchoAI',
    date: '2026-05-20',
    readTime: '6 min read',
    summary:
      'How we designed a BullMQ-backed ComfyUI pipeline to generate automotive visuals at scale — and what we learned about queue design, prompt engineering, and real-time UX.',
    tags: ['GenAI', 'NestJS', 'BullMQ', 'GCP', 'Architecture'],
    sections: [
      {
        body: 'When I joined Eccentric Engine to work on EchoAI, the brief was straightforward: let automotive marketers generate on-brand vehicle visuals for any background or market in seconds. What followed was one of the most architecturally interesting challenges I\'ve worked on — because "in seconds" at scale is a very different problem from "in seconds" in a demo.',
      },
      {
        heading: 'The naive approach and why it fails',
        body: 'The first instinct is to call the inference endpoint synchronously — user submits parameters, you POST to ComfyUI, wait for the image, return it. This works fine for one user. At ten concurrent users it starts queuing. At fifty it times out. ComfyUI is a compute-heavy process; each generation consumes significant GPU time. You cannot treat it like a database query.',
      },
      {
        heading: 'Queue-first design with BullMQ',
        body: 'We moved to an async job model from the start. The NestJS API receives the generation request, validates parameters, enqueues a job in BullMQ backed by Redis, and immediately returns a job ID. The frontend polls for status via EventStream — a lightweight Server-Sent Events connection that pushes progress updates as the ComfyUI workflow executes. This decoupling meant we could scale the inference workers independently of the API, add priority lanes for premium users, and implement dead-letter queues for failed jobs without touching the frontend.',
      },
      {
        heading: 'Prompt engineering as a typed schema',
        body: 'The hardest problem wasn\'t the queue — it was consistency. ComfyUI workflows are node graphs, and small prompt variations produce wildly different outputs. We built a typed TypeScript schema that maps vehicle attributes (make, model, trim, colour, year, market) to deterministic ComfyUI workflow parameters. Every generation is reproducible from its schema, which also made debugging dramatically easier: when a customer reported an off-brand result, we could replay the exact workflow.',
      },
      {
        heading: 'Real-time UX: EventStream over WebSocket',
        body: 'We considered WebSockets for progress updates but chose Server-Sent Events. SSE is unidirectional, simpler to implement, works through HTTP/2 multiplexing, and doesn\'t require a persistent bidirectional connection. For a progress bar that updates five times over thirty seconds, it\'s the right tool. The NestJS EventStream module made this almost trivial to wire up.',
      },
      {
        heading: 'What I\'d do differently',
        body: 'The one thing I underestimated was observability. BullMQ has a dashboard (Bull Board) but we didn\'t set it up until we had our first production incident. Build observability before you need it, not after. Also: rate-limit your inference workers at the queue level, not the API level — it\'s much easier to reason about.',
      },
    ],
  },
  {
    slug: 'how-we-cut-frontend-load-time-by-40-percent',
    title: 'How We Cut Frontend Load Time by 40% on a Vue 3 SaaS',
    date: '2026-04-10',
    readTime: '5 min read',
    summary:
      'A breakdown of the component architecture, lazy loading strategy, and Firestore query optimisations that delivered a 40% performance improvement on the Liqua platform.',
    tags: ['Vue 3', 'Performance', 'Firestore', 'Frontend'],
    sections: [
      {
        body: 'Performance improvements are easy to claim and hard to prove. When I joined the Liqua team at Pegasus Infocorp, the platform had real performance problems — not slow-by-benchmark problems, but slow-by-user problems. Operators managing smart pool hardware were waiting 4–6 seconds for dashboards to load. This is what we did about it.',
      },
      {
        heading: 'Baseline measurement first',
        body: 'Before touching a single line of code, I spent two days with Chrome DevTools, Lighthouse, and the Vue Devtools profiler establishing a baseline. The main offenders were: a 2.1MB initial JS bundle (everything loaded eagerly), a dashboard component re-rendering on every Firestore snapshot regardless of which data changed, and twelve separate Firestore reads firing on page load that could have been three.',
      },
      {
        heading: 'Route-level code splitting',
        body: 'Vue Router supports lazy-loaded routes with a single import() call. We split every major route — dashboard, members, finance, reports — into separate chunks. Initial bundle dropped from 2.1MB to 340KB. The remaining routes load on demand, and the browser caches them after first visit. This alone accounted for roughly half the improvement.',
      },
      {
        heading: 'Component architecture: composables over bloated components',
        body: 'The existing components were doing too much. The MemberCard component, for example, fetched its own data, formatted currency, handled click state, and rendered three nested components — all in one 400-line file. We broke this into a presentational MemberCard, a useMember composable for data fetching, and a useCurrency composable for formatting. Pinia stores held shared state. Re-renders dropped because each piece only updated when its specific slice of data changed.',
      },
      {
        heading: 'Firestore query consolidation',
        body: 'Firestore bills per read, which creates an incentive to consolidate queries. More importantly for performance, each query is a round trip. We batched twelve dashboard reads into three — one for sensor status, one for membership summary, one for financial totals — using collection group queries and aggregation. We also moved from onSnapshot (real-time listeners) to getDoc with manual refresh for data that doesn\'t need sub-second updates.',
      },
      {
        heading: 'The result',
        body: 'Dashboard load time went from 5.8 seconds to 3.4 seconds on a mid-range Android device on a 4G connection. Lighthouse performance score went from 41 to 78. More importantly, support tickets about "the platform being slow" dropped by two-thirds in the month after deployment. That\'s the metric that matters.',
      },
    ],
  },
  {
    slug: 'migrating-sql-to-firestore-without-downtime',
    title: 'Migrating 3 Years of IoT Data from SQL to Firestore Without Downtime',
    date: '2026-02-28',
    readTime: '7 min read',
    summary:
      'The strategy we used to move time-series IoT sensor data from a PostgreSQL database that was struggling with write volume to Firestore — without any service interruption.',
    tags: ['Firestore', 'PostgreSQL', 'GCP', 'Data Migration'],
    sections: [
      {
        body: 'The PostgreSQL database powering Liqua\'s IoT telemetry was hitting its limits. Pool sensors report temperature, chemical levels, and flow rates every 30 seconds. At a few dozen pools that\'s manageable. At hundreds of pools, it\'s 86,400 writes per pool per day — and PostgreSQL with a general-purpose RDS instance wasn\'t built for that write profile. We were seeing data loss during peak hours when the write queue backed up.',
      },
      {
        heading: 'Why Firestore',
        body: 'Firestore\'s write throughput scales horizontally with document sharding. More importantly, its data model — collections of documents — maps naturally to "one document per sensor reading" without needing index management. The tradeoff is that complex relational queries are harder, but our IoT data access patterns are simple: get the last N readings for a device, or get all readings in a time range. Firestore handles both well.',
      },
      {
        heading: 'The dual-write strategy',
        body: 'We couldn\'t stop the world to migrate. The approach was dual-write: for a defined period, every new sensor reading was written to both PostgreSQL and Firestore simultaneously. The application read from PostgreSQL during this period. This gave us time to backfill historical data and validate that Firestore reads matched PostgreSQL — before we cut over.',
      },
      {
        heading: 'Backfilling 3 years with Cloud Run',
        body: 'The backfill job ran as a GCP Cloud Run function — serverless, so it scaled automatically, and we could run it in parallel chunks by device and time window. We processed 18 months of data in the first weekend, the remaining 18 months over the following week, running during off-peak hours. Total backfill: ~2.3 billion documents. Cloud Run cost for the job: under $40.',
      },
      {
        heading: 'Firestore data modelling for time-series',
        body: 'The collection structure matters enormously for Firestore performance. We settled on: /devices/{deviceId}/readings/{timestamp-ISO}. This gives us efficient range queries by timestamp within a device. We added a top-level /daily-summaries/{date}/{deviceId} collection for aggregated views, updated by a Cloud Function that triggers on new readings. This avoided expensive client-side aggregation.',
      },
      {
        heading: 'The cutover',
        body: 'After two weeks of dual-write with zero discrepancies in a sample of 10,000 readings per device, we updated the read path to Firestore and stopped writing to PostgreSQL. No downtime. No data loss. The PostgreSQL instance stayed running in read-only mode for two weeks as a fallback, then was decommissioned.',
      },
    ],
  },
]

export function getPost(slug: string): BlogPost | undefined {
  return posts.find(p => p.slug === slug)
}

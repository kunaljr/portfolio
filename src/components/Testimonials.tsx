import Reveal, { RevealGroup, RevealItem } from './Reveal'

const testimonials = [
  {
    initials: 'AM',
    name: 'Arjun Mehta',
    role: 'Senior Engineering Manager',
    company: 'Sia-Partners',
    quote:
      'Kunal took complete ownership of the Mastercom Extended API integration — delivering end-to-end with zero regressions and ahead of schedule. His ability to mentor junior devs while shipping complex features simultaneously is genuinely rare.',
  },
  {
    initials: 'PN',
    name: 'Priya Nair',
    role: 'CTO',
    company: 'Pegasus Infocorp',
    quote:
      'Kunal redesigned our entire Vue 3 component library and drove a 40% improvement in frontend performance that our users noticed immediately. He thinks about scalability before anyone else in the room does.',
  },
  {
    initials: 'RD',
    name: 'Rahul Desai',
    role: 'VP Engineering',
    company: 'Eccentric Engine',
    quote:
      'Within weeks of joining, Kunal owned the image generation pipeline for EchoAI and cut turnaround time by 20%. He rebuilt the feature architecture to handle scale we hadn\'t planned for — and made it look easy.',
  },
]

export default function Testimonials() {
  return (
    <div className="w">
      <div className="sec" id="testimonials">
        <Reveal>
          <div className="stag">Testimonials</div>
          <h2>What teams say.</h2>
        </Reveal>
        <RevealGroup className="tgrid">
          {testimonials.map(t => (
            <RevealItem key={t.name} className="tcard">
              <p className="tquote">{t.quote}</p>
              <div className="tauthor">
                <div className="tav">{t.initials}</div>
                <div>
                  <div className="tname">{t.name}</div>
                  <div className="trole">{t.role} · {t.company}</div>
                </div>
              </div>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </div>
  )
}

import Nav from '@/components/Nav'
import Hero from '@/components/Hero'
import About from '@/components/About'
import Experience from '@/components/Experience'
import Projects from '@/components/Projects'
import Skills from '@/components/Skills'
import Contact from '@/components/Contact'
import Footer from '@/components/Footer'

export default function Home() {
  return (
    <>
      <Nav />
      <Hero />
      <div className="sep" />
      <About />
      <div className="sep" />
      <Experience />
      <div className="sep" />
      <Projects />
      <div className="sep" />
      <Skills />
      <div className="sep" />
      <Contact />
      <Footer />
    </>
  )
}

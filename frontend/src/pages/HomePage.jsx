import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Button, Loading } from '../components/UI'
import { affirmationsService } from '../services/affirmations'

function HomePage() {
  const [affirmation, setAffirmation] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch random affirmation using the service
    const fetchAffirmation = async () => {
      try {
        const data = await affirmationsService.getRandom()
        if (data.status === 'success' && data.affirmation) {
          setAffirmation(data.affirmation)
        }
      } catch (error) {
        console.error('Error fetching affirmation:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAffirmation()
  }, [])

  // Smooth scroll to section
  const scrollToSection = (e, sectionId) => {
    e.preventDefault()
    const element = document.getElementById(sectionId)
    if (element) {
      const offset = 80 // Account for fixed navbar
      const elementPosition = element.getBoundingClientRect().top
      const offsetPosition = elementPosition + window.pageYOffset - offset

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      })
    }
  }

  return (
    <>
      {/* Hero Section */}
      <section id="home" className="hero">
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title">Empowering Communities with AI</h1>
            <p className="hero-subtitle">
              Bridging the gap between advanced AI technology and community needs through education, outreach, and innovative solutions.
            </p>
            <Button 
              onClick={(e) => scrollToSection(e, 'contact')} 
              variant="primary"
            >
              Get Started
            </Button>
          </div>
        </div>
      </section>

      {/* Daily Affirmation Section */}
      {!loading && affirmation && (
        <section className="daily-affirmation">
          <div className="container">
            <h2>✨ Daily Affirmation</h2>
            <blockquote>
              "{affirmation.text}"
            </blockquote>
            {affirmation.author && (
              <p className="affirmation-author">— {affirmation.author}</p>
            )}
            {affirmation.category && (
              <p className="affirmation-category">[{affirmation.category}]</p>
            )}
            <div style={{ marginTop: '2rem', textAlign: 'center' }}>
              <Link to="/affirmations">
                <Button variant="secondary" className="btn-small">
                  Manage Affirmations
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* About Section */}
      <section id="about" className="about">
        <div className="container">
          <h2 className="section-title">About Open AI Outreach</h2>
          <div className="about-grid">
            <div className="about-card">
              <h3>Our Mission</h3>
              <p>To democratize access to AI technology and education, ensuring that communities of all backgrounds can benefit from the AI revolution.</p>
            </div>
            <div className="about-card">
              <h3>Our Vision</h3>
              <p>A world where AI technology serves as a tool for social good, enhancing human potential and solving community challenges.</p>
            </div>
            <div className="about-card">
              <h3>Our Values</h3>
              <p>Inclusivity, transparency, ethical AI development, and community-first approach in all our initiatives and programs.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="services">
        <div className="container">
          <h2 className="section-title">Our Services</h2>
          <div className="services-grid">
            <div className="service-item">
              <div className="service-icon">📚</div>
              <h3>AI Education Programs</h3>
              <p>Comprehensive workshops and training sessions designed to teach AI fundamentals to diverse audiences.</p>
            </div>
            <div className="service-item">
              <div className="service-icon">🤝</div>
              <h3>Community Partnerships</h3>
              <p>Collaborating with local organizations to implement AI solutions that address specific community needs.</p>
            </div>
            <div className="service-item">
              <div className="service-icon">💡</div>
              <h3>Innovation Labs</h3>
              <p>Hands-on spaces where community members can experiment with AI tools and develop their own solutions.</p>
            </div>
            <div className="service-item">
              <div className="service-icon">🌐</div>
              <h3>Digital Literacy</h3>
              <p>Programs focused on building fundamental digital skills necessary for engaging with AI technology.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Fun Zone Section */}
      <section id="fun" className="fun-zone">
        <div className="container">
          <h2 className="section-title">Take a Break!</h2>
          <div className="game-emoji">🎮 🐕 🦴</div>
          <h3>Squeaky Toy Challenge</h3>
          <p>
            Test your reflexes in our fun mini-game! Help the man give a squeaky toy to an adorable pit bull terrier before time runs out. Be quick, or the pup might get impatient!
          </p>
          <Link to="/game">
            <Button variant="primary">Play Now</Button>
          </Link>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="contact">
        <div className="container">
          <h2 className="section-title">Get In Touch</h2>
          <div className="contact-content">
            <p>Ready to bring AI innovation to your community? We'd love to hear from you!</p>
            <div className="contact-info">
              <div className="contact-item">
                <strong>Email:</strong> outreach@openaioutreach.org
              </div>
              <div className="contact-item">
                <strong>Phone:</strong> +1 (555) 123-4567
              </div>
              <div className="contact-item">
                <strong>Address:</strong> 123 Innovation Drive, Tech City, TC 12345
              </div>
            </div>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '2rem' }}>
              <a href="mailto:outreach@openaioutreach.org">
                <Button variant="secondary">Send Message</Button>
              </a>
              <Link to="/contacts">
                <Button variant="primary">Manage Contacts</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

export default HomePage
import { Link, useLocation } from 'react-router-dom'

function Layout({ children }) {
  const location = useLocation()

  // Smooth scroll to section on homepage
  const handleNavClick = (e, sectionId) => {
    // Only handle smooth scrolling on homepage
    if (location.pathname === '/' && sectionId) {
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
  }

  return (
    <>
      {/* Navigation */}
      <nav className="navbar">
        <div className="container">
          <div className="nav-brand">
            <Link to="/">Open AI Outreach 🚀</Link>
          </div>
          <ul className="nav-menu">
            <li>
              <Link 
                to="/" 
                className={location.pathname === '/' ? 'active' : ''}
              >
                Home
              </Link>
            </li>
            {location.pathname === '/' && (
              <>
                <li>
                  <a 
                    href="#about" 
                    onClick={(e) => handleNavClick(e, 'about')}
                  >
                    About
                  </a>
                </li>
                <li>
                  <a 
                    href="#services" 
                    onClick={(e) => handleNavClick(e, 'services')}
                  >
                    Services
                  </a>
                </li>
              </>
            )}
            <li>
              <Link 
                to="/contacts" 
                className={location.pathname === '/contacts' ? 'active' : ''}
              >
                Contacts
              </Link>
            </li>
            <li>
              <Link 
                to="/affirmations" 
                className={location.pathname === '/affirmations' ? 'active' : ''}
              >
                Affirmations
              </Link>
            </li>
            <li>
              <Link 
                to="/game" 
                className={location.pathname === '/game' ? 'active' : ''}
              >
                🎮 Game
              </Link>
            </li>
            {location.pathname === '/' && (
              <li>
                <a 
                  href="#contact" 
                  onClick={(e) => handleNavClick(e, 'contact')}
                >
                  Contact
                </a>
              </li>
            )}
          </ul>
        </div>
      </nav>

      {/* Main content */}
      <main className="main-content">
        {children}
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <p>&copy; 2024 Open AI Outreach. All rights reserved. | Empowering communities through AI</p>
          <div className="footer-links" style={{ marginTop: '0.5rem' }}>
            <Link to="/" style={{ color: 'white', marginRight: '1rem' }}>Home</Link>
            <Link to="/contacts" style={{ color: 'white', marginRight: '1rem' }}>Contacts</Link>
            <Link to="/affirmations" style={{ color: 'white', marginRight: '1rem' }}>Affirmations</Link>
            <Link to="/game" style={{ color: 'white' }}>Game</Link>
          </div>
        </div>
      </footer>
    </>
  )
}

export default Layout
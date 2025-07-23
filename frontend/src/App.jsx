import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout/Layout'
import HomePage from './pages/HomePage'
import ContactsPage from './pages/ContactsPage'
import AffirmationsPage from './pages/AffirmationsPage'
import GamePage from './pages/GamePage'

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/contacts" element={<ContactsPage />} />
        <Route path="/affirmations" element={<AffirmationsPage />} />
        <Route path="/game" element={<GamePage />} />
      </Routes>
    </Layout>
  )
}

export default App
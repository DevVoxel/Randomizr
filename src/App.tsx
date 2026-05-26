import { Routes, Route, Link } from 'react-router-dom'
import Home from './pages/Home'

export default function App() {
  return (
    <div className="min-h-svh bg-background text-foreground">
      <nav className="border-b px-6 py-4">
        <Link to="/" className="font-semibold tracking-tight">
          Randomizr
        </Link>
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </div>
  )
}

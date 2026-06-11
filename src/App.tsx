import { Routes, Route, Link, NavLink } from 'react-router-dom'
import { DotR } from './components/Logo'
import { ItemsProvider } from './state/ItemsContext'
import Home from './pages/Home'
import Randomize from './pages/Randomize'
import Lists from './pages/Lists'

export default function App() {
  return (
    <ItemsProvider>
      <div className="min-h-svh flex flex-col">
        <nav className="sticky top-0 z-40 bg-background border-b-2 border-foreground">
          <div className="mx-auto max-w-6xl px-5 h-14 flex items-center justify-between gap-4">
            <Link to="/" className="flex items-center gap-2.5 min-w-0">
              <DotR className="h-7 w-auto text-foreground shrink-0" />
              <span className="font-brand text-xl sm:text-2xl pt-0.5 truncate">theRandomizr</span>
            </Link>
            <div className="flex items-center gap-3 sm:gap-5 text-xs uppercase tracking-[0.18em] whitespace-nowrap shrink-0">
              <NavTab to="/" end label="Methods" />
              <NavTab to="/lists" label="Lists" />
            </div>
          </div>
        </nav>
        <div className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/randomize/:method" element={<Randomize />} />
            <Route path="/lists" element={<Lists />} />
          </Routes>
        </div>
        <footer className="border-t-2 border-foreground py-5 px-5">
          <div className="mx-auto max-w-6xl flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
            <span>
              <span className="font-brand text-sm text-foreground">theRandomizr</span> · est. 2010 · rebuilt 2026
            </span>
            <span>randomness: crypto.getRandomValues() · no take-backs</span>
          </div>
        </footer>
      </div>
    </ItemsProvider>
  )
}

function NavTab({ to, label, end }: { to: string; label: string; end?: boolean }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `py-1 border-b-2 transition-colors ${
          isActive
            ? 'border-foreground text-foreground'
            : 'border-transparent text-muted-foreground hover:text-foreground'
        }`
      }
    >
      {label}
    </NavLink>
  )
}

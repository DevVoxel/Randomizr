import { useEffect } from 'react'
import { Routes, Route, Link, NavLink, useLocation } from 'react-router-dom'
import { ItemsProvider } from './state/ItemsContext'
import Home from './pages/Home'
import Randomize from './pages/Randomize'
import Lists from './pages/Lists'
import Learn from './pages/Learn'
import ArticlePage from './pages/ArticlePage'
import Discover from './pages/Discover'
import ApiPage from './pages/ApiPage'

/** SPA navigation keeps scroll position by default; readers expect the top of the page. */
function ScrollToTop() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    if (hash) {
      document.querySelector(hash)?.scrollIntoView()
      return
    }
    window.scrollTo(0, 0)
  }, [pathname, hash])
  return null
}

export default function App() {
  return (
    <ItemsProvider>
      <ScrollToTop />
      <div className="min-h-svh flex flex-col">
        <nav className="sticky top-0 z-40 bg-background border-b-2 border-foreground">
          <div className="mx-auto max-w-6xl px-5 h-14 flex items-center justify-between gap-4">
            <Link to="/" className="min-w-0">
              <span className="font-brand text-xl sm:text-2xl pt-0.5 truncate block">theRandomizr</span>
            </Link>
            <div className="flex items-center gap-3 sm:gap-5 text-xs uppercase tracking-[0.18em] whitespace-nowrap shrink-0">
              <NavTab to="/" end label="Methods" />
              <NavTab to="/discover" label="Discover" />
              <NavTab to="/learn" label="Learn" />
              <NavTab to="/lists" label="Lists" />
            </div>
          </div>
        </nav>
        <div className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/randomize/:method" element={<Randomize />} />
            <Route path="/lists" element={<Lists />} />
            <Route path="/learn" element={<Learn />} />
            <Route path="/learn/:slug" element={<ArticlePage />} />
            <Route path="/discover" element={<Discover />} />
            <Route path="/api" element={<ApiPage />} />
          </Routes>
        </div>
        <footer className="border-t-2 border-foreground py-5 px-5">
          <div className="mx-auto max-w-6xl flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
            <span>
              <span className="font-brand text-sm text-foreground">theRandomizr</span> ·{' '}
              <a
                href="/og/index.html"
                target="_blank"
                rel="noopener"
                className="underline underline-offset-2 decoration-dotted hover:text-foreground"
              >
                est. 2010
              </a>{' '}
              · rebuilt 2026
            </span>
            <span>
              randomness:{' '}
              <Link
                to="/learn/how-this-site-rolls"
                className="underline underline-offset-2 decoration-dotted hover:text-foreground"
              >
                crypto.getRandomValues()
              </Link>{' '}
              ·{' '}
              <Link to="/api" className="underline underline-offset-2 decoration-dotted hover:text-foreground">
                api
              </Link>{' '}
              · no take-backs
            </span>
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

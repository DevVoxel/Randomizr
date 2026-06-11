import { Link, useParams } from 'react-router-dom'
import { ARTICLES, getArticle } from '../lib/articles'

export default function ArticlePage() {
  const { slug } = useParams()
  const article = getArticle(slug)

  if (!article) {
    return (
      <main className="mx-auto max-w-3xl px-5 py-24 text-center">
        <h1 className="font-brand text-4xl">No such edition</h1>
        <Link to="/learn" className="btn-ink mt-8 inline-block px-6 py-2.5 font-semibold">
          Back to the press
        </Link>
      </main>
    )
  }

  const others = ARTICLES.filter((a) => a.slug !== article.slug)

  return (
    <main className="mx-auto max-w-3xl px-5 pb-24">
      <article>
        <header className="pt-12 pb-6 border-b-2 border-foreground">
          <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-3">
            <Link to="/learn" className="hover:underline underline-offset-2">the entropy press</Link>
            {' '}· {article.minutes} min read
          </p>
          <h1 className="font-brand text-4xl sm:text-5xl leading-none">{article.title}</h1>
          <p className="mt-4 text-sm text-muted-foreground leading-relaxed">{article.deck}</p>
        </header>

        <div className="pt-8 flex flex-col gap-5">
          {article.blocks.map((b, i) => {
            switch (b.t) {
              case 'h2':
                return (
                  <h2 key={i} className="font-brand text-2xl mt-4">
                    {b.text}
                  </h2>
                )
              case 'quote':
                return (
                  <blockquote key={i} className="border-l-4 border-foreground pl-4 py-1 my-2 text-base font-semibold">
                    {b.text}
                  </blockquote>
                )
              case 'code':
                return (
                  <pre key={i} className="bg-foreground text-background text-xs p-4 overflow-x-auto leading-relaxed hard-shadow-sm">
                    <code>{b.text}</code>
                  </pre>
                )
              default:
                return (
                  <p key={i} className="text-sm leading-7">
                    {b.text}
                  </p>
                )
            }
          })}
        </div>

        <footer className="mt-12 border-t-2 border-foreground pt-5">
          <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-3">keep reading</p>
          <div className="flex flex-col gap-2">
            {others.map((a) => (
              <Link key={a.slug} to={`/learn/${a.slug}`} className="text-sm underline underline-offset-2 decoration-2 hover:decoration-dotted w-fit">
                {a.title}
              </Link>
            ))}
          </div>
        </footer>
      </article>
    </main>
  )
}

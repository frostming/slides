import fs from 'node:fs/promises'

interface Talk {
  year: string
  language: string
  title: string
  href: string
}

const rootUrl = new URL('..', import.meta.url)
const readmeUrl = new URL('README.md', rootUrl)
const distUrl = new URL('dist/', rootUrl)
const indexUrl = new URL('index.html', distUrl)

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll('\'', '&#39;')
}

function toLocalHref(link: string): string {
  const url = new URL(link)
  return url.pathname.replace(/^\/+/, '') || './'
}

function parseCatalogue(markdown: string): Talk[] {
  const talks: Talk[] = []
  let year: string | undefined
  let inCatalogue = false

  for (const line of markdown.split('\n')) {
    if (line === '## Catalogue') {
      inCatalogue = true
      continue
    }

    if (inCatalogue && line.startsWith('## ') && line !== '## Catalogue')
      break

    if (!inCatalogue)
      continue

    const headingMatch = line.match(/^###\s+(.+)$/)
    if (headingMatch && !headingMatch[1].match(/^\d{4}$/))
      break

    const yearMatch = line.match(/^###\s+(\d{4})$/)
    if (yearMatch) {
      year = yearMatch[1]
      continue
    }

    const talkMatch = line.match(/^- `([^`]+)` \[([^\]]+)\]\(([^)]+)\)$/)
    if (!talkMatch || !year)
      continue

    talks.push({
      year,
      language: talkMatch[1],
      title: talkMatch[2],
      href: toLocalHref(talkMatch[3]),
    })
  }

  return talks.sort((a, b) => Number(b.year) - Number(a.year))
}

function renderTalk(talk: Talk): string {
  return `
          <a class="talk" href="${escapeHtml(talk.href)}">
            <span class="cover">
              <span class="year">${escapeHtml(talk.year)}</span>
            </span>
            <span class="talk-body">
              <span class="meta">
                <span class="tag">${escapeHtml(talk.language)}</span>
              </span>
              <h3>${escapeHtml(talk.title)}</h3>
              <span class="open">Open slides</span>
            </span>
          </a>`
}

function renderIndex(talks: Talk[]): string {
  const years = [...new Set(talks.map(talk => talk.year))]

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Frost's Talks</title>
    <style>
      :root {
        color-scheme: light;
        --bg: #f7f4ed;
        --surface: #fffaf0;
        --surface-strong: #ffffff;
        --ink: #17201b;
        --muted: #58625c;
        --line: #ddd5c6;
        --accent: #0f766e;
        --accent-strong: #115e59;
        --warm: #c2410c;
        font-family:
          Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont,
          "Segoe UI", sans-serif;
      }

      * {
        box-sizing: border-box;
      }

      body {
        margin: 0;
        min-height: 100vh;
        color: var(--ink);
        background:
          radial-gradient(circle at 18% 12%, rgba(15, 118, 110, 0.12), transparent 28rem),
          linear-gradient(135deg, #fbf7ef 0%, var(--bg) 44%, #eef7f5 100%);
      }

      a {
        color: inherit;
        text-decoration: none;
      }

      .page {
        width: min(1120px, calc(100% - 40px));
        margin: 0 auto;
        padding: 56px 0 64px;
      }

      .header {
        display: grid;
        grid-template-columns: 1fr auto;
        gap: 32px;
        align-items: end;
        padding-bottom: 34px;
        border-bottom: 1px solid var(--line);
      }

      .eyebrow {
        margin: 0 0 12px;
        color: var(--accent-strong);
        font-size: 0.78rem;
        font-weight: 760;
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }

      h1 {
        margin: 0;
        max-width: 760px;
        font-size: clamp(2.4rem, 7vw, 5.75rem);
        line-height: 0.96;
        letter-spacing: 0;
      }

      .summary {
        max-width: 420px;
        margin: 0;
        color: var(--muted);
        font-size: 1rem;
        line-height: 1.65;
      }

      .stats {
        display: flex;
        gap: 18px;
        margin: 28px 0 0;
        padding: 0;
        list-style: none;
      }

      .stat {
        min-width: 108px;
        padding: 14px 16px;
        border: 1px solid var(--line);
        background: rgba(255, 255, 255, 0.55);
      }

      .stat strong {
        display: block;
        font-size: 1.55rem;
        line-height: 1;
      }

      .stat span {
        display: block;
        margin-top: 6px;
        color: var(--muted);
        font-size: 0.78rem;
        text-transform: uppercase;
      }

      .section {
        margin-top: 38px;
      }

      .section-title {
        display: flex;
        justify-content: space-between;
        gap: 20px;
        align-items: center;
        margin-bottom: 18px;
      }

      h2 {
        margin: 0;
        font-size: 1rem;
        letter-spacing: 0;
        text-transform: uppercase;
      }

      .repo-link {
        color: var(--accent-strong);
        font-weight: 720;
      }

      .talks {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 16px;
      }

      .talk {
        display: grid;
        grid-template-columns: 112px 1fr;
        gap: 18px;
        min-height: 150px;
        padding: 18px;
        border: 1px solid var(--line);
        background: rgba(255, 255, 255, 0.72);
        transition:
          transform 160ms ease,
          border-color 160ms ease,
          box-shadow 160ms ease;
      }

      .talk:hover,
      .talk:focus-visible {
        transform: translateY(-2px);
        border-color: rgba(15, 118, 110, 0.45);
        box-shadow: 0 18px 45px rgba(23, 32, 27, 0.12);
        outline: none;
      }

      .cover {
        display: flex;
        align-items: flex-end;
        width: 112px;
        min-height: 112px;
        color: var(--surface-strong);
        background:
          linear-gradient(135deg, rgba(15, 118, 110, 0.9), rgba(194, 65, 12, 0.82)),
          var(--accent);
      }

      .year {
        display: inline-grid;
        place-items: center;
        width: 72px;
        height: 42px;
        margin: 12px;
        background: rgba(23, 32, 27, 0.78);
        font-size: 1.35rem;
        font-weight: 820;
      }

      .talk-body {
        display: flex;
        min-width: 0;
        flex-direction: column;
      }

      .meta {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin-bottom: 12px;
        color: var(--muted);
        font-size: 0.78rem;
        font-weight: 700;
        text-transform: uppercase;
      }

      .tag {
        padding: 4px 8px;
        border: 1px solid var(--line);
        background: var(--surface);
      }

      .talk h3 {
        margin: 0;
        font-size: 1.16rem;
        line-height: 1.32;
        letter-spacing: 0;
      }

      .open {
        margin-top: auto;
        padding-top: 18px;
        color: var(--accent-strong);
        font-weight: 760;
      }

      @media (max-width: 780px) {
        .page {
          width: min(100% - 28px, 1120px);
          padding-top: 36px;
        }

        .header,
        .talks {
          grid-template-columns: 1fr;
        }

        .stats {
          flex-wrap: wrap;
        }
      }

      @media (max-width: 520px) {
        .talk {
          grid-template-columns: 1fr;
        }

        .cover {
          width: 100%;
          min-height: 110px;
        }

        .year {
          width: 68px;
          height: 38px;
          font-size: 1.05rem;
        }
      }
    </style>
  </head>
  <body>
    <main class="page">
      <header class="header">
        <div>
          <p class="eyebrow">Slide archive</p>
          <h1>Frost's Talks</h1>
        </div>
        <div>
          <p class="summary">
            A compact catalogue of conference decks and archived talks generated
            from the repository catalogue.
          </p>
          <ul class="stats" aria-label="Talk statistics">
            <li class="stat">
              <strong>${talks.length}</strong>
              <span>Decks</span>
            </li>
            <li class="stat">
              <strong>${escapeHtml(years.at(-1) ?? '')}</strong>
              <span>Since</span>
            </li>
            <li class="stat">
              <strong>${years.length}</strong>
              <span>Years</span>
            </li>
          </ul>
        </div>
      </header>

      <section class="section" aria-labelledby="talks-title">
        <div class="section-title">
          <h2 id="talks-title">Catalogue</h2>
          <a class="repo-link" href="https://github.com/frostming/slides">Source</a>
        </div>

        <div class="talks">${talks.map(renderTalk).join('')}
        </div>
      </section>
    </main>
  </body>
</html>
`
}

const markdown = await fs.readFile(readmeUrl, 'utf8')
const talks = parseCatalogue(markdown)

if (talks.length === 0)
  throw new Error('No talks found in README.md Catalogue')

await fs.mkdir(distUrl, { recursive: true })
await fs.writeFile(indexUrl, renderIndex(talks))
console.log(`Generated ${indexUrl.pathname} from ${talks.length} talks`)

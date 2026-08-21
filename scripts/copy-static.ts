import fs from 'node:fs/promises'

/**
 * Copy hand-written (non-Slidev) decks into `dist/`.
 *
 * `static/<slug>/index.html` becomes `https://slides.fming.dev/<slug>/`, so such
 * decks are addressed exactly like the Slidev ones and can be listed in the
 * README catalogue without any special casing in `build-index.ts`.
 */
const rootUrl = new URL('..', import.meta.url)
const staticUrl = new URL('static/', rootUrl)
const distUrl = new URL('dist/', rootUrl)

async function exists(url: URL): Promise<boolean> {
  try {
    await fs.access(url)
    return true
  }
  catch {
    return false
  }
}

if (!(await exists(staticUrl))) {
  console.log('No static/ directory, nothing to copy')
}
else {
  const entries = (await fs.readdir(staticUrl, { withFileTypes: true }))
    .filter(entry => entry.isDirectory())

  await fs.mkdir(distUrl, { recursive: true })

  for (const entry of entries) {
    await fs.cp(
      new URL(`${entry.name}/`, staticUrl),
      new URL(`${entry.name}/`, distUrl),
      { recursive: true },
    )
    console.log(`Copied static/${entry.name} -> dist/${entry.name}`)
  }
}

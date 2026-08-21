# Frost's Talks

<!-- TODO: change the title to your name -->

Slides & code for my talks, using [Slidev](https://github.com/slidevjs/slidev)!

## Catalogue

### 2020

- `zh` [基于 PEP 582 的包管理器](https://slides.fming.dev/pep582/)

### 2021

- `zh` [Python 打包 101](https://slides.fming.dev/python-packaging/)
- `zh` [PDM - Python 打包的新体验](https://slides.fming.dev/pdm/)

### 2024

- `zh` [利用 Pydantic 提升 Python 代码的开发体验](https://slides.fming.dev/pydantic/)

### 2025

- `zh` [Python 打包生态系统的最新进展](https://slides.fming.dev/2025-pycon-peps/)

### 2026

- `zh` [Python 包的插件系统设计](https://slides.fming.dev/python-plugin-system/)

<!-- TODO: Add your talk to here. -->

### Development

```bash
pnpm dev
```

visit <http://localhost:3030>

Edit the `<your talk folder>/src/slides.md` to see the changes.

Hand-written decks that are not built by Slidev live in `static/<slug>/index.html`.
They are copied verbatim to `dist/<slug>/` at build time, so they get the same
`https://slides.fming.dev/<slug>/` URL and are listed in the catalogue too.

Learn more about Slidev at the [documentation](https://sli.dev/).

### Build

To build the Slides Website, run

```bash
pnpm build
```

### Export to PDF

To export the Slides to PDF, run

```bash
pnpm export
```

the PDF will be generated in the `<your talk folder>/slides.pdf` folder.

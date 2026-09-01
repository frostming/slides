# Python 包的插件系统设计

PyCon China 2026 · Talk

Slidev deck. Run `pnpm dev` from the repo root and pick this folder, or run
`pnpm dev` inside `src/`. Builds to `https://slides.fming.dev/python-plugin-system/`.

## Layout

- `src/slides.md` — the deck; content is Markdown, structure is components
- `src/layouts/` — `brick` (standard slide) and `cover` (title slide)
- `src/components/` — `Brick`, `Callout`, `Code`, `Node`, `FlowArrow`, `QItem`, `Takeaway`
- `src/styles/deck.css` — the pixel/brick design system, ported from the
  original hand-written HTML deck
- `src/setup/shiki.ts` — a Shiki theme matching the original code palette

`original.html` is the first, hand-written version of this deck, kept as the
reference this was migrated from. It is no longer published or built.

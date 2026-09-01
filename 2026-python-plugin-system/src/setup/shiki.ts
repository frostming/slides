import { defineShikiSetup } from '@slidev/types'

/**
 * Reproduce the original deck's hand-rolled Python highlighter as a Shiki
 * theme, so the code blocks keep their exact palette on the dark brick.
 */
const brick = {
  name: 'pycon-brick',
  type: 'dark' as const,
  colors: {
    'editor.background': '#1a1a1a',
    'editor.foreground': '#e8efe9',
  },
  settings: [
    { scope: ['comment', 'punctuation.definition.comment'], settings: { foreground: '#7f8c86', fontStyle: 'italic' } },
    { scope: ['string', 'string.quoted', 'constant.character'], settings: { foreground: '#9edd77' } },
    { scope: ['keyword', 'keyword.control', 'storage.type', 'storage.modifier', 'keyword.operator.logical'], settings: { foreground: '#f9ca33', fontStyle: 'bold' } },
    { scope: ['support.function.builtin', 'support.type', 'variable.language'], settings: { foreground: '#c69bff' } },
    { scope: ['constant.numeric', 'constant.language'], settings: { foreground: '#f19640' } },
    { scope: ['entity.name.function', 'support.function', 'meta.function-call'], settings: { foreground: '#5fc8f5' } },
    { scope: ['entity.name.type', 'entity.name.class', 'support.class'], settings: { foreground: '#59d3b4' } },
    { scope: ['meta.decorator', 'entity.name.function.decorator', 'punctuation.decorator'], settings: { foreground: '#e27344' } },
    { scope: ['keyword.operator', 'punctuation'], settings: { foreground: '#cfd8d4' } },
  ],
}

export default defineShikiSetup(() => ({
  themes: { dark: brick, light: brick },
}))

<script setup lang="ts">
import { useResizeObserver } from '@vueuse/core'
import { nextTick, onMounted, ref } from 'vue'

/**
 * The deck's standard slide: a white brick with a coloured stud strip, an
 * all-caps kicker, the title (written as `##` in Markdown), and a footer.
 *
 * Frontmatter:
 *   layout: brick
 *   kicker: 01 · Why Extend
 *   accent: red          # yellow | orange | red | purple | indigo | blue | green
 *   center: true         # vertically centre the body
 */
defineProps<{
  kicker?: string
  accent?: string
  center?: boolean
}>()

const body = ref<HTMLElement>()
/** guards against the resize observer reacting to our own scaling */
let adjusting = false

/**
 * Shrink a slide whose content runs past the bottom, the way the original
 * HTML deck did. Without it a slide silently clips when its text grows, which
 * is exactly the failure you hit while editing.
 */
function fit() {
  const el = body.value
  if (!el || adjusting)
    return

  adjusting = true
  el.style.transform = ''
  el.style.width = ''

  const avail = el.clientHeight
  if (avail > 0) {
    const top = el.getBoundingClientRect().top
    let used = 0
    for (const child of el.querySelectorAll('*')) {
      const rect = child.getBoundingClientRect()
      if (rect.height)
        used = Math.max(used, rect.bottom - top)
    }
    if (used > avail + 1) {
      const k = Math.max(0.6, avail / used)
      el.style.transformOrigin = 'top left'
      el.style.transform = `scale(${k})`
      el.style.width = `${100 / k}%`
    }
  }

  requestAnimationFrame(() => {
    adjusting = false
  })
}

onMounted(async () => {
  await nextTick()
  fit()
  // webfonts land after first paint and change every measurement
  document.fonts?.ready.then(fit)
})

useResizeObserver(body, fit)
</script>

<template>
  <div class="slidev-layout brick-slide" :class="accent ? `accent-${accent}` : ''">
    <div v-if="kicker" class="kicker">
      {{ kicker }}
    </div>
    <div ref="body" class="body" :class="{ vcenter: center }">
      <slot />
    </div>
    <div class="foot">
      <span>Python 包的插件系统设计</span>
      <span class="num">{{ String($slidev.nav.currentPage).padStart(2, '0') }} / {{ $slidev.nav.total }}</span>
    </div>
  </div>
</template>

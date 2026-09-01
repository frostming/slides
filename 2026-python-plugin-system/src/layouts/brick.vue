<script setup lang="ts">
import { useResizeObserver } from '@vueuse/core'
import { nextTick, onMounted, ref } from 'vue'

/**
 * The deck's standard slide, framed like the official PyCon China 2026
 * template: a dotted green band top and bottom, black rules, white stage.
 *
 * Frontmatter:
 *   layout: brick
 *   kicker: 01 · Why Extend
 *   accent: red          # yellow | orange | red | purple | indigo | blue | green
 */
defineProps<{
  kicker?: string
  accent?: string
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

  // scale the whole body down if the content runs past the bottom
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
    <div class="conf-bar dots">
      <ConfMark />
    </div>

    <div class="slide-stage">
      <div v-if="kicker" class="kicker">
        {{ kicker }}
      </div>
      <div ref="body" class="body">
        <slot />
      </div>
    </div>

    <div class="conf-foot dots">
      <span>Python 包的插件系统设计</span>
      <span>{{ String($slidev.nav.currentPage).padStart(2, '0') }} / {{ $slidev.nav.total }}</span>
    </div>
  </div>
</template>

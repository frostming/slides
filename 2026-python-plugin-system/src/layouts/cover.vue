<script setup lang="ts">
/** Title slide: the pixel logo row, the talk title, and the section chips. */
defineProps<{ accent?: string }>()
</script>

<template>
  <div class="slidev-layout brick-slide cover" :class="accent ? `accent-${accent}` : ''">
    <div class="cover-logo-row">
      <i style="background: var(--py-blue)" />
      <i style="background: var(--py-yellow)" />
      <i style="background: var(--py-green)" />
      <i style="background: var(--py-red)" />
      <i style="background: var(--py-purple)" />
    </div>
    <slot />
    <div class="foot">
      <span>Python 包的插件系统设计</span>
      <span class="num">{{ String($slidev.nav.currentPage).padStart(2, '0') }} / {{ $slidev.nav.total }}</span>
    </div>
  </div>
</template>

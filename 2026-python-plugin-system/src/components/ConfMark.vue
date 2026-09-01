<script setup lang="ts">
/**
 * The conference wordmark, as it appears on the official PyCon China 2026
 * template: pixel type, one colour per letter, black outline.
 */
const WORD = 'PYCON CHINA 2026'
const COLOURS = [
  'var(--py-red)', 'var(--py-yellow)', 'var(--py-blue)', 'var(--py-yellow)', 'var(--py-purple)',
  null,
  'var(--py-purple)', 'var(--py-blue)', 'var(--py-yellow)', 'var(--py-red)', '#f6dfa8',
  null,
  'var(--gray-pixel)', 'var(--gray-pixel)', 'var(--gray-pixel)', 'var(--gray-pixel)',
]
const letters = [...WORD].map((ch, i) => ({ ch, colour: COLOURS[i] ?? 'transparent' }))
</script>

<template>
  <div class="conf-mark">
    <div class="conf-word">
      <span v-for="(l, i) in letters" :key="i" :style="{ color: l.colour }">{{ l.ch }}</span>
    </div>
    <div class="conf-theme">AI For Good</div>
  </div>
</template>

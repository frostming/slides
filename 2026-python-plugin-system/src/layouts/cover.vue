<script setup lang="ts">
/**
 * Title slide. Uses the official template's cover artwork as the background
 * and places the talk title inside its white panel, below the printed
 * PYCON CHINA 2026 wordmark.
 */
defineProps<{ accent?: string }>()
</script>

<template>
  <div class="slidev-layout cover-slide">
    <div class="cover-content">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * A code block with the deck's yellow filename caption.
 *
 * <Code cap="mdlite/core.py — 100 lines, zero dependencies" size="sm">
 *   ```py
 *   def render(text: str) -> str: ...
 *   ```
 * </Code>
 */
defineProps<{
  cap?: string
  /** shrink the type so a long line still fits its column: sm | xs */
  size?: string
}>()
</script>

<template>
  <div class="code-block" :class="size ? `code-${size}` : ''">
    <span v-if="cap" class="code-cap">{{ cap }}</span>
    <slot />
  </div>
</template>

<script setup lang="ts">
/**
 * One box in a flow diagram.
 *
 * `color`: k (yellow) · b (blue) · g (green) · r (red) · p (purple).
 * The class is prefixed because bare one-letter classes collide with UnoCSS
 * utilities — `b` alone means `border-width: 1px` and would override the box.
 */
defineProps<{ color?: string }>()
</script>

<template>
  <div class="node" :class="color ? `node-${color}` : ''">
    <slot />
  </div>
</template>

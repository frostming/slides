<script setup lang="ts">
/**
 * A card. `color` picks one of the deck's pastel fills, `tag` renders the
 * small pixel label in the top-left corner.
 */
defineProps<{
  color?: string
  tag?: string
  grow?: boolean
}>()
</script>

<template>
  <div class="brick" :class="[color, { grow }]">
    <span v-if="tag" class="tag">{{ tag }}</span>
    <slot />
  </div>
</template>

<style scoped>
.grow { flex: 1; }
</style>

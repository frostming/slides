<script setup lang="ts">
/** One row of the decision list: a coloured badge plus a question. */
defineProps<{
  color?: string
  badge: string
  badgeColor?: string
  badgeInk?: boolean
}>()
</script>

<template>
  <div class="brick q-item" :class="color">
    <div
      class="badge-n"
      :style="{
        background: badgeColor,
        color: badgeInk ? 'var(--ink)' : undefined,
      }"
    >
      {{ badge }}
    </div>
    <div class="q-body"><slot /></div>
  </div>
</template>

<style scoped>
.q-item {
  display: flex;
  align-items: center;
  gap: 18px;
}

.q-body { flex: 1; }
</style>

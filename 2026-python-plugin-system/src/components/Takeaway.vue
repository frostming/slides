<script setup lang="ts">
/** A numbered takeaway card: big pixel numeral beside a claim. */
defineProps<{ n: string | number }>()
</script>

<template>
  <div class="brick yellow takeaway">
    <span class="px num">{{ n }}</span>
    <div><slot /></div>
  </div>
</template>

<style scoped>
.takeaway {
  display: flex;
  gap: 18px;
  align-items: flex-start;
}

.num {
  font-size: 24px;
  color: var(--py-orange);
  flex: none;
}
</style>

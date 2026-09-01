<script setup lang="ts">
defineProps<{ down?: boolean }>()
</script>

<template>
  <div class="arrow" :style="down ? 'text-align: center' : ''">
    {{ down ? '↓' : '→' }}
  </div>
</template>

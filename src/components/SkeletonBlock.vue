<script setup>
defineProps({
  inverse: { type: Boolean, default: false },
})
</script>

<template>
  <span
    aria-hidden="true"
    class="block animate-pulse rounded-sm"
    :class="inverse ? 'bg-white/30' : 'bg-border'"
  ></span>
</template>

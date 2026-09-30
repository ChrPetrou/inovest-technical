<script setup>
defineProps({
  padded: { type: Boolean, default: false },
})
</script>

<template>
  <section
    class="rounded-card border border-border bg-surface shadow-xs p-1"
    :class="padded && 'p-5 sm:p-6'"
  >
    <slot />
  </section>
</template>

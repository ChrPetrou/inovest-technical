<script setup>
import { statusClass } from '@/helpers/utils'

defineProps({
  status: { type: String, required: true },
})
</script>

<template>
  <span class="inline-flex rounded-pill px-2 py-0.5 text-xs font-md capitalize" :class="statusClass(status)">
    {{ status }}
  </span>
</template>

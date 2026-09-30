<script setup>
import { useId } from 'vue'

defineProps({
  label: { type: String, required: true },
  options: { type: Array, default: () => [] },
  allLabel: { type: String, default: '' },
  disabled: { type: Boolean, default: false },
})

const model = defineModel({ type: String, default: '' })
const id = useId()
</script>

<template>
  <div class="flex min-w-0 flex-col gap-1">
    <label :for="id" class="text-xs font-md text-muted">{{ label }}</label>
    <select
      :id="id"
      v-model="model"
      :disabled="disabled"
      class="h-10 w-full truncate rounded-md border border-border bg-surface px-3 text-sm text-foreground focus:border-primary-500 focus:ring-2 focus:ring-primary-100 focus:outline-none disabled:opacity-60"
    >
      <option v-if="allLabel" value="">{{ allLabel }}</option>
      <option v-for="option in options" :key="option.value" :value="option.value">
        {{ option.label }}
      </option>
    </select>
  </div>
</template>

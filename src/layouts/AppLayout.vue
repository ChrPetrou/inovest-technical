<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const title = computed(() => route.meta.title)
</script>

<template>
  <div class="flex min-h-screen flex-col">
    <main class="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6">
      <h1 v-if="title" class="mb-6 text-xl font-lg text-foreground">{{ title }}</h1>
      <slot />
    </main>
  </div>
</template>

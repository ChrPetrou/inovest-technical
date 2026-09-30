<script setup>
import { useId } from 'vue'
import { XMarkIcon } from '@heroicons/vue/20/solid'
import BaseCard from './BaseCard.vue'

const { open, title } = defineProps({
  open: { type: Boolean, default: false },
  title: { type: String, default: '' },
})

const emit = defineEmits(['close'])

const titleId = useId()
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-150"
      leave-active-class="transition-opacity duration-150"
      enter-from-class="opacity-0"
      leave-to-class="opacity-0"
    >
      <div
        v-if="open"
        class="fixed inset-0 z-50 flex items-end justify-center bg-foreground/40 backdrop-blur-xs sm:items-center sm:p-4"
      >
        <BaseCard
          role="dialog"
          aria-modal="true"
          :aria-labelledby="title ? titleId : undefined"
          class="flex max-h-[90dvh] w-full flex-col rounded-b-none sm:max-w-lg sm:rounded-b-card"
        >
          <header
            class="flex shrink-0 items-center justify-between gap-4 border-b border-border px-5 py-4 sm:px-6"
          >
            <h2 :id="titleId" class="truncate text-lg font-lg">{{ title }}</h2>
            <button
              ref="closeButton"
              type="button"
              aria-label="Close"
              class="-mr-2 flex size-9 shrink-0 items-center justify-center rounded-md text-muted hover:bg-background hover:text-foreground focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none"
              @click="emit('close')"
            >
              <XMarkIcon class="size-5 pointer" aria-hidden="true" />
            </button>
          </header>

          <div
            class="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pt-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] sm:px-6 sm:pb-5"
          >
            <slot />
          </div>
        </BaseCard>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { amountClass, formatDate, formatTime, headerClass, signedAmount } from '@/helpers/utils'
import BaseCard from '@/components/BaseCard.vue'
import SkeletonBlock from '@/components/SkeletonBlock.vue'
import StatusBadge from '@/components/StatusBadge.vue'
import { TRANSACTION_COLUMNS } from '@/config/transactionsTable'

// Presentational only: the parent fetches, filters and sorts, then passes rows in.
defineProps({
  transactions: { type: Array, default: () => [] },
  // Count before filtering, used for 'Showing X of Y' and to tell 'no results' from 'no data'.
  totalCount: { type: Number, default: 0 },
  loading: { type: Boolean, default: false },
  error: { type: Boolean, default: false },
  retrying: { type: Boolean, default: false },
  title: { type: String, default: '' },
})

const emit = defineEmits(['retry', 'clear-filters', 'select'])
</script>

<template>
  <BaseCard aria-labelledby="transactions-heading">
    <header class="flex flex-col gap-4 border-b border-border px-5 py-4 sm:px-6">
      <div class="flex items-baseline justify-between gap-3">
        <h2 id="transactions-heading" class="text-lg font-lg">{{ title }}</h2>
        <p v-if="!loading && !error" class="text-xs text-muted" aria-live="polite">
          Showing {{ transactions.length }} of {{ totalCount }}
        </p>
      </div>
      <slot name="table-filters" />
    </header>

    <div v-if="error" class="flex flex-wrap items-center gap-3 px-5 py-6 text-sm sm:px-6">
      <span class="text-danger">Couldn't load transactions.</span>
      <button
        type="button"
        class="rounded-md border border-border px-3 py-1 font-md hover:bg-background disabled:opacity-60"
        :disabled="retrying"
        @click="emit('retry')"
      >
        {{ retrying ? 'Retrying…' : 'Retry' }}
      </button>
    </div>

    <template v-else-if="loading || transactions.length">
      <span v-if="loading" class="sr-only">Loading transactions…</span>

      <!-- Phones: stacked list, one tappable card per transaction -->
      <ul class="divide-y divide-border sm:hidden">
        <template v-if="loading">
          <li v-for="n in 6" :key="n" class="flex items-center justify-between gap-4 px-5 py-3">
            <div class="flex flex-col gap-1.5">
              <SkeletonBlock class="h-4 w-32" />
              <SkeletonBlock class="h-3 w-24" />
            </div>
            <SkeletonBlock class="h-4 w-16" />
          </li>
        </template>
        <li v-for="t in transactions" v-else :key="t.id">
          <button
            type="button"
            class="flex w-full items-center justify-between gap-4 px-5 py-3 text-left hover:bg-background focus-visible:bg-primary-50 focus-visible:outline-none"
            @click="emit('select', t)"
          >
            <span class="flex min-w-0 flex-col gap-1">
              <span class="truncate font-md text-foreground">{{ t.merchant }}</span>
              <span class="flex items-center gap-2 text-xs text-muted">
                <time :datetime="t.date">{{ formatDate(t.date) }}</time>
                <StatusBadge :status="t.status" />
              </span>
            </span>
            <span class="flex shrink-0 flex-col items-end gap-1">
              <span class="text-sm font-md whitespace-nowrap tabular-nums" :class="amountClass(t)">
                {{ signedAmount(t) }}
              </span>
              <span class="text-xs text-muted capitalize">{{ t.type }} · {{ t.currency }}</span>
            </span>
          </button>
        </li>
      </ul>

      <!-- sm and up: full table -->
      <div class="hidden overflow-x-auto sm:block">
        <table class="w-full min-w-180 text-left text-sm">
          <thead class="text-xs text-muted">
            <tr class="border-b border-border">
              <th
                v-for="(column, index) in TRANSACTION_COLUMNS"
                :key="column.key"
                scope="col"
                class="py-3 font-md"
                :class="headerClass(column, index, TRANSACTION_COLUMNS.length)"
              >
                {{ column.label }}
              </th>
            </tr>
          </thead>

          <tbody v-if="loading">
            <tr v-for="n in 6" :key="n" class="border-b border-border last:border-0">
              <td class="px-5 py-4 sm:px-6">
                <SkeletonBlock class="h-4 w-36" />
                <SkeletonBlock class="mt-1.5 h-3 w-20" />
              </td>
              <td class="px-3 py-4">
                <SkeletonBlock class="h-4 w-24" />
                <SkeletonBlock class="mt-1.5 h-3 w-10" />
              </td>
              <td class="px-3 py-4"><SkeletonBlock class="h-4 w-12" /></td>
              <td class="px-3 py-4"><SkeletonBlock class="h-5 w-20 rounded-pill" /></td>
              <td class="px-3 py-4"><SkeletonBlock class="ml-auto h-4 w-20" /></td>
              <td class="px-5 py-4 sm:px-6"><SkeletonBlock class="h-4 w-10" /></td>
            </tr>
          </tbody>

          <tbody v-else>
            <!-- Rows open the details; tabindex + Enter/Space make that work from the keyboard too -->
            <tr
              v-for="t in transactions"
              :key="t.id"
              tabindex="0"
              :aria-label="'View details for ' + t.merchant"
              class="cursor-pointer border-b border-border last:border-0 hover:bg-background focus-visible:bg-primary-50 focus-visible:outline-none"
              @click="emit('select', t)"
              @keydown.enter="emit('select', t)"
              @keydown.space.prevent="emit('select', t)"
            >
              <!-- Long names are cut with an ellipsis; the full text is in the tooltip and the details -->
              <td class="max-w-64 px-5 py-3 sm:px-6">
                <div class="truncate font-md text-foreground" :title="t.merchant">
                  {{ t.merchant }}
                </div>
                <div class="truncate text-xs text-muted" :title="t.category">
                  {{ t.category }}
                </div>
              </td>
              <td class="px-3 py-3 whitespace-nowrap">
                <time :datetime="t.date">{{ formatDate(t.date) }}</time>
                <div class="text-xs text-muted">{{ formatTime(t.date) }}</div>
              </td>
              <td class="px-3 py-3 capitalize">{{ t.type }}</td>
              <td class="px-3 py-3"><StatusBadge :status="t.status" /></td>
              <td
                class="px-3 py-3 text-right font-md whitespace-nowrap tabular-nums"
                :class="amountClass(t)"
              >
                {{ signedAmount(t) }}
              </td>
              <td class="px-5 py-3 text-muted sm:px-6">{{ t.currency }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>

    <!-- Filters hid everything: different from having no transactions at all -->
    <div v-else-if="totalCount > 0" class="px-6 py-10 text-center">
      <p class="font-md text-foreground">No transactions match your filters.</p>
      <button
        type="button"
        class="mt-2 text-sm font-md text-primary-700 hover:underline"
        @click="emit('clear-filters')"
      >
        Clear filters
      </button>
    </div>

    <p v-else class="px-6 py-10 text-center text-muted">No transactions yet.</p>
  </BaseCard>
</template>

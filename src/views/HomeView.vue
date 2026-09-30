<script setup>
import { computed, ref } from 'vue'
import { applyFilters, clearFilters, DEFAULT_FILTERS, hasActiveFilters } from '@/helpers/utils'
import AccountSummary from '@/components/AccountSummary.vue'
import FilterInput from '@/components/FilterInput.vue'
import ModalCard from '@/components/ModalCard.vue'
import TransactionDetails from '@/components/TransactionDetails.vue'
import TransactionsTable from '@/components/TransactionsTable.vue'
import { TRANSACTION_FILTERS } from '@/config/transactionFilters'
import { useFilterOptionsQuery } from '@/queries/filters'
import { useTransactionsQuery } from '@/queries/transactions'

const { data, isPending, isError, isFetching, refetch } = useTransactionsQuery()
const { data: filterOptions, isPending: filterOptionsPending } = useFilterOptionsQuery()

const filters = ref({ ...DEFAULT_FILTERS })

const allTransactions = computed(() => data.value ?? [])
const visibleTransactions = computed(() => applyFilters(allTransactions.value, filters.value))
const isFiltered = computed(() => hasActiveFilters(filters.value))

function resetFilters() {
  filters.value = clearFilters(filters.value)
}

const selectedTransaction = ref(null)
const isModalOpen = ref(false)

function openTransaction(transaction) {
  selectedTransaction.value = transaction
  isModalOpen.value = true
}

function closeModal() {
  isModalOpen.value = false
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <h1 class="sr-only">Dashboard</h1>
    <AccountSummary />
    <TransactionsTable
      :title="'Recent Transactions'"
      :transactions="visibleTransactions"
      :total-count="allTransactions.length"
      :loading="isPending"
      :error="isError"
      :retrying="isFetching"
      @retry="refetch()"
      @clear-filters="resetFilters"
      @select="openTransaction"
    >
      <template #table-filters>
        <div
          role="search"
          aria-label="Filter transactions"
          class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-[repeat(4,minmax(0,1fr))_auto] lg:items-end"
        >
          <FilterInput
            v-for="field in TRANSACTION_FILTERS"
            :key="field.key"
            v-model="filters[field.key]"
            :label="field.label"
            :all-label="field.allLabel"
            :options="filterOptions?.[field.optionsKey]"
            :disabled="filterOptionsPending"
          />

          <button
            type="button"
            class="h-10 rounded-md px-3 text-sm font-md text-primary-700 hover:bg-primary-50 disabled:invisible sm:col-span-2 lg:col-span-1"
            :disabled="!isFiltered"
            @click="resetFilters"
          >
            Clear filters
          </button>
        </div>
      </template>
    </TransactionsTable>

    <ModalCard :open="isModalOpen" :title="selectedTransaction?.merchant" @close="closeModal">
      <TransactionDetails v-if="selectedTransaction" :transaction="selectedTransaction" />
    </ModalCard>
  </div>
</template>

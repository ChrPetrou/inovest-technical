<script setup>
import { amountClass, signedAmount, transactionDetailRows } from '@/helpers/utils'
import StatusBadge from '@/components/StatusBadge.vue'

defineProps({
  transaction: { type: Object, required: true },
})
</script>

<template>
  <div class="flex flex-col gap-5">
    <div class="flex flex-col items-start gap-2">
      <p class="text-2xl font-xl" :class="amountClass(transaction)">
        {{ signedAmount(transaction) }}
      </p>
      <StatusBadge :status="transaction.status" />
    </div>

    <p
      v-if="transaction.status === 'declined' && transaction.declineReason"
      class="rounded-md bg-danger-soft px-3 py-2 text-sm text-danger"
    >
      <span class="font-md">Declined:</span> {{ transaction.declineReason }}
    </p>
    <p
      v-else-if="transaction.status === 'pending'"
      class="rounded-md bg-warning-soft px-3 py-2 text-sm text-warning"
    >
      This transaction hasn't settled yet. The amount may still change.
    </p>

    <dl class="divide-y divide-border text-sm">
      <div
        v-for="row in transactionDetailRows(transaction)"
        :key="row.label"
        class="flex flex-col gap-0.5 py-2.5 sm:grid sm:grid-cols-[8rem_1fr] sm:gap-3"
      >
        <dt class="text-muted">{{ row.label }}</dt>
        <dd
          class="min-w-0 wrap-break-word text-foreground"
          :class="row.mono && 'font-mono text-xs'"
        >
          {{ row.value }}
        </dd>
      </div>
    </dl>
  </div>
</template>

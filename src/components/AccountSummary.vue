<script setup>
import { useAccountQuery } from '@/queries/account'
import { formatMoney } from '@/helpers/utils'
import BaseCard from '@/components/BaseCard.vue'
import SkeletonBlock from '@/components/SkeletonBlock.vue'

const { data: account, isPending, isError, isFetching, refetch } = useAccountQuery()
</script>

<template>
  <BaseCard padded aria-label="Account summary">
    <div v-if="isPending" class="flex flex-wrap gap-x-10 gap-y-4">
      <span class="sr-only">Loading account…</span>
      <div v-for="width in ['w-48', 'w-32', 'w-12']" :key="width" class="flex flex-col gap-2">
        <SkeletonBlock class="h-3 w-20" />
        <SkeletonBlock class="h-6" :class="width" />
      </div>
    </div>

    <div v-else-if="isError" class="flex items-center gap-3 text-sm">
      <span class="text-danger">Couldn't load account.</span>
      <button
        type="button"
        class="rounded-md border border-border px-3 py-1 font-md hover:bg-background disabled:opacity-60"
        :disabled="isFetching"
        @click="refetch()"
      >
        {{ isFetching ? 'Retrying…' : 'Retry' }}
      </button>
    </div>

    <dl v-else class="flex flex-wrap gap-x-10 gap-y-4">
      <div>
        <dt class="text-xs text-muted">Account name</dt>
        <dd class="text-lg font-md">{{ account.name }}</dd>
      </div>
      <div>
        <dt class="text-xs text-muted">Current balance</dt>
        <dd class="text-xl font-xl tabular-nums">
          {{ formatMoney(account.balance, account.currency) }}
        </dd>
      </div>
      <div>
        <dt class="text-xs text-muted">Currency</dt>
        <dd class="text-lg font-md">{{ account.currency }}</dd>
      </div>
    </dl>
  </BaseCard>
</template>

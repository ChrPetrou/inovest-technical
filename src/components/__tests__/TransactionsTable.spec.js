import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import TransactionsTable from '../TransactionsTable.vue'

const transaction = {
  id: 'txn_1',
  merchant: 'Netflix',
  date: '2026-09-27T12:00:00Z',
  amount: 13.99,
  currency: 'EUR',
  type: 'debit',
  status: 'completed',
  category: 'Entertainment',
}

function mountTable(props = {}) {
  return mount(TransactionsTable, { props: { title: 'Recent transactions', ...props } })
}

describe('TransactionsTable', () => {
  it('shows a loading state and no count while loading', () => {
    const wrapper = mountTable({ loading: true })
    expect(wrapper.text()).toContain('Loading transactions')
    expect(wrapper.text()).not.toContain('Showing')
  })

  it('shows an error with a retry button that emits retry', async () => {
    const wrapper = mountTable({ error: true })
    expect(wrapper.text()).toContain("Couldn't load transactions.")
    await wrapper.get('button').trigger('click')
    expect(wrapper.emitted('retry')).toHaveLength(1)
  })

  it('tells "no transactions at all" apart from "nothing matches the filters"', async () => {
    expect(mountTable({ transactions: [], totalCount: 0 }).text()).toContain('No transactions yet.')

    const filtered = mountTable({ transactions: [], totalCount: 25 })
    expect(filtered.text()).toContain('No transactions match your filters.')
    await filtered.get('button').trigger('click')
    expect(filtered.emitted('clear-filters')).toHaveLength(1)
  })

  it('renders rows with a signed amount and the count', () => {
    const wrapper = mountTable({ transactions: [transaction], totalCount: 3 })
    expect(wrapper.text()).toContain('Showing 1 of 3')
    expect(wrapper.text()).toContain('Netflix')
    expect(wrapper.text()).toContain('−€13.99')
  })

  it('emits select with the transaction from both the table row and the mobile card', async () => {
    const wrapper = mountTable({ transactions: [transaction], totalCount: 1 })

    await wrapper.get('tbody tr').trigger('click')
    await wrapper.get('tbody tr').trigger('keydown', { key: 'Enter' })
    await wrapper.get('ul button').trigger('click')

    expect(wrapper.emitted('select')).toEqual([[transaction], [transaction], [transaction]])
  })
})

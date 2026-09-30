import { describe, expect, it } from 'vitest'
import {
  amountClass,
  applyFilters,
  clearFilters,
  DEFAULT_FILTERS,
  filterTransactions,
  formatDate,
  formatMoney,
  hasActiveFilters,
  signedAmount,
  sortTransactions,
  statusClass,
  transactionDetailRows,
} from '../utils'

const tx = (overrides) => ({
  id: 'txn',
  merchant: 'Wolt',
  date: '2026-09-20T12:00:00Z',
  amount: 10,
  currency: 'EUR',
  type: 'debit',
  status: 'completed',
  ...overrides,
})

const transactions = [
  tx({ id: 'a', merchant: 'Wolt', date: '2026-09-26T12:00:00Z', amount: 22.4, status: 'declined' }),
  tx({ id: 'b', merchant: 'Acme', date: '2026-09-28T12:00:00Z', amount: 3250, type: 'credit' }),
  tx({ id: 'c', merchant: 'Wolt', date: '2026-09-27T12:00:00Z', amount: 22.4 }),
  tx({ id: 'd', merchant: 'Shell', date: '2026-09-19T12:00:00Z', amount: 58.2, status: 'pending' }),
]

const ids = (list) => list.map((t) => t.id)

describe('money formatting', () => {
  it('formats each amount in its own currency', () => {
    expect(formatMoney(4862.37, 'EUR')).toBe('€4,862.37')
    expect(formatMoney(89.5, 'USD')).toBe('US$89.50')
    expect(formatMoney(342, 'GBP')).toBe('£342.00')
  })

  it('always shows two decimal places, hiding floating-point noise', () => {
    expect(formatMoney(0.1 + 0.2, 'EUR')).toBe('€0.30')
  })

  it('signs credits with + and debits with a real minus sign', () => {
    expect(signedAmount(tx({ amount: 3250, type: 'credit' }))).toBe('+€3,250.00')
    expect(signedAmount(tx({ amount: 64.18, type: 'debit' }))).toBe('−€64.18')
  })

  it('colours credits, and strikes through declined amounts whatever their type', () => {
    expect(amountClass(tx({ type: 'credit' }))).toBe('text-success')
    expect(amountClass(tx({ type: 'debit' }))).toBe('text-foreground')
    expect(amountClass(tx({ type: 'credit', status: 'declined' }))).toBe('text-muted line-through')
  })
})

describe('formatDate', () => {
  it('formats an ISO date for display', () => {
    expect(formatDate('2026-09-28T12:00:00Z')).toMatch(/^28 Sept? 2026$/)
  })
})

describe('filterTransactions', () => {
  it('returns everything when no filter is set', () => {
    expect(filterTransactions(transactions, DEFAULT_FILTERS)).toHaveLength(4)
  })

  it('filters by merchant, status and type', () => {
    expect(ids(filterTransactions(transactions, { merchant: 'Wolt' }))).toEqual(['a', 'c'])
    expect(ids(filterTransactions(transactions, { status: 'pending' }))).toEqual(['d'])
    expect(ids(filterTransactions(transactions, { type: 'credit' }))).toEqual(['b'])
  })

  it('combines filters with AND', () => {
    expect(ids(filterTransactions(transactions, { merchant: 'Wolt', status: 'declined' }))).toEqual(
      ['a'],
    )
    expect(filterTransactions(transactions, { merchant: 'Acme', type: 'debit' })).toEqual([])
  })
})

describe('sortTransactions', () => {
  it('sorts by date in both directions', () => {
    expect(ids(sortTransactions(transactions, 'date-desc'))).toEqual(['b', 'c', 'a', 'd'])
    expect(ids(sortTransactions(transactions, 'date-asc'))).toEqual(['d', 'a', 'c', 'b'])
  })

  it('sorts by amount in both directions', () => {
    expect(ids(sortTransactions(transactions, 'amount-desc'))[0]).toBe('b')
    expect(ids(sortTransactions(transactions, 'amount-asc')).slice(-1)).toEqual(['b'])
  })

  it('does not mutate the original array', () => {
    const before = ids(transactions)
    sortTransactions(transactions, 'amount-asc')
    expect(ids(transactions)).toEqual(before)
  })
})

describe('filter state helpers', () => {
  it('applyFilters filters then sorts', () => {
    expect(ids(applyFilters(transactions, { ...DEFAULT_FILTERS, merchant: 'Wolt' }))).toEqual([
      'c',
      'a',
    ])
  })

  it('clearFilters resets the filters but keeps the sort order', () => {
    const filters = { merchant: 'Wolt', status: 'pending', type: 'debit', sort: 'amount-asc' }
    expect(clearFilters(filters)).toEqual({ ...DEFAULT_FILTERS, sort: 'amount-asc' })
  })

  it('hasActiveFilters ignores the sort order', () => {
    expect(hasActiveFilters({ ...DEFAULT_FILTERS, sort: 'amount-asc' })).toBe(false)
    expect(hasActiveFilters({ ...DEFAULT_FILTERS, status: 'declined' })).toBe(true)
  })
})

describe('display helpers', () => {
  it('falls back to a neutral style for unknown statuses', () => {
    expect(statusClass('pending')).toContain('text-warning')
    expect(statusClass('reversed')).toBe('bg-background text-muted')
  })

  it('leaves empty fields out of the detail rows', () => {
    const labels = transactionDetailRows(tx({ location: null, reference: 'REF-1' })).map(
      (row) => row.label,
    )
    expect(labels).toContain('Reference')
    expect(labels).not.toContain('Location')
  })
})

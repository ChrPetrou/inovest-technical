export function formatMoney(amount, currency, locale = 'en-GB') {
  return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(amount)
}

export function formatDate(iso, locale = 'en-GB') {
  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(iso))
}

export function formatTime(iso, locale = 'en-GB') {
  return new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit' }).format(
    new Date(iso),
  )
}

export function signedAmount(transaction) {
  const formatted = formatMoney(transaction.amount, transaction.currency)
  return transaction.type === 'credit' ? `+${formatted}` : `−${formatted}`
}

export function amountClass(transaction) {
  if (transaction.status === 'declined') return 'text-muted line-through'
  return transaction.type === 'credit' ? 'text-success' : 'text-foreground'
}

export const DEFAULT_FILTERS = Object.freeze({
  merchant: '',
  status: '',
  type: '',
  sort: 'date-desc',
})

export function clearFilters(filters) {
  return { ...DEFAULT_FILTERS, sort: filters.sort }
}

export function hasActiveFilters(filters) {
  return Boolean(filters.merchant || filters.status || filters.type)
}

export function filterTransactions(transactions, { merchant, status, type }) {
  return transactions.filter(
    (t) =>
      (!merchant || t.merchant === merchant) &&
      (!status || t.status === status) &&
      (!type || t.type === type),
  )
}

export function sortTransactions(transactions, sort) {
  const [field, direction] = sort.split('-')
  const factor = direction === 'asc' ? 1 : -1
  const value = (t) => (field === 'amount' ? t.amount : new Date(t.date).getTime())
  return [...transactions].sort((a, b) => (value(a) - value(b)) * factor)
}

export function applyFilters(transactions, filters) {
  return sortTransactions(filterTransactions(transactions, filters), filters.sort)
}

export function headerClass(column, index, columnCount) {
  const edge = index === 0 || index === columnCount - 1
  return [edge ? 'px-5 sm:px-6' : 'px-3', column.align === 'right' ? 'text-right' : 'text-left']
}

const STATUS_CLASSES = Object.freeze({
  completed: 'bg-success-soft text-success',
  pending: 'bg-warning-soft text-warning',
  declined: 'bg-danger-soft text-danger',
})

export function statusClass(status) {
  return STATUS_CLASSES[status] ?? 'bg-background text-muted'
}

export function formatDateTime(iso, locale = 'en-GB') {
  return `${formatDate(iso, locale)}, ${formatTime(iso, locale)}`
}

function capitalize(value) {
  return value ? value[0].toUpperCase() + value.slice(1) : value
}

export function transactionDetailRows(transaction) {
  return [
    { label: 'Date', value: formatDateTime(transaction.date) },
    { label: 'Type', value: capitalize(transaction.type) },
    { label: 'Currency', value: transaction.currency },
    { label: 'Category', value: transaction.category },
    { label: 'Description', value: transaction.description },
    { label: 'Payment method', value: transaction.paymentMethod },
    { label: 'Location', value: transaction.location },
    { label: 'Reference', value: transaction.reference, mono: true },
    { label: 'Transaction ID', value: transaction.id, mono: true },
  ].filter((row) => row.value)
}

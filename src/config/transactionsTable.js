// Column headings for the transactions table, in display order.
// `key` matches the transaction field; `align` sets the text alignment.
export const TRANSACTION_COLUMNS = Object.freeze([
  { key: 'merchant', label: 'Merchant', align: 'left' },
  { key: 'date', label: 'Date', align: 'left' },
  { key: 'type', label: 'Type', align: 'left' },
  { key: 'status', label: 'Status', align: 'left' },
  { key: 'amount', label: 'Amount', align: 'right' },
  { key: 'currency', label: 'Currency', align: 'left' },
])

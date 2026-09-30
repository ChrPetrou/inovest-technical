// `key` is the field in the filters object; `optionsKey` is the list in filters.json.
// `allLabel` adds a "no filter" first option; leave it out for required fields like sort.
export const TRANSACTION_FILTERS = Object.freeze([
  { key: 'merchant', label: 'Merchant', allLabel: 'All merchants', optionsKey: 'merchants' },
  { key: 'status', label: 'Status', allLabel: 'All statuses', optionsKey: 'statuses' },
  { key: 'type', label: 'Type', allLabel: 'Credit & debit', optionsKey: 'types' },
  { key: 'sort', label: 'Sort by', optionsKey: 'sortOptions' },
])

import { useQuery } from '@tanstack/vue-query'
import { TransactionApiAgent } from '@/services/apiAgent'

export function useTransactionsQuery() {
  return useQuery({
    queryKey: ['transactions'],
    queryFn: TransactionApiAgent.getAll,
  })
}

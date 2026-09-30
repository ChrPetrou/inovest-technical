import { useQuery } from '@tanstack/vue-query'
import { AccountApiAgent } from '@/services/apiAgent'

export function useAccountQuery() {
  return useQuery({
    queryKey: ['account'],
    queryFn: AccountApiAgent.get,
  })
}

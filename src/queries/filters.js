import { useQuery } from '@tanstack/vue-query'
import { FilterApiAgent } from '@/services/apiAgent'

export function useFilterOptionsQuery() {
  return useQuery({
    queryKey: ['filter-options'],
    queryFn: FilterApiAgent.getOptions,
    staleTime: Infinity,
  })
}

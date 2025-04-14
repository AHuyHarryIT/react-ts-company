import { useQuery } from '@tanstack/react-query';

import { QueryParams } from '@/types/queryParams';
import { CrudServiceType } from '@utils/crudService';

interface UseCrudListProps<TData, TCreateDto, TUpdateDto> {
  service: CrudServiceType<TData, TCreateDto, TUpdateDto>;
  queryKey: string;
  initialFilters?: QueryParams;
  enabled?: boolean;
}

export function useCrudList<TData, TCreateDto, TUpdateDto>({
  service,
  queryKey,
  initialFilters = {},
  enabled = true
}: UseCrudListProps<TData, TCreateDto, TUpdateDto>) {
  const queryResult = useQuery({
    queryKey: [queryKey, initialFilters],
    queryFn: () => service.list(initialFilters),
    enabled
  });

  const { data: response } = queryResult;

  return {
    data: response?.data || [],
    pagination: {
      current: response?.current_page,
      total: response?.total,
      pageSize: response?.per_page
    },
    queryResult
  };
}

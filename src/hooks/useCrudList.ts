import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { QueryParams } from '@/types/queryParams';
import { CrudServiceType } from '@utils/crudService';

interface UseCrudListProps<TData, TCreateDto, TUpdateDto> {
  service: CrudServiceType<TData, TCreateDto, TUpdateDto>;
  queryKey: string;
  initialFilters?: QueryParams;
  enabled?: boolean;
  isTrash?: boolean;
}

export function useCrudList<TData, TCreateDto, TUpdateDto>({
  service,
  queryKey,
  initialFilters = {},
  enabled = true,
  isTrash = false
}: UseCrudListProps<TData, TCreateDto, TUpdateDto>) {
  const queryResult = useQuery({
    queryKey: [queryKey, initialFilters, isTrash],
    queryFn: async () =>
      isTrash
        ? await service.listTrash(initialFilters)
        : await service.list(initialFilters),
    enabled,
    // Giữ data cũ hiển thị khi filter/search/paginate → không bị nhấp nháy trắng
    placeholderData: keepPreviousData
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

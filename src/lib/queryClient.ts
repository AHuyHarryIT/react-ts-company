import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // 30s staleTime: khi navigate lại trong 30s → show cache ngay + refetch ngầm
      // Sau 30s → refetch ngay khi mount (vẫn show cache cũ trong lúc đợi)
      staleTime: 30 * 1000,
      // 10 phút giữ cache trong memory → chuyển tab quay lại có data hiển thị ngay
      gcTime: 10 * 60 * 1000,
      // Chỉ retry 1 lần thay vì 3 (default) → giảm thời gian chờ khi lỗi
      retry: 1,
      // Khi focus lại window → refetch để đảm bảo data mới nhất (multi-user)
      refetchOnWindowFocus: true
    }
  }
});

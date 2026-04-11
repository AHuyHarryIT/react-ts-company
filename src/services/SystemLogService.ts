import axiosPrivate from '@/api/axiosInstance';
import { ApiResponse } from '@/types/apiType';

class SystemLogService {
  /**
   * Lấy danh sách log hệ thống (từ laravel.log)
   */
  async getSystemLogs(): Promise<ApiResponse<string>> {
    const response = await axiosPrivate.get('/api/logs/system');
    return response as unknown as ApiResponse<string>;
  }

  /**
   * Lấy log dữ liệu (Data/User Error Logs từ Database)
   */
  async getLogs(): Promise<ApiResponse<unknown>> {
    const response = await axiosPrivate.get('/api/logs');
    return response as unknown as ApiResponse<unknown>;
  }

  /**
   * Xoá tất cả log dữ liệu (Data/User Error Logs)
   */
  async clearAllDataLogs(): Promise<ApiResponse<null>> {
    const response = await axiosPrivate.post('/api/logs/delete-all');
    return response as unknown as ApiResponse<null>;
  }

  /**
   * Xóa toàn bộ nội dung file laravel.log
   */
  async clearSystemLogs(): Promise<ApiResponse<null>> {
    const response = await axiosPrivate.delete('/api/logs/system/clear');
    return response as unknown as ApiResponse<null>;
  }
}

export const systemLogService = new SystemLogService();

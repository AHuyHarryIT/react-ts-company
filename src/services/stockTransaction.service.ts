import {
  ScanRequest,
  ScanResponse,
  ScanInResponse,
  ScanOutResponse,
  TransactionListParams,
  TransactionListResponse,
  StatisticsResponse,
  StockTransaction,
  ApiErrorResponse
} from '../types/stockTransaction.types';
import axiosPrivate from '../api/axiosInstance';

export class StockTransactionService {
  private static baseUrl = '/api/stock-transactions';

  /**
   * Scan barcode để nhập kho tự động
   */
  static async scanIn(
    data: ScanRequest
  ): Promise<ScanInResponse | ApiErrorResponse> {
    try {
      const response = await axiosPrivate.post(`${this.baseUrl}/scan-in`, data);

      // Check if backend returns new format: {success, message, data}
      if (
        response.data &&
        typeof response.data === 'object' &&
        'success' in response.data
      ) {
        // New format - handle it
        if (response.data.success === false) {
          return response.data; // Return error response as-is
        }

        return {
          success: response.data.success,
          message: response.data.message,
          data: response.data.data
        };
      } else {
        // Old format - backend returns transaction data directly
        // Parse barcode to get barcode_info
        const barcodeInfo = this.parseBarcodeInfo(data.barcode);

        // Wrap it in expected format for components
        return {
          success: true,
          message: 'Nhập kho thành công',
          data: {
            transaction: response.data,
            quantity_entered: response.data.quantity,
            barcode_info: barcodeInfo
          }
        };
      }
    } catch (error: unknown) {
      console.error(
        'API scanIn Error:',
        (error as { response?: { data?: { message?: string } } }).response?.data
          ?.message || (error as Error).message
      );
      return this.handleError(error);
    }
  }

  /**
   * Scan barcode để xuất kho toàn bộ thùng
   */
  static async scanOut(
    data: ScanRequest
  ): Promise<ScanOutResponse | ApiErrorResponse> {
    try {
      const response = await axiosPrivate.post(
        `${this.baseUrl}/scan-out`,
        data
      );

      // Check if backend returns new format: {success, message, data}
      if (
        response.data &&
        typeof response.data === 'object' &&
        'success' in response.data
      ) {
        // New format - handle it
        if (response.data.success === false) {
          return response.data; // Return error response as-is
        }

        return {
          success: response.data.success,
          message: response.data.message,
          data: response.data.data
        };
      } else {
        // Old format - backend returns transaction data directly
        // Parse barcode to get barcode_info
        const barcodeInfo = this.parseBarcodeInfo(data.barcode);

        // Wrap it in expected format for components
        return {
          success: true,
          message: 'Xuất kho thành công',
          data: {
            transaction: response.data,
            quantity_exported: response.data.quantity,
            barcode_info: barcodeInfo
          }
        };
      }
    } catch (error: unknown) {
      console.error(
        'API scanOut Error:',
        (error as { response?: { data?: { message?: string } } }).response?.data
          ?.message || (error as Error).message
      );
      return this.handleError(error);
    }
  }

  /**
   * Scan barcode để kiểm tra thông tin (không thực hiện giao dịch)
   */
  static async scan(
    data: ScanRequest
  ): Promise<ScanResponse | ApiErrorResponse> {
    try {
      const response = await axiosPrivate.post(`${this.baseUrl}/scan`, data);
      console.log('API scan - Full Response:', response.data);

      // Check if backend returns new format: {success, message, data}
      if (
        response.data &&
        typeof response.data === 'object' &&
        'success' in response.data
      ) {
        // New format - handle it
        if (response.data.success === false) {
          return response.data; // Return error response as-is
        }

        return {
          success: response.data.success,
          message: response.data.message,
          data: response.data.data
        };
      } else {
        // Old format - backend returns storage_product data directly
        // Parse barcode to get barcode_info
        const barcodeInfo = this.parseBarcodeInfo(data.barcode);

        // Wrap it in expected format for components
        return {
          success: true,
          message: 'Scan barcode thành công',
          data: {
            storage_product: response.data,
            barcode_info: barcodeInfo
          }
        };
      }
    } catch (error: unknown) {
      return this.handleError(error);
    }
  }

  /**
   * Lấy danh sách giao dịch với filter
   */
  static async getTransactions(
    params?: TransactionListParams
  ): Promise<TransactionListResponse | ApiErrorResponse> {
    try {
      console.log('Making API call to:', this.baseUrl, 'with params:', params);
      const response = await axiosPrivate.get<TransactionListResponse>(
        this.baseUrl,
        { params }
      );
      console.log('API response:', response.data);
      return response.data;
    } catch (error: unknown) {
      console.error('API error:', error);
      return this.handleError(error);
    }
  }

  /**
   * Lấy chi tiết giao dịch theo ID
   */
  static async getTransactionDetail(
    id: number
  ): Promise<{ success: boolean; data: StockTransaction } | ApiErrorResponse> {
    try {
      const response = await axiosPrivate.get<{
        success: boolean;
        data: StockTransaction;
      }>(`${this.baseUrl}/${id}`);
      return response.data;
    } catch (error: unknown) {
      return this.handleError(error);
    }
  }

  /**
   * Lấy thống kê giao dịch và current stock data
   */
  static async getStatistics(
    fromDate?: string,
    toDate?: string,
    limit: number = 100
  ): Promise<StatisticsResponse | ApiErrorResponse> {
    try {
      const params: Record<string, unknown> = {
        limit: limit // Use limit for current stock items
      };
      if (fromDate) params.from_date = fromDate;
      if (toDate) params.to_date = toDate;

      console.log('API Statistics params:', params);
      const response = await axiosPrivate.get(`${this.baseUrl}/statistics`, {
        params
      });
      console.log('API Statistics full response:', response.data);

      // Check if it's an error response (has success field)
      if (response.data?.success === false) {
        return response.data; // Return error response as-is
      }

      // Backend returns data directly: {summary, top_products}
      // Wrap it in expected format
      return {
        success: true,
        data: response.data
      };
    } catch (error: unknown) {
      return this.handleError(error);
    }
  }

  /**
   * Lấy tình trạng tồn kho hiện tại
   */
  static async getCurrentStock(
    productId?: number,
    lot?: string,
    showEmpty?: boolean,
    limit?: number
  ): Promise<unknown> {
    try {
      const params: Record<string, unknown> = {};
      if (productId) params.product_id = productId;
      if (lot) params.lot = lot;
      if (showEmpty !== undefined) params.show_empty = showEmpty;
      if (limit) params.limit = limit;

      console.log('API Current Stock params:', params);
      const response = await axiosPrivate.get(`${this.baseUrl}/current-stock`, {
        params
      });
      console.log('API Current Stock full response:', response.data);

      // Backend returns: {success, message, data}
      if (response.data?.success === false) {
        return response.data; // Return error response as-is
      }

      // Return success response with proper structure
      return {
        success: response.data.success,
        message: response.data.message,
        data: response.data.data
      };
    } catch (error: unknown) {
      return this.handleError(error);
    }
  }

  /**
   * Parse barcode để lấy thông tin
   */
  static parseBarcodeInfo(barcode: string) {
    try {
      // Format: {product_id}{separator}{ddmmyyyy}{shift}{bin_number}
      // Ví dụ: 39a101020251006

      // Tìm separator (ký tự không phải số đầu tiên)
      const separatorMatch = barcode.match(/[^0-9]/);
      if (!separatorMatch) {
        throw new Error('Không tìm thấy separator trong barcode');
      }

      const separatorIndex = separatorMatch.index!;
      const separator = separatorMatch[0];

      const productId = barcode.substring(0, separatorIndex);
      const remainingPart = barcode.substring(separatorIndex + 1);

      // 8 ký tự đầu là ngày (ddmmyyyy)
      const date = remainingPart.substring(0, 8);
      // 1 ký tự tiếp theo là shift
      const shift = remainingPart.substring(8, 9);
      // Phần còn lại là bin number
      const binNumber = remainingPart.substring(9);

      // Validate
      if (!productId || !date || !shift || !binNumber) {
        throw new Error('Format barcode không đúng');
      }

      if (date.length !== 8) {
        throw new Error('Ngày tháng phải có 8 ký tự (ddmmyyyy)');
      }

      return {
        product_id: parseInt(productId),
        separator,
        date,
        shift: parseInt(shift),
        bin_number: parseInt(binNumber),
        lot_code: `${separator.toUpperCase()}-${date}-${shift}`
      };
    } catch (error) {
      throw new Error(`Lỗi parse barcode: ${error}`);
    }
  }

  /**
   * Validate barcode format
   */
  static validateBarcode(barcode: string): {
    isValid: boolean;
    error?: string;
  } {
    try {
      this.parseBarcodeInfo(barcode);
      return { isValid: true };
    } catch (error: unknown) {
      return { isValid: false, error: (error as Error).message };
    }
  }

  /**
   * Format date để hiển thị
   */
  static formatDisplayDate(dateString: string): string {
    // dateString format: ddmmyyyy
    if (dateString.length !== 8) return dateString;

    const day = dateString.substring(0, 2);
    const month = dateString.substring(2, 4);
    const year = dateString.substring(4, 8);

    return `${day}/${month}/${year}`;
  }

  /**
   * Generate example barcode
   */
  static generateExampleBarcode(): string {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = String(now.getFullYear());
    const shift = '1';
    const binNumber = '001';

    return `39a${day}${month}${year}${shift}${binNumber}`;
  }

  /**
   * Handle API errors
   */
  private static handleError(error: unknown): ApiErrorResponse {
    const axiosError = error as { response?: { data?: unknown } };
    if (axiosError.response?.data) {
      return axiosError.response.data as ApiErrorResponse;
    }

    return {
      success: false,
      message: (error as Error).message || 'Có lỗi xảy ra khi gọi API',
      data: error
    };
  }
}

export default StockTransactionService;

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
   * POST /api/stock-transactions/scan-in
   * Optimized: minimal processing, no client-side barcode parsing
   */
  static async scanIn(
    data: ScanRequest
  ): Promise<ScanInResponse | ApiErrorResponse> {
    try {
      const body = (await axiosPrivate.post(
        `${this.baseUrl}/scan-in`,
        data
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      )) as any;

      // BE always returns {success, message, data} or throws error
      if (body?.success === false) return body;
      return {
        success: true,
        message: body?.message || 'Nhập kho thành công',
        data: body?.data || {
          transaction: body,
          quantity_entered: body?.quantity
        }
      };
    } catch (error: unknown) {
      return this.handleError(error);
    }
  }

  /**
   * Scan barcode để xuất kho toàn bộ thùng
   * POST /api/stock-transactions/scan-out
   */
  static async scanOut(
    data: ScanRequest
  ): Promise<ScanOutResponse | ApiErrorResponse> {
    try {
      const body = (await axiosPrivate.post(
        `${this.baseUrl}/scan-out`,
        data
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      )) as any;

      if (body?.success === false) return body;
      return {
        success: true,
        message: body?.message || 'Xuất kho thành công',
        data: body?.data || {
          transaction: body,
          quantity_exported: body?.quantity
        }
      };
    } catch (error: unknown) {
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
      const body = (await axiosPrivate.post(
        `${this.baseUrl}/scan`,
        data
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      )) as any;

      if (body && typeof body === 'object' && 'success' in body) {
        if (body.success === false) return body;
        return {
          success: body.success,
          message: body.message,
          data: body.data
        };
      }

      const barcodeInfo = this.parseBarcodeInfo(data.barcode);
      return {
        success: true,
        message: 'Scan barcode thành công',
        data: {
          storage_product: body,
          barcode_info: barcodeInfo
        }
      };
    } catch (error: unknown) {
      return this.handleError(error);
    }
  }

  /**
   * Lấy danh sách giao dịch với filter
   * Backend may return: {success, data: {current_page, data: [...], ...}}
   * or directly: {current_page, data: [...], ...}
   */
  static async getTransactions(
    params?: TransactionListParams
  ): Promise<TransactionListResponse | ApiErrorResponse> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const body = (await axiosPrivate.get(this.baseUrl, { params })) as any;

      // If backend wraps in {success, data} envelope, unwrap it
      if (body && typeof body === 'object' && 'success' in body) {
        if (body.success === false) return body;
        // body.data is the actual paginated response
        return body.data;
      }

      // Direct paginated response
      return body;
    } catch (error: unknown) {
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const body = (await axiosPrivate.get(`${this.baseUrl}/${id}`)) as any;

      if (body && typeof body === 'object' && 'success' in body) {
        if (body.success === false) return body;
        return body;
      }

      return { success: true, data: body };
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
      const params: Record<string, unknown> = { limit };
      if (fromDate) params.from_date = fromDate;
      if (toDate) params.to_date = toDate;

      const body = (await axiosPrivate.get(`${this.baseUrl}/statistics`, {
        params
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      })) as any;

      if (body && typeof body === 'object' && 'success' in body) {
        if (body.success === false) return body;
        // Backend wraps: {success, data: {summary, top_products}}
        return { success: true, data: body.data };
      }

      // Direct format: {summary, top_products}
      return { success: true, data: body };
    } catch (error: unknown) {
      return this.handleError(error);
    }
  }

  /**
   * Lấy tình trạng tồn kho hiện tại
   * GET /api/stock-transactions/current-stock
   */
  static async getCurrentStock(
    productId?: number,
    lot?: string,
    _showEmpty?: boolean,
    limit?: number
  ): Promise<unknown> {
    try {
      const params: Record<string, unknown> = {};
      if (productId) params.product_id = productId;
      if (lot) params.lot = lot;
      if (limit) params.limit = limit;
      // Note: show_empty is handled client-side (BE doesn't support this param)

      const body = (await axiosPrivate.get(`${this.baseUrl}/current-stock`, {
        params
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      })) as any;

      if (body && typeof body === 'object' && 'success' in body) {
        if (body.success === false) return body;
        return {
          success: body.success,
          message: body.message,
          data: body.data
        };
      }

      return { success: true, message: 'OK', data: body };
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

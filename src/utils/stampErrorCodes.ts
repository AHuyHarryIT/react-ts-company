/**
 * Stamp Request Error Codes - Vietnamese Messages
 *
 * This file contains all error message handlers for stamp request validation.
 * Backend returns error codes with params instead of direct messages.
 */

interface ErrorParams {
  [key: string]: string | number | unknown;
}

type ErrorMessageFunction = (params: ErrorParams) => string;

/**
 * Format range display helper
 * Returns "Tem X" if single stamp, "Tem X-Y" if range
 */
const formatRange = (first: number, last: number): string => {
  return first === last ? `Tem ${first}` : `Tem ${first}-${last}`;
};

/**
 * Vietnamese error messages for stamp validation
 */
export const STAMP_ERROR_MESSAGES_VI: Record<string, ErrorMessageFunction> = {
  /**
   * STAMP_BINSTART_INVALID_FORMAT
   * Invalid format in binStart field (must be positive integers or comma-separated list)
   */
  STAMP_BINSTART_INVALID_FORMAT: (params: ErrorParams) =>
    `Giá trị '${params.invalidValue}' trong '${params.binStart}' không hợp lệ. Chỉ chấp nhận số nguyên dương`,

  /**
   * STAMP_BATCH_DUPLICATE
   * Duplicate request in same batch (same product, date, shift, type, purpose, binStart)
   */
  STAMP_BATCH_DUPLICATE: (params: ErrorParams) =>
    `Yêu cầu này trùng với yêu cầu #${params.originalRequestNumber}. Vui lòng xóa yêu cầu trùng lặp`,

  /**
   * STAMP_NEW_MUST_START_FROM_ONE
   * When purpose is "new", must start from stamp #1
   */
  STAMP_NEW_MUST_START_FROM_ONE: (params: ErrorParams) =>
    `Khi chọn 'In mới' phải bắt đầu từ tem số 1 (bạn đang bắt đầu từ ${params.firstStamp})`,

  /**
   * STAMP_NEW_ALREADY_PRINTED
   * Stamps in "new" request were already printed before in same date/shift
   */
  STAMP_NEW_ALREADY_PRINTED: (params: ErrorParams) => {
    const userRange = formatRange(
      params.userRangeFirst as number,
      params.userRangeLast as number
    );
    const dupRange = formatRange(
      params.duplicateFirst as number,
      params.duplicateLast as number
    );
    const isSingleStamp = params.userRangeFirst === params.userRangeLast;

    const dateInfo = (params.dateDetails as Record<string, unknown>[])
      .map((d: Record<string, unknown>) => {
        const dateStamps = formatRange(
          d.stampFirst as number,
          d.stampLast as number
        );

        // Nếu có nhiều ca, hiển thị chi tiết với dấu -
        if (d.shifts && (d.shifts as unknown[]).length > 1) {
          const shiftDetails = (d.shifts as Record<string, unknown>[])
            .map(
              (s: Record<string, unknown>) =>
                `Ca ${s.shift}: ${formatRange(s.stampFirst as number, s.stampLast as number)}`
            )
            .join(', ');
          return isSingleStamp
            ? `đã in ${d.date} - ${shiftDetails}`
            : `${dateStamps} đã in ${d.date} - ${shiftDetails}`;
        } else {
          // Nếu chỉ 1 ca, không dùng dấu ngoặc đơn
          const shift =
            d.shift ||
            (d.shifts && (d.shifts as Record<string, unknown>[])[0]?.shift);
          return isSingleStamp
            ? `đã in ${d.date} Ca ${shift}`
            : `${dateStamps} đã in ${d.date} Ca ${shift}`;
        }
      })
      .join('; ');

    // Nếu chỉ có 1 tem thì không cần lặp lại "trong yêu cầu Tem X"
    if (isSingleStamp) {
      return `${dupRange} đã được in trước đó: ${dateInfo}. Vui lòng chọn 'In lại' hoặc 'In thêm' từ tem số ${params.nextStamp}`;
    }

    return `${dupRange} trong yêu cầu ${userRange} đã được in trước đó: ${dateInfo}. Vui lòng chọn 'In lại' hoặc 'In thêm' từ tem số ${params.nextStamp}`;
  },

  /**
   * STAMP_ADDITIONAL_NO_EXISTING_STAMPS
   * Selected "additional" but no stamps exist yet for this date/shift
   */
  STAMP_ADDITIONAL_NO_EXISTING_STAMPS: () =>
    `Chưa có tem nào được in trong ngày/ca này. Vui lòng chọn 'In mới' và bắt đầu từ tem số 1`,

  /**
   * STAMP_ADDITIONAL_ALREADY_PRINTED
   * Stamps in "additional" request were already printed before
   */
  STAMP_ADDITIONAL_ALREADY_PRINTED: (params: ErrorParams) => {
    const userRange = formatRange(
      params.userRangeFirst as number,
      params.userRangeLast as number
    );
    const dupRange = formatRange(
      params.duplicateFirst as number,
      params.duplicateLast as number
    );
    const isSingleStamp = params.userRangeFirst === params.userRangeLast;

    const dateInfo = (params.dateDetails as Record<string, unknown>[])
      .map((d: Record<string, unknown>) => {
        const dateStamps = formatRange(
          d.stampFirst as number,
          d.stampLast as number
        );

        // Nếu có nhiều ca, hiển thị chi tiết với dấu -
        if (d.shifts && (d.shifts as unknown[]).length > 1) {
          const shiftDetails = (d.shifts as Record<string, unknown>[])
            .map(
              (s: Record<string, unknown>) =>
                `Ca ${s.shift}: ${formatRange(s.stampFirst as number, s.stampLast as number)}`
            )
            .join(', ');
          return isSingleStamp
            ? `đã in ${d.date} - ${shiftDetails}`
            : `${dateStamps} đã in ${d.date} - ${shiftDetails}`;
        } else {
          // Nếu chỉ 1 ca, không dùng dấu ngoặc đơn
          const shift =
            d.shift ||
            (d.shifts && (d.shifts as Record<string, unknown>[])[0]?.shift);
          return isSingleStamp
            ? `đã in ${d.date} Ca ${shift}`
            : `${dateStamps} đã in ${d.date} Ca ${shift}`;
        }
      })
      .join('; ');

    // Nếu chỉ có 1 tem thì không cần lặp lại "trong yêu cầu Tem X"
    if (isSingleStamp) {
      return `${dupRange} đã được in trước đó: ${dateInfo}. Vui lòng chọn 'In lại' thay vì 'In thêm'`;
    }

    return `${dupRange} trong yêu cầu ${userRange} đã được in trước đó: ${dateInfo}. Vui lòng chọn 'In lại' thay vì 'In thêm'`;
  },

  /**
   * STAMP_ADDITIONAL_WRONG_START
   * When purpose is "additional", must start from next stamp after last printed
   */
  STAMP_ADDITIONAL_WRONG_START: (params: ErrorParams) =>
    `Khi chọn 'In thêm', phải bắt đầu từ tem số ${params.expectedStart} (tem cuối cùng là ${params.maxStamp}, bạn đang bắt đầu từ ${params.actualStart})`,

  /**
   * STAMP_ADDITIONAL_MIDDLE_ALREADY_PRINTED
   * In "additional" request, some middle stamps were already printed (not continuous)
   */
  STAMP_ADDITIONAL_MIDDLE_ALREADY_PRINTED: (params: ErrorParams) => {
    const range = formatRange(
      params.duplicateFirst as number,
      params.duplicateLast as number
    );
    return `${range} đã được in trước đó (tem đã có: 1-${params.maxStamp}). Vui lòng chọn 'In lại' thay vì 'In thêm'`;
  }
};

/**
 * Get error message by code and params
 *
 * @param errorCode - Error code from backend
 * @param params - Error parameters from backend
 * @param language - Language code ('vi' | 'en')
 * @returns Formatted error message
 */
export function getStampErrorMessage(
  errorCode: string,
  params: ErrorParams = {},
  language: 'vi' | 'en' = 'vi'
): string {
  const messageFunc = STAMP_ERROR_MESSAGES_VI[errorCode];

  if (messageFunc) {
    return messageFunc(params);
  }

  // Fallback for unknown error codes
  return language === 'vi'
    ? `Lỗi không xác định: ${errorCode}`
    : `Unknown error: ${errorCode}`;
}

/**
 * Check if error is an object with code and params structure
 */
export function isErrorCodeObject(
  error: unknown
): error is { code: string; params: ErrorParams } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof error.code === 'string'
  );
}

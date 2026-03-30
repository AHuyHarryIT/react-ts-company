import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button, Image, message, Modal, Radio } from 'antd';
import type { Dayjs } from 'dayjs';
import { useCallback, useRef, useState } from 'react';
import { useReactToPrint } from 'react-to-print';
import Barcode from 'react-barcode';

import { ProductType } from '@/types/productType';
import { saveStamp, checkDuplicateStamps } from '@services/StampService';
import { Shift } from '@/types/shift';
import logo from '@assets/images/logo/vvp02.png';
import { EmployeeType } from '@/types/employeeType';
import { useStampNotification } from '@hooks/useStampNotification';
import { usePrintShortcut } from '@hooks/usePrintShortcut';

interface PrintBoxStampProps {
  product: ProductType;
  startStamp: string | number;
  totalStamp: number;
  date: Dayjs;
  shift: Shift;
  employee_id?: EmployeeType['id'];
  stamp_id?: string;
  purpose?: 'new' | 'additional' | 'reprint';
}

export const PrintBoxStamp = ({
  product,
  startStamp,
  totalStamp,
  date,
  shift,
  employee_id,
  stamp_id,
  purpose
}: PrintBoxStampProps) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({ contentRef: contentRef });

  // State for print layout mode
  const [printMode, setPrintMode] = useState<'grid' | 'single'>('single');

  // Parse stamps list
  const originalStampList = (startStamp as string).split(',');

  // Parse and arrange stamps based on odd/even rule for grid mode
  const stampList =
    originalStampList.length > 1
      ? (() => {
          // Process comma-separated stamps - arrange odd/even for entire list
          const stamps = originalStampList.map((stamp) =>
            parseInt(stamp.trim())
          );

          // Separate all odd and even numbers first
          const oddNumbers = stamps
            .filter((num) => num % 2 === 1)
            .sort((a, b) => a - b);
          const evenNumbers = stamps
            .filter((num) => num % 2 === 0)
            .sort((a, b) => a - b);

          // Arrange with odd numbers first, then even numbers
          const arrangedStamps = [
            ...oddNumbers.map((n) => n.toString()),
            ...evenNumbers.map((n) => n.toString())
          ];

          return arrangedStamps;
        })()
      : originalStampList;

  const queryClient = useQueryClient();
  const { handleRemoveNotification } = useStampNotification();

  const { mutate } = useMutation({
    mutationKey: ['savePrintLog'],
    mutationFn: saveStamp,
    onSuccess: () => {
      message.success('In thành công');
      queryClient.invalidateQueries();
      if (stamp_id) handleRemoveNotification(stamp_id);
    },
    onError: () => {
      console.error('Error saving print log');
      message.error('Lỗi khi lưu nhật ký in');
    }
  });

  const { mutate: checkDuplicate } = useMutation({
    mutationKey: ['checkDuplicateStamps'],
    mutationFn: checkDuplicateStamps,
    onSuccess: (data) => {
      if (!data) {
        performPrint();
        return;
      }

      if (data.isDuplicate && data.duplicates && data.duplicates.length > 0) {
        const duplicateInfo = data.duplicates
          .map(
            (dup: { overlappingStamps: number[] }) =>
              `Tem số: ${dup.overlappingStamps.join(', ')}`
          )
          .join('\n');

        Modal.confirm({
          title: 'Cảnh báo: Phát hiện tem trùng lặp',
          content: (
            <div>
              <pre className="mt-2 rounded border border-yellow-200 bg-yellow-50 p-2 text-sm">
                {duplicateInfo}
              </pre>
              <p className="mt-2 font-semibold text-red-600">
                Bạn có chắc chắn muốn tiếp tục in các tem này không?
              </p>
            </div>
          ),
          okText: 'Tiếp tục in',
          cancelText: 'Hủy',
          okButtonProps: { danger: true },
          onOk: () => {
            performPrint();
          }
        });
      } else {
        performPrint();
      }
    },
    onError: (error) => {
      console.error('Error checking duplicates:', error);
      Modal.confirm({
        title: 'Lỗi kiểm tra trùng lặp',
        content: (
          <p>
            Không thể kiểm tra tem trùng lặp cho sản phẩm này.
            <br />
            <span className="font-semibold text-amber-600">
              Bạn có muốn tiếp tục in không?
            </span>
          </p>
        ),
        okText: 'Tiếp tục in',
        cancelText: 'Hủy',
        okButtonProps: { danger: true },
        onOk: () => performPrint()
      });
    }
  });

  const performPrint = useCallback(() => {
    handlePrint();
    mutate({
      productId: product.id,
      date: date.format('YYYY-MM-DD'),
      shift,
      binCount: totalStamp,
      binStart:
        originalStampList.length > 1
          ? originalStampList.slice(0, totalStamp).join(',')
          : stampList.slice(0, totalStamp).join(','),
      type: 'box',
      employee_id: employee_id,
      stamp_id: stamp_id,
      purpose: purpose
    });
  }, [
    originalStampList,
    stampList,
    date,
    handlePrint,
    mutate,
    product,
    shift,
    totalStamp,
    employee_id,
    stamp_id,
    purpose
  ]);

  const handleSavePrintLog = useCallback(() => {
    // Only check duplicates if no stamp_id (self-created stamp)
    if (!stamp_id) {
      checkDuplicate({
        product_id: String(product.id),
        date: date.format('YYYY-MM-DD'),
        shift: shift,
        binStart:
          originalStampList.length > 1
            ? originalStampList.slice(0, totalStamp).join(',')
            : stampList.slice(0, totalStamp).join(','),
        binCount: totalStamp,
        type: 'box'
      });
    } else {
      // If from history page, print directly
      performPrint();
    }
  }, [
    originalStampList,
    stampList,
    date,
    checkDuplicate,
    product,
    shift,
    totalStamp,
    stamp_id,
    performPrint
  ]);

  // Use the custom hook for print shortcut
  usePrintShortcut(handleSavePrintLog);

  // Helper function to format product name with line breaks at parentheses
  const formatProductName = (name: string) => {
    const parts = name
      .split(/(\([^)]*\))/g)
      .filter((part) => part.trim() !== '');
    return parts.map((part, index) => (
      <span key={index}>
        {part}
        {index < parts.length - 1 && <br />}
      </span>
    ));
  };

  // Helper function to render stamp table
  const renderStampTable = (stamp: number | null) => (
    <table className="has-barcode border border-black text-center text-[8.3px]">
      <colgroup>
        <col className="w-[80px]" />
        <col className="w-[140px]" />
        <col className="w-[80px]" />
        <col className="w-[50px]" />
        <col className="w-[100px]" />
        <col className="w-[20px]" />
      </colgroup>
      <tbody>
        <tr>
          <td>
            <Image
              src={logo}
              alt="logo"
              width={80}
              preview={false}
              title="VINH VINH PHAT ONE MEMBER CO.LTD"
            />
          </td>
          <td colSpan={5}>
            <div
              className="w-auto text-left text-[6px] break-words whitespace-normal"
              style={{ fontFamily: 'Arial, sans-serif' }}
            >
              VINH VINH PHAT ONE MEMBER CO., LTD
              <br />
              Address : 359 Ap Chien Luoc Street, Warter 2, Binh Hung Hoa Ward,
              Ho Chi Minh City
              <br />
              Factory : No. 2861, National Highway 1, Hamlet 3, Binh Chanh
              Commune, Ho Chi Minh City
              <br />
              Tel: 0283.620.4978 Fax: 0283.620.4978
              <br />
              Made in Viet Nam
            </div>
          </td>
        </tr>
        <tr>
          <td className="text-start">
            Tên sản phẩm
            <br />
            品名
          </td>
          <td colSpan={3}>
            <p
              className={`${product.name.length < 10 ? 'text-base' : 'text-sm'} font-bold`}
            >
              {formatProductName(product.name)}
            </p>
          </td>
          <td>CODE</td>
          <td>
            <p className="text-sm font-bold">{product.code}</p>
          </td>
        </tr>
        <tr>
          <td className="text-start">
            Nguyên liệu
            <br />
            原材料
          </td>
          <td colSpan={3} className="text-sm">
            <p> {product.material}</p>
          </td>
          <td>Màu sắc 色</td>
          <td className="text-sm">
            <p> {product.color}</p>
          </td>
        </tr>
        <tr>
          <td className="text-start">
            Lotno
            <br />
            ロット No
          </td>
          <td colSpan={5} className="text-sm font-bold">
            <div className="mx-1 flex items-center justify-between">
              <p>A</p>
              <p>-</p>
              <p>{date.format('DDMMYYYY')}</p>
              <p>-</p>
              <p>{shift}</p>
              <p>-</p>
              <p>
                {(() => {
                  if (stamp === null) return '';
                  return stamp.toString().padStart(3, '0');
                })()}
              </p>
            </div>
          </td>
        </tr>
        <tr className="h-8">
          <td className="py-0 text-start text-[8px] leading-tight">
            Mã vạch
            <br />
            バーコード
          </td>
          <td colSpan={5} className="px-0 py-0">
            <div className="flex items-center justify-center px-0 py-0">
              <Barcode
                className="max-w-[180px]"
                width={1.5}
                height={30}
                format="CODE128"
                displayValue={false}
                margin={2}
                fontSize={0}
                textMargin={0}
                background="#FFFFFF"
                lineColor="#000000"
                value={`${product.id}a${date.format('DDMMYYYY')}${shift}${(() => {
                  if (stamp === null) return '000';
                  return stamp.toString().padStart(3, '0');
                })()}`}
              />
            </div>
          </td>
        </tr>
        <tr>
          <td className="text-start">
            Số lượng
            <br />
            数量
          </td>
          <td colSpan={3}>
            <p className="text-sm font-bold">{product.quanEntityBin}PCS</p>
          </td>
          <td colSpan={2}>
            Kiểm tra (Xuất hàng)
            <br />
            検査 (出荷)
          </td>
        </tr>
        <tr>
          <td className="h-18 text-start">Mộc 合格印 200%</td>
          <td colSpan={3}></td>
          <td colSpan={2} rowSpan={2}>
            <div className="mx-auto h-14 w-8 border print:text-black"></div>
          </td>
        </tr>
        <tr>
          <td className="py-1 text-start text-[9px] leading-tight">
            Người kiểm 検査 200%
          </td>
          <td colSpan={3} className="text-start text-[9px]"></td>
        </tr>
        <tr>
          <td className="text-[6px]">(Thời gian) 時間</td>
          <td colSpan={5} className="pl-[17%] text-left text-[6px]">
            {date.format('DD/MM/YYYY')} {shift == 1 ? '07:30' : '19:30'}
          </td>
        </tr>
      </tbody>
    </table>
  );

  return (
    <>
      <style>
        {`
          .box-print-container td {
            border: 1px solid #232d42 !important;
            // padding: 2px !important;
          }
          .box-print-container table {
            border-collapse: collapse !important;
            ${printMode === 'single' ? 'width: 98mm !important; height: 78mm !important;' : ''}
          }

          @media print {
            .box-print-container {
              margin: 0 !important;
              padding: 0 !important;
              box-shadow: none !important;
            }
            @page {
              size: ${printMode === 'single' ? '100mm 80mm' : 'A4 landscape'} !important;
              margin: 0 !important;
            }
            ${
              printMode === 'single'
                ? `
            .stamp-item {
              width: 100vw !important;
              height: 100vh !important;
              display: flex !important;
              align-items: center !important;
              justify-content: center !important;
              page-break-after: always !important;
              position: relative !important;
            }
            .stamp-item table {
              width: 97mm !important;
              height: 77mm !important;
              transform: scale(0.98) !important;
              transform-origin: center center !important;
              margin: 0 auto !important;
            }
            .stamp-item table.has-barcode {
              width: 98mm !important;
              height: 78mm !important;
              transform: scale(0.96) !important;
              transform-origin: center center !important;
              margin: 0 auto !important;
            }
            `
                : `
            .grid-page {
              width: 100vw !important;
              height: 100vh !important;
              display: grid !important;
              grid-template-columns: repeat(3, 1fr) !important;
              grid-template-rows: repeat(2, 1fr) !important;
              gap: 15px !important;
              padding: 2px !important;
              page-break-after: always !important;
            }
            .grid-stamp-item {
              display: flex !important;
              align-items: center !important;
              justify-content: center !important;
            }
            .grid-stamp-item table {
              width: 100% !important;
              height: 100% !important;
              max-width: 98% !important;
              max-height: 98% !important;
            }
            `
            }
          }
        `}
      </style>
      <div className="mb-4 space-y-3">
        <div>
          <label className="mb-2 block text-sm font-medium">Chế độ in:</label>
          <Radio.Group
            value={printMode}
            onChange={(e) => setPrintMode(e.target.value)}
            className="flex gap-4"
          >
            <Radio value="single">In (100 x 80)</Radio>
            <Radio value="grid">In (A4)</Radio>
          </Radio.Group>
        </div>
        <div>
          <Button color="default" variant="solid" onClick={handleSavePrintLog}>
            Print
          </Button>
        </div>
      </div>
      <div
        ref={contentRef}
        className="box-print-container print:m-0 print:p-0 print:shadow-none"
      >
        {product && printMode === 'grid'
          ? // Grid layout: 6 stamps per page (3 cols x 2 rows) in A4 landscape
            (() => {
              // Calculate number of pages needed
              const numPages = (() => {
                if (originalStampList.length > 1) {
                  // For comma-separated stamps, calculate pages based on 3 odds + 3 evens per page
                  const allStamps = (startStamp as string)
                    .split(',')
                    .map((stamp) => parseInt(stamp.trim()))
                    .sort((a, b) => a - b)
                    .slice(0, totalStamp);

                  const oddCount = allStamps.filter(
                    (num) => num % 2 === 1
                  ).length;
                  const evenCount = allStamps.filter(
                    (num) => num % 2 === 0
                  ).length;

                  // Each page can hold max 3 odd + 3 even
                  const oddPages = Math.ceil(oddCount / 3);
                  const evenPages = Math.ceil(evenCount / 3);

                  // Number of pages = max of odd pages or even pages
                  return Math.max(oddPages, evenPages);
                } else {
                  // For sequential stamps, also calculate based on odd/even separation
                  const allSequentialStamps = Array.from(
                    { length: totalStamp },
                    (_, i) => parseInt(startStamp as string) + i
                  );

                  const oddCount = allSequentialStamps.filter(
                    (num) => num % 2 === 1
                  ).length;
                  const evenCount = allSequentialStamps.filter(
                    (num) => num % 2 === 0
                  ).length;

                  const oddPages = Math.ceil(oddCount / 3);
                  const evenPages = Math.ceil(evenCount / 3);

                  return Math.max(oddPages, evenPages);
                }
              })();

              return Array.from({ length: numPages }, (_, pageIndex) => {
                // Calculate the actual layout for this page
                let pageLayout: (string | null)[];

                if (originalStampList.length > 1) {
                  // For comma-separated stamps, separate all odds and evens first
                  const allStamps = (startStamp as string)
                    .split(',')
                    .map((stamp) => parseInt(stamp.trim()))
                    .sort((a, b) => a - b)
                    .slice(0, totalStamp);

                  // Separate all odd and even numbers
                  const allOddNumbers = allStamps
                    .filter((num) => num % 2 === 1)
                    .sort((a, b) => a - b);
                  const allEvenNumbers = allStamps
                    .filter((num) => num % 2 === 0)
                    .sort((a, b) => a - b);

                  // Get 3 odd and 3 even numbers for this specific page
                  const pageOddNumbers = allOddNumbers.slice(
                    pageIndex * 3,
                    (pageIndex + 1) * 3
                  );
                  const pageEvenNumbers = allEvenNumbers.slice(
                    pageIndex * 3,
                    (pageIndex + 1) * 3
                  );

                  pageLayout = new Array(6).fill(null);

                  // Fill odd numbers in top row ONLY (positions 0, 1, 2)
                  pageOddNumbers.forEach((num, index) => {
                    if (index < 3) {
                      pageLayout[index] = num.toString();
                    }
                  });

                  // Fill even numbers in bottom row ONLY (positions 3, 4, 5)
                  pageEvenNumbers.forEach((num, index) => {
                    if (index < 3) {
                      pageLayout[index + 3] = num.toString();
                    }
                  });
                } else {
                  // For sequential stamps, also apply odd-even separation
                  const allSequentialStamps = Array.from(
                    { length: totalStamp },
                    (_, i) => parseInt(startStamp as string) + i
                  );

                  // Separate all odd and even numbers
                  const allOddNumbers = allSequentialStamps
                    .filter((num) => num % 2 === 1)
                    .sort((a, b) => a - b);
                  const allEvenNumbers = allSequentialStamps
                    .filter((num) => num % 2 === 0)
                    .sort((a, b) => a - b);

                  // Get stamps for this page
                  const pageOddNumbers = allOddNumbers.slice(
                    pageIndex * 3,
                    (pageIndex + 1) * 3
                  );
                  const pageEvenNumbers = allEvenNumbers.slice(
                    pageIndex * 3,
                    (pageIndex + 1) * 3
                  );

                  pageLayout = new Array(6).fill(null);

                  // Fill odd numbers in top row ONLY (positions 0, 1, 2)
                  pageOddNumbers.forEach((num, index) => {
                    if (index < 3) {
                      pageLayout[index] = num.toString();
                    }
                  });

                  // Fill even numbers in bottom row ONLY (positions 3, 4, 5)
                  pageEvenNumbers.forEach((num, index) => {
                    if (index < 3) {
                      pageLayout[index + 3] = num.toString();
                    }
                  });
                }

                return (
                  <div
                    key={`page-${pageIndex}`}
                    className="grid-page grid grid-cols-3 grid-rows-2 place-items-center gap-4 not-print:mx-auto not-print:mb-8 not-print:max-w-7xl not-print:border not-print:border-green-500 not-print:p-4"
                  >
                    {pageLayout.map((stamp, itemIndex) => {
                      const globalIndex = pageIndex * 6 + itemIndex;

                      // Calculate grid position (row and column)
                      const gridRow = Math.floor(itemIndex / 3) + 1; // 1 or 2
                      const gridCol = (itemIndex % 3) + 1; // 1, 2, or 3

                      return (
                        <div
                          key={`${globalIndex}-${product.code}-${itemIndex}`}
                          className="grid-stamp-item h-full w-full break-inside-avoid-page not-print:flex not-print:justify-center"
                          style={{
                            gridRow: gridRow,
                            gridColumn: gridCol,
                            display: stamp === null ? 'none' : 'flex'
                          }}
                        >
                          {renderStampTable(stamp ? parseInt(stamp) : null)}
                        </div>
                      );
                    })}
                  </div>
                );
              });
            })()
          : product
            ? // Single layout: 1 stamp per page for all stamps
              (() => {
                // Generate all stamps based on the input
                let allStamps: number[];

                if (originalStampList.length > 1) {
                  // For comma-separated stamps
                  allStamps = (startStamp as string)
                    .split(',')
                    .map((stamp) => parseInt(stamp.trim()))
                    .sort((a, b) => a - b)
                    .slice(0, totalStamp);
                } else {
                  // For sequential stamps
                  allStamps = Array.from(
                    { length: totalStamp },
                    (_, i) => parseInt(startStamp as string) + i
                  );
                }

                // Render each stamp on its own page
                return allStamps.map((stamp, index) => (
                  <div
                    key={`stamp-${index}-${product.code}-${stamp}`}
                    className="stamp-item not-print:mx-auto not-print:mb-8 not-print:max-w-fit not-print:border not-print:border-green-500 not-print:p-4 print:flex print:items-center print:justify-center"
                  >
                    {renderStampTable(stamp)}
                  </div>
                ));
              })()
            : null}
      </div>
    </>
  );
};

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button, Image, message } from 'antd';
import type { Dayjs } from 'dayjs';
import { useCallback, useEffect, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import Barcode from 'react-barcode';

import { ProductType } from '@/types/productType';
import { saveStamp } from '@services/StampService';
import { Shift } from '@/types/shift';
import logo from '@assets/images/logo/vvp02.png';
import { EmployeeType } from '@/types/employeeType';
import { useStampNotification } from '@hooks/useStampNotification';

interface PrintBoxStampProps {
  product: ProductType;
  startStamp: string | number;
  totalStamp: number;
  date: Dayjs;
  shift: Shift;
  employee_id?: EmployeeType['id'];
  stamp_id?: string;
}

export const PrintBoxStamp = ({
  product,
  startStamp,
  totalStamp,
  date,
  shift,
  employee_id,
  stamp_id
}: PrintBoxStampProps) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({ contentRef: contentRef });

  // Parse and arrange stamps based on odd/even rule
  const originalStampList = (startStamp as string).split(',');
  const stampList =
    originalStampList.length > 1
      ? (() => {
          // When multiple stamps are provided with commas, arrange with odd numbers on top, even numbers on bottom
          const stamps = originalStampList.map((stamp) =>
            parseInt(stamp.trim())
          );
          const sortedStamps = stamps.sort((a, b) => a - b);
          const arrangedStamps: string[] = [];

          // Calculate how many complete pages we need
          const totalPages = Math.ceil(sortedStamps.length / 6);

          for (let page = 0; page < totalPages; page++) {
            const pageStamps = sortedStamps.slice(page * 6, (page + 1) * 6);

            // Separate odd and even numbers
            const oddNumbers = pageStamps
              .filter((num) => num % 2 === 1)
              .sort((a, b) => a - b);
            const evenNumbers = pageStamps
              .filter((num) => num % 2 === 0)
              .sort((a, b) => a - b);

            // Create page layout: positions 0,1,2 for odd numbers, positions 3,4,5 for even numbers
            const pageLayout = new Array(6).fill(null);

            // Fill odd numbers in top row (positions 0, 1, 2)
            oddNumbers.forEach((num, index) => {
              if (index < 3) {
                pageLayout[index] = num.toString();
              }
            });

            // Fill even numbers in bottom row (positions 3, 4, 5)
            evenNumbers.forEach((num, index) => {
              if (index < 3) {
                pageLayout[index + 3] = num.toString();
              }
            });

            // Add to arranged stamps (only non-null values)
            pageLayout.forEach((stamp) => {
              if (stamp !== null) {
                arrangedStamps.push(stamp);
              }
            });
          }

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

  const handleSavePrintLog = useCallback(() => {
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
      stamp_id: stamp_id
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
    stamp_id
  ]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key == 'p') {
        e.preventDefault();
        handleSavePrintLog();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSavePrintLog]);

  return (
    <>
      <style>
        {`
          .box-print-container td {
            border: 1px solid #232d42 !important;
            padding: 2px !important;
          }
          .box-print-container table {
            border-collapse: collapse !important;
          }
          @media print {
            .box-print-container {
              margin: 0 !important;
              padding: 0 !important;
              box-shadow: none !important;
            }
            @page {
              size: A4 landscape !important;
              margin: 0 !important;
            }
          }
        `}
      </style>
      <div className="mb-4">
        <Button color="default" variant="solid" onClick={handleSavePrintLog}>
          Print
        </Button>
      </div>
      <div
        ref={contentRef}
        className="box-print-container print:m-0 print:p-0 print:shadow-none"
      >
        {product &&
          Array.from(
            {
              length: (() => {
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
              })()
            },
            (_, pageIndex) => {
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
                ).slice(pageIndex * 6, (pageIndex + 1) * 6);

                // Separate odd and even numbers for this page
                const oddNumbers = allSequentialStamps
                  .filter((num) => num % 2 === 1)
                  .sort((a, b) => a - b);
                const evenNumbers = allSequentialStamps
                  .filter((num) => num % 2 === 0)
                  .sort((a, b) => a - b);

                pageLayout = new Array(6).fill(null);

                // Fill odd numbers in top row ONLY (positions 0, 1, 2)
                oddNumbers.forEach((num, index) => {
                  if (index < 3) {
                    pageLayout[index] = num.toString();
                  }
                });

                // Fill even numbers in bottom row ONLY (positions 3, 4, 5)
                evenNumbers.forEach((num, index) => {
                  if (index < 3) {
                    pageLayout[index + 3] = num.toString();
                  }
                });
              }

              return (
                <div
                  key={`page-${pageIndex}`}
                  className="grid grid-cols-3 grid-rows-2 place-items-center gap-4 not-print:mb-8 not-print:border not-print:border-green-500 print:h-screen print:w-full print:break-after-page"
                >
                  {pageLayout.map((stamp, itemIndex) => {
                    const globalIndex = pageIndex * 6 + itemIndex;

                    // Calculate grid position (row and column)
                    const gridRow = Math.floor(itemIndex / 3) + 1; // 1 or 2
                    const gridCol = (itemIndex % 3) + 1; // 1, 2, or 3

                    return (
                      <div
                        key={`${globalIndex}-${product.code}-${itemIndex}`}
                        className="h-[500] w-auto max-w-[470px] break-inside-avoid-page text-[7px] not-print:flex not-print:justify-center print:flex print:h-auto print:w-auto print:max-w-none print:items-center print:justify-center"
                        style={{
                          gridRow: gridRow,
                          gridColumn: gridCol,
                          display: stamp === null ? 'none' : 'flex'
                        }}
                      >
                        <table
                          className={`border border-black text-center ${product.FAVV ? 'text-[8.3px]' : 'text-[10px]'}`}
                        >
                          <tbody>
                            <tr>
                              <td>
                                <Image
                                  src={logo}
                                  alt="logo"
                                  width={90}
                                  preview={false}
                                  title="VINH VINH PHAT ONE MEMBER CO.LTD"
                                />
                              </td>
                              <td colSpan={5}>
                                <div className="w-auto text-left text-[6px] break-words whitespace-normal">
                                  VINH VINH PHAT ONE MEMBER CO., LTD
                                  <br />
                                  Address : 359 Ap Chien Luoc Street, Warter 2,
                                  Binh Hung Hoa Ward, Ho Chi Minh City
                                  <br />
                                  Factory : No. 2861, National Highway 1, Hamlet
                                  3, Binh Chanh Commune, Ho Chi Minh City
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
                              <td colSpan={2}>
                                <p
                                  className={`${product.name.length < 10 ? 'text-sm' : 'text-[12px]'} font-bold`}
                                >
                                  {product.name}
                                </p>
                              </td>
                              <td>CODE</td>
                              <td colSpan={2}>
                                <p className="text-sm font-bold">
                                  {product.code}
                                </p>
                              </td>
                            </tr>
                            <tr>
                              <td className="text-start">
                                Nguyên liệu
                                <br />
                                原材料
                              </td>
                              <td colSpan={2} className="text-sm">
                                <p> {product.material}</p>
                              </td>
                              <td>
                                Màu sắc
                                <br />色
                              </td>
                              <td colSpan={2} className="text-sm">
                                <p> {product.color}</p>
                              </td>
                            </tr>
                            <tr>
                              <td className="text-start">
                                Số lượng
                                <br />
                                数量
                              </td>
                              <td colSpan={5}>
                                <p className="text-sm font-bold">
                                  {product.quanEntityBin}PCS
                                </p>
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
                            {product.FAVV == true && (
                              <tr>
                                <td className="text-start">
                                  Mã vạch
                                  <br />
                                  バーコード
                                </td>
                                <td colSpan={5}>
                                  <div className="flex items-center justify-center">
                                    <Barcode
                                      className="max-w-[235px]"
                                      width={2}
                                      height={25}
                                      format="CODE128"
                                      displayValue={false}
                                      margin={1}
                                      value={`${product.id}a${date.format('DDMMYYYY')}${shift}${(() => {
                                        if (stamp === null) return '000';
                                        return stamp
                                          .toString()
                                          .padStart(3, '0');
                                      })()}`}
                                    />
                                  </div>
                                </td>
                              </tr>
                            )}
                            <tr>
                              <td className="text-start">
                                Kiểm tra
                                <br />
                                検査
                              </td>
                              <td colSpan={3}>
                                Kiểm tra 200%
                                <br />
                                檢查(200%)
                              </td>
                              <td colSpan={2}>
                                Kiểm tra (Xuất hàng)
                                <br />
                                検査 (出荷)
                              </td>
                            </tr>
                            <tr>
                              <td className="h-20 text-start">
                                Mộc
                                <br />
                                合格印
                              </td>
                              <td colSpan={3}></td>
                              <td colSpan={2} rowSpan={2}>
                                <div className="mx-auto h-14 w-8 border print:text-black"></div>
                              </td>
                            </tr>
                            <tr>
                              <td className="text-start">
                                Người kiểm
                                <br />
                                検査
                              </td>
                              <td colSpan={3}></td>
                            </tr>
                            <tr>
                              <td className="text-start">(Thời gian) 時間</td>
                              <td colSpan={5}>
                                {date.format('DD/MM/YYYY')}{' '}
                                {shift == 1 ? '07:30' : '19:30'}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    );
                  })}
                </div>
              );
            }
          )}
      </div>
    </>
  );
};

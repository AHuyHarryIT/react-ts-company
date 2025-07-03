import { useCallback, useEffect, useRef } from 'react';
import { Button, message } from 'antd';
import { useReactToPrint } from 'react-to-print';
import { useMutation } from '@tanstack/react-query';

import { ProductType } from '@/types/productType';
import { saveStamp } from '@services/StampService';
import { Shift } from '@/types/shift';

import '@assets/css/barcode-1.css';
import logo from '@assets/images/logo/vvp02.png';

interface PrintBoxStampProps {
  product: ProductType;
  startStamp: string | number;
  totalStamp: number;
  date: string;
  shift: Shift;
}

export const PrintBoxStamp = ({
  product,
  startStamp,
  totalStamp,
  date,
  shift
}: PrintBoxStampProps) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({ contentRef: contentRef });

  const stampList = (startStamp as string).split(',');

  const { mutate } = useMutation({
    mutationKey: ['savePrintLog'],
    mutationFn: saveStamp,
    onSuccess: () => {
      message.success('Print log saved successfully');
    },
    onError: () => {
      console.error('Error saving print log');
      message.error('Error saving print log');
    }
  });

  const handleSavePrintLog = useCallback(() => {
    handlePrint();
    mutate({
      productId: product.id,
      date: date.split('/').reverse().join('-'),
      shift,
      binCount: totalStamp,
      binStart: stampList.slice(0, totalStamp).join(','),
      type: 'box'
    });
  }, [stampList, date, handlePrint, mutate, product, shift, totalStamp]);

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
      <Button
        color="default"
        variant="solid"
        size="large"
        onClick={handleSavePrintLog}
      >
        Print
      </Button>
      <div ref={contentRef} className="print:m-0 print:p-0 print:shadow-none">
        <div className="grid grid-cols-3 grid-rows-2 gap-7 not-print:max-w-7xl not-print:grid-cols-1 not-print:border not-print:border-green-400 not-print:p-4 not-print:md:grid-cols-2 not-print:xl:grid-cols-3">
          {product &&
            Array.from(
              {
                length:
                  stampList.length > 1
                    ? stampList.slice(0, totalStamp).length
                    : totalStamp
              },
              () => product
            ).map((item, index) => (
              <div
                key={`${index}-${item.code}`}
                className="w-auto max-w-[435px] break-inside-avoid-page text-center text-[5px] not-print:flex not-print:justify-center"
              >
                <table
                  className={`table border border-black ${item.FAVV == 1 ? 'text-[6.6px]' : 'text-[8px]'}`}
                >
                  <tbody>
                    <tr>
                      <td className="content-center">
                        <img
                          src={logo}
                          alt="logo"
                          width={90}
                          title="VINH VINH PHAT ONE MEMBER CO.LTD"
                        />
                      </td>
                      <td colSpan={5} className="content-center">
                        <div className="w-auto text-left text-[6px] break-words whitespace-normal">
                          VINH VINH PHAT ONE MEMBER CO.LTD
                          <br />
                          Add: 359 Ap Chien Luoc Street, Khu Pho 2, Binh Hung
                          Hoa A Ward, Binh Tan District, Ho Chi Minh City
                          <br />
                          Fac: 2861, National Highway 1, Hamlet 3, Binh Chanh
                          Commune, Binh Chanh District, HCM City
                          <br />
                          Tel: 0283.620.4978 Fax: 0283.620.4978
                          <br />
                          Made in Viet Nam
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td className="text-start">
                        Tên khách hàng
                        <br />
                        外メーカー名
                      </td>
                      <td colSpan={5} className="text-center">
                        <p className="mb-0 text-xs font-bold">
                          FURUKAWA AUTOMOTIVE PARTS
                          <br />
                          (VIET NAM) INC
                        </p>
                      </td>
                    </tr>
                    <tr>
                      <td className="text-start">
                        Tên sản phẩm
                        <br />
                        品名
                      </td>
                      <td colSpan={2} className="text-center">
                        <p className="mb-0 text-xs font-bold">{item.name}</p>
                      </td>
                      <td className="content-center">CODE</td>
                      <td colSpan={2} className="text-center">
                        <p className="mb-0 text-xs font-bold">{item.code}</p>
                      </td>
                    </tr>
                    <tr>
                      <td className="text-start">
                        Nguyên liệu
                        <br />
                        原材料
                      </td>
                      <td
                        colSpan={2}
                        className="content-center text-center text-xs"
                      >
                        <p> {product.material}</p>
                      </td>
                      <td className="text-center">
                        Màu sắc
                        <br />色
                      </td>
                      <td
                        colSpan={2}
                        className="content-center text-center text-xs"
                      >
                        <p> {product.color}</p>
                      </td>
                    </tr>
                    <tr>
                      <td className="text-start">
                        Số lượng
                        <br />
                        数量
                      </td>
                      <td colSpan={5} className="content-center text-center">
                        <p className="mb-0 text-xs font-bold">
                          {item.quanEntityBin}PCS
                        </p>
                      </td>
                    </tr>
                    <tr>
                      <td className="text-start">
                        Lotno
                        <br />
                        ロット No
                      </td>
                      <td
                        colSpan={5}
                        className="content-center text-center text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <p className="text-sx mb-0 font-bold">A</p>
                          <p className="text-sx mb-0 font-bold">-</p>
                          <p className="text-sx mb-0 font-bold">
                            {date.replace(/\//g, '')}
                          </p>
                          <p className="text-sx mb-0 font-bold">-</p>
                          <p className="text-sx mb-0 font-bold">{shift}</p>
                          <p className="text-sx mb-0 font-bold">-</p>
                          <p className="text-sx mb-0 font-bold">
                            {(stampList.length > 1
                              ? stampList[index]
                              : index + parseInt(startStamp as string)
                            )
                              .toString()
                              .padStart(3, '0')}
                          </p>
                        </div>
                      </td>
                    </tr>
                    {item.FAVV == 1 && (
                      <tr>
                        <td className="text-start">
                          Mã vạch
                          <br />
                          バーコード
                        </td>
                        <td colSpan={5} className="content-center text-center">
                          <div className="flex items-center justify-center">
                            <img
                              className="h-[24px] max-w-[250px]"
                              // TODO: Replace with actual barcode data
                              // src="data:image/png;base64,{{ $bin['barcode'] }}"
                              src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASIAAAAeCAQAAAAieNtfAAAAIGNIUk0AAHomAACAhAAA+gAAAIDoAAB1MAAA6mAAADqYAAAXcJy6UTwAAAACYktHRAD/h4/MvwAAAKxJREFUeNrt0kGOgzAQAMFh//9ncsgeELIhUl+rLgl4BMbqY875Ombm/P+d2/+53JvFzHmZOW6zT/Ord+1mZrM+i+t5eM/u+nyYm5f11dpqX7+cw+65b3vYnePb/lbnsHru/Zsus38DkYjIREQmIjIRkYmITERkIiITEZmIyEREJiIyEZGJiExEZCIiExGZiMhERCYiMhGRiYhMRGQiIhMRmYjIREQmIjIRkX0ACSsoO9p8JuEAAAAASUVORK5CYII="
                              alt="Mã vạch"
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
                      <td colSpan={3} className="content-center text-center">
                        Kiểm tra 200%
                        <br />
                        檢查(200%)
                      </td>
                      <td colSpan={2} className="content-center text-center">
                        Kiểm tra (Xuất hàng)
                        <br />
                        検査 (出荷)
                      </td>
                    </tr>
                    <tr className="">
                      <td className="h-16 text-start">
                        Mộc
                        <br />
                        合格印
                      </td>
                      <td colSpan={3}></td>
                      <td colSpan={2} rowSpan={2} className="text-center">
                        <div className="mx-auto h-12 w-8 border print:text-black"></div>
                      </td>
                    </tr>
                    <tr className="">
                      <td className="text-start">
                        Người kiểm
                        <br />
                        検査
                      </td>
                      <td colSpan={3}></td>
                    </tr>
                    <tr>
                      <td className="text-start">(Thời gian)</td>
                      <td colSpan={5}>
                        {date} {shift == 1 ? '07:30' : '19:30'}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            ))}
        </div>
      </div>
      <Button
        color="default"
        variant="solid"
        size="large"
        onClick={handlePrint}
      >
        Print
      </Button>
    </>
  );
};

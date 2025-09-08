import React from 'react';
import { Button, message } from 'antd';
import { FileExcelOutlined } from '@ant-design/icons';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { StorageType } from '@/types/storageType';
import dayjs from 'dayjs';

interface ExportLotReportProps {
  data: StorageType[];
  filename?: string;
}

export const ExportLotReport: React.FC<ExportLotReportProps> = ({
  data,
  filename = `Báo cáo LOT ${dayjs().format('DD-MM-YYYY')}.xlsx`
}) => {
  const handleExport = async () => {
    try {
      message.loading({ content: 'Đang xuất báo cáo...', key: 'export' });

      // Tạo workbook
      const workbook = new ExcelJS.Workbook();

      // Nhóm dữ liệu theo LOT (chỉ lấy phần chính của LOT)
      const lotMap = new Map<
        string,
        {
          lots: StorageType[];
          product: { code: string; name: string };
          employee: { name: string; id: string };
          date: string;
        }
      >();

      data.forEach((item) => {
        // Tách lấy phần chính của LOT (ví dụ: từ "20082025-1-001" lấy "20082025-1")
        const lotParts = item.lot.split('-');
        const mainLotNumber =
          lotParts.length >= 2 ? `${lotParts[0]}-${lotParts[1]}` : item.lot;

        const key = `${mainLotNumber}_${item.product_id}`;
        if (!lotMap.has(key)) {
          lotMap.set(key, {
            lots: [],
            product: {
              code: item.product?.code || '',
              name: item.product?.name || ''
            },
            employee: {
              name: item.employee?.name || '',
              id: item.employee_id
            },
            date: dayjs(item.created_at).format('DD-MM-YYYY')
          });
        }
        lotMap.get(key)!.lots.push(item);
      });

      // Sheet 1: Báo cáo tổng hợp LOT
      const lotSheet = workbook.addWorksheet('Báo cáo LOT');

      // Header chính
      const titleCell = lotSheet.getCell('A1');
      titleCell.value = `BÁOCÁO LOT - ${dayjs().format('DD/MM/YYYY')}`;
      titleCell.font = { bold: true, size: 16, color: { argb: 'FFFFFF' } };
      titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
      titleCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '1890FF' }
      };
      lotSheet.mergeCells('A1:H1');

      // Header cột
      const headers = [
        'STT',
        'Mã LOT',
        'Mã sản phẩm',
        'Tên sản phẩm',
        'Thùng từ',
        'Thùng đến',
        'Tổng thùng',
        'Ngày nhập',
        'Nhân viên nhập',
        'Mã NV'
      ];

      const headerRow = lotSheet.getRow(2);
      headerRow.values = headers;
      headerRow.font = { bold: true };
      headerRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'F0F0F0' }
      };

      // Dữ liệu
      let rowIndex = 3;
      let stt = 1;

      Array.from(lotMap.values()).forEach((group) => {
        const sortedBins = group.lots
          .map((item) => item.bin)
          .sort((a, b) => a - b);

        // Lấy phần chính của LOT từ item đầu tiên
        const firstLot = group.lots[0].lot;
        const lotParts = firstLot.split('-');
        const mainLotNumber =
          lotParts.length >= 2 ? `${lotParts[0]}-${lotParts[1]}` : firstLot;

        const row = lotSheet.getRow(rowIndex);
        row.values = [
          stt,
          mainLotNumber,
          group.product.code,
          group.product.name,
          sortedBins[0],
          sortedBins[sortedBins.length - 1],
          sortedBins.length,
          group.date,
          group.employee.name,
          group.employee.id
        ];

        rowIndex++;
        stt++;
      });

      // Định dạng cột
      lotSheet.columns = [
        { width: 5 }, // STT
        { width: 15 }, // Mã LOT
        { width: 12 }, // Mã SP
        { width: 25 }, // Tên SP
        { width: 10 }, // Thùng từ
        { width: 10 }, // Thùng đến
        { width: 12 }, // Tổng thùng
        { width: 12 }, // Ngày nhập
        { width: 20 }, // Nhân viên
        { width: 10 } // Mã NV
      ];

      // Thêm border cho tất cả cell
      for (let i = 1; i <= rowIndex - 1; i++) {
        const row = lotSheet.getRow(i);
        row.eachCell((cell) => {
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          };
          if (i > 2) {
            cell.alignment = { vertical: 'middle' };
          }
        });
      }

      // Sheet 2: Chi tiết từng thùng
      const detailSheet = workbook.addWorksheet('Chi tiết thùng');

      // Header chi tiết
      const detailTitleCell = detailSheet.getCell('A1');
      detailTitleCell.value = `CHI TIẾT TỪNG THÙNG - ${dayjs().format('DD/MM/YYYY')}`;
      detailTitleCell.font = {
        bold: true,
        size: 16,
        color: { argb: 'FFFFFF' }
      };
      detailTitleCell.alignment = { horizontal: 'center', vertical: 'middle' };
      detailTitleCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '52C41A' }
      };
      detailSheet.mergeCells('A1:G1');

      const detailHeaders = [
        'STT',
        'Mã LOT',
        'Mã sản phẩm',
        'Tên sản phẩm',
        'Số thùng',
        'Thời gian nhập',
        'Nhân viên nhập'
      ];

      const detailHeaderRow = detailSheet.getRow(2);
      detailHeaderRow.values = detailHeaders;
      detailHeaderRow.font = { bold: true };
      detailHeaderRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'F0F0F0' }
      };

      // Dữ liệu chi tiết
      let detailRowIndex = 3;
      let detailStt = 1;

      data
        .sort((a, b) => {
          // Sắp xếp theo LOT chính trước, rồi đến bin
          const aLotParts = a.lot.split('-');
          const bLotParts = b.lot.split('-');
          const aMainLot =
            aLotParts.length >= 2 ? `${aLotParts[0]}-${aLotParts[1]}` : a.lot;
          const bMainLot =
            bLotParts.length >= 2 ? `${bLotParts[0]}-${bLotParts[1]}` : b.lot;

          return aMainLot.localeCompare(bMainLot) || a.bin - b.bin;
        })
        .forEach((item) => {
          // Lấy phần chính của LOT
          const lotParts = item.lot.split('-');
          const mainLotNumber =
            lotParts.length >= 2 ? `${lotParts[0]}-${lotParts[1]}` : item.lot;

          const row = detailSheet.getRow(detailRowIndex);
          row.values = [
            detailStt,
            mainLotNumber,
            item.product?.code || '',
            item.product?.name || '',
            item.bin,
            dayjs(item.created_at).format('DD/MM/YYYY HH:mm:ss'),
            item.employee?.name || ''
          ];

          detailRowIndex++;
          detailStt++;
        });

      // Định dạng cột chi tiết
      detailSheet.columns = [
        { width: 5 }, // STT
        { width: 15 }, // Mã LOT
        { width: 12 }, // Mã SP
        { width: 25 }, // Tên SP
        { width: 10 }, // Số thùng
        { width: 20 }, // Thời gian
        { width: 20 } // Nhân viên
      ];

      // Thêm border cho sheet chi tiết
      for (let i = 1; i <= detailRowIndex - 1; i++) {
        const row = detailSheet.getRow(i);
        row.eachCell((cell) => {
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          };
          if (i > 2) {
            cell.alignment = { vertical: 'middle' };
          }
        });
      }

      // Xuất file
      const buffer = await workbook.xlsx.writeBuffer();
      saveAs(new Blob([buffer]), filename);

      message.success({
        content: 'Xuất báo cáo thành công!',
        key: 'export'
      });
    } catch (error) {
      console.error('Export error:', error);
      message.error({
        content: 'Có lỗi xảy ra khi xuất báo cáo!',
        key: 'export'
      });
    }
  };

  return (
    <Button
      type="primary"
      icon={<FileExcelOutlined />}
      onClick={handleExport}
      disabled={data.length === 0}
    >
      Xuất Excel
    </Button>
  );
};

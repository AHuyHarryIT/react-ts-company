import { useState, useCallback } from 'react';
import {
  Button,
  Modal,
  Upload,
  Select,
  message,
  Table,
  Tag,
  Tooltip,
  Collapse,
  Badge
} from 'antd';
import type { TableColumnsType } from 'antd';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { FaFileExcel, FaFileCsv, FaTrash } from 'react-icons/fa6';
import { FaDownload, FaEye, FaPlus } from 'react-icons/fa';

// ── Types ────────────────────────────────────────────────────
interface SheetInfo {
  name: string;
  rowCount: number;
  columnCount: number;
}

interface FileEntry {
  id: string;
  fileName: string;
  workbook: XLSX.WorkBook;
  sheets: SheetInfo[];
  selectedSheets: string[];
}

interface PreviewData {
  fileId: string;
  sheetName: string;
  headers: string[];
  rows: string[][];
}

// ── Component ────────────────────────────────────────────────
export const ExcelToCsvModal = () => {
  const [open, setOpen] = useState(false);
  const [files, setFiles] = useState<FileEntry[]>([]);
  const [converting, setConverting] = useState(false);
  const [preview, setPreview] = useState<PreviewData | null>(null);

  const handleOpen = () => setOpen(true);

  const handleClose = () => {
    setOpen(false);
    setFiles([]);
    setPreview(null);
  };

  // ── Add file(s) ──────────────────────────────────────────
  const handleFileUpload = useCallback(async (file: File) => {
    try {
      const buffer = await file.arrayBuffer();

      const wb = XLSX.read(buffer, {
        type: 'array',
        cellDates: true,
        cellNF: true,
        cellText: true,
        WTF: false
      });

      if (!wb.SheetNames || wb.SheetNames.length === 0) {
        message.error(`${file.name}: Không có sheet nào!`);
        return false;
      }

      const sheetInfos: SheetInfo[] = wb.SheetNames.map((name: string) => {
        const ws = wb.Sheets[name];
        const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');
        return {
          name,
          rowCount: range.e.r - range.s.r + 1,
          columnCount: range.e.c - range.s.c + 1
        };
      });

      const entry: FileEntry = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        fileName: file.name,
        workbook: wb,
        sheets: sheetInfos,
        selectedSheets: sheetInfos.map((s) => s.name)
      };

      setFiles((prev) => [...prev, entry]);
      message.success(
        `${file.name}: ${sheetInfos.length} sheet, ${sheetInfos.reduce((s, si) => s + si.rowCount, 0)} dòng`
      );
    } catch (err) {
      console.error('Excel read error:', err);
      message.error(`${file.name}: Không thể đọc file.`);
    }
    return false;
  }, []);

  // ── Remove a file ─────────────────────────────────────────
  const removeFile = (fileId: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== fileId));
    if (preview?.fileId === fileId) setPreview(null);
  };

  // ── Update selected sheets for a file ─────────────────────
  const updateSelectedSheets = (fileId: string, selected: string[]) => {
    setFiles((prev) =>
      prev.map((f) =>
        f.id === fileId ? { ...f, selectedSheets: selected } : f
      )
    );
  };

  // ── Preview a sheet ───────────────────────────────────────
  const handlePreview = (fileEntry: FileEntry, sheetName: string) => {
    const ws = fileEntry.workbook.Sheets[sheetName];
    if (!ws) return;

    const data: string[][] = XLSX.utils.sheet_to_json(ws, {
      header: 1,
      defval: '',
      blankrows: true,
      raw: false
    }) as string[][];

    if (data.length === 0) {
      setPreview({
        fileId: fileEntry.id,
        sheetName,
        headers: ['(Không có dữ liệu)'],
        rows: []
      });
      return;
    }

    const headers =
      data[0]?.map((h, i) => (h ? String(h) : `Cột ${i + 1}`)) || [];
    const rows = data
      .slice(1, 11)
      .map((row) => row.map((cell) => (cell != null ? String(cell) : '')));

    setPreview({ fileId: fileEntry.id, sheetName, headers, rows });
  };

  // ── Convert: each selected sheet → separate CSV file ──────
  const handleConvert = async () => {
    const totalSheets = files.reduce((s, f) => s + f.selectedSheets.length, 0);
    if (totalSheets === 0) {
      message.warning('Vui lòng chọn ít nhất một sheet để convert!');
      return;
    }

    setConverting(true);
    try {
      let count = 0;
      for (const file of files) {
        const baseName = file.fileName.replace(
          /\.(xlsx|xls|xlsb|xlsm|csv|ods)$/i,
          ''
        );
        for (const sheetName of file.selectedSheets) {
          const ws = file.workbook.Sheets[sheetName];
          if (!ws) continue;

          const csvContent = XLSX.utils.sheet_to_csv(ws, {
            blankrows: true,
            strip: false,
            FS: ','
          });

          if (!csvContent.trim()) continue;

          const BOM = '\uFEFF';
          const blob = new Blob([BOM + csvContent], {
            type: 'text/csv;charset=utf-8;'
          });

          const outputName =
            file.selectedSheets.length === 1 && files.length === 1
              ? `${baseName}.csv`
              : `${baseName}_${sheetName}.csv`;

          saveAs(blob, outputName);
          count++;
        }
      }

      message.success(`Đã convert thành công ${count} file CSV!`);
    } catch (err) {
      console.error('Convert error:', err);
      message.error('Có lỗi xảy ra khi convert!');
    } finally {
      setConverting(false);
    }
  };

  // ── Stats ─────────────────────────────────────────────────
  const totalSheets = files.reduce((s, f) => s + f.sheets.length, 0);
  const totalSelected = files.reduce((s, f) => s + f.selectedSheets.length, 0);
  const totalRows = files.reduce(
    (s, f) => s + f.sheets.reduce((ss, si) => ss + si.rowCount, 0),
    0
  );

  // Preview table
  const previewColumns: TableColumnsType =
    preview?.headers.map((header, index) => ({
      title: header || `Cột ${index + 1}`,
      dataIndex: `col_${index}`,
      key: `col_${index}`,
      ellipsis: true,
      width: 150
    })) || [];

  const previewDataSource = preview?.rows.map((row, rowIndex) => {
    const record: Record<string, string> = { key: String(rowIndex) };
    row.forEach((cell, colIndex) => {
      record[`col_${colIndex}`] = cell;
    });
    return record;
  });

  return (
    <>
      <Button
        variant="solid"
        color="cyan"
        icon={<FaFileCsv />}
        onClick={handleOpen}
      >
        Excel → CSV
      </Button>

      <Modal
        title={
          <div className="flex items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-500">
              <FaFileCsv className="text-lg" />
            </span>
            <span>Chuyển đổi Excel sang CSV</span>
          </div>
        }
        open={open}
        onCancel={handleClose}
        footer={null}
        width={1000}
        destroyOnHidden
        styles={{ body: { maxHeight: '75vh', overflowY: 'auto' } }}
      >
        <div className="space-y-5">
          {/* ── Upload Area (always visible) ──────────────── */}
          <div className="rounded-xl border-2 border-dashed border-gray-200 bg-gradient-to-br from-gray-50 to-white p-6 transition-colors hover:border-cyan-300 dark:border-gray-600 dark:from-gray-800/50 dark:to-gray-900/50 dark:hover:border-cyan-600">
            <Upload.Dragger
              accept=".xlsx,.xls,.xlsb,.xlsm,.csv,.ods"
              showUploadList={false}
              multiple
              beforeUpload={(file) => {
                handleFileUpload(file);
                return false;
              }}
              className="!border-0 !bg-transparent"
            >
              <div className="flex flex-col items-center gap-3 py-4">
                <div className="rounded-2xl bg-cyan-500/10 p-4">
                  {files.length === 0 ? (
                    <FaFileExcel className="text-4xl text-cyan-500" />
                  ) : (
                    <FaPlus className="text-2xl text-cyan-500" />
                  )}
                </div>
                <div>
                  <p className="text-base font-medium text-gray-700 dark:text-gray-200">
                    {files.length === 0
                      ? 'Kéo thả file Excel vào đây hoặc '
                      : 'Thêm file khác · '}
                    <span className="text-cyan-500">bấm để chọn file</span>
                  </p>
                  <p className="mt-1 text-xs text-gray-400">
                    Hỗ trợ nhiều file cùng lúc · .xlsx, .xls, .xlsb, .xlsm,
                    .csv, .ods
                  </p>
                </div>
              </div>
            </Upload.Dragger>
          </div>

          {/* ── File List ─────────────────────────────────── */}
          {files.length > 0 && (
            <>
              {/* Summary bar */}
              <div className="flex flex-wrap items-center gap-2 rounded-lg border border-cyan-100 bg-cyan-50/50 px-4 py-3 dark:border-cyan-900 dark:bg-cyan-950/30">
                <FaFileExcel className="text-lg text-green-600" />
                <Tag color="cyan">{files.length} file</Tag>
                <Tag color="blue">{totalSheets} sheet</Tag>
                <Tag color="green">
                  {totalRows.toLocaleString('vi-VN')} dòng
                </Tag>
                <Tag color="purple">{totalSelected} sheet được chọn</Tag>
                <Button
                  size="small"
                  type="text"
                  danger
                  onClick={() => {
                    setFiles([]);
                    setPreview(null);
                  }}
                  className="ml-auto"
                >
                  Xóa tất cả
                </Button>
              </div>

              {/* File entries */}
              <Collapse
                defaultActiveKey={files.map((f) => f.id)}
                className="!border-0 !bg-transparent"
                items={files.map((file) => ({
                  key: file.id,
                  className:
                    '!mb-3 !rounded-xl !border !border-gray-100 !bg-white dark:!border-gray-700 dark:!bg-gray-800',
                  label: (
                    <div className="flex items-center gap-3">
                      <Badge
                        status={
                          file.selectedSheets.length > 0 ? 'success' : 'warning'
                        }
                      />
                      <FaFileExcel className="text-green-600" />
                      <span className="font-medium">{file.fileName}</span>
                      <Tag color="blue" className="!ml-auto">
                        {file.sheets.length} sheet
                      </Tag>
                      <Tag color="green">
                        {file.sheets.reduce((s, si) => s + si.rowCount, 0)} dòng
                      </Tag>
                      <Tag color="purple">
                        {file.selectedSheets.length} chọn
                      </Tag>
                    </div>
                  ),
                  extra: (
                    <Button
                      size="small"
                      type="text"
                      danger
                      icon={<FaTrash />}
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile(file.id);
                      }}
                    />
                  ),
                  children: (
                    <div className="space-y-3">
                      {/* Sheet selection */}
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
                          Chọn sheet cần convert:
                        </label>
                        <Select
                          mode="multiple"
                          value={file.selectedSheets}
                          onChange={(val) => updateSelectedSheets(file.id, val)}
                          className="w-full"
                          placeholder="Chọn sheet..."
                          options={file.sheets.map((s) => ({
                            label: (
                              <div className="flex items-center justify-between">
                                <span>{s.name}</span>
                                <span className="text-xs text-gray-400">
                                  {s.rowCount} dòng × {s.columnCount} cột
                                </span>
                              </div>
                            ),
                            value: s.name
                          }))}
                          optionRender={(option) => (
                            <div className="flex items-center justify-between">
                              <span>{option.data.value}</span>
                              <span className="text-xs text-gray-400">
                                {file.sheets.find(
                                  (s) => s.name === option.data.value
                                )?.rowCount ?? 0}{' '}
                                dòng
                              </span>
                            </div>
                          )}
                        />
                      </div>

                      {/* Sheet cards */}
                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                        {file.sheets
                          .filter((s) => file.selectedSheets.includes(s.name))
                          .map((sheet) => (
                            <div
                              key={sheet.name}
                              className="group flex items-center justify-between rounded-xl border border-gray-100 bg-white p-3 shadow-sm transition-all hover:border-cyan-200 hover:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:hover:border-cyan-700"
                            >
                              <div className="min-w-0 flex-1">
                                <div className="truncate text-sm font-semibold text-gray-800 dark:text-white">
                                  {sheet.name}
                                </div>
                                <div className="mt-0.5 text-xs text-gray-400">
                                  {sheet.rowCount} dòng · {sheet.columnCount}{' '}
                                  cột
                                </div>
                              </div>
                              <Tooltip title="Xem trước">
                                <Button
                                  size="small"
                                  type="text"
                                  icon={<FaEye className="text-cyan-500" />}
                                  onClick={() =>
                                    handlePreview(file, sheet.name)
                                  }
                                />
                              </Tooltip>
                            </div>
                          ))}
                      </div>
                    </div>
                  )
                }))}
              />

              {/* Preview section */}
              {preview && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                      👁️ Xem trước: {preview.sheetName}{' '}
                      <span className="text-xs font-normal text-gray-400">
                        (10 dòng đầu)
                      </span>
                    </h4>
                    <Button
                      size="small"
                      type="text"
                      onClick={() => setPreview(null)}
                    >
                      Đóng
                    </Button>
                  </div>
                  <div className="overflow-auto rounded-lg border border-gray-100 dark:border-gray-700">
                    <Table
                      columns={previewColumns}
                      dataSource={previewDataSource}
                      pagination={false}
                      size="small"
                      scroll={{ x: 'max-content' }}
                      bordered
                    />
                  </div>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex flex-wrap items-center gap-3 rounded-xl border border-gray-100 bg-gray-50/50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
                <Button
                  variant="solid"
                  color="cyan"
                  size="large"
                  icon={<FaDownload />}
                  loading={converting}
                  onClick={handleConvert}
                  disabled={totalSelected === 0}
                >
                  Tải {totalSelected} file CSV riêng
                </Button>
                <span className="text-xs text-gray-400">
                  💡 File CSV sẽ hỗ trợ tiếng Việt (UTF-8 with BOM)
                </span>
              </div>
            </>
          )}
        </div>
      </Modal>
    </>
  );
};

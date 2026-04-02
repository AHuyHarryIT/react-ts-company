import { AddPoExportRequest } from '@/types/purchaseOrdersType';
import { ProductType } from '@/types/productType';
import { productService } from '@services/ProductService';
import { AddPurchaseOrdersQuantitiesExport } from '@services/PurchaseOrdersService';
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient
} from '@tanstack/react-query';
import {
  Button,
  DatePicker,
  message,
  Modal,
  Spin,
  Table,
  Tag,
  Upload,
  Collapse,
  Badge
} from 'antd';
import type { TableColumnsType } from 'antd';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import React, { useState, useCallback, useMemo } from 'react';
import { FaTruck } from 'react-icons/fa6';
import {
  FaFileCsv,
  FaFileUpload,
  FaCheckCircle,
  FaPlus,
  FaTrash,
  FaFilePdf
} from 'react-icons/fa';
import * as XLSX from 'xlsx';

dayjs.extend(customParseFormat);

// Lazy-load pdfjs-dist only when needed (avoids Vite worker bundling issues)
let _pdfjsLib: typeof import('pdfjs-dist') | null = null;
const getPdfJs = async () => {
  if (_pdfjsLib) return _pdfjsLib;
  const lib = await import('pdfjs-dist');
  lib.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.mjs',
    import.meta.url
  ).toString();
  _pdfjsLib = lib;
  return lib;
};

// ── Types ────────────────────────────────────────────────────
interface ParsedProduct {
  key: string;
  csvName: string;
  csvQuantity: number;
  matchedProductId: string;
  matchedProductName: string;
}

interface FileBatch {
  id: string;
  fileName: string;
  sheetName: string;
  date: Dayjs | null;
  products: ParsedProduct[];
}

interface AddExportQuantityModalProps {
  open: boolean;
  onClose: () => void;
}

// ── Helpers ──────────────────────────────────────────────────

/**
 * Unicode-aware normalization that preserves Vietnamese diacritics.
 * Removes only punctuation/symbols, not letters from any script.
 */
const normalize = (s: string): string =>
  s
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '')
    // Remove everything that is NOT a unicode letter, digit, or hyphen
    .replace(/[^\p{L}\p{N}-]/gu, '');

/**
 * Aggressive normalization: strips diacritics entirely for fallback comparison.
 * e.g. "Nắp đậy" → "napday"
 */
const normalizeAggressive = (s: string): string =>
  normalize(s)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // strip combining diacritical marks
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');

const parseNumber = (val: string): number => {
  let s = String(val ?? '')
    .trim()
    .replace(/[\s₫$€£]/g, '');
  if (!s) return NaN;

  const hasComma = s.includes(',');
  const hasDot = s.includes('.');

  if (hasComma && hasDot) {
    if (s.lastIndexOf(',') > s.lastIndexOf('.')) {
      // 1.234.567,89 -> ',' is decimal
      s = s.replace(/\./g, '').replace(',', '.');
    } else {
      // 1,234,567.89 -> '.' is decimal
      s = s.replace(/,/g, '');
    }
  } else if (hasComma) {
    const parts = s.split(',');
    if (parts.length > 2) {
      // Multiple commas -> thousands separator (e.g. 1,234,567)
      s = s.replace(/,/g, '');
    } else {
      const p0 = parts[0];
      const p1 = parts[1];
      // Ambiguous single comma (e.g. 0,41 vs 2,352)
      // If decimal part is not exactly 3 digits, or the integer part is starting with 0, it MUST be a decimal.
      if (p1.length !== 3 || p0 === '0' || p0 === '-0') {
        s = p0 + '.' + p1;
      } else {
        // Assume English thousand separator for things like 2,352
        s = p0 + p1;
      }
    }
  }

  return parseFloat(s);
};

const isNumeric = (val: string): boolean => {
  const n = parseNumber(val);
  return !isNaN(n) && isFinite(n);
};

const tryMatchProduct = (
  cellValue: string,
  products: ProductType[]
): ProductType | null => {
  const raw = cellValue.trim();
  if (!raw || raw.length < 2) return null;

  const n = normalize(raw);
  const nAgg = normalizeAggressive(raw);

  if (!n || n.length < 2) return null;

  // Tier 1: Exact match (unicode-aware normalize)
  const exact =
    products.find((p) => normalize(p.name) === n) ??
    products.find((p) => normalize(p.code) === n);
  if (exact) return exact;

  // Tier 2: Exact match with aggressive normalization (strip diacritics)
  const exactAgg =
    products.find((p) => normalizeAggressive(p.name) === nAgg) ??
    products.find((p) => normalizeAggressive(p.code) === nAgg);
  if (exactAgg) return exactAgg;

  // Tier 3: Safe Substring Match (handles codes embedded in "Mã SP: PR-BAK030")
  // Only do substring matching if the product's identifier is sufficiently distinct
  const safeSubstringMatch = products.find((p) => {
    const pCode = normalize(p.code);
    const pName = normalize(p.name);
    // Code must be at least 4 chars long to avoid matching random numbering like "001"
    if (pCode.length >= 4 && n.includes(pCode)) return true;
    // Name must be at least 5 chars long
    if (pName.length >= 5 && n.includes(pName)) return true;
    return false;
  });
  if (safeSubstringMatch) return safeSubstringMatch;

  // Tier 4: Safe Substring Match with aggressive normalization
  const safeAggSubstringMatch = products.find((p) => {
    const pCode = normalizeAggressive(p.code);
    const pName = normalizeAggressive(p.name);
    if (pCode.length >= 4 && nAgg.includes(pCode)) return true;
    if (pName.length >= 5 && nAgg.includes(pName)) return true;
    return false;
  });
  if (safeAggSubstringMatch) return safeAggSubstringMatch;

  return null;
};

// ── Date extraction helpers ───────────────────────────────────
const DATE_FORMATS = [
  'DD/MM/YYYY',
  'D/M/YYYY',
  'YYYY-MM-DD',
  'YYYY/MM/DD',
  'DD-MM-YYYY',
  'DD.MM.YYYY',
  'MM/DD/YYYY',
  'D/M/YY',
  'DD/MM/YY'
];

// Tier-1: Delivery-specific keywords — ALWAYS checked first across the entire file
const DELIVERY_KEYWORDS = [
  'delivery date',
  'deliverydate',
  'delivery request',
  'deliveryrequest',
  'ship date',
  'shipdate',
  'ngày xuất',
  'ngay xuat'
];

// Tier-2: Generic date label keywords — checked only when no delivery keyword found
const DATE_LABEL_KEYWORDS = [
  ...DELIVERY_KEYWORDS,
  'ngày',
  'ngay',
  'date',
  'ngày tháng'
];

/** Try to parse a cell value (string or Date object) into a Dayjs */
const tryCellAsDate = (cell: unknown): Dayjs | null => {
  if (!cell) return null;
  if (cell instanceof Date && !isNaN(cell.getTime())) {
    const d = dayjs(cell);
    return d.isValid() && d.year() > 2000 && d.year() < 2100 ? d : null;
  }
  const s = String(cell).trim();
  if (!s || s.length < 6) return null;
  // Must contain at least one separator to be a date string
  if (!/[/.-]/.test(s) && !/\d{8}/.test(s)) return null;
  for (const fmt of DATE_FORMATS) {
    const d = dayjs(s, fmt, true);
    if (d.isValid() && d.year() > 2000 && d.year() < 2100) return d;
  }
  return null;
};

/**
 * Try to extract a date from a raw date-like string using regex.
 * Handles: dd/mm/yyyy, yyyy-mm-dd, yyyy/m/d (non-padded), etc.
 */
const extractDateFromString = (text: string): Dayjs | null => {
  // Try Vietnamese long format
  const vnLong = text.match(
    /ng[aà]y\s*(\d{1,2})\s*th[aá]ng\s*(\d{1,2})\s*n[aă]m\s*(\d{4})/i
  );
  if (vnLong) {
    const d = dayjs(`${vnLong[1]}/${vnLong[2]}/${vnLong[3]}`, 'D/M/YYYY', true);
    if (d.isValid() && d.year() > 2000 && d.year() < 2100) return d;
  }

  // Try English textual dates (e.g., "Sep 03rd, 2025", "March 30, 2026")
  const engRe = /([a-z]{3,9})\s+(\d{1,2})(?:st|nd|rd|th)?[\s,]+(\d{4})/gi;
  for (const m of text.matchAll(engRe)) {
    const month = m[1].charAt(0).toUpperCase() + m[1].slice(1, 3).toLowerCase();
    // Pass 'en' locale explicitly, otherwise it fails if the global locale is set to 'vi'
    const parsed = dayjs(`${month} ${m[2]} ${m[3]}`, 'MMM D YYYY', 'en');
    if (parsed.isValid() && parsed.year() > 2000 && parsed.year() < 2100)
      return parsed;
  }
  // YYYY-first: "2026/03/28", "2026-03-28", "2026/3/20" (non-padded month/day)
  // Run BEFORE dd/mm regex. Use captured groups + padStart for zero-padding.
  const isoRe = /(\d{4})[/.-](\d{1,2})[/.-](\d{1,2})/g;
  for (const m of text.matchAll(isoRe)) {
    const norm = `${m[1]}-${m[2].padStart(2, '0')}-${m[3].padStart(2, '0')}`;
    const d = dayjs(norm, 'YYYY-MM-DD', true);
    if (d.isValid() && d.year() > 2000 && d.year() < 2100) return d;
  }
  // dd/mm/yyyy and similar short patterns — normalize padding before parsing
  const shortRe = /(\d{1,2})[/.-](\d{1,2})[/.-](\d{2,4})/g;
  for (const m of text.matchAll(shortRe)) {
    const raw = `${m[1].padStart(2, '0')}/${m[2].padStart(2, '0')}/${m[3]}`;
    for (const fmt of DATE_FORMATS) {
      const d = dayjs(raw, fmt, true);
      if (d.isValid() && d.year() > 2000 && d.year() < 2100) return d;
    }
  }
  return null;
};

/**
 * Smart date extraction from a 2-D grid of cells.
 *
 * Priority (highest to lowest):
 *   1. Rows with DELIVERY DATE / DELIVERY REQUEST keywords  ← always checked first
 *   2. Rows with other generic date label keywords (ngày, date...)
 *   3. General row scan — fallback for unlabelled dates / PDF fragmentation
 *   4. Individual cell scan (skip pure integers)
 */
const extractDateFromRows = (rows: string[][]): Dayjs | null => {
  // ── Tier 1: DELIVERY-specific keywords (top priority, scan entire file) ──────
  // "DELIVERY DATE : 2026/03/28" must beat any other date found elsewhere.
  for (let r = 0; r < rows.length; r++) {
    const rowText = rows[r].join(' ');
    const rowLower = rowText.toLowerCase();
    const hasDelivery = DELIVERY_KEYWORDS.some((kw) => rowLower.includes(kw));
    if (!hasDelivery) continue;

    // Inline: "DELIVERY DATE : 2026/03/28" all in one cell/row
    const d = extractDateFromString(rowText);
    if (d) return d;

    // Adjacent cell: label in one cell, date in next/below cell
    for (let c = 0; c < rows[r].length; c++) {
      const cell = String(rows[r][c] ?? '')
        .trim()
        .toLowerCase();
      if (DELIVERY_KEYWORDS.some((kw) => cell.includes(kw))) {
        const next = rows[r]?.[c + 1];
        if (next) {
          const d2 = tryCellAsDate(next);
          if (d2) return d2;
        }
        const below = rows[r + 1]?.[c];
        if (below) {
          const d2 = tryCellAsDate(below);
          if (d2) return d2;
        }
      }
    }
  }

  // ── Tier 2: Generic date label keywords (ngày, date...) ─────────────────────────
  for (let r = 0; r < rows.length; r++) {
    const rowText = rows[r].join(' ');
    const rowLower = rowText.toLowerCase();
    const hasLabel = DATE_LABEL_KEYWORDS.some((kw) => rowLower.includes(kw));
    if (!hasLabel) continue;

    const d = extractDateFromString(rowText);
    if (d) return d;

    for (let c = 0; c < rows[r].length; c++) {
      const cell = String(rows[r][c] ?? '')
        .trim()
        .toLowerCase();
      if (DATE_LABEL_KEYWORDS.some((kw) => cell.includes(kw))) {
        const next = rows[r]?.[c + 1];
        if (next) {
          const d2 = tryCellAsDate(next);
          if (d2) return d2;
        }
        const below = rows[r + 1]?.[c];
        if (below) {
          const d2 = tryCellAsDate(below);
          if (d2) return d2;
        }
      }
    }
  }

  // ── Tier 3: General scan — join row text, for unlabelled dates & PDF fragments ─
  for (const row of rows) {
    const rowText = row.join(' ');
    const d = extractDateFromString(rowText);
    if (d) return d;
  }

  // ── Tier 4: Individual cell scan, skip pure integers ─────────────────────────
  for (const row of rows) {
    for (const cell of row) {
      const s = String(cell ?? '').trim();
      if (!s || /^\d+$/.test(s)) continue;
      const d = tryCellAsDate(s);
      if (d) return d;
    }
  }
  return null;
};

/** Scan raw worksheet cells (Date type cells from xlxs) */
const extractDateFromWorksheet = (ws: XLSX.WorkSheet): Dayjs | null => {
  const ref = ws['!ref'];
  if (!ref) return null;
  const range = XLSX.utils.decode_range(ref);
  for (let R = range.s.r; R <= range.e.r; R++) {
    for (let C = range.s.c; C <= range.e.c; C++) {
      const addr = XLSX.utils.encode_cell({ r: R, c: C });
      const cell = ws[addr];
      if (!cell) continue;
      // Excel date cell (type='d')
      if (cell.t === 'd' && cell.v instanceof Date) {
        const d = tryCellAsDate(cell.v);
        if (d) return d;
      }
    }
  }
  return null;
};

/** Last-resort: try extracting date from a filename like "...2026-04-01..." */
const extractDateFromFilename = (filename: string): Dayjs | null => {
  const m =
    filename.match(/(\d{4})[-_](\d{2})[-_](\d{2})/) ??
    filename.match(/(\d{2})[-_](\d{2})[-_](\d{4})/);
  if (!m) return null;
  // Try YYYY-MM-DD
  const d1 = dayjs(`${m[1]}-${m[2]}-${m[3]}`, 'YYYY-MM-DD', true);
  if (d1.isValid() && d1.year() > 2000) return d1;
  // Try DD-MM-YYYY
  const d2 = dayjs(`${m[1]}-${m[2]}-${m[3]}`, 'DD-MM-YYYY', true);
  if (d2.isValid() && d2.year() > 2000) return d2;
  return null;
};

// ── Component ────────────────────────────────────────────────
export const AddExportQuantityModal: React.FC<AddExportQuantityModalProps> = ({
  open,
  onClose
}) => {
  const [batches, setBatches] = useState<FileBatch[]>([]);
  const [activeKeys, setActiveKeys] = useState<string[] | string>([]);
  const [submitting, setSubmitting] = useState(false);
  const queryClient = useQueryClient();

  const { mutateAsync } = useMutation({
    mutationKey: ['add', 'exportQuantities'],
    mutationFn: async (values: AddPoExportRequest) =>
      AddPurchaseOrdersQuantitiesExport(values)
  });

  const { data: productsData, isLoading: isLoadingProducts } = useQuery({
    queryKey: ['products'],
    queryFn: () => productService.list({ limit: 0 }),
    enabled: open,
    placeholderData: keepPreviousData,
    staleTime: 2 * 60 * 1000
  });
  const productList = useMemo(
    () => productsData?.data ?? [],
    [productsData?.data]
  );

  // ── Smart parse a single sheet ─────────────────────────────
  const parseSheet = useCallback(
    (rows: string[][]): ParsedProduct[] => {
      if (productList.length === 0 || rows.length === 0) return [];

      const maxCols = Math.max(...rows.map((r) => r.length));

      // Step 1: Find product column (column-based matching)
      const colMatches: Map<
        number,
        { rowIdx: number; product: ProductType; cellValue: string }[]
      > = new Map();

      for (let col = 0; col < maxCols; col++) {
        const matches: {
          rowIdx: number;
          product: ProductType;
          cellValue: string;
        }[] = [];
        for (let row = 0; row < rows.length; row++) {
          const cell = String(rows[row]?.[col] ?? '').trim();
          if (!cell) continue;
          const product = tryMatchProduct(cell, productList);
          if (product) {
            // Avoid duplicate product matches in same row (keep best match)
            if (
              !matches.some(
                (m) => m.rowIdx === row && m.product.id === product.id
              )
            ) {
              matches.push({ rowIdx: row, product, cellValue: cell });
            }
          }
        }
        if (matches.length > 0) colMatches.set(col, matches);
      }

      // Step 1b: Fallback — row-level text scan when no column-based match found
      // Scan the full text of each row for product names
      if (colMatches.size === 0) {
        const rowMatches: {
          rowIdx: number;
          product: ProductType;
          cellValue: string;
        }[] = [];

        for (let row = 0; row < rows.length; row++) {
          const rowText = rows[row].join(' ').trim();
          if (!rowText || rowText.length < 2) continue;

          // Try matching the full row text
          const product = tryMatchProduct(rowText, productList);
          if (product) {
            rowMatches.push({ rowIdx: row, product, cellValue: rowText });
            continue;
          }

          // Try each cell individually (may have been merged differently)
          for (const cell of rows[row]) {
            const cellText = String(cell ?? '').trim();
            if (!cellText || cellText.length < 2) continue;
            const cellProduct = tryMatchProduct(cellText, productList);
            if (cellProduct) {
              rowMatches.push({
                rowIdx: row,
                product: cellProduct,
                cellValue: cellText
              });
              break; // one product per row
            }
          }
        }

        if (rowMatches.length > 0) {
          // For row-level matches, extract quantity from numeric values in the same row
          const results: ParsedProduct[] = [];
          for (let idx = 0; idx < rowMatches.length; idx++) {
            const rm = rowMatches[idx];
            // Find all numeric values in this row
            const numericValues: number[] = [];
            for (const cell of rows[rm.rowIdx]) {
              const s = String(cell ?? '').trim();
              if (isNumeric(s)) {
                const v = parseNumber(s);
                if (!isNaN(v) && v > 0 && v < 100_000) {
                  numericValues.push(v);
                }
              }
            }

            // Pick the most likely quantity: prefer the last reasonable number
            // (quantities often appear after the product name)
            const qty =
              numericValues.length > 0
                ? numericValues[numericValues.length - 1]
                : 0;

            if (qty > 0) {
              results.push({
                key: `p-${idx}`,
                csvName: rm.cellValue,
                csvQuantity: qty,
                matchedProductId: rm.product.id,
                matchedProductName: rm.product.name
              });
            }
          }
          return results;
        }

        return [];
      }

      const productCol = [...colMatches.entries()].sort(
        (a, b) => b[1].length - a[1].length
      )[0][0];
      const productRows = colMatches.get(productCol)!;

      // Step 2a: Try header-keyword detection first (most reliable)
      // Quantity header keywords (Vietnamese + English)
      const QTY_KEYWORDS = [
        'sl',
        'soluong',
        'sốlượng',
        'quantity',
        'qty',
        'pcs',
        'số lượng',
        'solg',
        'amount',
        'sốlượngđặt',
        'orderqty',
        'order qty',
        'đặthàng',
        'dathang'
      ];
      let bestQtyCol = -1;

      // Find the header row — scan broader range including all rows above first product
      const firstProductRowIdx = Math.min(
        ...productRows.map((pr) => pr.rowIdx)
      );

      // Also scan all rows for header keywords (PDFs may place headers anywhere)
      for (let hr = 0; hr < rows.length && bestQtyCol === -1; hr++) {
        // Skip product rows themselves
        if (
          hr >= firstProductRowIdx &&
          productRows.some((pr) => pr.rowIdx === hr)
        )
          continue;
        // Only look at rows before or near the product area
        if (hr > firstProductRowIdx + 1) break;

        const headerRow = rows[hr];
        if (!headerRow) continue;
        for (let col = 0; col < headerRow.length; col++) {
          if (col === productCol) continue;

          const rawH = String(headerRow[col] ?? '')
            .trim()
            .toLowerCase();
          if (!rawH) continue;

          const exactAggH = normalizeAggressive(rawH);

          if (
            QTY_KEYWORDS.some((kw) => {
              const kwAgg = normalizeAggressive(kw);
              // exact match after removing diacritics
              if (exactAggH === kwAgg) return true;
              // safe substring match on original text (with spaces intact)
              if (rawH.includes(kw)) return true;
              return false;
            })
          ) {
            bestQtyCol = col;
            break;
          }
        }
      }

      // Step 2b: Stats-based detection when no header keyword found
      if (bestQtyCol === -1) {
        interface ColStats {
          col: number;
          sum: number;
          mean: number;
          min: number;
          max: number;
          cv: number;
          isSequential: boolean; // values form a sequence (likely running index / code)
          numericCount: number;
        }
        const colStats: ColStats[] = [];

        for (let col = 0; col < maxCols; col++) {
          if (col === productCol) continue;
          const values: number[] = [];

          for (const pr of productRows) {
            const raw = String(rows[pr.rowIdx]?.[col] ?? '').trim();
            if (isNumeric(raw)) values.push(Math.abs(parseNumber(raw)));
          }

          if (values.length < productRows.length * 0.3) continue;

          const sorted = [...values].sort((a, b) => a - b);
          const sum = values.reduce((a, b) => a + b, 0);
          const mean = sum / values.length;
          const min = sorted[0];
          const max = sorted[sorted.length - 1];
          const variance =
            values.reduce((a, b) => a + (b - mean) ** 2, 0) / values.length;
          const cv = mean > 0 ? Math.sqrt(variance) / mean : 0;

          // Detect sequential columns: range ≈ count (e.g. 16707,16708,16709,...)
          // A true sequential run has max - min ≈ count - 1
          const isSequential =
            values.length >= 3 && max - min <= values.length + 2 && cv < 0.05;

          colStats.push({
            col,
            sum,
            mean,
            min,
            max,
            cv,
            isSequential,
            numericCount: values.length
          });
        }

        // Filter out obvious code/index columns
        const isCodeLike = (s: ColStats) =>
          s.isSequential || // sequential run → row index / serial code
          (s.cv < 0.05 && s.mean > 500) || // nearly uniform & large → static code
          s.max > 100_000; // impossibly large single quantity

        const candidateCols = colStats.filter((s) => !isCodeLike(s));

        if (candidateCols.length > 0) {
          // Among real candidates: pick highest sum (most total quantity)
          bestQtyCol = candidateCols.sort((a, b) => b.sum - a.sum)[0].col;
        } else if (colStats.length > 0) {
          // All columns look like codes — pick the one with SMALLEST mean
          // (real quantities are typically numerically smaller than product codes)
          bestQtyCol = colStats.sort((a, b) => a.mean - b.mean)[0].col;
        }
      }

      // Step 2c: Last resort — find nearest numeric cell to the right of product cell
      const getQtyForRow = (rowIdx: number): number => {
        if (bestQtyCol >= 0) {
          return parseNumber(String(rows[rowIdx]?.[bestQtyCol] ?? ''));
        }
        // Scan cells to the right of the product column
        const row = rows[rowIdx];
        if (!row) return 0;
        for (let c = productCol + 1; c < row.length; c++) {
          const val = String(row[c] ?? '').trim();
          if (isNumeric(val)) {
            const v = parseNumber(val);
            if (!isNaN(v) && v > 0 && v < 100_000) return v;
          }
        }
        // Scan left of product column
        for (let c = productCol - 1; c >= 0; c--) {
          const val = String(row[c] ?? '').trim();
          if (isNumeric(val)) {
            const v = parseNumber(val);
            if (!isNaN(v) && v > 0 && v < 100_000) return v;
          }
        }
        return 0;
      };

      // Step 3: Build result (only qty > 0)
      return productRows
        .map((pr, idx) => {
          const qty = getQtyForRow(pr.rowIdx);
          if (isNaN(qty) || qty <= 0) return null;

          return {
            key: `p-${idx}`,
            csvName: pr.cellValue,
            csvQuantity: qty,
            matchedProductId: pr.product.id,
            matchedProductName: pr.product.name
          };
        })
        .filter(Boolean) as ParsedProduct[];
    },
    [productList]
  );

  // ── Parse PDF file ─────────────────────────────────────────
  const parsePdfFile = useCallback(
    async (file: File): Promise<FileBatch[]> => {
      const pdfjsLib = await getPdfJs();
      const buffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
      const newBatches: FileBatch[] = [];

      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();

        // Collect text items with position info
        // IMPORTANT: Filter out whitespace-only items — many PDFs (especially
        // from Japanese/Vietnamese ERP systems) insert space-only text items
        // between table cells. These have large widths that corrupt gap analysis.
        const items: {
          x: number;
          y: number;
          width: number;
          fontSize: number;
          text: string;
        }[] = [];
        for (const item of textContent.items) {
          if (!('str' in item)) continue;
          const text = item.str;
          // Skip empty and whitespace-only items
          if (!text || !text.trim()) continue;
          const fontSize = Math.abs(item.transform[0]) || 10;
          items.push({
            x: item.transform[4],
            y: item.transform[5],
            width:
              'width' in item &&
              typeof item.width === 'number' &&
              item.width > 0
                ? item.width
                : text.length * fontSize * 0.55,
            fontSize,
            text
          });
        }

        if (items.length === 0) continue;

        // Step 1: Dynamic Y_TOLERANCE based on actual font sizes
        const fontSizes = items.map((it) => it.fontSize);
        const sortedFontSizes = [...fontSizes].sort((a, b) => a - b);
        const medianFontSize =
          sortedFontSizes[Math.floor(sortedFontSizes.length / 2)] || 10;
        const Y_TOLERANCE = Math.max(3, medianFontSize * 0.6);

        items.sort((a, b) => b.y - a.y);

        // Cluster into rows
        const rowClusters: (typeof items)[] = [];
        let currentCluster: typeof items = [items[0]];
        let clusterY = items[0].y;

        for (let i = 1; i < items.length; i++) {
          if (Math.abs(items[i].y - clusterY) <= Y_TOLERANCE) {
            currentCluster.push(items[i]);
            clusterY =
              currentCluster.reduce((s, it) => s + it.y, 0) /
              currentCluster.length;
          } else {
            rowClusters.push(currentCluster);
            currentCluster = [items[i]];
            clusterY = items[i].y;
          }
        }
        rowClusters.push(currentCluster);

        // Step 2: Analyze gaps between NON-WHITESPACE items only
        const allGaps: number[] = [];
        for (const cluster of rowClusters) {
          if (cluster.length < 2) continue;
          const sorted = [...cluster].sort((a, b) => a.x - b.x);
          for (let i = 1; i < sorted.length; i++) {
            const prevEndX = sorted[i - 1].x + sorted[i - 1].width;
            const gap = sorted[i].x - prevEndX;
            if (gap > 0.5) allGaps.push(gap); // ignore sub-pixel gaps
          }
        }

        allGaps.sort((a, b) => a - b);

        // Compute a sensible merge threshold from gap distribution
        let computedThreshold = medianFontSize * 2; // fallback
        if (allGaps.length > 4) {
          // Find the biggest relative jump in sorted gaps
          let maxJumpRatio = 0;
          let jumpIdx = Math.floor(allGaps.length / 2);
          for (let i = 1; i < allGaps.length; i++) {
            const ratio = allGaps[i] / Math.max(allGaps[i - 1], 0.1);
            if (ratio > maxJumpRatio) {
              maxJumpRatio = ratio;
              jumpIdx = i;
            }
          }
          computedThreshold = (allGaps[jumpIdx - 1] + allGaps[jumpIdx]) / 2;
        } else if (allGaps.length > 0) {
          computedThreshold = allGaps[Math.floor(allGaps.length / 2)];
        }

        // Build row strings from clusters using a given merge threshold
        const buildRows = (threshold: number): string[][] =>
          rowClusters
            .map((cluster) => {
              const sorted = [...cluster].sort((a, b) => a.x - b.x);

              const cells: string[] = [];
              let currentText = sorted[0].text;
              let currentEndX = sorted[0].x + sorted[0].width;

              for (let i = 1; i < sorted.length; i++) {
                const item = sorted[i];
                const gap = item.x - currentEndX;

                if (gap < threshold) {
                  // Same cell
                  if (gap > medianFontSize * 0.2) {
                    currentText += ' ' + item.text;
                  } else {
                    currentText += item.text;
                  }
                  currentEndX = item.x + item.width;
                } else {
                  // New cell
                  cells.push(currentText.trim());
                  currentText = item.text;
                  currentEndX = item.x + item.width;
                }
              }
              cells.push(currentText.trim());

              return cells.filter(Boolean);
            })
            .filter((row) => row.length > 0);

        // Try multiple thresholds — from tight (many cells) to loose (merged cells)
        const strategies = [
          medianFontSize * 0.5, // very tight — separate almost everything
          medianFontSize * 1.0, // tight — words stay together
          medianFontSize * 2.0, // moderate
          computedThreshold, // computed from gap analysis
          computedThreshold * 0.5, // half of computed
          computedThreshold * 2 // double computed
        ];
        // Deduplicate and sort
        const uniqueStrategies = [
          ...new Set(strategies.map((s) => Math.round(s * 10) / 10))
        ].sort((a, b) => a - b);

        let bestProducts: ParsedProduct[] = [];
        let bestRows: string[][] = [];

        for (const threshold of uniqueStrategies) {
          const rows = buildRows(threshold);
          if (rows.length === 0) continue;

          const products = parseSheet(rows);

          if (products.length > bestProducts.length) {
            bestProducts = products;
            bestRows = rows;
          }
        }

        // Last resort: each row as a single flat line
        if (bestProducts.length === 0) {
          const flatRows = rowClusters
            .map((cluster) => {
              const sorted = [...cluster].sort((a, b) => a.x - b.x);
              return [sorted.map((it) => it.text).join(' ')];
            })
            .filter((row) => row[0].trim().length > 0);

          const flatProducts = parseSheet(flatRows);
          if (flatProducts.length > 0) {
            bestProducts = flatProducts;
            bestRows = flatRows;
          }
        }

        if (bestProducts.length === 0) {
          // Log first rows for debugging
          continue;
        }

        const pdfAutoDate =
          extractDateFromRows(bestRows) ?? extractDateFromFilename(file.name);

        newBatches.push({
          id: `${Date.now()}-pdf-p${pageNum}-${Math.random().toString(36).slice(2, 7)}`,
          fileName: file.name,
          sheetName: pdf.numPages > 1 ? `Trang ${pageNum}` : '',
          date: pdfAutoDate,
          products: bestProducts
        });
      }

      return newBatches;
    },
    [parseSheet]
  );

  // ── Handle file(s) upload ──────────────────────────────────
  const handleFilesUpload = useCallback(
    async (file: File) => {
      try {
        const isPdf =
          file.name.toLowerCase().endsWith('.pdf') ||
          file.type === 'application/pdf';

        let newBatches: FileBatch[] = [];

        if (isPdf) {
          // ── PDF path ───────────────────────────────────
          newBatches = await parsePdfFile(file);
        } else {
          // ── Excel / CSV path ───────────────────────────
          const buffer = await file.arrayBuffer();
          const wb = XLSX.read(buffer, {
            type: 'array',
            raw: false,
            cellText: true,
            cellDates: true
          });

          if (!wb.SheetNames?.length) {
            message.error(`${file.name}: Không có dữ liệu!`);
            return false;
          }

          for (const sheetName of wb.SheetNames) {
            const ws = wb.Sheets[sheetName];

            // Try to extract date from the worksheet before converting to string[][]
            const autoDate = extractDateFromWorksheet(ws);

            const rows: string[][] = XLSX.utils.sheet_to_json(ws, {
              header: 1,
              defval: '',
              blankrows: false,
              raw: false
            }) as string[][];

            // Priority: worksheet Date cell → smart row scan → filename
            const finalDate =
              autoDate ??
              extractDateFromRows(rows) ??
              extractDateFromFilename(file.name);

            const products = parseSheet(rows);
            if (products.length === 0) continue;

            newBatches.push({
              id: `${Date.now()}-${sheetName}-${Math.random().toString(36).slice(2, 7)}`,
              fileName: file.name,
              sheetName: wb.SheetNames.length > 1 ? sheetName : '',
              date: finalDate,
              products
            });
          }
        }

        if (newBatches.length === 0) {
          message.warning(
            `${file.name}: Không tìm thấy sản phẩm nào khớp hệ thống.`
          );
          return false;
        }

        setBatches((prev) => [...prev, ...newBatches]);
        setActiveKeys(newBatches.map((b) => b.id));
        message.success(
          `${file.name}: Thêm ${newBatches.length} bảng dữ liệu.`
        );
      } catch {
        message.error(`${file.name}: Không thể đọc file.`);
      }
      return false;
    },
    [parseSheet, parsePdfFile]
  );

  // ── Update date for a batch ────────────────────────────────
  const updateBatchDate = (batchId: string, date: Dayjs | null) => {
    setBatches((prev) =>
      prev.map((b) => (b.id === batchId ? { ...b, date } : b))
    );
  };

  // ── Remove a batch ─────────────────────────────────────────
  const removeBatch = (batchId: string) => {
    setBatches((prev) => prev.filter((b) => b.id !== batchId));
  };

  // ── Submit all batches ─────────────────────────────────────
  const handleSubmit = async () => {
    const validBatches = batches.filter((b) => b.date && b.products.length > 0);

    const missingDate = batches.filter((b) => !b.date);
    if (missingDate.length > 0) {
      message.warning(
        `Còn ${missingDate.length} bảng chưa xác định được ngày — vui lòng chọn thủ công!`
      );
      return;
    }

    if (validBatches.length === 0) {
      message.error('Không có dữ liệu để import!');
      return;
    }

    setSubmitting(true);
    let successCount = 0;
    let errorCount = 0;

    for (const batch of validBatches) {
      try {
        await mutateAsync({
          date: batch.date!.format('YYYY-MM-DD'),
          fileName: batch.fileName,
          products: batch.products.map((p) => ({
            productId: p.matchedProductId,
            quantity: p.csvQuantity
          }))
        });
        successCount++;
      } catch {
        errorCount++;
      }
    }

    if (successCount > 0) {
      message.success(
        `Import thành công ${successCount}/${validBatches.length} bảng!`
      );
      queryClient.invalidateQueries();
    }
    if (errorCount > 0) {
      message.error(`${errorCount} bảng lỗi khi import.`);
    }

    setSubmitting(false);
    if (errorCount === 0) {
      handleReset();
      onClose();
    }
  };

  const handleReset = () => {
    setBatches([]);
    setActiveKeys([]);
  };
  const handleCancel = () => {
    handleReset();
    onClose();
  };

  const totalProducts = batches.reduce((s, b) => s + b.products.length, 0);
  const totalQty = batches.reduce(
    (s, b) => s + b.products.reduce((ps, p) => ps + p.csvQuantity, 0),
    0
  );
  const allDatesSet = batches.length > 0 && batches.every((b) => b.date);

  // ── Table columns for each batch ───────────────────────────
  const productColumns: TableColumnsType<ParsedProduct> = [
    {
      title: 'STT',
      width: 50,
      align: 'center',
      render: (_, __, index) => (
        <span className="font-mono text-xs text-gray-400">{index + 1}</span>
      )
    },
    {
      title: 'Tên trong file',
      dataIndex: 'csvName',
      key: 'csvName',
      ellipsis: true,
      render: (value) => <span className="text-sm font-medium">{value}</span>
    },
    {
      title: 'Sản phẩm khớp',
      dataIndex: 'matchedProductName',
      key: 'matchedProductName',
      ellipsis: true,
      render: (value) => (
        <span className="flex items-center gap-1 text-green-600">
          <FaCheckCircle /> {value}
        </span>
      )
    },
    {
      title: 'Số lượng',
      dataIndex: 'csvQuantity',
      key: 'csvQuantity',
      width: 120,
      align: 'center',
      render: (value) => (
        <span className="font-semibold text-blue-600">
          {Number(value).toLocaleString('vi-VN')}
        </span>
      )
    }
  ];

  return (
    <Modal
      title={
        <div className="flex items-center gap-2">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
            <FaTruck />
          </span>
          <span>Thêm PO xuất hàng (Import file)</span>
        </div>
      }
      open={open}
      onCancel={handleCancel}
      footer={null}
      width={1100}
      destroyOnHidden
      styles={{ body: { maxHeight: '80vh', overflowY: 'auto' } }}
    >
      <Spin spinning={submitting || isLoadingProducts}>
        <div className="space-y-4">
          {/* ── Upload Area (always visible) ───────────────── */}
          <div className="rounded-xl border-2 border-dashed border-gray-200 bg-gradient-to-br from-gray-50 to-white p-4 transition-colors hover:border-blue-300 dark:border-gray-600 dark:from-gray-800/50 dark:to-gray-900/50">
            <Upload.Dragger
              accept=".csv,.xlsx,.xls,.pdf"
              showUploadList={false}
              multiple
              beforeUpload={(file) => {
                handleFilesUpload(file);
                return false;
              }}
              className="!border-0 !bg-transparent"
            >
              <div className="flex flex-col items-center gap-2 py-3">
                <div className="rounded-2xl bg-blue-500/10 p-3">
                  {batches.length === 0 ? (
                    <div className="flex items-center gap-2">
                      <FaFileUpload className="text-3xl text-blue-500" />
                      <FaFilePdf className="text-2xl text-red-400" />
                    </div>
                  ) : (
                    <FaPlus className="text-2xl text-blue-500" />
                  )}
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                    {batches.length === 0
                      ? 'Kéo thả file phiếu xuất kho vào đây'
                      : 'Thêm file khác'}
                    {' · '}
                    <span className="text-blue-500">bấm để chọn file</span>
                  </p>
                  <p className="mt-0.5 text-xs text-gray-400">
                    Hỗ trợ nhiều file cùng lúc · .csv, .xlsx, .xls, .pdf · Tự
                    nhận diện multi-sheet / multi-page
                  </p>
                </div>
              </div>
            </Upload.Dragger>
          </div>

          {/* ── Batches ───────────────────────────────────── */}
          {batches.length > 0 && (
            <>
              {/* Summary bar */}
              <div className="flex flex-wrap items-center gap-2 rounded-lg border border-blue-100 bg-blue-50/50 px-4 py-3 dark:border-blue-900 dark:bg-blue-950/30">
                <div className="flex items-center gap-1">
                  <FaFileCsv className="text-lg text-green-600" />
                  <FaFilePdf className="text-lg text-red-500" />
                </div>
                <Tag color="cyan">{batches.length} bảng dữ liệu</Tag>
                <Tag color="green">{totalProducts} sản phẩm</Tag>
                <Tag color="blue">Tổng: {totalQty.toLocaleString('vi-VN')}</Tag>
                <Button
                  size="small"
                  type="text"
                  danger
                  onClick={handleReset}
                  className="ml-auto"
                >
                  Xóa tất cả
                </Button>
              </div>

              {/* Batch list */}
              <Collapse
                activeKey={activeKeys}
                onChange={(keys) => setActiveKeys(keys)}
                className="!border-0 !bg-transparent"
                items={batches.map((batch) => {
                  const batchQty = batch.products.reduce(
                    (s, p) => s + p.csvQuantity,
                    0
                  );
                  return {
                    key: batch.id,
                    className:
                      '!mb-3 !rounded-xl !border !border-gray-100 !bg-white dark:!border-gray-700 dark:!bg-gray-800',
                    label: (
                      <div className="flex items-center gap-3">
                        <Badge status={batch.date ? 'success' : 'warning'} />
                        <span className="font-medium">
                          {batch.fileName}
                          {batch.sheetName && (
                            <span className="ml-1 text-xs text-gray-400">
                              ({batch.sheetName})
                            </span>
                          )}
                        </span>
                        <Tag color="green" className="!ml-auto">
                          {batch.products.length} SP
                        </Tag>
                        <Tag color="blue">
                          {batchQty.toLocaleString('vi-VN')}
                        </Tag>
                        {batch.date && (
                          <Tag color="purple">
                            {batch.date.format('DD/MM/YYYY')}
                          </Tag>
                        )}
                        {!batch.date && (
                          <Tag color="warning">Chưa chọn ngày</Tag>
                        )}
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
                          removeBatch(batch.id);
                        }}
                      />
                    ),
                    children: (
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium text-gray-600">
                            Ngày xuất hàng:
                          </span>
                          <DatePicker
                            value={batch.date}
                            onChange={(d) => updateBatchDate(batch.id, d)}
                            placeholder="Chọn ngày"
                            format="DD/MM/YYYY"
                            size="small"
                            status={!batch.date ? 'warning' : undefined}
                          />
                        </div>
                        <Table<ParsedProduct>
                          columns={productColumns}
                          dataSource={batch.products}
                          size="small"
                          bordered
                          pagination={false}
                          scroll={{ y: 200 }}
                        />
                      </div>
                    )
                  };
                })}
              />

              {/* ── Actions ──────────────────────────────────── */}
              <div className="flex items-center justify-between border-t border-gray-100 pt-4 dark:border-gray-700">
                <span className="text-sm text-gray-500">
                  Sẽ import{' '}
                  <strong className="text-blue-600">{batches.length}</strong>{' '}
                  bảng,{' '}
                  <strong className="text-blue-600">{totalProducts}</strong> sản
                  phẩm, tổng{' '}
                  <strong className="text-blue-600">
                    {totalQty.toLocaleString('vi-VN')}
                  </strong>
                </span>
                <div className="flex gap-2">
                  <Button onClick={handleCancel}>Hủy</Button>
                  <Button
                    variant="solid"
                    color="blue"
                    onClick={handleSubmit}
                    disabled={!allDatesSet || batches.length === 0}
                    loading={submitting}
                  >
                    Import {batches.length} bảng
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </Spin>
    </Modal>
  );
};

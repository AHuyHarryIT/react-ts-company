export interface BarcodeInfo {
  product_id: number;
  separator: string;
  date: string;
  shift: number;
  bin_number: number;
  lot_code?: string;
}

export interface StorageProduct {
  id: number;
  product_id: number;
  lot: string;
  bin: number;
  quantity: number;
  barcode: string;
}

export interface StockTransaction {
  id: number;
  storage_product_id?: number;
  type: 'in' | 'out';
  quantity: number;
  remaining_quantity: number;
  employee_id: string;
  created_at: string;
  updated_at?: string;
  storage_product?: {
    id: number;
    product_id: number;
    employee_id: string;
    bin: number;
    quantity: number;
    barcode: string;
    lot: string;
    created_at: string;
    updated_at: string;
    deleted_at: null;
    product: {
      id: number;
      code: string;
      name: string;
      quantity: number;
      quantityCaTon: null;
      moldSize: string;
      CAV: number;
      cycle: number;
      FAPV: number;
      FASV: number;
      FAVV: number;
      planTime: null;
      realTime: null;
      binCode: string;
      quanEntityBin: number;
      material: string;
      color: string;
      quantity_per_package: number;
      deleted_at: null;
      created_at: string;
      updated_at: string;
    };
  };
  employee?: {
    id: string;
    name: string;
    email: null;
    phone: string;
    address: string;
    home_town: string;
    gender: string;
    birthday: string;
    CCCD: string;
    photo: string;
    card_photo: string;
    marital_status: string;
    date_joining: string;
    role_id: number;
    calendar_category_id: number;
    company: string;
    deleted_at: null;
    created_at: string;
    updated_at: string;
  };
}

export interface ScanRequest {
  barcode: string;
}

export interface ScanResponse {
  success: boolean;
  message: string;
  data: {
    storage_product?: StorageProduct;
    transaction?: StockTransaction;
    barcode_info: BarcodeInfo;
    quantity_entered?: number;
    quantity_exported?: number;
    quantity_per_bin?: number;
    total_bins?: number;
  };
}

export interface ScanInResponse extends ScanResponse {
  data: ScanResponse['data'] & {
    transaction: StockTransaction;
    quantity_entered: number;
  };
}

export interface ScanOutResponse extends ScanResponse {
  data: ScanResponse['data'] & {
    transaction: StockTransaction;
    quantity_exported: number;
  };
}

export interface TransactionListParams {
  type?: 'in' | 'out';
  storage_product_id?: number;
  employee_id?: string;
  from_date?: string;
  to_date?: string;
  search?: string;
  per_page?: number;
  page?: number;
}

export interface TransactionListResponse {
  current_page: number;
  data: StockTransaction[];
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  links: Array<{
    url: string | null;
    label: string;
    active: boolean;
  }>;
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number;
}

export interface StatisticsResponse {
  success: boolean;
  data: {
    summary: {
      total_in: number;
      total_out: number;
      net_change: number;
      total_transactions: number;
    };
    top_products: Array<{
      product_id: number;
      product_name?: string;
      total_quantity: number;
      transaction_count: number;
    }>;
  };
}

// New Current Stock API types
export interface CurrentStockItem {
  id: number;
  product_id: number;
  product_name: string;
  lot: string;
  bin: number;
  current_quantity: number;
  total_quantity: number;
  barcode: string;
  created_at: string;
  product?: {
    id: number;
    code: string;
    name: string;
    material: string;
    color: string;
    quanEntityBin: number;
  };
}

export interface CurrentStockResponse {
  success: boolean;
  message: string;
  data: {
    summary: {
      total_bins: number;
      total_products: number;
      total_quantity: number;
    };
    top_products: CurrentStockItem[];
  };
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  data?: unknown;
  example?: string;
}

export type TransactionType = 'in' | 'out' | 'scan';

export interface ScanHistoryItem {
  barcode: string;
  type: TransactionType;
  timestamp: string;
  success: boolean;
  message: string;
  data?: unknown;
}

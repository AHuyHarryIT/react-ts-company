export interface LoginHistoryItemType {
  id: number;
  employee_id: number;
  employee_name: string;
  employee_code: string;
  activity_type: string;
  ip_address: string;
  user_agent: string;
  login_count: number;
  description: string;
  last_activity_time?: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface PaginationLinkType {
  url: string | null;
  label: string;
  active: boolean;
}

export interface HistoryPaginationType {
  current_page: number;
  data: LoginHistoryItemType[];
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  links: PaginationLinkType[];
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number;
}

export interface HistoryResponseType {
  loginHistory: HistoryPaginationType;
  days: string[];
  selectedDate: string;
  activityTypes: string[];
  months: string[];
  selectedMonthYear: string;
  translatedCalendarDetails: Record<string, string>;
  totalHistoryOverall: string;
  totalHistoryCurrentPage?: string;
}

export interface HistoryFiltersType {
  page?: number;
  per_page?: number;
  date?: string;
  month?: string;
  activity_type?: string;
}

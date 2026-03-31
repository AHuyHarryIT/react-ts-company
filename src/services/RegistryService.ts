import axiosPrivate from '@/api/axiosInstance';

// ─── Registry Types ─────────────────────────────────────────────────────────

export interface RegistryRoute {
  methods: string[];
  uri: string;
  name: string | null;
  action: string;
  module: string;
  user_type: 'public' | 'authenticated' | 'admin' | 'employee' | 'super_admin';
  permission: string | null;
  auth_required: boolean;
  be_status: 'done' | 'missing' | 'unknown';
}

export interface RegistrySummary {
  total_routes: number;
  total_modules: number;
  by_module: Record<string, number>;
}

export interface RegistryResponse {
  success: boolean;
  generated_at: string;
  summary: RegistrySummary;
  modules: string[];
  routes: RegistryRoute[];
}

export interface RegistryQueryParams {
  search?: string;
  module?: string;
}

// ─── Registry Endpoint (/api/registry) — Super Admin only ───────────────────

/** GET /api/registry — Get all registered API routes */
export const fetchRegistry = async (
  params?: RegistryQueryParams
): Promise<RegistryResponse> => {
  const queryParams: Record<string, unknown> = {};
  if (params?.search) queryParams.search = params.search;
  if (params?.module) queryParams.module = params.module;

  const res = await axiosPrivate.get('/api/registry', { params: queryParams });
  return res as unknown as RegistryResponse;
};

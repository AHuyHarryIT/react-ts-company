import axiosPrivate from '@/api/axiosInstance';
import { Permission } from '@/types/permissionType';
import { SidebarItem } from '@/types/menuItem';

// ─── RBAC Types ───────────────────────────────────────────────────────────────

export interface RBACRole {
  id: string; // Note: role ID is string from backend
  role_name: string;
  permissions?: Permission[];
}

/** GET /api/rbac response */
export interface RBACIndexResponse {
  roles: RBACRole[];
  permissions: Permission[];
  selected_roles: RBACRole[];
  selected_role_ids: number[];
  role_permissions: Record<string, number[]>; // { "role_id": [permission_ids] }
  permissions_sidebar: Permission[];
  sidebar_items_by_permission: Record<string, SidebarItem[]>;
}

/** POST /api/rbac/save payload */
export interface SaveRBACPayload {
  role_ids: number[];
  permissions: number[];
}

/** POST /api/rbac/create-admin-user payload */
export interface CreateAdminUserPayload {
  name: string;
  role?: 'admin' | 'co-admin';
}

/** POST /api/rbac/create-admin-user response */
export interface CreateAdminUserResponse {
  message: string;
  admin_user: {
    id: string;
    name: string;
    phone: string;
    role_id: number;
    role_name: string;
  };
}

export interface PermissionPayload {
  key: string;
  name: string;
  icon?: string;
  url?: string;
  sort_order?: number;
  type: 'admin' | 'employee' | 'both';
  module: string;
  display_area: 'sidebar' | 'home' | 'both';
}

/** GET /api/permissions response */
export interface PermissionIndexResponse {
  home_permissions: Permission[];
  sidebar_permissions: Permission[]; // có kèm sidebar_items
  all_permissions: Permission[];
}

/** GET /api/permissions/sidebar-items/all response */
export interface SidebarItemsAllResponse {
  sidebar_items: SidebarItem[];
  grouped_by_permission: Record<string, SidebarItem[]>;
}

export interface SidebarItemPayload {
  permission_id: number;
  key: string;
  title: string;
  icon?: string;
}

// ─── RBAC Endpoints (/api/rbac) — Super Admin only ───────────────────────────

/** GET /api/rbac — Get all RBAC data (roles, permissions, mapping) */
export const fetchRBACData = async (
  roleIds?: number[]
): Promise<RBACIndexResponse> => {
  const params: Record<string, unknown> = {};
  if (roleIds?.length) {
    params['role_ids[]'] = roleIds;
  }
  const res = await axiosPrivate.get('/api/rbac', { params });
  return res as unknown as RBACIndexResponse;
};

/** POST /api/rbac/save — Save permissions for selected roles */
export const saveRBACData = (payload: SaveRBACPayload): Promise<unknown> => {
  return axiosPrivate.post('/api/rbac/save', payload);
};

/** POST /api/rbac/create-admin-user — Create an admin user (only name required) */
export const createAdminUser = (
  payload: CreateAdminUserPayload
): Promise<CreateAdminUserResponse> => {
  return axiosPrivate.post(
    '/api/rbac/create-admin-user',
    payload
  ) as Promise<CreateAdminUserResponse>;
};

/** Admin user list item */
export interface AdminUser {
  id: string;
  name: string;
  phone: string;
  role_id: number;
  role_name: string;
  direct_permissions_count?: number;
  created_at: string;
  updated_at: string;
}

/** GET /api/rbac/admin-users/{id}/permissions response */
export interface UserPermissionsResponse {
  user: Pick<AdminUser, 'id' | 'name' | 'phone' | 'role_id' | 'role_name'>;
  role_permissions: number[]; // quyền kế thừa từ role
  granted_permissions: number[]; // quyền được thêm trực tiếp (ngoài role)
  denied_permissions: number[]; // quyền bị chặn (từ role nhưng bị deny)
  all_permissions: Permission[]; // danh sách tất cả permissions
}

/** POST /api/rbac/admin-users/{id}/permissions payload */
export interface SaveUserPermissionsPayload {
  granted_ids: number[]; // quyền thêm ngoài role
  denied_ids: number[]; // quyền chặn từ role
}

/** GET /api/rbac/admin-users response */
export interface AdminUsersResponse {
  admin_users: AdminUser[];
  total: number;
}

/** GET /api/rbac/admin-users — List all admin users */
export const fetchAdminUsers = async (
  search?: string,
  role?: 'admin' | 'co-admin'
): Promise<AdminUsersResponse> => {
  const params: Record<string, unknown> = {};
  if (search) params.search = search;
  if (role) params.role = role;
  const res = await axiosPrivate.get('/api/rbac/admin-users', { params });
  return res as unknown as AdminUsersResponse;
};

/** DELETE /api/rbac/admin-users/{id} — Delete an admin user (soft delete) */
export const deleteAdminUser = (id: string): Promise<{ message: string }> => {
  return axiosPrivate.delete(`/api/rbac/admin-users/${id}`) as Promise<{
    message: string;
  }>;
};

/** GET /api/rbac/admin-users/{id}/permissions — Get user's direct + role permissions */
export const fetchUserPermissions = async (
  userId: string
): Promise<UserPermissionsResponse> => {
  const res = await axiosPrivate.get(
    `/api/rbac/admin-users/${userId}/permissions`
  );
  return res as unknown as UserPermissionsResponse;
};

/** POST /api/rbac/admin-users/{id}/permissions — Save direct permissions for user */
export const saveUserPermissions = async (
  userId: string,
  payload: SaveUserPermissionsPayload
): Promise<{ message: string }> => {
  const res = await axiosPrivate.post(
    `/api/rbac/admin-users/${userId}/permissions`,
    payload
  );
  return res as unknown as { message: string };
};

/** GET /api/rbac/roles/{roleId}/permissions — Permissions for a single role */
export const fetchRolePermissions = async (
  roleId: number | string
): Promise<{ role: RBACRole; permissions: Permission[] }> => {
  const res = await axiosPrivate.get(`/api/rbac/roles/${roleId}/permissions`);
  return res as unknown as { role: RBACRole; permissions: Permission[] };
};

// ─── Permission Endpoints (/api/permissions) — Super Admin only ──────────────

/** GET /api/permissions — List all permissions (grouped) */
export const fetchPermissions = async (): Promise<PermissionIndexResponse> => {
  const res = await axiosPrivate.get('/api/permissions');
  return res as unknown as PermissionIndexResponse;
};

/** POST /api/permissions — Create a permission */
export const createPermission = async (
  payload: PermissionPayload
): Promise<{ message: string; permission: Permission }> => {
  const res = await axiosPrivate.post('/api/permissions', payload);
  return res as unknown as { message: string; permission: Permission };
};

/** GET /api/permissions/{id} — Get single permission */
export const fetchPermission = async (id: number): Promise<Permission> => {
  const res = await axiosPrivate.get(`/api/permissions/${id}`);
  return res as unknown as Permission;
};

/** PUT /api/permissions/{id} — Update a permission */
export const updatePermission = async (
  id: number,
  payload: Partial<PermissionPayload>
): Promise<Permission> => {
  const res = await axiosPrivate.put(`/api/permissions/${id}`, payload);
  return res as unknown as Permission;
};

/** DELETE /api/permissions/{id} — Delete a permission (cascades sidebar items) */
export const deletePermission = (id: number): Promise<void> => {
  return axiosPrivate.delete(`/api/permissions/${id}`) as Promise<void>;
};

// ─── Sidebar Items Endpoints (/api/permissions/sidebar-items) ────────────────

/** GET /api/permissions/sidebar-items/all — All sidebar items */
export const fetchAllSidebarItems =
  async (): Promise<SidebarItemsAllResponse> => {
    const res = await axiosPrivate.get('/api/permissions/sidebar-items/all');
    return res as unknown as SidebarItemsAllResponse;
  };

/** POST /api/permissions/sidebar-items — Create a sidebar item */
export const createSidebarItem = async (
  payload: SidebarItemPayload
): Promise<SidebarItem> => {
  const res = await axiosPrivate.post(
    '/api/permissions/sidebar-items',
    payload
  );
  return res as unknown as SidebarItem;
};

/** PATCH /api/permissions/sidebar-items/{id} — Update a sidebar item */
export const updateSidebarItem = async (
  id: number,
  payload: Partial<SidebarItemPayload>
): Promise<SidebarItem> => {
  const res = await axiosPrivate.patch(
    `/api/permissions/sidebar-items/${id}`,
    payload
  );
  return res as unknown as SidebarItem;
};

/** DELETE /api/permissions/sidebar-items/{id} — Delete a sidebar item */
export const deleteSidebarItem = (id: number): Promise<void> => {
  return axiosPrivate.delete(
    `/api/permissions/sidebar-items/${id}`
  ) as Promise<void>;
};

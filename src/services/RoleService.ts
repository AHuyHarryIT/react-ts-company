import axiosPrivate from '@/api/axiosInstance';
import { RoleType } from '@/types/roleType';
import { handleApiError } from '@utils/handleApiError';

type FilterRole = {
  role_name?: string;
};

export type FetchRoleParams = {
  page?: number;
  limit?: number;
  filters?: FilterRole;
};

type RoleResponse = {
  id: number;
  role_name: string;
  created_at: string;
  updated_at: string;
};

//  Fetch all roles
export const apiFetchRoles = async ({
  page,
  limit,
  filters,
}: FetchRoleParams) => {
  try {
    const response = await axiosPrivate.get('/api/roles', {
      params: {
        page: page,
        limit: limit,
        ...filters,
      },
    });

    const roleList: RoleType[] = response.data.data.map(
      (role: RoleResponse) => {
        return {
          id: role.id,
          name: role.role_name,
          created_at: role.created_at,
          updated_at: role.updated_at,
        };
      }
    );

    const total: number = response.data.total;

    return {
      roles: roleList,
      total: total,
    };
  } catch (error) {
    throw handleApiError(error);
  }
};

// Add a new role
export const apiAddRole = async (roleName: string) => {
  try {
    await axiosPrivate.post('/api/roles', { role_name: roleName });
  } catch (error) {
    throw handleApiError(error);
  }
};

// Update a role
export const apiUpdateRole = async (id: string, roleName: string) => {
  try {
    await axiosPrivate.patch(`/api/roles/${id}`, { role_name: roleName });
  } catch (error) {
    throw handleApiError(error);
  }
};

// Delete a role
export const apiDeleteRole = async (id: string) => {
  try {
    await axiosPrivate.delete(`/api/roles/${id}`);
  } catch (error) {
    throw handleApiError(error);
  }
};

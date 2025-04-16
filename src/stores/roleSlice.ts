import { RoleType } from '@/types/roleType';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { apiFetchRoles, FetchRoleParams } from '@services/RoleService';
import { message } from 'antd';

interface RoleState {
  roles: RoleType[];
  deletingId: string | null;
  totalRoles: number;
  loading: boolean;
  error: string | null;
}

const initialState: RoleState = {
  roles: [],
  deletingId: null,
  totalRoles: 0,
  loading: false,
  error: null,
};

// Fetch all roles
export const fetchRoles = createAsyncThunk<
  { roles: RoleType[]; total: number },
  {
    params?: FetchRoleParams;
  }
>('roles/fetchRoles', async ({ params }, { rejectWithValue }) => {
  try {
    const response = await apiFetchRoles({
      ...params,
    });
    return response;
  } catch (error) {
    message.error(error as string);
    return rejectWithValue(error as string);
  }
});

const roleSlice = createSlice({
  name: 'roles',
  initialState,
  reducers: {
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRoles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchRoles.fulfilled,
        (
          state,
          action: PayloadAction<{
            roles: RoleType[];
            total: number;
          }>
        ) => {
          state.loading = false;
          state.roles = action.payload.roles;
          state.totalRoles = action.payload.total;
        }
      )
      .addCase(fetchRoles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setError } = roleSlice.actions;

export default roleSlice.reducer;

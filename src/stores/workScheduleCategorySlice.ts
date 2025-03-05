import { WorkScheduleCategoryType } from '@/types/workScheduleCategoryType';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  apiFetchWorkScheduleCategories,
  FetchWorkScheduleCategoryParams,
} from '@services/WorkScheduleCategoryService';
import { message } from 'antd';

interface WorkScheduleCategoryState {
  workScheduleCategories: WorkScheduleCategoryType[];
  loading: boolean;
  error: string | null;
  totalWorkScheduleCategories: number;
}

const initialState: WorkScheduleCategoryState = {
  workScheduleCategories: [],
  loading: false,
  error: null,
  totalWorkScheduleCategories: 0,
};

export const fetchWorkScheduleCategories = createAsyncThunk<
  { workScheduleCategories: WorkScheduleCategoryType[]; total: number },
  { params?: FetchWorkScheduleCategoryParams }
>(
  'workScheduleCategories/fetchWorkScheduleCategories',
  async ({ params }, { rejectWithValue }) => {
    try {
      const response = await apiFetchWorkScheduleCategories({ ...params });
      return response;
    } catch (error) {
      message.error(error as string);
      return rejectWithValue(error as string);
    }
  }
);

const workScheduleCategorySlice = createSlice({
  name: 'workScheduleCategories',
  initialState,
  reducers: {
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWorkScheduleCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchWorkScheduleCategories.fulfilled,
        (
          state,
          action: PayloadAction<{
            workScheduleCategories: WorkScheduleCategoryType[];
            total: number;
          }>
        ) => {
          state.loading = false;
          state.workScheduleCategories = action.payload.workScheduleCategories;
          state.totalWorkScheduleCategories = action.payload.total;
        }
      )
      .addCase(fetchWorkScheduleCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setError } = workScheduleCategorySlice.actions;

export default workScheduleCategorySlice.reducer;

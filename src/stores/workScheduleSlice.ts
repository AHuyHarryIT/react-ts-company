import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { WorkScheduleType } from '@/types/workScheduleType';
import {
  apiFetchWorkSchedules,
  FetchWorkScheduleParams,
} from '@services/workScheduleService';

interface WorkScheduleState {
  workSchedules: WorkScheduleType[];
  loading: boolean;
  error: string | null;
  totalWorkSchedules: number;
}

const initialState: WorkScheduleState = {
  workSchedules: [],
  loading: false,
  error: null,
  totalWorkSchedules: 0,
};

export const fetchWorkSchedules = createAsyncThunk<
  {
    workSchedules: WorkScheduleType[];
    total: number;
  },
  { params: FetchWorkScheduleParams }
>('workSchedules/fetchWorkSchedules', async ({ params }) => {
  const response = await apiFetchWorkSchedules({ ...params });
  return response;
});

const workScheduleSlice = createSlice({
  name: 'workSchedules',
  initialState,
  reducers: {
    setError(state, action) {
      state.error = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWorkSchedules.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWorkSchedules.fulfilled, (state, action) => {
        state.loading = false;
        state.workSchedules = action.payload.workSchedules;
        state.totalWorkSchedules = action.payload.total;
      })
      .addCase(fetchWorkSchedules.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch work Schedules';
      });
  },
});

export const { setError } = workScheduleSlice.actions;
export default workScheduleSlice.reducer;

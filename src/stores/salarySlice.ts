import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { SalaryType } from '@/types/salaryType';
import { apiFetchSalaries, FetchSalaryParams } from '@services/SalaryService';
import { message } from 'antd';

interface SalaryState {
  salaries: SalaryType[];
  loading: boolean;
  error: string | null;
  totalSalaries: number;
}

const initialState: SalaryState = {
  salaries: [],
  loading: false,
  error: null,
  totalSalaries: 0,
};

export const fetchSalaries = createAsyncThunk<
  { salaries: SalaryType[]; total: number },
  { params: FetchSalaryParams }
>('salaries/fetchSalaries', async ({ params }, { rejectWithValue }) => {
  // Replace with actual API call
  try {
    const response = await apiFetchSalaries({ ...params });

    return response;
  } catch (error) {
    message.error(error as string);
    return rejectWithValue(error as string);
  }
});

const salarySlice = createSlice({
  name: 'salaries',
  initialState,
  reducers: {
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSalaries.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchSalaries.fulfilled, (state, action) => {
        state.loading = false;
        state.salaries = action.payload.salaries;
        state.totalSalaries = action.payload.total;
      })
      .addCase(fetchSalaries.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch salaries';
      });
  },
});

export const { setError } = salarySlice.actions;
export default salarySlice.reducer;

import { EmployeeType } from '@/types/employeeType';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  apiDeleteEmployee,
  apiFetchEmployees,
  FetchEmployeesParams,
} from '@services/EmployeeService';

interface EmployeeState {
  employees: EmployeeType[];
  totalEmployees: number;
  deletingId: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: EmployeeState = {
  employees: [],
  totalEmployees: 0,
  deletingId: null,
  loading: false,
  error: null,
};

// fetch all employees
export const fetchEmployees = createAsyncThunk<
  {
    employees: EmployeeType[];
    total: number;
  },
  { params: FetchEmployeesParams }
>('employee/fetchEmployees', async ({ params }, { rejectWithValue }) => {
  try {
    const { employeeList, totalEmployees } = await apiFetchEmployees({
      ...params,
    });
    return { employees: employeeList, total: totalEmployees };
  } catch (error) {
    return rejectWithValue(error as string);
  }
});

// delete an employee
export const deleteEmployee = createAsyncThunk<
  void,
  { id: string; params: FetchEmployeesParams }
>(
  'employee/deleteEmployee',
  async ({ id, params }, { dispatch, rejectWithValue }) => {
    try {
      await apiDeleteEmployee(id);
      dispatch(fetchEmployees({ params }));
    } catch (error) {
      return rejectWithValue(error as string);
    }
  }
);

const employeeSlice = createSlice({
  name: 'employee',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchEmployees.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchEmployees.fulfilled,
        (
          state,
          action: PayloadAction<{
            employees: EmployeeType[];
            total: number;
          }>
        ) => {
          state.loading = false;
          state.employees = action.payload.employees;
          state.totalEmployees = action.payload.total;
        }
      )
      .addCase(fetchEmployees.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
    builder
      .addCase(deleteEmployee.pending, (state, action) => {
        state.deletingId = action.meta.arg.id;
      })
      .addCase(deleteEmployee.fulfilled, (state) => {
        state.deletingId = null;
      })
      .addCase(deleteEmployee.rejected, (state) => {
        state.deletingId = null;
      });
  },
});

export default employeeSlice.reducer;

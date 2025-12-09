import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { AxiosError } from 'axios';
import apiCaller from '../../api/client';
import { API_ENDPOINTS } from '../../api/endpoints';
import type { RootState } from '../store/store';

// ---------------- Types ----------------
export interface Outlet {
  id: string;
  name: string;
  address?: string;
  [key: string]: any;
}

interface OutletState {
  loading: boolean;
  error: string | null;
  outlets: Outlet[];
}

// ---------------- Initial State ----------------
const initialState: OutletState = {
  loading: false,
  error: null,
  outlets: [],
};

// ---------------- Thunks ----------------
export const getOutlets = createAsyncThunk<
  Outlet[],
  void,
  { rejectValue: { message: string } }
>(
  'outlet/getOutlets',
  async (_, thunkAPI) => {
    try {
      const response = await apiCaller({
        url: API_ENDPOINTS.outlet,
        method: 'GET',
      });

      if (response.status === 200) {
        const data = response.data as { outlets?: Outlet[] };
        return data.outlets || [];
      }

      return thunkAPI.rejectWithValue({
        message: (response.data as { message?: string })?.message || 'Failed to fetch outlets',
      });
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      return thunkAPI.rejectWithValue({
        message: err.response?.data?.message || 'Error fetching outlets',
      });
    }
  }
);

// ---------------- Slice ----------------
const outletSlice = createSlice({
  name: 'outlets',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // GET
      .addCase(getOutlets.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getOutlets.fulfilled, (state, action) => {
        state.loading = false;
        state.outlets = action.payload;
      })
      .addCase(getOutlets.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Error';
      });
  },
});

// ---------------- Selectors ----------------
export const selectOutletState = (state: RootState) => state.outlet;
export const selectOutlets = (state: RootState) => state.outlet.outlets;
export const selectOutletLoading = (state: RootState) => state.outlet.loading;

// ---------------- Exports ----------------
export default outletSlice.reducer;


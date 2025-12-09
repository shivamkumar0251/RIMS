import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { AxiosError } from 'axios';
import apiCaller from '../../api/client';
import { API_ENDPOINTS } from '../../api/endpoints';
import type { RootState } from '../store/store';

// ---------------- Types ----------------
export interface Franchise {
  id: string;
  name: string;
  location?: string;
  [key: string]: any;
}

interface FranchiseState {
  loading: boolean;
  error: string | null;
  franchises: Franchise[];
}

// ---------------- Initial State ----------------
const initialState: FranchiseState = {
  loading: false,
  error: null,
  franchises: [],
};

// ---------------- Thunks ----------------
export const getFranchises = createAsyncThunk<
  Franchise[],
  void,
  { rejectValue: { message: string } }
>(
  'franchise/getFranchises',
  async (_, thunkAPI) => {
    try {
      const response = await apiCaller({
        url: API_ENDPOINTS.franchise,
        method: 'GET',
      });

      if (response.status === 200) {
        const data = response.data as { franchises?: Franchise[] };
        return data.franchises || [];
      }

      return thunkAPI.rejectWithValue({
        message: (response.data as { message?: string })?.message || 'Failed to fetch franchises',
      });
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      return thunkAPI.rejectWithValue({
        message: err.response?.data?.message || 'Error fetching franchises',
      });
    }
  }
);

// ---------------- Slice ----------------
const franchiseSlice = createSlice({
  name: 'franchises',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // GET
      .addCase(getFranchises.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getFranchises.fulfilled, (state, action) => {
        state.loading = false;
        state.franchises = action.payload;
      })
      .addCase(getFranchises.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Error';
      });
  },
});

// ---------------- Selectors ----------------
export const selectFranchiseState = (state: RootState) => state.franchise;
export const selectFranchises = (state: RootState) => state.franchise.franchises;
export const selectFranchiseLoading = (state: RootState) => state.franchise.loading;

// ---------------- Exports ----------------
export default franchiseSlice.reducer;


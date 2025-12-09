import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { AxiosError } from 'axios';
import apiCaller from '../../api/client';
import { API_ENDPOINTS } from '../../api/endpoints';
import type { RootState } from '../store/store';

// ---------------- Types ----------------
export interface FranchiseInquiry {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  pincode: string;
  createdAt?: string;
  [key: string]: any;
}

interface FranchiseInquiryState {
  loading: boolean;
  error: string | null;
  message: string | null;
  inquiry: FranchiseInquiry | null;
}

// ---------------- Initial State ----------------
const initialState: FranchiseInquiryState = {
  loading: false,
  error: null,
  message: null,
  inquiry: null,
};

// ---------------- Thunks ----------------
export const submitFranchiseInquiry = createAsyncThunk<
  { message: string; inquiry: FranchiseInquiry },
  { fullName: string; email: string; phone: string; address: string; pincode: string },
  { rejectValue: { message: string } }
>(
  'franchiseInquiry/submitFranchiseInquiry',
  async ({ fullName, email, phone, address, pincode }, thunkAPI) => {
    try {
      const response = await apiCaller({
        url: API_ENDPOINTS.franchiseInquiry,
        method: 'POST',
        data: { fullName, email, phone, address, pincode },
      });

      if (response.status === 201 || response.status === 200) {
        const data = response.data as { message?: string; inquiry?: FranchiseInquiry };
        return {
          message: data.message || 'Inquiry submitted successfully',
          inquiry: data.inquiry || {} as FranchiseInquiry,
        };
      }

      return thunkAPI.rejectWithValue({
        message: (response.data as { message?: string })?.message || 'Submit inquiry failed',
      });
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      return thunkAPI.rejectWithValue({
        message: err.response?.data?.message || 'Server error',
      });
    }
  }
);

// ---------------- Slice ----------------
const franchiseInquirySlice = createSlice({
  name: 'franchiseInquiry',
  initialState,
  reducers: {
    clearInquiry: (state) => {
      state.inquiry = null;
      state.message = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // SUBMIT
      .addCase(submitFranchiseInquiry.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(submitFranchiseInquiry.fulfilled, (state, action) => {
        state.loading = false;
        state.message = action.payload.message;
        state.inquiry = action.payload.inquiry;
      })
      .addCase(submitFranchiseInquiry.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Submit inquiry failed';
      });
  },
});

// ---------------- Selectors ----------------
export const selectFranchiseInquiryState = (state: RootState) => state.franchiseInquiry;
export const selectFranchiseInquiry = (state: RootState) => state.franchiseInquiry.inquiry;
export const selectFranchiseInquiryLoading = (state: RootState) => state.franchiseInquiry.loading;
export const selectFranchiseInquiryMessage = (state: RootState) => state.franchiseInquiry.message;

// ---------------- Exports ----------------
export const { clearInquiry } = franchiseInquirySlice.actions;
export default franchiseInquirySlice.reducer;


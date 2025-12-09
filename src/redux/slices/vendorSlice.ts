import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { AxiosError } from 'axios';
import apiCaller from '../../api/client';
import { API_ENDPOINTS } from '../../api/endpoints';
import type { RootState } from '../store/store';

// ---------------- Types ----------------
export interface Vendor {
  _id: string;
  vendorName?: string;
  [key: string]: any;
}

interface VendorState {
  loading: boolean;
  error: string | null;
  vendors: Vendor[];
  vendorNames: string[];
  allVendorsData: GetVendorsResponse | null;
}

// ---------------- BULK UPLOAD VENDOR via EXCEL ----------------
export interface BulkVendorExcelResponse {
  success: boolean;
  inserted: number;
  failed: number;
  errors?: { row: number; message: string }[];
  data: Vendor[];
}

// GET vendors
interface GetVendorsResponse {
  success: boolean;
  total: number;
  currentPage: number;
  totalPages: number;
  count: number;
  data: Vendor[];
}

// ---------------- Initial State ----------------
const initialState: VendorState = {
  loading: false,
  error: null,
  vendors: [],
  vendorNames: [],
  allVendorsData: null,
};

// ---------------- Thunks ----------------
// GET VENDOR NAME LIST
export const getVendorNameList = createAsyncThunk<
  string[],
  void,
  { rejectValue: { message: string } }
>(
  'vendor/getVendorNameList',
  async (_, thunkAPI) => {
    try {
      const response = await apiCaller({
        url: API_ENDPOINTS.GET_VENDOR_NAME_LIST,
        method: 'GET',
      });

      if (response.status === 200) {
        return response.data as string[];
      }

      return thunkAPI.rejectWithValue({
        message: (response.data as { message?: string })?.message || 'Failed to fetch vendor names',
      });
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      return thunkAPI.rejectWithValue({
        message: err.response?.data?.message || 'Error fetching vendor names',
      });
    }
  }
);

export const getVendors = createAsyncThunk<
  GetVendorsResponse,
  { search?: string; page?: number; limit?: number; fromDate?: string; toDate?: string },
  { rejectValue: { message: string } }
>(
  'vendor/getVendors',
  async ({ search = '', page = 1, limit = 5, fromDate = '', toDate = '' }, thunkAPI) => {
    try {
      const url = `${API_ENDPOINTS.GET_VENDOR_DATA}?search=${search}&page=${page}&limit=${limit}&fromDate=${fromDate}&toDate=${toDate}`;

      const response = await apiCaller({ url, method: 'GET' });

      if (response.status === 200) {
        const body = response.data as GetVendorsResponse;
        return body;
      }

      return thunkAPI.rejectWithValue({
        message: (response.data as { message?: string })?.message || 'Failed to fetch vendors',
      });
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      return thunkAPI.rejectWithValue({
        message: err.response?.data?.message || 'Error fetching vendors',
      });
    }
  }
);

// ADD VENDOR
export const addVendor = createAsyncThunk<
  Vendor,
  Partial<Vendor>,
  { rejectValue: { message: string } }
>(
  'vendor/addVendor',
  async (vendorData, thunkAPI) => {
    try {
      const response = await apiCaller({
        url: API_ENDPOINTS.ADD_VENDOR_DATA,
        method: 'POST',
        data: vendorData,
      });

      if (response.status === 201) {
        return response?.data as Vendor;
      }

      return thunkAPI.rejectWithValue({
        message: (response.data as { message?: string })?.message || 'Add vendor failed',
      });
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      return thunkAPI.rejectWithValue({
        message: err.response?.data?.message || 'Server error',
      });
    }
  }
);

// ADD BULK-EXCEL
export const addVendorBulkExcel = createAsyncThunk<
  BulkVendorExcelResponse,
  FormData,
  { rejectValue: { message: string } }
>(
  'vendor/addVendorBulkExcel',
  async (formData, thunkAPI) => {
    try {
      const response = await apiCaller({
        url: API_ENDPOINTS.ADD_BULK_EXCEL_VENDOR,
        method: 'POST',
        data: formData,
      });

      if (response.status === 201 || response.status === 200) {
        return response.data as BulkVendorExcelResponse;
      }

      return thunkAPI.rejectWithValue({
        message:
          (response.data as { message?: string })?.message ||
          'Bulk vendor upload failed',
      });

    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      return thunkAPI.rejectWithValue({
        message: err.response?.data?.message || 'Server error in bulk upload',
      });
    }
  }
);

// UPDATE VENDOR
export const updateVendor = createAsyncThunk<
  Vendor,
  { vendorId: string; vendorData: Partial<Vendor> },
  { rejectValue: { message: string } }
>(
  'vendor/updateVendor',
  async ({ vendorId, vendorData }, thunkAPI) => {
    try {
      const response = await apiCaller({
        url: API_ENDPOINTS.UPDATE_VENDOR(vendorId),
        method: 'PUT',
        data: vendorData,
      });

      if (response.status === 200) {
        return response.data as Vendor;
      }

      return thunkAPI.rejectWithValue({
        message: (response.data as { message?: string })?.message || 'Update failed',
      });
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      return thunkAPI.rejectWithValue({
        message: err.response?.data?.message || 'Server error',
      });
    }
  }
);

// DELETE VENDOR
export const deleteVendor = createAsyncThunk<
  { vendorId: string },
  string,
  { rejectValue: { message: string } }
>(
  'vendor/deleteVendor',
  async (vendorId, thunkAPI) => {
    try {
      const response = await apiCaller({
        url: API_ENDPOINTS.DELETE_VENDOR(vendorId),
        method: 'DELETE',
      });

      if (response.status === 200) {
        return { vendorId };
      }

      return thunkAPI.rejectWithValue({
        message: (response.data as { message?: string })?.message || 'Delete failed',
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
const vendorSlice = createSlice({
  name: 'vendors',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // GET VENDOR NAMES
      .addCase(getVendorNameList.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getVendorNameList.fulfilled, (state, action) => {
        state.loading = false;
        state.vendorNames = action.payload;
      })
      .addCase(getVendorNameList.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Error';
      })

      // GET
      .addCase(getVendors.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getVendors.fulfilled, (state, action) => {
        state.loading = false;
        state.allVendorsData = action.payload;
        state.vendors = action.payload.data;
      })
      .addCase(getVendors.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Error';
      })

      // ADD
      .addCase(addVendor.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addVendor.fulfilled, (state, action) => {
        state.loading = false;
        state.vendors.push(action.payload);
      })
      .addCase(addVendor.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Add vendor failed';
      })
      .addCase(addVendorBulkExcel.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addVendorBulkExcel.fulfilled, (state, action) => {
        state.loading = false;

        // Merge uploaded vendors into existing list
        if (action.payload?.data?.length) {
          state.vendors = [...state.vendors, ...action.payload.data];
        }
      })
      .addCase(addVendorBulkExcel.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Bulk upload failed';
      })

      // UPDATE
      .addCase(updateVendor.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateVendor.fulfilled, (state, action) => {
        state.loading = false;
        state.vendors = state.vendors.map((vendor) =>
          vendor._id === action.payload._id ? action.payload : vendor
        );
      })
      .addCase(updateVendor.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Update vendor failed';
      })

      // DELETE
      .addCase(deleteVendor.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteVendor.fulfilled, (state, action) => {
        state.loading = false;
        state.vendors = state.vendors.filter(
          (vendor) => vendor._id !== action.payload.vendorId
        );
      })
      .addCase(deleteVendor.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Delete vendor failed';
      });
  },
});

// ---------------- Selectors ----------------
export const selectVendorState = (state: RootState) => state.vendor;
export const selectVendors = (state: RootState) => state.vendor.vendors;
export const selectVendorNames = (state: RootState) => state.vendor.vendorNames;
export const selectVendorLoading = (state: RootState) => state.vendor.loading;
export const selectAllVendorsData = (state: RootState) => state.vendor.allVendorsData;

// ---------------- Exports ----------------
export default vendorSlice.reducer;


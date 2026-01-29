import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { AxiosError } from 'axios';
import apiCaller from '../../api/client';
import { API_ENDPOINTS } from '../../api/endpoints';
import type { RootState } from '../store/store';
import type { ProductInterface } from './productSlice';

// ---------------- Types ----------------

export interface StoreStockPostData {
  productId: string;
  qty: number;
  expiryDate?: string;
  type?: string;
}

export interface StoreStock {
  _id: string;
  franchiseId: string;
  productId: ProductInterface;
  openingStock: number;
  rcvdStoreQty: number;
  transfersToKitchenStore: number;
  closingStock: number;
  expiryDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
}
// GET store stocks
interface GetStoreStocksResponse {
  success: boolean;
  data: StoreStock[];
  pagination: PaginationInfo;
}

// ---------------- Initial State ----------------
interface StoreStockState {
  loading: boolean;
  error: string | null;
  storeStocks: StoreStock[];
  allStoreStocksData: GetStoreStocksResponse | null;
}
const initialState: StoreStockState = {
  loading: false,
  error: null,
  storeStocks: [],
  allStoreStocksData: null,
};

// ---------------- Thunks ----------------
export const getStoreStocks = createAsyncThunk<
  GetStoreStocksResponse,
  { search?: string; page?: number; limit?: number; fromDate?: string; toDate?: string, categoryId?: string, vendorId?: string, companyId?: string, },
  { rejectValue: { message: string } }
>(
  'storeStock/getStoreStocks',
  async ({ search = '', page = 1, limit = 5, fromDate = '', toDate = '', categoryId = '', vendorId = '', companyId = '', }, thunkAPI) => {
    try {
      const url = `${API_ENDPOINTS.GET_STORE_STOCK}?search=${search}&categoryId=${categoryId}&vendorId=${vendorId}&companyId=${companyId}&page=${page}&limit=${limit}&fromDate=${fromDate}&toDate=${toDate}`;

      const response = await apiCaller({ url, method: 'GET' });

      if (response.status === 200) {
        const body = response.data as GetStoreStocksResponse;
        return body;
      }

      return thunkAPI.rejectWithValue({
        message: (response.data as { message?: string })?.message || 'Failed to fetch store stocks',
      });
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      return thunkAPI.rejectWithValue({
        message: err.response?.data?.message || 'Error fetching store stocks',
      });
    }
  }
);

// ADD STORE STOCK
export const addStoreStock = createAsyncThunk<
  StoreStock,
  StoreStockPostData[],
  { rejectValue: { message: string } }
>(
  'storeStock/addStoreStock',
  async (storeStockData, thunkAPI) => {
    try {
      const response = await apiCaller({
        url: API_ENDPOINTS.ADD_BULK_STORE_STOCK,
        method: 'POST',
        data: storeStockData,
      });

      if (response.status === 201) {
        return response?.data as StoreStock;
      }

      return thunkAPI.rejectWithValue({
        message: (response.data as { message?: string })?.message || 'Add store stock failed',
      });
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      return thunkAPI.rejectWithValue({
        message: err.response?.data?.message || 'Server error',
      });
    }
  }
);

// UPDATE STORE STOCK
export const updateStoreStock = createAsyncThunk<
  StoreStock,
  { storeStockId: string; storeStockData: Partial<StoreStock> },
  { rejectValue: { message: string } }
>(
  'storeStock/updateStoreStock',
  async ({ storeStockId, storeStockData }, thunkAPI) => {
    try {
      const response = await apiCaller({
        url: API_ENDPOINTS.UPDATE_STORE_STOCK(storeStockId),
        method: 'PUT',
        data: storeStockData,
      });

      if (response.status === 200) {
        // Support both wrapped { data: ... } and direct formats
        const responseData = response.data as any;
        return (responseData.data || responseData) as StoreStock;
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

// DELETE STORE STOCK
export const deleteStoreStock = createAsyncThunk<
  { storeStockId: string },
  string,
  { rejectValue: { message: string } }
>(
  'storeStock/deleteStoreStock',
  async (storeStockId, thunkAPI) => {
    try {
      const response = await apiCaller({
        url: API_ENDPOINTS.DELETE_STORE_STOCK(storeStockId),
        method: 'DELETE',
      });

      if (response.status === 200) {
        return { storeStockId };
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
const storeStockSlice = createSlice({
  name: 'storeStocks',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // GET
      .addCase(getStoreStocks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getStoreStocks.fulfilled, (state, action) => {
        state.loading = false;
        state.allStoreStocksData = action.payload;
        state.storeStocks = action.payload.data;
      })
      .addCase(getStoreStocks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Error';
      })

      // ADD
      .addCase(addStoreStock.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addStoreStock.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(addStoreStock.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Add store stock failed';
      })

      // UPDATE
      .addCase(updateStoreStock.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateStoreStock.fulfilled, (state, action) => {
        state.loading = false;
        state.storeStocks = state.storeStocks.map((storeStock) =>
          storeStock._id === action.payload._id ? { ...storeStock, ...action.payload } : storeStock
        );
      })
      .addCase(updateStoreStock.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Update store stock failed';
      })

      // DELETE
      .addCase(deleteStoreStock.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteStoreStock.fulfilled, (state, action) => {
        state.loading = false;
        state.storeStocks = state.storeStocks.filter(
          (storeStock) => storeStock._id !== action.payload.storeStockId
        );
      })
      .addCase(deleteStoreStock.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Delete store stock failed';
      });
  },
});

// ---------------- Selectors ----------------
export const selectStoreStockState = (state: RootState) => state.storeStock;
export const selectStoreStocks = (state: RootState) => state.storeStock.storeStocks;
export const selectStoreStockLoading = (state: RootState) => state.storeStock.loading;
export const selectAllStoreStocksData = (state: RootState) => state.storeStock.allStoreStocksData;

// ---------------- Exports ----------------
export default storeStockSlice.reducer;


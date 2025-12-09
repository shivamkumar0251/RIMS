import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { AxiosError } from 'axios';
import apiCaller from '../../api/client';
import { API_ENDPOINTS } from '../../api/endpoints';
import type { RootState } from '../store/store';

// ---------------- Types ----------------
export interface KitchenStock {
  _id: string;
  [key: string]: any;
}

interface KitchenStockState {
  loading: boolean;
  error: string | null;
  kitchenStocks: KitchenStock[];
  allKitchenStocksData: GetKitchenStocksResponse | null;
}

// GET kitchen stocks
interface GetKitchenStocksResponse {
  success: boolean;
  total: number;
  currentPage: number;
  totalPages: number;
  count: number;
  data: KitchenStock[];
}

// ---------------- Initial State ----------------
const initialState: KitchenStockState = {
  loading: false,
  error: null,
  kitchenStocks: [],
  allKitchenStocksData: null,
};

// ---------------- Thunks ----------------
export const getKitchenStocks = createAsyncThunk<
  GetKitchenStocksResponse,
  { search?: string; page?: number; limit?: number; fromDate?: string; toDate?: string },
  { rejectValue: { message: string } }
>(
  'kitchenStock/getKitchenStocks',
  async ({ search = '', page = 1, limit = 5, fromDate = '', toDate = '' }, thunkAPI) => {
    try {
      const url = `${API_ENDPOINTS.GET_KITCHEN_STOCK}?search=${search}&page=${page}&limit=${limit}&fromDate=${fromDate}&toDate=${toDate}`;

      const response = await apiCaller({ url, method: 'GET' });

      if (response.status === 200) {
        const body = response.data as GetKitchenStocksResponse;
        return body;
      }

      return thunkAPI.rejectWithValue({
        message: (response.data as { message?: string })?.message || 'Failed to fetch kitchen stocks',
      });
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      return thunkAPI.rejectWithValue({
        message: err.response?.data?.message || 'Error fetching kitchen stocks',
      });
    }
  }
);

// ADD KITCHEN STOCK
export const addKitchenStock = createAsyncThunk<
  KitchenStock,
  Partial<KitchenStock>,
  { rejectValue: { message: string } }
>(
  'kitchenStock/addKitchenStock',
  async (kitchenStockData, thunkAPI) => {
    try {
      const response = await apiCaller({
        url: API_ENDPOINTS.ADD_KITCHEN_STOCK,
        method: 'POST',
        data: kitchenStockData,
      });

      if (response.status === 201) {
        return response?.data as KitchenStock;
      }

      return thunkAPI.rejectWithValue({
        message: (response.data as { message?: string })?.message || 'Add kitchen stock failed',
      });
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      return thunkAPI.rejectWithValue({
        message: err.response?.data?.message || 'Server error',
      });
    }
  }
);

// UPDATE KITCHEN STOCK
export const updateKitchenStock = createAsyncThunk<
  KitchenStock,
  { kitchenStockId: string; kitchenStockData: Partial<KitchenStock> },
  { rejectValue: { message: string } }
>(
  'kitchenStock/updateKitchenStock',
  async ({ kitchenStockId, kitchenStockData }, thunkAPI) => {
    try {
      const response = await apiCaller({
        url: API_ENDPOINTS.UPDATE_KITCHEN_STOCK(kitchenStockId),
        method: 'PUT',
        data: kitchenStockData,
      });

      if (response.status === 200) {
        return response.data as KitchenStock;
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

// DELETE KITCHEN STOCK
export const deleteKitchenStock = createAsyncThunk<
  { kitchenStockId: string },
  string,
  { rejectValue: { message: string } }
>(
  'kitchenStock/deleteKitchenStock',
  async (kitchenStockId, thunkAPI) => {
    try {
      const response = await apiCaller({
        url: API_ENDPOINTS.DELETE_KITCHEN_STOCK(kitchenStockId),
        method: 'DELETE',
      });

      if (response.status === 200) {
        return { kitchenStockId };
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
const kitchenStockSlice = createSlice({
  name: 'kitchenStocks',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // GET
      .addCase(getKitchenStocks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getKitchenStocks.fulfilled, (state, action) => {
        state.loading = false;
        state.allKitchenStocksData = action.payload;
        state.kitchenStocks = action.payload.data;
      })
      .addCase(getKitchenStocks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Error';
      })

      // ADD
      .addCase(addKitchenStock.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addKitchenStock.fulfilled, (state, action) => {
        state.loading = false;
        state.kitchenStocks.push(action.payload);
      })
      .addCase(addKitchenStock.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Add kitchen stock failed';
      })

      // UPDATE
      .addCase(updateKitchenStock.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateKitchenStock.fulfilled, (state, action) => {
        state.loading = false;
        state.kitchenStocks = state.kitchenStocks.map((kitchenStock) =>
          kitchenStock._id === action.payload._id ? action.payload : kitchenStock
        );
      })
      .addCase(updateKitchenStock.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Update kitchen stock failed';
      })

      // DELETE
      .addCase(deleteKitchenStock.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteKitchenStock.fulfilled, (state, action) => {
        state.loading = false;
        state.kitchenStocks = state.kitchenStocks.filter(
          (kitchenStock) => kitchenStock._id !== action.payload.kitchenStockId
        );
      })
      .addCase(deleteKitchenStock.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Delete kitchen stock failed';
      });
  },
});

// ---------------- Selectors ----------------
export const selectKitchenStockState = (state: RootState) => state.kitchenStock;
export const selectKitchenStocks = (state: RootState) => state.kitchenStock.kitchenStocks;
export const selectKitchenStockLoading = (state: RootState) => state.kitchenStock.loading;
export const selectAllKitchenStocksData = (state: RootState) => state.kitchenStock.allKitchenStocksData;

// ---------------- Exports ----------------
export default kitchenStockSlice.reducer;


import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { AxiosError } from 'axios';
import apiCaller from '../../api/client';
import { API_ENDPOINTS } from '../../api/endpoints';
import type { RootState } from '../store/store';

// ---------------- Types ----------------
export interface ConsumableStock {
  _id: string;
  [key: string]: any;
}

interface ConsumableStockState {
  loading: boolean;
  error: string | null;
  consumableStocks: ConsumableStock[];
  allConsumableStocksData: GetConsumableStocksResponse | null;
}

// GET consumable stocks
interface GetConsumableStocksResponse {
  success: boolean;
  total: number;
  currentPage: number;
  totalPages: number;
  count: number;
  data: ConsumableStock[];
}

// ---------------- Initial State ----------------
const initialState: ConsumableStockState = {
  loading: false,
  error: null,
  consumableStocks: [],
  allConsumableStocksData: null,
};

// ---------------- Thunks ----------------
export const getConsumableStocks = createAsyncThunk<
  GetConsumableStocksResponse,
  { search?: string; page?: number; limit?: number; fromDate?: string; toDate?: string },
  { rejectValue: { message: string } }
>(
  'consumableStock/getConsumableStocks',
  async ({ search = '', page = 1, limit = 5, fromDate = '', toDate = '' }, thunkAPI) => {
    try {
      const url = `${API_ENDPOINTS.GET_CONSUMABLE}?search=${search}&page=${page}&limit=${limit}&fromDate=${fromDate}&toDate=${toDate}`;

      const response = await apiCaller({ url, method: 'GET' });

      if (response.status === 200) {
        const body = response.data as GetConsumableStocksResponse;
        return body;
      }

      return thunkAPI.rejectWithValue({
        message: (response.data as { message?: string })?.message || 'Failed to fetch consumable stocks',
      });
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      return thunkAPI.rejectWithValue({
        message: err.response?.data?.message || 'Error fetching consumable stocks',
      });
    }
  }
);

// ADD CONSUMABLE STOCK
export const addConsumableStock = createAsyncThunk<
  ConsumableStock,
  Partial<ConsumableStock>,
  { rejectValue: { message: string } }
>(
  'consumableStock/addConsumableStock',
  async (consumableStockData, thunkAPI) => {
    try {
      const response = await apiCaller({
        url: API_ENDPOINTS.ADD_CONSUMABLE,
        method: 'POST',
        data: consumableStockData,
      });

      if (response.status === 201) {
        return response?.data as ConsumableStock;
      }

      return thunkAPI.rejectWithValue({
        message: (response.data as { message?: string })?.message || 'Add consumable stock failed',
      });
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      return thunkAPI.rejectWithValue({
        message: err.response?.data?.message || 'Server error',
      });
    }
  }
);

// UPDATE CONSUMABLE STOCK
export const updateConsumableStock = createAsyncThunk<
  ConsumableStock,
  { consumableStockId: string; consumableStockData: Partial<ConsumableStock> },
  { rejectValue: { message: string } }
>(
  'consumableStock/updateConsumableStock',
  async ({ consumableStockId, consumableStockData }, thunkAPI) => {
    try {
      const response = await apiCaller({
        url: API_ENDPOINTS.UPDATE_CONSUMABLE(consumableStockId),
        method: 'PUT',
        data: consumableStockData,
      });

      if (response.status === 200) {
        return response.data as ConsumableStock;
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

// DELETE CONSUMABLE STOCK
export const deleteConsumableStock = createAsyncThunk<
  { consumableStockId: string },
  string,
  { rejectValue: { message: string } }
>(
  'consumableStock/deleteConsumableStock',
  async (consumableStockId, thunkAPI) => {
    try {
      const response = await apiCaller({
        url: API_ENDPOINTS.DELETE_CONSUMABLE(consumableStockId),
        method: 'DELETE',
      });

      if (response.status === 200) {
        return { consumableStockId };
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
const consumableStockSlice = createSlice({
  name: 'consumableStocks',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // GET
      .addCase(getConsumableStocks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getConsumableStocks.fulfilled, (state, action) => {
        state.loading = false;
        state.allConsumableStocksData = action.payload;
        state.consumableStocks = action.payload.data;
      })
      .addCase(getConsumableStocks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Error';
      })

      // ADD
      .addCase(addConsumableStock.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addConsumableStock.fulfilled, (state, action) => {
        state.loading = false;
        state.consumableStocks.push(action.payload);
      })
      .addCase(addConsumableStock.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Add consumable stock failed';
      })

      // UPDATE
      .addCase(updateConsumableStock.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateConsumableStock.fulfilled, (state, action) => {
        state.loading = false;
        state.consumableStocks = state.consumableStocks.map((consumableStock) =>
          consumableStock._id === action.payload._id ? action.payload : consumableStock
        );
      })
      .addCase(updateConsumableStock.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Update consumable stock failed';
      })

      // DELETE
      .addCase(deleteConsumableStock.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteConsumableStock.fulfilled, (state, action) => {
        state.loading = false;
        state.consumableStocks = state.consumableStocks.filter(
          (consumableStock) => consumableStock._id !== action.payload.consumableStockId
        );
      })
      .addCase(deleteConsumableStock.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Delete consumable stock failed';
      });
  },
});

// ---------------- Selectors ----------------
export const selectConsumableStockState = (state: RootState) => state.consumableStock;
export const selectConsumableStocks = (state: RootState) => state.consumableStock.consumableStocks;
export const selectConsumableStockLoading = (state: RootState) => state.consumableStock.loading;
export const selectAllConsumableStocksData = (state: RootState) => state.consumableStock.allConsumableStocksData;

// ---------------- Exports ----------------
export default consumableStockSlice.reducer;


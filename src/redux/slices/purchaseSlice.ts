import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { AxiosError } from 'axios';
import apiCaller from '../../api/client';
import { API_ENDPOINTS } from '../../api/endpoints';
import type { RootState } from '../store/store';

// ---------------- Types ----------------
export interface Purchase {
  _id: string;
  [key: string]: any;
}

interface PurchaseState {
  loading: boolean;
  error: string | null;
  purchases: Purchase[];
  allPurchasesData: GetPurchasesResponse | null;
}

// GET purchases
interface GetPurchasesResponse {
  success: boolean;
  total: number;
  currentPage: number;
  totalPages: number;
  count: number;
  data: Purchase[];
}

// ---------------- Initial State ----------------
const initialState: PurchaseState = {
  loading: false,
  error: null,
  purchases: [],
  allPurchasesData: null,
};

// ---------------- Thunks ----------------
export const getPurchases = createAsyncThunk<
  GetPurchasesResponse,
  { search?: string; page?: number; limit?: number; fromDate?: string; toDate?: string },
  { rejectValue: { message: string } }
>(
  'purchase/getPurchases',
  async ({ search = '', page = 1, limit = 5, fromDate = '', toDate = '' }, thunkAPI) => {
    try {
      const url = `${API_ENDPOINTS.GET_PURCHASE}?search=${search}&page=${page}&limit=${limit}&fromDate=${fromDate}&toDate=${toDate}`;

      const response = await apiCaller({ url, method: 'GET' });

      if (response.status === 200) {
        const body = response.data as GetPurchasesResponse;
        return body;
      }

      return thunkAPI.rejectWithValue({
        message: (response.data as { message?: string })?.message || 'Failed to fetch purchases',
      });
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      return thunkAPI.rejectWithValue({
        message: err.response?.data?.message || 'Error fetching purchases',
      });
    }
  }
);

// ADD PURCHASE
export const addPurchase = createAsyncThunk<
  Purchase,
  Partial<Purchase>,
  { rejectValue: { message: string } }
>(
  'purchase/addPurchase',
  async (purchaseData, thunkAPI) => {
    try {
      const response = await apiCaller({
        url: API_ENDPOINTS.ADD_PURCHASE,
        method: 'POST',
        data: purchaseData,
      });

      if (response.status === 201) {
        return response?.data as Purchase;
      }

      return thunkAPI.rejectWithValue({
        message: (response.data as { message?: string })?.message || 'Add purchase failed',
      });
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      return thunkAPI.rejectWithValue({
        message: err.response?.data?.message || 'Server error',
      });
    }
  }
);

// UPDATE PURCHASE
export const updatePurchase = createAsyncThunk<
  Purchase,
  { purchaseId: string; purchaseData: Partial<Purchase> },
  { rejectValue: { message: string } }
>(
  'purchase/updatePurchase',
  async ({ purchaseId, purchaseData }, thunkAPI) => {
    try {
      const response = await apiCaller({
        url: API_ENDPOINTS.UPDATE_PURCHASE(purchaseId),
        method: 'PUT',
        data: purchaseData,
      });

      if (response.status === 200) {
        return response.data as Purchase;
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

// DELETE PURCHASE
export const deletePurchase = createAsyncThunk<
  { purchaseId: string },
  string,
  { rejectValue: { message: string } }
>(
  'purchase/deletePurchase',
  async (purchaseId, thunkAPI) => {
    try {
      const response = await apiCaller({
        url: API_ENDPOINTS.DELETE_PURCHASE(purchaseId),
        method: 'DELETE',
      });

      if (response.status === 200) {
        return { purchaseId };
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
const purchaseSlice = createSlice({
  name: 'purchases',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // GET
      .addCase(getPurchases.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPurchases.fulfilled, (state, action) => {
        state.loading = false;
        state.allPurchasesData = action.payload;
        state.purchases = action.payload.data;
      })
      .addCase(getPurchases.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Error';
      })

      // ADD
      .addCase(addPurchase.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addPurchase.fulfilled, (state, action) => {
        state.loading = false;
        state.purchases.push(action.payload);
      })
      .addCase(addPurchase.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Add purchase failed';
      })

      // UPDATE
      .addCase(updatePurchase.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePurchase.fulfilled, (state, action) => {
        state.loading = false;
        state.purchases = state.purchases.map((purchase) =>
          purchase._id === action.payload._id ? action.payload : purchase
        );
      })
      .addCase(updatePurchase.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Update purchase failed';
      })

      // DELETE
      .addCase(deletePurchase.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deletePurchase.fulfilled, (state, action) => {
        state.loading = false;
        state.purchases = state.purchases.filter(
          (purchase) => purchase._id !== action.payload.purchaseId
        );
      })
      .addCase(deletePurchase.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Delete purchase failed';
      });
  },
});

// ---------------- Selectors ----------------
export const selectPurchaseState = (state: RootState) => state.purchase;
export const selectPurchases = (state: RootState) => state.purchase.purchases;
export const selectPurchaseLoading = (state: RootState) => state.purchase.loading;
export const selectAllPurchasesData = (state: RootState) => state.purchase.allPurchasesData;

// ---------------- Exports ----------------
export default purchaseSlice.reducer;


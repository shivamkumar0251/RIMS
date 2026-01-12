import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { AxiosError } from 'axios';
import apiCaller from '../../api/client';
import { API_ENDPOINTS } from '../../api/endpoints';
import type { RootState } from '../store/store';
import type { ProductInterface } from './productSlice';

// ---------------- Types ----------------
export interface PurchasePostData {
  productId: string;
  sendToStoreQty: number;
  price?: number;
  tax?: number;
  rcvdPurchaseQty?: number;
  currentPurchaseQty?: number;
}
export interface PurchasePUpdateData {
  sendToStoreQty: number;
  price?: number;
  tax?: number;
}

export interface PurchaseItem {
  _id: string;
  franchiseId: string;
  productId: ProductInterface;
  rcvdPurchaseQty: number;
  sendToStoreQty: number;
  currentPurchaseQty: number;
  price: number;
  tax: number;
  createdAt: string;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
}
// GET purchases
export interface GetPurchasesResponse {
  success: boolean;
  data: PurchaseItem[];
  pagination: PaginationInfo;
}

// ---------------- Initial State ----------------
interface PurchaseState {
  loading: boolean;
  error: string | null;
  purchases: PurchaseItem[];
  allPurchasesData: GetPurchasesResponse | null;
}
const initialState: PurchaseState = {
  loading: false,
  error: null,
  purchases: [],
  allPurchasesData: null,
};

// ---------------- Thunks ----------------
export const getPurchases = createAsyncThunk<
  GetPurchasesResponse,
  { search?: string; page?: number; limit?: number; fromDate?: string; toDate?: string, categoryId?: string, vendorId?: string, companyId?: string, },
  { rejectValue: { message: string } }
>(
  'purchase/getPurchases',
  async ({ search = '', page = 1, limit = 5, fromDate = '', toDate = '', categoryId = '', vendorId = '', companyId = '', }, thunkAPI) => {
    try {
      const url = `${API_ENDPOINTS.GET_PURCHASE}?search=${search}&categoryId=${categoryId}&vendorId=${vendorId}&companyId=${companyId}&page=${page}&limit=${limit}&fromDate=${fromDate}&toDate=${toDate}`;

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


// ADD BULK PURCHASE
export const addBulkPurchases = createAsyncThunk<
  PurchasePostData,
  PurchasePostData[],
  { rejectValue: { message: string } }
>(
  'purchase/addBulkPurchases',
  async (purchaseData, thunkAPI) => {
    try {
      const response = await apiCaller({
        url: API_ENDPOINTS.ADD_BULK_PURCHASE,
        method: 'POST',
        data: purchaseData,
      });

      if (response.status === 201) {
        return response?.data as PurchasePostData;
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
  PurchaseItem,
  { purchaseId: string; purchaseData: Partial<PurchasePUpdateData> },
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
        return response.data as PurchaseItem;
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
  name: 'purchase',
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
      .addCase(addBulkPurchases.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addBulkPurchases.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(addBulkPurchases.rejected, (state, action) => {
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

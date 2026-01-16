import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { AxiosError } from 'axios';
import apiCaller from '../../api/client';
import { API_ENDPOINTS } from '../../api/endpoints';
import type { RootState } from '../store/store';
import type { ProductInterface } from './productSlice';

// ---------------- Types ----------------

export interface VendorOrderProduct {
  _id: string;
  productId: ProductInterface;
  orderQty: number;
  sendToPurchaseQty: number;
  createdAt: string;
}

export interface VendorOrder {
  _id: string;
  products: VendorOrderProduct[];
  totalAmount: number;
  totalClosingAmount: number;
  paymentStatus: string;
  status: string; // Added status field (Draft / Sent / Delivered)
  totelOrderQty: number;
  orderDate: string;
  orderNumber: string;
}

// GET vendor orders
interface GetVendorOrdersResponse {
  success: boolean;
  data: VendorOrder[];
  total: number;
  pages: number;
  limit: number;
}
export interface VendorDataUpdateProduct {
  productId: string;
  sendToPurchaseQty: number;
  remarks: string;
}
export interface VendorDataUpdate {
  products: VendorDataUpdateProduct[]
}
// ---------------- Initial State ----------------
interface VendorOrderState {
  loading: boolean;
  error: string | null;
  vendorOrders: VendorOrder[];
  allVendorOrdersData: GetVendorOrdersResponse | null;
}
const initialState: VendorOrderState = {
  loading: false,
  error: null,
  vendorOrders: [],
  allVendorOrdersData: null,
};


// ---------------- Thunks ----------------
// GET VENDOR ORDERS
export const getVendorOrders = createAsyncThunk<
  GetVendorOrdersResponse,
  { search?: string; page?: number; limit?: number; fromDate?: string; toDate?: string, category?: string, vendor?: string, brand?: string, paymentStatus?: string },
  { rejectValue: { message: string } }
>(
  'vendorOrder/getVendorOrders',
  async ({ search = '', page = 1, limit = 5, fromDate = '', toDate = '', category = '', vendor = '', brand = '', paymentStatus = '' }, thunkAPI) => {
    try {
      const url = `${API_ENDPOINTS.GET_VENDOR_ORDERS_LIST}?search=${search}&category=${category}&vendor=${vendor}&brand=${brand}&page=${page}&limit=${limit}&fromDate=${fromDate}&toDate=${toDate}&paymentStatus=${paymentStatus}`;

      const response = await apiCaller({ url, method: 'GET' });

      if (response.status === 200) {
        const body = response.data as GetVendorOrdersResponse;
        return body;
      }

      return thunkAPI.rejectWithValue({
        message: (response.data as { message?: string })?.message || 'Failed to fetch vendor orders',
      });
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      return thunkAPI.rejectWithValue({
        message: err.response?.data?.message || 'Error fetching vendor orders',
      });
    }
  }
);

// UPDATE VENDOR ORDER
export const updateVendorOrder = createAsyncThunk<
  VendorOrder,
  { vendorOrderId: string; products?: VendorDataUpdateProduct[]; status?: string },
  { rejectValue: { message: string } }
>(
  'vendorOrder/updateVendorOrder',
  async ({ vendorOrderId, products, status }, thunkAPI) => {
    try {
      const response = await apiCaller({
        url: API_ENDPOINTS.UPDATE_VENDOR_ORDER(vendorOrderId),
        method: 'PUT',
        data: { products, status },
      });

      if (response.status === 200) {
        return response.data as VendorOrder;
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

// CREATE VENDOR ORDER
export const addVendorOrder = createAsyncThunk<
  VendorOrder,
  any,
  { rejectValue: { message: string } }
>(
  'vendorOrder/addVendorOrder',
  async (orderData, thunkAPI) => {
    try {
      const response = await apiCaller({
        url: API_ENDPOINTS.GET_VENDOR_ORDERS_LIST,
        method: 'POST',
        data: orderData,
      });

      if (response.status === 201 || response.status === 200) {
        return response.data as VendorOrder;
      }

      return thunkAPI.rejectWithValue({
        message: (response.data as { message?: string })?.message || 'Creation failed',
      });
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      return thunkAPI.rejectWithValue({
        message: err.response?.data?.message || 'Server error',
      });
    }
  }
);

// DELETE VENDOR ORDER
export const deleteVendorOrder = createAsyncThunk<
  { vendorOrderId: string },
  string,
  { rejectValue: { message: string } }
>(
  'vendorOrder/deleteVendorOrder',
  async (vendorOrderId, thunkAPI) => {
    try {
      const response = await apiCaller({
        url: `${API_ENDPOINTS.GET_VENDOR_ORDERS_LIST}/${vendorOrderId}`,
        method: 'DELETE',
      });

      if (response.status === 200) {
        return { vendorOrderId };
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
const vendorOrderSlice = createSlice({
  name: 'vendorOrders',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // GET
      .addCase(getVendorOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getVendorOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.allVendorOrdersData = action.payload;
        state.vendorOrders = action.payload.data || [];
      })
      .addCase(getVendorOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Error';
      })

      // UPDATE
      .addCase(updateVendorOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateVendorOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.vendorOrders = state.vendorOrders.map((order: VendorOrder) =>
          order._id === action.payload._id ? action.payload : order
        );
      })
      .addCase(updateVendorOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Update vendor order failed';
      })

      // DELETE
      .addCase(deleteVendorOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteVendorOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.vendorOrders = state.vendorOrders.filter(
          (order: VendorOrder) => order._id !== action.payload.vendorOrderId
        );
      })
      .addCase(deleteVendorOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Delete failed';
      })
      // CREATE
      .addCase(addVendorOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addVendorOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.vendorOrders = [action.payload, ...state.vendorOrders];
      })
      .addCase(addVendorOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Creation failed';
      });
  },
});

// ---------------- Selectors ----------------
export const selectVendorOrderState = (state: RootState) => state.vendorOrder;
export const selectVendorOrders = (state: RootState) => state.vendorOrder.vendorOrders;
export const selectVendorOrderLoading = (state: RootState) => state.vendorOrder.loading;
export const selectAllVendorOrdersData = (state: RootState) => state.vendorOrder.allVendorOrdersData;

// ---------------- Exports ----------------
export default vendorOrderSlice.reducer;

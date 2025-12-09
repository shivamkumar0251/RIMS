import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { AxiosError } from 'axios';
import apiCaller from '../../api/client';
import { API_ENDPOINTS } from '../../api/endpoints';
import type { RootState } from '../store/store';

// ---------------- Types ----------------
export interface VendorOrderProduct {
  productId: string;
  quantity: number;
  price: number;
}

export interface VendorOrder {
  _id: string;
  vendorId: string;
  orderDate: string;
  products: VendorOrderProduct[];
  status?: string;
  [key: string]: any;
}

interface VendorOrderState {
  loading: boolean;
  error: string | null;
  vendorOrders: VendorOrder[];
  allVendorOrdersData: GetVendorOrdersResponse | null;
}

// GET vendor orders
interface GetVendorOrdersResponse {
  success: boolean;
  total: number;
  currentPage: number;
  totalPages: number;
  count: number;
  orders: VendorOrder[];
}

// ---------------- Initial State ----------------
const initialState: VendorOrderState = {
  loading: false,
  error: null,
  vendorOrders: [],
  allVendorOrdersData: null,
};

// ---------------- Thunks ----------------
// CREATE VENDOR ORDER
export const createVendorOrder = createAsyncThunk<
  VendorOrder,
  { vendorId: string; orderDate: string; products: VendorOrderProduct[] },
  { rejectValue: { message: string } }
>(
  'vendorOrder/createVendorOrder',
  async ({ vendorId, orderDate, products }, thunkAPI) => {
    try {
      const response = await apiCaller({
        url: API_ENDPOINTS.CREATE_VENDOR_ORDER,
        method: 'POST',
        data: { vendorId, orderDate, products },
      });

      if (response.status === 201) {
        return response?.data as VendorOrder;
      }

      return thunkAPI.rejectWithValue({
        message: (response.data as { message?: string })?.message || 'Create vendor order failed',
      });
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      return thunkAPI.rejectWithValue({
        message: err.response?.data?.message || 'Server error',
      });
    }
  }
);

// GET VENDOR ORDERS
export const getVendorOrders = createAsyncThunk<
  GetVendorOrdersResponse,
  { page?: number; limit?: number; vendorId?: string },
  { rejectValue: { message: string } }
>(
  'vendorOrder/getVendorOrders',
  async ({ page = 1, limit = 10, vendorId }, thunkAPI) => {
    try {
      let url = `${API_ENDPOINTS.GET_VENDOR_ORDERS_LIST}?page=${page}&limit=${limit}`;
      if (vendorId) {
        url += `&vendorId=${vendorId}`;
      }

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

// UPDATE VENDOR ORDER PRODUCT
export const updateVendorOrderProduct = createAsyncThunk<
  { message: string },
  { orderId: string; productId: string; quantity: number; price: number },
  { rejectValue: { message: string } }
>(
  'vendorOrder/updateVendorOrderProduct',
  async ({ orderId, productId, quantity, price }, thunkAPI) => {
    try {
      const response = await apiCaller({
        url: API_ENDPOINTS.UPDATE_VENDOR_ORDER_PRODUCT,
        method: 'PUT',
        data: { orderId, productId, quantity, price },
      });

      if (response.status === 200) {
        return { message: (response.data as { message?: string })?.message || 'Order product updated successfully' };
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

// UPDATE VENDOR ORDER
export const updateVendorOrder = createAsyncThunk<
  VendorOrder,
  { vendorOrderId: string; orderDate?: string; status?: string },
  { rejectValue: { message: string } }
>(
  'vendorOrder/updateVendorOrder',
  async ({ vendorOrderId, orderDate, status }, thunkAPI) => {
    try {
      const response = await apiCaller({
        url: API_ENDPOINTS.UPDATE_VENDOR_ORDER(vendorOrderId),
        method: 'PUT',
        data: { orderDate, status },
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
        url: API_ENDPOINTS.DELETE_VENDOR_ORDER(vendorOrderId),
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
      // CREATE
      .addCase(createVendorOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createVendorOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.vendorOrders.push(action.payload);
      })
      .addCase(createVendorOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Create vendor order failed';
      })

      // GET
      .addCase(getVendorOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getVendorOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.allVendorOrdersData = action.payload;
        state.vendorOrders = action.payload.orders || [];
      })
      .addCase(getVendorOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Error';
      })

      // UPDATE ORDER PRODUCT
      .addCase(updateVendorOrderProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateVendorOrderProduct.fulfilled, (state) => {
        state.loading = false;
        // Note: You may need to refetch orders after updating a product
      })
      .addCase(updateVendorOrderProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Update order product failed';
      })

      // UPDATE
      .addCase(updateVendorOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateVendorOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.vendorOrders = state.vendorOrders.map((order) =>
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
          (order) => order._id !== action.payload.vendorOrderId
        );
      })
      .addCase(deleteVendorOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Delete vendor order failed';
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


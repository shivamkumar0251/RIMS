import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { AxiosError } from 'axios';
import apiCaller from '../../api/client';
import { API_ENDPOINTS } from '../../api/endpoints';
import type { RootState } from '../store/store';
import type { ProductInterface } from './productSlice';

// ---------------- Types ----------------
export interface Order extends ProductInterface {
  currentPurchaseQty: number;
}

// GET orders
interface GetOrdersResponse {
  success: boolean;
  total: number;
  page: number;
  limit: number;
  data: Order[];
}

export interface OrderItemPostData {
  productId: string;
  orderQty: number;
}

export interface OrderPostData {
  vendorsId?: string;
  products: OrderItemPostData[];
}
// ---------------- PostOrderResponse State ----------------
export interface OrderProduct {
  productId: string;
  orderQty: number;
  sendToPurchaseQty: number;
  _id: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderData {
  franchiseId: string;
  products: OrderProduct[];
  totalAmount: number;
  totalClosingAmount: number;
  paymentStatus: string;
  totelOrderQty: number;
  orderDate: string;
  _id: string;
  createdAt: string;
  updatedAt: string;
  orderNumber: string;
}

export interface OrderPostResponse {
  success: boolean;
  data: OrderData;
}
// ---------------- UpdateOderData ----------------
export interface ProductOrderItem {
  productId: string;
  orderQty: number;
}

export interface ProductOrderRequest {
  products: ProductOrderItem[];
}

// ---------------- Initial type ----------------
interface OrderState {
  loading: boolean;
  error: string | null;
  ordersProductList: Order[];
  allOrdersData: GetOrdersResponse | null;
}
// ---------------- Initial State ----------------
const initialState: OrderState = {
  loading: false,
  error: null,
  ordersProductList: [],
  allOrdersData: null,
};

// ---------------- Thunks ----------------
// GET ORDER PRODUCT
export const getOrdersProduct = createAsyncThunk<
  GetOrdersResponse,
  { search?: string; page?: number; limit?: number; fromDate?: string; toDate?: string, category?: string, vendor?: string, brand?: string, productType?: string },
  { rejectValue: { message: string } }
>(
  'order/getOrders',
  async ({ search = '', page = 1, limit = 5, fromDate = '', toDate = '', category = '', vendor = '', brand = '', productType = '' }, thunkAPI) => {
    try {
      const url = `${API_ENDPOINTS.GET_ORDERS}?search=${search}&category=${category}&vendor=${vendor}&brand=${brand}&page=${page}&limit=${limit}&fromDate=${fromDate}&toDate=${toDate}&productType=${productType}`;

      const response = await apiCaller({ url, method: 'GET' });

      if (response.status === 200) {
        const body = response.data as GetOrdersResponse;
        return body;
      }

      return thunkAPI.rejectWithValue({
        message: (response.data as { message?: string })?.message || 'Failed to fetch orders',
      });
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      return thunkAPI.rejectWithValue({
        message: err.response?.data?.message || 'Error fetching orders',
      });
    }
  }
);

// ADD ORDER
export const addOrder = createAsyncThunk<
  any,
  OrderPostData,
  { rejectValue: { message: string } }
>(
  'order/addOrder',
  async (orderData, thunkAPI) => {
    try {
      const response = await apiCaller({
        url: API_ENDPOINTS.ADD_ORDERS,
        method: 'POST',
        data: orderData,
      });

      if (response.status === 201 || response.status === 200) {
        const resData = response.data as any;
        return resData.data || resData;
      }

      return thunkAPI.rejectWithValue({
        message: (response.data as { message?: string })?.message || 'Add order failed',
      });
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      return thunkAPI.rejectWithValue({
        message: err.response?.data?.message || 'Server error',
      });
    }
  }
);

// // UPDATE ORDER
// export const updateOrder = createAsyncThunk<
//   ProductOrderRequest,
//   { orderId: string; orderData: Partial<ProductOrderRequest> },
//   { rejectValue: { message: string } }
// >(
//   'order/updateOrder',
//   async ({ orderId, orderData }, thunkAPI) => {
//     try {
//       const response = await apiCaller({
//         url: API_ENDPOINTS.UPDATE_ORDERS(orderId),
//         method: 'PUT',
//         data: orderData,
//       });

//       if (response.status === 200) {
//         return response.data as ProductOrderRequest;
//       }

//       return thunkAPI.rejectWithValue({
//         message: (response.data as { message?: string })?.message || 'Update failed',
//       });
//     } catch (error) {
//       const err = error as AxiosError<{ message: string }>;
//       return thunkAPI.rejectWithValue({
//         message: err.response?.data?.message || 'Server error',
//       });
//     }
//   }
// );

// // DELETE WHOLE ORDER
// export const deleteWholeOrder = createAsyncThunk<
//   { orderId: string },
//   string,
//   { rejectValue: { message: string } }
// >(
//   'order/deleteWholeOrder',
//   async (orderId, thunkAPI) => {
//     try {
//       const response = await apiCaller({
//         url: API_ENDPOINTS.DELETE_WHOLE_ORDERS(orderId),
//         method: 'DELETE',
//       });

//       if (response.status === 200) {
//         return { orderId };
//       }

//       return thunkAPI.rejectWithValue({
//         message: (response.data as { message?: string })?.message || 'Delete failed',
//       });
//     } catch (error) {
//       const err = error as AxiosError<{ message: string }>;
//       return thunkAPI.rejectWithValue({
//         message: err.response?.data?.message || 'Server error',
//       });
//     }
//   }
// );

// // DELETE ORDER ITEMS
// export const deleteOrderItems = createAsyncThunk<
//   { orderId: string },
//   string,
//   { rejectValue: { message: string } }
// >(
//   'order/deleteOrderItems',
//   async (orderId, thunkAPI) => {
//     try {
//       const response = await apiCaller({
//         url: API_ENDPOINTS.DELETE_ORDERS_ITEMS(orderId),
//         method: 'DELETE',
//       });

//       if (response.status === 200) {
//         return { orderId };
//       }

//       return thunkAPI.rejectWithValue({
//         message: (response.data as { message?: string })?.message || 'Delete items failed',
//       });
//     } catch (error) {
//       const err = error as AxiosError<{ message: string }>;
//       return thunkAPI.rejectWithValue({
//         message: err.response?.data?.message || 'Server error',
//       });
//     }
//   }
// );

// ---------------- Slice ----------------
const orderSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // GET
      .addCase(getOrdersProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getOrdersProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.allOrdersData = action.payload;
        state.ordersProductList = action.payload.data;
      })
      .addCase(getOrdersProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Error';
      })

      // ADD
      .addCase(addOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addOrder.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(addOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Add order failed';
      })

      // // UPDATE
      // .addCase(updateOrder.pending, (state) => {
      //   state.loading = true;
      //   state.error = null;
      // })
      // .addCase(updateOrder.fulfilled, (state, action) => {
      //   state.loading = false;
      //   state.orders = state.orders.map((order) =>
      //     order._id === action.payload._id ? action.payload : order
      //   );
      // })
      // .addCase(updateOrder.rejected, (state, action) => {
      //   state.loading = false;
      //   state.error = action.payload?.message || 'Update order failed';
      // })

      // // DELETE WHOLE ORDER
      // .addCase(deleteWholeOrder.pending, (state) => {
      //   state.loading = true;
      //   state.error = null;
      // })
      // .addCase(deleteWholeOrder.fulfilled, (state, action) => {
      //   state.loading = false;
      //   state.orders = state.orders.filter(
      //     (order) => order._id !== action.payload.orderId
      //   );
      // })
      // .addCase(deleteWholeOrder.rejected, (state, action) => {
      //   state.loading = false;
      //   state.error = action.payload?.message || 'Delete order failed';
      // })

      // // DELETE ORDER ITEMS
      // .addCase(deleteOrderItems.pending, (state) => {
      //   state.loading = true;
      //   state.error = null;
      // })
      // .addCase(deleteOrderItems.fulfilled, (state, action) => {
      //   state.loading = false;
      //   // Update order to reflect deleted items
      //   const order = state.orders.find((o) => o._id === action.payload.orderId);
      //   if (order) {
      //     // You may need to update the order structure based on API response
      //   }
      // })
      // .addCase(deleteOrderItems.rejected, (state, action) => {
      //   state.loading = false;
      //   state.error = action.payload?.message || 'Delete order items failed';
      // })
      ;
  },
});

// ---------------- Selectors ----------------
export const selectOrderState = (state: RootState) => state.order;
export const selectOrders = (state: RootState) => state.order.ordersProductList;
export const selectOrderLoading = (state: RootState) => state.order.loading;
export const selectAllOrdersData = (state: RootState) => state.order.allOrdersData;

// ---------------- Exports ----------------
export default orderSlice.reducer;


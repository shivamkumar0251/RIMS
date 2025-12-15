import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { AxiosError } from 'axios';
import apiCaller from '../../api/client';
import { API_ENDPOINTS } from '../../api/endpoints';
import type { RootState } from '../store/store';

// ---------------- Types ----------------
export interface CategoryRef {
  _id: string;
  categoryName?: string;
}

export interface VendorRef {
  _id: string;
  vendor_name?: string;
}

export interface CompanyRef {
  _id: string;
  brandName?: string;
}

export interface ProductInterface {
  _id: string;
  categoryId: CategoryRef ;
  vendorsId: VendorRef;
  companyId: CompanyRef;
  productName: string;
  packSize: string;
  unit: string;
  quantity: number;
  shape: string;
  colour: string;
  printStatus: string;
  productImage?: string;
  gstPct: number;
  productMRP: number;
  taxableValue: number;
  perUnitRate: number;
  totalMRP: number;
  stockAlert: number;
  createdAt: string;
}

// GET products response format
export interface GetProductsResponse {
  success: boolean;
  data: ProductInterface[];
  total: number;
  page: number;
  limit: number;
}

// BULK UPLOAD PRODUCT via EXCEL
export interface BulkProductExcelResponse {
  success: boolean;
  insertedCount: number;
  data: ProductInterface[];
}



// ---------------- State ----------------
interface ProductState {
  loading: boolean;
  error: string | null;
  products: ProductInterface[];
  allProductsData: GetProductsResponse | null;
}
const initialState: ProductState = {
  loading: false,
  error: null,
  products: [],
  allProductsData: null,
};

// ---------------- Thunks ----------------
// GET PRODUCTS
export const getProducts = createAsyncThunk<
  GetProductsResponse,
  { search?: string; page?: number; limit?: number; fromDate?: string; toDate?: string, category?: string, vendor?: string, company?:string, },
  { rejectValue: { message: string } }
>(
  'product/getProducts',
  async ({ search = '', page = 1, limit = 5, fromDate = '', toDate = '',  category = '',  vendor = '',  company = '',}, thunkAPI) => {
    try {
      const url = `${API_ENDPOINTS.GET_PRODUCTS}?search=${search}&category=${category}&vendor=${vendor}&company=${company}&page=${page}&limit=${limit}&fromDate=${fromDate}&toDate=${toDate}`;

      const response = await apiCaller({ url, method: 'GET' });

      if (response.status === 200) {
        return response.data as GetProductsResponse;
      }

      return thunkAPI.rejectWithValue({
        message: (response.data as { message?: string })?.message  || 'Failed to fetch products',
      });

    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      return thunkAPI.rejectWithValue({
        message: err.response?.data?.message || 'Error fetching products',
      });
    }
  }
);

// ADD PRODUCT (FormData)
export const addProduct = createAsyncThunk<
  ProductInterface,
  ProductInterface,
  { rejectValue: { message: string } }
>(
  'product/addProduct',
  async (formData, thunkAPI) => {
    try {
      const response = await apiCaller({
        url: API_ENDPOINTS.ADD_PRODUCTS,
        method: 'POST',
        data: formData,
      });

      if (response.status === 201 || response.status === 200) {
        return response.data as ProductInterface;
      }

      return thunkAPI.rejectWithValue({
        message: (response.data as { message?: string })?.message  || 'Add product failed',
      });

    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      return thunkAPI.rejectWithValue({
        message: err.response?.data?.message || 'Server error',
      });
    }
  }
);

// BULK EXCEL UPLOAD
export const addProductBulkExcel = createAsyncThunk<
  BulkProductExcelResponse,
  FormData,
  { rejectValue: { message: string } }
>(
  'product/addProductBulkExcel',
  async (formData, thunkAPI) => {
    try {
      const response = await apiCaller({
        url: API_ENDPOINTS.ADD_BULK_EXCEL_PRODUCTS,
        method: 'POST',
        data: formData,
      });

      if (response.status === 201 || response.status === 200) {
        return response.data as BulkProductExcelResponse;
      }

      return thunkAPI.rejectWithValue({
        message: (response.data as { message?: string })?.message  || 'Bulk product upload failed',
      });

    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      return thunkAPI.rejectWithValue({
        message: err.response?.data?.message || 'Server error in bulk upload',
      });
    }
  }
);

// UPDATE PRODUCT (FormData)
export const updateProduct = createAsyncThunk<
  ProductInterface,
  { productId: string; productData: ProductInterface },
  { rejectValue: { message: string } }
>(
  'product/updateProduct',
  async ({ productId, productData }, thunkAPI) => {
    try {
      const response = await apiCaller({
        url: API_ENDPOINTS.UPDATE_PRODUCTS(productId),
        method: 'PUT',
        data: productData,
      });

      if (response.status === 200) {
        return response.data as ProductInterface;
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

// DELETE PRODUCT
export const deleteProduct = createAsyncThunk<
  { productId: string },
  string,
  { rejectValue: { message: string } }
>(
  'product/deleteProduct',
  async (productId, thunkAPI) => {
    try {
      const response = await apiCaller({
        url: API_ENDPOINTS.DELETE_PRODUCTS(productId),
        method: 'DELETE',
      });

      if (response.status === 200) {
        return { productId };
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
const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // GET
      .addCase(getProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.allProductsData = action.payload;
        state.products = action.payload.data;
      })
      .addCase(getProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Error';
      })

      // ADD
      .addCase(addProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.products.push(action.payload);
      })
      .addCase(addProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Add product failed';
      })

      // BULK
      .addCase(addProductBulkExcel.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addProductBulkExcel.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload?.data?.length > 0) {
          state.products = [...state.products, ...action.payload.data];
        }
      })
      .addCase(addProductBulkExcel.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Bulk upload failed';
      })

      // UPDATE
      .addCase(updateProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.products = state.products.map((p) =>
          p._id === action.payload._id ? action.payload : p
        );
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Update failed';
      })

      // DELETE
      .addCase(deleteProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.products = state.products.filter(
          (p) => p._id !== action.payload.productId
        );
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Delete failed';
      });
  },
});

// ---------------- Selectors ----------------
export const selectProductState = (state: RootState) => state.product;
export const selectProducts = (state: RootState) => state.product.products;
export const selectProductLoading = (state: RootState) => state.product.loading;
export const selectAllProductsData = (state: RootState) => state.product.allProductsData;

// ---------------- Export ----------------
export default productSlice.reducer;


// {
//   "success": true,
//   "data": [
//     {
//       "_id": "693bddb76988710aa8dc1e6b",
//       "franchiseId": "admin1@yopmail.com_1759735593474",
//       "categoryId": {
//         "_id": "69294f0e00b70714a4fd0d6f",
//         "categoryName": "Home Appliances"
//       },
//       "vendorsId": {
//         "_id": "692eba60dff469d64dea8363",
//         "vendor_name": "Green Organics"
//       },
//       "companyId": {
//         "_id": "692949d5502ddf1939f3dcce",
//         "brandName": "PrimeFoods1"
//       },
//       "productName": "Sample Product B",
//       "packSize": "10x10",
//       "unit": "box",
//       "quantity": 100,
//       "shape": "tablet",
//       "colour": "white",
//       "printStatus": "Printed",
//       "gstPct": 12,
//       "productMRP": 150,
//       "taxableValue": 0,
//       "perUnitRate": 120,
//       "totalMRP": 5000,
//       "stockAlert": 5,
//       "__v": 0,
//       "createdAt": "2025-12-12T09:17:43.899Z",
//       "updatedAt": "2025-12-12T09:17:43.899Z"
//     },
//     {
//       "_id": "693bdcf06988710aa8dc1d80",
//       "franchiseId": "admin1@yopmail.com_1759735593474",
//       "categoryId": {
//         "_id": "69294f0e00b70714a4fd0d6f",
//         "categoryName": "Home Appliances"
//       },
//       "vendorsId": {
//         "_id": "692eba60dff469d64dea8363",
//         "vendor_name": "Green Organics"
//       },
//       "companyId": {
//         "_id": "692949d5502ddf1939f3dcce",
//         "brandName": "PrimeFoods1"
//       },
//       "productName": "Sample Product A",
//       "packSize": "10x10",
//       "unit": "box",
//       "quantity": 100,
//       "shape": "tablet",
//       "colour": "white",
//       "printStatus": "Printed",
//       "gstPct": 12,
//       "productMRP": 150,
//       "taxableValue": 0,
//       "perUnitRate": 120,
//       "totalMRP": 5000,
//       "stockAlert": 5,
//       "__v": 0,
//       "createdAt": "2025-12-12T09:14:24.130Z",
//       "updatedAt": "2025-12-12T09:14:24.130Z"
//     }
//   ],
//   "total": 15,
//   "page": 1,
//   "limit": 2
// }


// {
//   "success": true,
//   "message": "Product added",
//   "data": {
//     "franchiseId": "admin1@yopmail.com_1759735593474",
//     "categoryId": "69294f0f00b70714a4fd0d75",
//     "vendorsId": "692eba60dff469d64dea8361",
//     "companyId": "692949d5502ddf1939f3dccc",
//     "productName": "pen",
//     "packSize": "10",
//     "unit": "kg",
//     "quantity": 500,
//     "shape": "round",
//     "colour": "black",
//     "printStatus": "Printed",
//     "productImage": "https://res.cloudinary.com/dmoqhod45/image/upload/v1765802334/hopsnchopsModel/products/product_1765802332161_1765802332161.jpg",
//     "gstPct": 10,
//     "productMRP": 25,
//     "taxableValue": 5,
//     "perUnitRate": 20,
//     "totalMRP": 693,
//     "stockAlert": 10,
//     "_id": "6940015ff371a83286011678",
//     "createdAt": "2025-12-15T12:38:55.497Z",
//     "updatedAt": "2025-12-15T12:38:55.497Z",
//     "__v": 0
//   }
// }

// this is my productSlice this is ok all things are ok all type are ok 
//  i will give you my product page wait 
// i have some type error in my product page so please solve it 
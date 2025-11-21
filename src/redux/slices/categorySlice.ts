import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { AxiosError } from 'axios';
import apiCaller from '../../api/client';
import { API_ENDPOINTS } from '../../api/endpoints';
import type { RootState } from '../store/store';

// ---------------- Types ----------------
export interface SubCategory {
  _id: string;
  subCategoryName: string;
  createdAt?: string;
}

export interface Category {
  _id: string;
  categoryName: string;
  createdAt?: string;
  subCategories?: SubCategory[];
}

interface CategoryState {
  loading: boolean;
  error: string | null;
  categories: Category[];
  allCategoriesData: GetCategoriesResponse | null;
}

// GET categories
interface GetCategoriesResponse {
  success: boolean;
  total: number;
  currentPage: number;
  totalPages: number;
  count: number;
  data: Category[];
}
// ---------------- Initial State ----------------
const initialState: CategoryState = {
  loading: false,
  error: null,
  categories: [],
  allCategoriesData: null,
};

// ---------------- Thunks ----------------
export const getCategories = createAsyncThunk<
  GetCategoriesResponse,
  { search?: string; page?: number; limit?: number; fromDate?: string; toDate?: string },
  { rejectValue: { message: string } }
>(
  'category/getCategories',
  async ({ search = '', page = 1, limit = 5, fromDate = '', toDate = '' }, thunkAPI) => {
    try {
      const url = `${API_ENDPOINTS.GET_CATEGORIES}?search=${search}&page=${page}&limit=${limit}&fromDate=${fromDate}&toDate=${toDate}`;

      const response = await apiCaller({ url, method: 'GET' });

      if (response.status === 200) {
        const body = response.data as GetCategoriesResponse;
        return body;
      }

      return thunkAPI.rejectWithValue({
        message: (response.data as { message?: string })?.message || 'Failed to fetch categories',
      });
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      return thunkAPI.rejectWithValue({
        message: err.response?.data?.message || 'Error fetching categories',
      });
    }
  }
);

// ADD CATEGORY
export const addCategory = createAsyncThunk<
  Category,
  { categoryName: string },
  { rejectValue: { message: string } }
>(
  'category/addCategory',
  async ({ categoryName }, thunkAPI) => {
    try {
      const response = await apiCaller({
        url: API_ENDPOINTS.ADD_CATEGORY,
        method: 'POST',
        data: { categoryName },
      });

      if (response.status === 201) {
        return response?.data as Category;
      }

      return thunkAPI.rejectWithValue({
        message: (response.data as { message?: string })?.message || 'Add category failed',
      });
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      return thunkAPI.rejectWithValue({
        message: err.response?.data?.message || 'Server error',
      });
    }
  }
);

// UPDATE CATEGORY
export const updateCategory = createAsyncThunk<
  Category,
  { categoryId: string; categoryName: string },
  { rejectValue: { message: string } }
>(
  'category/updateCategory',
  async ({ categoryId, categoryName }, thunkAPI) => {
    try {
      const response = await apiCaller({
        url: API_ENDPOINTS.UPDATE_CATEGORY(categoryId),
        method: 'PUT',
        data: { categoryName },
      });

      if (response.status === 200) {
        return response.data as Category;
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

// DELETE CATEGORY
export const deleteCategory = createAsyncThunk<
  { categoryId: string },
  string,
  { rejectValue: { message: string } }
>(
  'category/deleteCategory',
  async (categoryId, thunkAPI) => {
    try {
      const response = await apiCaller({
        url: API_ENDPOINTS.DELETE_CATEGORY(categoryId),
        method: 'DELETE',
      });

      if (response.status === 200) {
        return { categoryId };
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

// ------------------ SUB-CATEGORY ------------------

// ADD SUBCATEGORY
export const addSubCategory = createAsyncThunk<
  { categoryId: string; subCategory: SubCategory },
  { categoryId: string; subCategoryName: string },
  { rejectValue: { message: string } }
>(
  'subcategory/addSubCategory',
  async ({ categoryId, subCategoryName }, thunkAPI) => {
    try {
      const url = API_ENDPOINTS.ADD_SUBCATEGORY(categoryId);

      const response = await apiCaller({
        url,
        method: 'POST',
        data: { subCategoryName },
      });

      if (response.status === 201) {
        return {
          categoryId,
          subCategory: response?.data as SubCategory,
        };
      }

      return thunkAPI.rejectWithValue({
        message: (response.data as { message?: string })?.message || 'Failed to add subcategory',
      });
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      return thunkAPI.rejectWithValue({
        message: err.response?.data?.message || 'Server error',
      });
    }
  }
);

// UPDATE SUBCATEGORY
export const updateSubCategory = createAsyncThunk<
  { categoryId: string; subCategory: SubCategory },
  { categoryId: string; subCategoryId: string; subCategoryName: string },
  { rejectValue: { message: string } }
>(
  'subcategory/updateSubCategory',
  async ({ categoryId, subCategoryId, subCategoryName }, thunkAPI) => {
    try {
      const url = API_ENDPOINTS.UPDATE_SUBCATEGORY(categoryId, subCategoryId);

      const response = await apiCaller({
        url,
        method: 'PUT',
        data: { subCategoryName },
      });

      if (response.status === 200) {
        return {
          categoryId,
          subCategory: response?.data as SubCategory,
        };
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

// DELETE SUBCATEGORY
export const deleteSubCategory = createAsyncThunk<
  { categoryId: string; subCategoryId: string },
  { categoryId: string; subCategoryId: string },
  { rejectValue: { message: string } }
>(
  'subcategory/deleteSubCategory',
  async ({ categoryId, subCategoryId }, thunkAPI) => {
    try {
      const url = API_ENDPOINTS.DELETE_SUBCATEGORY(categoryId, subCategoryId);

      const response = await apiCaller({ url, method: 'DELETE' });

      if (response.status === 200) {
        return { categoryId, subCategoryId };
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
const categorySlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {
    // (selectedCategory removed) keeping reducers object in case we add reducers later
  },
  extraReducers: (builder) => {
    builder
      // GET
      .addCase(getCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.allCategoriesData = action.payload;
        state.categories = action.payload.data;
      })
      .addCase(getCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Error';
      })

      // ADD
      .addCase(addCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.categories.push(action.payload);
      })
      .addCase(addCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Add category failed';
      })

      // UPDATE
      .addCase(updateCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = state.categories.map((cat) =>
          cat._id === action.payload._id ? action.payload : cat
        );
      })
      .addCase(updateCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Update category failed';
      })

      // DELETE
      .addCase(deleteCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = state.categories.filter(
          (cat) => cat._id !== action.payload.categoryId
        );
      })
      .addCase(deleteCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Delete category failed';
      })

      // ------------- SUBCATEGORY -------------

      // ADD SUB
      .addCase(addSubCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addSubCategory.fulfilled, (state, action) => {
        state.loading = false;
        const category = state.categories.find(
          (cat) => cat._id === action.payload.categoryId
        );
        if (category) {
          if (!category.subCategories) category.subCategories = [];
          category.subCategories.push(action.payload.subCategory);
        }
      })
      .addCase(addSubCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Add subcategory failed';
      })

      // UPDATE SUB
      .addCase(updateSubCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateSubCategory.fulfilled, (state, action) => {
        state.loading = false;
        const category = state.categories.find(
          (cat) => cat._id === action.payload.categoryId
        );
        if (category && category.subCategories) {
          category.subCategories = category.subCategories.map((sub) =>
            sub._id === action.payload.subCategory._id ? action.payload.subCategory : sub
          );
        }
      })
      .addCase(updateSubCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Update subcategory failed';
      })

      // DELETE SUB
      .addCase(deleteSubCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteSubCategory.fulfilled, (state, action) => {
        state.loading = false;
        const category = state.categories.find(
          (cat) => cat._id === action.payload.categoryId
        );
        if (category && category.subCategories) {
          category.subCategories = category.subCategories.filter(
            (sub) => sub._id !== action.payload.subCategoryId
          );
        }
      })
      .addCase(deleteSubCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Delete subcategory failed';
      });
  },
});

// ---------------- Selectors ----------------
export const selectCategoryState = (state: RootState) => state.category;
export const selectCategories = (state: RootState) => state.category.categories;
export const selectCategoryLoading = (state: RootState) => state.category.loading;
export const selectAllCategoriesData = (state: RootState) => state.category.allCategoriesData;

// ---------------- Exports ----------------
// no local reducers exported
export default categorySlice.reducer;

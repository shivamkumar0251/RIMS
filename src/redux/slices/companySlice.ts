import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { AxiosError } from 'axios';
import apiCaller from '../../api/client';
import { API_ENDPOINTS } from '../../api/endpoints';
import type { RootState } from '../store/store';

// ---------------- Types ----------------
export interface Company {
  _id: string;
  companyName?: string;
  brandName?: string;
  createdAt?: string;
  [key: string]: any;
}

interface CompanyState {
  loading: boolean;
  error: string | null;
  companies: Company[];
  allCompaniesData: GetCompaniesResponse | null;
}

// ---------------- BULK UPLOAD COMPANY via EXCEL ----------------
export interface BulkCompanyExcelResponse {
  success: boolean;
  inserted: number;
  failed: number;
  errors?: { row: number; message: string }[];
  data: Company[];
}

// GET companies
interface GetCompaniesResponse {
  success: boolean;
  total: number;
  currentPage: number;
  totalPages: number;
  count: number;
  data: Company[];
}

// ---------------- Initial State ----------------
const initialState: CompanyState = {
  loading: false,
  error: null,
  companies: [],
  allCompaniesData: null,
};

// ---------------- Thunks ----------------
export const getCompanies = createAsyncThunk<
  GetCompaniesResponse,
  { search?: string; page?: number; limit?: number; fromDate?: string; toDate?: string },
  { rejectValue: { message: string } }
>(
  'company/getCompanies',
  async ({ search = '', page = 1, limit = 5, fromDate = '', toDate = '' }, thunkAPI) => {
    try {
      const url = `${API_ENDPOINTS.GET_COMPANY}?search=${search}&page=${page}&limit=${limit}&fromDate=${fromDate}&toDate=${toDate}`;

      const response = await apiCaller({ url, method: 'GET' });

      if (response.status === 200) {
        const body = response.data as GetCompaniesResponse;
        return body;
      }

      return thunkAPI.rejectWithValue({
        message: (response.data as { message?: string })?.message || 'Failed to fetch companies',
      });
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      return thunkAPI.rejectWithValue({
        message: err.response?.data?.message || 'Error fetching companies',
      });
    }
  }
);

// ADD COMPANY
export const addCompany = createAsyncThunk<
  Company,
  Partial<Company>,
  { rejectValue: { message: string } }
>(
  'company/addCompany',
  async (companyData, thunkAPI) => {
    try {
      const response = await apiCaller({
        url: API_ENDPOINTS.ADD_COMPANY,
        method: 'POST',
        data: companyData,
      });

      if (response.status === 201) {
        return response?.data as Company;
      }

      return thunkAPI.rejectWithValue({
        message: (response.data as { message?: string })?.message || 'Add company failed',
      });
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      return thunkAPI.rejectWithValue({
        message: err.response?.data?.message || 'Server error',
      });
    }
  }
);

// ADD BULK-EXCEL
export const addCompanyBulkExcel = createAsyncThunk<
  BulkCompanyExcelResponse,
  FormData,
  { rejectValue: { message: string } }
>(
  'company/addCompanyBulkExcel',
  async (formData, thunkAPI) => {
    try {
      const response = await apiCaller({
        url: API_ENDPOINTS.ADD_BULK_EXCEL_COMPANY,
        method: 'POST',
        data: formData,
      });

      if (response.status === 201 || response.status === 200) {
        return response.data as BulkCompanyExcelResponse;
      }

      return thunkAPI.rejectWithValue({
        message:
          (response.data as { message?: string })?.message ||
          'Bulk company upload failed',
      });

    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      return thunkAPI.rejectWithValue({
        message: err.response?.data?.message || 'Server error in bulk upload',
      });
    }
  }
);

// UPDATE COMPANY
export const updateCompany = createAsyncThunk<
  Company,
  { companyId: string; companyData: Partial<Company> },
  { rejectValue: { message: string } }
>(
  'company/updateCompany',
  async ({ companyId, companyData }, thunkAPI) => {
    try {
      const response = await apiCaller({
        url: API_ENDPOINTS.UPDATE_COMPANY(companyId),
        method: 'PUT',
        data: companyData,
      });

      if (response.status === 200) {
        return response.data as Company;
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

// DELETE COMPANY
export const deleteCompany = createAsyncThunk<
  { companyId: string },
  string,
  { rejectValue: { message: string } }
>(
  'company/deleteCompany',
  async (companyId, thunkAPI) => {
    try {
      const response = await apiCaller({
        url: API_ENDPOINTS.DELETE_COMPANY(companyId),
        method: 'DELETE',
      });

      if (response.status === 200) {
        return { companyId };
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

// BULK DELETE COMPANY
export const bulkDeleteCompany = createAsyncThunk<
  { deletedIds: string[] },
  { ids: string[] },
  { rejectValue: { message: string } }
>(
  'company/bulkDeleteCompany',
  async ({ ids }, thunkAPI) => {
    try {
      const response = await apiCaller({
        url: API_ENDPOINTS.BULK_DELETE_COMPANY,
        method: 'POST',
        data: { ids },
      });

      if (response.status === 200) {
        return { deletedIds: ids };
      }

      return thunkAPI.rejectWithValue({
        message: (response.data as { message?: string })?.message || 'Bulk delete failed',
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
const companySlice = createSlice({
  name: 'companies',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // GET
      .addCase(getCompanies.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCompanies.fulfilled, (state, action) => {
        state.loading = false;
        state.allCompaniesData = action.payload;
        state.companies = action.payload.data;
      })
      .addCase(getCompanies.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Error';
      })

      // ADD
      .addCase(addCompany.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addCompany.fulfilled, (state, action) => {
        state.loading = false;
        state.companies.push(action.payload);
      })
      .addCase(addCompany.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Add company failed';
      })
      .addCase(addCompanyBulkExcel.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addCompanyBulkExcel.fulfilled, (state, action) => {
        state.loading = false;

        // Merge uploaded companies into existing list
        if (action.payload?.data?.length) {
          state.companies = [...state.companies, ...action.payload.data];
        }
      })
      .addCase(addCompanyBulkExcel.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Bulk upload failed';
      })

      // UPDATE
      .addCase(updateCompany.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCompany.fulfilled, (state, action) => {
        state.loading = false;
        state.companies = state.companies.map((company) =>
          company._id === action.payload._id ? action.payload : company
        );
      })
      .addCase(updateCompany.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Update company failed';
      })

      // DELETE
      .addCase(deleteCompany.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteCompany.fulfilled, (state, action) => {
        state.loading = false;
        state.companies = state.companies.filter(
          (company) => company._id !== action.payload.companyId
        );
      })
      .addCase(deleteCompany.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Delete company failed';
      })

      // BULK DELETE
      .addCase(bulkDeleteCompany.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(bulkDeleteCompany.fulfilled, (state, action) => {
        state.loading = false;
        state.companies = state.companies.filter(
          (company) => !action.payload.deletedIds.includes(company._id)
        );
      })
      .addCase(bulkDeleteCompany.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Bulk delete failed';
      });
  },
});

// ---------------- Selectors ----------------
export const selectCompanyState = (state: RootState) => state.company;
export const selectCompanies = (state: RootState) => state.company.companies;
export const selectCompanyLoading = (state: RootState) => state.company.loading;
export const selectAllCompaniesData = (state: RootState) => state.company.allCompaniesData;

// ---------------- Exports ----------------
export default companySlice.reducer;


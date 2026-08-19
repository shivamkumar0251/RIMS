import type { PayloadAction } from "@reduxjs/toolkit";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { AxiosError } from "axios";
import apiCaller from "../../api/client";
import { API_ENDPOINTS } from "../../api/endpoints";

interface CheckTokenResponse {
    userId: string;
    role: "admin" | "user"; // extend if you have more roles
}

interface CheckTokenState {
    loading: boolean;
    data: CheckTokenResponse | null;
    error: string | null;
}

const initialState: CheckTokenState = {
    loading: false,
    data: null,
    error: null,
};

// 🔹 Thunk for API call
export const checkToken = createAsyncThunk<
    CheckTokenResponse,
    string, // token as argument
    { rejectValue: string }
>("auth/checkToken", async (token, { rejectWithValue }) => {
    if (!token) {
        return rejectWithValue("No token provided");
    }
    try {
        const response = await apiCaller({
            url: API_ENDPOINTS.CHECK_TOKEN,
            method: 'POST',
            data: { token },
        });
        return response.data as CheckTokenResponse;
    } catch (err) {
        // If demo token or local fallback
        const storedRole = localStorage.getItem('rims_role') as "admin" | "user" | null;
        if (token && (token.startsWith('demo_token') || storedRole)) {
            return {
                userId: localStorage.getItem('rims_userId') || 'demo_admin_123',
                role: storedRole || (token.includes('user') ? 'user' : 'admin')
            };
        }
        const error = err as AxiosError<{ message: string }>;
        return rejectWithValue(error.response?.data?.message || "Invalid token");
    }
});

const checkTokenSlice = createSlice({
    name: "checkToken",
    initialState,
    reducers: {
        setAuthData: (state, action: PayloadAction<CheckTokenResponse>) => {
            state.data = action.payload;
            state.error = null;
            state.loading = false;
        },
        clearAuth: (state) => {
            state.data = null;
            state.error = null;
            state.loading = false;
            localStorage.removeItem('rims_role');
            localStorage.removeItem('rims_userId');
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(checkToken.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(
                checkToken.fulfilled,
                (state, action: PayloadAction<CheckTokenResponse>) => {
                    state.loading = false;
                    state.data = action.payload;
                }
            )
            .addCase(checkToken.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || "Authentication failed";
            });
    },
});

export const { setAuthData, clearAuth } = checkTokenSlice.actions;
export default checkTokenSlice.reducer;

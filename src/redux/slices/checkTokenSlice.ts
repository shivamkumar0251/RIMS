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
    try {
        const response = await apiCaller({
            url: API_ENDPOINTS.CHECK_TOKEN,
            method: 'POST',
            data: { token },
        });
        return response.data as CheckTokenResponse;
    } catch (err) {
        const error = err as AxiosError<{ message: string }>;
        return rejectWithValue(error.response?.data?.message || "Invalid token");
    }
});

const checkTokenSlice = createSlice({
    name: "checkToken",
    initialState,
    reducers: {
        clearAuth: (state) => {
            state.data = null;
            state.error = null;
            state.loading = false;
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

export const { clearAuth } = checkTokenSlice.actions;
export default checkTokenSlice.reducer;

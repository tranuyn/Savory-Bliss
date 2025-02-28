import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// Thunk đăng ký
export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async (userData, { rejectWithValue }) => {
    try {
      console.log("Đang đăng ký với:", userData);
      const response = await fetch("http://localhost:5000/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.msg || "Đăng ký thất bại");
      }

      const data = await response.json();
      console.log("Đăng ký thành công:", data);
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Thunk để đăng nhập
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (credentials, { rejectWithValue }) => {
    try {
      console.log("Đang đăng nhập với:", credentials);
      const response = await fetch("http://localhost:5000/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.msg || "Đăng nhập thất bại");
      }

      const data = await response.json();
      console.log("Dữ liệu nhận được:", data);
      localStorage.setItem("token", data.token);
      localStorage.setItem("refreshToken", data.refreshToken);
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Thunk để làm mới token
export const refreshAccessToken = createAsyncThunk(
  "auth/refreshAccessToken",
  async (_, { getState, rejectWithValue }) => {
    try {
      const { refreshToken } = getState().auths;
      if (!refreshToken) {
        throw new Error("Không có refresh token");
      }

      const response = await fetch("http://localhost:5000/auth/refresh", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        throw new Error("Không thể làm mới access token");
      }

      const data = await response.json();
      return data.token;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Thunk để đăng xuất
export const logoutUser = createAsyncThunk(
  "auth/logoutUser",
  async (_, { rejectWithValue }) => {
    try {
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      console.log("Đã xóa thông tin người dùng và token");
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Slice auth
export const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    token: localStorage.getItem("token"),
    refreshToken: localStorage.getItem("refreshToken"),
    error: null,
    isFetching: false,
    role: null,
    registrationSuccess: false,
  },
  reducers: {
    updateAccessToken: (state, action) => {
      state.token = action.payload;
    },
    resetAuthState: (state) => {
      state.error = null;
      state.isFetching = false;
      state.registrationSuccess = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Xử lý registerUser
      .addCase(registerUser.pending, (state) => {
        state.isFetching = true;
        state.error = null;
        state.registrationSuccess = false;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.isFetching = false;
        state.error = null;
        state.registrationSuccess = true;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isFetching = false;
        state.error = action.payload;
        state.registrationSuccess = false;
      })
      // Xử lý loginUser
      .addCase(loginUser.pending, (state) => {
        state.isFetching = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken;
        state.role = action.payload.user?.Position || null;
        state.isFetching = false;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isFetching = false;
        state.error = action.payload;
      })
      // Xử lý logoutUser
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.refreshToken = null;
        state.role = null;
        state.error = null;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.error = action.payload;
      })
      // Xử lý refreshAccessToken
      .addCase(refreshAccessToken.fulfilled, (state, action) => {
        state.token = action.payload;
      });
  },
});

export const { updateAccessToken, resetAuthState } = authSlice.actions;

export default authSlice.reducer;

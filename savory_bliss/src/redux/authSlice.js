import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const API_URL = process.env.REACT_APP_SERVER_URL 
  ? `${process.env.REACT_APP_SERVER_URL}/auth` 
  : `http://localhost:${process.env.REACT_APP_SERVER_PORT || 5000}/auth`;

// Thunk để khởi tạo trạng thái xác thực
export const initAuth = createAsyncThunk(
  "auth/initAuth",
  async (_, { dispatch }) => {
    console.log("initAuth thunk running");
    const token = localStorage.getItem("token");
    const refreshToken = localStorage.getItem("refreshToken");
    
    console.log("Token from localStorage:", token ? "exists" : "not found");
    
    if (token) {
      try {
        console.log("Đang xác thực token:", token);
        const response = await fetch(`${API_URL}/verify`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        
        console.log("Verify response status:", response.status);
        
        if (response.ok) {
          const data = await response.json();
          console.log("Dữ liệu xác thực:", data);
          return { 
            token, 
            refreshToken, 
            user: data.user 
          };
        } else {
          console.error("Token không hợp lệ, status:", response.status);
          localStorage.removeItem("token");
          localStorage.removeItem("refreshToken");
          return null;
        }
      } catch (error) {
        console.error("Lỗi khi xác minh token:", error);
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        return null;
      }
    }
    return null;
  }
);

// Thunk đăng ký
export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async (userData, { rejectWithValue }) => {
    try {
      console.log("Đang đăng ký với:", userData);
      const response = await fetch(`${API_URL}/register`, {
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
      
      // Lưu token vào localStorage
      if (data.token) {
        localStorage.setItem("token", data.token);
      }
      if (data.refreshToken) {
        localStorage.setItem("refreshToken", data.refreshToken);
      }
      
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Thunk đăng nhập
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (credentials, { rejectWithValue }) => {
    try {
      console.log("Đang đăng nhập với:", credentials);
      const response = await fetch(`${API_URL}/login`, {
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
      
      // Đảm bảo lưu đúng tên biến token
      localStorage.setItem("token", data.token);
      localStorage.setItem("refreshToken", data.refreshToken);
      
      console.log("Token đã lưu:", localStorage.getItem("token"));
      console.log("RefreshToken đã lưu:", localStorage.getItem("refreshToken"));
      
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

      const response = await fetch(`${API_URL}/refresh`, {
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
      // Lưu token mới vào localStorage
      localStorage.setItem("token", data.token);
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

export const forgotPassword = createAsyncThunk(
  "auth/forgotPassword",
  async (email, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `${API_URL}/forgotPassword`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Không thể gửi email đặt lại mật khẩu");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Thunk reset mật khẩu
export const resetPassword = createAsyncThunk(
  "auth/resetPassword",
  async ({ userId, currentPassword, newPassword }, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `${API_URL}/resetPassword/${userId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ currentPassword, newPassword }),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Không thể đổi mật khẩu");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Thunk cập nhật thông tin người dùng
export const updateProfile = createAsyncThunk(
  "auth/updateProfile",
  async ({userId, profileData }, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `${API_URL}/updateProfile/${userId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(profileData),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Could not update profile");
      }

      const data = await response.json();
      return data;
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
    isAuthReady: false, // Thêm trạng thái để biết đã hoàn tất kiểm tra xác thực chưa
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
      // Xử lý initAuth
      .addCase(initAuth.pending, (state) => {
        state.isAuthReady = false;
      })
      .addCase(initAuth.fulfilled, (state, action) => {
        if (action.payload) {
          state.token = action.payload.token;
          state.refreshToken = action.payload.refreshToken;
          state.user = action.payload.user;
          state.role = action.payload.user?.Position || null;
        }
        state.isAuthReady = true;
      })
      .addCase(initAuth.rejected, (state) => {
        state.isAuthReady = true;
      })
      // Xử lý registerUser
      .addCase(registerUser.pending, (state) => {
        state.isFetching = true;
        state.error = null;
        state.registrationSuccess = false;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isFetching = false;
        state.error = null;
        state.registrationSuccess = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken;
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
      })
      // Xử lý forgotPassword
      .addCase(forgotPassword.pending, (state) => {
        state.isFetching = true;
        state.error = null;
      })
      .addCase(forgotPassword.fulfilled, (state) => {
        state.isFetching = false;
        state.error = null;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.isFetching = false;
        state.error = action.payload;
      })

      // Xử lý resetPassword
      .addCase(resetPassword.pending, (state) => {
        state.isFetching = true;
        state.error = null;
      })
      .addCase(resetPassword.fulfilled, (state, action) => {
        state.isFetching = false;
        state.error = null;
        state.user = action.payload.user;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.isFetching = false;
        state.error = action.payload;
      })

      // Xử lý updateProfile
      .addCase(updateProfile.pending, (state) => {
        state.isFetching = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.isFetching = false;
        state.error = null;
        state.user = action.payload.user;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.isFetching = false;
        state.error = action.payload;
      });
  },
});

export const { updateAccessToken, resetAuthState } = authSlice.actions;

export default authSlice.reducer;

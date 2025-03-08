import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
const API_URL = 'http://localhost:5000/api/recipes';

// Thunk để lấy tất cả công thức
export const fetchRecipes = createAsyncThunk(
  'recipes/fetchRecipes',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/recipes`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Không thể lấy danh sách công thức');
      }
      
      const data = await response.json();
      return data.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Thunk để lấy công thức theo ID
export const fetchRecipeById = createAsyncThunk(
  'recipes/fetchRecipeById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/recipes/${id}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Không thể lấy thông tin công thức');
      }
      
      const data = await response.json();
      return data.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Thunk để lấy công thức của người dùng
export const fetchUserRecipes = createAsyncThunk(
  'recipes/fetchUserRecipes',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/user/${userId}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Không thể lấy danh sách công thức của người dùng');
      }
      
      const data = await response.json();
      return data.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Thunk để thêm công thức mới
export const addRecipe = createAsyncThunk(
  'recipes/addRecipe',
  async (recipeData, { rejectWithValue, getState }) => {
    try {
      const { auths } = getState();
      const token = auths.token;
      
      const formData = new FormData();
      
      // Thêm các trường dữ liệu vào FormData
      formData.append('title', recipeData.title);
      formData.append('description', recipeData.description);
      formData.append('tags', JSON.stringify(recipeData.tags));
      formData.append('ingredients', JSON.stringify(recipeData.ingredients));
      formData.append('sections', JSON.stringify(recipeData.sections));
      
      // Thêm hình ảnh chính
      if (recipeData.image) {
        formData.append('image', recipeData.image);
      }
      
      // Thêm hình ảnh cho các phần
      if (recipeData.sectionImages && recipeData.sectionImages.length > 0) {
        recipeData.sectionImages.forEach((image, index) => {
          formData.append('sectionImages', image);
        });
      }
      
      const response = await fetch(`${API_URL}/recipes`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Không thể thêm công thức');
      }
      
      const data = await response.json();
      return data.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Thunk để cập nhật công thức
export const updateRecipe = createAsyncThunk(
  'recipes/updateRecipe',
  async ({ id, recipeData }, { rejectWithValue, getState }) => {
    try {
      const { auths } = getState();
      const token = auths.token;
      
      const formData = new FormData();
      
      // Thêm các trường dữ liệu vào FormData
      formData.append('title', recipeData.title);
      formData.append('description', recipeData.description);
      formData.append('tags', JSON.stringify(recipeData.tags));
      formData.append('ingredients', JSON.stringify(recipeData.ingredients));
      formData.append('sections', JSON.stringify(recipeData.sections));
      
      // Thêm hình ảnh chính nếu có
      if (recipeData.image && recipeData.image instanceof File) {
        formData.append('image', recipeData.image);
      }
      
      // Thêm hình ảnh cho các phần
      if (recipeData.sectionImages && recipeData.sectionImages.length > 0) {
        recipeData.sectionImages.forEach((image, index) => {
          if (image instanceof File) {
            formData.append('sectionImages', image);
            formData.append('sectionImageIndices', index);
          }
        });
      }
      
      const response = await fetch(`${API_URL}/recipes/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Không thể cập nhật công thức');
      }
      
      const data = await response.json();
      return data.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Thunk để xóa công thức
export const deleteRecipe = createAsyncThunk(
  'recipes/deleteRecipe',
  async (id, { rejectWithValue, getState }) => {
    try {
      const { auths } = getState();
      const token = auths.token;
      
      const response = await fetch(`${API_URL}/recipes/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Không thể xóa công thức');
      }
      
      return id;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const recipeSlice = createSlice({
  name: 'recipes',
  initialState: {
    recipes: [],
    currentRecipe: null,
    isFetching: false,
    isAdding: false,
    isUpdating: false,
    isDeleting: false,
    success: false,
    error: null
  },
  reducers: {
    resetRecipeState: (state) => {
      state.success = false;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Xử lý fetchRecipes
      .addCase(fetchRecipes.pending, (state) => {
        state.isFetching = true;
        state.error = null;
      })
      .addCase(fetchRecipes.fulfilled, (state, action) => {
        state.isFetching = false;
        state.recipes = action.payload;
        state.error = null;
      })
      .addCase(fetchRecipes.rejected, (state, action) => {
        state.isFetching = false;
        state.error = action.payload;
      })
      
      // Xử lý fetchRecipeById
      .addCase(fetchRecipeById.pending, (state) => {
        state.isFetching = true;
        state.currentRecipe = null;
        state.error = null;
      })
      .addCase(fetchRecipeById.fulfilled, (state, action) => {
        state.isFetching = false;
        state.currentRecipe = action.payload;
        state.error = null;
      })
      .addCase(fetchRecipeById.rejected, (state, action) => {
        state.isFetching = false;
        state.error = action.payload;
      })
      
      // Xử lý fetchUserRecipes
      .addCase(fetchUserRecipes.pending, (state) => {
        state.isFetching = true;
        state.error = null;
      })
      .addCase(fetchUserRecipes.fulfilled, (state, action) => {
        state.isFetching = false;
        state.recipes = action.payload;
        state.error = null;
      })
      .addCase(fetchUserRecipes.rejected, (state, action) => {
        state.isFetching = false;
        state.error = action.payload;
      })
      
      // Xử lý addRecipe
      .addCase(addRecipe.pending, (state) => {
        state.isAdding = true;
        state.success = false;
        state.error = null;
      })
      .addCase(addRecipe.fulfilled, (state, action) => {
        state.isAdding = false;
        state.recipes.push(action.payload);
        state.success = true;
        state.error = null;
      })
      .addCase(addRecipe.rejected, (state, action) => {
        state.isAdding = false;
        state.success = false;
        state.error = action.payload;
      })
      
      // Xử lý updateRecipe
      .addCase(updateRecipe.pending, (state) => {
        state.isUpdating = true;
        state.success = false;
        state.error = null;
      })
      .addCase(updateRecipe.fulfilled, (state, action) => {
        state.isUpdating = false;
        const index = state.recipes.findIndex(recipe => recipe.id === action.payload.id);
        if (index !== -1) {
          state.recipes[index] = action.payload;
        }
        state.currentRecipe = action.payload;
        state.success = true;
        state.error = null;
      })
      .addCase(updateRecipe.rejected, (state, action) => {
        state.isUpdating = false;
        state.success = false;
        state.error = action.payload;
      })
      
      // Xử lý deleteRecipe
      .addCase(deleteRecipe.pending, (state) => {
        state.isDeleting = true;
        state.success = false;
        state.error = null;
      })
      .addCase(deleteRecipe.fulfilled, (state, action) => {
        state.isDeleting = false;
        state.recipes = state.recipes.filter(recipe => recipe.id !== action.payload);
        state.success = true;
        state.error = null;
      })
      .addCase(deleteRecipe.rejected, (state, action) => {
        state.isDeleting = false;
        state.success = false;
        state.error = action.payload;
      });
  }
});

export const { resetRecipeState } = recipeSlice.actions;

export default recipeSlice.reducer;

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// API Base URL
const API_URL = 'http://localhost:5000/api/recipes';

// Thunk để lấy tất cả công thức
export const fetchRecipes = createAsyncThunk(
  'recipes/fetchRecipes',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(API_URL);
      
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

// Thunk để lấy chi tiết công thức theo ID
export const fetchRecipeById = createAsyncThunk(
  'recipes/fetchRecipeById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/${id}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Không thể lấy chi tiết công thức');
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
      const { token } = getState().auths;
      
      if (!token) {
        throw new Error('Bạn cần đăng nhập để thêm công thức');
      }
      
      const formData = new FormData();
      
      // Thêm các trường cơ bản
      formData.append('title', recipeData.title);
      formData.append('description', recipeData.description || '');
      formData.append('tags', recipeData.tags || '');
      formData.append('ingredients', recipeData.ingredients || '');
      
      // Thêm hình ảnh chính
      if (recipeData.image) {
        formData.append('image', recipeData.image);
      }
      
      // Xử lý sections
      if (recipeData.sections && recipeData.sections.length > 0) {
        const sectionsForBackend = recipeData.sections.map(section => ({
          id: section.id,
          title: section.title || '',
          content: section.content || '',
        }));
        
        formData.append('sections', JSON.stringify(sectionsForBackend));
        
        // Thêm hình ảnh cho các section
        recipeData.sections.forEach(section => {
          if (section.image) {
            // Đặt tên file để backend có thể nhận diện section
            formData.append('sectionImages', section.image, `section-${section.id}`);
          }
        });
      }
      
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
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
      const { token } = getState().auths;
      
      if (!token) {
        throw new Error('Bạn cần đăng nhập để cập nhật công thức');
      }
      
      const formData = new FormData();
      
      // Thêm các trường cơ bản
      formData.append('title', recipeData.title);
      formData.append('description', recipeData.description || '');
      formData.append('tags', recipeData.tags || '');
      formData.append('ingredients', recipeData.ingredients || '');
      
      // Thêm hình ảnh chính nếu có
      if (recipeData.image && recipeData.image instanceof File) {
        formData.append('image', recipeData.image);
      }
      
      // Xử lý sections
      if (recipeData.sections && recipeData.sections.length > 0) {
        const sectionsForBackend = recipeData.sections.map(section => ({
          id: section.id,
          title: section.title || '',
          content: section.content || '',
        }));
        
        formData.append('sections', JSON.stringify(sectionsForBackend));
        
        // Thêm hình ảnh cho các section
        recipeData.sections.forEach(section => {
          if (section.image && section.image instanceof File) {
            formData.append('sectionImages', section.image, `section-${section.id}`);
          }
        });
      }
      
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`
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
      const { token } = getState().auths;
      
      if (!token) {
        throw new Error('Bạn cần đăng nhập để xóa công thức');
      }
      
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
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
    error: null,
    success: false
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
      
      // Xử lý addRecipe
      .addCase(addRecipe.pending, (state) => {
        state.isFetching = true;
        state.success = false;
        state.error = null;
      })
      .addCase(addRecipe.fulfilled, (state, action) => {
        state.isFetching = false;
        state.recipes.unshift(action.payload);
        state.success = true;
        state.error = null;
      })
      .addCase(addRecipe.rejected, (state, action) => {
        state.isFetching = false;
        state.error = action.payload;
        state.success = false;
      })
      
      // Xử lý updateRecipe
      .addCase(updateRecipe.pending, (state) => {
        state.isFetching = true;
        state.success = false;
        state.error = null;
      })
      .addCase(updateRecipe.fulfilled, (state, action) => {
        state.isFetching = false;
        state.recipes = state.recipes.map(recipe => 
          recipe._id === action.payload._id ? action.payload : recipe
        );
        state.currentRecipe = action.payload;
        state.success = true;
        state.error = null;
      })
      .addCase(updateRecipe.rejected, (state, action) => {
        state.isFetching = false;
        state.error = action.payload;
        state.success = false;
      })
      
      // Xử lý deleteRecipe
      .addCase(deleteRecipe.pending, (state) => {
        state.isFetching = true;
        state.error = null;
      })
      .addCase(deleteRecipe.fulfilled, (state, action) => {
        state.isFetching = false;
        state.recipes = state.recipes.filter(recipe => recipe._id !== action.payload);
        state.success = true;
        state.error = null;
      })
      .addCase(deleteRecipe.rejected, (state, action) => {
        state.isFetching = false;
        state.error = action.payload;
      });
  }
});

export const { resetRecipeState } = recipeSlice.actions;
export default recipeSlice.reducer;

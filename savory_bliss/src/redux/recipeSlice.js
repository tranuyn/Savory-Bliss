import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const API_URL = 'http://localhost:5000/api/recipes';

// New thunk action for toggle like functionality
export const toggleLikeRecipe = createAsyncThunk(
  'recipes/toggleLike',
  async (recipeId, { rejectWithValue, getState }) => {
    try {
      const { auths } = getState();
      const token = auths.token;

      const response = await fetch(`${API_URL}/${recipeId}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Could not toggle like status');
      }

      const data = await response.json();
      return {
        recipeId,
        likes: data.likes,
        isLiked: data.isLiked
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Thunk để lấy công thức yêu thích của người dùng
export const fetchFavoriteRecipes = createAsyncThunk(
  'recipes/fetchFavoriteRecipes',
  async (_, { rejectWithValue, getState }) => {
    try {
      const { auths } = getState();
      const token = auths.token;

      const response = await fetch(`${API_URL}/favorites`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Không thể lấy danh sách công thức yêu thích');
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Thunk để chuyển đổi trạng thái yêu thích
export const toggleFavorite = createAsyncThunk(
  'recipes/toggleFavorite',
  async (recipeId, { rejectWithValue, getState }) => {
    try {
      const { auths } = getState();
      const token = auths.token;

      const response = await fetch(`${API_URL}/${recipeId}/favorite`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Không thể thay đổi trạng thái yêu thích');
      }

      const data = await response.json();
      return {
        recipeId,
        isFavorited: data.isFavorited,
        favoritesCount: data.favoritesCount
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

//search recipes
export const searchRecipes = createAsyncThunk(
  'recipes/search',
  async ({ searchQuery, tags, page = 1, limit = 10 }, { rejectWithValue }) => {
    try {
      console.log('Searching with params:', { searchQuery, tags, page, limit });
      
      const queryParams = new URLSearchParams();

      const trimmedQuery = searchQuery?.trim();
      if (trimmedQuery) {
        queryParams.append('query', trimmedQuery);
      }

      // Handle tags array properly
      if (Array.isArray(tags) && tags.length > 0) {
        // Filter out empty tags and join
        const validTags = tags.filter(tag => tag?.trim()).join(',');
        if (validTags) {
          queryParams.append('tags', validTags);
        }
      }

      // Validate pagination params
      const validPage = Math.max(1, parseInt(page) || 1);
      const validLimit = Math.min(50, Math.max(1, parseInt(limit) || 10));

      queryParams.append('page', validPage);
      queryParams.append('limit', validLimit);

      // Make API request
      const url = `${API_URL}/search?${queryParams}`;
      console.log('Making request to:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Cache-Control': 'no-cache'
        }
      });

      const data = await response.json();
      console.log('Search response:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Không thể tìm kiếm công thức');
      }

      // Validate response data structure
      if (!data.data || !Array.isArray(data.data)) {
        throw new Error('Invalid response format');
      }

      return {
        data: data.data,
        pagination: {
          total: data.pagination?.total || 0,
          page: validPage,
          pages: data.pagination?.pages || 1
        }
      };

    } catch (error) {
      console.error('Search error:', error);
      return rejectWithValue(error.message || 'Đã xảy ra lỗi khi tìm kiếm');
    }
  }
);

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

// Thunk để lấy công thức theo ID
export const fetchRecipeById = createAsyncThunk(
  'recipes/fetchRecipeById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/${id}`);

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
      formData.append('tags', recipeData.tags.join(','));
      formData.append('ingredients', recipeData.ingredients.join('\n'));
      
      // Convert sections to JSON and append
      if (recipeData.sections && recipeData.sections.length > 0) {
        formData.append('sections', JSON.stringify(recipeData.sections));
      }

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

      const response = await fetch(API_URL, {
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
      formData.append('tags', recipeData.tags.join(','));
      formData.append('ingredients', recipeData.ingredients.join('\n'));
      
      // Convert sections to JSON and append
      if (recipeData.sections && recipeData.sections.length > 0) {
        formData.append('sections', JSON.stringify(recipeData.sections));
      }

      // Thêm hình ảnh chính nếu có
      if (recipeData.image && recipeData.image instanceof File) {
        formData.append('image', recipeData.image);
      }

      // Thêm hình ảnh cho các phần
      if (recipeData.sectionImages && recipeData.sectionImages.length > 0) {
        recipeData.sectionImages.forEach((image, index) => {
          if (image instanceof File) {
            formData.append('sectionImages', image);
          }
        });
      }

      const response = await fetch(`${API_URL}/${id}`, {
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

      const response = await fetch(`${API_URL}/${id}`, {
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
    favoriteRecipes: [],
    isFetching: false,
    isAdding: false,
    isUpdating: false,
    isDeleting: false,
    success: false,
    error: null,
    pagination: {
      total: 0,
      page: 1,
      pages: 1
    }
  },
  reducers: {
    resetRecipeState: (state) => {
      state.success = false;
      state.error = null;
    },
    clearSearchResults: (state) => {
      state.recipes = [];
      state.pagination = {
        total: 0,
        page: 1,
        pages: 1
      };
    }
  },
  extraReducers: (builder) => {
    builder
      // Toggle like cases
      .addCase(toggleLikeRecipe.pending, (state) => {
        state.error = null;
      })
      .addCase(toggleLikeRecipe.fulfilled, (state, action) => {
        const { recipeId, likes, isLiked } = action.payload;
        
        // Update the current recipe if it matches
        if (state.currentRecipe && state.currentRecipe._id === recipeId) {
          state.currentRecipe.likes = likes;
          state.currentRecipe.isLiked = isLiked;
        }
        
        // Update the recipe in the recipes array if it exists
        const recipeIndex = state.recipes.findIndex(r => r._id === recipeId);
        if (recipeIndex !== -1) {
          state.recipes[recipeIndex].likes = likes;
          state.recipes[recipeIndex].isLiked = isLiked;
        }
        
        state.error = null;
      })
      .addCase(toggleLikeRecipe.rejected, (state, action) => {
        state.error = action.payload;
      })
      
      // Toggle favorite cases
      .addCase(toggleFavorite.pending, (state) => {
        state.error = null;
      })
      .addCase(toggleFavorite.fulfilled, (state, action) => {
        const { recipeId, isFavorited, favoritesCount } = action.payload;
        
        // Update the current recipe if it matches
        if (state.currentRecipe && state.currentRecipe._id === recipeId) {
          state.currentRecipe.isFavorited = isFavorited;
          state.currentRecipe.favoritesCount = favoritesCount;
        }
        
        // Update the recipe in the recipes array if it exists
        const recipeIndex = state.recipes.findIndex(r => r._id === recipeId);
        if (recipeIndex !== -1) {
          state.recipes[recipeIndex].isFavorited = isFavorited;
          state.recipes[recipeIndex].favoritesCount = favoritesCount;
        }
        
        state.error = null;
      })
      .addCase(toggleFavorite.rejected, (state, action) => {
        state.error = action.payload;
      })
      
      // Fetch favorite recipes cases
      .addCase(fetchFavoriteRecipes.pending, (state) => {
        state.isFetching = true;
        state.error = null;
      })
      .addCase(fetchFavoriteRecipes.fulfilled, (state, action) => {
        state.isFetching = false;
        state.favoriteRecipes = action.payload;
        state.error = null;
      })
      .addCase(fetchFavoriteRecipes.rejected, (state, action) => {
        state.isFetching = false;
        state.error = action.payload;
      })

      // Search recipes cases
      .addCase(searchRecipes.pending, (state) => {
        state.isFetching = true;
        state.error = null;
      })
      .addCase(searchRecipes.fulfilled, (state, action) => {
        state.isFetching = false;
        state.recipes = action.payload.data;
        state.pagination = action.payload.pagination;
        state.error = null;
      })
      .addCase(searchRecipes.rejected, (state, action) => {
        state.isFetching = false;
        state.error = action.payload;
        state.recipes = [];
      })

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
        const index = state.recipes.findIndex(recipe => recipe._id === action.payload._id);
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
        state.recipes = state.recipes.filter(recipe => recipe._id !== action.payload);
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

export const { resetRecipeState, clearSearchResults } = recipeSlice.actions;
export default recipeSlice.reducer;
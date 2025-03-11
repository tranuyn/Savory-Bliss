import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const API_URL = 'http://localhost:5000/api/recipes';

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

// Thunk để lưu/bỏ lưu công thức
export const toggleSaveRecipe = createAsyncThunk(
  'recipes/toggleSaveRecipe',
  async (recipeId, { getState, rejectWithValue }) => {
    try {
      const { auths } = getState();

      if (!auths.token) {
        throw new Error('Authentication required');
      }

      // Update the endpoint path to match your backend route
      const response = await fetch(`${API_URL}/user/${recipeId}/save`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${auths.token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      console.log('Save response:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Could not save recipe');
      }

      return {
        recipeId,
        isSaved: data.isSaved
      };

    } catch (error) {
      console.error('Toggle save error:', error);
      return rejectWithValue(error.message);
    }
  }
);


// Thunk để lấy danh sách công thức đã lưu
export const fetchSavedRecipes = createAsyncThunk(
  "recipes/fetchSaved",
  async (_, { getState, rejectWithValue }) => {
    try {
      const { auths } = getState();

      if (!auths?.token) {
        return rejectWithValue("Authentication required");
      }

      const response = await fetch(`${API_URL}/saved-recipes`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${auths.token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.message || "Could not fetch saved recipes");
      }

      const data = await response.json();
      return data; // Giả sử API trả về danh sách recipes

    } catch (error) {
      console.error("Fetch saved recipes error:", error);
      return rejectWithValue(error.message || "Unknown error occurred");
    }
  }
);

export const fetchSavedRecipesDetails = createAsyncThunk(
  "recipes/fetchSavedDetails",
  async (_, { getState, dispatch, rejectWithValue }) => {
    try {
      const { auths } = getState();

      if (!auths?.token) {
        return rejectWithValue("Authentication required");
      }

      // Đầu tiên lấy danh sách ID các công thức đã lưu
      const savedResult = await dispatch(fetchSavedRecipes()).unwrap();
      
      if (!Array.isArray(savedResult) || savedResult.length === 0) {
        return []; // Trả về mảng rỗng nếu không có công thức nào được lưu
      }
      
      // Tạo mảng các promise để lấy thông tin chi tiết của từng công thức
      const recipePromises = savedResult.map(id => 
        fetch(`${API_URL}/${id}`, {
          headers: {
            "Authorization": `Bearer ${auths.token}`,
            "Content-Type": "application/json",
          }
        })
        .then(res => {
          if (!res.ok) throw new Error(`Could not fetch recipe ${id}`);
          return res.json();
        })
        .then(data => data.data)
      );
      
      // Thực hiện tất cả các request song song
      const recipes = await Promise.all(recipePromises);
      return recipes;
      
    } catch (error) {
      console.error("Fetch saved recipes details error:", error);
      return rejectWithValue(error.message || "Failed to fetch recipe details");
    }
  }
);

const recipeSlice = createSlice({
  name: 'recipes',
  initialState: {
    recipes: [],
    savedRecipes: [],
    savedRecipesDetails: [],
    currentRecipe: null,
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
      })

      // Xử lý toggleSaveRecipe
      .addCase(toggleSaveRecipe.pending, (state) => {
        state.isFetching = true;
        state.error = null;
      })
      .addCase(toggleSaveRecipe.fulfilled, (state, action) => {
        state.isFetching = false;
        if (action.payload.isSaved) {
          state.savedRecipes.push(action.payload.recipeId);
        } else {
          state.savedRecipes = state.savedRecipes.filter(
            id => id !== action.payload.recipeId
          );
        }
      })
      .addCase(toggleSaveRecipe.rejected, (state, action) => {
        state.isFetching = false;
        state.error = action.payload;
      })

      // Xử lý fetchSavedRecipes
      .addCase(fetchSavedRecipes.pending, (state) => {
        state.isFetching = true;
        state.error = null;
      })
      .addCase(fetchSavedRecipes.fulfilled, (state, action) => {
        state.isFetching = false;
        state.savedRecipes = Array.isArray(action.payload) ? action.payload : [];
        state.error = null;
      })
      .addCase(fetchSavedRecipes.rejected, (state, action) => {
        state.isFetching = false;
        state.savedRecipes = [];
        state.error = action.payload;
      })

      // Xử lý fetchSavedRecipesDetails
     .addCase(fetchSavedRecipesDetails.pending, (state) => {
      state.isFetching = true;
      state.error = null;
    })
    .addCase(fetchSavedRecipesDetails.fulfilled, (state, action) => {
      state.isFetching = false;
      state.savedRecipesDetails = action.payload; // Lưu thông tin chi tiết vào state
      state.error = null;
    })
    .addCase(fetchSavedRecipesDetails.rejected, (state, action) => {
      state.isFetching = false;
      state.savedRecipesDetails = [];
      state.error = action.payload;
    });
  }
});

export const { resetRecipeState, clearSearchResults } = recipeSlice.actions;
export default recipeSlice.reducer;
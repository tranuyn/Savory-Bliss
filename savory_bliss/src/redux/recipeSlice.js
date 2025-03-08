import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Search Recipes Thunk
export const searchRecipes = createAsyncThunk(
  'recipes/search',
  async ({ searchQuery, tags, page = 1, limit = 10 }, { rejectWithValue }) => {
    try {
      // Build query parameters
      const queryParams = new URLSearchParams();
      if (searchQuery) queryParams.append('query', searchQuery);
      if (tags && tags.length) queryParams.append('tags', tags.join(','));
      queryParams.append('page', page);
      queryParams.append('limit', limit);

      const response = await fetch(
        `http://localhost:5000/api/recipes/search?${queryParams}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        const error = await response.json();
        return rejectWithValue(error.message || 'Không thể tìm kiếm công thức');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Recipe Slice
const recipeSlice = createSlice({
  name: 'recipes',
  initialState: {
    recipes: [],
    pagination: {
      total: 0,
      page: 1,
      pages: 1
    },
    isLoading: false,
    error: null
  },
  reducers: {
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
      .addCase(searchRecipes.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(searchRecipes.fulfilled, (state, action) => {
        state.isLoading = false;
        state.recipes = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(searchRecipes.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  }
});

export const { clearSearchResults } = recipeSlice.actions;
export default recipeSlice.reducer;
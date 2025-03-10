import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const API_URL = 'http://localhost:5000/api/comments';

// Async thunks
export const fetchCommentsByRecipe = createAsyncThunk(
  'comments/fetchByRecipe',
  async (recipeId, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/recipe/${recipeId}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Không thể lấy danh sách bình luận');
      }
      
      const data = await response.json();
      return {
        data: data.data,
        count: data.pagination?.total || data.data.length
      };
    } catch (error) {
      return rejectWithValue(error.message || 'Lỗi khi lấy comments');
    }
  }
);

export const createComment = createAsyncThunk(
  'comments/create',
  async ({ recipeId, content }, { rejectWithValue, getState }) => {
    try {
      const { auths } = getState();
      const token = auths.token;
      
      const response = await fetch(`${API_URL}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ recipeId, content })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Không thể tạo bình luận');
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message || 'Lỗi khi tạo comment');
    }
  }
);

export const updateComment = createAsyncThunk(
  'comments/update',
  async ({ commentId, content }, { rejectWithValue, getState }) => {
    try {
      const { auths } = getState();
      const token = auths.token;
      
      const response = await fetch(`${API_URL}/${commentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Không thể cập nhật bình luận');
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message || 'Lỗi khi cập nhật comment');
    }
  }
);

export const deleteComment = createAsyncThunk(
  'comments/delete',
  async (commentId, { rejectWithValue, getState }) => {
    try {
      const { auths } = getState();
      const token = auths.token;
      
      const response = await fetch(`${API_URL}/${commentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Không thể xóa bình luận');
      }
      
      return { commentId };
    } catch (error) {
      return rejectWithValue(error.message || 'Lỗi khi xóa comment');
    }
  }
);

export const addReply = createAsyncThunk(
  'comments/addReply',
  async ({ commentId, content }, { rejectWithValue, getState }) => {
    try {
      const { auths } = getState();
      const token = auths.token;
      
      const response = await fetch(`${API_URL}/${commentId}/replies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Không thể thêm phản hồi');
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message || 'Lỗi khi thêm reply');
    }
  }
);

export const toggleLike = createAsyncThunk(
  'comments/toggleLike',
  async (commentId, { rejectWithValue, getState }) => {
    try {
      const { auths } = getState();
      const token = auths.token;
      const userId = auths.user?.id;
      
      const response = await fetch(`${API_URL}/${commentId}/toggle-like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Không thể thao tác với like');
      }
      
      const data = await response.json();
      return { 
        commentId, 
        isLiked: data.isLiked,
        userId
      };
    } catch (error) {
      return rejectWithValue(error.message || 'Lỗi khi thao tác với like');
    }
  }
);

// Comment slice
const commentSlice = createSlice({
  name: 'comments',
  initialState: {
    comments: [],
    isFetching: false,
    isAdding: false,
    isUpdating: false,
    isDeleting: false,
    success: false,
    error: null,
    commentCount: 0,
    activeComment: null  // For editing or replying
  },
  reducers: {
    setActiveComment: (state, action) => {
      state.activeComment = action.payload;
    },
    clearActiveComment: (state) => {
      state.activeComment = null;
    },
    resetCommentState: (state) => {
      state.success = false;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch comments cases
      .addCase(fetchCommentsByRecipe.pending, (state) => {
        state.isFetching = true;
        state.error = null;
      })
      .addCase(fetchCommentsByRecipe.fulfilled, (state, action) => {
        state.isFetching = false;
        state.comments = action.payload.data;
        state.commentCount = action.payload.count;
        state.error = null;
      })
      .addCase(fetchCommentsByRecipe.rejected, (state, action) => {
        state.isFetching = false;
        state.error = action.payload || 'Không thể lấy comments';
      })

      // Create comment cases
      .addCase(createComment.pending, (state) => {
        state.isAdding = true;
        state.success = false;
        state.error = null;
      })
      .addCase(createComment.fulfilled, (state, action) => {
        state.isAdding = false;
        state.comments = [action.payload.data, ...state.comments];
        state.commentCount += 1;
        state.success = true;
        state.error = null;
      })
      .addCase(createComment.rejected, (state, action) => {
        state.isAdding = false;
        state.success = false;
        state.error = action.payload || 'Không thể tạo comment';
      })

      // Update comment cases
      .addCase(updateComment.pending, (state) => {
        state.isUpdating = true;
        state.success = false;
        state.error = null;
      })
      .addCase(updateComment.fulfilled, (state, action) => {
        state.isUpdating = false;
        const updatedComment = action.payload.data;
        state.comments = state.comments.map(comment => 
          comment._id === updatedComment._id ? updatedComment : comment
        );
        state.success = true;
        state.error = null;
      })
      .addCase(updateComment.rejected, (state, action) => {
        state.isUpdating = false;
        state.success = false;
        state.error = action.payload || 'Không thể cập nhật comment';
      })

      // Delete comment cases
      .addCase(deleteComment.pending, (state) => {
        state.isDeleting = true;
        state.success = false;
        state.error = null;
      })
      .addCase(deleteComment.fulfilled, (state, action) => {
        state.isDeleting = false;
        state.comments = state.comments.filter(comment => comment._id !== action.payload.commentId);
        state.commentCount -= 1;
        state.success = true;
        state.error = null;
      })
      .addCase(deleteComment.rejected, (state, action) => {
        state.isDeleting = false;
        state.success = false;
        state.error = action.payload || 'Không thể xóa comment';
      })

      // Add reply cases
      .addCase(addReply.pending, (state) => {
        state.isAdding = true;
        state.success = false;
        state.error = null;
      })
      .addCase(addReply.fulfilled, (state, action) => {
        state.isAdding = false;
        const updatedComment = action.payload.data;
        state.comments = state.comments.map(comment => 
          comment._id === updatedComment._id ? updatedComment : comment
        );
        state.success = true;
        state.error = null;
      })
      .addCase(addReply.rejected, (state, action) => {
        state.isAdding = false;
        state.success = false;
        state.error = action.payload || 'Không thể thêm reply';
      })

      // Toggle like cases
      .addCase(toggleLike.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(toggleLike.fulfilled, (state, action) => {
        state.isUpdating = false;
        // Find the comment in state
        const commentIndex = state.comments.findIndex(c => c._id === action.payload.commentId);
        if (commentIndex !== -1) {
          const comment = state.comments[commentIndex];
          const updatedLikes = action.payload.isLiked 
            ? [...(comment.likes || []), action.payload.userId] 
            : (comment.likes || []).filter(id => id !== action.payload.userId);
          
          state.comments[commentIndex] = {
            ...comment,
            likes: updatedLikes
          };
        }
        state.success = true;
        state.error = null;
      })
      .addCase(toggleLike.rejected, (state, action) => {
        state.isUpdating = false;
        state.success = false;
        state.error = action.payload || 'Không thể thao tác với like';
      });
  }
});

export const { setActiveComment, clearActiveComment, resetCommentState } = commentSlice.actions;

export default commentSlice.reducer;

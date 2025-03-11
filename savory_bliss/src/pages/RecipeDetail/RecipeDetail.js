import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { SendHorizonal, Reply, SquareX } from "lucide-react";
import { 
  fetchRecipeById, 
  toggleLikeRecipe, 
  toggleFavorite 
} from "../../redux/recipeSlice";
import { 
  fetchCommentsByRecipe, 
  createComment, 
  updateComment, 
  deleteComment, 
  addReply,
  toggleLike,
  setActiveComment,
  clearActiveComment
} from "../../redux/commentSlice";
import "./RecipeDetail.css";
import TabButton from "../../Component/TabButton";

function RecipeDetail() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentRecipe, isFetching, relatedRecipes } = useSelector(state => state.recipes);
  const { comments, isLoading, commentCount, activeComment } = useSelector(state => state.comments);
  const { user, isAuthenticated } = useSelector(state => state.auths);
  const [activeTab, setActiveTab] = useState("ingredients");
  const [commentContent, setCommentContent] = useState("");
  const [editContent, setEditContent] = useState("");

  useEffect(() => {
    if (id) {
      dispatch(fetchRecipeById(id));
      dispatch(fetchCommentsByRecipe(id));
    }
  }, [dispatch, id]);

  // Recipe like handler
  const handleLikeRecipe = () => {
    if (user) {
      dispatch(toggleLikeRecipe(id));
    } else {
      // Redirect to login or show login prompt
      alert("Vui lòng đăng nhập để thích công thức này");
    }
  };

  // Recipe favorite handler
  const handleFavoriteRecipe = () => {
    if (user) {
      dispatch(toggleFavorite(id));
    } else {
      // Redirect to login or show login prompt
      alert("Vui lòng đăng nhập để lưu công thức này vào danh sách yêu thích");
    }
  };

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (!commentContent.trim()) return;
    
    dispatch(createComment({ recipeId: id, content: commentContent }))
      .then(() => setCommentContent(""));
  };

  const handleEditComment = (commentId) => {
    const comment = comments.find(c => c._id === commentId);
    if (comment) {
      setEditContent(comment.content);
      dispatch(setActiveComment({ id: commentId, type: 'editing' }));
    }
  };

  const handleUpdateComment = (commentId) => {
    if (!editContent.trim()) return;
    
    dispatch(updateComment({ commentId, content: editContent }))
      .then(() => {
        setEditContent("");
        dispatch(clearActiveComment());
      });
  };

  const handleDeleteComment = (commentId) => {
    if (window.confirm('Bạn có chắc muốn xóa bình luận này?')) {
      dispatch(deleteComment(commentId));
    }
  };

  const handleReply = (commentId) => {
    dispatch(setActiveComment({ id: commentId, type: 'replying' }));
    setEditContent("");
  };

  const handleSubmitReply = (commentId) => {
    if (!editContent.trim()) return;
    
    dispatch(addReply({ commentId, content: editContent }))
      .then(() => {
        setEditContent("");
        dispatch(clearActiveComment());
      });
  };

  const handleLikeComment = (commentId) => {
    if (user) {
      dispatch(toggleLike(commentId));
    } else {
      alert("Vui lòng đăng nhập để thích bình luận");
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN');
  };

  if (isFetching || isLoading) {
    return <div className="loading">Loading recipe and comments...</div>;
  }

  if (!currentRecipe) {
    return <div className="no-recipe">Recipe not found.</div>;
  }

  return (
    <div className="recipe-detail-container">
      <div className="recipe-header">
        <img 
          src={currentRecipe.imageUrl} 
          alt={currentRecipe.title} 
          className="recipe-cover-image" 
        />
      </div>

      <div className="recipe-detail-content">
        <div className="recipe-sidebar">
          <div className="ingredients-list">
          <div className="sidebar-title">Ingredients</div>
            {currentRecipe.ingredients && currentRecipe.ingredients.map((ingredient, index) => (
              <div key={index} className="ingredient-item">
                • {ingredient}
              </div>
            ))}
          </div>
        </div>

        <div className="recipe-main-content">
          <div className="recipe-title-section">
            <h1 className="recipe-title">{currentRecipe.title}</h1>
          </div>

          <div className="recipe-description">
            {currentRecipe.description}
          </div>

          {currentRecipe.sections && currentRecipe.sections.map((section, index) => (
            <div key={index} className="recipe-section">
              <h2 className="section-title">Bước {index + 1}: {section.title}</h2>
              <p className="section-content">{section.content}</p>
              {section.imageUrl && (
                <img 
                  src={section.imageUrl} 
                  alt={section.title} 
                  className="section-image" 
                />
              )}
            </div>
          ))}

          <div className="recipe-interaction">
            <div className="recipe-likes">
              <button 
                className={`like-btn ${currentRecipe.isLiked ? 'liked' : ''}`}
                onClick={handleLikeRecipe}
              >
                {currentRecipe.isLiked ? '❤️' : '🤍'}
              </button>
              <span>{currentRecipe.likes?.length || 0}</span>
            </div>
           
            <div className="recipe-views">
              <i className="view-icon">👁️</i>
              <span>{currentRecipe.views || 0}</span>
            </div>

            <div className="recipe-favorites">
              <button 
                className={`favorite-btn ${currentRecipe.isFavorited ? 'favorited' : ''}`}
                onClick={handleFavoriteRecipe}
              >
                {currentRecipe.isFavorited ? '⭐' : '☆'}
              </button>
            </div>
          </div>

          <div className="recipe-comments">
            <h3 className="comments-title">Comments ({commentCount})</h3>
            
            {/* Comment input area */}
            {user ? (
              <form onSubmit={handleCommentSubmit} className="comment-input-area">
                <div className="comment-avatar">
                  <img src={user.Ava || "/default-avatar.png"} alt="User avatar" />
                </div>
                <input 
                  type="text" 
                  className="comment-input" 
                  placeholder="Give this recipe a comment..." 
                  value={commentContent}
                  onChange={(e) => setCommentContent(e.target.value)}
                />
                <button type="submit" className="comment-submit-btn" style={{border: 0}} ><SendHorizonal/></button>
              </form>
            ) : (
              <div className="login-to-comment">
                <Link to="/login">Đăng nhập</Link> để bình luận
              </div>
            )}
            
            {/* Comment items */}
            {comments.map(comment => (
              <div key={comment._id} className="comment-item">
                <div className="comment-avatar">
                  <img src={comment.user?.Ava || "/default-avatar.png"} />
                </div>
                <div className="comment-content">
                  <div className="comment-header">
                    <span className="comment-author">{comment.user?.name || "Anonymous"}</span>
                    <span className="comment-date">{formatDate(comment.createdAt)}</span>
                  </div>
                  
                  {activeComment?.id === comment._id && activeComment?.type === 'editing' ? (
                    <div className="edit-comment-form">
                      <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="edit-comment-input"
                      />
                      <div className="edit-comment-actions">
                        <button onClick={() => handleUpdateComment(comment._id)}>Lưu</button>
                        <button onClick={() => dispatch(clearActiveComment())}><SquareX/></button>
                      </div>
                    </div>
                  ) : (
                    <p className="comment-text">{comment.content}</p>
                  )}
                  
                  {/* <div className="comment-actions">
                    <button 
                      className={`like-btn ${comment.likes?.includes(user?._id) ? 'liked' : ''}`}
                      onClick={() => handleLikeComment(comment._id)}
                    >
                      {comment.likes?.includes(user?._id) ? '❤️' : '🤍'} {comment.likes?.length || 0}
                    </button>
                    
                    {user && (
                      <>
                        <button 
                          onClick={() => handleReply(comment._id)} 
                          style={{border: 0, paddingLeft: 10, backgroundColor: "transparent", display: 'flex',alignItems: 'center'}}
                          >
                            <Reply size={16}/>
                        </button>
                        {comment.user?._id === user._id && (
                          <>
                            <button onClick={() => handleEditComment(comment._id)}>Sửa</button>
                            <button onClick={() => handleDeleteComment(comment._id)}>Xóa</button>
                          </>
                        )}
                      </>
                    )}
                  </div> */}
                  
                  {/* Reply form */}
                  {activeComment?.id === comment._id && activeComment?.type === 'replying' && (
                    <div className="reply-form">
                      <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        placeholder="Viết trả lời..."
                        className="reply-input"
                      />
                      <div className="reply-actions">
                        <button onClick={() => handleSubmitReply(comment._id)}><Reply/></button>
                        <button onClick={() => dispatch(clearActiveComment())}>Hủy</button>
                      </div>
                    </div>
                  )}
                  
                  {/* Replies */}
                  {comment.replies && comment.replies.length > 0 && (
                    <div className="comment-replies">
                      {comment.replies.map(reply => (
                        <div key={reply._id} className="reply-item">
                          <div className="reply-avatar">
                            <img src={reply.user?.Ava || "/default-avatar.png"} alt="User avatar" />
                          </div>
                          <div className="reply-content">
                            <div className="reply-header">
                              <span className="reply-author">{reply.user?.name || "Anonymous"}</span>
                              <span className="reply-date">{formatDate(reply.createdAt)}</span>
                            </div>
                            <p className="reply-text">{reply.content}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {comments.length < commentCount && (
              <button 
                className="more-comments-btn"
                onClick={() => dispatch(fetchCommentsByRecipe(id, { page: Math.ceil(comments.length / 10) + 1 }))}
              >
                Xem thêm bình luận...
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="more-recipes-section">
        <h3 className="more-recipes-title">More recipes...</h3>
        <div className="more-recipes-grid">
          {relatedRecipes && relatedRecipes.slice(0, 2).map(recipe => (
            <div key={recipe._id} className="more-recipe-card">
              <div className="more-recipe-content">
                <div className="more-recipe-image">
                  <img src={recipe.imageUrl} alt={recipe.title} />
                  {/* Nút yêu thích trên các công thức liên quan */}
                </div>
                <div className="more-recipe-info">
                  <h4 className="more-recipe-title">
                    <Link to={`/recipe/${recipe._id}`}>{recipe.title}</Link>
                  </h4>
                  <p className="more-recipe-description">{recipe.description}</p>
                  <div className="more-recipe-stats">
                    <div className="recipe-author">
                      <img src={recipe.author?.avatar || "/default-avatar.png"} alt="Author" className="author-avatar" />
                    </div>
                    <div className="recipe-metrics">
                      <span className="recipe-likes">
                        <i className="like-icon">❤️</i> {recipe.likes?.length || 0}
                      </span>
                      <span className="recipe-favorites">
                        <i className="favorite-icon">⭐</i> {recipe.favorites?.length || 0}
                      </span>
                      <span className="recipe-views">
                        <i className="view-icon">👁️</i> {recipe.views || 0}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default RecipeDetail;

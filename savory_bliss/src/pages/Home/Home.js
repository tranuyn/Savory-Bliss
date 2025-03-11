import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { fetchRecipes, toggleFavorite } from "../../redux/recipeSlice";
import FilterAndSort from "../../Component/FilterAndSort";
import "./Home.css";

function Home() {
  const dispatch = useDispatch();

  // Get state from Redux
  const { recipes, isFetching } = useSelector(state => state.recipes);
  const { user } = useSelector(state => state.auths);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterSettings, setFilterSettings] = useState({
    dateFilter: { from: '', to: '' },
    likesSort: 'descending',
    viewsSort: 'descending',
    activeSort: 'likes'
  });

  // Fetch all recipes when component mounts
  useEffect(() => {
    dispatch(fetchRecipes());
  }, [dispatch]);

  // Xử lý yêu thích
  const handleToggleFavorite = (e, recipeId) => {
    e.preventDefault(); // Prevent navigation when clicking the favorite button
    e.stopPropagation(); // Prevent event from bubbling up to parent elements
    
    if (user) {
      dispatch(toggleFavorite(recipeId));
    } else {
      alert("Vui lòng đăng nhập để lưu công thức vào danh sách yêu thích");
    }
  };

  // Sử dụng useCallback để tránh tạo lại hàm mỗi khi component re-render
  const handleFilterChange = useCallback((newFilterSettings) => {
    setFilterSettings(newFilterSettings);
  }, []);

  // Sử dụng useMemo để tối ưu hóa việc lọc và sắp xếp
  const filteredAndSortedRecipes = useMemo(() => {
    if (!recipes) return [];
    
    // Bước 1: Lọc theo từ khóa tìm kiếm
    let tempRecipes = recipes.filter(recipe =>
      recipe.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    // Bước 2: Lọc theo ngày nếu có
    if (filterSettings.dateFilter.from || filterSettings.dateFilter.to) {
      const fromDate = filterSettings.dateFilter.from ? new Date(filterSettings.dateFilter.from) : new Date(0);
      const toDate = filterSettings.dateFilter.to ? new Date(filterSettings.dateFilter.to) : new Date();
      
      tempRecipes = tempRecipes.filter(recipe => {
        const recipeDate = new Date(recipe.createdAt || Date.now()); // Fallback if no date
        return recipeDate >= fromDate && recipeDate <= toDate;
      });
    }
    
    // Bước 3: Sắp xếp theo tiêu chí đã chọn
    if (filterSettings.activeSort === 'likes') {
      tempRecipes = [...tempRecipes].sort((a, b) => {
        const aLikes = a.likes?.length || 0;
        const bLikes = b.likes?.length || 0;
        return filterSettings.likesSort === 'ascending' ? aLikes - bLikes : bLikes - aLikes;
      });
    } else if (filterSettings.activeSort === 'views') {
      tempRecipes = [...tempRecipes].sort((a, b) => {
        const aViews = a.views || 0;
        const bViews = b.views || 0;
        return filterSettings.viewsSort === 'ascending' ? aViews - bViews : bViews - aViews;
      });
    }
    
    return tempRecipes;
  }, [recipes, searchQuery, filterSettings]);

  return (
    <div className="home-container">
      <div className="home-layout">
        {/* Main content - Recipe list */}
        <div className="main-content">
          {/* Đã bỏ thanh search ở đây */}
          
          <div className="recipes-grid">
            {isFetching ? (
              <div className="loading">Loading recipes...</div>
            ) : filteredAndSortedRecipes && filteredAndSortedRecipes.length > 0 ? (
              filteredAndSortedRecipes.map(recipe => (
                <div key={recipe._id} className="recipe-card">
                  <Link to={`/recipe/${recipe._id}`} className="recipe-link">
                    <div className="recipe-image">
                      <img src={recipe.imageUrl} alt={recipe.title} />
                      {/* Favorite button on recipe card */}
                      <button 
                        className={`favorite-btn-card ${recipe.isFavorited ? 'favorited' : ''}`}
                        onClick={(e) => handleToggleFavorite(e, recipe._id)}
                      >
                        {recipe.isFavorited ? '⭐' : '☆'}
                      </button>
                    </div>
                    <div className="recipe-info">
                      <h3 className="recipe-title">{recipe.title}</h3>
                      <p className="recipe-description">{recipe.description}</p>
                      <div className="recipe-tags">
                        {recipe.tags.map((tag, index) => (
                          <span key={index} className="tag">{tag}</span>
                        ))}
                      </div>
                      <div className="recipe-author">
                        <img
                          src={recipe.author.Ava || "/default-avatar.png"}
                          alt={recipe.author.username}
                          className="author-avatar"
                        />
                        <span className="author-name" style={{ marginLeft: 10 }}>{recipe.author.username}</span>
                      </div>
                      <div className="recipe-stats">
                        <span className="recipe-likes">
                          <i className="like-icon">❤️</i> {recipe.likes?.length || 0}
                        </span>
                        <span className="recipe-views">
                          <i className="view-icon">👁️</i> {recipe.views || 0}
                        </span>
                      </div>
                    </div>
                  </Link>
                </div>
              ))
            ) : (
              <div className="no-recipes">No recipes found.</div>
            )}
          </div>
        </div>

        {/* Sidebar - Filter and Sort */}
        <div className="sidebar">
          <FilterAndSort onFilterChange={handleFilterChange} />
        </div>
      </div>
    </div>
  );
}

export default Home;

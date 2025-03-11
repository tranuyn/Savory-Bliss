import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { fetchRecipes, toggleFavorite } from "../../redux/recipeSlice";
import FilterAndSort from "../../Component/FilterAndSort";
import "./Home.css";

function Home() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Lấy state từ Redux
  const { recipes, isFetching } = useSelector(state => state.recipes);
  const { user } = useSelector(state => state.auths);

  const [searchQuery, setSearchQuery] = useState("");

  // Fetch all recipes when component mounts
  useEffect(() => {
    dispatch(fetchRecipes());
  }, [dispatch]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleToggleFavorite = (e, recipeId) => {
    e.preventDefault(); // Ngăn chặn chuyển hướng khi click vào nút yêu thích
    e.stopPropagation(); // Ngăn chặn sự kiện lan tỏa lên các phần tử cha
    
    if (user) {
      dispatch(toggleFavorite(recipeId));
    } else {
      alert("Vui lòng đăng nhập để lưu công thức vào danh sách yêu thích");
    }
  };

  const filteredRecipes = recipes && recipes.filter(recipe =>
    recipe.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="home-container">
      <div className="home-layout">
        {/* Main content - Recipe list */}
        <div className="main-content">
          <div className="recipes-grid">
            {isFetching ? (
              <div className="loading">Loading recipes...</div>
            ) : filteredRecipes && filteredRecipes.length > 0 ? (
              filteredRecipes.map(recipe => (
                <div key={recipe._id} className="recipe-card">
                  <Link to={`/recipe/${recipe._id}`} className="recipe-link">
                    <div className="recipe-image">
                      <img src={recipe.imageUrl} alt={recipe.title} />
                      {/* Nút yêu thích trên thẻ recipe */}
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
                        <span className="recipe-favorites">
                          <i className="favorite-icon">⭐</i> {recipe.favoritesCount || 0}
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
          <FilterAndSort />
        </div>
      </div>
    </div>
  );
}

export default Home;

import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { fetchRecipes, toggleSaveRecipe } from "../../redux/recipeSlice";
import FilterAndSort from "../../Component/FilterAndSort";
import "./Home.css";

function Home() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Lấy state từ Redux
  const { user } = useSelector(state => state.auths);
  const { recipes, isFetching, savedRecipes } = useSelector(state => state.recipes);

  const [searchQuery, setSearchQuery] = useState("");

  // Fetch all recipes when component mounts
  useEffect(() => {
    dispatch(fetchRecipes());
  }, [dispatch]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSaveRecipe = async (e, recipeId) => {
    e.preventDefault(); // Prevent link navigation

    if (!user) {
      navigate('/login');
      return;
    }

    try {
      await dispatch(toggleSaveRecipe(recipeId)).unwrap();
    } catch (error) {
      console.error('Error saving recipe:', error);
      // You can add toast notification here
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
                          src={recipe.author.Ava}
                          alt={recipe.author.username}
                          className="author-avatar"
                        />
                        <span className="author-name" style={{ marginLeft: 10 }}>{recipe.author.username}</span>
                      </div>
                    </div>
                  </Link>
                  <div className="recipe-actions">
                    <button
                      className={`save-btn ${savedRecipes?.includes(recipe._id) ? 'saved' : ''}`}
                      onClick={(e) => handleSaveRecipe(e, recipe._id)}
                    >
                      <i className="save-icon">
                        {savedRecipes?.includes(recipe._id) ? '📑' : '🔖'}
                      </i>
                    </button>
                    <div className="stats">
                      <span className="likes"><i className="heart-icon">❤️</i> {recipe.likes}</span>
                      <span className="views"><i className="view-icon">👁️</i> {recipe.views}</span>
                    </div>
                  </div>
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
import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { fetchUserRecipes } from "../../redux/recipeSlice";
import "./Recipes.css";

function Recipes() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // Lấy state từ Redux
  const { recipes, isFetching } = useSelector(state => state.recipes);
  const { user } = useSelector(state => state.auths);
  
  const [searchQuery, setSearchQuery] = useState("");
  
  useEffect(() => {
    if (user && user.id) {
      dispatch(fetchUserRecipes(user.id));
    }
  }, [dispatch, user]);
  
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };
  
  const filteredRecipes = recipes && recipes.filter(recipe => 
    recipe.title.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const handleAddRecipe = () => {
    navigate('/add-recipe');
  };
  
  return (
    <div className="recipes-container">
      <div className="user-profile-section">
        <div className="profile-content">
          <div className="profile-avatar">
            <img src={user?.avatar || "/default-avatar.png"} alt="User avatar" />
          </div>
          <div className="profile-info">
            <h2 className="profile-name">{user?.name || "Anne the Hungry"}</h2>
            <p className="profile-title">{user?.title || "@hungry_panda"}</p>
            <p className="profile-description">{user?.description || "Day là profile.Day là profile.Day là profile.Day là profile.Day là profile.Day là profile.Day là profile."}</p>
            <a href={user?.website || "https://hungryanne.com"} className="profile-website" target="_blank" rel="noopener noreferrer">
              {user?.website || "hungryanne.com"}
            </a>
            <div className="profile-stats">
              <span className="stats-item">{user?.followers || 255} Followers</span>
              <span className="stats-item">{user?.following || 3000} Following</span>
              <span className="stats-item">{user?.likes || 1.5}k Likes</span>
            </div>
          </div>
          <button className="edit-profile-btn">
            <i className="edit-icon">✎</i>
          </button>
        </div>
      </div>
      
      <div className="recipes-actions">
        <button className="add-recipe-btn" onClick={handleAddRecipe}>
          <i className="add-icon">+</i> Add a recipe
        </button>
        <div className="search-box">
          <input
            type="text"
            placeholder="Find a recipe"
            value={searchQuery}
            onChange={handleSearchChange}
            className="search-input"
          />
          <button className="search-btn">
            <i className="search-icon">🔍</i>
          </button>
        </div>
      </div>
      
      <h2 className="recipes-title">Recipes</h2>
      
      <div className="recipes-grid">
        {isFetching ? (
          <div className="loading">Loading recipes...</div>
        ) : filteredRecipes && filteredRecipes.length > 0 ? (
          filteredRecipes.map(recipe => (
            <div key={recipe.id} className="recipe-card">
              <Link to={`/recipe/${recipe.id}`} className="recipe-link">
                <div className="recipe-image">
                  <img src={recipe.imageUrl} alt={recipe.title} />
                </div>
                <div className="recipe-info">
                  <h3 className="recipe-title">{recipe.title}</h3>
                  <p className="recipe-date">{recipe.createdAt}</p>
                  <p className="recipe-description">{recipe.description}</p>
                  <div className="recipe-author">
                    <span className="author-name">{recipe.author.username}</span>
                  </div>
                </div>
              </Link>
              <div className="recipe-actions">
                <button className="save-btn">
                  <i className="save-icon">🔖</i>
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
  );
}

export default Recipes;
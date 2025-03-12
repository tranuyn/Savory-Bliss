import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { fetchUserRecipes, deleteRecipe } from "../../redux/recipeSlice";
import "./Recipes.css";

function Recipes() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // Lấy state từ Redux
  const { recipes, isFetching, isDeleting } = useSelector(state => state.recipes);
  const { user } = useSelector(state => state.auths);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [showConfirmDelete, setShowConfirmDelete] = useState(null);
  
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
    navigate('/addrecipe');
  };

  const handleEditRecipe = (recipeId) => {
    navigate(`/editrecipe/${recipeId}`);
  };

  const handleDeleteConfirm = (recipeId) => {
    setShowConfirmDelete(recipeId);
  };

  const handleDeleteCancel = () => {
    setShowConfirmDelete(null);
  };

  const handleDeleteRecipe = (recipeId) => {
    dispatch(deleteRecipe(recipeId)).then(() => {
      setShowConfirmDelete(null);
    });
  };

  const handleAccountSettings = () => {
    navigate('/accountSetting');
  }
  
  return (
    <div className="recipes-container">
      <div className="user-profile-section">
        <div className="profile-content">
          <div className="profile-ava">
            <img src={user?.Ava || "/default-avatar.png"} alt="User avatar" />
          </div>
          <div className="profile-info">
            <h2 className="profile-name">{user?.name || "Anne the Hungry"}</h2>
            <p className="profile-title">{user?.email || "@hungry_panda"}</p>
            <p className="profile-description">{user?.bio || "Day là profile.Day là profile.Day là profile.Day là profile.Day là profile.Day là profile.Day là profile."}</p>
            <div className="profile-stats">
              <span className="stats-item">{user?.followers || 255} Recipes</span>
              <span className="stats-item">{user?.likes || 1.5}k Likes</span>
            </div>
          </div>
          <button className="edit-profile-btn" onClick={handleAccountSettings}>
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
            <div key={recipe.id || recipe._id} className="recipe-card">
              <Link to={`/recipe/${recipe._id}`} className="recipe-link">
                <div className="recipe-image">
                  <img src={recipe.imageUrl} alt={recipe.title} />
                </div>
                <div className="recipe-info">
                  <h3 className="recipe-title">{recipe.title}</h3>
                  <p className="recipe-date">{recipe.createdAt}</p>
                  <p className="recipe-description">{recipe.description}</p>
                  <div className="recipe-author">
                    <span className="author-name">{recipe.author?.username}</span>
                  </div>
                </div>
              </Link>
              <div className="recipe-actions">
                <div className="stats">
                  <span className="views"><i className="view-icon">👁️</i> {recipe.views || 0}</span>
                </div>
                <div className="recipe-management">
                  <button 
                    className="recipe-edit-btn" 
                    onClick={() => handleEditRecipe(recipe._id)}
                    title="Edit recipe"
                  >
                    <i className="edit-icon">✎</i>
                  </button>
                  <button 
                    className="recipe-delete-btn" 
                    onClick={() => handleDeleteConfirm(recipe._id)}
                    title="Delete recipe"
                  >
                    <i className="delete-icon">🗑️</i>
                  </button>
                </div>
              </div>
              
              {showConfirmDelete === recipe._id && (
                <div className="delete-confirm-overlay">
                  <div className="delete-confirm-dialog">
                    <h3>Delete Recipe</h3>
                    <p>Are you sure you want to delete "{recipe.title}"?</p>
                    <p className="delete-warning">This action cannot be undone.</p>
                    <div className="delete-confirm-actions">
                      <button 
                        className="delete-cancel-btn" 
                        onClick={handleDeleteCancel}
                        disabled={isDeleting}
                      >
                        Cancel
                      </button>
                      <button 
                        className="delete-confirm-btn" 
                        onClick={() => handleDeleteRecipe(recipe._id)}
                        disabled={isDeleting}
                      >
                        {isDeleting ? 'Deleting...' : 'Delete'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
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

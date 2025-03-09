import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { fetchRecipes } from "../../redux/recipeSlice";
import FilterAndSort from "../../Component/FilterAndSort";
import "./Home.css";

function Home() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // Lấy state từ Redux
  const { recipes, isFetching } = useSelector(state => state.recipes);
  
  const [searchQuery, setSearchQuery] = useState("");
  
  // Fetch all recipes when component mounts
  useEffect(() => {
    dispatch(fetchRecipes());
  }, [dispatch]);
  
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
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
                        <span className="author-name">{recipe.author.username}</span>
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
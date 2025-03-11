import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { fetchSavedRecipesDetails } from "../../redux/recipeSlice";
import FilterAndSort from "../../Component/FilterAndSort";
import "./Saved.css";

function SavedRecipes() {
    const dispatch = useDispatch();
    const { savedRecipesDetails = [], isFetching, error } = useSelector(state => state.recipes);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        dispatch(fetchSavedRecipesDetails());
    }, [dispatch]);

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    // Make sure savedRecipesDetails is an array before filtering
    const filteredRecipes = Array.isArray(savedRecipesDetails) 
        ? savedRecipesDetails.filter(recipe =>
            recipe?.title?.toLowerCase().includes(searchQuery.toLowerCase())
          )
        : [];

    console.log('Saved Recipes:', savedRecipesDetails); // For debugging

    return (
        <div className="home-container">
            <div className="home-layout">
                {/* Main content - Recipe list */}
                <div className="main-content">
                    {/* Search bar */}
                    <div className="main-header">
                        <h2 className="page-title">Saved Recipes</h2>
                        <div className="search-bar1">
                            <input
                                type="text"
                                placeholder="Search in your saved recipes"
                                value={searchQuery}
                                onChange={handleSearchChange}
                                className="search-input"
                            />
                        </div>
                    </div>

                    <div className="recipes-grid">
                        {isFetching ? (
                            <div className="loading">Loading recipes...</div>
                        ) : error ? (
                            <div className="error">Failed to load recipes: {error}</div>
                        ) : filteredRecipes.length > 0 ? (
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
                                                    src={recipe.author?.Ava || "/default-avatar.png"}
                                                    alt={recipe.author?.username || "Unknown"}
                                                    className="author-avatar"
                                                />
                                                <span className="author-name">{recipe.author?.username || "Unknown"}</span>
                                            </div>
                                        </div>
                                    </Link>
                                </div>
                            ))
                        ) : (
                            <div className="no-recipes">No saved recipes found.</div>
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

export default SavedRecipes;
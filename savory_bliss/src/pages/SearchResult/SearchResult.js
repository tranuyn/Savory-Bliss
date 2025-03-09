import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useSearchParams } from "react-router-dom";
import { searchRecipes } from "../../redux/recipeSlice";
import FilterAndSort from "../../Component/FilterAndSort";
import "./SearchResult.css";

function SearchResult() {
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  
  // Get search query from URL
  const query = searchParams.get('query');

  // Get state from Redux
  const { recipes, isFetching, error } = useSelector(state => state.recipes);

  // Fetch recipes when search query changes
  useEffect(() => {
    if (query) {
      dispatch(searchRecipes({ 
        searchQuery: query,
        tags: [],
        page: 1, 
        limit: 10 
      }));
    }
  }, [dispatch, query]);

  return (
    <div className="home-container">
      <div className="home-layout">
        <div className="main-content">
          <div className="main-header">
            <h2 className="page-title">
              Search Results {query ? `for "${query}"` : ''}
            </h2>
          </div>

          <div className="recipes-grid">
            {isFetching ? (
              <div className="loading">Loading recipes...</div>
            ) : recipes && recipes.length > 0 ? (
              recipes.map(recipe => (
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
                        <span className="author-name" style={{marginLeft: 10}}>{recipe.author.username}</span>
                      </div>
                    </div>
                  </Link>
                </div>
              ))
            ) : (
              <div className="no-recipes">
                {query ? `No recipes found for "${query}"` : 'No recipes found'}
              </div>
            )}
          </div>
        </div>

        <div className="sidebar">
          <FilterAndSort />
        </div>
      </div>
    </div>
  );
}

export default SearchResult;
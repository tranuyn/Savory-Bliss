import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useSearchParams } from "react-router-dom";
import { searchRecipes } from "../../redux/recipeSlice";
import "./SearchResult.css";

function SearchResult() {
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const { recipes, isLoading, error, pagination } = useSelector((state) => state.recipes);

  const handlePageChange = async (page) => {
    const currentQuery = searchParams.get('query') || '';
    const currentTags = searchParams.get('tags') || '';
    
    try {
      await dispatch(searchRecipes({
        searchQuery: currentQuery,
        tags: currentTags ? currentTags.split(',') : [],
        page: page,
        limit: 10
      })).unwrap();
    } catch (error) {
      console.error('Failed to fetch page:', error);
    }
  };

  return (
    <div className="search-results-container">
      <h2>Kết quả tìm kiếm ({pagination.total} công thức)</h2>

      <div className="recipe-list">
        {recipes.map((recipe) => (
          <Link to={`/recipe/${recipe._id}`} key={recipe._id} className="recipe-item">
            <span className="recipe-title">{recipe.title}</span>
          </Link>
        ))}
      </div>
      
      {/* <div className="recipe-grid">
        {recipes.map((recipe) => (
          <Link to={`/recipe/${recipe._id}`} key={recipe._id} className="recipe-card">
            <div className="recipe-image">
              <img src={recipe.imageUrl} alt={recipe.title} />
            </div>
            <div className="recipe-info">
              <h3>{recipe.title}</h3>
              <p className="recipe-description">{recipe.description}</p>
              <div className="recipe-tags">
                {recipe.tags.map((tag, index) => (
                  <span key={index} className="tag">
                    {tag}
                  </span>
                ))}
              </div>
              <div className="recipe-author">
                <img src={recipe.author.Ava} alt={recipe.author.name} className="author-avatar" />
                <span>{recipe.author.name}</span>
              </div>
            </div>
          </Link>
        ))}
      </div> */}

      {pagination.pages > 1 && (
        <div className="pagination">
          {Array.from({ length: pagination.pages }, (_, i) => (
            <button
              key={i + 1}
              className={`page-button ${pagination.page === i + 1 ? 'active' : ''}`}
              onClick={() => handlePageChange(i + 1)}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default SearchResult;
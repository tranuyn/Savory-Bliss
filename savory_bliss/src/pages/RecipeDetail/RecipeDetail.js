import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchRecipeById } from "../../redux/recipeSlice";
import "./RecipeDetail.css";

function RecipeDetail() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { currentRecipe, isFetching, relatedRecipes } = useSelector(state => state.recipes);
  const [activeTab, setActiveTab] = useState("ingredients");

  useEffect(() => {
    if (id) {
      dispatch(fetchRecipeById(id));
    }
  }, [dispatch, id]);

  if (isFetching) {
    return <div className="loading">Loading recipe...</div>;
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
          <div className="sidebar-title">Ingredients (sticky)</div>
          <div className="ingredients-list">
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
              <button className="like-btn">❤️</button>
              <span>{currentRecipe.likes || 0}</span>
            </div>
            <div className="recipe-views">
              <i className="view-icon">👁️</i>
              <span>{currentRecipe.views || 0}</span>
            </div>
          </div>

          <div className="recipe-comments">
            <h3 className="comments-title">Comments (456)</h3>
            
            {/* Comment input area */}
            <div className="comment-input-area">
              <div className="comment-avatar">
                <img src="/default-avatar.png" alt="User avatar" />
              </div>
              <input 
                type="text" 
                className="comment-input" 
                placeholder="Give this recipe a comment..." 
              />
            </div>
            
            {/* Comment items */}
            <div className="comment-item">
              <div className="comment-avatar">
                <img src="/default-avatar.png" alt="User avatar" />
              </div>
              <div className="comment-content">
                <div className="comment-header">
                  <span className="comment-author">Account_name</span>
                  <span className="comment-date">11/12/2024 11:00PM</span>
                </div>
                <p className="comment-text">Bình luận nè Bình luận nè Bình luận nề Bình luận nè Bình luận nè Bình luận nẻ Bình luận nè Bình luận ne Bình luận ne Bình luận nè Bình luận ne Bình luận ne Bình luận ne Bình luận ne</p>
              </div>
            </div>
            
            <div className="comment-item">
              <div className="comment-avatar">
                <img src="/default-avatar.png" alt="User avatar" />
              </div>
              <div className="comment-content">
                <div className="comment-header">
                  <span className="comment-author">Account_name</span>
                  <span className="comment-date">11/12/2024 11:00PM</span>
                </div>
                <p className="comment-text">Bình luận nề Bình luận nè Bình luận nề Bình luận nè Bình luận nè Bình luận nề Bình luận nè Bình luận nè Bình luận nè Bình luận nè Bình luận nè Bình luận nè Bình luận nề Bình luận nè</p>
              </div>
            </div>
            
            <div className="comment-item">
              <div className="comment-avatar">
                <img src="/default-avatar.png" alt="User avatar" />
              </div>
              <div className="comment-content">
                <div className="comment-header">
                  <span className="comment-author">Account_name</span>
                  <span className="comment-date">11/12/2024 11:00PM</span>
                </div>
                <p className="comment-text">Bình luận nè Bình luận nè Bình luận nè Bình luận nề Bình luận nè Bình luận nè Bình luận nè Bình luận nè Bình luận nề Bình luận ne Bình luận nề Bình luận ne Bình luận nề Bình luận nè</p>
              </div>
            </div>
            
            <button className="more-comments-btn">More comments...</button>
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
                        <i className="like-icon">❤️</i> {recipe.likes || 0}
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

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { fetchFavoriteRecipes, toggleFavorite } from "../../redux/recipeSlice";
import FilterAndSort from "../../Component/FilterAndSort";
import "./Saved.css";

function SavedRecipes() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { favoriteRecipes = [], isFetching, error } = useSelector(state => state.recipes);
    const { user } = useSelector(state => state.auths);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterSettings, setFilterSettings] = useState({
        dateFilter: { from: '', to: '' },
        likesSort: 'descending',
        viewsSort: 'descending',
        activeSort: 'likes'
    });

    useEffect(() => {
        // Kiểm tra nếu đã đăng nhập mới fetch danh sách yêu thích
        if (user) {
            dispatch(fetchFavoriteRecipes());
        } else {
            // Nếu chưa đăng nhập, chuyển hướng đến trang đăng nhập
            navigate('/login', { state: { from: '/saved' } });
        }
    }, [dispatch, user, navigate]);

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    const handleRemoveFavorite = (e, recipeId) => {
        e.preventDefault();
        e.stopPropagation();
        if (user) {
            dispatch(toggleFavorite(recipeId));
        } else {
            alert("Vui lòng đăng nhập để thực hiện thao tác này");
        }
        window.location.reload();
    };

    // Sử dụng useCallback để tránh tạo lại hàm mỗi khi component re-render
    const handleFilterChange = useCallback((newFilterSettings) => {
        setFilterSettings(newFilterSettings);
    }, []);

    // Sử dụng useMemo để tối ưu hóa việc lọc và sắp xếp
    const filteredAndSortedRecipes = useMemo(() => {
        if (!Array.isArray(favoriteRecipes)) return [];
        
        // Bước 1: Lọc theo từ khóa tìm kiếm
        let tempRecipes = favoriteRecipes.filter(recipe =>
            recipe?.title?.toLowerCase().includes(searchQuery.toLowerCase())
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
    }, [favoriteRecipes, searchQuery, filterSettings]);

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
                        ) : filteredAndSortedRecipes.length > 0 ? (
                            filteredAndSortedRecipes.map(recipe => (
                                <div key={recipe._id} className="recipe-card">
                                    <Link to={`/recipe/${recipe._id}`} className="recipe-link">
                                        <div className="recipe-image">
                                            <img src={recipe.imageUrl} alt={recipe.title} />
                                            {/* Nút xóa khỏi danh sách yêu thích */}
                                            <button 
                                                className="remove-favorite-btn"
                                                onClick={(e) => handleRemoveFavorite(e, recipe._id)}
                                            >
                                                ✖
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
                                                    src={recipe.author?.Ava || "/default-avatar.png"}
                                                    alt={recipe.author?.username || "Unknown"}
                                                    className="author-avatar"
                                                />
                                                <span className="author-name">{recipe.author?.username || "Unknown"}</span>
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
                            <div className="no-recipes">No saved recipes found.</div>
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

export default SavedRecipes;

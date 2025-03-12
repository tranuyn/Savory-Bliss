import React, { useState, useEffect, useCallback } from 'react';
import './FilterAndSort.css';

const FilterAndSort = ({ onFilterChange }) => {
  const [dateFilter, setDateFilter] = useState({ from: '', to: '' });
  const [likesSort, setLikesSort] = useState('descending');
  const [viewsSort, setViewsSort] = useState('descending');
  const [activeSort, setActiveSort] = useState('likes'); // Track which sort is active
  
  // Sử dụng useCallback để tránh tạo lại hàm mỗi khi component re-render
  const notifyFilterChange = useCallback(() => {
    if (onFilterChange) {
      onFilterChange({
        dateFilter,
        likesSort,
        viewsSort,
        activeSort
      });
    }
  }, [dateFilter, likesSort, viewsSort, activeSort, onFilterChange]);
  
  // Sử dụng useEffect với debounce để tránh gọi callback quá nhiều lần
  useEffect(() => {
    const timeoutId = setTimeout(notifyFilterChange, 300);
    return () => clearTimeout(timeoutId);
  }, [notifyFilterChange]);
  
  // Event handler functions
  const handleFromDateChange = (e) => {
    setDateFilter({ ...dateFilter, from: e.target.value });
  };
  
  const handleToDateChange = (e) => {
    setDateFilter({ ...dateFilter, to: e.target.value });
  };
  
  const handleLikesSortChange = (e) => {
    setLikesSort(e.target.value);
    setActiveSort('likes'); // Set likes as the active sort
  };
  
  const handleViewsSortChange = (e) => {
    setViewsSort(e.target.value);
    setActiveSort('views'); // Set views as the active sort
  };
  
  return (
    <div className="filter-sort-container">
      <h2 className="filter-sort-title">Sort & Filter</h2>
      
      {/* Date Filter Section */}
      <div className="filter-section">
        <h3 className="filter-section-title">By published date</h3>
        
        <div className="date-input-group">
          <label className="date-label">From:</label>
          <input 
            type="text" 
            placeholder="dd/mm/yyyy"
            className="date-input"
            value={dateFilter.from}
            onChange={handleFromDateChange}
            onFocus={(e) => e.target.type = "date"}
            onBlur={(e) => {
              if (!e.target.value) e.target.type = "text";
            }}
          />
        </div>
        
        <div className="date-input-group">
          <label className="date-label">To:</label>
          <input 
            type="text"
            placeholder="dd/mm/yyyy"
            className="date-input"
            value={dateFilter.to}
            onChange={handleToDateChange}
            onFocus={(e) => e.target.type = "date"}
            onBlur={(e) => {
              if (!e.target.value) e.target.type = "text";
            }}
          />
        </div>
      </div>
      
      {/* Likes Sort Section */}
      <div className="sort-section">
        <h3 className={`filter-section-title ${activeSort === 'likes' ? 'active-sort' : ''}`}>By likes</h3>
        <div className="select-container">
          <select 
            className="sort-select"
            onChange={handleLikesSortChange}
            value={likesSort}
          >
            <option value="descending">Descending</option>
            <option value="ascending">Ascending</option>
          </select>
        </div>
      </div>
      
      {/* Views Sort Section */}
      <div className="sort-section">
        <h3 className={`filter-section-title ${activeSort === 'views' ? 'active-sort' : ''}`}>By views</h3>
        <div className="select-container">
          <select 
            className="sort-select"
            onChange={handleViewsSortChange}
            value={viewsSort}
          >
            <option value="descending">Descending</option>
            <option value="ascending">Ascending</option>
          </select>
        </div>
      </div>
    </div>
  );
};

// Sử dụng React.memo để tránh re-render không cần thiết
export default React.memo(FilterAndSort);

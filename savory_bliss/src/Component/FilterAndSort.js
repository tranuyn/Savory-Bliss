import React, { useState } from 'react';
import './FilterAndSort.css';

const FilterAndSort = () => {
  const [dateFilter, setDateFilter] = useState({ from: '', to: '' });
  const [likesSort, setLikesSort] = useState('descending');
  const [commentsSort, setCommentsSort] = useState('descending');
  
  // Handlers for changes
  const handleFromDateChange = (e) => {
    setDateFilter({ ...dateFilter, from: e.target.value });
  };
  
  const handleToDateChange = (e) => {
    setDateFilter({ ...dateFilter, to: e.target.value });
  };
  
  const handleLikesSortChange = (e) => {
    setLikesSort(e.target.value);
  };
  
  const handleCommentsSortChange = (e) => {
    setCommentsSort(e.target.value);
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
        <h3 className="filter-section-title">By likes</h3>
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
      
      {/* Comments Sort Section */}
      <div className="sort-section">
        <h3 className="filter-section-title">By comments</h3>
        <div className="select-container">
          <select 
            className="sort-select"
            onChange={handleCommentsSortChange}
            value={commentsSort}
          >
            <option value="descending">Descending</option>
            <option value="ascending">Ascending</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default FilterAndSort;
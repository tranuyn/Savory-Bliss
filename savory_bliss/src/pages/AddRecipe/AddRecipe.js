import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { addRecipe, resetRecipeState } from "../../redux/recipeSlice";
import "./AddRecipe.css";

function AddRecipe() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // Lấy state từ Redux
  const { isFetching, error, success } = useSelector(state => state.recipes);
  const { token, user } = useSelector(state => state.auths);
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [sections, setSections] = useState([
    { title: "", content: "", id: "section-1", image: null, imagePreview: null },
    { title: "", content: "", id: "section-2", image: null, imagePreview: null }
  ]);
  const [draggedSectionId, setDraggedSectionId] = useState(null);
  
  // Reset state khi unmount
  useEffect(() => {
    return () => {
      dispatch(resetRecipeState());
    };
  }, [dispatch]);
  
  // Chuyển hướng khi thêm công thức thành công
  useEffect(() => {
    if (success) {
      navigate('/');
    }
  }, [success, navigate]);
  
  // Đã loại bỏ đoạn kiểm tra token ở đây vì đã được xử lý bởi ProtectedRoute
  
  // Các hàm xử lý không thay đổi
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleSectionImageChange = (e, index) => {
    const file = e.target.files[0];
    if (file) {
      const updatedSections = [...sections];
      updatedSections[index].image = file;
      
      const reader = new FileReader();
      reader.onloadend = () => {
        updatedSections[index].imagePreview = reader.result;
        setSections(updatedSections);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const removeSectionImage = (index) => {
    const updatedSections = [...sections];
    updatedSections[index].image = null;
    updatedSections[index].imagePreview = null;
    setSections(updatedSections);
  };

  const addSection = () => {
    const newId = `section-${Date.now()}`;
    setSections([...sections, { 
      title: "", 
      content: "", 
      id: newId, 
      image: null, 
      imagePreview: null 
    }]);
  };

  const updateSectionTitle = (index, value) => {
    const updatedSections = [...sections];
    updatedSections[index].title = value;
    setSections(updatedSections);
  };

  const updateSectionContent = (index, value) => {
    const updatedSections = [...sections];
    updatedSections[index].content = value;
    setSections(updatedSections);
  };

  const removeSection = (index) => {
    const updatedSections = sections.filter((_, i) => i !== index);
    setSections(updatedSections);
  };

  const handleDragStart = (e, sectionId) => {
    setDraggedSectionId(sectionId);
    e.dataTransfer.effectAllowed = "move";
    // Để tránh hiển thị hình ảnh kéo mặc định
    const dragImage = new Image();
    dragImage.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
    e.dataTransfer.setDragImage(dragImage, 0, 0);
  };
  
  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };
  
  const handleDrop = (e, targetIndex) => {
    e.preventDefault();
    
    const sourceIndex = sections.findIndex(section => section.id === draggedSectionId);
    if (sourceIndex === targetIndex) return;
    
    const updatedSections = [...sections];
    const [movedSection] = updatedSections.splice(sourceIndex, 1);
    updatedSections.splice(targetIndex, 0, movedSection);
    
    setSections(updatedSections);
    setDraggedSectionId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Không cần kiểm tra token ở đây nữa vì đã được xử lý bởi ProtectedRoute
    
    const recipeData = {
      title,
      description,
      tags,
      ingredients,
      image,
      sections: sections.map(section => ({
        id: section.id,
        title: section.title,
        content: section.content,
        image: section.image
      }))
    };
    
    dispatch(addRecipe(recipeData));
  };

  return (
    <div className="add-recipe-container">
      {/* Hiển thị thông báo lỗi nếu có */}
      {error && <div className="error-message">{error}</div>}
      
      <form className="recipe-form" onSubmit={handleSubmit}>
        <div className="image-upload-section">
          {imagePreview ? (
            <div className="image-preview" style={{ backgroundImage: `url(${imagePreview})` }}>
              <button 
                type="button" 
                className="upload-icon-btn"
                onClick={() => document.getElementById('image-upload').click()}
              >
                ⬆️
              </button>
            </div>
          ) : (
            <div className="image-upload-placeholder" onClick={() => document.getElementById('image-upload').click()}>
              <div className="upload-icon">⬆️</div>
            </div>
          )}
          <input
            id="image-upload"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden-input"
          />
        </div>

        <div className="form-section">
          <div className="title-group">
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Add title..."
              className="title-input"
              required
            />
            <span className="required-mark">*</span>
          </div>

          <input
            id="description"
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Short description..."
            className="description-input"
          />

          <input
            id="tags"
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="Tags..."
            className="tags-input"
          />

          <div className="ingredients-section">
            <label className="section-label">Ingredients</label>
            <textarea
              id="ingredients"
              value={ingredients}
              onChange={(e) => setIngredients(e.target.value)}
              placeholder="Add ingredients..."
              className="ingredients-input"
              required
            />
          </div>

          <div className="recipe-section-container">
            <label className="section-label">Recipe</label>
            
            {sections.map((section, index) => (
              <div 
                key={section.id} 
                className={`recipe-section ${draggedSectionId === section.id ? 'dragging' : ''}`}
                draggable
                onDragStart={(e) => handleDragStart(e, section.id)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDrop={(e) => handleDrop(e, index)}
              >
                <div className="section-header">
                  <span className="drag-handle">≡</span>
                  <input
                    type="text"
                    value={section.title}
                    onChange={(e) => updateSectionTitle(index, e.target.value)}
                    placeholder="Add section title..."
                    className="section-title-input"
                  />
                  <button 
                    type="button"
                    onClick={() => removeSection(index)}
                    className="delete-section-btn"
                  >
                    🗑️
                  </button>
                </div>
                
                <textarea
                  value={section.content}
                  onChange={(e) => updateSectionContent(index, e.target.value)}
                  placeholder="Add text..."
                  className="section-content-input"
                />
                
                <div className="section-image-container">
                  {section.imagePreview ? (
                    <div className="section-image-preview">
                      <img src={section.imagePreview} alt="Section" className="section-image" />
                      <div className="section-image-actions">
                        <button 
                          type="button" 
                          className="section-image-change"
                          onClick={() => document.getElementById(`section-image-${index}`).click()}
                        >
                          Change
                        </button>
                        <button 
                          type="button" 
                          className="section-image-remove"
                          onClick={() => removeSectionImage(index)}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button 
                      type="button"
                      className="section-image-upload"
                      onClick={() => document.getElementById(`section-image-${index}`).click()}
                    >
                      Add image
                    </button>
                  )}
                  <input
                    id={`section-image-${index}`}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleSectionImageChange(e, index)}
                    className="hidden-input"
                  />
                </div>
              </div>
            ))}
            
            <button 
              type="button"
              onClick={addSection}
              className="add-section-btn"
            >
              Add section...
            </button>
          </div>

          <div className="action-buttons">
            <button type="button" className="delete-btn" onClick={() => navigate('/')}>Cancel</button>
            <button 
              type="submit" 
              className="publish-btn" 
              disabled={isFetching}
            >
              {isFetching ? 'Publishing...' : 'Publish'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default AddRecipe;

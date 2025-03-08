import React, { useState } from 'react';
import './AccountSetting.css';
import { useSelector, useDispatch } from "react-redux";
import { updateProfile } from "../../redux/authSlice";

const ProfileForm = () => {

  const { user } = useSelector((state) => state.auths);
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    username: user?.username || '',
    biography: user?.bio || '',
    website: '',
    email: user?.email || ''
  });

  // Avatar section
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(user?.Ava || null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(file);
        setPreviewUrl(reader.result); 
      };
      reader.readAsDataURL(file);
    }
  };

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage({ type: '', text: '' });

    try {
      const profileData = {
        username: formData.username,
        name: formData.name,
        bio: formData.biography,
        Ava: selectedImage ? previewUrl : user?.Ava
      };

      const resultAction = await dispatch(
        updateProfile({
          userId: user.id,
          profileData: profileData
        })
      ).unwrap();

      setMessage({
        type: 'success',
        text: 'Cập nhật thông tin thành công!'
      });

    } catch (error) {
      setMessage({
        type: 'error',
        text: error.message || 'Không thể cập nhật thông tin. Vui lòng thử lại!'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="profile-form">
      {/* Thêm thông báo alert */}
      {message.text && (
        <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-danger'}`}>
          {message.text}
        </div>
      )}

      <div className="form-section">
        <h2 className="section-title">Informations</h2>
        <div className="section-content">
          <div className="avatar-section">
            <div className="avatar-container">
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Profile"
                  className="profile-avatar"
                />
              ) : (
                <div className="avatar-placeholder">
                  <span>No Avatar</span>
                </div>
              )}
              <label htmlFor="avatar-upload" className="upload-icon">
                <input
                  type="file"
                  id="avatar-upload"
                  accept="image/*"
                  onChange={handleImageChange}
                  style={{ display: 'none' }}
                />
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" width="24px" height="24px">
                  <path d="M0 0h24v24H0z" fill="none" />
                  <path d="M9 16h6v-6h4l-7-7-7 7h4zm-4 2h14v2H5z" />
                </svg>
              </label>
            </div>
          </div>
          <div className="form-fields">
            <div className="form-group">
              <label htmlFor="name">Name<span className="required">*</span></label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="username">Username<span className="required">*</span></label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="biography">Biography<span className="required">*</span></label>
              <textarea
                id="biography"
                name="biography"
                value={formData.biography}
                onChange={handleChange}
                required
              />
            </div>

            {/* insert website field if needed */}
            {/* <div className="form-group">
                  <label htmlFor="website">Website</label>
                  <input
                    type="text"
                    id="website"
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                  />
                </div> */}
          </div>
        </div>
      </div>


      <div className="form-section">
        <h2 className="section-title">Account & Security</h2>
        <div className="security-fields">
          <div className="form-group email-group">
            <label htmlFor="email">Email</label>
            <div className="email-container">
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                disabled
              />
              <button type="button" className="change-button change-email">Change email</button>
            </div>
          </div>
          <div className="form-group password-group">
            <label htmlFor="password">Password</label>
            <button type="button" className="change-button">Change password</button>
          </div>
        </div>
      </div>

      <div className="form-actions">
        <button
          type="button"
          className="cancel-button"
          onClick={() => window.history.back()}>
          Cancel
        </button>
        <button
          type="submit"
          className="save-button"
          disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Save'}
        </button>
      </div>
    </form>
  );
};

export default ProfileForm;
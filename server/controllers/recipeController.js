const Recipe = require('../models/Recipe');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

// Cấu hình multer để lưu file tạm thời vào bộ nhớ
const storage = multer.memoryStorage();

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Giới hạn 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Chỉ cho phép các file hình ảnh!'), false);
    }
  }
});

// Hàm xử lý upload nhiều hình ảnh
const uploadImages = upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'sectionImages', maxCount: 10 }
]);

// Hàm chuyển đổi ảnh sang Base64
function convertImageToBase64(buffer, mimetype) {
  return `data:${mimetype};base64,${buffer.toString('base64')}`;
}

exports.addRecipe = async (req, res) => {
  try {
    uploadImages(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ success: false, message: err.message });
      }

      const { title, description, tags, ingredients, sections } = req.body;

      // Parse data từ form
      const parsedIngredients = ingredients ? ingredients.split('\n').filter(item => item.trim() !== '') : [];
      const parsedTags = tags ? tags.split(',').map(tag => tag.trim()) : [];
      
      let parsedSections = [];
      if (sections) {
        try {
          parsedSections = JSON.parse(sections);
        } catch (error) {
          return res.status(400).json({ success: false, message: 'Invalid sections format' });
        }
      }

      // Xử lý hình ảnh chính
      let mainImageBase64 = null;
      if (req.files && req.files.image && req.files.image[0]) {
        const mainImage = req.files.image[0];
        mainImageBase64 = convertImageToBase64(mainImage.buffer, mainImage.mimetype);
      }

      // Xử lý hình ảnh cho các sections
      if (req.files && req.files.sectionImages) {
        const sectionImages = req.files.sectionImages;
        
        // Gán Base64 cho từng section dựa trên tên file
        for (let i = 0; i < parsedSections.length; i++) {
          const section = parsedSections[i];
          // Tìm hình ảnh cho section dựa trên originalname hoặc fieldname
          const sectionImage = sectionImages.find(img => 
            img.originalname.includes(section.id) || 
            img.fieldname.includes(section.id)
          );
          
          if (sectionImage) {
            section.imageUrl = convertImageToBase64(sectionImage.buffer, sectionImage.mimetype);
          }
        }
      }

      // Tạo recipe mới
      const newRecipe = new Recipe({
        title,
        description,
        tags: parsedTags,
        ingredients: parsedIngredients,
        imageUrl: mainImageBase64,
        sections: parsedSections.map(section => ({
          title: section.title,
          content: section.content,
          imageUrl: section.imageUrl
        })),
        author: req.user._id // Lấy từ middleware xác thực
      });

      await newRecipe.save();
      
      res.status(201).json({
        success: true,
        data: newRecipe
      });
    });
  } catch (error) {
    console.error('Error adding recipe:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

exports.getAllRecipes = async (req, res) => {
  try {
    const recipes = await Recipe.find()
      .sort({ createdAt: -1 })
      .populate('author', 'username');
    
    res.status(200).json({
      success: true,
      count: recipes.length,
      data: recipes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

exports.getRecipeById = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id)
      .populate('author', 'username');
    
    if (!recipe) {
      return res.status(404).json({
        success: false,
        message: 'Recipe not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: recipe
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

exports.updateRecipe = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    
    if (!recipe) {
      return res.status(404).json({
        success: false,
        message: 'Recipe not found'
      });
    }
    
    // Kiểm tra quyền sở hữu
    if (recipe.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this recipe'
      });
    }
    
    // Logic xử lý tương tự addRecipe nhưng cập nhật thay vì tạo mới
    uploadImages(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ success: false, message: err.message });
      }
      
      const { title, description, tags, ingredients, sections } = req.body;

      // Update với dữ liệu mới
      recipe.title = title || recipe.title;
      recipe.description = description || recipe.description;
      
      if (tags) {
        recipe.tags = tags.split(',').map(tag => tag.trim());
      }
      
      if (ingredients) {
        recipe.ingredients = ingredients.split('\n').filter(item => item.trim() !== '');
      }
      
      if (req.files && req.files.image && req.files.image[0]) {
        const mainImage = req.files.image[0];
        recipe.imageUrl = convertImageToBase64(mainImage.buffer, mainImage.mimetype);
      }
      
      if (sections) {
        try {
          const parsedSections = JSON.parse(sections);
          
          // Xử lý hình ảnh cho các sections
          if (req.files && req.files.sectionImages) {
            const sectionImages = req.files.sectionImages;
            
            for (let i = 0; i < parsedSections.length; i++) {
              const section = parsedSections[i];
              const sectionImage = sectionImages.find(img => 
                img.originalname.includes(section.id) || 
                img.fieldname.includes(section.id)
              );
              
              if (sectionImage) {
                section.imageUrl = convertImageToBase64(sectionImage.buffer, sectionImage.mimetype);
              }
            }
          }
          
          recipe.sections = parsedSections.map(section => ({
            title: section.title,
            content: section.content,
            imageUrl: section.imageUrl || section.imageUrl
          }));
        } catch (error) {
          return res.status(400).json({ success: false, message: 'Invalid sections format' });
        }
      }
      
      recipe.updatedAt = Date.now();
      
      await recipe.save();
      
      res.status(200).json({
        success: true,
        data: recipe
      });
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

exports.deleteRecipe = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    
    if (!recipe) {
      return res.status(404).json({
        success: false,
        message: 'Recipe not found'
      });
    }
    
    // Kiểm tra quyền sở hữu
    if (recipe.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this recipe'
      });
    }
    
    // Sử dụng deleteOne thay vì remove
    await Recipe.deleteOne({ _id: req.params.id });
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Các API khác có thể thêm vào đây

exports.getRecipesByUser = async (req, res) => {
  try {
    const userId = req.params.userId;
    
    const recipes = await Recipe.find({ author: userId })
      .sort({ createdAt: -1 })
      .populate('author', 'username');
    
    res.status(200).json({
      success: true,
      count: recipes.length,
      data: recipes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

exports.searchRecipes = async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }
    
    // Tìm kiếm theo title, description hoặc tags
    const recipes = await Recipe.find({
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { tags: { $in: [new RegExp(query, 'i')] } }
      ]
    })
      .sort({ createdAt: -1 })
      .populate('author', 'username');
    
    res.status(200).json({
      success: true,
      count: recipes.length,
      data: recipes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

exports.getRecipesByTag = async (req, res) => {
  try {
    const { tag } = req.params;
    
    const recipes = await Recipe.find({ tags: { $in: [new RegExp(tag, 'i')] } })
      .sort({ createdAt: -1 })
      .populate('author', 'username');
    
    res.status(200).json({
      success: true,
      count: recipes.length,
      data: recipes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

exports.toggleFavoriteRecipe = async (req, res) => {
  try {
    const recipeId = req.params.id;
    const userId = req.user._id;
    
    const recipe = await Recipe.findById(recipeId);
    
    if (!recipe) {
      return res.status(404).json({
        success: false,
        message: 'Recipe not found'
      });
    }
    
    // Kiểm tra xem người dùng đã thích công thức này chưa
    const isFavorited = recipe.favorites && recipe.favorites.includes(userId);
    
    if (isFavorited) {
      // Nếu đã thích, bỏ thích
      recipe.favorites = recipe.favorites.filter(
        favUserId => favUserId.toString() !== userId.toString()
      );
    } else {
      // Nếu chưa thích, thêm vào danh sách thích
      if (!recipe.favorites) {
        recipe.favorites = [];
      }
      recipe.favorites.push(userId);
    }
    
    await recipe.save();
    
    res.status(200).json({
      success: true,
      isFavorited: !isFavorited,
      favoritesCount: recipe.favorites.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

exports.getFavoriteRecipes = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const recipes = await Recipe.find({ favorites: userId })
      .sort({ createdAt: -1 })
      .populate('author', 'username');
    
    res.status(200).json({
      success: true,
      count: recipes.length,
      data: recipes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};
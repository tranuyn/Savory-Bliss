const Recipe = require('../models/Recipe');
const Comment = require('../models/Comment');
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
      .populate('author', 'username name Ava');

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
    const recipeId = req.params.id;
    
    // Tăng view count
    await Recipe.findByIdAndUpdate(recipeId, { $inc: { views: 1 } });
    
    // Tìm recipe và cập nhật commentsCount
    const recipe = await Recipe.findById(recipeId)
      .populate('author', 'username name avatar');

    if (!recipe) {
      return res.status(404).json({
        success: false,
        message: 'Recipe not found'
      });
    }
    
    // Đếm số lượng comment cho recipe này
    const commentsCount = await Comment.countDocuments({ recipe: recipeId });
    
    // Cập nhật commentsCount nếu khác với giá trị hiện tại
    if (recipe.commentsCount !== commentsCount) {
      recipe.commentsCount = commentsCount;
      await recipe.save();
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
    const { query, page = 1, limit = 10 } = req.query;
    
    console.log('Backend received search params:', { query, page, limit });

    // Build search query for title only
    let searchQuery = {};
    
    if (query) {
      const searchRegex = new RegExp(query.trim(), 'i');
      searchQuery = {
        title: searchRegex
      };
    }

    // Execute search query
    const recipes = await Recipe.find(searchQuery)
      .populate('author', 'username name Ava')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Recipe.countDocuments(searchQuery);

    console.log('Search results:', { count: recipes.length, total });

    res.status(200).json({
      success: true,
      data: recipes,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Search error:', error);
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

exports.toggleSaveRecipe = async (req, res) => {
  try {
    const recipeId = req.params.id;
    const userId = req.user._id;

    // Tìm recipe
    const recipe = await Recipe.findById(recipeId);
    if (!recipe) {
      return res.status(404).json({
        success: false,
        message: 'Recipe not found'
      });
    }

    // Tìm user để cập nhật danh sách bài viết đã lưu
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Kiểm tra xem người dùng đã lưu công thức này chưa
    const isSaved = user.savedRecipes && user.savedRecipes.includes(recipeId);

    if (isSaved) {
      // Nếu đã lưu, bỏ lưu
      user.savedRecipes = user.savedRecipes.filter(
        savedRecipeId => savedRecipeId.toString() !== recipeId.toString()
      );
    } else {
      // Nếu chưa lưu, thêm vào danh sách đã lưu
      if (!user.savedRecipes) {
        user.savedRecipes = [];
      }
      user.savedRecipes.push(recipeId);
    }

    await user.save();

    res.status(200).json({
      success: true,
      isSaved: !isSaved,
      savedRecipesCount: user.savedRecipes.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

exports.getSavedRecipes = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Tìm user và populate savedRecipes
    const user = await User.findById(userId).populate({
      path: 'savedRecipes',
      populate: {
        path: 'author',
        select: 'username Ava'
      }
    });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: user.savedRecipes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};
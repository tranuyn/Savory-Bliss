const mongoose = require("mongoose");
const Recipe = require('../models/Recipe');
const Comment = require('../models/Comment');
const User = require('../models/User');
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

    // Kiểm tra xem người dùng đã like recipe này chưa
    let isLiked = false;
    if (req.user) {
      isLiked = recipe.likes && recipe.likes.some(
        id => id.toString() === req.user._id.toString()
      );
    }

    // Chuyển recipe thành đối tượng thông thường để thêm thuộc tính không thuộc schema
    const recipeObj = recipe.toObject();
    recipeObj.isLiked = isLiked;

    res.status(200).json({
      success: true,
      data: recipeObj
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
    const recipeId = req.params.id;
    const userId = req.user?._id; // Đảm bảo req.user tồn tại

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized. Please log in.",
      });
    }

    // Kiểm tra xem recipeId có phải ObjectId hợp lệ không
    if (!mongoose.Types.ObjectId.isValid(recipeId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid recipe ID format",
      });
    }

    console.log("Starting save recipe process:", { recipeId, userId });

    // Tìm User và Recipe cùng lúc để tối ưu hiệu suất
    const [recipe, user] = await Promise.all([
      Recipe.findById(recipeId),
      User.findById(userId),
    ]);

    if (!recipe) {
      return res.status(404).json({
        success: false,
        message: "Recipe not found",
      });
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Kiểm tra xem recipe có được lưu chưa
    const isRecipeSaved = user.savedRecipes.some(
      (id) => id.toString() === recipeId.toString()
    );

    if (isRecipeSaved) {
      // Nếu đã lưu, thì xóa khỏi danh sách
      user.savedRecipes = user.savedRecipes.filter(
        (id) => id.toString() !== recipeId.toString()
      );
      console.log("Recipe removed from saved list");
    } else {
      // Nếu chưa lưu, thêm vào danh sách
      user.savedRecipes.push(recipeId);
      console.log("Recipe added to saved list");
    }

    // Lưu thay đổi vào database
    await user.save();

    res.status(200).json({
      success: true,
      isSaved: !isRecipeSaved,
      savedRecipes: user.savedRecipes, // Trả về danh sách savedRecipes mới
    });
  } catch (error) {
    console.error("Save recipe error:", error);
    res.status(500).json({
      success: false,
      message: "Error saving recipe",
      error: error.message,
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

// Thêm chức năng like recipe
exports.toggleLike = async (req, res) => {
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

    // Initialize likes array if it doesn't exist
    if (!recipe.likes) {
      recipe.likes = [];
    }

    // Check if user already liked the recipe
    const likeIndex = recipe.likes.findIndex(
      id => id.toString() === userId.toString()
    );
    
    if (likeIndex === -1) {
      // User hasn't liked yet, add like
      recipe.likes.push(userId);
    } else {
      // User already liked, remove like
      recipe.likes.splice(likeIndex, 1);
    }

    await recipe.save();
    
    return res.status(200).json({ 
      success: true, 
      likes: recipe.likes.length,
      isLiked: likeIndex === -1 // true if like was added, false if removed
    });
  } catch (error) {
    console.error("Error toggling recipe like:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Server error",
      error: error.message
    });
  }
};

exports.toggleSaveRecipe = async (req, res) => {
  try {
    const recipeId = req.params.id;
    const userId = req.user._id;

    console.log("Starting save recipe process:", { recipeId, userId });

    // Validate recipe ID
    if (!mongoose.Types.ObjectId.isValid(recipeId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid recipe ID format'
      });
    }

    // Find recipe and user concurrently
    const [recipe, user] = await Promise.all([
      Recipe.findById(recipeId),
      User.findById(userId)
    ]);

    // Check recipe exists
    if (!recipe) {
      console.log("Recipe not found:", recipeId);
      return res.status(404).json({
        success: false,
        message: 'Recipe not found'
      });
    }

    // Check user exists
    if (!user) {
      console.log("User not found:", userId);
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Initialize savedRecipes if needed
    if (!user.savedRecipes) {
      user.savedRecipes = [];
    }

    // Convert IDs to strings for comparison
    const savedRecipeIds = user.savedRecipes.map(id => id.toString());
    const isRecipeSaved = savedRecipeIds.includes(recipeId.toString());

    console.log("Current save status:", { isRecipeSaved });

    if (isRecipeSaved) {
      // Remove recipe from saved list
      user.savedRecipes = user.savedRecipes.filter(
        id => id.toString() !== recipeId.toString()
      );
      console.log("Removed recipe from saved list");
    } else {
      // Add recipe to saved list
      user.savedRecipes.push(recipeId);
      console.log("Added recipe to saved list");
    }

    await user.save();
    console.log("User document saved successfully");

    res.status(200).json({
      success: true,
      isSaved: !isRecipeSaved,
      savedRecipes: user.savedRecipes
    });

  } catch (error) {
    console.error('Save recipe error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Error saving recipe',
      error: error.message
    });
  }
};

exports.getSavedRecipes = async (req, res) => {
  try {
    // Check if user exists in request
    if (!req.user) {
      console.log('No user found in request');
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const userId = req.user._id;
    console.log("Fetching saved recipes for user:", userId);

    // Find the user and populate saved recipes
    const user = await User.findById(userId);

    if (!user) {
      console.log("User not found:", userId);
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Handle case where savedRecipes might be undefined
    if (!user.savedRecipes || user.savedRecipes.length === 0) {
      return res.status(200).json({
        success: true,
        count: 0,
        data: []
      });
    }

    // Get the saved recipes with full details including author
    const savedRecipes = await Recipe.find({
      _id: { $in: user.savedRecipes }
    }).populate('author', 'username name Ava');

    console.log(`Found ${savedRecipes.length} saved recipes`);

    res.status(200).json({
      success: true,
      count: savedRecipes.length,
      data: savedRecipes
    });

  } catch (error) {
    console.error('Get saved recipes error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Error retrieving saved recipes',
      error: error.message
    });
  }
};
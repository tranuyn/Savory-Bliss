const recipeService = require('../services/recipeService');

const searchRecipes = async (req, res) => {
  try {
    const { query: searchQuery, tags, page, limit } = req.query;
    
    const searchResults = await recipeService.searchRecipes({
      searchQuery,
      tags: tags ? tags.split(',') : [],
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 10
    });

    res.status(200).json({
      success: true,
      data: searchResults.recipes,
      pagination: searchResults.pagination
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Không thể tìm kiếm công thức",
      error: error.message
    });
  }
};

module.exports = {
  searchRecipes
};
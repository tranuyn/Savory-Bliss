const Recipe = require('../models/Recipe');

class RecipeService {
  async searchRecipes({ searchQuery, tags, page = 1, limit = 10 }) {
    try {
      let query = {};
      
      // query search by title
      if (searchQuery) {
        query.title = { 
          $regex: searchQuery, 
          $options: 'i' 
        };
      }

      // search by tags
      if (tags && tags.length > 0) {
        query.tags = { 
          $in: Array.isArray(tags) ? tags : [tags]
        };
      }

      // Count total recipes
      const total = await Recipe.countDocuments(query);

      const recipes = await Recipe.find(query)
        .populate('author', 'username name Ava')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);

      return {
        recipes,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / limit)
        }
      };

    } catch (error) {
      throw error;
    }
  }
}

module.exports = new RecipeService();
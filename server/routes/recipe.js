const express = require('express');
const router = express.Router();
const { searchRecipes } = require('../controllers/recipeController');

router.get('/search', searchRecipes);

module.exports = router; 
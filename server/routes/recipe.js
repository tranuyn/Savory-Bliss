const express = require("express");
const router = express.Router();
const { 
  addRecipe, 
  getAllRecipes, 
  getRecipeById, 
  updateRecipe, 
  deleteRecipe,
  getRecipesByUser,
  searchRecipes,
  getRecipesByTag,
  toggleFavoriteRecipe,
  getFavoriteRecipes,
  toggleLike
} = require("../controllers/recipeController");
const { protect } = require("../middlewares/authMiddleware");

// Áp dụng middleware xác thực cho tất cả các routes cần bảo vệ
router.post("/", protect, addRecipe);
router.get("/", getAllRecipes); // Không cần xác thực để xem danh sách
router.get('/search', searchRecipes);
router.get("/user/:userId", getRecipesByUser);
router.get("/tag/:tag", getRecipesByTag);
router.get("/favorites", protect, getFavoriteRecipes);
router.get("/:id", getRecipeById);
router.put("/:id", protect, updateRecipe);
router.delete("/:id", protect, deleteRecipe);
router.post("/:id/favorite", protect, toggleFavoriteRecipe);
router.post("/:id/like", protect, toggleLike); // New route for like functionality

module.exports = router;
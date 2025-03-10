const express = require("express");
const router = express.Router();
const { 
  addRecipe, 
  getAllRecipes, 
  getRecipeById, 
  updateRecipe, 
  deleteRecipe,
  getRecipesByUser,  // Thêm hàm này
  searchRecipes,
  toggleSaveRecipe, 
  getSavedRecipes,
} = require("../controllers/recipeController");
const { protect } = require("../middlewares/authMiddleware");

// Áp dụng middleware xác thực cho tất cả các routes cần bảo vệ
router.post("/", protect, addRecipe);
router.get("/", getAllRecipes); // Không cần xác thực để xem danh sách
router.get('/search', searchRecipes);
router.get("/user/:userId", getRecipesByUser); // Thêm route cho lấy recipe theo user ID
router.get("/:id", getRecipeById); // Không cần xác thực để xem chi tiết
router.put("/:id", protect, updateRecipe);
router.delete("/:id", protect, deleteRecipe);
router.post("/:id/save", protect, toggleSaveRecipe);
router.get("/saved", getSavedRecipes); 

module.exports = router;

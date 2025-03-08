const express = require("express");
const router = express.Router();
const {
  register,
  login,
  refreshToken,
  resetPassword,
  logout,
  forgotPassword,
  getProfile,
  updateProfile,
  verifyToken
} = require("../controllers/authController");

router.post("/login", login);
router.post("/register", register);
router.post("/refresh", refreshToken);
router.post("/forgotPassword", forgotPassword);
router.post("/logout/:id", logout);
router.patch("/resetPassword/:id", resetPassword);
router.get("/verify", verifyToken);  // Thêm route này

module.exports = router;

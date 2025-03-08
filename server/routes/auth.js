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
router.post("/logout/:id", logout);
router.post("/forgotPassword", forgotPassword);
router.patch("/resetPassword/:id", resetPassword);
router.put("/updateProfile/:id", updateProfile);
router.get("/verify", verifyToken);  // Thêm route này

module.exports = router;

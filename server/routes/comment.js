const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');
const { protect } = require('../middlewares/authMiddleware');

// Routes cho comment không yêu cầu authentication
router.get('/recipe/:recipeId', commentController.getCommentsByRecipe);

// Routes cho comment yêu cầu authentication
router.post('/', protect, commentController.createComment);
router.put('/:commentId', protect, commentController.updateComment);
router.delete('/:commentId', protect, commentController.deleteComment);
router.post('/:commentId/reply', protect, commentController.addReply);
router.post('/:commentId/like', protect, commentController.toggleLike);

module.exports = router;
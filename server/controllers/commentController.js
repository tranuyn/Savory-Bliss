const Comment = require('../models/Comment');
const Recipe = require('../models/Recipe');
const mongoose = require('mongoose');

// Lấy tất cả comment của một recipe
exports.getCommentsByRecipe = async (req, res) => {
  try {
    const { recipeId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(recipeId)) {
      return res.status(400).json({ 
        success: false, 
        message: 'ID công thức không hợp lệ' 
      });
    }

    const comments = await Comment.find({ recipe: recipeId })
      .populate('user', 'username name avatar Ava')
      .populate('replies.user', 'username name avatar Ava')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: comments.length,
      data: comments
    });
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ 
      success: false,
      message: 'Lỗi server khi lấy comments',
      error: error.message
    });
  }
};

// Tạo comment mới
exports.createComment = async (req, res) => {
  try {
    const { recipeId, content } = req.body;
    
    if (!content || !recipeId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Nội dung comment và ID công thức là bắt buộc' 
      });
    }

    if (!mongoose.Types.ObjectId.isValid(recipeId)) {
      return res.status(400).json({ 
        success: false, 
        message: 'ID công thức không hợp lệ' 
      });
    }

    // Kiểm tra xem recipe có tồn tại không
    const recipeExists = await Recipe.findById(recipeId);
    if (!recipeExists) {
      return res.status(404).json({ 
        success: false, 
        message: 'Không tìm thấy công thức nấu ăn' 
      });
    }

    const newComment = new Comment({
      content,
      recipe: recipeId,
      user: req.user._id, // Sử dụng req.user._id giống như trong recipeController
    });

    await newComment.save();

    // Populate thông tin user
    const populatedComment = await Comment.findById(newComment._id)
      .populate('user', 'username name avatar Ava');

    res.status(201).json({
      success: true,
      data: populatedComment
    });
  } catch (error) {
    console.error('Error creating comment:', error);
    res.status(500).json({ 
      success: false,
      message: 'Lỗi server khi tạo comment',
      error: error.message
    });
  }
};

// Cập nhật comment
exports.updateComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { content } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(commentId)) {
      return res.status(400).json({ 
        success: false, 
        message: 'ID comment không hợp lệ' 
      });
    }

    if (!content) {
      return res.status(400).json({ 
        success: false, 
        message: 'Nội dung comment là bắt buộc' 
      });
    }

    const comment = await Comment.findById(commentId);

    if (!comment) {
      return res.status(404).json({ 
        success: false, 
        message: 'Không tìm thấy comment' 
      });
    }

    // Kiểm tra xem người dùng có quyền cập nhật comment không
    if (comment.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        success: false, 
        message: 'Bạn không có quyền cập nhật comment này' 
      });
    }

    comment.content = content;
    comment.updatedAt = Date.now();
    await comment.save();

    res.status(200).json({
      success: true,
      data: comment
    });
  } catch (error) {
    console.error('Error updating comment:', error);
    res.status(500).json({ 
      success: false,
      message: 'Lỗi server khi cập nhật comment',
      error: error.message
    });
  }
};

// Xóa comment
exports.deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(commentId)) {
      return res.status(400).json({ 
        success: false, 
        message: 'ID comment không hợp lệ' 
      });
    }

    const comment = await Comment.findById(commentId);

    if (!comment) {
      return res.status(404).json({ 
        success: false, 
        message: 'Không tìm thấy comment' 
      });
    }

    // Kiểm tra xem người dùng có quyền xóa comment không
    if (comment.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        success: false, 
        message: 'Bạn không có quyền xóa comment này' 
      });
    }

    await Comment.deleteOne({ _id: commentId }); // Sử dụng deleteOne giống như trong recipeController

    res.status(200).json({ 
      success: true,
      message: 'Comment đã được xóa thành công',
      data: {}
    });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({ 
      success: false,
      message: 'Lỗi server khi xóa comment',
      error: error.message
    });
  }
};

// Thêm reply cho một comment
exports.addReply = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { content } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(commentId)) {
      return res.status(400).json({ 
        success: false, 
        message: 'ID comment không hợp lệ' 
      });
    }

    if (!content) {
      return res.status(400).json({ 
        success: false, 
        message: 'Nội dung reply là bắt buộc' 
      });
    }

    const comment = await Comment.findById(commentId);

    if (!comment) {
      return res.status(404).json({ 
        success: false, 
        message: 'Không tìm thấy comment' 
      });
    }

    const reply = {
      content,
      user: req.user._id,
      createdAt: new Date()
    };

    comment.replies.push(reply);
    comment.updatedAt = Date.now();
    await comment.save();

    // Populate thông tin user của reply mới thêm vào
    const updatedComment = await Comment.findById(commentId)
      .populate('user', 'username name avatar Ava')
      .populate('replies.user', 'username name avatar Ava');

    res.status(201).json({
      success: true,
      data: updatedComment
    });
  } catch (error) {
    console.error('Error adding reply:', error);
    res.status(500).json({ 
      success: false,
      message: 'Lỗi server khi thêm reply',
      error: error.message
    });
  }
};

// Like/Unlike một comment
exports.toggleLike = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(commentId)) {
      return res.status(400).json({ 
        success: false, 
        message: 'ID comment không hợp lệ' 
      });
    }

    const comment = await Comment.findById(commentId);

    if (!comment) {
      return res.status(404).json({ 
        success: false, 
        message: 'Không tìm thấy comment' 
      });
    }

    // Kiểm tra xem người dùng đã like comment chưa
    const isLiked = comment.likes && comment.likes.includes(userId);

    if (isLiked) {
      // Unlike
      comment.likes = comment.likes.filter(id => id.toString() !== userId.toString());
    } else {
      // Like
      if (!comment.likes) {
        comment.likes = [];
      }
      comment.likes.push(userId);
    }

    comment.updatedAt = Date.now();
    await comment.save();

    res.status(200).json({ 
      success: true,
      isLiked: !isLiked,
      likesCount: comment.likes.length
    });
  } catch (error) {
    console.error('Error toggling like:', error);
    res.status(500).json({ 
      success: false,
      message: 'Lỗi server khi thao tác với like',
      error: error.message
    });
  }
};
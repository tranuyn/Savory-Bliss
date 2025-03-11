const mongoose = require('mongoose');

const SectionSchema = new mongoose.Schema({
  title: String,
  content: String,
  imageUrl: String
});

const RecipeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: String,
  tags: [String],
  ingredients: [String],
  imageUrl: String,
  sections: [SectionSchema],
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  favorites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  commentsCount: {
    type: Number,
    default: 0
  },
  views: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Recipe', RecipeSchema);
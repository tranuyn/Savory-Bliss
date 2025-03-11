const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      min: 5,
      max: 50,
    },
    email: {
      type: String,
      required: true,
      max: 50,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      min: 6,
    },
    name: {
      type: String,
      required: false,
      min: 5,
      max: 50,
    },
    Ava: {
      type: String,
      default: "",
    },
    bio: {
      type: String,
      default: "",
    },
    // Thêm trường savedRecipes
    savedRecipes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Recipe' }]
  },
  { timestamps: true }
);

const User = mongoose.model('User', UserSchema);

module.exports = User;  
const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

// Register a new user
const register = async (req, res) => {
  const { username, email, password, name } = req.body;

  // Validate required fields
  if (!username || !email || !password) {
    return res.status(400).json({ message: "Vui lòng nhập đầy đủ thông tin." });
  }

  try {
    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(405).json({ message: "Email đã được đăng ký" });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      name: name || username,
      Ava: "", // Default avatar
      bio: "",
    });

    // Save user to database
    const savedUser = await newUser.save();

    // Create JWT tokens
    const token = jwt.sign(
      { id: savedUser._id },
      process.env.JWT_ACCESS_KEY,
      { expiresIn: "30min" }
    );
    
    const refreshToken = jwt.sign(
      { id: savedUser._id },
      process.env.JWT_REFRESH_KEY,
      { expiresIn: "30d" }
    );

    // Return success response
    res.status(200).json({
      message: "User registered successfully.",
      user: {
        id: savedUser._id,
        username: savedUser.username,
        email: savedUser.email,
        name: savedUser.name,
        Ava: savedUser.Ava,
        bio: savedUser.bio,
      },
      token,
      refreshToken,
    });
  } catch (error) {
    console.error("Error adding user:", error);
    res.status(500).json({ error: error.message });
  }
};

// Login user
const login = async (req, res) => {
  const { email, password } = req.body;

  // Check if email and password are provided
  if (!email || !password) {
    return res.status(400).json({
      error: "Email và mật khẩu không được để trống.",
    });
  }

  try {
    // Find the user by email
    const user = await User.findOne({ email });

    // Check if user exists
    if (!user) {
      return res.status(401).json({ message: "Email không tồn tại" });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(402).json({ message: "Sai mật khẩu" });
    }

    // Create JWT tokens
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_ACCESS_KEY,
      { expiresIn: "30min" }
    );
    
    const refreshToken = jwt.sign(
      { id: user._id },
      process.env.JWT_REFRESH_KEY,
      { expiresIn: "30d" }
    );

    // Set refresh token in cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
    });

    // Respond with success
    res.status(200).json({
      message: "Login successful.",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        name: user.name,
        Ava: user.Ava,
        bio: user.bio,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        Position: user.Position
      },
      token,
      refreshToken,
    });
  } catch (error) {
    console.error("Error logging in user:", error);
    res.status(500).json({ error: error.message });
  }
};

// Refresh token
const refreshToken = async (req, res) => {
  // Get refresh token from request body
  const refreshToken = req.body.refreshToken;
  if (!refreshToken) {
    return res.status(401).json({ 
      error: "You are not authenticated - missing refresh token" 
    });
  }

  try {
    // Verify refresh token
    jwt.verify(refreshToken, process.env.JWT_REFRESH_KEY, async (err, decoded) => {
      if (err) {
        return res.status(403).json({ error: "Refresh token is invalid" });
      }

      // Create new tokens
      const newToken = jwt.sign(
        { id: decoded.id },
        process.env.JWT_ACCESS_KEY,
        { expiresIn: "30min" }
      );
      
      const newRefreshToken = jwt.sign(
        { id: decoded.id },
        process.env.JWT_REFRESH_KEY,
        { expiresIn: "30d" }
      );

      // Respond with new tokens
      res.status(200).json({
        token: newToken,
        refreshToken: newRefreshToken
      });
    });
  } catch (error) {
    console.error("Error refreshing token:", error);
    res.status(500).json({ error: error.message });
  }
};

// Reset password
const resetPassword = async (req, res) => {
  const userId = req.params.id;
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ 
      error: "Current and new passwords are required." 
    });
  }

  try {
    // Find user by ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(402).json({ message: "Sai mật khẩu hiện tại." });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedNewPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    user.password = hashedNewPassword;
    await user.save();

    res.status(200).json({
      message: "Đổi mật khẩu thành công",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        name: user.name,
        Ava: user.Ava,
        bio: user.bio
      }
    });
  } catch (error) {
    console.error("Error changing password:", error);
    res.status(500).json({ error: error.message });
  }
};

// Logout
const logout = async (req, res) => {
  // Clear the refresh token cookie
  res.clearCookie("refreshToken");
  return res.status(200).json({ message: "Đăng xuất thành công" });
};

// Forgot password
const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "Không tìm thấy email này." });
    }

    // Generate new random password
    const newPassword = Math.floor(Math.random() * 100000000)
      .toString()
      .padStart(8, "0");

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedNewPassword = await bcrypt.hash(newPassword, salt);

    // Update user's password
    user.password = hashedNewPassword;
    await user.save();

    // Set up email transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER || "your-email@gmail.com",
        pass: process.env.EMAIL_PASS || "your-app-password"
      }
    });

    // Configure email options
    const mailOptions = {
      from: process.env.EMAIL_USER || "your-email@gmail.com",
      to: email,
      subject: "Reset Password",
      text: "Your new password: " + newPassword + ". You can change it later."
    };

    // Send email
    transporter.sendMail(mailOptions, function (err, info) {
      if (err) {
        console.log(err);
      } else {
        console.log("Email sent: " + info.response);
      }
    });

    res.status(200).json({
      message: "Mật khẩu mới đã được gửi về email của bạn, hãy đăng nhập lại."
    });
  } catch (error) {
    console.error("Error in forgotPassword:", error);
    res.status(500).json({ message: error.message });
  }
};

// Get user profile
const getProfile = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId).select("-password");
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ error: error.message });
  }
};

// Update user profile
const updateProfile = async (req, res) => {
  try {
    const userId = req.params.id;
    const { username, name, bio, Ava } = req.body;
    
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { 
        $set: { 
          username: username,
          name: name,
          bio: bio,
          Ava: Ava
        } 
      },
      { new: true }
    ).select("-password");
    
    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.status(200).json({
      message: "Profile updated successfully",
      user: updatedUser
    });
  } catch (error) {
    console.error("Error updating user profile:", error);
    res.status(500).json({ error: error.message });
  }
};

// Verify token
const verifyToken = async (req, res) => {
  try {
    // Lấy token từ header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: "Không có token" });
    }
    
    const token = authHeader.split(' ')[1];
    
    // Xác thực token
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_KEY);
    
    // Tìm user theo ID
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }
    
    // Trả về thông tin người dùng
    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        name: user.name,
        Ava: user.Ava,
        bio: user.bio,
        Position: user.Position
      }
    });
  } catch (error) {
    console.error("Lỗi xác thực token:", error);
    return res.status(401).json({ message: "Token không hợp lệ" });
  }
};

module.exports = {
  register,
  login,
  refreshToken,
  resetPassword,
  logout,
  forgotPassword,
  getProfile,
  updateProfile,
  verifyToken
};

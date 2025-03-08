const jwt = require('jsonwebtoken');

const protect = async (req, res, next) => {
  try {
    let token = req.header("Authorization");
    console.log("Received token:", token);

    if (!token) {
      console.log("No token provided");
      return res.status(403).json({ success: false, message: "Access Denied" });
    }

    if (token.startsWith("Bearer ")) {
      token = token.slice(7).trim();
    }

    console.log("Verifying token:", token);
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Token verified, user:", verified);
    
    // Đảm bảo verified chứa _id hoặc id
    if (!verified._id && !verified.id) {
      return res.status(401).json({ success: false, message: "Invalid user data in token" });
    }
    
    // Đảm bảo req.user có trường _id
    req.user = {
      _id: verified._id || verified.id,
      ...verified
    };
    
    next();
  } catch (err) {
    console.error("Token verification error:", err);
    res.status(401).json({ success: false, message: "Invalid token" });
  }
};

module.exports = { protect };

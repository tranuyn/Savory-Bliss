const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const dotenv = require("dotenv");
const helmet = require("helmet");
const morgan = require("morgan");
const path = require("path");

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware setup
app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));
app.use(cors());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("dev"));
app.use(express.json());

// Thiết lập đường dẫn tĩnh
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// Phục vụ thư mục public cho các tài nguyên tĩnh khác
app.use(express.static("public"));

// Đảm bảo thư mục uploads tồn tại
const fs = require('fs');
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Import routes
const authRoutes = require("./routes/auth");
const recipeRoutes = require("./routes/recipe");

// Basic route
app.get("/", (req, res) => {
  res.send("Hello from Express!");
});

// Apply routes
app.use("/auth", authRoutes);
app.use("/api/recipes", recipeRoutes);

app.use(cors({
  origin: [
    "http://localhost:3000",  // For local development
    "https://savory-bliss.onrender.com/"
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Server Error'
  });
});

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => console.log("MongoDB connection error:", err));

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
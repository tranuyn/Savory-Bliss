const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config(); // Thêm dòng này ở đầu file

const app = express();
const PORT = process.env.PORT || 5000;

// Sử dụng biến môi trường
const mongoURI = process.env.MONGO_URI;

mongoose.connect(mongoURI, {})
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log('MongoDB connection error:', err));

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello from Express!');
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
const express = require("express");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const router = express.Router();

// Signup Route
router.post('/signup', async (req, res) => {
  try {
      const { username, email, password } = req.body;
      const existingUser = await User.findOne({ email });

      if (existingUser) return res.status(400).json({ message: "User already exists" });

      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = new User({ username, email, password: hashedPassword });

      await newUser.save();
      res.status(201).json({ message: "User created successfully" });
  } catch (error) {
      res.status(500).json({ message: "Server Error" });
  }
});

// Login Route
router.post('/login', async (req, res) => {
  try {
      const { email, password } = req.body;
      const user = await User.findOne({ email });
      if (!user) return res.status(400).json({ message: "Invalid credentials" });
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

      const token = jwt.sign(
        { id: user._id, email: user.email, username: user.username }, 
        process.env.JWT_SECRET, 
        { expiresIn: "1d" }
      );
      res.json({ token, user: { id: user._id, username: user.username, email: user.email } });
  } catch (error) {
      res.status(500).json({ message: "Server Error" });
  }
});

// Logout Route (Optional: Can be handled on frontend)
router.post('/logout', (req, res) => {
  res.json({ message: "Logged out successfully" });
});

module.exports = router;

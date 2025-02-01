const express = require("express");
const Note = require("../models/Note");
const jwt = require("jsonwebtoken");
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Create Note
router.post('/', authMiddleware, async (req, res) => {
  try {
      const { title, content, category } = req.body;
      const newNote = new Note({ userId: req.user.id, title, content, category });
      await newNote.save();
      res.status(201).json(newNote);
  } catch (err) {
      res.status(500).json({ message: "Error creating note" });
  }
});

// Get User Notes
router.get('/', authMiddleware, async (req, res) => {
  try {
      const notes = await Note.find();
      res.json(notes);
  } catch (err) {
      res.status(500).json({ message: "Error fetching notes" });
  }
});

// Update Note
router.put('/:id', authMiddleware, async (req, res) => {
  try {
      const updatedNote = await Note.findOneAndUpdate(
          { _id: req.params.id, userId: req.user.id },
          { $set: req.body },
          { new: true }
      );
      res.json(updatedNote);
  } catch (err) {
      res.status(500).json({ message: "Error updating note" });
  }
});

// Delete Note
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
      await Note.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
      res.json({ message: "Note deleted" });
  } catch (err) {
      res.status(500).json({ message: "Error deleting note" });
  }
});

module.exports = router;

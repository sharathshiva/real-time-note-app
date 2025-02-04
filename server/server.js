const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const { connectDB } = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const noteRoutes = require("./routes/noteRoutes");
const socketIo = require("socket.io");
const http = require("http");

dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: { origin: "*" }
});

const corsOptions = {
  origin: "https://real-time-note-app-ieow.vercel.app", // Allow only your frontend
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true, // Allow cookies if needed
};

app.use(cors(corsOptions));
app.use(express.json());

const Note = require('./models/Note'); // Import Note model
app.use("/api/auth", authRoutes);
app.use("/api/notes", noteRoutes);

const onlineUsers = {}; // Object to track online users by socket id

// Socket.io connection
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Set username with email and username to avoid duplicates
  socket.on('setUsername', (user) => {
    if (user?.email) {
      onlineUsers[socket.id] = { ...user, online: true }; // Track user and status (online)
      io.emit('userListUpdate', Object.values(onlineUsers)); // Send updated list of users
    }
  });

  // Listen for note edits, update the note and broadcast to others
  socket.on('updateNote', async (updatedNote) => {
    try {
      const note = await Note.findByIdAndUpdate(updatedNote._id, updatedNote, { new: true });
      io.emit('noteUpdated', note); // Broadcast the updated note to all users
    } catch (error) {
      console.error('Error updating note:', error);
    }
  });

  // When a user disconnects, remove them from the online users list
  socket.on('disconnect', () => {
    if (onlineUsers[socket.id]) {
      delete onlineUsers[socket.id]; // Remove user from the list
      io.emit('userListUpdate', Object.values(onlineUsers)); // Emit updated list of online users
      console.log(`User disconnected: ${socket.id}`);
    }
  });
});


server.listen(8080, () => {
  console.log("Server started at http://localhost:8080");
});

const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const { connectDB } = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const noteRoutes = require("./routes/noteRoutes");
const socketIo = require('socket.io');
const http = require("http");

dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: { origin: '*' }
});

app.use(cors());
app.use(express.json());

const Note = require('./models/Note'); // Import Note model
app.use("/api/auth", authRoutes);
app.use("/api/notes", noteRoutes);
const onlineUsers = {}; // Object to track online users by socket id

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('setUsername', (user) => {
    if (user?.email) {
        onlineUsers[user.email] = user.username;
        io.emit('userListUpdate', Object.values(onlineUsers)); // Send updated list
    }
  });
  // Listen for note edits
  socket.on('updateNote', async (updatedNote) => {
      try {
          const note = await Note.findByIdAndUpdate(updatedNote._id, updatedNote, { new: true });
          io.emit('noteUpdated', note); // Broadcast the updated note to all users
      } catch (error) {
          console.error('Error updating note:', error);
      }
  });

  // When a user disconnects, remove them from the list
  socket.on('disconnect', () => {
    for (const email in onlineUsers) {
        if (onlineUsers[email] === socket.id) {
            delete onlineUsers[email];
            break;
        }
    }
    io.emit('userListUpdate', Object.values(onlineUsers));
  });
});


server.listen(8080, ()=> {
    console.log("Server started at 8080")
})

// const corsOptions = {
//     origin: ("http://localhost:5173"),
// }
// app.use(cors(corsOptions));
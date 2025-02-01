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

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Listen for note edits
  socket.on('updateNote', async (updatedNote) => {
      try {
          const note = await Note.findByIdAndUpdate(updatedNote._id, updatedNote, { new: true });
          io.emit('noteUpdated', note); // Broadcast the updated note to all users
      } catch (error) {
          console.error('Error updating note:', error);
      }
  });

  socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
  });
});


server.listen(8080, ()=> {
    console.log("Server started at 8080")
})

// const corsOptions = {
//     origin: ("http://localhost:5173"),
// }
// app.use(cors(corsOptions));
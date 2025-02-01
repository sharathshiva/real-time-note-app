const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const { connectDB } = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const noteRoutes = require("./routes/noteRoutes");
const { Server } = require("socket.io");
const http = require("http");

dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/notes", noteRoutes);

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("edit-note", (data) => {
    io.emit("update-note", data);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});
// const mongoose = require("mongoose");
// mongoose.connect(
//     "mongodb+srv://sharath:sharu123@zensar.8rpue.mongodb.net/restdata?retryWrites=true&w=majority"
//     ).then(() => {
//         console.log("Connected to MongoDB")
//     }).catch((err) => {
//         console.error('MongoDB connection error:', err)
//     });


server.listen(8080, ()=> {
    console.log("Server started at 8080")
})

// const corsOptions = {
//     origin: ("http://localhost:5173"),
// }
// app.use(cors(corsOptions));
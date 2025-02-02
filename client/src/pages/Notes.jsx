import { useState, useEffect, useContext } from "react";
import { io } from "socket.io-client";
import { AuthContext } from "../context/AuthContext";
import { getNotes, createNote, updateNote, deleteNote } from "../services/noteService";
import { jwtDecode } from "jwt-decode";
import Login from "./Login";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PlusCircle, Trash, Edit, Search } from "lucide-react";

const socket = io("http://localhost:8080"); 

const Notes = () => {
  const { user, handleLogout } = useContext(AuthContext);
  const [notes, setNotes] = useState([]);
  const [form, setForm] = useState({ title: "", content: "", category: "General" });
  const [editingNote, setEditingNote] = useState(null);
  const [filterCategory, setFilterCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [onlineUsers, setOnlineUsers] = useState([]); // Track online users
  const [openDialog, setOpenDialog] = useState(false);
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    if (user) {
      fetchNotes();
      try {
        const decoded = jwtDecode(localStorage.getItem("token"));
        setUserInfo(decoded); // Store user info
        socket.emit("setUsername", { email: decoded.email, username: decoded.username });
      } catch (error) {
        console.error("Invalid token:", error);
      }
    }

    // Listen for updates to the online users list
    socket.on('userListUpdate', (users) => {
        console.log('Online users:', users);
        setOnlineUsers(users);
    });

    socket.on("noteUpdated", (updatedNote) => {
      setNotes((prevNotes) => prevNotes.map((note) => (note._id === updatedNote._id ? updatedNote : note)));
    });

    return () => {
      socket.off("noteUpdated");
      // Clean up when the component unmounts
      socket.off('userListUpdate');
    };
  }, [user]);

  const fetchNotes = async () => {
    const response = await getNotes(localStorage.getItem("token"));
    setNotes(response.data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    if (editingNote) {
      socket.emit("updateNote", { ...editingNote, ...form });
      setEditingNote(null);
    } else {
      await createNote(form, token);
      fetchNotes();
    }

    setForm({ title: "", content: "", category: "General" });
    setOpenDialog(false);
  };

  const handleEdit = (note) => {
    setEditingNote(note);
    setForm({ title: note.title, content: note.content, category: note.category });
    setOpenDialog(true);
  };

  const handleDelete = async (id) => {
    await deleteNote(id, localStorage.getItem("token"));
    fetchNotes();
  };

  const uniqueCategories = ["All", ...new Set(notes.map((note) => note.category))];

  const filteredNotes = notes.filter(
    (note) =>
      (filterCategory === "All" || note.category === filterCategory) &&
      (note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.content.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="container mx-auto p-6">
  {user ? (
    <>
      {/* Header Section */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold">📒 Notes</h1>
        <h1>Welcome, {user.username}</h1>
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={() => setOpenDialog(true)}>
            <PlusCircle size={20} className="mr-2" /> Add Note
          </Button>
          <Button variant="destructive" onClick={handleLogout}>Logout</Button>
        </div>
      </div>

      {/* Search & Filter Section */}
      <div className="flex items-center space-x-2 mb-4">
        <Input
          type="text"
          placeholder="Search notes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg"
        />
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            {uniqueCategories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Notes & Online Users Section */}
      <div className="flex justify-between space-x-6 mt-6">
        {/* Notes Grid with Fixed Medium-Sized Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 flex-1">
          {filteredNotes.map((note) => (
            <Card key={note._id} className="w-80 bg-white shadow-md p-4 rounded-lg transition hover:shadow-xl">
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  {note.title} 
                  <span className="text-sm text-gray-500">{note.category}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">{note.content}</p>
                <div className="text-sm text-gray-500 mt-2">
                  Created by: {note.createdBy || "Unknown"} | Edited by: {note.editedBy || "Unknown"}
                </div>
                <div className="flex justify-end space-x-2 mt-4">
                  <Button size="sm" variant="outline" onClick={() => handleEdit(note)}>
                    <Edit size={16} />
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(note._id)}>
                    <Trash size={16} />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Online Users Panel (Fixed Width) */}
        <div className="bg-gray-100 p-4 rounded-lg shadow-md w-64 h-fit">
          <h2 className="text-xl font-bold mb-2">Online Users</h2>
          <ul className="space-y-3">
            {onlineUsers.length > 0 ? (
              onlineUsers.map((user, index) => (
                <li key={index} className="flex items-center space-x-3">
                  <span
                    className={`w-3 h-3 rounded-full ${
                      user.online ? "bg-green-500" : "bg-gray-400"
                    }`}
                  ></span>
                  <span className="text-md font-medium text-gray-700">
                    {user.username}
                  </span>
                  <span className="text-sm text-gray-500">
                    {user.online ? "(Online)" : "(Offline)"}
                  </span>
                </li>
              ))
            ) : (
              <p className="text-gray-500 text-sm">No users online</p>
            )}
          </ul>
        </div>
      </div>
    </>
  ) : (
    <Login />
  )}
</div>


  );
};

export default Notes;

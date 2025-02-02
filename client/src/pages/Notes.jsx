import { useState, useEffect, useContext } from 'react';
import { io } from 'socket.io-client';
import { AuthContext } from '../context/AuthContext';
import { getNotes, createNote, updateNote, deleteNote } from '../services/noteService';
import { jwtDecode } from 'jwt-decode';
import Login from './Login';

const socket = io('http://localhost:8080'); // Connect to WebSocket server

const Notes = () => {
  const { user, handleLogout } = useContext(AuthContext);
  const [notes, setNotes] = useState([]);
  const [form, setForm] = useState({ title: '', content: '', category: 'General' });
  const [editingNote, setEditingNote] = useState(null);
  const [filterCategory, setFilterCategory] = useState('All'); // For filtering
  const [searchQuery, setSearchQuery] = useState(''); // Search notes
  const [onlineUsers, setOnlineUsers] = useState([]); // Track online users
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    if (user) {
      fetchNotes();
      try {
        const decoded = jwtDecode(localStorage.getItem('token')); // Decode the JWT token
        setUserInfo(decoded); // Store user info
        console.log('Decoded user:', decoded);
        // Emit full user object with email to avoid duplicates
        socket.emit('setUsername', { email: decoded.email, username: decoded.username });
      } catch (error) {
        console.error('Invalid token:', error);
      }
    }

    // Listen for updates to the online users list
    socket.on('userListUpdate', (users) => {
      console.log('Online users:', users);
      setOnlineUsers(users);
    });

    // Listen for note updates in real-time
    socket.on('noteUpdated', (updatedNote) => {
      setNotes((prevNotes) =>
        prevNotes.map((note) => (note._id === updatedNote._id ? updatedNote : note))
      );
    });

    return () => {
      socket.off('noteUpdated');
      // Clean up when the component unmounts
      socket.off('userListUpdate');
    };
  }, [user]);

  const fetchNotes = async () => {
    const response = await getNotes(localStorage.getItem('token'));
    setNotes(response.data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    if (editingNote) {
      socket.emit('updateNote', { ...editingNote, ...form });
      setEditingNote(null);
    } else {
      await createNote(form, token);
      fetchNotes();
    }

    setForm({ title: '', content: '', category: 'General' });
  };

  const handleEdit = (note) => {
    setEditingNote(note);
    setForm({ title: note.title, content: note.content, category: note.category });
  };

  const handleDelete = async (id) => {
    await deleteNote(id, localStorage.getItem('token'));
    fetchNotes();
  };

  // Extract unique categories for filtering
  const uniqueCategories = ['All', ...new Set(notes.map((note) => note.category))];

  // Filter notes based on selected category
  const filteredNotes = notes.filter(
    (note) =>
      (filterCategory === 'All' || note.category === filterCategory) &&
      (note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.content.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div>
        {user ? (
            <>
            <h1>Welcome, {user.username}</h1>
            <button onClick={handleLogout}>Logout</button>
      <h1>Your Notes</h1>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          required
        />
        <textarea
          placeholder="Content"
          value={form.content}
          onChange={(e) => setForm({ ...form, content: e.target.value })}
          required
        />
        <select
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
        >
          <option value="General">General</option>
          <option value="Work">Work</option>
          <option value="Personal">Personal</option>
          <option value="Ideas">Ideas</option>
        </select>
        <button type="submit">{editingNote ? 'Update Note' : 'Add Note'}</button>
      </form>

      {/* Search & Category Filter */}
      <input
        type="text"
        placeholder="Search notes..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
        {uniqueCategories.map((category) => (
          <option key={category} value={category}>
            {category}
          </option>
        ))}
      </select>

      <ul>
        {filteredNotes.map((note) => (
          <li key={note._id}>
            <h3>
              {note.title} ({note.category})
            </h3>
            <p>{note.content}</p>
            <button onClick={() => handleEdit(note)}>Edit</button>
            <button onClick={() => handleDelete(note._id)}>Delete</button>
          </li>
        ))}
      </ul>

      <h2>Online Users</h2>
      <ul>
        {onlineUsers.map((user, index) => (
          <li key={index}>
            {user.username} {user.online ? "(Online)" : "(Offline)"}
          </li>
        ))}
      </ul>
      </>
            ) : (
                <Login />
            )}
    </div>
  );
};

export default Notes;

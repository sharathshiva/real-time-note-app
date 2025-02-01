import { useState, useEffect, useContext } from 'react';
import { io } from 'socket.io-client';
import { AuthContext } from '../context/AuthContext';
import { getNotes, createNote, updateNote, deleteNote } from '../services/noteService';

const socket = io('http://localhost:8080'); // Connect to WebSocket server

const Notes = () => {
    const { user } = useContext(AuthContext);
    const [notes, setNotes] = useState([]);
    const [form, setForm] = useState({ title: "", content: "", category: "General" });
    const [editingNote, setEditingNote] = useState(null);
    const [filterCategory, setFilterCategory] = useState("All"); // For filtering
    const [searchQuery, setSearchQuery] = useState(""); // Search notes

    useEffect(() => {
        if (user) fetchNotes();

        socket.on('noteUpdated', (updatedNote) => {
            setNotes(prevNotes =>
                prevNotes.map(note => note._id === updatedNote._id ? updatedNote : note)
            );
        });

        return () => socket.off('noteUpdated');
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

        setForm({ title: "", content: "", category: "General" });
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
    const uniqueCategories = ["All", ...new Set(notes.map(note => note.category))];

    // Filter notes based on selected category
    // Filter Notes: By Category & Search Query
    const filteredNotes = notes.filter(note =>
        (filterCategory === "All" || note.category === filterCategory) &&
        (note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.content.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <div>
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
                <button type="submit">{editingNote ? "Update Note" : "Add Note"}</button>
            </form>

            {/* Search & Category Filter */}
            <input
                type="text"
                placeholder="Search notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
            />
                <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                >
                    {uniqueCategories.map(category => (
                        <option key={category} value={category}>{category}</option>
                    ))}
                </select>

            <ul>
                {filteredNotes.map(note => (
                    <li key={note._id}>
                        <h3>{note.title} ({note.category})</h3>
                        <p>{note.content}</p>
                        <button onClick={() => handleEdit(note)}>Edit</button>
                        <button onClick={() => handleDelete(note._id)}>Delete</button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Notes;

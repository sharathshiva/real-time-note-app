import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { getNotes, createNote, updateNote, deleteNote } from '../services/noteService';

const Notes = () => {
    const { user } = useContext(AuthContext);
    const [notes, setNotes] = useState([]);
    const [form, setForm] = useState({ title: "", content: "", category: "General" });
    const [editingNote, setEditingNote] = useState(null); // Track note being edited

    useEffect(() => {
        if (user) fetchNotes();
    }, [user]);

    const fetchNotes = async () => {
        const response = await getNotes(localStorage.getItem('token'));
        setNotes(response.data);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');

        if (editingNote) {
            // If editing, update note
            await updateNote(editingNote._id, form, token);
            setEditingNote(null);
        } else {
            // Otherwise, create new note
            await createNote(form, token);
        }

        setForm({ title: "", content: "", category: "General" }); // Reset form
        fetchNotes(); // Refresh notes list
    };

    const handleEdit = (note) => {
        setEditingNote(note);
        setForm({ title: note.title, content: note.content, category: note.category });
    };

    const handleDelete = async (id) => {
        await deleteNote(id, localStorage.getItem('token'));
        fetchNotes();
    };

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
                <input
                    type="text"
                    placeholder="Category"
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                />
                <button type="submit">{editingNote ? "Update Note" : "Add Note"}</button>
            </form>

            <ul>
                {notes.map(note => (
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

import { useEffect, useState } from "react";
import axios from "axios";
import { io } from "socket.io-client";

const socket = io("http://localhost:8080");

export default function Dashboard() {
  const [notes, setNotes] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:8080/api/notes", {
      headers: { Authorization: localStorage.getItem("token") },
    }).then((res) => setNotes(res.data));

    socket.on("update-note", (note) => {
      setNotes((prev) => prev.map(n => n._id === note._id ? note : n));
    });
  }, []);

  return (
    <div className="p-10">
      <h2>Notes</h2>
      {notes.map(note => <div key={note._id}>{note.title}</div>)}
    </div>
  );
}

import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import "./App.css";

function App() {
  const [notebooks, setNotebooks] = useState([]);
  const [selectedNotebook, setSelectedNotebook] = useState(null);
  const [notes, setNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);

  // Load notebooks from SQLite when the app starts
  useEffect(() => {
    fetchNotebooks();
  }, []);

  // Fetch all notebooks from Tauri SQLite
  const fetchNotebooks = async () => {
    try {
      const result = await invoke("get_notebooks");
      setNotebooks(result);
    } catch (error) {
      console.error("Error fetching notebooks:", error);
    }
  };

  // Fetch notes when a notebook is selected
  const selectNotebook = async (notebook) => {
    setSelectedNotebook(notebook);
    try {
      const result = await invoke("get_notes", { notebook_id: notebook.id });
      setNotes(result);
    } catch (error) {
      console.error("Error fetching notes:", error);
    }
  };

  // Add a new notebook
  const addNotebook = async () => {
    const title = prompt("Enter notebook name:");
    if (!title) return;

    try {
      await invoke("add_notebook", { title });
      fetchNotebooks(); // Reload the notebooks list
    } catch (error) {
      console.error("Error adding notebook:", error);
    }
  };

  // Add a new note to the selected notebook
  const addNote = async () => {
    if (!selectedNotebook) return;
    const title = prompt("Enter note title:");
    if (!title) return;

    try {
      await invoke("add_note", {
        notebook_id: selectedNotebook.id,
        title,
        content: "",
      });
      selectNotebook(selectedNotebook); // Reload the notes list
    } catch (error) {
      console.error("Error adding note:", error);
    }
  };

  // Select a note
  const selectNote = (note) => {
    setSelectedNote(note);
  };

  // Edit and save a note
  const editNote = async (event) => {
    if (!selectedNote) return;

    const updatedContent = event.target.value;
    setSelectedNote((prev) => ({ ...prev, content: updatedContent }));

    try {
      await invoke("update_note", {
        note_id: selectedNote.id,
        title: selectedNote.title,
        content: updatedContent,
      });
    } catch (error) {
      console.error("Error updating note:", error);
    }
  };

  return (
    <div className="app-container">
      {/* Sidebar for Notebooks */}
      <aside className="sidebar">
        <h2>Joplin (Tauri)</h2>
        <button onClick={addNotebook}>+ New Notebook</button>
        <ul>
          {notebooks.map((nb) => (
            <li
              key={nb.id}
              onClick={() => selectNotebook(nb)}
              className={selectedNotebook?.id === nb.id ? "active" : ""}
            >
              {nb.title}
            </li>
          ))}
        </ul>
      </aside>

      {/* Sidebar for Notes */}
      <aside className="notes-sidebar">
        <button onClick={addNote} disabled={!selectedNotebook}>
          + New Note
        </button>
        <ul>
          {notes.map((note) => (
            <li
              key={note.id}
              onClick={() => selectNote(note)}
              className={selectedNote?.id === note.id ? "active" : ""}
            >
              {note.title}
            </li>
          ))}
        </ul>
      </aside>

      {/* Note Editor */}
      <main className="editor">
        <div className="toolbar">
          <h3>{selectedNote ? selectedNote.title : "No Note Selected"}</h3>
        </div>

        <textarea
          placeholder="Write your note here..."
          value={selectedNote?.content || ""}
          onChange={editNote}
          disabled={!selectedNote}
        />
      </main>
    </div>
  );
}

export default App;

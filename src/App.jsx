import { useState, useEffect } from "react";
// Use `@tauri-apps/api/tauri` if it works in your environment, otherwise `@tauri-apps/api/core`
import { invoke } from "@tauri-apps/api/core";
import "./App.css";

function App() {
  // State: list of notebooks
  const [notebooks, setNotebooks] = useState([]);
  // State: list of notes for the selected notebook
  const [notes, setNotes] = useState([]);
  // State: ID of the selected notebook
  const [selectedNotebook, setSelectedNotebook] = useState(null);
  // State: ID of the selected note (to show its content on the right)
  const [selectedNote, setSelectedNote] = useState(null);

  // ===========================
  //  Fetch Notebooks on Load
  // ===========================
  useEffect(() => {
    console.log("Fetching notebooks...");
    invoke("get_notebooks")
      .then((data) => {
        console.log("Notebooks fetched:", data);
        setNotebooks(data);
      })
      .catch((error) => console.error("Error fetching notebooks:", error));
  }, []);

  // ===========================
  //  Fetch Notes for a Notebook
  // ===========================
  const fetchNotes = (notebookId) => {
    console.log("Notebook selected:", notebookId);
    setSelectedNotebook(notebookId);
    setSelectedNote(null); // reset selected note

    invoke("get_notes", { notebookId })
      .then((data) => {
        console.log("Notes received:", data);
        setNotes(data);
      })
      .catch((error) => console.error("Error fetching notes:", error));
  };

  // ===========================
  //  Select a Note to View
  // ===========================
  const handleSelectNote = (noteId) => {
    setSelectedNote(noteId);
  };

  // ===========================
  //  Get Content of Selected Note
  // ===========================
  const selectedNoteContent = (() => {
    if (!selectedNote) return "Select a note to view its content";
    const noteObj = notes.find((n) => n.id === selectedNote);
    return noteObj ? noteObj.content : "Note content not found";
  })();

  // ===========================
  //     RENDER JSX
  // ===========================
  return (
    <div className="app-container">
      {/* Left column: Notebooks */}
      <div className="sidebar">
        <h2>Notebooks</h2>
        <ul>
          {notebooks.map((nb) => (
            <li
              key={nb.id}
              onClick={() => fetchNotes(nb.id)}
              className={nb.id === selectedNotebook ? "active" : ""}
            >
              {nb.title}
            </li>
          ))}
        </ul>
      </div>

      {/* Middle column: Notes */}
      <div className="notes-sidebar">
        <h2>Notes</h2>
        <ul>
          {notes.map((note) => (
            <li
              key={note.id}
              onClick={() => handleSelectNote(note.id)}
              className={note.id === selectedNote ? "active" : ""}
            >
              {note.title}
            </li>
          ))}
        </ul>
      </div>

      {/* Right column: Editor / Content */}
      <div className="editor">
        <h2>Note Content</h2>
        <div style={{ marginTop: "10px" }}>
          {selectedNoteContent}
        </div>
      </div>
    </div>
  );
}

export default App;

import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core"; // or "@tauri-apps/api/tauri"
import "./App.css";

function App() {
  // ========= STATES =========
  // Notebooks and notes
  const [notebooks, setNotebooks] = useState([]);
  const [notes, setNotes] = useState([]);
  // Selection states
  const [selectedNotebook, setSelectedNotebook] = useState(null);
  const [selectedNote, setSelectedNote] = useState(null);

  // Fields for creating a new Notebook
  const [newNotebookTitle, setNewNotebookTitle] = useState("");
  const [showCreateNotebookForm, setShowCreateNotebookForm] = useState(false);

  // Fields for creating a new Note (only title)
  const [newNoteTitle, setNewNoteTitle] = useState("");
  const [showCreateNoteForm, setShowCreateNoteForm] = useState(false);

  // Field for editing note content
  const [editedContent, setEditedContent] = useState("");

  // ================ useEffect ================
  useEffect(() => {
    fetchNotebooks();
  }, []);

  // ================ API Calls ================
  const fetchNotebooks = () => {
    console.log("Fetching notebooks...");
    invoke("get_notebooks")
      .then((data) => {
        console.log("Notebooks fetched:", data);
        setNotebooks(data);
      })
      .catch((error) => console.error("Error fetching notebooks:", error));
  };

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

  const createNotebook = () => {
    if (!newNotebookTitle.trim()) return;
    invoke("create_notebook", { title: newNotebookTitle })
      .then((created) => {
        console.log("Notebook created:", created);
        setNewNotebookTitle("");
        setShowCreateNotebookForm(false);
        fetchNotebooks();
      })
      .catch((error) => console.error("Error creating notebook:", error));
  };

  const createNote = () => {
    if (!selectedNotebook) {
      alert("Choisis d'abord un notebook pour y créer une note !");
      return;
    }
    if (!newNoteTitle.trim()) return;
  
    invoke("create_note", {
      notebookId: selectedNotebook,
      title: newNoteTitle,
      // Note: no content is passed, so it defaults to empty
    })
      .then((created) => {
        console.log("Note created:", created);
        setNewNoteTitle("");
        setShowCreateNoteForm(false);
        fetchNotes(selectedNotebook);
      })
      .catch((error) => console.error("Error creating note:", error));
  };  

  // ================ Note Selection and Editing ================
  const handleSelectNote = (noteId) => {
    setSelectedNote(noteId);
    const noteObj = notes.find((n) => n.id === noteId);
    setEditedContent(noteObj ? noteObj.content : "");
  };
  
  const saveNoteContent = () => {
    if (!selectedNote) return;
  
    invoke("update_note_content", {
      noteId: selectedNote,
      newContent: editedContent,
    })
      .then(() => {
        console.log("Note content updated!");
        const updatedNotes = notes.map((n) => {
          if (n.id === selectedNote) {
            return { ...n, content: editedContent };
          }
          return n;
        });
        setNotes(updatedNotes);
      })
      .catch((error) => console.error("Error updating note content:", error));
  };

  const selectedNoteContent = (() => {
    if (!selectedNote) return "";
    const noteObj = notes.find((n) => n.id === selectedNote);
    return noteObj ? noteObj.content : "";
  })();

  // ================ Render ================
  return (
    <div className="app-container">
      {/* ================== LEFT COLUMN: NOTEBOOKS ================== */}
      <div className="sidebar">
        <h2>Notebooks</h2>
        <button
          onClick={() => setShowCreateNotebookForm(!showCreateNotebookForm)}
          style={{ marginBottom: "10px" }}
        >
          + Ajouter Notebook
        </button>
        {showCreateNotebookForm && (
          <div style={{ marginBottom: "10px" }}>
            <input
              type="text"
              placeholder="Titre du notebook"
              value={newNotebookTitle}
              onChange={(e) => setNewNotebookTitle(e.target.value)}
              style={{ width: "100%", marginBottom: "5px" }}
            />
            <button onClick={createNotebook}>Créer</button>
          </div>
        )}
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

      {/* ================== MIDDLE COLUMN: NOTES ================== */}
      <div className="notes-sidebar">
        <h2>Notes</h2>
        <button
          onClick={() => setShowCreateNoteForm(!showCreateNoteForm)}
          style={{ marginBottom: "10px" }}
        >
          + Ajouter Note
        </button>
        {showCreateNoteForm && (
          <div style={{ marginBottom: "10px" }}>
            <input
              type="text"
              placeholder="Titre de la note"
              value={newNoteTitle}
              onChange={(e) => setNewNoteTitle(e.target.value)}
              style={{ width: "100%", marginBottom: "5px" }}
            />
            <button onClick={createNote}>Créer</button>
          </div>
        )}
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

      {/* ================== RIGHT COLUMN: NOTE CONTENT (Editor) ================== */}
      <div className="editor">
        <h2>Contenu de la Note</h2>
        {selectedNote ? (
          <div>
            <textarea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              rows={10}
              style={{ width: "100%", marginBottom: "10px" }}
            />
            <button onClick={saveNoteContent}>Enregistrer</button>
          </div>
        ) : (
          <p>Sélectionne une note</p>
        )}
      </div>
    </div>
  );
}

export default App;

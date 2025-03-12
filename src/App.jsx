// src/App.jsx
import React from "react";
import NotebookList from "./components/NotebookList";
import NoteList from "./components/NoteList";
import NoteEditor from "./components/NoteEditor";
import "./App.css";

function App() {
  return (
    <div className="flex h-screen">
      <NotebookList />
      <NoteList />
      <NoteEditor />
    </div>
  );
}

export default App;

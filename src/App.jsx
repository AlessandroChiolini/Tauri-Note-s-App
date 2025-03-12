// src/App.jsx
import React from "react";
import Split from "react-split";
import NotebookList from "./components/NotebookList";
import NoteList from "./components/NoteList";
import NoteEditor from "./components/NoteEditor";
import "./App.css";

function App() {
  return (
    <Split
      className="flex h-screen"
      sizes={[15, 25, 60]}       // Initial percentages for each pane
      minSize={100}             // Minimum pixel width for each pane
      gutterSize={4}            // Gutter (resizer) size in pixels
      expandToMin={false}
      gutterAlign="center"
      snapOffset={30}
      dragInterval={1}
      direction="horizontal"    // Horizontal split
      cursor="col-resize"
    >
      <NotebookList />
      <NoteList />
      <NoteEditor />
    </Split>
  );
}

export default App;

import React, { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { useAppContext } from "../contexts/AppContext";

const TrashBin = () => {
  const { notebooks, loadNotes } = useAppContext();
  const [deletedNotes, setDeletedNotes] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [restoreError, setRestoreError] = useState(null);

  // Load deleted notes when the trash bin is opened
  useEffect(() => {
    if (isOpen) {
      loadDeletedNotes();
    }
  }, [isOpen]);

  const loadDeletedNotes = async () => {
    try {
      const notes = await invoke("get_deleted_notes");
      setDeletedNotes(notes);
      setRestoreError(null); // Clear any previous errors
    } catch (error) {
      console.error("Failed to load deleted notes:", error);
    }
  };

  // Helper function to get notebook name from notebook_id
  const getNotebookName = (notebookId) => {
    const notebook = notebooks.find(nb => nb.id === notebookId);
    return notebook ? notebook.title : "Unknown Notebook";
  };

  const handleRestore = async (noteId, notebookId) => {
    setRestoreError(null); // Clear previous errors

    try {
      console.log(`Attempting to restore note with ID: ${noteId} to notebook ${notebookId}`);

      // Add confirmation so we can see if user is actually clicking the button
      const answer = await ask(`Restore note to "${getNotebookName(notebookId)}" notebook?`, {
        title: 'Restore note',
        kind: 'warning',
      });
      if (!answer) {
        console.log("Restore canceled by user");
        return;
      }

      // CHANGE THIS LINE: Use noteId instead of note_id to match what the Rust function expects
      const params = { noteId: noteId };
      console.log("Sending params to restore_note:", params);

      // Call the Rust function
      await invoke("restore_note", params);

      // Log success
      console.log("Backend restore_note call succeeded");

      // Refresh the trash list
      await loadDeletedNotes();

      // Reload the notebook's notes if the notebook is selected
      if (loadNotes && typeof loadNotes === 'function') {
        console.log(`Refreshing notes for notebook ${notebookId}`);
        await loadNotes(notebookId);
      } else {
        console.warn("loadNotes function is not available or not a function", loadNotes);
      }

      console.log("Note restored successfully");
    } catch (error) {
      console.error("Failed to restore note:", error);
      setRestoreError(`Error: ${error.toString()}`);
    }
  };

  const handlePermanentDelete = async (noteId) => {
    const answer = await ask('Permanently delete this note? This action cannot be undone.', {
      title: 'Permanent deletion',
      kind: 'warning',
    });
    if (answer) {
      try {
        await invoke("permanently_delete_note", { noteId: noteId });
        await loadDeletedNotes(); // Refresh list after deletion
      } catch (error) {
        console.error("Failed to permanently delete note:", error);
      }
    }
  };

  const handleEmptyTrash = async () => {
    const answer = await ask("Empty trash? This will permanently delete all notes in the trash.", {
      title: 'Empty the trash',
      kind: 'warning',
    });
    if (answer) {
      try {
        for (const note of deletedNotes) {
          await invoke("permanently_delete_note", { noteId: note.id });
        }
        setDeletedNotes([]);
      } catch (error) {
        console.error("Failed to empty trash:", error);
      }
    }
  };

  return (
    <div className="mt-6 border-t border-gray-700 pt-4">
      <div
        className="flex items-center px-2 py-1 text-gray-300 hover:bg-gray-700 rounded cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
        <span>Trash</span>
        <span className="ml-2 text-xs text-gray-500">({deletedNotes.length})</span>
        {isOpen ? (
          <svg className="w-4 h-4 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        ) : (
          <svg className="w-4 h-4 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        )}
      </div>

      {isOpen && (
        <div className="mt-2">
          {restoreError && (
            <div className="p-2 text-red-400 text-sm bg-red-900/20 rounded mb-2">
              {restoreError}
            </div>
          )}

          {deletedNotes.length > 0 ? (
            <>
              <div className="flex justify-end px-2 py-1">
                <button
                  onClick={handleEmptyTrash}
                  className="text-xs text-red-400 hover:text-red-500"
                >
                  Empty Trash
                </button>
              </div>
              <ul className="space-y-1">
                {deletedNotes.map((note) => (
                  <li
                    key={note.id}
                    className="flex flex-col px-2 py-1 text-gray-300 hover:bg-gray-700 rounded group"
                  >
                    <div className="flex items-center w-full">
                      <span className="truncate flex-1">{note.title || "Sans titre"}</span>
                      <button
                        onClick={() => handleRestore(note.id, note.notebook_id)}
                        className="text-green-400 hover:text-green-500 ml-2 p-1 rounded hover:bg-green-900/20"
                        title={`Restore to ${getNotebookName(note.notebook_id)}`}
                      >
                        <span role="img" aria-label="Restore">↩️</span>
                      </button>
                      <button
                        onClick={() => handlePermanentDelete(note.id)}
                        className="text-red-400 hover:text-red-500 ml-2 p-1 rounded hover:bg-red-900/20"
                        title="Delete permanently"
                      >
                        <span role="img" aria-label="Delete">🗑️</span>
                      </button>
                    </div>
                    <div className="text-xs text-gray-500">
                      From: {getNotebookName(note.notebook_id)}
                    </div>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <div className="px-2 py-1 text-gray-400 text-sm">Trash is empty</div>
          )}
        </div>
      )}
    </div>
  );
};

export default TrashBin;
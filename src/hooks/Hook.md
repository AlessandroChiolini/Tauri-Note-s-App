# Hook Documentation

The useNotebooks.js file exports a custom React hook called useNotebooks that centralizes state management and API calls related to notebooks and notes. This hook is used throughout the application (and integrated into the AppContext) to fetch, create, update, delete, and sort notebooks and notes.

# Overview
The hook maintains several pieces of state:

- notebooks: The list of available notebooks.
  
- allNotes & notes: allNotes stores the full list of notes for a selected notebook while notes holds either this full list or a filtered list for display.

- selectedNotebook & selectedNote: Keep track of the currently selected notebook and note.

- showCreateNoteModal, searchQuery, sortDirection: Manage UI state for note creation, search functionality, and sort order.
  
The hook also exposes functions that interact with backend APIs (using functions from ../services/api) for CRUD operations on notebooks and notes.

Key Functionalities

# 1. Fetching Data

## 1.1 fetchNotebooks:

Fetches the list of notebooks from the backend and updates the notebooks state.

```javascript
const fetchNotebooks = async () => {
  try {
    const data = await getNotebooks();
    setNotebooks(data);
  } catch (error) {
    console.error("Error fetching notebooks:", error);
  }
};
```
## 1.2 fetchNotes:

Fetches notes for a given notebook. It filters the notes based on the current search query and updates both allNotes and notes.

```javascript
const fetchNotes = async (notebookId, clearSelection = true) => {
  setSelectedNotebook(notebookId);
  if (clearSelection) {
    setSelectedNote(null);
  }
  try {
    const data = await getNotes(notebookId);
    setAllNotes(data);
    if (searchQuery) {
      setNotes(data.filter((note) =>
        note.title.toLowerCase().includes(searchQuery.toLowerCase())
      ));
    } else {
      setNotes(data);
    }
  } catch (error) {
    console.error("Error fetching notes:", error);
  }
};
```
# 2. Creating New Entries

## 2.1 addNotebook:

Adds a new notebook by calling the backend and then refreshes the notebooks list.

```javascript
const addNotebook = async (title) => {
  try {
    await createNotebook(title);
    fetchNotebooks();
  } catch (error) {
    console.error("Error creating notebook:", error);
  }
};
```
## 2.2 addNote

Creates a new note for the currently selected notebook and then refreshes the list of notes.

```javascript
const addNote = async (title) => {
  if (!selectedNotebook) return;
  try {
    await createNote(selectedNotebook, title);
    setShowCreateNoteModal(false);
    await fetchNotes(selectedNotebook);
  } catch (error) {
    console.error("Error creating note:", error);
  }
};
```
## 2.3 createEmptyNote

Creates an empty note and selects it. It refreshes the notes list without clearing the current selection.

```javascript
const createEmptyNote = async () => {
  if (!selectedNotebook) return;
  try {
    const newNote = await createNote(selectedNotebook, "");
    setShowCreateNoteModal(false);
    await fetchNotes(selectedNotebook, false);
    setSelectedNote(newNote.id);
  } catch (error) {
    console.error("Error creating empty note:", error);
  }
};
```
# 3. Selecting and Updating

## 3.1 selectNotebook & selectNote:

Allow selection of a notebook or note. Choosing a notebook triggers fetchNotes to load its notes.

```javascript
const selectNotebook = (notebookId) => {
  setSelectedNotebook(notebookId);
  fetchNotes(notebookId);
};

const selectNote = (noteId) => {
  setSelectedNote(noteId);
};
```

## 3.2 updateNoteTitle

Sends the updated title to the backend and updates the local state with the new title and timestamp.

```javascript
const updateNoteTitle = async (noteId, newTitle) => {
  try {
    await updateNoteTitleAPI(noteId, newTitle);
    const currentTime = new Date().toISOString();
    // Update both allNotes and notes arrays with the new title and timestamp.
  } catch (error) {
    console.error("Error updating note title:", error);
  }
};
```

## 3.3 updateNoteContent

Sends the updated content to the backend and updates the note with the new content and timestamp.

```javascript
const updateNoteContent = async (noteId, newContent) => {
  try {
    await updateNoteContentAPI(noteId, newContent);
    const currentTime = new Date().toISOString();
    setAllNotes((prevNotes) =>
      prevNotes.map((note) =>
        note.id === noteId
          ? { ...note, content: newContent, updated_at: currentTime }
          : note
      )
    );
    setNotes((prevNotes) =>
      prevNotes.map((note) =>
        note.id === noteId
          ? { ...note, content: newContent, updated_at: currentTime }
          : note
      )
    );
  } catch (error) {
    console.error("Error updating note content:", error);
  }
};
```

# 4. Deleting

## 4.1 deleteNotebook

Deletes a notebook by calling the backend. It also updates the state to remove the notebook and clears notes if the deleted notebook was selected.

```javascript
const deleteNotebook = async (notebookId) => {
  try {
    await deleteNotebookAPI(notebookId);
    setNotebooks((prev) => prev.filter((nb) => nb.id !== notebookId));
    if (selectedNotebook === notebookId) {
      setSelectedNotebook(null);
      setNotes([]);
      setAllNotes([]);
    }
  } catch (error) {
    console.error("Error deleting notebook:", error);
  }
};
```
## 4.2 deleteNote

Deletes a note and updates the state by filtering it out from the displayed notes.

```javascript
const deleteNote = async (noteId) => {
  try {
    await deleteNoteAPI(noteId);
    setNotes((prevNotes) => prevNotes.filter((note) => note.id !== noteId));
  } catch (error) {
    console.error("Error deleting note:", error);
  }
};
```

# 5. Sorting

## 5.1 sortNotes

A general sorting function that delegates sorting by a specified field.

```javascript
const sortNotes = (sortBy = 'title') => {
  if (sortBy === 'title') {
    sortNotesByTitle();
  } else if (sortBy === 'created_at' || sortBy === 'updated_at') {
    sortNotesByDate(sortBy);
  }
};
```

## 5.2 sortNotesByTitle

Sorts the notes alphabetically based on their title. It toggles the sorting direction after each call.

```javascript
const sortNotesByTitle = () => {
  const sortedNotes = [...notes].sort((a, b) => {
    const titleA = (a.title || "").toLowerCase();
    const titleB = (b.title || "").toLowerCase();
    return sortDirection * titleA.localeCompare(titleB);
  });
  setNotes(sortedNotes);
  setSortDirection(sortDirection * -1);
};
```
## 5.3 sortNotesByDate

Sorts the notes based on a date field (either created_at or updated_at) in either ascending or descending order.

```javascript
const sortNotesByDate = (dateField) => {
  const sortedNotes = [...notes].sort((a, b) => {
    const dateA = new Date(a[dateField]);
    const dateB = new Date(b[dateField]);
    return sortDirection * (dateB - dateA);
  });
  setNotes(sortedNotes);
  setSortDirection(sortDirection * -1);
};
```

# 6. Searching

## 6.1 searchNotes:

Filters the notes based on a search query by updating the displayed notes without altering the original allNotes list.

```javascript
const searchNotes = (query) => {
  setSearchQuery(query);
  if (!query) {
    setNotes(allNotes);
  } else {
    const filtered = allNotes.filter((note) =>
      note.title.toLowerCase().includes(query.toLowerCase())
    );
    setNotes(filtered);
  }
};
```

# 7. Lifecycle

## 7.1 useEffect:

On initial render, the hook fetches the list of notebooks. Additional functions update state in response to user actions (like creating or selecting notebooks/notes).

```javascript
useEffect(() => {
  fetchNotebooks();
}, []);
```

Each snippet above represents the core implementation found in useNotebooks.js. This detailed documentation with code examples will help developers understand and use the hook effectively.
# AppContext Documentation

The AppContext is used to share state and functionality related to notebooks and notes across the application. It integrates the data and methods from the custom useNotebooks hook, and adds additional functions (like deleteNote and saveImage) to handle note deletion and image saving respectively.

# 1. Integration with useNotebooks Hook

The AppContext leverages the useNotebooks hook for fetching and managing notebooks and notes data:

```jsx
// Extract from AppContext.jsx
const notebooksData = useNotebooks();
```

## 1.1 deleteNote Function

The deleteNote function enables soft-deleting a note by calling the backend using Tauri's invoke. After a successful deletion, it updates the current UI state by filtering out the deleted note.

```javascript
// Extract from AppContext.jsx
const deleteNote = useCallback(async (noteId) => {
    try {
        // Call backend to mark the note as deleted
        await invoke("delete_note", { noteId });
      
        // Update local state by removing the note
        const { notes, setNotes } = notebooksData;
        if (notes && setNotes) {
            setNotes(notes.filter(note => note.id !== noteId));
        }
    } catch (error) {
        console.error("Failed to delete note:", error);
    }
}, [notebooksData]);
```

## 1.2 saveImage Function

The saveImage function handles image uploads. It sends image data to the backend and returns the generated image ID, which can later be used to display the image.

```javascript
// Extract from AppContext.jsx
const saveImage = useCallback(async (noteId, imageData, filename, mimeType) => {
    console.log("Saving image:", { noteId, size: imageData.length, filename, type: mimeType });
    try {
        const imageId = await saveImageAPI(noteId, imageData, filename, mimeType);
        console.log("Image saved successfully:", imageId);
        return imageId;
    } catch (error) {
        console.error("Failed to save image:", error);
        throw error;
    }
}, []);
```

## 1.3 Combined Context Value

The context value combines all the values provided by useNotebooks with the extra functions (deleteNote and saveImage) and makes them available to any component that consumes this context.

```javascript
// Extract from AppContext.jsx
const contextValue = useMemo(() => {
    return { 
        ...notebooksData,
        deleteNote,
        saveImage,
    };
}, [notebooksData, deleteNote, saveImage]);
```

# 2. Usage in the Application

Wrap your application's root component with the AppProvider so that the context data and functions are available globally:

```javascript
// Example usage in App.jsx
import React from 'react';
import { AppProvider } from './contexts/AppContext';
import Main from './Main';

const App = () => (
  <AppProvider>
    <Main />
  </AppProvider>
);

export default App;
```

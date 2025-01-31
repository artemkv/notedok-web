import { AppCommand, DoNothing } from "./commands";
import {
  CreateNewNoteWithText,
  CreateNewNoteWithTitle,
  RenameNoteFromTitle,
  SaveNoteText,
} from "./commands/storage";
import { getTitleFromPath } from "./conversion";
import {
  NoteLoaded,
  NoteListState,
  NoteListFileListRetrieved,
  NoteType,
  NoteNotLoaded,
  NoteTextEditorEditingRegularNote,
  NoteTitleEditorEditingRegularNote,
  NoteTextEditorEditingTemplateNote,
  NoteTitleEditorEditingTemplateNote,
  NoteTextEditor,
  NoteTextEditorState,
  NoteTitleEditor,
  AppState,
  NoteTitleEditorState,
  NoteList,
} from "./model";

export const NOTES_ON_PAGE = 5;

export const shiftNotesToLoad = (
  noteList: NoteListFileListRetrieved,
  notesToShift: number
): [NoteListFileListRetrieved, Array<NoteNotLoaded>] => {
  // Shortcuts to inner props
  const unprocessedFiles = noteList.unprocessedFiles;
  const renderingQueue = noteList.renderingQueue;

  // Adjust the amount of notes to shift in case not enough notes
  if (unprocessedFiles.length < notesToShift) {
    notesToShift = unprocessedFiles.length;
  }

  // Split out the files for the notes to load
  const filesToLoad = unprocessedFiles.slice(0, notesToShift);
  const filesRemaining = unprocessedFiles.slice(
    notesToShift,
    unprocessedFiles.length
  );

  // Prepare the dummy notes that need to be loaded
  const notesToLoad = filesToLoad.map((path, idx) => {
    return createNoteNotLoaded(noteList.lastUsedNoteId + idx, path);
  });

  // Put on a rendering queue to keep track of the order
  const newRenderingQueue = [...renderingQueue, ...notesToLoad];

  // New state
  const newNoteList: NoteListFileListRetrieved = {
    state: NoteListState.FileListRetrieved,
    fileListVersion: noteList.fileListVersion,
    unprocessedFiles: filesRemaining,
    lastUsedNoteId: noteList.lastUsedNoteId + notesToShift,
    renderingQueue: newRenderingQueue,
    notes: noteList.notes,
  };

  return [newNoteList, notesToLoad];
};

export const handleLoadedNode = (
  noteList: NoteListFileListRetrieved,
  note: NoteLoaded
): NoteListFileListRetrieved => {
  // Shortcuts to inner props
  const queue = noteList.renderingQueue;

  // Update the note on the queue with the loaded one
  const newQueue = queue.map((n) => (n.id === note.id ? note : n));

  // Find out which notes can already be rendered
  const readyNotes: Array<NoteLoaded> = [];
  let fisrtNotReadyNoteIdx = 0;
  while (
    fisrtNotReadyNoteIdx < newQueue.length &&
    newQueue[fisrtNotReadyNoteIdx].type === NoteType.Loaded
  ) {
    const note = newQueue[fisrtNotReadyNoteIdx];
    if (note.type === NoteType.Loaded) {
      readyNotes.push(note);
    }
    fisrtNotReadyNoteIdx++;
  }

  // Cut out the notes that are not ready
  const notReadyNotes = newQueue.slice(fisrtNotReadyNoteIdx, newQueue.length);

  // Now ready to be shown
  const newNotes = [...noteList.notes, ...readyNotes];

  // New state
  const newNoteList: NoteListFileListRetrieved = {
    state: NoteListState.FileListRetrieved,
    fileListVersion: noteList.fileListVersion,
    unprocessedFiles: noteList.unprocessedFiles,
    lastUsedNoteId: noteList.lastUsedNoteId,
    renderingQueue: notReadyNotes,
    notes: newNotes,
  };

  return newNoteList;
};

export const finishNoteTitleEditing = (
  noteList: NoteListFileListRetrieved,
  noteTitleEditor: NoteTitleEditorEditingRegularNote
): [NoteListFileListRetrieved, AppCommand] => {
  // Shortcuts to inner props
  const note = noteTitleEditor.note;
  const newTitle = noteTitleEditor.text;

  // Only save if the title has actually changed
  if (newTitle === note.title) {
    return [noteList, DoNothing];
  }

  // New note with updated title
  const newNote = {
    ...note,
    title: newTitle,
  };

  // Update the note list with the updated one
  const newNotes = noteList.notes.map((n) => (n.id === note.id ? newNote : n));

  // New state
  const newNoteList: NoteListFileListRetrieved = {
    ...noteList,
    notes: newNotes,
  };

  // TODO: is async, just like in the older version, but in the future I could add saving indicators
  const command = RenameNoteFromTitle(newNote);

  return [newNoteList, command];
};

export const finishNoteTextEditing = (
  noteList: NoteListFileListRetrieved,
  noteTextEditor: NoteTextEditorEditingRegularNote
): [NoteListFileListRetrieved, AppCommand] => {
  // Shortcuts to inner props
  const note = noteTextEditor.note;
  const newText = noteTextEditor.text;

  // Only save if the text has actually changed
  if (newText === note.text) {
    return [noteList, DoNothing];
  }

  // New note with updated text
  const newNote = {
    ...note,
    text: newText,
  };

  // Update the note list with the updated one
  const newNotes = noteList.notes.map((n) => (n.id === note.id ? newNote : n));

  // New state
  const newNoteList: NoteListFileListRetrieved = {
    ...noteList,
    notes: newNotes,
  };

  // TODO: is async, just like in the older version, but in the future I could add saving indicators
  const command = SaveNoteText(newNote);

  return [newNoteList, command];
};

export const convertToRegularNoteOnTitleUpdated = (
  noteList: NoteListFileListRetrieved,
  noteTitleEditor: NoteTitleEditorEditingTemplateNote
): [NoteListFileListRetrieved, NoteTextEditor, AppCommand] => {
  // Shortcuts to inner props
  const newTitle = noteTitleEditor.text;

  // Only save if the title is not empty
  if (newTitle === "") {
    return [
      noteList,
      {
        state: NoteTextEditorState.NotActive,
      },
      DoNothing,
    ];
  }

  // Initialize new note
  const newNote = createNewNoteLoaded(
    noteList.lastUsedNoteId + 1,
    newTitle,
    ""
  );

  // Update the note list with the updated one
  const newNotes = [newNote, ...noteList.notes];

  // New note list
  const newNoteList: NoteListFileListRetrieved = {
    ...noteList,
    notes: newNotes,
    lastUsedNoteId: noteList.lastUsedNoteId + 1,
  };

  // New text editor
  const newTextEditor = {
    state: NoteTextEditorState.EditingRegularNote,
    note: newNote,
    text: newNote.text,
  };

  // TODO: is async, just like in the older version, but in the future I could add saving indicators
  const command = CreateNewNoteWithTitle(newNote);

  return [newNoteList, newTextEditor, command];
};

export const convertToRegularNoteOnTextUpdated = (
  noteList: NoteListFileListRetrieved,
  noteTextEditor: NoteTextEditorEditingTemplateNote
): [NoteListFileListRetrieved, AppCommand] => {
  // Shortcuts to inner props
  const newText = noteTextEditor.text;

  // Only save if the text is not empty
  if (newText === "") {
    return [noteList, DoNothing];
  }

  // Initialize new note
  const newNote = createNewNoteLoaded(noteList.lastUsedNoteId + 1, "", newText);

  // Update the note list with the updated one
  const newNotes = [newNote, ...noteList.notes];

  // New state
  const newNoteList: NoteListFileListRetrieved = {
    ...noteList,
    notes: newNotes,
    lastUsedNoteId: noteList.lastUsedNoteId + 1,
  };

  // TODO: is async, just like in the older version, but in the future I could add saving indicators
  const command = CreateNewNoteWithText(newNote);

  return [newNoteList, command];
};

export const updateNotePath = (
  state: AppState,
  note: NoteLoaded,
  newPath: string
): [NoteList, NoteTitleEditor, NoteTextEditor] => {
  const noteTitleEditor = state.noteTitleEditor;
  const noteTextEditor = state.noteTextEditor;
  const noteList = state.noteList;

  if (noteList.state === NoteListState.FileListRetrieved) {
    // New note with updated text
    const newNote = {
      ...note,
      path: newPath,
    };

    // Update the note list with the updated one
    const newNotes = noteList.notes.map((n) =>
      n.id === note.id ? newNote : n
    ); // TODO: time to move to helper method?

    // New state
    const newNoteList: NoteListFileListRetrieved = {
      ...noteList,
      notes: newNotes,
    };

    let newNoteTextEditor = noteTextEditor;
    if (noteTextEditor.state === NoteTextEditorState.EditingRegularNote) {
      if (noteTextEditor.note === note) {
        newNoteTextEditor = {
          ...noteTextEditor,
          note: newNote,
        };
      }
    }

    let newNoteTitleEditor = noteTitleEditor;
    if (noteTitleEditor.state === NoteTitleEditorState.EditingRegularNote) {
      if (noteTitleEditor.note === note) {
        newNoteTitleEditor = {
          ...noteTitleEditor,
          note: newNote,
        };
      }
    }

    return [newNoteList, newNoteTitleEditor, newNoteTextEditor];
  }

  return [noteList, noteTitleEditor, noteTextEditor];
};

export const deleteNote = (
  noteList: NoteListFileListRetrieved,
  note: NoteLoaded
): [NoteListFileListRetrieved, Array<NoteNotLoaded>] => {
  // New note as deleted
  const newNote = {
    ...note,
    isDeleted: true,
  };

  // Update the note list with the updated one
  const newNotes = noteList.notes
    .filter((n) => !n.isDeleted) // delete all already deleted notes from UI
    .map((n) => (n.id === note.id ? newNote : n));

  // Load and render one more note from the list (if exists),
  // so the number of displayed notes stays the same
  const [noteListShifted, notesToLoad] = shiftNotesToLoad(noteList, 1);

  // New state
  const newNoteList: NoteListFileListRetrieved = {
    ...noteListShifted,
    notes: newNotes,
  };

  return [newNoteList, notesToLoad];
};

export const restoreNote = (
  noteList: NoteListFileListRetrieved,
  note: NoteLoaded
): NoteListFileListRetrieved => {
  // Undelete the note
  const newNote = {
    ...note,
    isDeleted: false,
  };

  // Update the note list with the updated note
  const newNotes = noteList.notes.map((n) => (n.id === note.id ? newNote : n));

  // New state
  const newNoteList: NoteListFileListRetrieved = {
    ...noteList,
    notes: newNotes,
  };

  return newNoteList;
};

export const createNoteNotLoaded = (
  id: number,
  path: string
): NoteNotLoaded => {
  return {
    type: NoteType.NotLoaded,
    id: "note_" + id.toString(),
    path,
  };
};

export const convertToNoteLoaded = (
  note: NoteNotLoaded,
  text: string
): NoteLoaded => {
  return {
    type: NoteType.Loaded,
    id: note.id,
    path: note.path,
    title: getTitleFromPath(note.path),
    text,
    isDeleted: false,
  };
};

export const createNewNoteLoaded = (
  id: number,
  title: string,
  text: string
): NoteLoaded => {
  return {
    type: NoteType.Loaded,
    id: "note_" + id.toString(),
    path: "",
    title,
    text,
    isDeleted: false,
  };
};

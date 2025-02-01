import { AppCommand, DoNothing } from "./commands";
import {
  CreateNewNoteWithText,
  CreateNewNoteWithTitle,
  RenameNoteFromTitle,
  SaveNoteText,
} from "./commands/storage";
import {
  NoteListState,
  NoteListFileListRetrieved,
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
  NoteRef,
  NoteSynced,
  NoteVisible,
  isVisible,
  NoteState,
  NoteTextSaveable,
  NoteTitleSaveable,
  NoteSyncing,
  NotePendingPathUpdate,
  NoteDeleted,
  NoteDeletable,
  Note,
  NoteOutOfSync,
} from "./model";
import {
  createNewNoteFromText,
  createNewNoteFromTitle,
  createNewNoteRef,
  noteCreatingFromTextToOutOfSync,
  noteCreatingFromTextToSynced,
  noteCreatingFromTitleToOutOfSync,
  noteCreatingFromTitleToSynced,
  noteDeletedToSyncing,
  noteOutOfSyncToDeleted,
  noteOutOfSyncToSyncing,
  noteRefToSynced,
  noteSyncedToDeleted,
  noteSyncedToSyncing,
  noteSyncingToOutOfSync,
  noteSyncingToSynced,
  noteSyncingToSyncedWithNewPath,
} from "./noteLifecycle";

export const NOTES_ON_PAGE = 5;

export const shiftNotesToLoad = (
  noteList: NoteListFileListRetrieved,
  notesToShift: number
): [NoteListFileListRetrieved, NoteRef[]] => {
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
    return createNewNoteRef(noteList.lastUsedNoteId + idx, path);
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

export const handleLoadedNote = (
  noteList: NoteListFileListRetrieved,
  note: NoteRef,
  text: string
): NoteListFileListRetrieved => {
  // Shortcuts to inner props
  const queue = noteList.renderingQueue;

  // Create a new note
  const newNote = noteRefToSynced(note, text);

  // Update the note on the queue with the loaded one
  const newQueue = replaceOnQueue(queue, newNote);

  // Find out which notes are ready to be shown
  // (I.e. all the notes visible notes at the beginning of the rendering queue)
  const readyNotes: NoteVisible[] = [];
  let firstNotReadyNoteIdx = 0;
  while (firstNotReadyNoteIdx < newQueue.length) {
    if (isVisible(newQueue[firstNotReadyNoteIdx])) {
      const note: NoteVisible = newQueue[firstNotReadyNoteIdx] as NoteVisible;
      readyNotes.push(note);
      firstNotReadyNoteIdx++;
    } else {
      break;
    }
  }

  // Cut out the notes that are not ready
  const notReadyNotes = newQueue.slice(firstNotReadyNoteIdx, newQueue.length);

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
  note: NoteTitleSaveable,
  noteTitleEditor: NoteTitleEditorEditingRegularNote
): [NoteListFileListRetrieved, AppCommand] => {
  // Shortcuts to inner props
  const newTitle = noteTitleEditor.text;

  // Only save if the title has actually changed
  if (newTitle === note.title) {
    return [noteList, DoNothing];
  }

  const newNote = noteTitleSaveableToSyncing(note, newTitle);
  const newNoteList = replaceNote(noteList, newNote);
  const command = RenameNoteFromTitle(newNote);
  return [newNoteList, command];
};

export const finishNoteTextEditing = (
  noteList: NoteListFileListRetrieved,
  note: NoteTextSaveable,
  noteTextEditor: NoteTextEditorEditingRegularNote
): [NoteListFileListRetrieved, AppCommand] => {
  // Shortcuts to inner props
  const newText = noteTextEditor.text;

  // Only save if the text has actually changed
  if (newText === note.text) {
    return [noteList, DoNothing];
  }

  const newNote = noteTextSaveableToSyncing(note, newText);
  const newNoteList = replaceNote(noteList, newNote);
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
  const newNote = createNewNoteFromTitle(noteList.lastUsedNoteId + 1, newTitle);

  // Update the note list with the new note
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
    text: "",
  };

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
  const newNote = createNewNoteFromText(noteList.lastUsedNoteId + 1, newText);

  // Update the note list with the new note
  const newNotes = [newNote, ...noteList.notes];

  // New state
  const newNoteList: NoteListFileListRetrieved = {
    ...noteList,
    notes: newNotes,
    lastUsedNoteId: noteList.lastUsedNoteId + 1,
  };

  const command = CreateNewNoteWithText(newNote);

  return [newNoteList, command];
};

export const updateNotePath = (
  state: AppState,
  note: NotePendingPathUpdate,
  newPath: string
): [NoteList, NoteTitleEditor, NoteTextEditor] => {
  const noteTitleEditor = state.noteTitleEditor;
  const noteTextEditor = state.noteTextEditor;
  const noteList = state.noteList;

  if (noteList.state === NoteListState.FileListRetrieved) {
    // New note with an updated path
    const newNote: NoteSynced = notePendingPathUpdateToSynced(note, newPath);
    const newNoteList = replaceNote(noteList, newNote);

    // Update editors to make sure they reference up-to-date note
    let newNoteTextEditor = noteTextEditor;
    if (noteTextEditor.state === NoteTextEditorState.EditingRegularNote) {
      if (noteTextEditor.note.id === note.id) {
        newNoteTextEditor = {
          ...noteTextEditor,
          note: newNote,
        };
      }
    }
    let newNoteTitleEditor = noteTitleEditor;
    if (noteTitleEditor.state === NoteTitleEditorState.EditingRegularNote) {
      if (noteTitleEditor.note.id === note.id) {
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

export const updateNoteAsSynced = (
  state: AppState,
  note: NoteSyncing
): [NoteList, NoteTitleEditor, NoteTextEditor] => {
  const noteTitleEditor = state.noteTitleEditor;
  const noteTextEditor = state.noteTextEditor;
  const noteList = state.noteList;

  if (noteList.state === NoteListState.FileListRetrieved) {
    // New note with the same path
    const newNote: NoteSynced = noteSyncingToSynced(note);
    const newNoteList = replaceNote(noteList, newNote);

    // Update editors to make sure they reference up-to-date note
    let newNoteTextEditor = noteTextEditor;
    if (noteTextEditor.state === NoteTextEditorState.EditingRegularNote) {
      if (noteTextEditor.note.id === note.id) {
        newNoteTextEditor = {
          ...noteTextEditor,
          note: newNote,
        };
      }
    }
    let newNoteTitleEditor = noteTitleEditor;
    if (noteTitleEditor.state === NoteTitleEditorState.EditingRegularNote) {
      if (noteTitleEditor.note.id === note.id) {
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

export const updateNoteAsOutOfSync = (
  state: AppState,
  note: NotePendingPathUpdate,
  path: string,
  err: string
): [NoteList, NoteTitleEditor, NoteTextEditor] => {
  const noteTitleEditor = state.noteTitleEditor;
  const noteTextEditor = state.noteTextEditor;
  const noteList = state.noteList;

  if (noteList.state === NoteListState.FileListRetrieved) {
    // New note with the same path
    const newNote: NoteOutOfSync = notePendingPathUpdateToOutOfSync(
      note,
      path,
      err
    );
    const newNoteList = replaceNote(noteList, newNote);

    // Update editors to make sure they reference up-to-date note
    let newNoteTextEditor = noteTextEditor;
    if (noteTextEditor.state === NoteTextEditorState.EditingRegularNote) {
      if (noteTextEditor.note.id === note.id) {
        newNoteTextEditor = {
          ...noteTextEditor,
          note: newNote,
        };
      }
    }
    let newNoteTitleEditor = noteTitleEditor;
    if (noteTitleEditor.state === NoteTitleEditorState.EditingRegularNote) {
      if (noteTitleEditor.note.id === note.id) {
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
  note: NoteDeletable
): [NoteListFileListRetrieved, NoteDeleted, NoteRef[]] => {
  // New note as deleted
  const newNote = noteDeletableToDeleted(note);

  // delete all already deleted notes from UI and update the note list
  const newNotes = noteList.notes
    .filter((n) => !(n.state === NoteState.Deleted))
    .map((n) => (n.id === newNote.id ? newNote : n));

  // Load and render one more note from the list (if exists),
  // so the number of displayed notes stays the same
  const [noteListShifted, notesToLoad] = shiftNotesToLoad(noteList, 1);

  // New state
  const newNoteList: NoteListFileListRetrieved = {
    ...noteListShifted,
    notes: newNotes,
  };

  return [newNoteList, newNote, notesToLoad];
};

export const restoreNote = (
  noteList: NoteListFileListRetrieved,
  note: NoteDeleted
): [NoteListFileListRetrieved, NoteSyncing] => {
  // Undelete the note
  const newNote = noteDeletedToSyncing(note);
  const newNoteList = replaceNote(noteList, newNote);

  return [newNoteList, newNote];
};

const replaceOnQueue = (queue: Note[], note: Note): Note[] => {
  return queue.map((n) => (n.id === note.id ? note : n));
};

const replaceNote = (
  noteList: NoteListFileListRetrieved,
  note: NoteVisible
): NoteListFileListRetrieved => {
  return {
    ...noteList,
    notes: noteList.notes.map((n) => (n.id === note.id ? note : n)),
  };
};

const noteTitleSaveableToSyncing = (
  note: NoteTitleSaveable,
  newTitle: string
): NoteSyncing => {
  if (note.state === NoteState.Synced) {
    return {
      ...noteSyncedToSyncing(note),
      title: newTitle,
    };
  }
  if (note.state === NoteState.OutOfSync) {
    return {
      ...noteOutOfSyncToSyncing(note),
      title: newTitle,
    };
  }
  throw new Error("Impossible");
};

const noteTextSaveableToSyncing = (
  note: NoteTextSaveable,
  newText: string
): NoteSyncing => {
  if (note.state === NoteState.Synced) {
    return {
      ...noteSyncedToSyncing(note),
      text: newText,
    };
  }
  if (note.state === NoteState.OutOfSync) {
    return {
      ...noteOutOfSyncToSyncing(note),
      text: newText,
    };
  }
  throw new Error("Impossible");
};

const notePendingPathUpdateToSynced = (
  note: NotePendingPathUpdate,
  newPath: string
): NoteSynced => {
  if (note.state === NoteState.Syncing) {
    return noteSyncingToSyncedWithNewPath(note, newPath);
  }
  if (note.state === NoteState.CreatingFromTitle) {
    return noteCreatingFromTitleToSynced(note, newPath);
  }
  if (note.state === NoteState.CreatingFromText) {
    return noteCreatingFromTextToSynced(note, newPath);
  }
  throw new Error("Impossible");
};

const notePendingPathUpdateToOutOfSync = (
  note: NotePendingPathUpdate,
  path: string,
  err: string
): NoteOutOfSync => {
  if (note.state === NoteState.Syncing) {
    return noteSyncingToOutOfSync(note, err);
  }
  if (note.state === NoteState.CreatingFromTitle) {
    return noteCreatingFromTitleToOutOfSync(note, path, err);
  }
  if (note.state === NoteState.CreatingFromText) {
    return noteCreatingFromTextToOutOfSync(note, path, err);
  }
  throw new Error("Impossible");
};

export const noteDeletableToDeleted = (note: NoteDeletable) => {
  if (note.state === NoteState.Synced) {
    return noteSyncedToDeleted(note);
  }
  if (note.state === NoteState.OutOfSync) {
    return noteOutOfSyncToDeleted(note);
  }
  throw new Error("Impossible");
};

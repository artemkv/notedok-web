import { AppCommand, DoNothing } from "./commands";
import { RenameNote, SaveNoteText } from "./commands/storage";
import { getTitleFromPath } from "./conversion";
import {
  NoteLoaded,
  NoteListState,
  NoteListFileListRetrieved,
  NoteType,
  NoteNotLoaded,
  NoteTextEditorEditingRegularNote,
  NoteTitleEditorEditingRegularNote,
} from "./model";

const NOTES_ON_PAGE = 5;

export const shiftNotesToLoadForNextPage = (
  noteList: NoteListFileListRetrieved
): [NoteListFileListRetrieved, Array<NoteNotLoaded>] => {
  let pageSize = NOTES_ON_PAGE;

  // Shortcuts to inner props
  const unprocessedFiles = noteList.unprocessedFiles;
  const renderingQueue = noteList.renderingQueue;

  // Detect an actual page size
  if (unprocessedFiles.length < pageSize) {
    pageSize = unprocessedFiles.length;
  }

  // Split out the files for the first page
  const filesToLoad = unprocessedFiles.slice(0, pageSize);
  const filesRemaining = unprocessedFiles.slice(
    pageSize,
    unprocessedFiles.length
  );

  // Prepare the dummy notes that need to be loaded
  const notesToLoad = filesToLoad.map((path, idx) => {
    return createNoteNotLoaded(noteList.lastUsedNoteId + idx, path);
  });

  // Keep track of the order
  const newRenderingQueue = [...renderingQueue, ...notesToLoad];

  // New state
  const newNoteList: NoteListFileListRetrieved = {
    state: NoteListState.FileListRetrieved,
    fileListVersion: noteList.fileListVersion,
    unprocessedFiles: filesRemaining,
    lastUsedNoteId: noteList.lastUsedNoteId + pageSize,
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

  // New note with updated text
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
  const command = RenameNote(noteTitleEditor.note, noteTitleEditor.text);

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
  const command = SaveNoteText(noteTextEditor.note, noteTextEditor.text);

  return [newNoteList, command];
};

export const createNoteNotLoaded = (
  id: number,
  path: string
): NoteNotLoaded => {
  const note: NoteNotLoaded = {
    type: NoteType.NotLoaded,
    id: "note_" + id.toString(),
    path,
    title: getTitleFromPath(path),
  };

  return note;
};

export const convertToNoteLoaded = (
  note: NoteNotLoaded,
  text: string
): NoteLoaded => {
  const NoteLoaded: NoteLoaded = {
    type: NoteType.Loaded,
    id: note.id,
    path: note.path,
    title: note.title,
    text,
  };

  return NoteLoaded;
};

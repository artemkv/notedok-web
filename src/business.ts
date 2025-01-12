import { getTitleFromPath } from "./conversion";
import {
  NoteLoaded,
  NoteListState,
  NoteListFileListRetrieved,
  NoteType,
  NoteNotLoaded,
} from "./model";

const NOTES_ON_PAGE = 5;

export const shiftNotesToLoadForNextPage = (
  noteListState: NoteListFileListRetrieved
): [NoteListFileListRetrieved, Array<NoteNotLoaded>] => {
  let pageSize = NOTES_ON_PAGE;

  // Shortcuts to inner props
  const unprocessedFiles = noteListState.unprocessedFiles;
  const renderingQueue = noteListState.renderingQueue;

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
    return createNoteNotLoaded(noteListState.lastUsedNoteId + idx, path);
  });

  // Keep track of the order
  const newRenderingQueue = [...renderingQueue, ...notesToLoad];

  // New state
  const newNoteListState: NoteListFileListRetrieved = {
    state: NoteListState.FileListRetrieved,
    fileListVersion: noteListState.fileListVersion,
    unprocessedFiles: filesRemaining,
    lastUsedNoteId: noteListState.lastUsedNoteId + pageSize,
    renderingQueue: newRenderingQueue,
    notes: noteListState.notes,
  };

  return [newNoteListState, notesToLoad];
};

export const handleLoadedNode = (
  noteListState: NoteListFileListRetrieved,
  note: NoteLoaded
): NoteListFileListRetrieved => {
  // Shortcuts to inner props
  const queue = noteListState.renderingQueue;

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
  const newNotes = [...noteListState.notes, ...readyNotes];

  // New state
  const newNoteListState: NoteListFileListRetrieved = {
    state: NoteListState.FileListRetrieved,
    fileListVersion: noteListState.fileListVersion,
    unprocessedFiles: noteListState.unprocessedFiles,
    lastUsedNoteId: noteListState.lastUsedNoteId,
    renderingQueue: notReadyNotes,
    notes: newNotes,
  };

  return newNoteListState;
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

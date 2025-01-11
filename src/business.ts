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
  const fileList = noteListState.unprocessedFiles.fileList;
  const renderingQueue = noteListState.renderingQueue;

  // Detect an actual page size
  if (fileList.length < pageSize) {
    pageSize = fileList.length;
  }

  // Split out the files for the first page
  const filesToLoad = fileList.slice(0, pageSize);
  const filesRemaining = fileList.slice(pageSize, fileList.length);

  // Prepare the dummy notes that need to be loaded
  const notesToLoad = filesToLoad.map((path, idx) => {
    return createNoteNotLoaded(noteListState.lastUsedNoteId + idx, path);
  });

  // Keep track of the order
  const newRenderingQueue = [...renderingQueue, ...notesToLoad];

  // New state
  const newNoteListState: NoteListFileListRetrieved = {
    state: NoteListState.FileListRetrieved,
    unprocessedFiles: {
      fileList: filesRemaining,
      fileListVersion: noteListState.unprocessedFiles.fileListVersion,
    },
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
  let readyIdx = 0;
  while (
    readyIdx < newQueue.length &&
    newQueue[readyIdx].type === NoteType.Loaded
  ) {
    const note = newQueue[readyIdx];
    if (note.type === NoteType.Loaded) {
      readyNotes.push(note);
    }
    readyIdx++;
  }

  // Cut out the notes that are not ready
  const notReadyNotes = newQueue.slice(readyIdx, newQueue.length);

  // New state
  const newNoteListState: NoteListFileListRetrieved = {
    state: NoteListState.FileListRetrieved,
    unprocessedFiles: noteListState.unprocessedFiles,
    lastUsedNoteId: noteListState.lastUsedNoteId,
    renderingQueue: notReadyNotes,
    notes: [...noteListState.notes, ...readyNotes],
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
    title: path, // TODO: titleToPathCoverter
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

import { Note, NoteListState, NoteListStateFileListRetrieved } from "./state";

const NOTES_ON_PAGE = 5;

export const shiftNotesToLoadForNextPage = (
  noteListState: NoteListStateFileListRetrieved
): [NoteListStateFileListRetrieved, Array<Note>] => {
  let pageSize = NOTES_ON_PAGE;

  const fileList = noteListState.unprocessedFiles.fileList;
  const renderingQueue = noteListState.renderingQueue.queue;

  if (fileList.length < pageSize) {
    pageSize = fileList.length;
  }

  const filesToLoad = fileList.slice(0, pageSize);
  const filesRemaining = fileList.slice(pageSize, fileList.length);

  const notesToLoad = filesToLoad.map((path, idx) => {
    return createNote(noteListState.lastUsedNoteId + idx, path);
  });

  const newRenderingQueue = [...renderingQueue, ...notesToLoad];

  const newNoteListState: NoteListStateFileListRetrieved = {
    state: NoteListState.FileListRetrieved,
    unprocessedFiles: {
      fileList: filesRemaining,
      fileListVersion: noteListState.unprocessedFiles.fileListVersion,
    },
    lastUsedNoteId: noteListState.lastUsedNoteId + pageSize,
    renderingQueue: {
      queue: newRenderingQueue,
      readyNoteIds: noteListState.renderingQueue.readyNoteIds,
    },
    notes: noteListState.notes,
  };

  return [newNoteListState, notesToLoad];
};

export const handleLoadedNode = (
  noteListState: NoteListStateFileListRetrieved,
  note: Note
): NoteListStateFileListRetrieved => {
  const queue = noteListState.renderingQueue.queue;
  const readyNoteIds = noteListState.renderingQueue.readyNoteIds;

  const newQueue = queue.map((n) => (n.id === note.id ? note : n));
  const newReadyNoteIds = new Set<string>([...readyNoteIds, note.id]);

  let readyIdx = 0;
  while (
    readyIdx < newQueue.length &&
    newReadyNoteIds.has(newQueue[readyIdx].id)
  ) {
    newReadyNoteIds.delete(newQueue[readyIdx].id);
    readyIdx++;
  }

  const readyNotes = newQueue.slice(0, readyIdx);
  const notReadyNotes = newQueue.slice(readyIdx, newQueue.length);

  const newNoteListState: NoteListStateFileListRetrieved = {
    state: NoteListState.FileListRetrieved,
    unprocessedFiles: noteListState.unprocessedFiles,
    lastUsedNoteId: noteListState.lastUsedNoteId,
    renderingQueue: {
      queue: notReadyNotes,
      readyNoteIds: newReadyNoteIds,
    },
    notes: [...noteListState.notes, ...readyNotes],
  };

  return newNoteListState;
};

export const createNote = (id: number, path: string): Note => {
  const note = {
    id: "note_" + id.toString(),
    path,
    title: path, // TODO: titleToPathCoverter
    text: "",
  };

  return note;
};

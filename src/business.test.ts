import { test, expect } from "@jest/globals";
import { NoteListState, NoteListStateFileListRetrieved } from "./state";
import {
  createNote,
  handleLoadedNode,
  shiftNotesToLoadForNextPage,
} from "./business";

test("Test all notes are shifted to load when less notes than a default page size", () => {
  const noteListState: NoteListStateFileListRetrieved = {
    state: NoteListState.FileListRetrieved,
    unprocessedFiles: {
      fileList: ["file1.txt", "file2.txt", "file3.txt"],
      fileListVersion: 0,
    },
    lastUsedNoteId: 0,
    renderingQueue: {
      queue: [],
      readyNoteIds: new Set<string>(),
    },
    notes: [],
  };

  const [newNoteListState, notesToLoad] =
    shiftNotesToLoadForNextPage(noteListState);

  // TODO: check properly
  expect(newNoteListState.unprocessedFiles.fileList.length).toEqual(0);
  expect(notesToLoad.length).toEqual(3);
});

test("First 5 notes are shifted to load when more notes than a default page size", () => {
  const noteListState: NoteListStateFileListRetrieved = {
    state: NoteListState.FileListRetrieved,
    unprocessedFiles: {
      fileList: [
        "file1.txt",
        "file2.txt",
        "file3.txt",
        "file4.txt",
        "file5.txt",
        "file6.txt",
        "file7.txt",
      ],
      fileListVersion: 0,
    },
    lastUsedNoteId: 0,
    renderingQueue: {
      queue: [],
      readyNoteIds: new Set<string>(),
    },
    notes: [],
  };

  const [newNoteListState, notesToLoad] =
    shiftNotesToLoadForNextPage(noteListState);

  // TODO: check properly
  expect(newNoteListState.unprocessedFiles.fileList.length).toEqual(2);
  expect(notesToLoad.length).toEqual(5);
});

test("First note loaded first", () => {
  const noteListState: NoteListStateFileListRetrieved = {
    state: NoteListState.FileListRetrieved,
    unprocessedFiles: {
      fileList: ["file6.txt", "file7.txt"],
      fileListVersion: 0,
    },
    lastUsedNoteId: 4,
    renderingQueue: {
      queue: [
        createNote(0, "file1.txt"),
        createNote(1, "file2.txt"),
        createNote(2, "file3.txt"),
        createNote(3, "file4.txt"),
        createNote(4, "file5.txt"),
      ],
      readyNoteIds: new Set<string>(),
    },
    notes: [],
  };

  const loadedNote = createNote(0, "file1.txt");
  const newNoteListState = handleLoadedNode(noteListState, loadedNote);

  // TODO: check properly
  expect(newNoteListState.renderingQueue.queue.length).toEqual(4);
  expect(newNoteListState.notes.length).toEqual(1);
});

test("Second note loaded first", () => {
  const noteListState: NoteListStateFileListRetrieved = {
    state: NoteListState.FileListRetrieved,
    unprocessedFiles: {
      fileList: ["file6.txt", "file7.txt"],
      fileListVersion: 0,
    },
    lastUsedNoteId: 4,
    renderingQueue: {
      queue: [
        createNote(0, "file1.txt"),
        createNote(1, "file2.txt"),
        createNote(2, "file3.txt"),
        createNote(3, "file4.txt"),
        createNote(4, "file5.txt"),
      ],
      readyNoteIds: new Set<string>(),
    },
    notes: [],
  };

  const loadedNote = createNote(1, "file2.txt");
  const newNoteListState = handleLoadedNode(noteListState, loadedNote);

  // TODO: check properly
  expect(newNoteListState.renderingQueue.queue.length).toEqual(5);
  expect(newNoteListState.notes.length).toEqual(0);
});

test("First note loads after second note", () => {
  const noteListState: NoteListStateFileListRetrieved = {
    state: NoteListState.FileListRetrieved,
    unprocessedFiles: {
      fileList: ["file6.txt", "file7.txt"],
      fileListVersion: 0,
    },
    lastUsedNoteId: 4,
    renderingQueue: {
      queue: [
        createNote(0, "file1.txt"),
        createNote(1, "file2.txt"),
        createNote(2, "file3.txt"),
        createNote(3, "file4.txt"),
        createNote(4, "file5.txt"),
      ],
      readyNoteIds: new Set<string>(["note_1"]),
    },
    notes: [],
  };

  const loadedNote = createNote(0, "file1.txt");
  const newNoteListState = handleLoadedNode(noteListState, loadedNote);

  // TODO: check properly
  expect(newNoteListState.renderingQueue.queue.length).toEqual(3);
  expect(newNoteListState.notes.length).toEqual(2);
});

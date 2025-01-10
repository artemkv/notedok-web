import { test, expect } from "@jest/globals";
import { NoteListState, NoteListStateFileListRetrieved } from "./state";
import {
  convertToLoadedNote,
  createNotLoadedNote,
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
    renderingQueue: [],
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
    renderingQueue: [],
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
    renderingQueue: [
      createNotLoadedNote(0, "file1.txt"),
      createNotLoadedNote(1, "file2.txt"),
      createNotLoadedNote(2, "file3.txt"),
      createNotLoadedNote(3, "file4.txt"),
      createNotLoadedNote(4, "file5.txt"),
    ],
    notes: [],
  };

  const loadedNote = convertToLoadedNote(
    createNotLoadedNote(0, "file1.txt"),
    "text"
  );
  const newNoteListState = handleLoadedNode(noteListState, loadedNote);

  // TODO: check properly
  expect(newNoteListState.renderingQueue.length).toEqual(4);
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
    renderingQueue: [
      createNotLoadedNote(0, "file1.txt"),
      createNotLoadedNote(1, "file2.txt"),
      createNotLoadedNote(2, "file3.txt"),
      createNotLoadedNote(3, "file4.txt"),
      createNotLoadedNote(4, "file5.txt"),
    ],
    notes: [],
  };

  const loadedNote = convertToLoadedNote(
    createNotLoadedNote(1, "file2.txt"),
    "text"
  );
  const newNoteListState = handleLoadedNode(noteListState, loadedNote);

  // TODO: check properly
  expect(newNoteListState.renderingQueue.length).toEqual(5);
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
    renderingQueue: [
      createNotLoadedNote(0, "file1.txt"),
      convertToLoadedNote(createNotLoadedNote(1, "file2.txt"), "text"),
      createNotLoadedNote(2, "file3.txt"),
      createNotLoadedNote(3, "file4.txt"),
      createNotLoadedNote(4, "file5.txt"),
    ],
    notes: [],
  };

  const loadedNote = convertToLoadedNote(
    createNotLoadedNote(0, "file1.txt"),
    "text"
  );
  const newNoteListState = handleLoadedNode(noteListState, loadedNote);

  // TODO: check properly
  expect(newNoteListState.renderingQueue.length).toEqual(3);
  expect(newNoteListState.notes.length).toEqual(2);
});

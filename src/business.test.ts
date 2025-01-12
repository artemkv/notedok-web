import { test, expect } from "@jest/globals";
import { NoteListState, NoteListFileListRetrieved } from "./model";
import {
  convertToNoteLoaded,
  createNoteNotLoaded,
  handleLoadedNode,
  shiftNotesToLoadForNextPage,
} from "./business";

test("Test all notes are shifted to load when less notes than a default page size", () => {
  const noteListState: NoteListFileListRetrieved = {
    state: NoteListState.FileListRetrieved,
    fileListVersion: 0,
    unprocessedFiles: ["file1.txt", "file2.txt", "file3.txt"],
    lastUsedNoteId: 0,
    renderingQueue: [],
    notes: [],
  };

  const [newNoteListState, notesToLoad] =
    shiftNotesToLoadForNextPage(noteListState);

  // TODO: check properly
  expect(newNoteListState.unprocessedFiles.length).toEqual(0);
  expect(notesToLoad.length).toEqual(3);
});

test("First 5 notes are shifted to load when more notes than a default page size", () => {
  const noteListState: NoteListFileListRetrieved = {
    state: NoteListState.FileListRetrieved,
    fileListVersion: 0,
    unprocessedFiles: [
      "file1.txt",
      "file2.txt",
      "file3.txt",
      "file4.txt",
      "file5.txt",
      "file6.txt",
      "file7.txt",
    ],
    lastUsedNoteId: 0,
    renderingQueue: [],
    notes: [],
  };

  const [newNoteListState, notesToLoad] =
    shiftNotesToLoadForNextPage(noteListState);

  // TODO: check properly
  expect(newNoteListState.unprocessedFiles.length).toEqual(2);
  expect(notesToLoad.length).toEqual(5);
});

test("First note loaded first", () => {
  const noteListState: NoteListFileListRetrieved = {
    state: NoteListState.FileListRetrieved,
    fileListVersion: 0,
    unprocessedFiles: ["file6.txt", "file7.txt"],
    lastUsedNoteId: 4,
    renderingQueue: [
      createNoteNotLoaded(0, "file1.txt"),
      createNoteNotLoaded(1, "file2.txt"),
      createNoteNotLoaded(2, "file3.txt"),
      createNoteNotLoaded(3, "file4.txt"),
      createNoteNotLoaded(4, "file5.txt"),
    ],
    notes: [],
  };

  const NoteLoaded = convertToNoteLoaded(
    createNoteNotLoaded(0, "file1.txt"),
    "text"
  );
  const newNoteListState = handleLoadedNode(noteListState, NoteLoaded);

  // TODO: check properly
  expect(newNoteListState.renderingQueue.length).toEqual(4);
  expect(newNoteListState.notes.length).toEqual(1);
});

test("Second note loaded first", () => {
  const noteListState: NoteListFileListRetrieved = {
    state: NoteListState.FileListRetrieved,
    fileListVersion: 0,
    unprocessedFiles: ["file6.txt", "file7.txt"],
    lastUsedNoteId: 4,
    renderingQueue: [
      createNoteNotLoaded(0, "file1.txt"),
      createNoteNotLoaded(1, "file2.txt"),
      createNoteNotLoaded(2, "file3.txt"),
      createNoteNotLoaded(3, "file4.txt"),
      createNoteNotLoaded(4, "file5.txt"),
    ],
    notes: [],
  };

  const NoteLoaded = convertToNoteLoaded(
    createNoteNotLoaded(1, "file2.txt"),
    "text"
  );
  const newNoteListState = handleLoadedNode(noteListState, NoteLoaded);

  // TODO: check properly
  expect(newNoteListState.renderingQueue.length).toEqual(5);
  expect(newNoteListState.notes.length).toEqual(0);
});

test("First note loads after second note", () => {
  const noteListState: NoteListFileListRetrieved = {
    state: NoteListState.FileListRetrieved,
    fileListVersion: 0,
    unprocessedFiles: ["file6.txt", "file7.txt"],
    lastUsedNoteId: 4,
    renderingQueue: [
      createNoteNotLoaded(0, "file1.txt"),
      convertToNoteLoaded(createNoteNotLoaded(1, "file2.txt"), "text"),
      createNoteNotLoaded(2, "file3.txt"),
      createNoteNotLoaded(3, "file4.txt"),
      createNoteNotLoaded(4, "file5.txt"),
    ],
    notes: [],
  };

  const NoteLoaded = convertToNoteLoaded(
    createNoteNotLoaded(0, "file1.txt"),
    "text"
  );
  const newNoteListState = handleLoadedNode(noteListState, NoteLoaded);

  // TODO: check properly
  expect(newNoteListState.renderingQueue.length).toEqual(3);
  expect(newNoteListState.notes.length).toEqual(2);
});

import { getTitleFromPath } from "./conversion";
import {
  NoteCreatingFromText,
  NoteCreatingFromTitle,
  NoteDeleted,
  NoteDeleting,
  NoteOutOfSync,
  NoteRef,
  NoteState,
  NoteSynced,
  NoteSyncing,
} from "./model";

// All the possible state transitions are found here

export const createNewNoteRef = (id: number, path: string): NoteRef => {
  return {
    state: NoteState.Ref,
    id: "note_" + id.toString(),
    path,
  };
};

export const createNewNoteFromTitle = (
  id: number,
  title: string
): NoteCreatingFromTitle => {
  return {
    state: NoteState.CreatingFromTitle,
    id: "note_" + id.toString(),
    title,
  };
};

export const createNewNoteFromText = (
  id: number,
  text: string
): NoteCreatingFromText => {
  return {
    state: NoteState.CreatingFromText,
    id: "note_" + id.toString(),
    text,
  };
};

export const noteRefToSynced = (note: NoteRef, text: string): NoteSynced => {
  return {
    state: NoteState.Synced,
    id: note.id,
    path: note.path,
    title: getTitleFromPath(note.path),
    text,
  };
};

export const noteRefToOutOfSync = (
  note: NoteRef,
  err: string
): NoteOutOfSync => {
  return {
    state: NoteState.OutOfSync,
    id: note.id,
    path: note.path,
    title: getTitleFromPath(note.path),
    text: "",
    err,
  };
};

export const noteSyncedToSyncing = (note: NoteSynced): NoteSyncing => {
  return {
    state: NoteState.Syncing,
    id: note.id,
    path: note.path,
    title: note.title,
    text: note.text,
  };
};

export const noteSyncedToDeleting = (note: NoteSynced): NoteDeleting => {
  return {
    state: NoteState.Deleting,
    id: note.id,
    path: note.path,
    title: note.title,
    text: note.text,
  };
};

export const noteDeletingToDeleted = (note: NoteDeleting): NoteDeleted => {
  return {
    state: NoteState.Deleted,
    id: note.id,
    path: note.path,
    title: note.title,
    text: note.text,
  };
};

export const noteSyncingToSynced = (note: NoteSyncing): NoteSynced => {
  return {
    state: NoteState.Synced,
    id: note.id,
    path: note.path,
    title: note.title,
    text: note.text,
  };
};

export const noteSyncingToSyncedWithNewPath = (
  note: NoteSyncing,
  newPath: string
): NoteSynced => {
  return {
    state: NoteState.Synced,
    id: note.id,
    path: newPath,
    title: note.title,
    text: note.text,
  };
};

export const noteSyncingToOutOfSync = (
  note: NoteSyncing,
  err: string
): NoteOutOfSync => {
  return {
    state: NoteState.OutOfSync,
    id: note.id,
    path: note.path,
    title: note.title,
    text: note.text,
    err,
  };
};

export const noteOutOfSyncToSyncing = (note: NoteOutOfSync): NoteSyncing => {
  return {
    state: NoteState.Syncing,
    id: note.id,
    path: note.path,
    title: note.title,
    text: note.text,
  };
};

export const noteOutOfSyncToDeleting = (note: NoteOutOfSync): NoteDeleting => {
  return {
    state: NoteState.Deleting,
    id: note.id,
    path: note.path,
    title: note.title,
    text: note.text,
  };
};

export const noteDeletedToSyncing = (note: NoteDeleted): NoteSyncing => {
  return {
    state: NoteState.Syncing,
    id: note.id,
    path: note.path,
    title: note.title,
    text: note.text,
  };
};

export const noteCreatingFromTitleToSynced = (
  note: NoteCreatingFromTitle,
  path: string
): NoteSynced => {
  return {
    state: NoteState.Synced,
    id: note.id,
    path,
    title: note.title,
    text: "",
  };
};

export const noteCreatingFromTextToSynced = (
  note: NoteCreatingFromText,
  path: string
): NoteSynced => {
  return {
    state: NoteState.Synced,
    id: note.id,
    path,
    title: "",
    text: note.text,
  };
};

export const noteCreatingFromTitleToOutOfSync = (
  note: NoteCreatingFromTitle,
  path: string,
  err: string
): NoteOutOfSync => {
  return {
    state: NoteState.OutOfSync,
    id: note.id,
    path,
    title: note.title,
    text: "",
    err,
  };
};

export const noteCreatingFromTextToOutOfSync = (
  note: NoteCreatingFromText,
  path: string,
  err: string
): NoteOutOfSync => {
  return {
    state: NoteState.OutOfSync,
    id: note.id,
    path,
    title: "",
    text: note.text,
    err,
  };
};

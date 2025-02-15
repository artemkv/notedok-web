import { getTitleFromPath } from "./conversion";
import {
  NoteCreatingFromText,
  NoteCreatingFromTitle,
  NoteDeleted,
  NoteDeleting,
  NoteOutOfSync,
  NoteRef,
  NoteRenaming,
  NoteRestoring,
  NoteSavingText,
  NoteState,
  NoteSynced,
} from "./model";

// State diagram, arrows
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

export const noteSyncedToRenaming = (note: NoteSynced): NoteRenaming => {
  return {
    state: NoteState.Renaming,
    id: note.id,
    path: note.path,
    title: note.title,
    text: note.text,
  };
};

export const noteSyncedToSavingText = (note: NoteSynced): NoteSavingText => {
  return {
    state: NoteState.SavingText,
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

// TODO: this flow is missing, the storage simply reports API errors
export const noteDeletingToOutOfSync = (
  note: NoteDeleting,
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

export const noteRenamingToSyncedWithNewPath = (
  note: NoteRenaming,
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

export const noteRenamingToOutOfSync = (
  note: NoteRenaming,
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

export const noteSavingTextToSynced = (note: NoteSavingText): NoteSynced => {
  return {
    state: NoteState.Synced,
    id: note.id,
    path: note.path,
    title: note.title,
    text: note.text,
  };
};

export const noteSavingTextToOutOfSync = (
  note: NoteSavingText,
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

export const noteOutOfSyncToRenaming = (note: NoteOutOfSync): NoteRenaming => {
  return {
    state: NoteState.Renaming,
    id: note.id,
    path: note.path,
    title: note.title,
    text: note.text,
  };
};

export const noteOutOfSyncToSavingText = (
  note: NoteOutOfSync
): NoteSavingText => {
  return {
    state: NoteState.SavingText,
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

export const noteDeletedToRestoring = (note: NoteDeleted): NoteRestoring => {
  return {
    state: NoteState.Restoring,
    id: note.id,
    path: note.path,
    title: note.title,
    text: note.text,
  };
};

export const noteRestoringToSynced = (note: NoteRestoring): NoteSynced => {
  return {
    state: NoteState.Synced,
    id: note.id,
    path: note.path,
    title: note.title,
    text: note.text,
  };
};

export const noteRestoringToSyncedWithNewPath = (
  note: NoteRestoring,
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

export const noteRestoringToOutOfSync = (
  note: NoteRestoring,
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

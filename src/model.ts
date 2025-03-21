// note

import { isMarkdownFile } from "./conversion";

// State diagram, boxes

// Design approach: retain information by using specific states
// (e.g. 'Renaming' and 'SavingText' instead of simply 'Syncing')
// This prevents impossible transitions and allows for more specific UI feedback
// The history collapses as we arrive at the "happy" state (i.e. Synced)
// Another point the history collapses is the "unhappy" state (i.e. OutOfSync)
// This is by choice and not necessary universally correct decision,
// as it could actually be useful to remember what exactly failed.
// But the state transition diagram would grow more complex, so I decided
// not to invest into unhappy flow too much, by treating all the note-specific errors equally.
// The unhappy state may still have memory if we add retry mechanism.
export enum NoteState {
  // Invisible, needs to be retrieved from storage
  Ref, // -> Synced, OutOfSync

  // Fully aligned with the storage. Can be edited, renamed or deleted
  // Here we forget the previous history
  Synced, // -> Renaming, SavingText, Deleting

  // The title has been updated and note is being renamed
  // Cannot edit, rename or delete
  Renaming, // -> Synced | OutOfSync

  // The text has been updated and saving back to storage
  // Cannot edit, rename or delete
  SavingText, // -> Synced | OutOfSync

  // Has failed the sync attempt, and is not anymore aligned with storage
  // Can be edited, renamed or deleted, to allow the user to solve the issue
  // Another point where we forget history,
  //    although we could indirectly remember the last state,
  //    if we add retry mechanism and keep the last failed command
  OutOfSync, // -> Renaming, SavingText, Deleting

  // Was deleted in UI, and is pending deletion in the storage
  // Cannot edit, rename or delete
  Deleting, // -> Deleted, OutOfSync

  // Completely deleted from storage
  // Cannot edit or rename, only restore
  Deleted, // -> Restoring

  // Only exist in UI, being saved back to storage
  Restoring, // -> Synced | OutOfSync

  // Was created in UI from the template note by editing title,
  // currently pending creation in the storage
  // Text is immediately editable, but cannot rename or delete until is synced
  CreatingFromTitle, // -> Synced, OutOfSync

  // Was created in UI from the template note by editing text,
  // currently pending creation in the storage
  // Cannot edit, rename or delete
  CreatingFromText, // -> Synced, OutOfSync
}

// Id is purely UI-level, only unique within a single page reload
// Path is always original path that the note is stored on the server

export interface NoteRef {
  state: NoteState.Ref;

  id: string;
  path: string;
}

export interface NoteSynced {
  state: NoteState.Synced;

  id: string;
  path: string;
  title: string;
  text: string;
}

export interface NoteRenaming {
  state: NoteState.Renaming;

  id: string;
  path: string;
  title: string;
  text: string;
}

export interface NoteSavingText {
  state: NoteState.SavingText;

  id: string;
  path: string;
  title: string;
  text: string;
}

export interface NoteOutOfSync {
  state: NoteState.OutOfSync;

  id: string;
  path: string;
  title: string;
  text: string;

  err: string; // Here would could allow retrying the failed action
}

export interface NoteDeleting {
  state: NoteState.Deleting;

  id: string;
  path: string;
  title: string;
  text: string;
}

export interface NoteDeleted {
  state: NoteState.Deleted;

  id: string;
  path: string;
  title: string;
  text: string;
}

export interface NoteRestoring {
  state: NoteState.Restoring;

  id: string;
  path: string;
  title: string;
  text: string;
}

export interface NoteCreatingFromTitle {
  state: NoteState.CreatingFromTitle;

  id: string;
  title: string;
}

export interface NoteCreatingFromText {
  state: NoteState.CreatingFromText;

  id: string;
  text: string;
}

export type NoteInvisible = NoteRef;

export type NoteVisible =
  | NoteSynced
  | NoteRenaming
  | NoteSavingText
  | NoteOutOfSync
  | NoteDeleting
  | NoteDeleted
  | NoteRestoring
  | NoteCreatingFromTitle
  | NoteCreatingFromText;

export const isVisible = (note: Note) => {
  return note.state !== NoteState.Ref;
};

export type Note = NoteInvisible | NoteVisible;

export type NoteTextEditable =
  | NoteSynced
  | NoteOutOfSync
  | NoteCreatingFromTitle;

export const isTextEditable = (note: Note) => {
  return (
    note.state === NoteState.Synced ||
    note.state === NoteState.OutOfSync ||
    note.state === NoteState.CreatingFromTitle
  );
};

export type NoteTitleEditable = NoteSynced | NoteOutOfSync;

export const isTitleEditable = (note: Note) => {
  return note.state === NoteState.Synced || note.state === NoteState.OutOfSync;
};

export type NoteTextSaveable = NoteSynced | NoteOutOfSync;

export const isTextSaveable = (note: Note) => {
  return note.state === NoteState.Synced || note.state === NoteState.OutOfSync;
};

export type NoteTitleSaveable = NoteSynced | NoteOutOfSync;

export const isTitleSaveable = (note: Note) => {
  return note.state === NoteState.Synced || note.state === NoteState.OutOfSync;
};

export type NoteDeletable = NoteSynced | NoteOutOfSync;

export const isDeletable = (note: Note) => {
  return note.state === NoteState.Synced || note.state === NoteState.OutOfSync;
};

// Basically, there are 2 "special" notes, from the point of view of UI: template note and deleted note
export type NoteRegular =
  | NoteSynced
  | NoteRenaming
  | NoteSavingText
  | NoteRestoring
  | NoteOutOfSync
  | NoteCreatingFromTitle
  | NoteCreatingFromText;

export const isMarkdownFormat = (note: Note) => {
  if (
    note.state === NoteState.CreatingFromTitle ||
    note.state === NoteState.CreatingFromText
  ) {
    return true;
  }

  return (
    (note.state === NoteState.Synced ||
      note.state === NoteState.Renaming ||
      note.state === NoteState.SavingText ||
      note.state === NoteState.Restoring ||
      note.state === NoteState.OutOfSync) &&
    isMarkdownFile(note.path)
  );
};

// note text editor

export enum NoteTextEditorState {
  NotActive,
  EditingTemplateNote,
  EditingRegularNote,
}

export interface NoteTextEditorNotActive {
  state: NoteTextEditorState.NotActive;
}

export interface NoteTextEditorEditingTemplateNote {
  state: NoteTextEditorState.EditingTemplateNote;
  text: string;
}

export interface NoteTextEditorEditingRegularNote {
  state: NoteTextEditorState.EditingRegularNote;
  note: NoteTextEditable;
  text: string;
}

export type NoteTextEditor =
  | NoteTextEditorNotActive
  | NoteTextEditorEditingTemplateNote
  | NoteTextEditorEditingRegularNote;

export enum ModifiedState {
  OriginalValue,
  ModifiedValue,
}

export interface NotModified {
  state: ModifiedState.OriginalValue;
}

export interface Modified {
  state: ModifiedState.ModifiedValue;
  newValue: string;
}

export type EditableText = NotModified | Modified;

// autocomplete

export enum SearchAutoSuggestState {
  NotComputed,
  Computed,
}

export interface SearchAutoSuggestNotComputed {
  state: SearchAutoSuggestState.NotComputed;
}

export interface SearchAutoSuggestComputed {
  state: SearchAutoSuggestState.Computed;
  items: AutoSuggestItem[];
  hashTags: AutoSuggestHashTag[];
}

export type SearchAutoSuggest =
  | SearchAutoSuggestNotComputed
  | SearchAutoSuggestComputed;

export type AutoSuggestItem = {
  value: string;
  data: {
    g: string;
  };
};

export type AutoSuggestHashTag = {
  value: string;
  data: string;
};

// note title editor

export enum NoteTitleEditorState {
  NotActive,
  EditingTemplateNote,
  EditingRegularNote,
}

export interface NoteTitleEditorNotActive {
  state: NoteTitleEditorState.NotActive;
}

export interface NoteTitleEditorEditingTemplateNote {
  state: NoteTitleEditorState.EditingTemplateNote;
  text: string;
}

export interface NoteTitleEditorEditingRegularNote {
  state: NoteTitleEditorState.EditingRegularNote;
  note: NoteTitleEditable;
  text: string;
}

export type NoteTitleEditor =
  | NoteTitleEditorNotActive
  | NoteTitleEditorEditingTemplateNote
  | NoteTitleEditorEditingRegularNote;

// note list

export enum NoteListState {
  RetrievingFileList,
  FileListRetrieved,
}

export interface NoteListRetrievingFileList {
  state: NoteListState.RetrievingFileList;
  fileListVersion: number;
}

export interface NoteListFileListRetrieved {
  state: NoteListState.FileListRetrieved;
  fileListVersion: number; // Ensures async note loading is done for the list they were retrieved in
  unprocessedFiles: string[]; // We don't load notes until they need to made visible
  lastUsedNoteId: number; // Note ids are only unique within the same fileListVersion
  renderingQueue: Note[]; // This ensures notes are displayed in order, even if loaded out of order
  notes: NoteVisible[]; // These are all currently visible notes
}

export type NoteList = NoteListRetrievingFileList | NoteListFileListRetrieved;

// App state

export enum AuthenticationStatus {
  Unauthenticated,
  Authenticated,
}

export interface AppStateUnauthenticated {
  auth: AuthenticationStatus.Unauthenticated;
}

export interface AppStateAuthenticated {
  auth: AuthenticationStatus.Authenticated;
  searchAutoSuggest: SearchAutoSuggest;
  // It is possible to start editing template note even before we load all the notes
  noteTitleEditor: NoteTitleEditor;
  noteTextEditor: NoteTextEditor;
  noteList: NoteList;
}

export type AppState = AppStateUnauthenticated | AppStateAuthenticated;

// Initial state

export const IntialState: AppState = {
  auth: AuthenticationStatus.Unauthenticated,
};

import { RetrieveFileList } from "./commands/storage";

// note

// TODO: look for those: NoteNotLoaded, Loaded

export enum NoteState {
  // Invisible, needs to get synced
  Ref, // -> Synced
  // Can be edited, renamed or deleted
  Synced, // -> Syncing, Deleted
  // Cannot edit, rename or delete (TODO: gray out controls, do not remove)
  Syncing, // -> Synced | OutOfSync
  // Can be edited, renamed or deleted (TODO: make sure everything is restored as before, to allow re-do the operation)
  // TODO: show error next to the note
  OutOfSync, // -> Syncing, Deleted
  // Cannot edit or rename, only restore (actual delete happens in background)
  // TODO: cannot restore until delete completes, so probably I do need to queue the API calls
  Deleted, // -> Syncing
  // Allows editing text immediately after creating a new note from title, but not renaming or deleting
  // TODO: make sure cannot save the edits until created successfully
  // TODO: maybe by blocking save, maybe by queuing the API call
  CreatingFromTitle, // -> Synced, OutOfSync
  // Cannot edit, rename or delete (TODO: gray out controls, do not remove)
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

export interface NoteSyncing {
  state: NoteState.Syncing;

  id: string;
  path: string;
  title: string;
  text: string;
}

export interface NoteOutOfSync {
  state: NoteState.OutOfSync;

  id: string;
  path: string; // TODO: make sure failed creation actually reports the path
  title: string; // TODO: make sure that after unsuccessful rename, the next rename will use the old path
  text: string;

  err: string;
}

export interface NoteDeleted {
  state: NoteState.Deleted;

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

export type NoteFull =
  | NoteSynced
  | NoteSyncing
  | NoteOutOfSync
  | NoteDeleted
  | NoteCreatingFromTitle
  | NoteCreatingFromText;

export const isFullNote = (note: Note) => {
  return note.state !== NoteState.Ref;
};

export type Note = NoteRef | NoteFull;

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

export type NotePendingPathUpdate =
  | NoteSyncing
  | NoteCreatingFromTitle
  | NoteCreatingFromText;

export type NoteRegular =
  | NoteSynced
  | NoteSyncing
  | NoteOutOfSync
  | NoteCreatingFromTitle
  | NoteCreatingFromText;

// TODO: ----------------------------------------------------------------------------

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
  notes: NoteFull[]; // These are all currently visible notes
}

export type NoteList = NoteListRetrievingFileList | NoteListFileListRetrieved;

// App state

// TODO: having editors at this level allows editing before the notes are loaded, check that this is possible
export interface AppState {
  // It is possible to start editing template note even before we load all the notes
  noteTextEditor: NoteTextEditor;
  noteTitleEditor: NoteTitleEditor;
  noteList: NoteList;
}

// Initial state

const INITIAL_FILE_LIST_VERSION = 0;

export const IntialState: AppState = {
  noteTextEditor: {
    state: NoteTextEditorState.NotActive,
  },
  noteTitleEditor: {
    state: NoteTitleEditorState.NotActive,
  },
  noteList: {
    state: NoteListState.RetrievingFileList,
    fileListVersion: INITIAL_FILE_LIST_VERSION,
  },
};

// Initial command - here to avoid circular refs
export const InitialCommand = RetrieveFileList(INITIAL_FILE_LIST_VERSION);

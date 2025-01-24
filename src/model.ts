import { RetrieveFileList } from "./commands/storage";

// note

export enum NoteType {
  NotLoaded,
  Loaded,
}

export interface NoteNotLoaded {
  type: NoteType.NotLoaded;
  id: string;
  path: string;
}

// TODO: could make it not editable while saving, so that is only editable again once we know the new path
// TODO: and this could actually be combined with indicator on a note (saving, error upon saving etc.)
export interface NoteLoaded {
  type: NoteType.Loaded;
  id: string;
  path: string;
  title: string;
  text: string;
}

export type Note = NoteNotLoaded | NoteLoaded;

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
  note: NoteLoaded;
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
  note: NoteLoaded;
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
}

export interface NoteListFileListRetrieved {
  state: NoteListState.FileListRetrieved;
  fileListVersion: number;
  unprocessedFiles: Array<string>;
  lastUsedNoteId: number;
  renderingQueue: Array<Note>;
  notes: Array<NoteLoaded>;
}

export type NoteList = NoteListRetrievingFileList | NoteListFileListRetrieved;

// App state

// TODO: having editors at this level allows editing before the notes are loaded, check that this is possible
export interface AppState {
  noteTextEditor: NoteTextEditor;
  noteTitleEditor: NoteTitleEditor;
  noteList: NoteList;
}

// Initial state

export const IntialState: AppState = {
  noteTextEditor: {
    state: NoteTextEditorState.NotActive,
  },
  noteTitleEditor: {
    state: NoteTitleEditorState.NotActive,
  },
  noteList: {
    state: NoteListState.RetrievingFileList,
  },
};

// Initial command - here to avoid circular refs
export const InitialCommand = RetrieveFileList;

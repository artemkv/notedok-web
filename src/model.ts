import { RetrieveFileList } from "./commands/storage";

export enum NoteType {
  NotLoaded,
  Loaded,
}

export interface NoteNotLoaded {
  type: NoteType.NotLoaded;
  id: string;
  path: string;
  title: string;
}

export interface NoteLoaded {
  type: NoteType.Loaded;
  id: string;
  path: string;
  title: string;
  text: string;
}

export type Note = NoteNotLoaded | NoteLoaded;

export enum NoteEditorState {
  NotActive,
  EditingTemplateNote,
  EditingRegularNote,
}

export interface NoteEditorNotActive {
  state: NoteEditorState.NotActive;
}

export interface NoteEditorEditingTemplateNote {
  state: NoteEditorState.EditingTemplateNote;
  text: string;
}

export interface NoteEditorEditingRegularNote {
  state: NoteEditorState.EditingRegularNote;
  note: NoteLoaded;
  text: string;
}

export type NoteEditor =
  | NoteEditorNotActive
  | NoteEditorEditingTemplateNote
  | NoteEditorEditingRegularNote;

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

export interface AppState {
  noteList: NoteList;
  noteEditor: NoteEditor;
}

export const IntialState: AppState = {
  noteList: {
    state: NoteListState.RetrievingFileList,
  },
  noteEditor: {
    state: NoteEditorState.NotActive,
  },
};

export const InitialCommand = RetrieveFileList;

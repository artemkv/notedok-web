import { RetrieveFileList } from "./commands/storage";

export enum NoteType {
  NotLoaded,
  Loaded,
}

export interface NotLoadedNote {
  type: NoteType.NotLoaded;
  id: string;
  path: string;
  title: string;
}

export interface LoadedNote {
  type: NoteType.Loaded;
  id: string;
  path: string;
  title: string;
  text: string;
}

export type Note = NotLoadedNote | LoadedNote;

export enum TemplateNoteState {
  Initial,
  EditingText,
}

export enum NoteListState {
  RetrievingFileList,
  FileListRetrieved,
}

export interface NoteListStateRetrievingFileList {
  state: NoteListState.RetrievingFileList;
}

export interface NoteListStateFileListRetrieved {
  state: NoteListState.FileListRetrieved;
  unprocessedFiles: {
    fileList: Array<string>;
    fileListVersion: number;
  };
  lastUsedNoteId: number;
  renderingQueue: Array<Note>;
  notes: Array<LoadedNote>;
}

export type NoteList =
  | NoteListStateRetrievingFileList
  | NoteListStateFileListRetrieved;

export interface AppState {
  templateNoteState: TemplateNoteState;
  noteList: NoteList;
}

export const IntialState: AppState = {
  templateNoteState: TemplateNoteState.Initial,
  noteList: {
    state: NoteListState.RetrievingFileList,
  },
};

export const InitialCommand = RetrieveFileList;

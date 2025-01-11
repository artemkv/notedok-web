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

export enum TemplateNoteState {
  Initial,
  EditingText,
}

export enum NoteListState {
  RetrievingFileList,
  FileListRetrieved,
}

export interface NoteListRetrievingFileList {
  state: NoteListState.RetrievingFileList;
}

export interface NoteListFileListRetrieved {
  state: NoteListState.FileListRetrieved;
  unprocessedFiles: {
    fileList: Array<string>;
    fileListVersion: number;
  };
  lastUsedNoteId: number;
  renderingQueue: Array<Note>;
  notes: Array<NoteLoaded>;
}

export type NoteList = NoteListRetrievingFileList | NoteListFileListRetrieved;

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

import { RetrieveFileList } from "./commands/storage";

export interface Note {
  id: string;
  path: string;
  title: string;
  text: string;
}

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
  renderingQueue: {
    queue: Array<Note>;
    readyNoteIds: Set<string>;
  };
  notes: Array<Note>;
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

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
  NotLoaded,
  Loaded,
}

export interface NoteListNotLoaded {
  state: NoteListState.NotLoaded;
}

export interface NoteListLoaded {
  state: NoteListState.Loaded;
  notes: Array<Note>;
}

export type NoteList = NoteListNotLoaded | NoteListLoaded;

export interface AppState {
  templateNoteState: TemplateNoteState;
  noteList: NoteList;
}

export const IntialState: AppState = {
  templateNoteState: TemplateNoteState.Initial,
  noteList: {
    state: NoteListState.NotLoaded,
  },
};

export const InitialCommand = RetrieveFileList;

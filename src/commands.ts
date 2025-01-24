import { AppEvent } from "./events";
import { Command } from "./hooks/useReducer";
import { NoteLoaded, NoteNotLoaded } from "./model";

export enum CommandType {
  DoNothing,
  RetrieveFileList,
  LoadNextPage,
  RenameNote,
  SaveNoteText,
  CreateNewNoteWithTitle,
  CreateNewNoteWithText,
}

export interface DoNothingCommand extends Command<AppEvent> {
  type: CommandType.DoNothing;
}

export interface RetrieveFileListCommand extends Command<AppEvent> {
  type: CommandType.RetrieveFileList;
}

export interface LoadNotesContentCommand extends Command<AppEvent> {
  type: CommandType.LoadNextPage;
  notes: Array<NoteNotLoaded>;
}

export interface RenameNoteCommand extends Command<AppEvent> {
  type: CommandType.RenameNote;
  note: NoteLoaded;
}

export interface SaveNoteTextCommand extends Command<AppEvent> {
  type: CommandType.SaveNoteText;
  note: NoteLoaded;
}

export interface CreateNewNoteWithTitleCommand extends Command<AppEvent> {
  type: CommandType.CreateNewNoteWithTitle;
  note: NoteLoaded;
}

export interface CreateNewNoteWithTextCommand extends Command<AppEvent> {
  type: CommandType.CreateNewNoteWithText;
  note: NoteLoaded;
}

export type AppCommand =
  | DoNothingCommand
  | RetrieveFileListCommand
  | LoadNotesContentCommand
  | RenameNoteCommand
  | SaveNoteTextCommand
  | CreateNewNoteWithTitleCommand
  | CreateNewNoteWithTextCommand;

export const DoNothing: DoNothingCommand = {
  type: CommandType.DoNothing,
  execute: () => {},
};

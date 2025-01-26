import { AppEvent } from "./events";
import { Command } from "./hooks/useReducer";
import { NoteLoaded, NoteNotLoaded } from "./model";

export enum CommandType {
  DoNothing,
  RetrieveFileList,
  LoadNextPage,
  RenameNoteFromTitle,
  SaveNoteText,
  CreateNewNoteWithTitle,
  CreateNewNoteWithText,
  ReportError,
}

export interface DoNothingCommand extends Command<AppEvent> {
  type: CommandType.DoNothing;
}

export interface RetrieveFileListCommand extends Command<AppEvent> {
  type: CommandType.RetrieveFileList;
  fileListVersion: number;
}

export interface LoadNotesContentCommand extends Command<AppEvent> {
  type: CommandType.LoadNextPage;
  notes: Array<NoteNotLoaded>;
}

export interface RenameNoteFromTitleCommand extends Command<AppEvent> {
  type: CommandType.RenameNoteFromTitle;
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

export interface ReportErrorCommand extends Command<AppEvent> {
  type: CommandType.ReportError;
  err: unknown;
}

export type AppCommand =
  | DoNothingCommand
  | RetrieveFileListCommand
  | LoadNotesContentCommand
  | RenameNoteFromTitleCommand
  | SaveNoteTextCommand
  | CreateNewNoteWithTitleCommand
  | CreateNewNoteWithTextCommand
  | ReportErrorCommand;

export const DoNothing: DoNothingCommand = {
  type: CommandType.DoNothing,
  execute: () => {},
};

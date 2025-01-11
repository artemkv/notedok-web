import { AppEvent } from "./events";
import { Command } from "./hooks/useReducer";
import { NoteNotLoaded } from "./model";

export enum CommandType {
  DoNothing,
  RetrieveFileList,
  LoadNextPage,
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

export type AppCommand =
  | DoNothingCommand
  | RetrieveFileListCommand
  | LoadNotesContentCommand;

export const DoNothing: DoNothingCommand = {
  type: CommandType.DoNothing,
  execute: () => {},
};

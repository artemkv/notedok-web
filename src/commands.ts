import { AppEvent } from "./events";
import { Command } from "./hooks/useReducer";
import { Note } from "./state";

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

export interface LoadNextPageCommand extends Command<AppEvent> {
  type: CommandType.LoadNextPage;
  notes: Array<Note>;
}

export type AppCommand =
  | DoNothingCommand
  | RetrieveFileListCommand
  | LoadNextPageCommand;

export const DoNothing: DoNothingCommand = {
  type: CommandType.DoNothing,
  execute: () => {},
};

import { AppEvent } from "./events";
import { Command } from "./hooks/useReducer";

export enum CommandType {
  DoNothing,
  RetrieveFileList,
}

export interface DoNothingCommand extends Command<AppEvent> {
  type: CommandType.DoNothing;
}

export interface RetrieveFileListCommand extends Command<AppEvent> {
  type: CommandType.RetrieveFileList;
}

export type AppCommand = DoNothingCommand | RetrieveFileListCommand;

export const DoNothing: DoNothingCommand = {
  type: CommandType.DoNothing,
  execute: () => {},
};

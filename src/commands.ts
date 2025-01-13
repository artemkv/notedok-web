import { AppEvent } from "./events";
import { Command } from "./hooks/useReducer";
import { NoteLoaded, NoteNotLoaded } from "./model";

export enum CommandType {
  DoNothing,
  RetrieveFileList,
  LoadNextPage,
  SaveNoteText,
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

export interface SaveNoteTextCommand extends Command<AppEvent> {
  type: CommandType.SaveNoteText;
  note: NoteLoaded;
  newText: string;
}

export type AppCommand =
  | DoNothingCommand
  | RetrieveFileListCommand
  | LoadNotesContentCommand
  | SaveNoteTextCommand;

export const DoNothing: DoNothingCommand = {
  type: CommandType.DoNothing,
  execute: () => {},
};

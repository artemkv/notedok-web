import { AppEvent } from "./events";
import { Command } from "./hooks/useReducer";
import {
  NoteCreatingFromText,
  NoteCreatingFromTitle,
  NoteDeleted,
  NoteRef,
  NoteSyncing,
} from "./model";

export enum CommandType {
  DoNothing,
  DoMany,
  RetrieveFileList,
  LoadNotesText,
  RenameNoteFromTitle,
  SaveNoteText,
  CreateNewNoteWithTitle,
  CreateNewNoteWithText,
  DeleteNote,
  RestoreNote,
  ReportError,
}

// The note is first updated in UI, then all the I/O happens in background
// This is why all the commands have the note already in a "target" state
// They, however, need to allow UI to catch up with any inconsistencies (such as path change)

export interface DoNothingCommand extends Command<AppEvent> {
  type: CommandType.DoNothing;
}

export interface DoManyCommand extends Command<AppEvent> {
  type: CommandType.DoMany;
  commands: AppCommand[];
}

export interface RetrieveFileListCommand extends Command<AppEvent> {
  type: CommandType.RetrieveFileList;
  fileListVersion: number;
}

export interface LoadNotesTextCommand extends Command<AppEvent> {
  type: CommandType.LoadNotesText;
  notes: NoteRef[];
}

export interface RenameNoteFromTitleCommand extends Command<AppEvent> {
  type: CommandType.RenameNoteFromTitle;
  note: NoteSyncing;
}

export interface SaveNoteTextCommand extends Command<AppEvent> {
  type: CommandType.SaveNoteText;
  note: NoteSyncing;
}

export interface CreateNewNoteWithTitleCommand extends Command<AppEvent> {
  type: CommandType.CreateNewNoteWithTitle;
  note: NoteCreatingFromTitle;
}

export interface CreateNewNoteWithTextCommand extends Command<AppEvent> {
  type: CommandType.CreateNewNoteWithText;
  note: NoteCreatingFromText;
}

export interface DeleteNoteCommand extends Command<AppEvent> {
  type: CommandType.DeleteNote;
  note: NoteDeleted;
}

export interface RestoreNoteCommand extends Command<AppEvent> {
  type: CommandType.RestoreNote;
  note: NoteSyncing;
}

export interface ReportErrorCommand extends Command<AppEvent> {
  type: CommandType.ReportError;
  err: unknown;
}

export type AppCommand =
  | DoNothingCommand
  | DoManyCommand
  | RetrieveFileListCommand
  | LoadNotesTextCommand
  | RenameNoteFromTitleCommand
  | SaveNoteTextCommand
  | CreateNewNoteWithTitleCommand
  | CreateNewNoteWithTextCommand
  | DeleteNoteCommand
  | RestoreNoteCommand
  | ReportErrorCommand;

export const DoNothing: DoNothingCommand = {
  type: CommandType.DoNothing,
  execute: () => {},
};

export const DoMany = (commands: AppCommand[]): DoManyCommand => ({
  type: CommandType.DoMany,
  commands,
  execute: async (dispatch) => {
    commands.forEach((c) => c.execute(dispatch));
  },
});

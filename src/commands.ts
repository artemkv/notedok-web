import { AppEvent } from "./events";
import { Command } from "./hooks/useReducer";
import {
  NoteCreatingFromText,
  NoteCreatingFromTitle,
  NoteDeleting,
  NoteRef,
  NoteRenaming,
  NoteRestoring,
  NoteSavingText,
} from "./model";

export enum CommandType {
  DoNothing,
  DoMany,
  CreateUserSession,
  ScheduleIdTokenRefresh,
  RetrieveFileList,
  ComputeSearchAutoSuggestions,
  ExtractNewHashTags,
  LoadNoteText,
  RenameNote,
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

export interface CreateUserSessionCommand extends Command<AppEvent> {
  type: CommandType.CreateUserSession;
  idToken: string;
}

export interface ScheduleIdTokenRefreshCommand extends Command<AppEvent> {
  type: CommandType.ScheduleIdTokenRefresh;
}

export interface RetrieveFileListCommand extends Command<AppEvent> {
  type: CommandType.RetrieveFileList;
  searchString: string;
  fileListVersion: number;
}

export interface ComputeSearchAutoSuggestionsCommand extends Command<AppEvent> {
  type: CommandType.ComputeSearchAutoSuggestions;
  fileList: string[];
}

export interface ExtractNewHashTagsCommand extends Command<AppEvent> {
  type: CommandType.ExtractNewHashTags;
  title: string;
}

export interface LoadNoteTextCommand extends Command<AppEvent> {
  type: CommandType.LoadNoteText;
  notes: NoteRef[];
  fileListVersion: number;
}

export interface RenameNoteCommand extends Command<AppEvent> {
  type: CommandType.RenameNote;
  note: NoteRenaming;
}

export interface SaveNoteTextCommand extends Command<AppEvent> {
  type: CommandType.SaveNoteText;
  note: NoteSavingText;
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
  note: NoteDeleting;
}

export interface RestoreNoteCommand extends Command<AppEvent> {
  type: CommandType.RestoreNote;
  note: NoteRestoring;
}

export interface ReportErrorCommand extends Command<AppEvent> {
  type: CommandType.ReportError;
  err: unknown;
}

export type AppCommand =
  | DoNothingCommand
  | DoManyCommand
  | CreateUserSessionCommand
  | ScheduleIdTokenRefreshCommand
  | RetrieveFileListCommand
  | ComputeSearchAutoSuggestionsCommand
  | ExtractNewHashTagsCommand
  | LoadNoteTextCommand
  | RenameNoteCommand
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

// Initial command

export const InitialCommand = DoNothing;
